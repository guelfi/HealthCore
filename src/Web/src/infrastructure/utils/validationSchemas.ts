import { z } from 'zod';

// Schema de validação para login
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username é obrigatório')
    .min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema de validação para paciente
export const pacienteSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  documento: z
    .string()
    .min(1, 'Documento é obrigatório')
    .regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  dataNascimento: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Data de nascimento não pode ser futura'),
  contato: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: 'Contato deve ter pelo menos 10 caracteres',
    }),
});

// Schema de validação para exame
export const exameSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  modalidade: z.enum(['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'], {
    message: 'Modalidade DICOM inválida',
  }),
});

// Tipos TypeScript derivados dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type PacienteFormData = z.infer<typeof pacienteSchema>;
export type ExameFormData = z.infer<typeof exameSchema>;