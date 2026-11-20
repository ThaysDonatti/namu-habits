import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';

export const show = async (req: Request, res: Response) => {
  try {
    const dashboard = await dashboardService.getDashboard();

    return res.status(200).json(dashboard);
  } catch (error) {
    console.error('ERRO AO BUSCAR DASHBOARD:', error);

    return res.status(500).json({
      message: 'Erro ao buscar dashboard.',
    });
  }
};