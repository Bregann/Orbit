namespace Orbit.Domain.Interfaces
{
    public interface IBankService
    {
        Task GetMonzoTransactionsAndAddToDatabase();
        Task GetOpenBankingTransactionsAndAddToDatabase();
        Task UpdateAutomaticTransactions();
    }
}
