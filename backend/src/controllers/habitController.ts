
import { Request, Response } from 'express';
import * as habitService from '../services/habitService';

import {
  createHabitSchema,
  updateHabitSchema,
} from '../validators/habitValidator';

export const create = async (req: Request, res: Response) => {
  try {
    const validation = createHabitSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const habit = await habitService.createHabit(validation.data);

    return res.status(201).json(habit);
  } catch (error) {
    console.error('ERRO AO CADASTRAR HÁBITO:', error);

    return res.status(500).json({
      message: 'Erro ao cadastrar hábito.',
    });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const habits = await habitService.getHabits();

    return res.status(200).json(habits);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar hábitos.',
    });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const habit = await habitService.getHabitById(id);

    if (!habit) {
      return res.status(404).json({
        message: 'Hábito não encontrado.',
      });
    }

    return res.status(200).json(habit);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar hábito.',
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validation = updateHabitSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const id = Number(req.params.id);
    const habit = await habitService.updateHabit(id, validation.data);

    if (!habit) {
      return res.status(404).json({
        message: 'Hábito não encontrado.',
      });
    }

    return res.status(200).json(habit);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR HÁBITO:', error);

    return res.status(500).json({
      message: 'Erro ao atualizar hábito.',
    });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await habitService.deleteHabit(id);

    if (!deleted) {
      return res.status(404).json({
        message: 'Hábito não encontrado.',
      });
    }

    return res.status(200).json({
      message: 'Hábito excluído com sucesso.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao excluir hábito.',
    });
  }
};
