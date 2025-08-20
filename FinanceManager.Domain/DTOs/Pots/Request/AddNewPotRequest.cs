namespace FinanceManager.Domain.DTOs.Pots.Request
{
    public class AddNewPotRequest
    {
        public string PotName { get; set; } = string.Empty;
        public decimal AmountToAdd { get; set; }
        public bool IsSavingsPot { get; set; }
    }
}