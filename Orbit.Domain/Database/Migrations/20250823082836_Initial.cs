using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using System;

#nullable disable

namespace Orbit.Domain.Database.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EnvironmentalSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnvironmentalSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HistoricData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateAdded = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MonthlyIncome = table.Column<decimal>(type: "numeric", nullable: false),
                    AmountSaved = table.Column<decimal>(type: "numeric", nullable: false),
                    AmountSpent = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SavingsPots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PotName = table.Column<string>(type: "text", nullable: false),
                    PotAmount = table.Column<long>(type: "bigint", nullable: false),
                    AmountToAdd = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavingsPots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpendingPots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PotName = table.Column<string>(type: "text", nullable: false),
                    AmountToAdd = table.Column<long>(type: "bigint", nullable: false),
                    PotAmountSpent = table.Column<long>(type: "bigint", nullable: false),
                    PotAmountLeft = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpendingPots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    MonzoAccessToken = table.Column<string>(type: "text", nullable: false),
                    MonzoRefreshToken = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HistoricSavingsPotData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PotId = table.Column<int>(type: "integer", nullable: false),
                    PotAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    AmountSaved = table.Column<decimal>(type: "numeric", nullable: false),
                    HistoricMonthlyDataId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricSavingsPotData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricSavingsPotData_HistoricData_HistoricMonthlyDataId",
                        column: x => x.HistoricMonthlyDataId,
                        principalTable: "HistoricData",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistoricSavingsPotData_SavingsPots_PotId",
                        column: x => x.PotId,
                        principalTable: "SavingsPots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AutomaticTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MerchantName = table.Column<string>(type: "text", nullable: false),
                    PotId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutomaticTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AutomaticTransactions_SpendingPots_PotId",
                        column: x => x.PotId,
                        principalTable: "SpendingPots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoricSpendingPotData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PotId = table.Column<int>(type: "integer", nullable: false),
                    PotAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    PotAmountSpent = table.Column<decimal>(type: "numeric", nullable: false),
                    PotAmountLeft = table.Column<decimal>(type: "numeric", nullable: false),
                    HistoricMonthlyDataId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricSpendingPotData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricSpendingPotData_HistoricData_HistoricMonthlyDataId",
                        column: x => x.HistoricMonthlyDataId,
                        principalTable: "HistoricData",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistoricSpendingPotData_SpendingPots_PotId",
                        column: x => x.PotId,
                        principalTable: "SpendingPots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Processed = table.Column<bool>(type: "boolean", nullable: false),
                    ImgUrl = table.Column<string>(type: "text", nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MerchantName = table.Column<string>(type: "text", nullable: false),
                    TransactionAmount = table.Column<long>(type: "bigint", nullable: false),
                    PotId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_SpendingPots_PotId",
                        column: x => x.PotId,
                        principalTable: "SpendingPots",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserRefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AutomaticTransactions_PotId",
                table: "AutomaticTransactions",
                column: "PotId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricSavingsPotData_HistoricMonthlyDataId",
                table: "HistoricSavingsPotData",
                column: "HistoricMonthlyDataId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricSavingsPotData_PotId",
                table: "HistoricSavingsPotData",
                column: "PotId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricSpendingPotData_HistoricMonthlyDataId",
                table: "HistoricSpendingPotData",
                column: "HistoricMonthlyDataId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricSpendingPotData_PotId",
                table: "HistoricSpendingPotData",
                column: "PotId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_PotId",
                table: "Transactions",
                column: "PotId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRefreshTokens_UserId",
                table: "UserRefreshTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AutomaticTransactions");

            migrationBuilder.DropTable(
                name: "EnvironmentalSettings");

            migrationBuilder.DropTable(
                name: "HistoricSavingsPotData");

            migrationBuilder.DropTable(
                name: "HistoricSpendingPotData");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "UserRefreshTokens");

            migrationBuilder.DropTable(
                name: "SavingsPots");

            migrationBuilder.DropTable(
                name: "HistoricData");

            migrationBuilder.DropTable(
                name: "SpendingPots");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
