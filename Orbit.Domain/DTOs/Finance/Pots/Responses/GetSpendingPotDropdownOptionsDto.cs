using Orbit.Domain.DTOs.Finance.Pots;

namespace Orbit.Domain.DTOs.Finance.Pots.Responses
{
    public class GetSpendingPotDropdownOptionsDto
    {
        public required PotDropdownValue[] PotOptions { get; set; }
    }
}
