namespace FinanceManager.Domain.Interfaces
{
    public interface IBankService
    {
        Task GetMonzoTransactionsAndAddToDatabase();
        Task GetOpenBankingTransactionsAndAddToDatabase();
    }
}
