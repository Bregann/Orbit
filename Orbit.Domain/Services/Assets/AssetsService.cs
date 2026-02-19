using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Assets;
using Orbit.Domain.Interfaces.Api.Assets;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Assets
{
    public class AssetsService(AppDbContext context) : IAssetsService
    {
        public async Task<GetAllAssetsDto> GetAllAssets()
        {
            return new GetAllAssetsDto
            {
                Assets = await context.Assets
                    .Select(a => new AssetItem
                    {
                        AssetId = a.Id,
                        AssetName = a.AssetName,
                        Brand = a.Brand,
                        Model = a.Model,
                        SerialNumber = a.SerialNumber,
                        PurchaseDate = a.PurchaseDate,
                        PurchasePrice = a.PurchasePrice,
                        Location = a.Location,
                        WarrantyExpirationDate = a.WarrantyExpirationDate,
                        Notes = a.Notes,
                        Status = a.Status,
                        CategoryId = a.AssetCategoryId,
                        CategoryName = a.AssetCategory.CategoryName,
                        HasReceipt = !string.IsNullOrEmpty(a.ReceiptPath),
                        HasManual = !string.IsNullOrEmpty(a.ManualPath),
                        CreatedAt = a.CreatedAt,
                        LastUpdatedAt = a.LastUpdatedAt
                    })
                    .OrderByDescending(a => a.CreatedAt)
                    .ToArrayAsync()
            };
        }

        public async Task<int> CreateAsset(CreateAssetRequest request)
        {
            var asset = new Asset
            {
                AssetName = request.AssetName,
                Brand = request.Brand,
                Model = request.Model,
                SerialNumber = request.SerialNumber,
                PurchaseDate = request.PurchaseDate,
                PurchasePrice = request.PurchasePrice,
                Location = request.Location,
                WarrantyExpirationDate = request.WarrantyExpirationDate,
                Notes = request.Notes,
                Status = request.Status,
                AssetCategoryId = request.CategoryId,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };

            await context.Assets.AddAsync(asset);
            await context.SaveChangesAsync();

            return asset.Id;
        }

        public async Task UpdateAsset(UpdateAssetRequest request)
        {
            var asset = await context.Assets.FirstOrDefaultAsync(a => a.Id == request.AssetId);

            if (asset == null)
            {
                throw new KeyNotFoundException($"Asset with ID {request.AssetId} not found");
            }

            asset.AssetName = request.AssetName;
            asset.Brand = request.Brand;
            asset.Model = request.Model;
            asset.SerialNumber = request.SerialNumber;
            asset.PurchaseDate = request.PurchaseDate;
            asset.PurchasePrice = request.PurchasePrice;
            asset.Location = request.Location;
            asset.WarrantyExpirationDate = request.WarrantyExpirationDate;
            asset.Notes = request.Notes;
            asset.Status = request.Status;
            asset.AssetCategoryId = request.CategoryId;
            asset.LastUpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
        }

        public async Task DeleteAsset(int assetId)
        {
            var asset = await context.Assets.FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null)
            {
                throw new KeyNotFoundException($"Asset with ID {assetId} not found");
            }

            // Delete associated files
            if (!string.IsNullOrEmpty(asset.ReceiptPath))
            {
                var receiptPath = Path.Combine(Directory.GetCurrentDirectory(), asset.ReceiptPath);
                if (File.Exists(receiptPath))
                {
                    File.Delete(receiptPath);
                }
            }

            if (!string.IsNullOrEmpty(asset.ManualPath))
            {
                var manualPath = Path.Combine(Directory.GetCurrentDirectory(), asset.ManualPath);
                if (File.Exists(manualPath))
                {
                    File.Delete(manualPath);
                }
            }

            context.Assets.Remove(asset);
            await context.SaveChangesAsync();
        }

        public async Task<GetAllAssetCategoriesDto> GetAllAssetCategories()
        {
            return new GetAllAssetCategoriesDto
            {
                Categories = await context.AssetCategories
                    .Select(c => new AssetCategoryItem
                    {
                        CategoryId = c.Id,
                        CategoryName = c.CategoryName,
                        Description = c.Description,
                        AssetCount = c.Assets.Count
                    })
                    .OrderBy(c => c.CategoryName)
                    .ToArrayAsync()
            };
        }

        public async Task AddAssetCategory(AddAssetCategoryRequest request)
        {
            var category = new AssetCategory
            {
                CategoryName = request.CategoryName,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            await context.AssetCategories.AddAsync(category);
            await context.SaveChangesAsync();
        }

        public async Task DeleteAssetCategory(int categoryId)
        {
            var category = await context.AssetCategories
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
            {
                throw new KeyNotFoundException($"Category with ID {categoryId} not found");
            }

            if (category.Assets.Any())
            {
                throw new InvalidOperationException("Cannot delete category that has assets. Please reassign or delete the assets first.");
            }

            context.AssetCategories.Remove(category);
            await context.SaveChangesAsync();
        }

        public async Task UploadAssetDocument(UploadAssetDocumentRequest request, Stream documentStream, string fileExtension)
        {
            var asset = await context.Assets.FirstOrDefaultAsync(a => a.Id == request.AssetId);

            if (asset == null)
            {
                throw new KeyNotFoundException($"Asset with ID {request.AssetId} not found");
            }

            // Create AssetsStorage directory if it doesn't exist
            var storagePath = Path.Combine(Directory.GetCurrentDirectory(), "AssetsStorage");
            if (!Directory.Exists(storagePath))
            {
                Directory.CreateDirectory(storagePath);
            }

            // Generate filename
            var fileName = $"{asset.Id}-{request.DocumentType}{fileExtension}";
            var relativePath = Path.Combine("AssetsStorage", fileName);
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), relativePath);

            // Delete old file if exists
            if (request.DocumentType == "Receipt" && !string.IsNullOrEmpty(asset.ReceiptPath))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), asset.ReceiptPath);
                if (File.Exists(oldPath))
                {
                    File.Delete(oldPath);
                }
            }
            else if (request.DocumentType == "Manual" && !string.IsNullOrEmpty(asset.ManualPath))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), asset.ManualPath);
                if (File.Exists(oldPath))
                {
                    File.Delete(oldPath);
                }
            }

            // Save the new file
            using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
            {
                await documentStream.CopyToAsync(fileStream);
            }

            // Update the asset record
            if (request.DocumentType == "Receipt")
            {
                asset.ReceiptPath = relativePath;
            }
            else if (request.DocumentType == "Manual")
            {
                asset.ManualPath = relativePath;
            }

            asset.LastUpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            Log.Information($"Uploaded {request.DocumentType} for asset {asset.AssetName} to {relativePath}");
        }

        public async Task<(byte[] fileBytes, string fileName)> DownloadAssetDocument(int assetId, string documentType)
        {
            var asset = await context.Assets.FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null)
            {
                throw new KeyNotFoundException($"Asset with ID {assetId} not found");
            }

            string? documentPath = documentType == "Receipt" ? asset.ReceiptPath : asset.ManualPath;

            if (string.IsNullOrEmpty(documentPath))
            {
                throw new InvalidOperationException($"{documentType} not found for this asset");
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), documentPath);

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"{documentType} file not found at {fullPath}");
            }

            var fileBytes = await File.ReadAllBytesAsync(fullPath);
            var fileName = Path.GetFileName(documentPath);

            return (fileBytes, fileName);
        }

        public async Task DeleteAssetDocument(int assetId, string documentType)
        {
            var asset = await context.Assets.FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null)
            {
                throw new KeyNotFoundException($"Asset with ID {assetId} not found");
            }

            string? documentPath = documentType == "Receipt" ? asset.ReceiptPath : asset.ManualPath;

            if (!string.IsNullOrEmpty(documentPath))
            {
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), documentPath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }

            if (documentType == "Receipt")
            {
                asset.ReceiptPath = null;
            }
            else if (documentType == "Manual")
            {
                asset.ManualPath = null;
            }

            asset.LastUpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
        }
    }
}
