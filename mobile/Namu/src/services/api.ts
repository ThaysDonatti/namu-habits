
const API_URL = 'http://10.0.2.2:3333';

export interface Habit {
  id: number;
  title: string;
  description: string | null;
  frequency: 'diario' | 'semanal';
  category: 'saude' | 'exercicio' | 'alimentacao' | 'mental';
  createdAt: string;
}

export const getHabits = async (): Promise<Habit[]> => {
  const response = await fetch(`${API_URL}/habits`);

  if (!response.ok) {
    throw new Error('Não foi possível carregar os hábitos.');
  }

  return response.json();
};

export const createCheckin = async (habitId: number): Promise<void> => {
  const today = new Date();
  const date = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const response = await fetch(`${API_URL}/habits/${habitId}/checkins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date,
      notes: '',
    }),
  });

  if (response.status === 409) {
    throw new Error('Este hábito já foi concluído hoje.');
  }

  if (!response.ok) {
    throw new Error('Não foi possível registrar o hábito.');
  }
};

export const getHabitCheckins = async (habitId: number) => {
  const response = await fetch(
    `${API_URL}/habits/${habitId}/checkins`
  );

  if (!response.ok) {
    throw new Error('Não foi possível carregar os check-ins.');
  }

  return response.json() as Promise<
    { id: number; habitId: number; date: string; notes: string | null }[]
  >;
};

export interface NewHabit {
  title: string;
  description: string;
  frequency: 'diario' | 'semanal';
  category: 'saude' | 'exercicio' | 'alimentacao' | 'mental';
}

export const createHabit = async (habit: NewHabit): Promise<Habit> => {
  const response = await fetch(`${API_URL}/habits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habit),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Não foi possível cadastrar o hábito.');
  }

  return response.json();
};

export const updateHabit = async (
  id: number,
  habit: NewHabit
): Promise<Habit> => {
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habit),
  });

  if (!response.ok) {
    throw new Error('Não foi possível atualizar o hábito.');
  }

  return response.json();
};

export const deleteHabit = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/habits/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Não foi possível excluir o hábito.');
  }
};

export interface DashboardHabit {
  id: number;
  title: string;
  frequency: 'diario' | 'semanal';
  category: 'saude' | 'exercicio' | 'alimentacao' | 'mental';
  streak: number;
}

export const getDashboard = async (): Promise<{
  totalHabits: number;
  habits: DashboardHabit[];
}> => {
  const response = await fetch(`${API_URL}/habits/dashboard`);

  if (!response.ok) {
    throw new Error('Não foi possível carregar o dashboard.');
  }

  return response.json();
};