using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Finance.Subscriptions;
using Orbit.Domain.Enums;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;
using System.Data;

namespace Orbit.Tests.Services.Finance
{
    [TestFixture]
    public class SubscriptionServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private SubscriptionService _subscriptionService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestSubscriptions(DbContext);

            _subscriptionService = new SubscriptionService(DbContext);
        }

        [Test]
        public async Task GetSubscriptions_ShouldReturnAllSubscriptions()
        {
            // Act
            var result = await _subscriptionService.GetSubscriptions();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Subscriptions, Is.Not.Empty);
            Assert.That(result.Subscriptions.Any(s => s.Name == "Test Netflix"), Is.True);
            Assert.That(result.Subscriptions.Any(s => s.Name == "Test Annual Service"), Is.True);
        }

        [Test]
        public async Task GetSubscriptions_ShouldCalculateNextBillingDate()
        {
            // Act
            var result = await _subscriptionService.GetSubscriptions();

            // Assert
            var subscription = result.Subscriptions.First();
            Assert.That(subscription.NextBillingDate, Is.GreaterThanOrEqualTo(DateTime.UtcNow.Date));
        }

        [Test]
        public async Task GetSubscriptions_ShouldReturnEmptyArray_WhenNoSubscriptions()
        {
            // Arrange
            DbContext.Subscriptions.RemoveRange(DbContext.Subscriptions);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _subscriptionService.GetSubscriptions();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Subscriptions, Is.Empty);
        }

        [Test]
        public async Task AddSubscription_ShouldCreateMonthlySubscription()
        {
            // Arrange
            var request = new AddSubscriptionRequest
            {
                SubscriptionName = "New Monthly Sub",
                SubscriptionAmount = 999, // £9.99 in pence
                BillingDay = 15,
                BillingMonth = null,
                BillingFrequency = SubscriptionBillingFrequencyType.Monthly
            };

            // Act
            await _subscriptionService.AddSubscription(request);

            // Assert
            var subscription = await DbContext.Subscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionName == "New Monthly Sub");

            Assert.That(subscription, Is.Not.Null);
            Assert.That(subscription.SubscriptionAmount, Is.EqualTo(999));
            Assert.That(subscription.SubscriptionMonthlyAmount, Is.EqualTo(999));
            Assert.That(subscription.BillingFrequency, Is.EqualTo(SubscriptionBillingFrequencyType.Monthly));
        }

        [Test]
        public async Task AddSubscription_ShouldCreateYearlySubscription_WithCalculatedMonthlyAmount()
        {
            // Arrange
            var request = new AddSubscriptionRequest
            {
                SubscriptionName = "New Yearly Sub",
                SubscriptionAmount = 12000, // £120 in pence
                BillingDay = 1,
                BillingMonth = 6,
                BillingFrequency = SubscriptionBillingFrequencyType.Yearly
            };

            // Act
            await _subscriptionService.AddSubscription(request);

            // Assert
            var subscription = await DbContext.Subscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionName == "New Yearly Sub");

            Assert.That(subscription, Is.Not.Null);
            Assert.That(subscription.SubscriptionAmount, Is.EqualTo(12000));
            Assert.That(subscription.SubscriptionMonthlyAmount, Is.EqualTo(1000)); // £10 per month
            Assert.That(subscription.BillingFrequency, Is.EqualTo(SubscriptionBillingFrequencyType.Yearly));
        }

        [Test]
        public async Task AddSubscription_ShouldThrowDuplicateNameException_WhenNameExists()
        {
            // Arrange
            var request = new AddSubscriptionRequest
            {
                SubscriptionName = "Test Netflix", // Already exists
                SubscriptionAmount = 999,
                BillingDay = 15,
                BillingMonth = null,
                BillingFrequency = SubscriptionBillingFrequencyType.Monthly
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<DuplicateNameException>(async () =>
                await _subscriptionService.AddSubscription(request));

            Assert.That(exception.Message, Does.Contain("Subscription with the same name already exists"));
        }

        [Test]
        public async Task UpdateSubscription_ShouldUpdateSubscription()
        {
            // Arrange
            var subscription = DbContext.Subscriptions.First();
            var request = new UpdateSubscriptionRequest
            {
                Id = subscription.Id,
                SubscriptionName = "Updated Subscription",
                SubscriptionAmount = 1999,
                BillingDay = 20,
                BillingFrequency = SubscriptionBillingFrequencyType.Monthly
            };

            // Act
            await _subscriptionService.UpdateSubscription(request);

            // Assert
            var updated = await DbContext.Subscriptions.FindAsync(subscription.Id);
            Assert.That(updated, Is.Not.Null);
            Assert.That(updated.SubscriptionName, Is.EqualTo("Updated Subscription"));
            Assert.That(updated.SubscriptionAmount, Is.EqualTo(1999));
            Assert.That(updated.BillingDay, Is.EqualTo(20));
        }

        [Test]
        public async Task UpdateSubscription_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Arrange
            var request = new UpdateSubscriptionRequest
            {
                Id = 99999,
                SubscriptionName = "Non-existent",
                SubscriptionAmount = 999,
                BillingDay = 15,
                BillingFrequency = SubscriptionBillingFrequencyType.Monthly
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _subscriptionService.UpdateSubscription(request));

            Assert.That(exception.Message, Does.Contain("Subscription not found"));
        }

        [Test]
        public async Task DeleteSubscription_ShouldRemoveSubscription()
        {
            // Arrange
            var subscription = DbContext.Subscriptions.First();
            var subscriptionId = subscription.Id;
            var initialCount = await DbContext.Subscriptions.CountAsync();

            // Act
            await _subscriptionService.DeleteSubscription(subscriptionId);

            // Assert

            // because it uses ExecuteDeleteAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var deleted = await DbContext.Subscriptions.FindAsync(subscriptionId);
            var finalCount = await DbContext.Subscriptions.CountAsync();

            Assert.That(deleted, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteSubscription_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _subscriptionService.DeleteSubscription(99999));

            Assert.That(exception.Message, Does.Contain("Subscription not found"));
        }
    }
}
