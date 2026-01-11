using Orbit.Domain.Extensions;

namespace Orbit.Tests.Extensions
{
    [TestFixture]
    public class CurrencyExtensionsTests
    {
        [TestCase(0L, "£0.00")]
        [TestCase(100L, "£1.00")]
        [TestCase(1000L, "£10.00")]
        [TestCase(12345L, "£123.45")]
        [TestCase(999999L, "£9,999.99")]
        [TestCase(1000000L, "£10,000.00")]
        [TestCase(1L, "£0.01")]
        [TestCase(99L, "£0.99")]
        [TestCase(50L, "£0.50")]
        public void ToPoundsString_Long_ShouldFormatCorrectly(long pence, string expected)
        {
            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo(expected));
        }

        [TestCase(0, "£0.00")]
        [TestCase(100, "£1.00")]
        [TestCase(1000, "£10.00")]
        [TestCase(12345, "£123.45")]
        [TestCase(999999, "£9,999.99")]
        [TestCase(1000000, "£10,000.00")]
        [TestCase(1, "£0.01")]
        [TestCase(99, "£0.99")]
        [TestCase(50, "£0.50")]
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
            Assert.That(result, Is.EqualTo("-£123.45"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldHandleNegativeValues()
        {
            // Arrange
            decimal negativePence = -12345m;

            // Act
            var result = negativePence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("-£123.45"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldHandleVeryLargeValues()
        {
            // Arrange
            long largePence = 123456789012L; // £1,234,567,890.12

            // Act
            var result = largePence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("£1,234,567,890.12"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldHandleVeryLargeValues()
        {
            // Arrange
            decimal largePence = 123456789012m; // £1,234,567,890.12

            // Act
            var result = largePence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("£1,234,567,890.12"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldRoundCorrectly()
        {
            // Arrange - Test with decimal division that might cause rounding issues
            long pence = 12345L;

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("£123.45"));
            Assert.That(result, Does.Not.Contain("£123.449"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldHandleDecimalPrecision()
        {
            // Arrange
            decimal pence = 12345.6789m; // More precision than needed

            // Act
            var result = pence.ToPoundsString();

            // Assert
            // Should round to 2 decimal places: 123.456789 ? £123.46
            Assert.That(result, Is.EqualTo("£123.46"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldIncludeThousandsSeparator()
        {
            // Arrange
            long pence = 1234567L; // £12,345.67

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Does.Contain(","));
            Assert.That(result, Is.EqualTo("£12,345.67"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldIncludeThousandsSeparator()
        {
            // Arrange
            decimal pence = 1234567m; // £12,345.67

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Does.Contain(","));
            Assert.That(result, Is.EqualTo("£12,345.67"));
        }

        [Test]
        public void ToPoundsString_Long_ShouldAlwaysShowTwoDecimalPlaces()
        {
            // Arrange
            long wholePounds = 100L; // £1.00

            // Act
            var result = wholePounds.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("£1.00"));
            Assert.That(result, Does.Not.EqualTo("£1"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldAlwaysShowTwoDecimalPlaces()
        {
            // Arrange
            decimal wholePounds = 100m; // £1.00

            // Act
            var result = wholePounds.ToPoundsString();

            // Assert
            Assert.That(result, Is.EqualTo("£1.00"));
            Assert.That(result, Does.Not.EqualTo("£1"));
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
            Assert.That(result, Does.StartWith("£"));
        }

        [Test]
        public void ToPoundsString_Decimal_ShouldStartWithPoundSign()
        {
            // Arrange
            decimal pence = 12345m;

            // Act
            var result = pence.ToPoundsString();

            // Assert
            Assert.That(result, Does.StartWith("£"));
        }
    }
}
