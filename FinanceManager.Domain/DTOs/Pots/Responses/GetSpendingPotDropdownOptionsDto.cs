using FinanceManager.Domain.DTOs.Shared;

namespace FinanceManager.Domain.DTOs.Pots.Responses
{
    public class GetSpendingPotDropdownOptionsDto
    {
        public required PotDropdownValue[] PotOptions { get; set; }
    }
}
