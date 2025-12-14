using Orbit.Domain.DTOs.Notes;

namespace Orbit.Domain.Interfaces.Api.Notes
{
    public interface INoteService
    {
        Task CreateNoteFolder(CreateNoteFolderRequest request);
        Task CreateNotePage(CreateNotePageRequest request);
        Task DeleteNoteFolder(int noteFolderId);
        Task DeleteNotePage(int notePageId);
        Task<GetNotePageDetailsDto> GetNotePageDetails(int notePageId);
        Task<GetNotePagesAndFoldersDto> GetNotePagesAndFolders();
        Task ToggleNotePageFavouriteStatus(int notePageId);
        Task UpdateNotePageContent(UpdateNotePageContentRequest request);
    }
}
