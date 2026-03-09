import { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import ProductAnalytics from "../../components/ProductAnalytics";
import { BarChart2, Trash2, CornerUpRight } from "lucide-react";

const ProductList = () => {
  const { products, fetchProducts, axios, categories } = useAppContext();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null); // Custom modal state

  // Transfer state
  const [transferProduct, setTransferProduct] = useState(null);
  const [transferDestination, setTransferDestination] = useState("");

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post("/api/product/stock", { id, inStock });
      if (data.success) { fetchProducts(); toast.success(data.message); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const handleDelete = (productId) => {
    setDeleteProductId(productId);
  };

  const confirmDelete = async () => {
    if (!deleteProductId) return;
    try {
      const { data } = await axios.delete(`/api/product/delete/${deleteProductId}`);
      if (data.success) {
        toast.success(data.message);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleteProductId(null);
    }
  };

  const handleTransfer = async () => {
    if (!transferProduct || !transferDestination) return;
    try {
      const { data } = await axios.put('/api/product/transfer', {
        productIds: [transferProduct._id],
        newCategory: transferDestination
      });
      if (data.success) {
        toast.success(`Transferred ${transferProduct.name} to ${transferDestination}`);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to transfer product");
    } finally {
      setTransferProduct(null);
      setTransferDestination("");
    }
  };

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  return (
    <div className="flex-1 py-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-2xl font-bold text-slate-900 dark:text-white">Inventory Overview</h2>

        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">No products found. Add your first product to get started!</p>
          </div>
        ) : (
          Object.keys(groupedProducts).sort().map((category) => (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{category}</h3>
                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  {groupedProducts[category].length} Products
                </span>
              </div>

              <div className="flex flex-col items-center w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="md:table-auto table-fixed w-full overflow-hidden border-collapse">
                  <thead className="text-slate-900 dark:text-slate-200 text-sm text-left">
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold hidden md:table-cell">Price / Unit</th>
                      <th className="px-6 py-4 font-semibold">Availability</th>
                      <th className="px-6 py-4 font-semibold text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-500 dark:text-slate-400">
                    {groupedProducts[category].map((product) => (
                      <tr key={product._id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-4">
                          <div className="w-14 h-14 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-white dark:bg-slate-800 flex-shrink-0">
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}/images/${product.image[0]}`}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-slate-900 dark:text-slate-200 truncate">{product.name}</p>
                            <p className="text-[10px] text-slate-400 md:hidden mt-0.5">₹{product.offerPrice} / {product.unit}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell font-medium text-slate-700 dark:text-slate-300">
                          <span className="text-slate-900 dark:text-white">₹{product.offerPrice}</span>
                          <span className="text-[10px] ml-1 opacity-60">per {product.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <label className="relative inline-flex items-center cursor-pointer gap-3">
                            <input
                              onChange={() => toggleStock(product._id, !product.inStock)}
                              checked={product.inStock}
                              type="checkbox"
                              className="sr-only peer"
                              readOnly
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                            <span className="text-xs font-medium hidden sm:inline text-slate-600 dark:text-slate-400">
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedProductId(product._id)}
                              className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all group"
                              title="View Analytics"
                            >
                              <BarChart2 size={18} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => setTransferProduct(product)}
                              className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all group"
                              title="Transfer Category"
                            >
                              <CornerUpRight size={18} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all group"
                              title="Delete Product"
                            >
                              <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProductId && (
        <ProductAnalytics
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Product</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 font-medium">
              <button
                onClick={() => setDeleteProductId(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-red-500/20 transition-all font-medium flex items-center gap-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Product Modal */}
      {transferProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <CornerUpRight size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transfer Product</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Move <strong className="text-slate-900 dark:text-white">{transferProduct.name}</strong> out of <strong className="text-emerald-600 dark:text-emerald-400">{transferProduct.category}</strong>.
              </p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Destination Category</label>
              <select
                value={transferDestination}
                onChange={(e) => setTransferDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a destination...</option>
                {categories
                  .filter(c => c.text !== transferProduct.category)
                  .map(category => (
                    <option key={category._id} value={category.text}>
                      {category.text}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex justify-end gap-3 font-medium">
              <button
                onClick={() => { setTransferProduct(null); setTransferDestination(""); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!transferDestination}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white shadow-sm hover:shadow-emerald-500/20 transition-all font-medium flex items-center gap-2"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductList;
