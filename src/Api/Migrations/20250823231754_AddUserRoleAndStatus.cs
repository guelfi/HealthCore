using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileMed.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleAndStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Adicionar colunas com valores padrão compatíveis com SQLite
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 2); // UserRole.Medico = 2

            migrationBuilder.AddColumn<string>(
                name: "CreatedAt",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "2025-08-23T23:18:00.000Z");

            // Atualizar registros existentes com data atual
            migrationBuilder.Sql("UPDATE Users SET CreatedAt = datetime('now') WHERE CreatedAt = '2025-08-23T23:18:00.000Z'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }
    }
}
