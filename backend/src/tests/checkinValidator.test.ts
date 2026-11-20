import { createCheckinSchema } from '../validators/checkinValidator';

describe('Validação de check-ins', () => {
  it('deve aceitar uma data válida', () => {
    const result = createCheckinSchema.safeParse({
      date: '2026-11-20',
      notes: 'Realizei meu hábito',
    });

    expect(result.success).toBe(true);
  });

  it('não deve aceitar data inexistente', () => {
    const result = createCheckinSchema.safeParse({
      date: '2026-02-30',
    });

    expect(result.success).toBe(false);
  });

  it('não deve aceitar formato incorreto', () => {
    const result = createCheckinSchema.safeParse({
      date: '20/11/2026',
    });

    expect(result.success).toBe(false);
  });

  it('deve aceitar observação opcional', () => {
    const result = createCheckinSchema.safeParse({
      date: '2026-11-20',
    });

    expect(result.success).toBe(true);
  });
});