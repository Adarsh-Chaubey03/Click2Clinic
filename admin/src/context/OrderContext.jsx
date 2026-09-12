import { useState,useEffect } from "react";
import { createContext } from "react";
import axios from 'axios'
import {toast} from "react-toastify"

export const OrderContext = createContext()


const OrderContextProvider =(props)=>{
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [orders,setOrders] = useState([])

    const getAllOrders = async () => {
        try {
            const { data } = await axios.get(backendUrl+'/api/order/all-order')
            if(data.success){
                setOrders(data.orders)
                // console.log(data.orders)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    const orderCount = orders.length;
    const totalEarnings = orders.reduce((total, order) => {
        if (order.medData && order.medData.price) {
            return total + order.medData.price; 
        }
        return total;
    }, 0);
    const cancelAdminOrder = async (orderId) => {
        try {
            const {data} = await axios.post(backendUrl+'/api/order/cancel-order',{orderId})
            if(data.success){
                toast.success(data.message)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const completeOrder = async (orderId) => {
        try {
            const {data} = await axios.post(backendUrl+'/api/order/complete-order',{orderId})
            if(data.success){
                toast.success(data.message)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        // console.log("useEffect running...");
        getAllOrders();
    }, []);
    const value = {
      orders,
      setOrders,
      getAllOrders,
      orderCount,
      totalEarnings,
      cancelAdminOrder,
      completeOrder
    }

return (
    <OrderContext.Provider value={value}>
        {props.children}
    </OrderContext.Provider>
)
}

export default OrderContextProvider