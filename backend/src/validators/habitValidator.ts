import { z } from 'zod';

export const createHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório.')
    .max(100, 'O título deve ter no máximo 100 caracteres.'),

  description: z
    .string()
    .trim()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .nullable()
    .optional(),

  frequency: z.enum(['diario', 'semanal'], {
    error: 'A frequência deve ser diario ou semanal.',
  }),

  category: z.enum(
    ['saude', 'exercicio', 'alimentacao', 'mental'],
    {
      error: 'A categoria informada é inválida.',
    }
  ),
});

export const updateHabitSchema = createHabitSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Informe pelo menos um campo para atualizar.'
  );