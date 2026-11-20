import {
  createHabitSchema,
  updateHabitSchema,
} from '../validators/habitValidator';

describe('Validação de hábitos', () => {
  it('deve aceitar um hábito válido', () => {
    const result = createHabitSchema.safeParse({
      title: 'Beber água',
      description: 'Manter a hidratação',
      frequency: 'diario',
      category: 'saude',
    });

    expect(result.success).toBe(true);
  });

  it('não deve aceitar título vazio', () => {
    const result = createHabitSchema.safeParse({
      title: '',
      frequency: 'diario',
      category: 'saude',
    });

    expect(result.success).toBe(false);
  });

  it('não deve aceitar frequência inválida', () => {
    const result = createHabitSchema.safeParse({
      title: 'Fazer caminhada',
      frequency: 'mensal',
      category: 'exercicio',
    });

    expect(result.success).toBe(false);
  });

  it('não deve aceitar categoria inválida', () => {
    const result = createHabitSchema.safeParse({
      title: 'Ler um livro',
      frequency: 'diario',
      category: 'estudo',
    });

    expect(result.success).toBe(false);
  });

  it('deve aceitar atualização parcial', () => {
    const result = updateHabitSchema.safeParse({
      title: 'Beber mais água',
    });

    expect(result.success).toBe(true);
  });

  it('não deve aceitar atualização vazia', () => {
    const result = updateHabitSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});