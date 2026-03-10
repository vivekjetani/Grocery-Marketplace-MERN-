import { assets, categories } from "../../assets/assets";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { X, Plus } from "lucide-react";

const AddProduct = () => {
  const { axios, categories: contextCategories } = useContext(AppContext);
  const [files, setFiles] = useState([null]); // Start with one upload slot
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stockQuantity, setStockQuantity] = useState(0);

  const handleFileChange = (index, file) => {
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    // Add a new slot if the last slot is filled
    if (index === files.length - 1 && file) {
      updatedFiles.push(null);
    }
    setFiles(updatedFiles);
  };

  const removeFileSlot = (index) => {
    if (files.length <= 1) return;
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("offerPrice", offerPrice);
      formData.append("unit", unit);
      formData.append("stockQuantity", stockQuantity);

      const validFiles = files.filter(f => f !== null);
      for (let i = 0; i < validFiles.length; i++) {
        formData.append("image", validFiles[i]);
      }

      const { data } = await axios.post("/api/product/add-product", formData);
      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
        setUnit("kg");
        setStockQuantity(0);
        setFiles([null]);
      }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  return (
    <div className="py-10 flex flex-col justify-between bg-white dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium text-slate-900 dark:text-white">Product Images</p>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <label htmlFor={`image${index}`} className="block">
                  <input onChange={(e) => handleFileChange(index, e.target.files[0])} accept="image/*" type="file" id={`image${index}`} hidden />
                  <div className={`w-24 h-24 cursor-pointer rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${file ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'}`}>
                    {file ? (
                      <img className="w-full h-full object-cover" src={URL.createObjectURL(file)} alt="Upload preview" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <Plus size={20} />
                        <span className="text-[10px] mt-1 font-medium">Add</span>
                      </div>
                    )}
                  </div>
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => removeFileSlot(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">Upload one or more photos. The first slot will be the primary image.</p>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium text-slate-900 dark:text-white" htmlFor="product-name">Product Name</label>
          <input id="product-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-slate-500/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:placeholder-slate-500" required />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium text-slate-900 dark:text-white" htmlFor="product-description">Product Description</label>
          <textarea id="product-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="outline-none md:py-2.5 py-2 px-3 rounded border border-slate-500/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:placeholder-slate-500 resize-none" placeholder="Type here"></textarea>
        </div>
        <div className="w-full flex gap-4 max-w-md">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-base font-medium text-slate-900 dark:text-white" htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="outline-none md:py-2.5 py-2 px-3 rounded border border-slate-500/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" required>
              <option value="">Select Category</option>
              {contextCategories.map((cat, idx) => (<option value={cat.text} key={cat._id || idx}>{cat.text}</option>))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-5 flex-wrap max-w-md">
          <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
            <label className="text-base font-medium text-slate-900 dark:text-white" htmlFor="product-price">Price</label>
            <input id="product-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-slate-500/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:placeholder-slate-500" required />
          </div>
          <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
            <label className="text-base font-medium text-slate-900 dark:text-white" htmlFor="offer-price">Offer Price</label>
            <input id="offer-price" type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-slate-500/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:placeholder-slate-500" required />
          </div>
          <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
            <label className="text-base font-medium text-slate-900 dark:text-white" htmlFor="unit">Unit</label>
            <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="outline-none md:py-2.5 py-2 px-3 rounded border border-slate-500/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" required>
              <option value="kg">Per kg</option>
              <option value="unit">Per unit</option>
              <option value="dozen">Per dozen</option>
              <option value="packet">Per packet</option>
              <option value="liter">Per liter</option>
              <option value="250g">Per 250g</option>
              <option value="500g">Per 500g</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium text-slate-900 dark:text-white" htmlFor="stock-quantity">
            Stock Quantity
          </label>
          <input
            id="stock-quantity"
            type="number"
            min="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-slate-500/40 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:placeholder-slate-500 max-w-[160px]"
          />
          <p className="text-[10px] text-slate-400">How many units are currently in stock.</p>
        </div>
        <button className="px-8 py-2.5 bg-indigo-500 text-white font-medium rounded hover:bg-indigo-600 transition-colors">ADD</button>
      </form>
    </div>
  );
};
export default AddProduct;
