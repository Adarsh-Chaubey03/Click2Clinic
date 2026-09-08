import mongoose, { Schema } from 'mongoose';

const orderSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
  medData: {
    type: Object,
    required: true,
  },
  mg: {
    type: Number,
    default: 0,
  },
  ml: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderPlaced: {
    type: Boolean,
    default: false,
  },
  orderDelivered: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: Boolean,
    default: false,
  },
  orderDate: {
    type: String,
    default: "00-00-0000",
  },
  paymentId: {
    type: String, // Store Razorpay payment_id (e.g., "pay_XXXXXXXXXXXXXX")
    default: null,
  },
  refunded: {
    type: Boolean, // Track refund status
    default: false,
  },
  refundedAt: {
    type: Date, // Timestamp of refund
    default: null,
  },
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;