using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileMed.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicoIdToPacientesNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MedicoId",
                table: "Pacientes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_MedicoId",
                table: "Pacientes",
                column: "MedicoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_Medicos_MedicoId",
                table: "Pacientes",
                column: "MedicoId",
                principalTable: "Medicos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Medicos_MedicoId",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_MedicoId",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "MedicoId",
                table: "Pacientes");
        }
    }
}
