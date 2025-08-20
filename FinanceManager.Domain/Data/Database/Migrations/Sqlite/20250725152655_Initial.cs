using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace FinanceManager.Domain.Data.Database.Migrations.Sqlite
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
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Key = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnvironmentalSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HistoricData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MonthlyIncome = table.Column<decimal>(type: "TEXT", nullable: false),
                    AmountSaved = table.Column<decimal>(type: "TEXT", nullable: false),
                    AmountSpent = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PotName = table.Column<string>(type: "TEXT", nullable: false),
                    PotAmount = table.Column<long>(type: "INTEGER", nullable: false),
                    AmountToAdd = table.Column<long>(type: "INTEGER", nullable: false),
                    PotAmountSpent = table.Column<long>(type: "INTEGER", nullable: false),
                    PotAmountLeft = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    MonzoAccessToken = table.Column<string>(type: "TEXT", nullable: false),
                    MonzoRefreshToken = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AutomaticTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MerchantName = table.Column<string>(type: "TEXT", nullable: false),
                    PotId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutomaticTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AutomaticTransactions_Pots_PotId",
                        column: x => x.PotId,
                        principalTable: "Pots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoricPotData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PotId = table.Column<int>(type: "INTEGER", nullable: false),
                    PotAmount = table.Column<decimal>(type: "TEXT", nullable: false),
                    PotAmountSpent = table.Column<decimal>(type: "TEXT", nullable: false),
                    PotAmountLeft = table.Column<decimal>(type: "TEXT", nullable: false),
                    HistoricMonthlyDataId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricPotData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricPotData_HistoricData_HistoricMonthlyDataId",
                        column: x => x.HistoricMonthlyDataId,
                        principalTable: "HistoricData",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistoricPotData_Pots_PotId",
                        column: x => x.PotId,
                        principalTable: "Pots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Processed = table.Column<bool>(type: "INTEGER", nullable: false),
                    ImgUrl = table.Column<string>(type: "TEXT", nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MerchantName = table.Column<string>(type: "TEXT", nullable: false),
                    TransactionAmount = table.Column<long>(type: "INTEGER", nullable: false),
                    PotId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Pots_PotId",
                        column: x => x.PotId,
                        principalTable: "Pots",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserRefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Token = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsRevoked = table.Column<bool>(type: "INTEGER", nullable: false)
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
                name: "IX_HistoricPotData_HistoricMonthlyDataId",
                table: "HistoricPotData",
                column: "HistoricMonthlyDataId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricPotData_PotId",
                table: "HistoricPotData",
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
                name: "HistoricPotData");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "UserRefreshTokens");

            migrationBuilder.DropTable(
                name: "HistoricData");

            migrationBuilder.DropTable(
                name: "Pots");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
