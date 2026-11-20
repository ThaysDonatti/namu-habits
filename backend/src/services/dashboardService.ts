import { Habit } from '../models/Habit';
import { Checkin } from '../models/Checkin';

export const getDashboard = async () => {
  const habits = await Habit.findAll({
    order: [['createdAt', 'DESC']],
  });

  const dashboardHabits = await Promise.all(
    habits.map(async (habit) => {
      const checkins = await Checkin.findAll({
        where: {
          habitId: habit.id,
        },
        order: [['date', 'DESC']],
      });

      const dates = checkins.map((checkin) => checkin.date);

      let streak = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayString = today.toLocaleDateString('en-CA');

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayString = yesterday.toLocaleDateString('en-CA');

      let currentDate = dates.includes(todayString)
        ? new Date(today)
        : dates.includes(yesterdayString)
          ? new Date(yesterday)
          : null;

      while (currentDate) {
        const dateString = currentDate.toLocaleDateString('en-CA');

        if (!dates.includes(dateString)) {
          break;
        }

        streak++;

        currentDate.setDate(currentDate.getDate() - 1);
      }

      return {
        id: habit.id,
        title: habit.title,
        frequency: habit.frequency,
        category: habit.category,
        streak,
      };
    })
  );

  return {
    totalHabits: habits.length,
    habits: dashboardHabits,
  };
};