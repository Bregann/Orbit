using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Assets;
using Orbit.Domain.Services.Assets;
using Orbit.Tests.Infrastructure;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Tests.Services.Assets
{
    [TestFixture]
    public class AssetsServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private AssetsService _assetsService = null!;
        private string _testAssetsPath = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestAssets(DbContext);

            _assetsService = new AssetsService(DbContext);

            _testAssetsPath = Path.Combine(Directory.GetCurrentDirectory(), "AssetsStorage");
            if (!Directory.Exists(_testAssetsPath))
            {
                Directory.CreateDirectory(_testAssetsPath);
            }
        }

        protected override Task CustomTearDown()
        {
            if (Directory.Exists(_testAssetsPath))
            {
                try
                {
                    var files = Directory.GetFiles(_testAssetsPath);
                    foreach (var file in files)
                    {
                        try
                        {
                            File.Delete(file);
                        }
                        catch
                        {
                            // Ignore cleanup errors
                        }
                    }
                }
                catch
                {
                    // Ignore cleanup errors
                }
            }

            return Task.CompletedTask;
        }

        [Test]
        public async Task GetAllAssets_ShouldReturnAllAssets()
        {
            // Act
            var result = await _assetsService.GetAllAssets();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Assets, Is.Not.Empty);
            Assert.That(result.Assets.Any(a => a.AssetName == "Test Laptop"), Is.True);
            Assert.That(result.Assets.Any(a => a.AssetName == "Test Monitor"), Is.True);
            Assert.That(result.Assets.Any(a => a.AssetName == "Test Desk"), Is.True);
        }

        [Test]
        public async Task GetAllAssets_ShouldReturnEmptyArray_WhenNoAssets()
        {
            // Arrange
            DbContext.Assets.RemoveRange(DbContext.Assets);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _assetsService.GetAllAssets();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Assets, Is.Empty);
        }

        [Test]
        public async Task GetAllAssets_ShouldIncludeCorrectProperties()
        {
            // Act
            var result = await _assetsService.GetAllAssets();

            // Assert
            Assert.That(result.Assets, Is.Not.Empty);

            var firstAsset = result.Assets[0];
            Assert.That(firstAsset.AssetId, Is.GreaterThan(0));
            Assert.That(firstAsset.AssetName, Is.Not.Null);
            Assert.That(firstAsset.Brand, Is.Not.Null);
            Assert.That(firstAsset.CategoryId, Is.GreaterThan(0));
            Assert.That(firstAsset.CategoryName, Is.Not.Null);
            Assert.That(firstAsset.Status, Is.Not.Null);
            Assert.That(firstAsset.CreatedAt, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public async Task GetAllAssets_ShouldSetHasReceiptAndHasManualFlags()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            asset.ReceiptPath = "receipts/test-receipt.pdf";
            asset.ManualPath = "manuals/test-manual.pdf";
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _assetsService.GetAllAssets();

            // Assert
            var assetWithDocuments = result.Assets.First(a => a.AssetId == asset.Id);
            Assert.That(assetWithDocuments.HasReceipt, Is.True);
            Assert.That(assetWithDocuments.HasManual, Is.True);
        }

        [Test]
        public async Task CreateAsset_ShouldCreateNewAsset()
        {
            // Arrange
            var request = new CreateAssetRequest
            {
                AssetName = "New Test Asset",
                Brand = "New Brand",
                Model = "New Model",
                SerialNumber = "NEW123456",
                PurchaseDate = DateTime.UtcNow.AddMonths(-1),
                PurchasePrice = 999.99m,
                Location = "Test Location",
                WarrantyExpirationDate = DateTime.UtcNow.AddYears(1),
                Notes = "Newly created asset",
                Status = "Active",
                CategoryId = 1
            };

            // Act
            await _assetsService.CreateAsset(request);

            // Assert
            var asset = await DbContext.Assets
                .FirstOrDefaultAsync(a => a.AssetName == "New Test Asset");

            Assert.That(asset, Is.Not.Null);
            Assert.That(asset.Brand, Is.EqualTo("New Brand"));
            Assert.That(asset.Model, Is.EqualTo("New Model"));
            Assert.That(asset.SerialNumber, Is.EqualTo("NEW123456"));
            Assert.That(asset.PurchasePrice, Is.EqualTo(999.99m));
            Assert.That(asset.Location, Is.EqualTo("Test Location"));
            Assert.That(asset.Status, Is.EqualTo("Active"));
            Assert.That(asset.AssetCategoryId, Is.EqualTo(1));
        }

        [Test]
        public async Task CreateAsset_ShouldSetTimestampsToUtcNow()
        {
            // Arrange
            var beforeCreate = DateTime.UtcNow.AddSeconds(-1);

            var request = new CreateAssetRequest
            {
                AssetName = "Timestamp Test Asset",
                Brand = "Test Brand",
                PurchaseDate = DateTime.UtcNow,
                Status = "Active",
                CategoryId = 1
            };

            // Act
            await _assetsService.CreateAsset(request);
            var afterCreate = DateTime.UtcNow.AddSeconds(1);

            // Assert
            var asset = await DbContext.Assets
                .FirstOrDefaultAsync(a => a.AssetName == "Timestamp Test Asset");

            Assert.That(asset, Is.Not.Null);
            Assert.That(asset.CreatedAt, Is.GreaterThan(beforeCreate));
            Assert.That(asset.CreatedAt, Is.LessThan(afterCreate));
            Assert.That(asset.CreatedAt.Kind, Is.EqualTo(DateTimeKind.Utc));
            Assert.That(asset.LastUpdatedAt, Is.Not.Null);
            Assert.That(asset.LastUpdatedAt.Value, Is.GreaterThan(beforeCreate));
            Assert.That(asset.LastUpdatedAt.Value, Is.LessThan(afterCreate));
            Assert.That(asset.LastUpdatedAt.Value.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [Test]
        public async Task UpdateAsset_ShouldUpdateExistingAsset()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var assetId = asset.Id;
            var originalCreatedAt = asset.CreatedAt;

            var request = new UpdateAssetRequest
            {
                AssetId = assetId,
                AssetName = "Updated Asset Name",
                Brand = "Updated Brand",
                Model = "Updated Model",
                SerialNumber = "UPDATED123",
                PurchaseDate = DateTime.UtcNow.AddMonths(-3),
                PurchasePrice = 1500.00m,
                Location = "Updated Location",
                WarrantyExpirationDate = DateTime.UtcNow.AddYears(2),
                Notes = "Updated notes",
                Status = "In Repair",
                CategoryId = 2
            };

            // Act
            await _assetsService.UpdateAsset(request);

            // Assert
            DbContext.ChangeTracker.Clear();
            var updatedAsset = await DbContext.Assets.FindAsync(assetId);

            Assert.That(updatedAsset, Is.Not.Null);
            Assert.That(updatedAsset.AssetName, Is.EqualTo("Updated Asset Name"));
            Assert.That(updatedAsset.Brand, Is.EqualTo("Updated Brand"));
            Assert.That(updatedAsset.Model, Is.EqualTo("Updated Model"));
            Assert.That(updatedAsset.SerialNumber, Is.EqualTo("UPDATED123"));
            Assert.That(updatedAsset.PurchasePrice, Is.EqualTo(1500.00m));
            Assert.That(updatedAsset.Location, Is.EqualTo("Updated Location"));
            Assert.That(updatedAsset.Notes, Is.EqualTo("Updated notes"));
            Assert.That(updatedAsset.Status, Is.EqualTo("In Repair"));
            Assert.That(updatedAsset.AssetCategoryId, Is.EqualTo(2));
            Assert.That(updatedAsset.CreatedAt, Is.EqualTo(originalCreatedAt).Within(TimeSpan.FromMicroseconds(1)));
            Assert.That(updatedAsset.LastUpdatedAt, Is.Not.Null);
            Assert.That(updatedAsset.LastUpdatedAt.Value, Is.GreaterThan(originalCreatedAt));
        }

        [Test]
        public async Task UpdateAsset_ShouldThrowKeyNotFoundException_WhenAssetNotFound()
        {
            // Arrange
            var request = new UpdateAssetRequest
            {
                AssetId = 99999,
                AssetName = "Non-existent",
                PurchaseDate = DateTime.UtcNow,
                Status = "Active",
                CategoryId = 1
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _assetsService.UpdateAsset(request));

            Assert.That(exception.Message, Does.Contain("Asset with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteAsset_ShouldRemoveAssetFromDatabase()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var assetId = asset.Id;
            var initialCount = await DbContext.Assets.CountAsync();

            // Act
            await _assetsService.DeleteAsset(assetId);

            // Assert
            var deletedAsset = await DbContext.Assets.FindAsync(assetId);
            var finalCount = await DbContext.Assets.CountAsync();

            Assert.That(deletedAsset, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteAsset_ShouldDeleteReceiptAndManualFromStorage()
        {
            // Arrange
            var receiptFileName = "DeleteTest-Receipt.pdf";
            var manualFileName = "DeleteTest-Manual.pdf";
            var receiptPath = Path.Combine(_testAssetsPath, receiptFileName);
            var manualPath = Path.Combine(_testAssetsPath, manualFileName);

            await File.WriteAllTextAsync(receiptPath, "Receipt content");
            await File.WriteAllTextAsync(manualPath, "Manual content");

            var asset = new Domain.Database.Models.Asset
            {
                AssetName = "Delete Test Asset",
                Brand = "Test Brand",
                ReceiptPath = Path.Combine("AssetsStorage", receiptFileName),
                ManualPath = Path.Combine("AssetsStorage", manualFileName),
                Status = "Active",
                AssetCategoryId = 1,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };
            await DbContext.Assets.AddAsync(asset);
            await DbContext.SaveChangesAsync();

            // Act
            await _assetsService.DeleteAsset(asset.Id);

            // Assert
            Assert.That(File.Exists(receiptPath), Is.False);
            Assert.That(File.Exists(manualPath), Is.False);
        }

        [Test]
        public async Task DeleteAsset_ShouldNotThrow_WhenFilesNotInStorage()
        {
            // Arrange
            var asset = new Domain.Database.Models.Asset
            {
                AssetName = "No Files Test",
                Brand = "Test Brand",
                ReceiptPath = Path.Combine("AssetsStorage", "NonExistent-Receipt.pdf"),
                ManualPath = Path.Combine("AssetsStorage", "NonExistent-Manual.pdf"),
                Status = "Active",
                AssetCategoryId = 1,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };
            await DbContext.Assets.AddAsync(asset);
            await DbContext.SaveChangesAsync();

            // Act & Assert
            Assert.DoesNotThrowAsync(async () =>
                await _assetsService.DeleteAsset(asset.Id));
        }

        [Test]
        public async Task DeleteAsset_ShouldThrowKeyNotFoundException_WhenAssetNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _assetsService.DeleteAsset(99999));

            Assert.That(exception.Message, Does.Contain("Asset with ID 99999 not found"));
        }

        [Test]
        public async Task UploadAssetDocument_ShouldSaveReceiptToStorage()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var request = new UploadAssetDocumentRequest
            {
                AssetId = asset.Id,
                DocumentType = "Receipt"
            };

            var testContent = "Receipt content";
            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(testContent));

            // Act
            await _assetsService.UploadAssetDocument(request, stream, ".pdf");

            // Assert
            DbContext.ChangeTracker.Clear();
            var updatedAsset = await DbContext.Assets.FindAsync(asset.Id);

            Assert.That(updatedAsset, Is.Not.Null);
            Assert.That(updatedAsset.ReceiptPath, Is.Not.Null);
            Assert.That(updatedAsset.ReceiptPath, Does.Contain($"{asset.Id}-Receipt.pdf"));

            var filePath = Path.Combine(_testAssetsPath, $"{asset.Id}-Receipt.pdf");
            Assert.That(File.Exists(filePath), Is.True);

            var fileContent = await File.ReadAllTextAsync(filePath);
            Assert.That(fileContent, Is.EqualTo(testContent));
        }

        [Test]
        public async Task UploadAssetDocument_ShouldSaveManualToStorage()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var request = new UploadAssetDocumentRequest
            {
                AssetId = asset.Id,
                DocumentType = "Manual"
            };

            var testContent = "Manual content";
            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(testContent));

            // Act
            await _assetsService.UploadAssetDocument(request, stream, ".pdf");

            // Assert
            DbContext.ChangeTracker.Clear();
            var updatedAsset = await DbContext.Assets.FindAsync(asset.Id);

            Assert.That(updatedAsset, Is.Not.Null);
            Assert.That(updatedAsset.ManualPath, Is.Not.Null);
            Assert.That(updatedAsset.ManualPath, Does.Contain($"{asset.Id}-Manual.pdf"));

            var filePath = Path.Combine(_testAssetsPath, $"{asset.Id}-Manual.pdf");
            Assert.That(File.Exists(filePath), Is.True);
        }

        [Test]
        public async Task UploadAssetDocument_ShouldReplaceExistingDocument()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var oldFileName = $"{asset.Id}-Receipt-old.pdf";
            var oldFilePath = Path.Combine(_testAssetsPath, oldFileName);
            await File.WriteAllTextAsync(oldFilePath, "Old content");

            asset.ReceiptPath = Path.Combine("AssetsStorage", oldFileName);
            await DbContext.SaveChangesAsync();

            var request = new UploadAssetDocumentRequest
            {
                AssetId = asset.Id,
                DocumentType = "Receipt"
            };

            var newContent = "New content";
            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(newContent));

            // Act
            await _assetsService.UploadAssetDocument(request, stream, ".pdf");

            // Assert
            Assert.That(File.Exists(oldFilePath), Is.False);
            var newFilePath = Path.Combine(_testAssetsPath, $"{asset.Id}-Receipt.pdf");
            Assert.That(File.Exists(newFilePath), Is.True);
        }

        [Test]
        public async Task UploadAssetDocument_ShouldThrowKeyNotFoundException_WhenAssetNotFound()
        {
            // Arrange
            var request = new UploadAssetDocumentRequest
            {
                AssetId = 99999,
                DocumentType = "Receipt"
            };

            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("content"));

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _assetsService.UploadAssetDocument(request, stream, ".pdf"));

            Assert.That(exception.Message, Does.Contain("Asset with ID 99999 not found"));
        }

        [Test]
        public async Task DownloadAssetDocument_ShouldReturnReceiptBytes()
        {
            // Arrange
            var testContent = "Receipt download test";
            var asset = DbContext.Assets.First();
            var fileName = $"{asset.Id}-Receipt.pdf";
            var filePath = Path.Combine(_testAssetsPath, fileName);
            await File.WriteAllTextAsync(filePath, testContent);

            asset.ReceiptPath = Path.Combine("AssetsStorage", fileName);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _assetsService.DownloadAssetDocument(asset.Id, "Receipt");

            // Assert
            Assert.That(result.fileName, Is.Not.Null);
            Assert.That(result.fileBytes, Is.Not.Null);

            var content = System.Text.Encoding.UTF8.GetString(result.fileBytes);
            Assert.That(content, Is.EqualTo(testContent));
        }

        [Test]
        public async Task DownloadAssetDocument_ShouldReturnManualBytes()
        {
            // Arrange
            var testContent = "Manual download test";
            var asset = DbContext.Assets.First();
            var fileName = $"{asset.Id}-Manual.pdf";
            var filePath = Path.Combine(_testAssetsPath, fileName);
            await File.WriteAllTextAsync(filePath, testContent);

            asset.ManualPath = Path.Combine("AssetsStorage", fileName);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _assetsService.DownloadAssetDocument(asset.Id, "Manual");

            // Assert
            Assert.That(result.fileName, Is.Not.Null);
            Assert.That(result.fileBytes, Is.Not.Null);

            var content = System.Text.Encoding.UTF8.GetString(result.fileBytes);
            Assert.That(content, Is.EqualTo(testContent));
        }

        [Test]
        public async Task DownloadAssetDocument_ShouldThrowKeyNotFoundException_WhenAssetNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _assetsService.DownloadAssetDocument(99999, "Receipt"));

            Assert.That(exception.Message, Does.Contain("Asset with ID 99999 not found"));
        }

        [Test]
        public async Task DownloadAssetDocument_ShouldThrowInvalidOperationException_WhenDocumentNotUploaded()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            asset.ReceiptPath = null;
            await DbContext.SaveChangesAsync();

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _assetsService.DownloadAssetDocument(asset.Id, "Receipt"));

            Assert.That(exception.Message, Does.Contain("Receipt not found for this asset"));
        }

        [Test]
        public async Task DownloadAssetDocument_ShouldThrowFileNotFoundException_WhenFileNotInStorage()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            asset.ReceiptPath = Path.Combine("AssetsStorage", "NonExistent.pdf");
            await DbContext.SaveChangesAsync();

            // Act & Assert
            var exception = Assert.ThrowsAsync<FileNotFoundException>(async () =>
                await _assetsService.DownloadAssetDocument(asset.Id, "Receipt"));

            Assert.That(exception.Message, Does.Contain("Receipt file not found at "));
        }

        [Test]
        public async Task DeleteAssetDocument_ShouldRemoveReceiptFromDatabaseAndStorage()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var fileName = $"{asset.Id}-Receipt.pdf";
            var filePath = Path.Combine(_testAssetsPath, fileName);
            await File.WriteAllTextAsync(filePath, "Receipt content");

            asset.ReceiptPath = Path.Combine("AssetsStorage", fileName);
            await DbContext.SaveChangesAsync();

            // Act
            await _assetsService.DeleteAssetDocument(asset.Id, "Receipt");

            // Assert
            DbContext.ChangeTracker.Clear();
            var updatedAsset = await DbContext.Assets.FindAsync(asset.Id);

            Assert.That(updatedAsset, Is.Not.Null);
            Assert.That(updatedAsset.ReceiptPath, Is.Null);
            Assert.That(File.Exists(filePath), Is.False);
        }

        [Test]
        public async Task DeleteAssetDocument_ShouldRemoveManualFromDatabaseAndStorage()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var fileName = $"{asset.Id}-Manual.pdf";
            var filePath = Path.Combine(_testAssetsPath, fileName);
            await File.WriteAllTextAsync(filePath, "Manual content");

            asset.ManualPath = Path.Combine("AssetsStorage", fileName);
            await DbContext.SaveChangesAsync();

            // Act
            await _assetsService.DeleteAssetDocument(asset.Id, "Manual");

            // Assert
            DbContext.ChangeTracker.Clear();
            var updatedAsset = await DbContext.Assets.FindAsync(asset.Id);

            Assert.That(updatedAsset, Is.Not.Null);
            Assert.That(updatedAsset.ManualPath, Is.Null);
            Assert.That(File.Exists(filePath), Is.False);
        }

        [Test]
        public async Task DeleteAssetDocument_ShouldNotThrow_WhenFileNotInStorage()
        {
            // Arrange
            var asset = DbContext.Assets.First();
            asset.ReceiptPath = Path.Combine("AssetsStorage", "NonExistent.pdf");
            await DbContext.SaveChangesAsync();

            // Act & Assert
            Assert.DoesNotThrowAsync(async () =>
                await _assetsService.DeleteAssetDocument(asset.Id, "Receipt"));

            // Verify path was still cleared
            DbContext.ChangeTracker.Clear();
            var updatedAsset = await DbContext.Assets.FindAsync(asset.Id);
            Assert.That(updatedAsset, Is.Not.Null);
            Assert.That(updatedAsset.ReceiptPath, Is.Null);
        }

        [Test]
        public async Task DeleteAssetDocument_ShouldThrowKeyNotFoundException_WhenAssetNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _assetsService.DeleteAssetDocument(99999, "Receipt"));

            Assert.That(exception.Message, Does.Contain("Asset with ID 99999 not found"));
        }

        [Test]
        public async Task GetAllAssetCategories_ShouldReturnAllCategories()
        {
            // Act
            var result = await _assetsService.GetAllAssetCategories();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Categories, Is.Not.Empty);
            Assert.That(result.Categories.Any(c => c.CategoryName == "Test Electronics"), Is.True);
            Assert.That(result.Categories.Any(c => c.CategoryName == "Test Furniture"), Is.True);
        }

        [Test]
        public async Task GetAllAssetCategories_ShouldReturnEmptyArray_WhenNoCategories()
        {
            // Arrange
            DbContext.AssetCategories.RemoveRange(DbContext.AssetCategories);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _assetsService.GetAllAssetCategories();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Categories, Is.Empty);
        }

        [Test]
        public async Task GetAllAssetCategories_ShouldIncludeAssetCount()
        {
            // Act
            var result = await _assetsService.GetAllAssetCategories();

            // Assert
            var electronicsCategory = result.Categories.First(c => c.CategoryName == "Test Electronics");
            Assert.That(electronicsCategory.AssetCount, Is.GreaterThan(0));
        }

        [Test]
        public async Task AddAssetCategory_ShouldCreateNewCategory()
        {
            // Arrange
            var request = new AddAssetCategoryRequest
            {
                CategoryName = "New Test Category"
            };

            // Act
            await _assetsService.AddAssetCategory(request);

            // Assert
            var category = await DbContext.AssetCategories
                .FirstOrDefaultAsync(c => c.CategoryName == "New Test Category");

            Assert.That(category, Is.Not.Null);
            Assert.That(category.CategoryName, Is.EqualTo("New Test Category"));
        }

        [Test]
        public async Task DeleteCategory_ShouldRemoveCategory()
        {
            // Arrange
            var category = new Domain.Database.Models.AssetCategory
            {
                CategoryName = "Category To Delete"
            };
            await DbContext.AssetCategories.AddAsync(category);
            await DbContext.SaveChangesAsync();

            var categoryId = category.Id;
            var initialCount = await DbContext.AssetCategories.CountAsync();

            // Act
            await _assetsService.DeleteAssetCategory(categoryId);

            // Assert
            var deletedCategory = await DbContext.AssetCategories.FindAsync(categoryId);
            var finalCount = await DbContext.AssetCategories.CountAsync();

            Assert.That(deletedCategory, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteCategory_ShouldThrowKeyNotFoundException_WhenCategoryNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _assetsService.DeleteAssetCategory(99999));

            Assert.That(exception.Message, Does.Contain("Category with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteCategory_ShouldThrowInvalidOperationException_WhenCategoryHasAssets()
        {
            // Arrange
            var category = DbContext.AssetCategories.First();
            var categoryId = category.Id;

            // Ensure there's at least one asset in this category (from seed data)
            var hasAssets = await DbContext.Assets.AnyAsync(a => a.AssetCategoryId == categoryId);
            if (!hasAssets)
            {
                // Add an asset to this category
                await DbContext.Assets.AddAsync(new Domain.Database.Models.Asset
                {
                    AssetName = "Test Asset",
                    Brand = "Test Brand",
                    Status = "Active",
                    AssetCategoryId = categoryId,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdatedAt = DateTime.UtcNow
                });
                await DbContext.SaveChangesAsync();
            }

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _assetsService.DeleteAssetCategory(categoryId));

            Assert.That(exception.Message, Does.Contain("Cannot delete category that has assets. Please reassign or delete the assets first."));
        }

        [TestCase(".pdf")]
        [TestCase(".jpg")]
        [TestCase(".png")]
        [TestCase(".docx")]
        public async Task UploadAssetDocument_ShouldHandleDifferentFileExtensions(string extension)
        {
            // Arrange
            var asset = DbContext.Assets.First();
            var request = new UploadAssetDocumentRequest
            {
                AssetId = asset.Id,
                DocumentType = "Receipt"
            };

            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("test content"));

            // Act
            await _assetsService.UploadAssetDocument(request, stream, extension);

            // Assert
            DbContext.ChangeTracker.Clear();
            var updatedAsset = await DbContext.Assets.FindAsync(asset.Id);

            Assert.That(updatedAsset, Is.Not.Null);
            Assert.That(updatedAsset.ReceiptPath, Does.Contain(asset.AssetName.Replace(" ", "_")));
            Assert.That(updatedAsset.ReceiptPath, Does.Contain("Receipt"));
            Assert.That(updatedAsset.ReceiptPath, Does.EndWith(extension));

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), updatedAsset.ReceiptPath);
            Assert.That(File.Exists(filePath), Is.True);
        }

        [Test]
        public async Task GetAllAssets_ShouldOrderByCreatedAtDescending()
        {
            // Act
            var result = await _assetsService.GetAllAssets();

            // Assert
            Assert.That(result.Assets, Is.Not.Empty);

            for (int i = 0; i < result.Assets.Length - 1; i++)
            {
                Assert.That(result.Assets[i].CreatedAt, Is.GreaterThanOrEqualTo(result.Assets[i + 1].CreatedAt),
                    "Assets should be ordered by CreatedAt descending");
            }
        }

        [TestCase("Active")]
        [TestCase("Disposed")]
        [TestCase("In Repair")]
        [TestCase("Lost")]
        [TestCase("Sold")]
        public async Task CreateAsset_ShouldAcceptValidStatuses(string status)
        {
            // Arrange
            var request = new CreateAssetRequest
            {
                AssetName = $"Asset with {status} status",
                Brand = "Test Brand",
                PurchaseDate = DateTime.UtcNow,
                Status = status,
                CategoryId = 1
            };

            // Act
            await _assetsService.CreateAsset(request);

            // Assert
            var asset = await DbContext.Assets
                .FirstOrDefaultAsync(a => a.AssetName == $"Asset with {status} status");

            Assert.That(asset, Is.Not.Null);
            Assert.That(asset.Status, Is.EqualTo(status));
        }
    }
}
