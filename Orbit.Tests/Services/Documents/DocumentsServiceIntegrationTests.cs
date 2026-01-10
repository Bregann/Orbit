using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Documents;
using Orbit.Domain.Services.Documents;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Documents
{
    [TestFixture]
    public class DocumentsServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private DocumentsService _documentsService = null!;
        private string _testDocumentsPath = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestDocuments(DbContext);

            _documentsService = new DocumentsService(DbContext);

            _testDocumentsPath = Path.Combine(Directory.GetCurrentDirectory(), "DocumentsStorage");
            if (!Directory.Exists(_testDocumentsPath))
            {
                Directory.CreateDirectory(_testDocumentsPath);
            }
        }

        protected override Task CustomTearDown()
        {
            if (Directory.Exists(_testDocumentsPath))
            {
                try
                {
                    var files = Directory.GetFiles(_testDocumentsPath);
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
        public async Task GetAllDocuments_ShouldReturnAllDocuments()
        {
            // Act
            var result = await _documentsService.GetAllDocuments();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Documents, Is.Not.Empty);
            Assert.That(result.Documents.Any(d => d.DocumentName == "Test Document 1"), Is.True);
            Assert.That(result.Documents.Any(d => d.DocumentName == "Test Document 2"), Is.True);
        }

        [Test]
        public async Task GetAllDocuments_ShouldReturnEmptyArray_WhenNoDocuments()
        {
            // Arrange
            DbContext.Documents.RemoveRange(DbContext.Documents);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _documentsService.GetAllDocuments();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Documents, Is.Empty);
        }

        [Test]
        public async Task UploadDocument_ShouldSaveDocumentToDatabase()
        {
            // Arrange
            var request = new UploadDocumentRequest
            {
                DocumentName = "NewTestDocument",
                DocumentType = "text/plain",
                CategoryId = 1
            };

            var testContent = "This is a test document content";
            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(testContent));

            // Act
            await _documentsService.UploadDocument(request, stream, ".txt");

            // Assert
            var document = await DbContext.Documents
                .FirstOrDefaultAsync(d => d.DocumentName == "NewTestDocument");

            Assert.That(document, Is.Not.Null);
            Assert.That(document.DocumentType, Is.EqualTo("text/plain"));
            Assert.That(document.DocumentCategoryId, Is.EqualTo(1));
            Assert.That(document.DocumentPath, Does.Contain("NewTestDocument.txt"));
        }

        [Test]
        public async Task UploadDocument_ShouldSaveFileToStorage()
        {
            // Arrange
            var request = new UploadDocumentRequest
            {
                DocumentName = "FileStorageTest",
                DocumentType = "text/plain",
                CategoryId = 1
            };

            var testContent = "File storage test content";
            var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(testContent));

            // Act
            await _documentsService.UploadDocument(request, stream, ".txt");

            // Assert
            var filePath = Path.Combine(_testDocumentsPath, "FileStorageTest.txt");
            Assert.That(File.Exists(filePath), Is.True);

            var fileContent = await File.ReadAllTextAsync(filePath);
            Assert.That(fileContent, Is.EqualTo(testContent));
        }

        [Test]
        public async Task DownloadDocument_ShouldReturnFileBytes()
        {
            // Arrange
            var testContent = "Download test content";
            var fileName = "DownloadTest.txt";
            var filePath = Path.Combine(_testDocumentsPath, fileName);
            await File.WriteAllTextAsync(filePath, testContent);

            var document = new Domain.Database.Models.Document
            {
                DocumentName = "DownloadTest",
                DocumentPath = Path.Combine("DocumentsStorage", fileName),
                DocumentType = "text/plain",
                DocumentCategoryId = 1,
                UploadedAt = DateTime.UtcNow
            };
            await DbContext.Documents.AddAsync(document);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _documentsService.DownloadDocument(document.Id);

            // Assert
            Assert.That(result, Is.Not.Null);
            var content = System.Text.Encoding.UTF8.GetString(result);
            Assert.That(content, Is.EqualTo(testContent));
        }

        [Test]
        public async Task DownloadDocument_ShouldThrowKeyNotFoundException_WhenDocumentNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _documentsService.DownloadDocument(99999));

            Assert.That(exception.Message, Does.Contain("Document not found"));
        }

        [Test]
        public async Task DownloadDocument_ShouldThrowFileNotFoundException_WhenFileNotInStorage()
        {
            // Arrange
            var document = new Domain.Database.Models.Document
            {
                DocumentName = "NonExistentFile",
                DocumentPath = Path.Combine("DocumentsStorage", "NonExistent.txt"),
                DocumentType = "text/plain",
                DocumentCategoryId = 1,
                UploadedAt = DateTime.UtcNow
            };
            await DbContext.Documents.AddAsync(document);
            await DbContext.SaveChangesAsync();

            // Act & Assert
            var exception = Assert.ThrowsAsync<FileNotFoundException>(async () =>
                await _documentsService.DownloadDocument(document.Id));

            Assert.That(exception.Message, Does.Contain("Document file not found in storage"));
        }

        [Test]
        public async Task DeleteDocument_ShouldRemoveDocumentFromDatabase()
        {
            // Arrange
            var document = DbContext.Documents.First();
            var documentId = document.Id;
            var initialCount = await DbContext.Documents.CountAsync();

            // Act
            await _documentsService.DeleteDocument(documentId);

            // Assert
            var deletedDocument = await DbContext.Documents.FindAsync(documentId);
            var finalCount = await DbContext.Documents.CountAsync();

            Assert.That(deletedDocument, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteDocument_ShouldDeleteFileFromStorage()
        {
            // Arrange
            var fileName = "DeleteTest.txt";
            var filePath = Path.Combine(_testDocumentsPath, fileName);
            await File.WriteAllTextAsync(filePath, "Delete test content");

            var document = new Domain.Database.Models.Document
            {
                DocumentName = "DeleteTest",
                DocumentPath = Path.Combine("DocumentsStorage", fileName),
                DocumentType = "text/plain",
                DocumentCategoryId = 1,
                UploadedAt = DateTime.UtcNow
            };
            await DbContext.Documents.AddAsync(document);
            await DbContext.SaveChangesAsync();

            // Act
            await _documentsService.DeleteDocument(document.Id);

            // Assert
            Assert.That(File.Exists(filePath), Is.False);
        }

        [Test]
        public async Task DeleteDocument_ShouldNotThrow_WhenFileNotInStorage()
        {
            // Arrange
            var document = new Domain.Database.Models.Document
            {
                DocumentName = "NoFileTest",
                DocumentPath = Path.Combine("DocumentsStorage", "NonExistent.txt"),
                DocumentType = "text/plain",
                DocumentCategoryId = 1,
                UploadedAt = DateTime.UtcNow
            };
            await DbContext.Documents.AddAsync(document);
            await DbContext.SaveChangesAsync();

            // Act & Assert
            Assert.DoesNotThrowAsync(async () =>
                await _documentsService.DeleteDocument(document.Id));
        }

        [Test]
        public async Task DeleteDocument_ShouldThrowKeyNotFoundException_WhenDocumentNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _documentsService.DeleteDocument(99999));

            Assert.That(exception.Message, Does.Contain("Document not found"));
        }

        [Test]
        public async Task GetAllDocumentCategories_ShouldReturnAllCategories()
        {
            // Act
            var result = await _documentsService.GetAllDocumentCategories();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Categories, Is.Not.Empty);
            Assert.That(result.Categories.Any(c => c.CategoryName == "Test Category 1"), Is.True);
            Assert.That(result.Categories.Any(c => c.CategoryName == "Test Category 2"), Is.True);
        }

        [Test]
        public async Task GetAllDocumentCategories_ShouldReturnEmptyArray_WhenNoCategories()
        {
            // Arrange
            DbContext.DocumentCategories.RemoveRange(DbContext.DocumentCategories);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _documentsService.GetAllDocumentCategories();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Categories, Is.Empty);
        }

        [Test]
        public async Task AddDocumentCategory_ShouldCreateNewCategory()
        {
            // Arrange
            var categoryName = "New Test Category";

            // Act
            await _documentsService.AddDocumentCategory(categoryName);

            // Assert
            var category = await DbContext.DocumentCategories
                .FirstOrDefaultAsync(c => c.CategoryName == categoryName);

            Assert.That(category, Is.Not.Null);
            Assert.That(category.CategoryName, Is.EqualTo(categoryName));
        }

        [Test]
        public async Task DeleteCategory_ShouldRemoveCategory()
        {
            // Arrange
            var category = new Domain.Database.Models.DocumentCategory
            {
                CategoryName = "Category To Delete"
            };
            await DbContext.DocumentCategories.AddAsync(category);
            await DbContext.SaveChangesAsync();

            var categoryId = category.Id;
            var initialCount = await DbContext.DocumentCategories.CountAsync();

            // Act
            await _documentsService.DeleteCategory(categoryId);

            // Assert
            var deletedCategory = await DbContext.DocumentCategories.FindAsync(categoryId);
            var finalCount = await DbContext.DocumentCategories.CountAsync();

            Assert.That(deletedCategory, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteCategory_ShouldThrowKeyNotFoundException_WhenCategoryNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _documentsService.DeleteCategory(99999));

            Assert.That(exception.Message, Does.Contain("Document category not found"));
        }

        [Test]
        public async Task DeleteCategory_ShouldThrowInvalidOperationException_WhenCategoryHasDocuments()
        {
            // Arrange
            var category = DbContext.DocumentCategories.First();
            var categoryId = category.Id;

            // Ensure there's at least one document in this category (from seed data)
            var hasDocuments = await DbContext.Documents.AnyAsync(d => d.DocumentCategoryId == categoryId);
            if (!hasDocuments)
            {
                // Add a document to this category
                await DbContext.Documents.AddAsync(new Domain.Database.Models.Document
                {
                    DocumentName = "Test Doc",
                    DocumentPath = "test/path",
                    DocumentType = "text/plain",
                    DocumentCategoryId = categoryId,
                    UploadedAt = DateTime.UtcNow
                });
                await DbContext.SaveChangesAsync();
            }

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _documentsService.DeleteCategory(categoryId));

            Assert.That(exception.Message, Does.Contain("Cannot delete category with associated documents"));
        }

        [TestCase(".txt")]
        [TestCase(".pdf")]
        [TestCase(".jpg")]
        [TestCase(".docx")]
        public async Task UploadDocument_ShouldHandleDifferentFileExtensions(string extension)
        {
            // Arrange
            var request = new UploadDocumentRequest
            {
                DocumentName = $"TestFile{extension}",
                DocumentType = "application/octet-stream",
                CategoryId = 1
            };

            var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("test content"));

            // Act
            await _documentsService.UploadDocument(request, stream, extension);

            // Assert
            var document = await DbContext.Documents
                .FirstOrDefaultAsync(d => d.DocumentName == $"TestFile{extension}");

            Assert.That(document, Is.Not.Null);
            Assert.That(document.DocumentPath, Does.Contain($"TestFile{extension}{extension}"));
        }

        [Test]
        public async Task GetAllDocuments_ShouldIncludeCorrectProperties()
        {
            // Act
            var result = await _documentsService.GetAllDocuments();

            // Assert
            Assert.That(result.Documents, Is.Not.Empty);

            var firstDoc = result.Documents[0];
            Assert.That(firstDoc.DocumentId, Is.GreaterThan(0));
            Assert.That(firstDoc.DocumentName, Is.Not.Null);
            Assert.That(firstDoc.DocumentType, Is.Not.Null);
            Assert.That(firstDoc.CategoryId, Is.GreaterThan(0));
            Assert.That(firstDoc.UploadedAt, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public async Task UploadDocument_ShouldSetUploadedAtToUtcNow()
        {
            // Arrange
            var beforeUpload = DateTime.UtcNow.AddSeconds(-1);

            var request = new UploadDocumentRequest
            {
                DocumentName = "TimestampTest",
                DocumentType = "text/plain",
                CategoryId = 1
            };

            var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("test"));

            // Act
            await _documentsService.UploadDocument(request, stream, ".txt");
            var afterUpload = DateTime.UtcNow.AddSeconds(1);

            // Assert
            var document = await DbContext.Documents
                .FirstOrDefaultAsync(d => d.DocumentName == "TimestampTest");

            Assert.That(document, Is.Not.Null);
            Assert.That(document.UploadedAt, Is.GreaterThan(beforeUpload));
            Assert.That(document.UploadedAt, Is.LessThan(afterUpload));
            Assert.That(document.UploadedAt.Kind, Is.EqualTo(DateTimeKind.Utc));
        }
    }
}
