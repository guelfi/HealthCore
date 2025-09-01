using System;

// Script temporário para gerar hash BCrypt da senha "@246!588"
// Execute este código para obter o hash que será usado no SQL

class Program
{
    static void Main()
    {
        string senha = "@246!588";
        string hash = BCrypt.Net.BCrypt.HashPassword(senha);
        
        Console.WriteLine("=== GERADOR DE HASH BCRYPT ===");
        Console.WriteLine($"Senha: {senha}");
        Console.WriteLine($"Hash BCrypt: {hash}");
        Console.WriteLine();
        Console.WriteLine("=== COMANDO SQL PARA EXECUTAR ===");
        Console.WriteLine($"UPDATE Users SET PasswordHash = '{hash}' WHERE Role = 2;");
        Console.WriteLine();
        Console.WriteLine("=== VERIFICAÇÃO ===");
        Console.WriteLine($"Verificação: {BCrypt.Net.BCrypt.Verify(senha, hash)}");
    }
}