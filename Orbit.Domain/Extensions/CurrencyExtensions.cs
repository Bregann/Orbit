namespace Orbit.Domain.Extensions
{
    public static class CurrencyExtensions
    {
        /// <summary>
        /// Converts pence (long) to pounds and formats as GBP currency string (e.g., "£123.45")
        /// </summary>
        /// <param name="pence">The amount in pence</param>
        /// <returns>Formatted currency string in pounds</returns>
        public static string ToPoundsString(this long pence)
        {
            var pounds = pence / 100m;
            var sign = pence < 0 ? "-" : "";
            return $"{sign}£{Math.Abs(pounds):N2}";
        }

        /// <summary>
        /// Converts pence (decimal) to pounds and formats as GBP currency string (e.g., "£123.45")
        /// </summary>
        /// <param name="pence">The amount in pence</param>
        /// <returns>Formatted currency string in pounds</returns>
        public static string ToPoundsString(this decimal pence)
        {
            var pounds = pence / 100m;
            var sign = pence < 0 ? "-" : "";
            return $"{sign}£{Math.Abs(pounds):N2}";
        }
    }
}
