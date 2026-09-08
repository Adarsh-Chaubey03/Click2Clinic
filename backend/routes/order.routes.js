import express from 'express';
import { cancelAdminOrder, completeOrder, getAllOrders } from '../controllers/order.controller.js';

const orderRouter = express.Router();

orderRouter.get("/all-order", getAllOrders);
orderRouter.post("/cancel-order", cancelAdminOrder);
orderRouter.post("/complete-order", completeOrder);

export default orderRouter;