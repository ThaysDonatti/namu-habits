import { Checkin } from '../models/Checkin';
import { Habit } from '../models/Habit';

interface CheckinData {
  date: string;
  notes?: string | null;
}

export const createCheckin = async (
  habitId: number,
  data: CheckinData
) => {
  const habit = await Habit.findByPk(habitId);

  if (!habit) {
    return null;
  }

  const existingCheckin = await Checkin.findOne({
    where: {
      habitId,
      date: data.date,
    },
  });

  if (existingCheckin) {
    throw new Error('Este hábito já possui um check-in nesta data.');
  }

  return await Checkin.create({
    habitId,
    date: data.date,
    notes: data.notes ?? null,
  });
};

export const getHabitCheckins = async (habitId: number) => {
  return await Checkin.findAll({
    where: {
      habitId,
    },
    order: [['date', 'DESC']],
  });
};