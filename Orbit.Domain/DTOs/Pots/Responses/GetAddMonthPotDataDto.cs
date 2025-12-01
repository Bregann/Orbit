namespace Orbit.Domain.DTOs.Pots.Responses
{
    public class GetAddMonthPotDataDto
    {
        public required AddMonthSpendingPot[] SpendingPots { get; set; }
        public required AddMonthSavingsPot[] SavingsPots { get; set; }
    }

    public class AddMonthSpendingPot
    {
        public required int PotId { get; set; }
        public required string PotName { get; set; }
        public required decimal AmountToAdd { get; set; }
        public required string RolloverAmount { get; set; }
    }

    public class AddMonthSavingsPot
    {
        public required int PotId { get; set; }
        public required string PotName { get; set; }
        public required decimal AmountToAdd { get; set; }
    }
}
