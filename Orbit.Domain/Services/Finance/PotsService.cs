using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Finance.Pots;
using Orbit.Domain.DTOs.Finance.Pots.Request;
using Orbit.Domain.DTOs.Finance.Pots.Responses;
using Orbit.Domain.Extensions;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Domain.Services.Finance
{
    public class PotsService(AppDbContext context) : IPotsService
    {
        public async Task<GetSpendingPotDropdownOptionsDto> GetSpendingPotDropdownOptions()
        {
            return new GetSpendingPotDropdownOptionsDto
            {
                PotOptions = await context.SpendingPots
                .Select(p => new PotDropdownValue
                {
                    PotId = p.Id,
                    PotName = p.PotName
                })
                .ToArrayAsync()
            };
        }

        public async Task<GetAllPotDataDto> GetAllPotData()
        {
            var spendingPots = await context.SpendingPots
                .Select(p => new SpendingPotData
                {
                    PotId = p.Id,
                    PotName = p.PotName,
                    AmountAllocated = p.AmountToAdd.ToPoundsString(),
                    AmountLeft = p.PotAmountLeft.ToPoundsString(),
                    AmountSpent = p.PotAmountSpent.ToPoundsString(),
                    RolloverByDefault = p.RolloverDefaultChecked
                })
                .ToArrayAsync();

            var savingsPots = await context.SavingsPots
                .Select(p => new SavingsPotData
                {
                    PotId = p.Id,
                    PotName = p.PotName,
                    AmountSaved = p.PotAmount.ToPoundsString(),
                    AmountAddedThisMonth = p.AmountToAdd.ToPoundsString()
                })
                .ToArrayAsync();

            return new GetAllPotDataDto
            {
                SpendingPots = spendingPots,
                SavingsPots = savingsPots
            };
        }

        public async Task<GetManagePotDataDto> GetManagePotData()
        {
            var pots = await context.SpendingPots
                .Select(p => new ManagePotData
                {
                    PotId = p.Id,
                    PotName = p.PotName,
                    AmountToAdd = p.AmountToAdd / 100m,
                    IsSavingsPot = false,
                    RolloverByDefault = p.RolloverDefaultChecked
                })
                .Union(context.SavingsPots
                    .Select(p => new ManagePotData
                    {
                        PotId = p.Id,
                        PotName = p.PotName,
                        AmountToAdd = p.AmountToAdd / 100m,
                        IsSavingsPot = true,
                        RolloverByDefault = false
                    }))
                .ToArrayAsync();

            return new GetManagePotDataDto
            {
                Pots = pots
            };
        }

        public async Task<GetAddMonthPotDataDto> GetAddMonthPotData()
        {
            var spendingPots = await context.SpendingPots
                .Select(p => new AddMonthSpendingPot
                {
                    PotId = p.Id,
                    PotName = p.PotName,
                    AmountToAdd = p.AmountToAdd / 100m,
                    RolloverAmount = p.PotAmountLeft.ToPoundsString(),
                    RolloverByDefault = p.RolloverDefaultChecked
                })
                .ToArrayAsync();

            var savingsPots = await context.SavingsPots
                .Select(p => new AddMonthSavingsPot
                {
                    PotId = p.Id,
                    PotName = p.PotName,
                    AmountToAdd = p.AmountToAdd / 100m
                })
                .ToArrayAsync();

            return new GetAddMonthPotDataDto
            {
                SpendingPots = spendingPots,
                SavingsPots = savingsPots
            };
        }

        public async Task<int> AddNewPot(AddNewPotRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PotName) || request.AmountToAdd <= 0)
            {
                throw new ArgumentException("Invalid pot name or amount.");
            }

            if (request.IsSavingsPot)
            {
                if (await context.SavingsPots.AnyAsync(p => p.PotName == request.PotName))
                {
                    throw new InvalidOperationException("A savings pot with this name already exists.");
                }

                var pot = new SavingsPot
                {
                    PotName = request.PotName,
                    AmountToAdd = (long)(request.AmountToAdd * 100),
                    PotAmount = 0
                };

                await context.SavingsPots.AddAsync(pot);
                await context.SaveChangesAsync();

                return pot.Id;
            }
            else
            {
                if (await context.SpendingPots.AnyAsync(p => p.PotName == request.PotName))
                {
                    throw new InvalidOperationException("A spending pot with this name already exists.");
                }

                var pot = new SpendingPot
                {
                    PotName = request.PotName,
                    AmountToAdd = (long)(request.AmountToAdd * 100),
                    PotAmountLeft = 0,
                    PotAmountSpent = 0,
                    RolloverDefaultChecked = request.RolloverByDefault
                };

                await context.SpendingPots.AddAsync(pot);
                await context.SaveChangesAsync();

                return pot.Id;
            }
        }
    }
}
