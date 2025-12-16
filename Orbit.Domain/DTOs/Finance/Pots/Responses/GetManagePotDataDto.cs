namespace Orbit.Domain.DTOs.Finance.Pots.Responses
{
    public class GetManagePotDataDto
    {
        public required ManagePotData[] Pots { get; set; }
    }

    public class ManagePotData
    {
        public required int PotId { get; set; }
        public required string PotName { get; set; }
        public required decimal AmountToAdd { get; set; }
        public required bool IsSavingsPot { get; set; }
        public required bool RolloverByDefault { get; set; } = false;
    }
}
