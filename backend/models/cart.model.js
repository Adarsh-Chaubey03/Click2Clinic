import mongoose, { Schema } from 'mongoose';

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      medicineId: {
        type: Schema.Types.ObjectId,
        ref: 'medicine',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      priceAtPurchase: {
        type: Number,
        required: true,
      },
      cancelled: {
        type: Boolean,
        default: false,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  this.totalPrice = this.items
    .filter(item => !item.cancelled) // Exclude cancelled items from total
    .reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
  next();
});

const cartModel = mongoose.models.cart || mongoose.model('cart', cartSchema);

export default cartModel;