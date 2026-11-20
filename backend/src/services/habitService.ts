
import { Habit } from '../models/Habit';

interface HabitData {
  title: string;
  description?: string | null;
  frequency: 'diario' | 'semanal';
  category: 'saude' | 'exercicio' | 'alimentacao' | 'mental';
}

export const createHabit = async (data: HabitData) => {
  return await Habit.create(data);
};

export const getHabits = async () => {
  return await Habit.findAll({
    order: [['created_at', 'DESC']],
  });
};

export const getHabitById = async (id: number) => {
  return await Habit.findByPk(id);
};

export const updateHabit = async (
  id: number,
  data: Partial<HabitData>
) => {
  const habit = await Habit.findByPk(id);

  if (!habit) {
    return null;
  }

  await habit.update(data);

  return habit;
};

export const deleteHabit = async (id: number) => {
  const habit = await Habit.findByPk(id);

  if (!habit) {
    return false;
  }

  await habit.destroy();

  return true;
};
