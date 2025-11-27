using Orbit.Domain.DTOs.Shared;

namespace Orbit.Domain.DTOs.Pots.Responses
{
    public class GetSpendingPotDropdownOptionsDto
    {
        public required PotDropdownValue[] PotOptions { get; set; }
    }
}
