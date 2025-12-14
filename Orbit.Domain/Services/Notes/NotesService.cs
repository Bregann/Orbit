using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Notes;
using Orbit.Domain.Interfaces.Api.Notes;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Notes
{
    public class NotesService(AppDbContext context) : INoteService
    {
        public async Task<GetNotePagesAndFoldersDto> GetNotePagesAndFolders()
        {
            var notePages = await context.NotePages
                .Select(np => new NotePageItem
                {
                    Id = np.Id,
                    Title = np.Title,
                    IsFavourite = np.IsFavourite,
                    FolderId = np.FolderId
                })
                .ToArrayAsync();

            var noteFolders = await context.NoteFolders
                .Select(nf => new NoteFolderItem
                {
                    Id = nf.Id,
                    FolderName = nf.FolderName,
                    FolderIcon = nf.FolderIcon
                })
                .ToArrayAsync();

            return new GetNotePagesAndFoldersDto
            {
                NotePages = notePages,
                NoteFolders = noteFolders
            };
        }

        public async Task<GetNotePageDetailsDto> GetNotePageDetails(int notePageId)
        {
            var notePage = await context.NotePages
                .Where(np => np.Id == notePageId)
                .Select(np => new NotePageDetails
                {
                    Id = np.Id,
                    Title = np.Title,
                    Content = np.Content,
                    CreatedAt = np.CreatedAt,
                    IsFavourite = np.IsFavourite,
                    FolderId = np.FolderId
                })
                .FirstOrDefaultAsync();

            if (notePage == null)
            {
                throw new KeyNotFoundException($"Note page with ID {notePageId} not found.");
            }

            return new GetNotePageDetailsDto
            {
                NotePage = notePage
            };
        }

        public async Task CreateNotePage(CreateNotePageRequest request)
        {
            var newNotePage = new NotePage
            {
                Title = request.Title,
                CreatedAt = DateTime.UtcNow,
                FolderId = request.FolderId,
                Content = string.Empty,
                IsFavourite = false
            };

            await context.NotePages.AddAsync(newNotePage);
            await context.SaveChangesAsync();
        }

        public async Task UpdateNotePageContent(UpdateNotePageContentRequest request)
        {
            var rowsAffected = await context.NotePages
                .Where(np => np.Id == request.NotePageId)
                .ExecuteUpdateAsync(update => update
                    .SetProperty(np => np.Content, request.Content)
                );
            if (rowsAffected == 0)
            {
                throw new KeyNotFoundException($"Note page with ID {request.NotePageId} not found.");
            }
        }

        public async Task ToggleNotePageFavouriteStatus(int notePageId)
        {
            var notePage = await context.NotePages
                .FirstOrDefaultAsync(np => np.Id == notePageId) ?? throw new KeyNotFoundException($"Note page with ID {notePageId} not found.");

            notePage.IsFavourite = !notePage.IsFavourite;
            await context.SaveChangesAsync();
        }

        public async Task DeleteNotePage(int notePageId)
        {
            var rowsAffected = await context.NotePages
                .Where(np => np.Id == notePageId)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                throw new KeyNotFoundException($"Note page with ID {notePageId} not found.");
            }
        }

        public async Task CreateNoteFolder(CreateNoteFolderRequest request)
        {
            var newNoteFolder = new NoteFolder
            {
                FolderName = request.FolderName,
                FolderIcon = request.FolderIcon
            };
            await context.NoteFolders.AddAsync(newNoteFolder);
            await context.SaveChangesAsync();
        }

        public async Task DeleteNoteFolder(int noteFolderId)
        {
            // set any note pages in this folder to have no folder
            await context.NotePages.Where(np => np.FolderId == noteFolderId)
                .ExecuteUpdateAsync(update => update
                    .SetProperty(np => np.FolderId, (int?)null)
                );

            var rowsAffected = await context.NoteFolders
                .Where(nf => nf.Id == noteFolderId)
                .ExecuteDeleteAsync();
            if (rowsAffected == 0)
            {
                throw new KeyNotFoundException($"Note folder with ID {noteFolderId} not found.");
            }
        }
    }
}
