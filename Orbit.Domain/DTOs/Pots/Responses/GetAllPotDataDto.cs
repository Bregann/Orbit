namespace Orbit.Domain.DTOs.Pots.Responses
{
    public class GetAllPotDataDto
    {
        public required SpendingPotData[] SpendingPots { get; set; }
        public required SavingsPotData[] SavingsPots { get; set; }
    }

    public class SpendingPotData
    {
        public required int PotId { get; set; }
        public required string PotName { get; set; }
        public required string AmountAllocated { get; set; }
        public required string AmountLeft { get; set; }
        public required string AmountSpent { get; set; }
    }

    public class SavingsPotData
    {
        public required int PotId { get; set; }
        public required string PotName { get; set; }
        public required string AmountSaved { get; set; }
        public required string AmountAddedThisMonth { get; set; }
    }
}
