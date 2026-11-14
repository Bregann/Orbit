using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Finance.Subscriptions;
using Orbit.Domain.Enums;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces.Api.Finance;
using Serilog;
using System.Data;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Finance
{
    public class SubscriptionService(AppDbContext context) : ISubscriptionService
    {
        public async Task<GetSubscriptionsDto> GetSubscriptions()
        {
            var subscriptions = await context.Subscriptions.Select(s => new SubscriptionItem
            {
                Id = s.Id,
                Name = s.SubscriptionName,
                Amount = s.SubscriptionAmount / 100m,
                MonthlyAmount = s.SubscriptionMonthlyAmount / 100m,
                BillingDay = s.BillingDay,
                BillingMonth = s.BillingMonth,
                BillingFrequency = s.BillingFrequency,
                NextBillingDate = CalculateNextBillingDate(s.BillingDay, s.BillingMonth, s.BillingFrequency)
            }).ToArrayAsync();

            return new GetSubscriptionsDto
            {
                Subscriptions = subscriptions
            };
        }

        public async Task AddSubscription(AddSubscriptionRequest request)
        {
            // check if subscription with the same name already exists
            var existingSubscription = await context.Subscriptions.AnyAsync(s => s.SubscriptionName == request.SubscriptionName);

            if (existingSubscription)
            {
                throw new BadRequestException("Subscription with the same name already exists.");
            }

            var subscription = new Subscription
            {
                SubscriptionName = request.SubscriptionName,
                SubscriptionAmount = request.SubscriptionAmount,
                BillingDay = request.BillingDay,
                BillingMonth = request.BillingMonth,
                BillingFrequency = request.BillingFrequency,
                SubscriptionMonthlyAmount = CalculateMonthlyAmount(request.SubscriptionAmount, request.BillingFrequency)
            };

            context.Subscriptions.Add(subscription);
            await context.SaveChangesAsync();

            Log.Information($"Added new subscription: {request.SubscriptionName}");
        }

        public async Task UpdateSubscription(UpdateSubscriptionRequest request)
        {
            var subscription = await context.Subscriptions.FindAsync(request.Id);

            if (subscription == null)
            {
                throw new NotFoundException("Subscription not found.");
            }

            subscription.SubscriptionName = request.SubscriptionName;
            subscription.SubscriptionAmount = request.SubscriptionAmount;
            subscription.BillingDay = request.BillingDay;
            subscription.BillingFrequency = request.BillingFrequency;
            subscription.BillingMonth = request.BillingFrequency == SubscriptionBillingFrequencyType.Yearly
                ? request.BillingMonth ?? subscription.BillingMonth ?? 1
                : null;
            subscription.SubscriptionMonthlyAmount = CalculateMonthlyAmount(request.SubscriptionAmount, request.BillingFrequency);

            await context.SaveChangesAsync();

            Log.Information($"Updated subscription: {request.SubscriptionName}");
        }

        public async Task DeleteSubscription(int id)
        {
            var rowsAffected = await context.Subscriptions.Where(s => s.Id == id)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                throw new NotFoundException("Subscription not found.");
            }

            Log.Information($"Deleted subscription with ID: {id}");
        }

        private static long CalculateMonthlyAmount(long amount, SubscriptionBillingFrequencyType billingFrequency)
        {
            return billingFrequency switch
            {
                SubscriptionBillingFrequencyType.Monthly => amount,
                SubscriptionBillingFrequencyType.Yearly => (long)Math.Ceiling(amount / 12.0m),
                _ => throw new ArgumentOutOfRangeException(nameof(billingFrequency))
            };
        }

                private static DateTime CalculateNextBillingDate(int billingDay, int? billingMonth, SubscriptionBillingFrequencyType billingFrequency)
        {
            var today = DateTime.UtcNow;

            if (billingFrequency == SubscriptionBillingFrequencyType.Monthly)
            {
                var nextBillingDate = new DateTime(today.Year, today.Month, billingDay);

                if (nextBillingDate < today)
                {
                    nextBillingDate = nextBillingDate.AddMonths(1);
                }

                return nextBillingDate;
            }
            else if (billingFrequency == SubscriptionBillingFrequencyType.Yearly)
            {
                if (!billingMonth.HasValue)
                {
                    throw new ArgumentException("Billing month must be provided for yearly subscriptions.");
                }

                var nextBillingDate = new DateTime(today.Year, billingMonth.Value, billingDay);

                if (nextBillingDate < today)
                {
                    nextBillingDate = nextBillingDate.AddYears(1);
                }

                return nextBillingDate;
            }
            else
            {
                throw new ArgumentOutOfRangeException(nameof(billingFrequency), "Invalid billing frequency type.");
            }
        }
    }
}
