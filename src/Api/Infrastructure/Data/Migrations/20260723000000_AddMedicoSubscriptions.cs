using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthCore.Api.Infrastructure.Data.Migrations
{
    [Migration("20260723000000_AddMedicoSubscriptions")]
    public partial class AddMedicoSubscriptions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MedicoSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    MedicoId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BillingCycle = table.Column<int>(type: "INTEGER", nullable: false),
                    PaymentMethod = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    MonthlyAmount = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false, defaultValue: 49m),
                    AnnualAmount = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false, defaultValue: 490m),
                    TrialStartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TrialEndsAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastPaymentAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    NextDueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    SuspendedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReactivatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicoSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicoSubscriptions_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicoSubscriptions_MedicoId",
                table: "MedicoSubscriptions",
                column: "MedicoId",
                unique: true);

            migrationBuilder.Sql(@"
                INSERT INTO MedicoSubscriptions (
                    Id,
                    MedicoId,
                    BillingCycle,
                    PaymentMethod,
                    Status,
                    MonthlyAmount,
                    AnnualAmount,
                    TrialStartedAt,
                    TrialEndsAt,
                    Notes,
                    CreatedAt,
                    UpdatedAt
                )
                SELECT
                    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
                    Id,
                    1,
                    1,
                    1,
                    '49.0',
                    '490.0',
                    datetime('now'),
                    datetime('now', '+30 days'),
                    'Teste gratuito criado automaticamente para medico existente.',
                    datetime('now'),
                    datetime('now')
                FROM Medicos
                WHERE NOT EXISTS (
                    SELECT 1 FROM MedicoSubscriptions WHERE MedicoSubscriptions.MedicoId = Medicos.Id
                );
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicoSubscriptions");
        }
    }
}