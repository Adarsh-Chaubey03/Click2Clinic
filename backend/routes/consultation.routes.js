import express from 'express'
import { initiateConsultation,joinConsultation } from '../controllers/consultation.controller.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.middlewares.js';
   const consultationRouter = express.Router();
   consultationRouter.post('/initiate', authDoctor,initiateConsultation);
   consultationRouter.get('/join/:roomId', authUser,joinConsultation);

export default consultationRouter; 