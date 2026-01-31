using Orbit.Domain.Extensions;

namespace Orbit.Tests.Extensions
{
    [TestFixture]
    public class CurrencyExtensionsTests
    {
        [TestCase(0L, "\u00A30.00")]
        [TestCase(100L, "\u00A31.00")]
        [TestCase(1000L, "\u00A310.00")]
        [TestCase(12345L, "\u00A3123.45")]
        [TestCase(999999L, "\u00A39,999.99")]
        [TestCase(1000000L, "\u00A310,000.00")]
        [TestCase(1L, "\u00A30.01")]
        [TestCase(99L, "\u00A30.99")]
        [TestCase(50L, "\u00A30.50")]
        public void ToPoundsString_Long_ShouldFormatCorrectly(long pence, string expected)
        {
            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo(expected));
        }

        [TestCase(0, "\u00A30.00")]
        [TestCase(100, "\u00A31.00")]
        [TestCase(1000, "\u00A310.00")]
        [TestCase(12345, "\u00A3123.45")]
        [TestCase(999999, "\u00A39,999.99")]
        [TestCase(1000000, "\u00A310,000.00")]
        [TestCase(1, "\u00A30.01")]
        [TestCase(99, "\u00A30.99")]
        [TestCase(50, "\u00A30.50")]
        public void ToPoundsString_Decimal_ShouldFormatCorrectly(decimal pence, string expected)
        {
            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo(expected));
        }

        [Test]
        public void ToPoundsString_Long_ShouldHandleNegativeValues()
        {
            // Arrange
            long negativePence = -12345L;

            // Act
            var result = negativePence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("-\u00A3123.45"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldHandleNegativeValues()
        {
            // Arrange
            decimal negativePence = -12345m;

            // Act
            var result = negativePence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("-\u00A3123.45"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldHandleVeryLargeValues()
        {
            // Arrange
            long largePence = 123456789012L; // \u00A31,234,567,890.12

            // Act
            var result = largePence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("\u00A31,234,567,890.12"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldHandleVeryLargeValues()
        {
            // Arrange
            decimal largePence = 123456789012m; // \u00A31,234,567,890.12

            // Act
            var result = largePence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("\u00A31,234,567,890.12"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldRoundCorrectly()
        {
            // Arrange - Test with decimal division that might cause rounding issues
            long pence = 12345L;

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("\u00A3123.45"));
            Assert.That(result, Does.Not.Contain("\u00A3123.449"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldHandleDecimalPrecision()
        {
            // Arrange
            decimal pence = 12345.6789m; // More precision than needed

            // Act
            var result = pence.ToPoundsString();

            // Assert
            // Should round to 2 decimal places: 123.456789 ? \u00A3123.46
            Assert.That(result, Is.EqualTo("\u00A3123.46"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldIncludeThousandsSeparator()
        {
            // Arrange
            long pence = 1234567L; // \u00A312,345.67

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Does.Contain(","));
            Assert.That(result, Is.EqualTo("\u00A312,345.67"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldIncludeThousandsSeparator()
        {
            // Arrange
            decimal pence = 1234567m; // \u00A312,345.67

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Does.Contain(","));
            Assert.That(result, Is.EqualTo("\u00A312,345.67"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldAlwaysShowTwoDecimalPlaces()
        {
            // Arrange
            long wholePounds = 100L; // \u00A31.00

            // Act
            var result = wholePounds.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("\u00A31.00"));
            Assert.That(result, Does.Not.EqualTo("\u00A31"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldAlwaysShowTwoDecimalPlaces()
        {
            // Arrange
            decimal wholePounds = 100m; // \u00A31.00

            // Act
            var result = wholePounds.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("\u00A31.00"));
            Assert.That(result, Does.Not.EqualTo("\u00A31"));
        }

        [Test]
        public void ToPoundsString_BothOverloads_ShouldProduceSameResult()
        {
            // Arrange
            long penceAsLong = 12345L;
            decimal penceAsDecimal = 12345m;

            // Act
            var resultLong = penceAsLong.ToPoundsString();
            var resultDecimal = penceAsDecimal.ToPoundsString();

            // Assert
            Assert.That(resultLong, Is.EqualTo(resultDecimal));
        }

        [TestCase(12345L, 12345)]
        [TestCase(100L, 100)]
        [TestCase(0L, 0)]
        [TestCase(999999L, 999999)]
        public void ToPoundsString_BothOverloads_ShouldBeConsistent(long penceAsLong, decimal penceAsDecimal)
        {
            // Act
            var resultLong = penceAsLong.ToPoundsString();
            var resultDecimal = penceAsDecimal.ToPoundsString();

            // Assert
            Assert.That(resultLong, Is.EqualTo(resultDecimal));
        }

        [Test]
        public void ToPoundsString_Long_ShouldStartWithPoundSign()
        {
            // Arrange
            long pence = 12345L;

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Does.StartWith("\u00A3"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldStartWithPoundSign()
        {
            // Arrange
            decimal pence = 12345m;

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Does.StartWith("\u00A3"));
        }
    }
}
