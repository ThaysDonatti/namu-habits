import { Request, Response } from 'express';
import * as checkinService from '../services/checkinService';
import { createCheckinSchema } from '../validators/checkinValidator';
import { UniqueConstraintError } from 'sequelize';

export const create = async (req: Request, res: Response) => {
  try {
    const habitId = Number(req.params.habitId);

    const validation = createCheckinSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const checkin = await checkinService.createCheckin(
      habitId,
      validation.data
    );

    if (!checkin) {
      return res.status(404).json({
        message: 'Hábito não encontrado.',
      });
    }

    return res.status(201).json(checkin);
  } catch (error) {
    if (
        error instanceof UniqueConstraintError ||
        (
        error instanceof Error &&
        error.message === 'Este hábito já possui um check-in nesta data.'
        )
    ) {
        return res.status(409).json({
        message: 'Este hábito já possui um check-in nesta data.',
        });
    }

    console.error('ERRO AO CADASTRAR CHECK-IN:', error);

    return res.status(500).json({
        message: 'Erro ao cadastrar check-in.',
    });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const habitId = Number(req.params.habitId);

    const checkins = await checkinService.getHabitCheckins(habitId);

    return res.status(200).json(checkins);
  } catch (error) {
    console.error('ERRO AO BUSCAR CHECK-INS:', error);

    return res.status(500).json({
      message: 'Erro ao buscar check-ins.',
    });
  }
};