
import React, { useEffect, useState } from 'react';

import {
  getHabits,
  createCheckin,
  getHabitCheckins,
  createHabit,
  updateHabit,
  deleteHabit,
  getDashboard,
  Habit,
  NewHabit,
} from './src/services/api';

import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

type HabitWithStatus = Habit & { completed: boolean };

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getCategoryLabel = (category: Habit['category']) => {
  const categories = {
    saude: 'Saúde',
    exercicio: 'Exercício',
    alimentacao: 'Alimentação',
    mental: 'Mental',
  };

  return categories[category];
};

export default function App() {
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'diario' | 'semanal'>('diario');
  const [category, setCategory] = useState<NewHabit['category']>('saude');

  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [detailCheckins, setDetailCheckins] = useState<string[]>([]);
  const [detailStreak, setDetailStreak] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  // Carregar hábitos e check-ins
  useEffect(() => {
    async function loadHabits() {
      try {
        setLoading(true);
        setError('');

        const data = await getHabits();

        const habitsWithStatus = await Promise.all(
          data.map(async (habit) => {
            const checkins = await getHabitCheckins(habit.id);
            const todayDate = getDateKey(new Date());

            const completedToday = checkins.some(
              (checkin) => checkin.date.slice(0, 10) === todayDate
            );

            return {
              ...habit,
              completed: completedToday,
            };
          })
        );

        setHabits(habitsWithStatus);
      } catch (err) {
        setError('Não foi possível carregar seus hábitos.');
      } finally {
        setLoading(false);
      }
    }

    loadHabits();
  }, []);

  const completedHabits = habits.filter(
    (habit) => habit.completed
  ).length;

  // Dados do calendário do mês atual
  const currentMonth = new Date();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = [
    ...Array(firstDayOfMonth.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const monthName = currentMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  // Registrar check-in
  const toggleHabit = async (id: number) => {
    const habit = habits.find((item) => item.id === id);

    if (!habit || habit.completed) {
      return;
    }

    try {
      await createCheckin(id);

      setHabits((currentHabits) =>
        currentHabits.map((item) =>
          item.id === id
            ? { ...item, completed: true }
            : item
        )
      );
    } catch (error) {
      Alert.alert(
        'Atenção',
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o hábito.'
      );
    }
  };

  // Abrir detalhes do hábito
  const openHabitDetails = async (habit: HabitWithStatus) => {
    setSelectedHabitId(habit.id);
    setDetailLoading(true);
    setDetailCheckins([]);
    setDetailStreak(0);

    try {
      const [checkins, dashboard] = await Promise.all([
        getHabitCheckins(habit.id),
        getDashboard(),
      ]);

      setDetailCheckins(
        checkins.map((checkin) => checkin.date.slice(0, 10))
      );

      const dashboardHabit = dashboard.habits.find(
        (item) => item.id === habit.id
      );

      setDetailStreak(dashboardHabit?.streak ?? 0);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes do hábito.'
      );
      setSelectedHabitId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Abrir formulário para novo hábito
  const openCreateForm = () => {
    setSelectedHabitId(null);
    setEditingHabitId(null);
    setTitle('');
    setDescription('');
    setFrequency('diario');
    setCategory('saude');
    setShowForm(true);
  };

  // Abrir formulário para editar hábito
  const openEditForm = (habit: HabitWithStatus) => {
    setSelectedHabitId(null);
    setEditingHabitId(habit.id);
    setTitle(habit.title);
    setDescription(habit.description ?? '');
    setFrequency(habit.frequency);
    setCategory(habit.category);
    setShowForm(true);
  };

  // Salvar novo hábito ou atualizar existente
  const handleSaveHabit = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'Informe o nome do hábito.');
      return;
    }

    const habitData: NewHabit = {
      title: title.trim(),
      description: description.trim(),
      frequency,
      category,
    };

    try {
      setSaving(true);

      if (editingHabitId !== null) {
        const updatedHabit = await updateHabit(
          editingHabitId,
          habitData
        );

        setHabits((currentHabits) =>
          currentHabits.map((habit) =>
            habit.id === editingHabitId
              ? { ...updatedHabit, completed: habit.completed }
              : habit
          )
        );

        Alert.alert('Sucesso', 'Hábito atualizado!');
      } else {
        const createdHabit = await createHabit(habitData);

        setHabits((currentHabits) => [
          ...currentHabits,
          {
            ...createdHabit,
            completed: false,
          },
        ]);

        Alert.alert('Sucesso', 'Hábito cadastrado!');
      }

      closeForm();
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o hábito.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Excluir hábito
  const handleDeleteHabit = (habit: HabitWithStatus) => {
    Alert.alert(
      'Excluir hábito',
      `Deseja realmente excluir "${habit.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit.id);

              setHabits((currentHabits) =>
                currentHabits.filter(
                  (item) => item.id !== habit.id
                )
              );

              Alert.alert('Sucesso', 'Hábito excluído.');
            } catch (error) {
              Alert.alert(
                'Erro',
                error instanceof Error
                  ? error.message
                  : 'Não foi possível excluir o hábito.'
              );
            }
          },
        },
      ]
    );
  };

  // Abrir opções do hábito
  const showHabitOptions = (habit: HabitWithStatus) => {
    Alert.alert(
      habit.title,
      'O que deseja fazer?',
      [
        {
          text: 'Editar',
          onPress: () => openEditForm(habit),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDeleteHabit(habit),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Fechar formulário
  const closeForm = () => {
    setShowForm(false);
    setEditingHabitId(null);
    setTitle('');
    setDescription('');
    setFrequency('diario');
    setCategory('saude');
  };

  const selectedHabit = habits.find(
    (habit) => habit.id === selectedHabitId
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {selectedHabitId !== null ? (
          // TELA DE DETALHES
          selectedHabit ? (
            <View style={styles.formContainer}>
              <TouchableOpacity
                onPress={() => setSelectedHabitId(null)}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>‹ Voltar</Text>
              </TouchableOpacity>

              <Text style={styles.logo}>namu.</Text>

              <Text style={styles.detailTitle}>
                {selectedHabit.title}
              </Text>

              <Text style={styles.detailDescription}>
                {selectedHabit.description ||
                  'Nenhuma descrição cadastrada.'}
              </Text>

              <View style={styles.detailInfo}>
                <Text style={styles.detailInfoText}>
                  Frequência:{' '}
                  {selectedHabit.frequency === 'diario'
                    ? 'Diária'
                    : 'Semanal'}
                </Text>

                <Text style={styles.detailInfoText}>
                  Categoria:{' '}
                  {getCategoryLabel(selectedHabit.category)}
                </Text>
              </View>

              <View style={styles.streakCard}>
                <Text style={styles.streakNumber}>
                  🔥 {detailStreak} dias
                </Text>
                <Text style={styles.streakLabel}>
                  Sequência atual
                </Text>
              </View>

              <Text style={styles.calendarTitle}>
                Seu progresso
              </Text>

              <Text style={styles.monthName}>
                {monthName}
              </Text>

              {detailLoading ? (
                <Text style={styles.counter}>
                  Carregando calendário...
                </Text>
              ) : (
                <View style={styles.calendar}>
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(
                    (day, index) => (
                      <Text
                        key={index}
                        style={styles.weekDay}
                      >
                        {day}
                      </Text>
                    )
                  )}

                  {calendarDays.map((day, index) => {
                    const dateKey = day
                      ? getDateKey(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day
                          )
                        )
                      : '';

                    const completed =
                      detailCheckins.includes(dateKey);

                    return (
                      <View
                        key={index}
                        style={[
                          styles.calendarDay,
                          completed &&
                            styles.calendarDayCompleted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            completed &&
                              styles.calendarDayTextCompleted,
                          ]}
                        >
                          {day ?? ''}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View style={styles.legendGreen} />
                  <Text style={styles.legendText}>
                    Concluído
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendGray} />
                  <Text style={styles.legendText}>
                    Sem check-in
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        ) : showForm ? (
          // FORMULÁRIO
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.logo}>namu.</Text>
              <Text style={styles.profile}>○</Text>
            </View>

            <Text style={styles.formTitle}>
              {editingHabitId !== null
                ? 'Editar hábito'
                : 'Novo hábito'}
            </Text>

            <Text style={styles.formSubtitle}>
              {editingHabitId !== null
                ? 'Atualize os dados do seu hábito.'
                : 'Adicione um pequeno passo à sua rotina.'}
            </Text>

            <Text style={styles.inputLabel}>
              Nome do hábito
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex.: Beber água"
              placeholderTextColor="#929991"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>
              Descrição
            </Text>

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Descreva seu objetivo"
              placeholderTextColor="#929991"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.inputLabel}>
              Frequência
            </Text>

            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  frequency === 'diario' &&
                    styles.optionSelected,
                ]}
                onPress={() => setFrequency('diario')}
              >
                <Text
                  style={[
                    styles.optionText,
                    frequency === 'diario' &&
                      styles.optionTextSelected,
                  ]}
                >
                  Diário
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  frequency === 'semanal' &&
                    styles.optionSelected,
                ]}
                onPress={() => setFrequency('semanal')}
              >
                <Text
                  style={[
                    styles.optionText,
                    frequency === 'semanal' &&
                      styles.optionTextSelected,
                  ]}
                >
                  Semanal
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>
              Categoria
            </Text>

            <View style={styles.categoryContainer}>
              {([
                ['saude', 'Saúde'],
                ['exercicio', 'Exercício'],
                ['alimentacao', 'Alimentação'],
                ['mental', 'Mental'],
              ] as const).map(([value, label]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.categoryButton,
                    category === value &&
                      styles.optionSelected,
                  ]}
                  onPress={() => setCategory(value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      category === value &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={handleSaveHabit}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving
                  ? 'Salvando...'
                  : editingHabitId !== null
                    ? 'Salvar alterações'
                    : 'Salvar hábito'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeForm}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // TELA INICIAL
          <>
            <View style={styles.header}>
              <Text style={styles.logo}>namu.</Text>
              <Text style={styles.profile}>○</Text>
            </View>

            <Text style={styles.date}>
              {new Date()
                .toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
                .toUpperCase()}
            </Text>

            <Text style={styles.greeting}>
              Bom dia! ☀️
            </Text>

            <Text style={styles.subtitle}>
              Pequenos passos, grandes mudanças.
            </Text>

            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  Seus hábitos
                </Text>
                <Text style={styles.summaryValue}>
                  {habits.length}
                </Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  Hábitos de hoje
                </Text>
                <Text style={styles.summaryValue}>
                  {completedHabits} de {habits.length}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Hábitos de hoje
              </Text>

              <Text style={styles.counter}>
                {completedHabits}/{habits.length} concluídos
              </Text>
            </View>

            {loading ? (
              <Text style={styles.counter}>
                Carregando hábitos...
              </Text>
            ) : error ? (
              <Text style={styles.counter}>
                {error}
              </Text>
            ) : habits.length === 0 ? (
              <Text style={styles.emptyMessage}>
                Você ainda não cadastrou hábitos.
              </Text>
            ) : (
              habits.map((habit) => (
                <View
                  key={habit.id}
                  style={styles.habitCard}
                >
                  <TouchableOpacity
                    style={[
                      styles.check,
                      habit.completed &&
                        styles.checkCompleted,
                    ]}
                    onPress={() => toggleHabit(habit.id)}
                    disabled={habit.completed}
                  >
                    {habit.completed && (
                      <Text style={styles.checkText}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.habitInfo}
                    onPress={() => openHabitDetails(habit)}
                  >
                    <Text style={styles.habitTitle}>
                      {habit.title}
                    </Text>

                    <Text style={styles.habitFrequency}>
                      {habit.frequency === 'diario'
                        ? 'Diário'
                        : 'Semanal'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => showHabitOptions(habit)}
                    style={styles.moreButton}
                  >
                    <Text style={styles.more}>···</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.allHabitsButton}
              onPress={openCreateForm}
            >
              <Text style={styles.allHabitsText}>
                Adicionar novo hábito +
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomMenu}>
        <Text style={styles.activeTab}>
          ⌂ {'\n'}Início
        </Text>

        <Text style={styles.tab}>
          ☷ {'\n'}Hábitos
        </Text>

        <TouchableOpacity
          onPress={openCreateForm}
          style={styles.addButtonContainer}
        >
          <Text style={styles.addButton}>＋</Text>
        </TouchableOpacity>

        <Text style={styles.tab}>
          ▥ {'\n'}Progresso
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF9',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 15,
    marginBottom: 30,
  },

  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },

  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: '#315D43',
  },

  profile: {
    fontSize: 30,
    color: '#315D43',
  },

  date: {
    fontSize: 11,
    color: '#929991',
    marginHorizontal: 24,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  greeting: {
    fontSize: 30,
    fontWeight: '700',
    color: '#202720',
    marginHorizontal: 24,
  },

  subtitle: {
    fontSize: 15,
    color: '#777F78',
    marginHorizontal: 24,
    marginTop: 7,
  },

  summary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDE8',
    borderRadius: 16,
    margin: 24,
    padding: 20,
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#818981',
  },

  summaryValue: {
    fontSize: 23,
    fontWeight: '700',
    color: '#315D43',
    marginTop: 5,
  },

  separator: {
    width: 1,
    height: 42,
    backgroundColor: '#E9EDE8',
    marginHorizontal: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#202720',
  },

  counter: {
    fontSize: 12,
    color: '#818981',
    marginHorizontal: 24,
    marginBottom: 15,
  },

  emptyMessage: {
    fontSize: 14,
    color: '#777F78',
    marginHorizontal: 24,
    marginVertical: 20,
  },

  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDE8',
    borderRadius: 14,
    marginHorizontal: 24,
    marginBottom: 10,
    padding: 16,
  },

  check: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#B9C2B9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkCompleted: {
    backgroundColor: '#64896C',
    borderColor: '#64896C',
  },

  checkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  habitInfo: {
    flex: 1,
    marginLeft: 13,
  },

  habitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#252D26',
  },

  habitFrequency: {
    fontSize: 12,
    color: '#858D85',
    marginTop: 4,
  },

  moreButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  more: {
    fontSize: 22,
    color: '#606A61',
  },

  allHabitsButton: {
    backgroundColor: '#64896C',
    borderRadius: 30,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 15,
    marginBottom: 25,
    alignItems: 'center',
  },

  allHabitsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  bottomMenu: {
    height: 72,
    borderTopWidth: 1,
    borderTopColor: '#E9EDE8',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  activeTab: {
    textAlign: 'center',
    color: '#315D43',
    fontSize: 12,
    fontWeight: '700',
  },

  tab: {
    textAlign: 'center',
    color: '#858D85',
    fontSize: 12,
  },

  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 45,
  },

  addButton: {
    fontSize: 32,
    color: '#315D43',
  },

  // Formulário
  formContainer: {
    marginHorizontal: 24,
    marginTop: 15,
    marginBottom: 30,
  },

  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#202720',
  },

  formSubtitle: {
    fontSize: 14,
    color: '#777F78',
    marginTop: 6,
    marginBottom: 25,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#39443B',
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDE8',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#252D26',
  },

  descriptionInput: {
    height: 90,
    textAlignVertical: 'top',
  },

  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  optionButton: {
    flex: 1,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E9EDE8',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  optionSelected: {
    backgroundColor: '#E8F0E8',
    borderColor: '#64896C',
  },

  optionText: {
    fontSize: 13,
    color: '#777F78',
  },

  optionTextSelected: {
    color: '#315D43',
    fontWeight: '700',
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E9EDE8',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: '#64896C',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  cancelButton: {
    alignItems: 'center',
    padding: 14,
    marginTop: 5,
  },

  cancelButtonText: {
    color: '#777F78',
    fontSize: 14,
  },

  // Detalhes do hábito
  backButton: {
    marginBottom: 20,
    paddingVertical: 8,
  },

  backButtonText: {
    fontSize: 16,
    color: '#315D43',
    fontWeight: '600',
  },

  detailTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#202720',
    marginTop: 25,
  },

  detailDescription: {
    fontSize: 14,
    color: '#777F78',
    marginTop: 8,
    lineHeight: 21,
  },

  detailInfo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDE8',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },

  detailInfoText: {
    fontSize: 14,
    color: '#39443B',
  },

  streakCard: {
    backgroundColor: '#E8F0E8',
    borderRadius: 16,
    padding: 20,
    marginTop: 18,
    alignItems: 'center',
  },

  streakNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#315D43',
  },

  streakLabel: {
    fontSize: 13,
    color: '#64896C',
    marginTop: 5,
  },

  calendarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202720',
    marginTop: 30,
  },

  monthName: {
    fontSize: 15,
    color: '#777F78',
    marginTop: 8,
    marginBottom: 18,
    textTransform: 'capitalize',
  },

  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9EDE8',
    padding: 10,
  },

  weekDay: {
    width: '14.2857%',
    textAlign: 'center',
    color: '#818981',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 10,
  },

  calendarDay: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: '#F0F2EF',
    marginVertical: 3,
  },

  calendarDayCompleted: {
    backgroundColor: '#64896C',
  },

  calendarDayText: {
    color: '#606A61',
    fontSize: 13,
  },

  calendarDayTextCompleted: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 25,
    marginTop: 20,
    marginBottom: 20,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  legendGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#64896C',
  },

  legendGray: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F0F2EF',
    borderWidth: 1,
    borderColor: '#D8DED7',
  },

  legendText: {
    fontSize: 12,
    color: '#777F78',
  },
});
