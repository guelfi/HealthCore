using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HealthCore.Api.Infrastructure.Data.Migrations
{
    [DbContext(typeof(HealthCoreDbContext))]
    [Migration("20261014060000_AddUserDisplayName")]
    public class AddUserDisplayName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayName", table: "Users", type: "TEXT",
                maxLength: 120, nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "DisplayName", table: "Users");
        }
    }
}
