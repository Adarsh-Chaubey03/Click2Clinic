import orderModel from '../models/order.model.js'
import validator from 'validator'
import userModel from '../models/user.models.js'
import razorpay from 'razorpay'
//API to take the order info from frontend

const orderFrontend = async (req, res) => {
    try {
        const { mg, ml, address, userId, phone, medData, orderDate, quantity } = req.body

        // Validate required fields
        if (!userId || !address || !phone || !medData) {
            return res.json({ success: false, message: "Missing required details" })
        }

        // Validate phone number
        if (!validator.isMobilePhone(phone.toString())) {
            return res.json({ success: false, message: "Invalid phone number format" })
        }

        // Get user data
        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        // Calculate total price based on quantity
        const itemQuantity = quantity || (mg || ml || 1);
        const totalPrice = medData.price * itemQuantity;

        console.log("Order creation details:", {
            itemName: medData.name,
            itemPrice: medData.price,
            quantity: itemQuantity,
            totalPrice: totalPrice
        });

        // Create order object
        const orderDetail = {
            userId,
            mg: mg || 0,
            ml: ml || 0,
            quantity: itemQuantity, // Store the quantity
            totalPrice: totalPrice, // Store the total price
            address: address.trim(),
            userData: {
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                image: userData.image
            },
            medData: {
                _id: medData._id,
                name: medData.name,
                price: medData.price,
                image: medData.image,
                category: medData.category,
                available: medData.available
            },
            phone: Number(phone),
            orderPlaced: true,
            orderDate: orderDate || new Date().toISOString()
        }

        // Create and save order
        const newOrder = new orderModel(orderDetail)
        await newOrder.save()

        res.json({ success: true, message: "Order placed successfully", orderId: newOrder._id })

    } catch (error) {
        console.log("Order creation error:", error)
        res.json({ success: false, message: error.message })
    }
}

//API for get userorder

const getUserOrder = async (req, res) => {
    try {
        const { userId } = req.body

        if (!userId) {
            return res.json({ success: false, message: "User ID is required" })
        }

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

        return res.json({ success: true, order: orders })

    } catch (error) {
        console.log("Get user orders error:", error)
        res.json({ success: false, message: error.message })
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { userId, orderId } = req.body

        const orderData = await orderModel.findById(orderId)

        if (orderData && orderData.userId === userId) {
            await orderModel.findByIdAndUpdate(orderId, { orderPlaced: false })

            res.json({ success: true, message: "order cancelled" })
        } else {
            res.json({ success: false, message: "order cancellation failed" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET
})

//API to make payment of appointment using razorpay

const orderRazorpay = async (req, res) => {
    try {
        const { orderId } = req.body

        const orderData = await orderModel.findById(orderId)

        if (!orderData || orderData.cancelled == true) {
            return res.json({ success: false, message: "Order cancelled or not found" })
        }

        // Use totalPrice instead of just medData.price to include quantity
        const amountToCharge = orderData.totalPrice || orderData.medData.price;

        console.log("Payment details:", {
            orderId,
            itemPrice: orderData.medData.price,
            quantity: orderData.quantity,
            totalPrice: orderData.totalPrice,
            amountToCharge: amountToCharge
        });

        // creating options for razorpay Payments
        const options = {
            amount: amountToCharge * 100, // Convert to paise
            currency: process.env.CURRENCY,
            receipt: orderId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message });
    }
}
// API to verify payment of razorpay
// const verifyRazorpay = async (req,res) => {
//     try {
//         const {razorpay_order_id} = req.body
//         const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

//         console.log(orderInfo)
//     } catch (error) {

//     }
// }
const verifyOrderRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body; // Capture payment_id from frontend
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === 'paid') {
            // Update order with payment status and payment_id
            await orderModel.findByIdAndUpdate(orderInfo.receipt, {
                paymentStatus: true,
                paymentId: razorpay_payment_id, // Store payment_id
            });
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: "Payment failed!" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

//API for get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})

        return res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

//API for admin cancel order

const cancelAdminOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        await orderModel.findByIdAndUpdate(orderId, { orderPlaced: false });

        return res.json({ success: true, message: "Order cancelled" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.body

        const order = await orderModel.findByIdAndUpdate(orderId, { orderDelivered: true })
        return res.json({ success: true, message: "order completed" })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }

}




export {
    orderFrontend,
    getUserOrder,
    cancelOrder,
    orderRazorpay,
    verifyOrderRazorpay,
    getAllOrders,
    cancelAdminOrder,
    completeOrder
}