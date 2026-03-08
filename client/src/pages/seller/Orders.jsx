import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { axios } = useContext(AppContext);
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/seller");
      if (data.success) setOrders(data.orders);
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };
  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="md:p-10 p-4 space-y-4">
      <h2 className="text-lg font-medium text-slate-900 dark:text-white">Orders List</h2>
      {orders.map((order, index) => (
        <div key={index} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center gap-5 p-5 max-w-4xl rounded-md border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">
          <div className="flex gap-5">
            <img className="w-12 h-12 object-cover opacity-60" src={`${import.meta.env.VITE_BACKEND_URL}/images/${order.items[0].product.image[0]}`} alt="Order item" />
            <>
              {order.items.map((item, index) => (
                <div key={index} className="flex flex-col justify-center">
                  <p className="font-medium">{item.product.name} <span className={`text-indigo-500 ${item.quantity < 2 && "hidden"}`}>x {item.quantity}</span></p>
                </div>
              ))}
            </>
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1 text-slate-900 dark:text-white">{order.address.firstName} {order.address.lastName}</p>
            <p className="text-slate-500 dark:text-slate-400">{order.address.street}, {order.address.city}, {order.address.state},{order.address.zipcode}, {order.address.country}</p>
          </div>
          <p className="font-medium text-base my-auto text-slate-700 dark:text-slate-300">₹{order.amount}</p>
          <div className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
            <p>Method: {order.paymentType}</p>
            <p>Date: {order.orderDate}</p>
            <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Orders;
