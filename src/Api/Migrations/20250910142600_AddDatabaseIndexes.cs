using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileMed.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDatabaseIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Índices para otimizar consultas de pacientes
            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_Documento",
                table: "Pacientes",
                column: "Documento",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_Nome",
                table: "Pacientes",
                column: "Nome");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_DataCriacao",
                table: "Pacientes",
                column: "DataCriacao");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_MedicoId",
                table: "Pacientes",
                column: "MedicoId");

            // Índices para otimizar consultas de exames
            migrationBuilder.CreateIndex(
                name: "IX_Exames_IdempotencyKey",
                table: "Exames",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Exames_PacienteId",
                table: "Exames",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Exames_DataCriacao",
                table: "Exames",
                column: "DataCriacao");

            migrationBuilder.CreateIndex(
                name: "IX_Exames_Modalidade",
                table: "Exames",
                column: "Modalidade");

            migrationBuilder.CreateIndex(
                name: "IX_Exames_Modalidade_DataCriacao",
                table: "Exames",
                columns: new[] { "Modalidade", "DataCriacao" });

            // Índices para usuários e autenticação
            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role_IsActive",
                table: "Users",
                columns: new[] { "Role", "IsActive" });

            // Índices para médicos
            migrationBuilder.CreateIndex(
                name: "IX_Medicos_Documento",
                table: "Medicos",
                column: "Documento",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_CRM",
                table: "Medicos",
                column: "CRM",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_UserId",
                table: "Medicos",
                column: "UserId",
                unique: true);

            // Índices para tokens (se existir tabela)
            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_ExpiresAt",
                table: "RefreshTokens",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_BlacklistedTokens_TokenId",
                table: "BlacklistedTokens",
                column: "TokenId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlacklistedTokens_ExpiresAt",
                table: "BlacklistedTokens",
                column: "ExpiresAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remover índices na ordem inversa
            migrationBuilder.DropIndex(name: "IX_BlacklistedTokens_ExpiresAt", table: "BlacklistedTokens");
            migrationBuilder.DropIndex(name: "IX_BlacklistedTokens_TokenId", table: "BlacklistedTokens");
            migrationBuilder.DropIndex(name: "IX_RefreshTokens_ExpiresAt", table: "RefreshTokens");
            migrationBuilder.DropIndex(name: "IX_RefreshTokens_UserId", table: "RefreshTokens");
            migrationBuilder.DropIndex(name: "IX_Medicos_UserId", table: "Medicos");
            migrationBuilder.DropIndex(name: "IX_Medicos_CRM", table: "Medicos");
            migrationBuilder.DropIndex(name: "IX_Medicos_Documento", table: "Medicos");
            migrationBuilder.DropIndex(name: "IX_Users_Role_IsActive", table: "Users");
            migrationBuilder.DropIndex(name: "IX_Users_Username", table: "Users");
            migrationBuilder.DropIndex(name: "IX_Exames_Modalidade_DataCriacao", table: "Exames");
            migrationBuilder.DropIndex(name: "IX_Exames_Modalidade", table: "Exames");
            migrationBuilder.DropIndex(name: "IX_Exames_DataCriacao", table: "Exames");
            migrationBuilder.DropIndex(name: "IX_Exames_PacienteId", table: "Exames");
            migrationBuilder.DropIndex(name: "IX_Exames_IdempotencyKey", table: "Exames");
            migrationBuilder.DropIndex(name: "IX_Pacientes_MedicoId", table: "Pacientes");
            migrationBuilder.DropIndex(name: "IX_Pacientes_DataCriacao", table: "Pacientes");
            migrationBuilder.DropIndex(name: "IX_Pacientes_Nome", table: "Pacientes");
            migrationBuilder.DropIndex(name: "IX_Pacientes_Documento", table: "Pacientes");
        }
    }
}
