using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace MobileMed.Api.Core.Application.Validations
{
    public class CpfValidationAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return false;

            var cpf = value.ToString()!.Replace(".", "").Replace("-", "").Trim();
            
            return IsValidCpf(cpf);
        }

        private static bool IsValidCpf(string cpf)
        {
            // Remove caracteres não numéricos
            cpf = Regex.Replace(cpf, @"[^\d]", "");

            // Verifica se tem 11 dígitos
            if (cpf.Length != 11)
                return false;

            // Verifica se todos os dígitos são iguais
            if (cpf.All(c => c == cpf[0]))
                return false;

            // Validação do primeiro dígito verificador
            var soma = 0;
            for (int i = 0; i < 9; i++)
                soma += int.Parse(cpf[i].ToString()) * (10 - i);

            var resto = soma % 11;
            var primeiroDigito = resto < 2 ? 0 : 11 - resto;

            if (int.Parse(cpf[9].ToString()) != primeiroDigito)
                return false;

            // Validação do segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++)
                soma += int.Parse(cpf[i].ToString()) * (11 - i);

            resto = soma % 11;
            var segundoDigito = resto < 2 ? 0 : 11 - resto;

            return int.Parse(cpf[10].ToString()) == segundoDigito;
        }

        public override string FormatErrorMessage(string name)
        {
            return ErrorMessage ?? $"O campo {name} deve conter um CPF válido.";
        }
    }
}
