
using Hangfire;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Interfaces.Api.Fitbit;
using Orbit.Domain.Interfaces.Helpers;

namespace Orbit.Domain.Helpers
{
    public class HangfireJobSetup
    {
        public static void SetupRecurringJobs()
        {
            RecurringJob.AddOrUpdate<IBankService>("FetchMonzoTransactions", service => service.GetMonzoTransactionsAndAddToDatabase(), Cron.Hourly);
            RecurringJob.AddOrUpdate<IBankService>("FetchOpenBankingTransactions", service => service.GetOpenBankingTransactionsAndAddToDatabase(), Cron.Hourly);
            RecurringJob.AddOrUpdate<IBankService>("UpdateAutomaticTransactions", service => service.UpdateAutomaticTransactions(), Cron.Hourly(10));
            RecurringJob.AddOrUpdate<IBankApiHelper>("RefreshMonzoToken", service => service.RefreshMonzoToken(), Cron.Hourly(45));
            RecurringJob.AddOrUpdate<IFitbitService>("RefreshFitbitTokens", service => service.RefreshFitbitTokens(), Cron.Hourly(50));
            RecurringJob.AddOrUpdate<IFitbitService>("RecordDailyFitbitData", service => service.RecordDailyFitbitData(), Cron.Daily(2));
        }
    }
}
