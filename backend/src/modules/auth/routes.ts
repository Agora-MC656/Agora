import { Router } from 'express';
import { handleRegister } from './controller';

const router = Router();

router.post('/register', handleRegister);

export default router;