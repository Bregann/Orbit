namespace Orbit.Domain.Enums
{
    public enum EnvironmentalSettingEnum
    {
        HangfireUsername,
        HangfirePassword,
        MonzoClientId,
        MonzoClientSecret,
        MonzoRefreshToken,
        MonzoAccessToken,
        MonzoAccountId,
        BankAccountDataSecretId,
        BankAccountDataSecretKey,
        CreditCardAccountId,
        MainBankAccountId,
        CommsSenderApiKey,
        FitbitClientId,
        FitbitClientSecret,
        FitbitRedirectUri,
        GoCardlessRedirectUri,

        // Key for reporting to Project Monitor (copy it from its Manage projects page)
        ProjectMonitorApiKey
    }
}
