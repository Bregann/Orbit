using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class Asset
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string AssetName { get; set; }

        public string? Brand { get; set; }

        public string? Model { get; set; }

        public string? SerialNumber { get; set; }

        [Required]
        public DateTime PurchaseDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PurchasePrice { get; set; }

        public string? Location { get; set; }

        public DateTime? WarrantyExpirationDate { get; set; }

        public string? Notes { get; set; }

        [Required]
        public required string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastUpdatedAt { get; set; }

        /// <summary>
        /// Path to the receipt/invoice document
        /// </summary>
        public string? ReceiptPath { get; set; }

        /// <summary>
        /// Path to the manual/documentation
        /// </summary>
        public string? ManualPath { get; set; }

        public required int AssetCategoryId { get; set; }

        [ForeignKey(nameof(AssetCategoryId))]
        public virtual AssetCategory AssetCategory { get; set; } = null!;
    }
}
