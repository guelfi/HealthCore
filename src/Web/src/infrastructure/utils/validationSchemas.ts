import { z } from 'zod';

// Função para validação de CPF
function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = soma % 11;
  const primeiroDigito = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf[9]) !== primeiroDigito) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = soma % 11;
  const segundoDigito = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(cpf[10]) === segundoDigito;
}

// Schema de validação para login
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username é obrigatório')
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(50, 'Username deve ter no máximo 50 caracteres'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

// Schema de validação para paciente
export const pacienteSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  documento: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos')
    .refine(validateCPF, 'CPF inválido'),
  dataNascimento: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine(date => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return birthDate <= today && age >= 0 && age <= 150;
    }, 'Data de nascimento deve ser válida e a idade entre 0 e 150 anos'),
  contato: z
    .string()
    .optional()
    .refine(val => {
      if (!val || val.trim() === '') return true;
      const cleanContact = val.replace(/[^\d]/g, '');
      return cleanContact.length >= 10 && cleanContact.length <= 11;
    }, {
      message: 'Contato deve ter 10 ou 11 dígitos',
    }),
});

// Schema de validação para exame
export const exameSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório').uuid('Paciente deve ser um UUID válido'),
  modalidade: z.enum(
    ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'],
    {
      message: 'Modalidade DICOM inválida',
    }
  ),
  descricao: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 500, {
      message: 'Descrição deve ter no máximo 500 caracteres',
    }),
});

// Schema de validação para usuário
export const userSchema = z.object({
  username: z
    .string()
    .min(1, 'Username é obrigatório')
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(50, 'Username deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username deve conter apenas letras, números e os caracteres . _ -'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/(?=.*[a-z])/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/(?=.*[A-Z])/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/(?=.*\d)/, 'Senha deve conter pelo menos um número')
    .regex(/(?=.*[@$!%*?&])/, 'Senha deve conter pelo menos um caractere especial (@$!%*?&)'),
  role: z.enum(['Administrador', 'Medico'], {
    message: 'Perfil inválido',
  }),
});

// Tipos TypeScript derivados dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type PacienteFormData = z.infer<typeof pacienteSchema>;
export type ExameFormData = z.infer<typeof exameSchema>;
export type UserFormData = z.infer<typeof userSchema>;

// Exportar função de validação de CPF para uso externo
export { validateCPF };
