using FinanceManager.Domain.Database.Context;
using FinanceManager.Domain.Database.Models;
using FinanceManager.Domain.DTOs.Pots.Request;
using FinanceManager.Domain.DTOs.Pots.Responses;
using FinanceManager.Domain.DTOs.Shared;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Domain.Data.Services
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
                    AmountAllocated = $"£{p.AmountToAdd / 100.0:0.00}",
                    AmountLeft = $"£{p.PotAmountLeft / 100.0:0.00}",
                    AmountSpent = $"£{p.PotAmountSpent / 100.0:0.00}"
                })
                .ToArrayAsync();

            var savingsPots = await context.SavingsPots
                .Select(p => new SavingsPotData
                {
                    PotId = p.Id,
                    PotName = p.PotName,
                    AmountSaved = $"£{p.PotAmount / 100.0:0.00}",
                    AmountAddedThisMonth = $"£{p.AmountToAdd / 100.0:0.00}"
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
                    AmountToAdd = p.AmountToAdd / 100,
                    IsSavingsPot = false
                })
                .Union(context.SavingsPots
                    .Select(p => new ManagePotData
                    {
                        PotId = p.Id,
                        PotName = p.PotName,
                        AmountToAdd = p.AmountToAdd / 100,
                        IsSavingsPot = true
                    }))
                .ToArrayAsync();

            return new GetManagePotDataDto
            {
                Pots = pots
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
                    PotAmount = 0
                };

                await context.SpendingPots.AddAsync(pot);
                await context.SaveChangesAsync();

                return pot.Id;
            }
        }
    }
}
