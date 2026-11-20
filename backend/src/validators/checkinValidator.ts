import { z } from 'zod';

export const createCheckinSchema = z.object({
  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'A data deve estar no formato AAAA-MM-DD.'
    )
    .refine((value) => {
      const [year, month, day] = value.split('-').map(Number);

      const date = new Date(Date.UTC(year, month - 1, day));

      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    }, 'A data informada não é válida.'),

  notes: z
    .string()
    .trim()
    .max(500, 'A observação deve ter no máximo 500 caracteres.')
    .nullable()
    .optional(),
});