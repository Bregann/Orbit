namespace Orbit.Domain.DTOs.Documents
{
    public class GetAllDocumentCategoriesDto
    {
        public required DocumentCategoryItem[] Categories { get; set; }
    }

    public class DocumentCategoryItem
    {
        public required int Id { get; set; }
        public required string CategoryName { get; set; }
    }
}
