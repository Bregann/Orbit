using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Orbit.Domain.Database.Migrations
{
    /// <inheritdoc />
    public partial class EventDocumentFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DocumentId",
                table: "CalendarEvents",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_DocumentId",
                table: "CalendarEvents",
                column: "DocumentId");

            migrationBuilder.AddForeignKey(
                name: "FK_CalendarEvents_Documents_DocumentId",
                table: "CalendarEvents",
                column: "DocumentId",
                principalTable: "Documents",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CalendarEvents_Documents_DocumentId",
                table: "CalendarEvents");

            migrationBuilder.DropIndex(
                name: "IX_CalendarEvents_DocumentId",
                table: "CalendarEvents");

            migrationBuilder.DropColumn(
                name: "DocumentId",
                table: "CalendarEvents");
        }
    }
}
