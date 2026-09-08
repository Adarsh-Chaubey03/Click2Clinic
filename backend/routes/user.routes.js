import express from 'express';
import upload from '../middleware/multer.middleware.js';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  generateResponse,
  chatbotResponse,
  verifyLab,
  generateAndSavePrescription,
  getUserId,
  analyzeSkinImage,
  wakeAiServer,
  getLabData,
  bookLabAppointment,
  getUserAppointment,
  paymentLabRazorpay,
  verifyLabRazorpay,
  cancelLabAppointment,
  addToCart,
  getCartData,
  cancelCart,
  submitSkinReview,
  paymentSkinReviewRazorpay,
  verifySkinReviewRazorpay,
  getUserSkinReviews,
} from '../controllers/user.controller.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.middlewares.js';
import {
  cancelOrder,
  getUserOrder,
  orderFrontend,
  orderRazorpay,
  verifyOrderRazorpay,
} from '../controllers/order.controller.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.get('/wake-ai', wakeAiServer);
userRouter.post(
  '/update-profile',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'labFile', maxCount: 1 },
  ]),
  authUser,
  updateProfile
);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/payment-razorpay', authUser, paymentRazorpay);
userRouter.post('/verify-razorpay', authUser, verifyRazorpay);
userRouter.post('/order', authUser, orderFrontend);
userRouter.get('/userOrder', authUser, getUserOrder);
userRouter.post('/cancel-order', authUser, cancelOrder);
userRouter.post('/payment-orderRazorpay', authUser, orderRazorpay);
userRouter.post('/verify-medOrderRazorpay', authUser, verifyOrderRazorpay);
userRouter.post('/gemini-response', generateResponse);
userRouter.post('/chatbot-response', chatbotResponse);
userRouter.post('/verify-lab', authUser, verifyLab);
userRouter.post('/generate-prescription', authDoctor, generateAndSavePrescription);
userRouter.post('/userId', getUserId);
userRouter.post('/analyze-image', upload.single('image'), analyzeSkinImage);
userRouter.get('/lab-data',getLabData)
userRouter.post('/bookLab-appointment', authUser, bookLabAppointment);
userRouter.get('/lab-appointments', authUser, getUserAppointment);
userRouter.post('/paymentlab-razorpay', authUser, paymentLabRazorpay);
userRouter.post('/verifylab-razorpay', authUser, verifyLabRazorpay);
userRouter.post('/cancellab-appointment', authUser, cancelLabAppointment);
userRouter.post('/add-cart', authUser, addToCart);
userRouter.get('/get-cart', authUser, getCartData);
userRouter.post('/cancel-item', authUser, cancelCart);

// Skin Review Routes
userRouter.post('/submit-skin-review', upload.single('image'), authUser, submitSkinReview);
userRouter.post('/payment-skinreview-razorpay', authUser, paymentSkinReviewRazorpay);
userRouter.post('/verify-skinreview-razorpay', authUser, verifySkinReviewRazorpay);
userRouter.get('/skin-reviews', authUser, getUserSkinReviews);

export default userRouter;