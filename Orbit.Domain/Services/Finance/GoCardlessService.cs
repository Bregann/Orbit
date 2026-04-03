using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Finance.Banking;
using Orbit.Domain.Enums;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Helpers;
using Orbit.Domain.Interfaces.Api.Finance;
using Orbit.Domain.Interfaces.Helpers;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Finance
{
    public class GoCardlessService(
        IBankApiHelper bankApiHelper,
        IEnvironmentalSettingHelper environmentalSettingHelper,
        ICommsSenderClient commsSenderClient,
        AppDbContext context) : IGoCardlessService
    {
        private const int ExpiryWarningDays = 14;

        public async Task<GoCardlessConnectionStatusDto> GetConnectionStatus()
        {
            var connections = await context.GoCardlessBankConnections
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var connectionDtos = connections.Select(c => new GoCardlessBankConnectionDto
            {
                Id = c.Id,
                InstitutionId = c.InstitutionId,
                InstitutionName = c.InstitutionName,
                AccountId = c.AccountId,
                AccountName = c.AccountName,
                Status = c.ExpiresAt < DateTime.UtcNow ? "Expired" : c.Status,
                CreatedAt = c.CreatedAt,
                ExpiresAt = c.ExpiresAt,
                DaysUntilExpiry = Math.Max(0, (int)(c.ExpiresAt - DateTime.UtcNow).TotalDays),
                IsExpiringSoon = c.ExpiresAt < DateTime.UtcNow.AddDays(ExpiryWarningDays) && c.ExpiresAt > DateTime.UtcNow,
                LastSuccessfulSync = c.LastSuccessfulSync,
                LastSyncError = c.LastSyncError
            }).ToList();

            return new GoCardlessConnectionStatusDto
            {
                HasActiveConnections = connectionDtos.Any(c => c.Status == "Active" && c.DaysUntilExpiry > 0),
                Connections = connectionDtos
            };
        }

        public async Task<List<GoCardlessInstitution>?> GetInstitutions(string country)
        {
            var accessToken = await bankApiHelper.GetGoCardlessBankingDataAccessToken();

            if (accessToken == null)
            {
                Log.Error("[GoCardless] Failed to get access token for institutions list");
                throw new BadRequestException("Failed to authenticate with GoCardless");
            }

            return await bankApiHelper.GetGoCardlessInstitutions(accessToken, country);
        }

        public async Task<GoCardlessInitiateConnectionResponse> InitiateConnection(string institutionId)
        {
            Log.Information($"[GoCardless] Initiating connection for institution {institutionId}");

            var accessToken = await bankApiHelper.GetGoCardlessBankingDataAccessToken();

            if (accessToken == null)
            {
                throw new BadRequestException("Failed to authenticate with GoCardless");
            }

            // Create end user agreement (90 day access)
            var agreement = await bankApiHelper.CreateEndUserAgreement(accessToken, institutionId);

            if (agreement == null)
            {
                throw new BadRequestException("Failed to create bank access agreement");
            }

            // Get redirect URL from environmental settings
            var redirectUrl = environmentalSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.GoCardlessRedirectUri);

            // Create requisition
            var requisition = await bankApiHelper.CreateRequisition(accessToken, agreement.Id, institutionId, redirectUrl);

            if (requisition == null)
            {
                throw new BadRequestException("Failed to create bank connection request");
            }

            Log.Information($"[GoCardless] Created requisition {requisition.Id} for institution {institutionId}");

            return new GoCardlessInitiateConnectionResponse
            {
                AuthorizationUrl = requisition.Link,
                RequisitionId = requisition.Id
            };
        }

        public async Task CompleteConnection(string requisitionId)
        {
            Log.Information($"[GoCardless] Completing connection for requisition {requisitionId}");

            var accessToken = await bankApiHelper.GetGoCardlessBankingDataAccessToken();

            if (accessToken == null)
            {
                throw new BadRequestException("Failed to authenticate with GoCardless");
            }

            // Get the requisition status and accounts
            var requisition = await bankApiHelper.GetRequisition(accessToken, requisitionId);

            if (requisition == null)
            {
                throw new NotFoundException("Bank connection request not found");
            }

            if (requisition.Status != "LN")
            {
                Log.Warning($"[GoCardless] Requisition {requisitionId} is not linked. Status: {requisition.Status}");
                throw new BadRequestException($"Bank connection is not complete. Status: {requisition.Status}");
            }

            if (requisition.Accounts.Length == 0)
            {
                throw new BadRequestException("No bank accounts were linked");
            }

            // Remove any existing connections for this institution to avoid duplicates
            var existingConnections = await context.GoCardlessBankConnections
                .Where(c => c.InstitutionId == requisition.InstitutionId)
                .ToListAsync();

            if (existingConnections.Count > 0)
            {
                context.GoCardlessBankConnections.RemoveRange(existingConnections);
            }

            // Create a connection record for each linked account
            foreach (var accountId in requisition.Accounts)
            {
                var connection = new GoCardlessBankConnection
                {
                    RequisitionId = requisition.Id,
                    InstitutionId = requisition.InstitutionId,
                    InstitutionName = requisition.InstitutionId, // Will be updated with proper name
                    AccountId = accountId,
                    AgreementId = requisition.Agreement,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(90),
                    Status = "Active"
                };

                await context.GoCardlessBankConnections.AddAsync(connection);
            }

            await context.SaveChangesAsync();

            // Try to get institution name and update
            var institutions = await bankApiHelper.GetGoCardlessInstitutions(accessToken, "GB");
            var institution = institutions?.FirstOrDefault(i => i.Id == requisition.InstitutionId);

            if (institution != null)
            {
                var connections = await context.GoCardlessBankConnections
                    .Where(c => c.RequisitionId == requisition.Id)
                    .ToListAsync();

                foreach (var conn in connections)
                {
                    conn.InstitutionName = institution.Name;
                }

                await context.SaveChangesAsync();
            }

            Log.Information($"[GoCardless] Successfully completed connection for requisition {requisitionId}. {requisition.Accounts.Length} account(s) linked.");

            await commsSenderClient.SendPushNotification(
                "Bank Connected",
                $"Your bank account has been successfully connected. Access expires in 90 days.");
        }

        public async Task DisconnectBank(int connectionId)
        {
            var connection = await context.GoCardlessBankConnections.FindAsync(connectionId);

            if (connection == null)
            {
                throw new NotFoundException("Bank connection not found");
            }

            Log.Information($"[GoCardless] Disconnecting bank connection {connectionId} (requisition {connection.RequisitionId})");

            // Try to delete the requisition on GoCardless side
            var accessToken = await bankApiHelper.GetGoCardlessBankingDataAccessToken();
            if (accessToken != null)
            {
                await bankApiHelper.DeleteRequisition(accessToken, connection.RequisitionId);
            }

            // Remove all connections with the same requisition ID
            var relatedConnections = await context.GoCardlessBankConnections
                .Where(c => c.RequisitionId == connection.RequisitionId)
                .ToListAsync();

            context.GoCardlessBankConnections.RemoveRange(relatedConnections);
            await context.SaveChangesAsync();

            Log.Information($"[GoCardless] Disconnected bank connection {connectionId}");
        }

        public async Task CheckAndNotifyExpiringConnections()
        {
            Log.Information("[GoCardless] Checking for expiring connections");

            var connections = await context.GoCardlessBankConnections
                .Where(c => c.Status == "Active")
                .ToListAsync();

            foreach (var connection in connections)
            {
                var daysUntilExpiry = (connection.ExpiresAt - DateTime.UtcNow).TotalDays;

                if (daysUntilExpiry <= 0)
                {
                    connection.Status = "Expired";
                    await context.SaveChangesAsync();

                    await commsSenderClient.SendPushNotification(
                        "Bank Connection Expired",
                        $"Your connection to {connection.InstitutionName} has expired. Please reconnect to continue syncing transactions.");

                    Log.Warning($"[GoCardless] Connection {connection.Id} to {connection.InstitutionName} has expired");
                }
                else if (daysUntilExpiry <= 7)
                {
                    await commsSenderClient.SendPushNotification(
                        "Bank Connection Expiring Soon",
                        $"Your connection to {connection.InstitutionName} expires in {(int)daysUntilExpiry} day(s). Please reconnect to avoid interruption.");

                    Log.Information($"[GoCardless] Connection {connection.Id} to {connection.InstitutionName} expires in {(int)daysUntilExpiry} days");
                }
                else if (daysUntilExpiry <= ExpiryWarningDays)
                {
                    Log.Information($"[GoCardless] Connection {connection.Id} to {connection.InstitutionName} expires in {(int)daysUntilExpiry} days");
                }
            }

            Log.Information("[GoCardless] Finished checking expiring connections");
        }

        public async Task<List<string>> GetActiveAccountIds()
        {
            return await context.GoCardlessBankConnections
                .Where(c => c.Status == "Active" && c.ExpiresAt > DateTime.UtcNow)
                .Select(c => c.AccountId)
                .ToListAsync();
        }
    }
}
