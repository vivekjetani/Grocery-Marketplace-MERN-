import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";

const Address = () => {
  const [address, setAddress] = React.useState({ firstName: "", lastName: "", email: "", street: "", city: "", state: "", zipCode: "", country: "", phone: "" });
  const { axios, user, navigate } = useContext(AppContext);
  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const submitHanlder = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post("/api/address/add", { address });
      if (data.success) { toast.success(data.message); navigate("/cart"); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { if (!user) navigate("/cart"); }, []);

  const inputClass = "bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl px-4 py-3 outline-none transition-all dark:text-slate-100 dark:placeholder-slate-500";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 md:mt-16 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Add Address</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Fill in your delivery details</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Address Details</h2>
          </div>
          <form onSubmit={submitHanlder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
              <input type="text" name="firstName" value={address.firstName} onChange={handleChange} className={inputClass} placeholder="John" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
              <input type="text" name="lastName" value={address.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" required />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
              <input type="email" name="email" value={address.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" required />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Street</label>
              <input type="text" name="street" value={address.street} onChange={handleChange} className={inputClass} placeholder="123 Main St" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">City</label>
              <input type="text" name="city" value={address.city} onChange={handleChange} className={inputClass} placeholder="New York" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">State</label>
              <input type="text" name="state" value={address.state} onChange={handleChange} className={inputClass} placeholder="NY" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Zip Code</label>
              <input type="number" name="zipCode" value={address.zipCode} onChange={handleChange} className={inputClass} placeholder="10001" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Country</label>
              <input type="text" name="country" value={address.country} onChange={handleChange} className={inputClass} placeholder="USA" required />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone</label>
              <input type="number" name="phone" value={address.phone} onChange={handleChange} className={inputClass} placeholder="+1 234 567 890" required />
            </div>
            <div className="col-span-1 md:col-span-2 mt-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Save Address
              </motion.button>
            </div>
          </form>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img src={assets.add_address_iamge} alt="Address Illustration" className="w-full max-w-sm rounded-3xl shadow-md" />
        </div>
      </div>
    </motion.div>
  );
};
export default Address;
