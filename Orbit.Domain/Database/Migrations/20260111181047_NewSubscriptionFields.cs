using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Orbit.Domain.Database.Migrations
{
    /// <inheritdoc />
    public partial class NewSubscriptionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AutomaticTransactions_SpendingPots_PotId",
                table: "AutomaticTransactions");

            migrationBuilder.AddColumn<bool>(
                name: "IsSubscriptionPayment",
                table: "Transactions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "PotId",
                table: "AutomaticTransactions",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<bool>(
                name: "IsSubscription",
                table: "AutomaticTransactions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_AutomaticTransactions_SpendingPots_PotId",
                table: "AutomaticTransactions",
                column: "PotId",
                principalTable: "SpendingPots",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AutomaticTransactions_SpendingPots_PotId",
                table: "AutomaticTransactions");

            migrationBuilder.DropColumn(
                name: "IsSubscriptionPayment",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "IsSubscription",
                table: "AutomaticTransactions");

            migrationBuilder.AlterColumn<int>(
                name: "PotId",
                table: "AutomaticTransactions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AutomaticTransactions_SpendingPots_PotId",
                table: "AutomaticTransactions",
                column: "PotId",
                principalTable: "SpendingPots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
