using Orbit.Domain.DTOs.Documents;

namespace Orbit.Domain.Interfaces.Api.Documents
{
    public interface IDocumentsService
    {
        Task AddDocumentCategory(string categoryName);
        Task DeleteCategory(int categoryId);
        Task DeleteDocument(int documentId);
        Task<byte[]> DownloadDocument(int documentId);
        Task<GetAllDocumentCategoriesDto> GetAllDocumentCategories();
        Task<GetAllDocumentsDto> GetAllDocuments();
        Task UploadDocument(UploadDocumentRequest request, Stream documentStream);
    }
}
