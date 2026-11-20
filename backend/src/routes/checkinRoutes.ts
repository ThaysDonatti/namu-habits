import { Router } from 'express';
import * as checkinController from '../controllers/checkinController';
import { validateId } from '../middlewares/validateId';

const router = Router();

router.post(
  '/:habitId/checkins',
  validateId('habitId'),
  checkinController.create
);

router.get(
  '/:habitId/checkins',
  validateId('habitId'),
  checkinController.list
);

export default router;