using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Notes;
using Orbit.Domain.Services.Notes;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Notes
{
    [TestFixture]
    public class NotesServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private NotesService _notesService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestNotes(DbContext);

            _notesService = new NotesService(DbContext);
        }

        [Test]
        public async Task GetNotePagesAndFolders_ShouldReturnAllPagesAndFolders()
        {
            // Act
            var result = await _notesService.GetNotePagesAndFolders();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.NotePages, Is.Not.Empty);
            Assert.That(result.NoteFolders, Is.Not.Empty);
            Assert.That(result.NotePages.Length, Is.EqualTo(3));
            Assert.That(result.NoteFolders.Length, Is.EqualTo(2));
        }

        [Test]
        public async Task GetNotePagesAndFolders_ShouldReturnEmptyArrays_WhenNoData()
        {
            // Arrange
            DbContext.NotePages.RemoveRange(DbContext.NotePages);
            DbContext.NoteFolders.RemoveRange(DbContext.NoteFolders);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _notesService.GetNotePagesAndFolders();

            // Assert
            Assert.That(result.NotePages, Is.Empty);
            Assert.That(result.NoteFolders, Is.Empty);
        }

        [Test]
        public async Task GetNotePagesAndFolders_ShouldIncludeNotePageProperties()
        {
            // Act
            var result = await _notesService.GetNotePagesAndFolders();

            // Assert
            var page = result.NotePages.First();
            Assert.That(page.Id, Is.GreaterThan(0));
            Assert.That(page.Title, Is.Not.Null.And.Not.Empty);
        }

        [Test]
        public async Task GetNotePagesAndFolders_ShouldIncludeFolderProperties()
        {
            // Act
            var result = await _notesService.GetNotePagesAndFolders();

            // Assert
            var folder = result.NoteFolders.First();
            Assert.That(folder.Id, Is.GreaterThan(0));
            Assert.That(folder.FolderName, Is.Not.Null.And.Not.Empty);
            Assert.That(folder.FolderIcon, Is.Not.Null.And.Not.Empty);
        }

        [Test]
        public async Task GetNotePageDetails_ShouldReturnPageDetails()
        {
            // Arrange
            var page = DbContext.NotePages.First();

            // Act
            var result = await _notesService.GetNotePageDetails(page.Id);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.NotePage, Is.Not.Null);
            Assert.That(result.NotePage.Id, Is.EqualTo(page.Id));
            Assert.That(result.NotePage.Title, Is.EqualTo(page.Title));
            Assert.That(result.NotePage.Content, Is.EqualTo(page.Content));
        }

        [Test]
        public async Task GetNotePageDetails_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _notesService.GetNotePageDetails(99999));

            Assert.That(exception!.Message, Does.Contain("Note page with ID 99999 not found"));
        }

        [Test]
        public async Task GetNotePageDetails_ShouldIncludeAllProperties()
        {
            // Arrange
            var page = DbContext.NotePages.First();

            // Act
            var result = await _notesService.GetNotePageDetails(page.Id);

            // Assert
            Assert.That(result.NotePage.Id, Is.GreaterThan(0));
            Assert.That(result.NotePage.Title, Is.Not.Null);
            Assert.That(result.NotePage.Content, Is.Not.Null);
            Assert.That(result.NotePage.CreatedAt, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public async Task CreateNotePage_ShouldAddNewPage()
        {
            // Arrange
            var request = new CreateNotePageRequest
            {
                Title = "New Test Note",
                FolderId = 1
            };

            var initialCount = await DbContext.NotePages.CountAsync();

            // Act
            await _notesService.CreateNotePage(request);

            // Assert
            var finalCount = await DbContext.NotePages.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task CreateNotePage_ShouldSaveWithCorrectData()
        {
            // Arrange
            var request = new CreateNotePageRequest
            {
                Title = "Another New Note",
                FolderId = 2
            };

            // Act
            await _notesService.CreateNotePage(request);

            // Assert
            var page = await DbContext.NotePages
                .FirstOrDefaultAsync(p => p.Title == "Another New Note");

            Assert.That(page, Is.Not.Null);
            Assert.That(page.FolderId, Is.EqualTo(2));
            Assert.That(page.IsFavourite, Is.False);
            Assert.That(page.Content, Is.EqualTo(string.Empty));
        }

        [Test]
        public async Task CreateNotePage_ShouldSetCreatedAtToUtcNow()
        {
            // Arrange
            var beforeCreation = DateTime.UtcNow.AddSeconds(-1);

            var request = new CreateNotePageRequest
            {
                Title = "Timestamp Test Note",
                FolderId = null
            };

            // Act
            await _notesService.CreateNotePage(request);
            var afterCreation = DateTime.UtcNow.AddSeconds(1);

            // Assert
            var page = await DbContext.NotePages
                .FirstOrDefaultAsync(p => p.Title == "Timestamp Test Note");

            Assert.That(page, Is.Not.Null);
            Assert.That(page.CreatedAt, Is.GreaterThan(beforeCreation));
            Assert.That(page.CreatedAt, Is.LessThan(afterCreation));
            Assert.That(page.CreatedAt.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [Test]
        public async Task CreateNotePage_ShouldAllowNullFolderId()
        {
            // Arrange
            var request = new CreateNotePageRequest
            {
                Title = "Unfiled Note",
                FolderId = null
            };

            // Act
            await _notesService.CreateNotePage(request);

            // Assert
            var page = await DbContext.NotePages
                .FirstOrDefaultAsync(p => p.Title == "Unfiled Note");

            Assert.That(page, Is.Not.Null);
            Assert.That(page.FolderId, Is.Null);
        }

        [Test]
        public async Task UpdateNotePageContent_ShouldUpdateContent()
        {
            // Arrange
            var page = DbContext.NotePages.First();
            var request = new UpdateNotePageContentRequest
            {
                NotePageId = page.Id,
                Content = "<p>Updated content</p>"
            };

            // Act
            await _notesService.UpdateNotePageContent(request);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated = await DbContext.NotePages.FindAsync(page.Id);
            Assert.That(updated!.Content, Is.EqualTo("<p>Updated content</p>"));
        }

        [Test]
        public async Task UpdateNotePageContent_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Arrange
            var request = new UpdateNotePageContentRequest
            {
                NotePageId = 99999,
                Content = "New content"
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _notesService.UpdateNotePageContent(request));

            Assert.That(exception!.Message, Does.Contain("Note page with ID 99999 not found"));
        }

        [Test]
        public async Task UpdateNotePageContent_ShouldHandleRichTextContent()
        {
            // Arrange
            var page = DbContext.NotePages.First();
            var richContent = "<h1>Heading</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em></p>";
            var request = new UpdateNotePageContentRequest
            {
                NotePageId = page.Id,
                Content = richContent
            };

            // Act
            await _notesService.UpdateNotePageContent(request);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated = await DbContext.NotePages.FindAsync(page.Id);
            Assert.That(updated!.Content, Is.EqualTo(richContent));
        }

        [Test]
        public async Task ToggleNotePageFavouriteStatus_ShouldToggleFromFalseToTrue()
        {
            // Arrange
            var page = DbContext.NotePages.First(p => !p.IsFavourite);
            var pageId = page.Id;

            // Act
            await _notesService.ToggleNotePageFavouriteStatus(pageId);

            // Assert
            var updated = await DbContext.NotePages.FindAsync(pageId);
            Assert.That(updated!.IsFavourite, Is.True);
        }

        [Test]
        public async Task ToggleNotePageFavouriteStatus_ShouldToggleFromTrueToFalse()
        {
            // Arrange
            var page = DbContext.NotePages.First(p => p.IsFavourite);
            var pageId = page.Id;

            // Act
            await _notesService.ToggleNotePageFavouriteStatus(pageId);

            // Assert
            var updated = await DbContext.NotePages.FindAsync(pageId);
            Assert.That(updated!.IsFavourite, Is.False);
        }

        [Test]
        public async Task ToggleNotePageFavouriteStatus_ShouldToggleBackAndForth()
        {
            // Arrange
            var page = DbContext.NotePages.First();
            var pageId = page.Id;
            var initialStatus = page.IsFavourite;

            // Act
            await _notesService.ToggleNotePageFavouriteStatus(pageId);
            var afterFirstToggle = (await DbContext.NotePages.FindAsync(pageId))!.IsFavourite;

            await _notesService.ToggleNotePageFavouriteStatus(pageId);
            var afterSecondToggle = (await DbContext.NotePages.FindAsync(pageId))!.IsFavourite;

            // Assert
            Assert.That(afterFirstToggle, Is.Not.EqualTo(initialStatus));
            Assert.That(afterSecondToggle, Is.EqualTo(initialStatus));
        }

        [Test]
        public async Task ToggleNotePageFavouriteStatus_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _notesService.ToggleNotePageFavouriteStatus(99999));

            Assert.That(exception!.Message, Does.Contain("Note page with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteNotePage_ShouldRemovePage()
        {
            // Arrange
            var page = DbContext.NotePages.First();
            var pageId = page.Id;
            var initialCount = await DbContext.NotePages.CountAsync();

            // Act
            await _notesService.DeleteNotePage(pageId);

            // Assert
            // because it uses ExecuteDeleteAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var deleted = await DbContext.NotePages.FindAsync(pageId);
            var finalCount = await DbContext.NotePages.CountAsync();

            Assert.That(deleted, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteNotePage_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _notesService.DeleteNotePage(99999));

            Assert.That(exception!.Message, Does.Contain("Note page with ID 99999 not found"));
        }

        [Test]
        public async Task CreateNoteFolder_ShouldAddNewFolder()
        {
            // Arrange
            var request = new CreateNoteFolderRequest
            {
                FolderName = "New Test Folder",
                FolderIcon = "??"
            };

            var initialCount = await DbContext.NoteFolders.CountAsync();

            // Act
            await _notesService.CreateNoteFolder(request);

            // Assert
            var finalCount = await DbContext.NoteFolders.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task CreateNoteFolder_ShouldSaveWithCorrectData()
        {
            // Arrange
            var request = new CreateNoteFolderRequest
            {
                FolderName = "Another Folder",
                FolderIcon = "??"
            };

            // Act
            await _notesService.CreateNoteFolder(request);

            // Assert
            var folder = await DbContext.NoteFolders
                .FirstOrDefaultAsync(f => f.FolderName == "Another Folder");

            Assert.That(folder, Is.Not.Null);
            Assert.That(folder.FolderIcon, Is.EqualTo("??"));
        }

        [Test]
        public async Task DeleteNoteFolder_ShouldRemoveFolder()
        {
            // Arrange
            var folder = DbContext.NoteFolders.First();
            var folderId = folder.Id;
            var initialCount = await DbContext.NoteFolders.CountAsync();

            // Act
            await _notesService.DeleteNoteFolder(folderId);

            // Assert
            // because it uses ExecuteDeleteAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var deleted = await DbContext.NoteFolders.FindAsync(folderId);
            var finalCount = await DbContext.NoteFolders.CountAsync();

            Assert.That(deleted, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteNoteFolder_ShouldSetPagesToNull_WhenFolderHasPages()
        {
            // Arrange
            var folder = DbContext.NoteFolders.First();
            var folderId = folder.Id;

            // Get pages in this folder
            var pagesInFolder = await DbContext.NotePages
                .Where(p => p.FolderId == folderId)
                .ToListAsync();

            Assert.That(pagesInFolder, Is.Not.Empty, "Test requires pages in the folder");

            // Act
            await _notesService.DeleteNoteFolder(folderId);

            // Assert
            // because it uses ExecuteDeleteAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            foreach (var page in pagesInFolder)
            {
                var updatedPage = await DbContext.NotePages.FindAsync(page.Id);
                Assert.That(updatedPage, Is.Not.Null);
                Assert.That(updatedPage!.FolderId, Is.Null);
            }
        }

        [Test]
        public async Task DeleteNoteFolder_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _notesService.DeleteNoteFolder(99999));

            Assert.That(exception!.Message, Does.Contain("Note folder with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteNoteFolder_ShouldNotDeletePages_OnlyUnlinkThem()
        {
            // Arrange
            var folder = DbContext.NoteFolders.First();
            var folderId = folder.Id;
            var initialPageCount = await DbContext.NotePages.CountAsync();

            // Act
            await _notesService.DeleteNoteFolder(folderId);

            // Assert
            var finalPageCount = await DbContext.NotePages.CountAsync();
            Assert.That(finalPageCount, Is.EqualTo(initialPageCount));
        }

        [Test]
        public async Task CreateAndUpdateNotePage_ShouldWorkTogether()
        {
            // Arrange - Create a new page
            var createRequest = new CreateNotePageRequest
            {
                Title = "Integration Test Page",
                FolderId = 1
            };

            await _notesService.CreateNotePage(createRequest);
            var page = await DbContext.NotePages
                .FirstAsync(p => p.Title == "Integration Test Page");

            // Act - Update the content
            var updateRequest = new UpdateNotePageContentRequest
            {
                NotePageId = page.Id,
                Content = "<p>Updated via integration test</p>"
            };

            await _notesService.UpdateNotePageContent(updateRequest);

            // Assert
            var details = await _notesService.GetNotePageDetails(page.Id);
            Assert.That(details.NotePage.Content, Is.EqualTo("<p>Updated via integration test</p>"));
        }

        [Test]
        public async Task CreateFolderAndAddPages_ShouldWorkTogether()
        {
            // Arrange - Create a folder
            var folderRequest = new CreateNoteFolderRequest
            {
                FolderName = "Integration Folder",
                FolderIcon = "??"
            };

            await _notesService.CreateNoteFolder(folderRequest);
            var folder = await DbContext.NoteFolders
                .FirstAsync(f => f.FolderName == "Integration Folder");

            // Act - Create pages in the folder
            var pageRequest = new CreateNotePageRequest
            {
                Title = "Page in Integration Folder",
                FolderId = folder.Id
            };

            await _notesService.CreateNotePage(pageRequest);

            // Assert
            var result = await _notesService.GetNotePagesAndFolders();
            Assert.That(result.NoteFolders.Any(f => f.FolderName == "Integration Folder"), Is.True);
            Assert.That(result.NotePages.Any(p => p.FolderId == folder.Id), Is.True);
        }
    }
}
