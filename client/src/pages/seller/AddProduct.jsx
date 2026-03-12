import { assets, categories } from "../../assets/assets";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { X, Plus, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Info, Server, Cloud, ChevronRight, PackagePlus, ClipboardList, PlusSquare } from "lucide-react";
import { motion } from "framer-motion";

const AddProduct = () => {
  const { axios, categories: contextCategories, fetchProducts, backendUrl } = useContext(AppContext);
  const [files, setFiles] = useState([null]); // Start with one upload slot
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stockQuantity, setStockQuantity] = useState(0);

  const handleFileChange = (index, fileList) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList);
    let updatedFiles = [...files];

    updatedFiles.splice(index, 1, ...newFiles);

    const validFiles = updatedFiles.filter(f => f !== null);
    setFiles([...validFiles, null]);
  };

  const removeFileSlot = (index) => {
    if (files.length <= 1) return;
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const [activeTab, setActiveTab] = useState("single"); // "single" or "bulk"

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [storageType, setStorageType] = useState("local");
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const handleBulkFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || selectedFile.name.endsWith(".xlsx"))) {
      setBulkFile(selectedFile);
      setBulkResult(null);
    } else {
      toast.error("Please select a valid .xlsx Excel file");
      setBulkFile(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get("/api/seller/bulk-upload-template", {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk_product_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsBulkUploading(true);
    setBulkResult(null);

    const formData = new FormData();
    formData.append("file", bulkFile);
    formData.append("storageType", storageType);

    try {
      const { data } = await axios.post("/api/seller/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        setBulkResult(data);
        if (data.failedCount > 0) {
          toast.success(`Partially successful: ${data.successCount} added, ${data.failedCount} failed.`);
        } else {
          toast.success("All products uploaded successfully!");
          setBulkFile(null);
          fetchProducts();
        }
      } else {
        toast.error(data.message || "Bulk upload failed");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error during upload";
      toast.error(msg);
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleSubmitSingle = async (e) => {
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
        fetchProducts();
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
    <div className="md:p-10 p-4 min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusSquare className="text-indigo-500" />
              Add Products
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your inventory by adding products manually or in bulk.</p>
          </div>
          {activeTab === "bulk" && (
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 shrink-0"
            >
              <Download size={18} />
              Download Template
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "single" 
              ? "bg-white dark:bg-slate-800 text-indigo-500 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <PackagePlus size={18} />
            Single Product
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "bulk" 
              ? "bg-white dark:bg-slate-800 text-indigo-500 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <ClipboardList size={18} />
            Bulk Upload
          </button>
        </div>

        {activeTab === "single" ? (
          <motion.form 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmitSingle} 
            className="space-y-6 max-w-2xl bg-white dark:bg-slate-900 md:p-8 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div>
              <label className="text-base font-bold text-slate-800 dark:text-slate-200 block mb-3">Product Images</label>
              <div className="flex flex-wrap items-center gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <label htmlFor={`image${index}`} className="block">
                      <input onChange={(e) => handleFileChange(index, e.target.files)} accept="image/*" type="file" id={`image${index}`} hidden multiple />
                      <div className={`w-24 h-24 cursor-pointer rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${file ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'}`}>
                        {file ? (
                          <img className="w-full h-full object-cover" src={URL.createObjectURL(file)} alt="Upload preview" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <Plus size={20} />
                            <span className="text-[10px] mt-1 font-bold">Add</span>
                          </div>
                        )}
                      </div>
                    </label>
                    {file && (
                      <button
                        type="button"
                        onClick={() => removeFileSlot(index)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3 italic flex items-center gap-1.5">
                <Info size={14} />
                Upload one or more photos. The first slot will be the primary image.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="product-name">Product Name</label>
                <input id="product-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" className="outline-none py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-medium" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="category">Category</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="outline-none py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-medium" required>
                  <option value="">Select Category</option>
                  {contextCategories.map((cat, idx) => (<option value={cat.text} key={cat._id || idx}>{cat.text}</option>))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="product-description">Product Description</label>
              <textarea id="product-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="outline-none py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-medium resize-none" placeholder="Enter product details"></textarea>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="product-price">Price</label>
                <input id="product-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="outline-none py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-medium" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="offer-price">Offer Price</label>
                <input id="offer-price" type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="0" className="outline-none py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-medium" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="unit">Unit</label>
                <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="outline-none py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-medium" required>
                  <option value="kg">Per kg</option>
                  <option value="unit">Per unit</option>
                  <option value="dozen">Per dozen</option>
                  <option value="packet">Per packet</option>
                  <option value="liter">Per liter</option>
                  <option value="250g">Per 250g</option>
                  <option value="500g">Per 500g</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="stock-quantity">Stock Quantity</label>
                <input id="stock-quantity" type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))} placeholder="0" className="outline-none py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-medium" />
              </div>
            </div>

            <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]">
              ADD PRODUCT
            </button>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Bulk Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Server size={16} />
                  1. Image Storage Mode
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setStorageType("local")}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      storageType === "local" 
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <Server className={storageType === "local" ? "text-indigo-500" : "text-slate-400"} />
                    <span className={`font-bold ${storageType === "local" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}`}>Local Storage</span>
                  </button>
                  <button
                    onClick={() => setStorageType("cloudinary")}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      storageType === "cloudinary" 
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <Cloud className={storageType === "cloudinary" ? "text-indigo-500" : "text-slate-400"} />
                    <span className={`font-bold ${storageType === "cloudinary" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}`}>Cloudinary</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <FileSpreadsheet size={16} />
                  2. Upload Excel File
                </h2>
                <div className="relative group">
                  <input type="file" onChange={handleBulkFileChange} accept=".xlsx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all ${
                    bulkFile ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-500/5" : "border-slate-200 dark:border-slate-800 group-hover:border-indigo-400 bg-slate-50 dark:bg-slate-950"
                  }`}>
                    <div className={`p-5 rounded-3xl mb-4 ${bulkFile ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500" : "bg-white dark:bg-slate-900 text-slate-400"}`}>
                      <FileSpreadsheet size={32} />
                    </div>
                    {bulkFile ? (
                      <div className="text-center">
                        <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">{bulkFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(bulkFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-bold text-slate-700 dark:text-slate-300">Click or drag Excel template here</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tighter">Only .xlsx files supported</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleBulkUpload}
                  disabled={!bulkFile || isBulkUploading}
                  className={`w-full mt-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                    !bulkFile || isBulkUploading
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg active:scale-[0.98]"
                  }`}
                >
                  {isBulkUploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={20} />}
                  {isBulkUploading ? "PROCESSING..." : "START UPLOAD"}
                </button>
              </div>

              {bulkResult && (
                <div className={`p-6 rounded-3xl border ${bulkResult.failedCount > 0 ? "bg-orange-50/50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20" : "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${bulkResult.failedCount > 0 ? "bg-orange-100 dark:bg-orange-500/20 text-orange-500" : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500"}`}>
                      {bulkResult.failedCount > 0 ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-black text-xl ${bulkResult.failedCount > 0 ? "text-orange-900 dark:text-orange-400" : "text-emerald-900 dark:text-emerald-400"}`}>
                        {bulkResult.failedCount > 0 ? "Upload Completed with Issues" : "Bulk Upload Successful"}
                      </h3>
                      <div className="mt-4 flex items-center gap-8">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Correct Rows</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white">{bulkResult.successCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Failed Rows</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white">{bulkResult.failedCount}</p>
                        </div>
                      </div>
                      {bulkResult.reportUrl && (
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fix invalid data and re-upload.</p>
                          <a href={backendUrl + bulkResult.reportUrl} download className="flex items-center gap-2 text-indigo-500 font-black hover:gap-3 transition-all underline underline-offset-8">
                            Download Failure Report
                            <ChevronRight size={18} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Instructions */}
            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Info size={24} className="text-indigo-400" />
                  Guide
                </h2>
                <div className="space-y-5">
                  {[
                    "Download the official template.",
                    "Fill details. Name, Category, Price, Stock are compulsory.",
                    "Ensure Category names match exactly.",
                    "Allowed Units: per kg, unit, dozen, packet, liter, 250g, 500g.",
                    "Images: Local paths (e.g. /upload/1.png) or direct URLs.",
                    "Duplicates (by Name) will be ignored."
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-indigo-400 font-mono font-bold">{i+1}.</span>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
