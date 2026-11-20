import { Router } from 'express';
import * as habitController from '../controllers/habitController';
import * as dashboardController from '../controllers/dashboardController';
import { validateId } from '../middlewares/validateId';

const router = Router();

router.post('/', habitController.create);
router.get('/', habitController.list);

router.get('/dashboard', dashboardController.show);

router.get('/:id', validateId('id'), habitController.show);
router.put('/:id', validateId('id'), habitController.update);
router.delete('/:id', validateId('id'), habitController.remove);

export default router;