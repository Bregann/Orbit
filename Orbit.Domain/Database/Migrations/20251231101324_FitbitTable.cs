using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Orbit.Domain.Database.Migrations
{
    /// <inheritdoc />
    public partial class FitbitTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FitbitAccessToken",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FitbitRefreshToken",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "FitbitTokenExpiresAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FitbitUserId",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "FitbitData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StepsWalked = table.Column<int>(type: "integer", nullable: false),
                    DistanceWalkedMiles = table.Column<double>(type: "double precision", nullable: false),
                    DateRecorded = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FitbitData", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FitbitData");

            migrationBuilder.DropColumn(
                name: "FitbitAccessToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FitbitRefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FitbitTokenExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FitbitUserId",
                table: "Users");
        }
    }
}
