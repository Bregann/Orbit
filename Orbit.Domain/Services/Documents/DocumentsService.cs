using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Documents;
using Orbit.Domain.Interfaces.Api.Documents;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Documents
{
    public class DocumentsService(AppDbContext context) : IDocumentsService
    {
        public async Task<GetAllDocumentsDto> GetAllDocuments()
        {
            return new GetAllDocumentsDto
            {
                Documents = await context.Documents.Select(d => new DocumentItem
                {
                    DocumentId = d.Id,
                    CategoryId = d.DocumentCategoryId,
                    DocumentName = d.DocumentName,
                    DocumentType = d.DocumentType,
                    UploadedAt = d.UploadedAt
                }).ToArrayAsync()
            };
        }

        public async Task UploadDocument(UploadDocumentRequest request, Stream documentStream, string fileExtension)
        {
            // add to database
            var document = new Document
            {
                DocumentName = request.DocumentName,
                DocumentPath = Path.Combine("DocumentsStorage", request.DocumentName),
                DocumentType = request.DocumentType,
                UploadedAt = DateTime.UtcNow,
                DocumentCategoryId = request.CategoryId
            };

            await context.Documents.AddAsync(document);
            await context.SaveChangesAsync();

            // save the document to storage
            var currentPath = Directory.GetCurrentDirectory();
            var documentPath = Path.Combine(currentPath, "DocumentsStorage", request.DocumentName + fileExtension);

            using (var fileStream = new FileStream(documentPath, FileMode.Create, FileAccess.Write))
            {
                await documentStream.CopyToAsync(fileStream);
            }

            Log.Information($"Document {request.DocumentName} uploaded successfully to {documentPath}");
        }

        public async Task<byte[]> DownloadDocument(int documentId)
        {
            var document = await context.Documents.FindAsync(documentId) ?? throw new KeyNotFoundException("Document not found");

            var currentPath = Directory.GetCurrentDirectory();
            var documentPath = Path.Combine(currentPath, document.DocumentPath);

            if (!File.Exists(documentPath))
            {
                throw new FileNotFoundException("Document file not found in storage");
            }

            return await File.ReadAllBytesAsync(documentPath);
        }

        public async Task DeleteDocument(int documentId)
        {
            var document = await context.Documents.FindAsync(documentId);

            if (document == null)
            {
                throw new KeyNotFoundException("Document not found");
            }

            // delete from database
            context.Documents.Remove(document);
            await context.SaveChangesAsync();

            // delete from storage
            var currentPath = Directory.GetCurrentDirectory();
            var documentPath = Path.Combine(currentPath, document.DocumentPath);

            if (File.Exists(documentPath))
            {
                File.Delete(documentPath);
                Log.Information($"Document {document.DocumentName} deleted successfully from {documentPath}");
            }
            else
            {
                Log.Warning($"Document file {documentPath} not found during deletion");
            }
        }

        public async Task AddDocumentCategory(string categoryName)
        {
            var category = new DocumentCategory
            {
                CategoryName = categoryName
            };

            await context.DocumentCategories.AddAsync(category);
            await context.SaveChangesAsync();

            Log.Information($"Document category {categoryName} added successfully");
        }

        public async Task<GetAllDocumentCategoriesDto> GetAllDocumentCategories()
        {
            var categories = await context.DocumentCategories
                .Select(c => new DocumentCategoryItem
                {
                    Id = c.Id,
                    CategoryName = c.CategoryName
                })
                .ToArrayAsync();

            return new GetAllDocumentCategoriesDto
            {
                Categories = categories
            };
        }

        public async Task DeleteCategory(int categoryId)
        {
            var category = await context.DocumentCategories.FindAsync(categoryId);
            if (category == null)
            {
                throw new KeyNotFoundException("Document category not found");
            }

            // check if any documents are associated with this category,  if so, prevent deletion
            var hasAssociatedDocuments = await context.Documents.AnyAsync(d => d.DocumentCategoryId == categoryId);

            if (hasAssociatedDocuments)
            {
                throw new InvalidOperationException("Cannot delete category with associated documents");
            }

            context.DocumentCategories.Remove(category);
            await context.SaveChangesAsync();

            Log.Information($"Document category {category.CategoryName} deleted successfully");
        }
    }
}
