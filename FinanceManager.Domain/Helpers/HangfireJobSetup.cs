
using FinanceManager.Domain.Interfaces;
using FinanceManager.Domain.Interfaces.Helpers;
using Hangfire;

namespace FinanceManager.Domain.Helpers
{
    public class HangfireJobSetup
    {
        public static void SetupRecurringJobs()
        {
            RecurringJob.AddOrUpdate<IBankService>("FetchMonzoTransactions", service => service.GetMonzoTransactionsAndAddToDatabase(), Cron.Hourly);
            RecurringJob.AddOrUpdate<IBankService>("FetchOpenBankingTransactions", service => service.GetOpenBankingTransactionsAndAddToDatabase(), Cron.Hourly);
            RecurringJob.AddOrUpdate<IBankService>("UpdateAutomaticTransactions", service => service.UpdateAutomaticTransactions(), Cron.Hourly(10));
            RecurringJob.AddOrUpdate<IBankApiHelper>("RefreshMonzoToken", service => service.RefreshMonzoToken(), Cron.Hourly(45));
        }
    }
}
