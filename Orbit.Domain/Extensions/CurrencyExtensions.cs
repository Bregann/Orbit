using System.Globalization;

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
            var sign = pounds < 0 ? "-" : "";
            // We use "N2" with an explicit GB culture to ensure commas/dots are correct
            var formattedNumber = Math.Abs(pounds).ToString("N2", CultureInfo.GetCultureInfo("en-GB"));
            return $"{sign}\u00A3{formattedNumber}";
        }

        /// <summary>
        /// Converts pence (decimal) to pounds and formats as GBP currency string (e.g., "£123.45")
        /// </summary>
        /// <param name="pence">The amount in pence</param>
        /// <returns>Formatted currency string in pounds</returns>
        public static string ToPoundsString(this decimal pence)
        {
            var pounds = pence / 100m;
            var sign = pounds < 0 ? "-" : "";
            // We use "N2" with an explicit GB culture to ensure commas/dots are correct
            var formattedNumber = Math.Abs(pounds).ToString("N2", CultureInfo.GetCultureInfo("en-GB"));
            return $"{sign}\u00A3{formattedNumber}";
        }
    }
}
