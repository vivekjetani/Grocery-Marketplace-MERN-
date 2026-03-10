import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Plus, Trash2, FolderPlus, Edit2, ChevronDown, ChevronUp, PackageOpen, CheckSquare, Square, CornerUpRight, GripVertical, Search, X } from "lucide-react";

const CategoryManager = () => {
    const { axios, categories, fetchCategories, products, fetchProducts } = useAppContext();
    const [newCategory, setNewCategory] = useState("");
    const [categoryImage, setCategoryImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Category management states
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    const [renameCategoryObj, setRenameCategoryObj] = useState(null);
    const [newRenameValue, setNewRenameValue] = useState("");

    // Accordion & Product Product management states
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Transfer Modal states
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferDestination, setTransferDestination] = useState("");
    const [transferCategoryName, setTransferCategoryName] = useState(""); // to know which category's products we're transferring

    // Advanced Delete state (Transfer vs Delete All)
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Drag and Drop states
    const [draggedCategoryIdx, setDraggedCategoryIdx] = useState(null);
    const [dragOverCategoryIdx, setDragOverCategoryIdx] = useState(null);
    const [categorySearch, setCategorySearch] = useState("");

    useEffect(() => {
        if (fetchProducts && products.length === 0) {
            fetchProducts();
        }
    }, [fetchProducts, products.length]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        if (!categoryImage) {
            toast.error("Please select an image for the category.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", newCategory);
            formData.append("image", categoryImage);

            const { data } = await axios.post("/api/category/add", formData);
            if (data.success) {
                toast.success(data.message);
                setNewCategory("");
                setCategoryImage(null);
                await fetchCategories(); // refresh global state
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, categoryName) => {
        // Check if this category has products
        const hasProducts = products.some(p => p.category === categoryName);

        if (hasProducts) {
            // Open Advanced Delete Modal instead
            const catObj = categories.find(c => c._id === id);
            setCategoryToDelete(catObj);
        } else {
            // Open standard confirmation modal
            setDeleteCategoryId(id);
        }
    };

    const confirmDelete = async () => {
        // Standard delete (empty category)
        if (deleteCategoryId) {
            try {
                const { data } = await axios.delete(`/api/category/delete/${deleteCategoryId}`);
                if (data.success) {
                    toast.success(data.message);
                    await fetchCategories();
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete category");
            } finally {
                setDeleteCategoryId(null);
            }
        }

        // Advanced delete (category with products) -> Delete All Products option
        if (categoryToDelete) {
            try {
                // First delete all products in this category
                const productRes = await axios.delete('/api/product/delete-by-category', {
                    data: { category: categoryToDelete.text }
                });

                if (productRes.data.success) {
                    // Then delete the category itself
                    const { data } = await axios.delete(`/api/category/delete/${categoryToDelete._id}`);
                    if (data.success) {
                        toast.success(`Deleted category and all its products`);
                        await fetchCategories();
                        if (fetchProducts) await fetchProducts();
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete category and products");
            } finally {
                setCategoryToDelete(null);
            }
        }
    };

    const handleOpenRename = (category) => {
        setRenameCategoryObj(category);
        setNewRenameValue(category.text);
    };

    const confirmRename = async () => {
        if (!renameCategoryObj || !newRenameValue.trim()) return;

        // Don't call API if name hasn't changed
        if (newRenameValue.trim() === renameCategoryObj.text) {
            setRenameCategoryObj(null);
            return;
        }

        try {
            const { data } = await axios.put(`/api/category/update/${renameCategoryObj._id}`, { name: newRenameValue });
            if (data.success) {
                toast.success(data.message);
                await fetchCategories(); // refresh global state
                if (fetchProducts) await fetchProducts(); // refresh products to get new category names
            }
        } catch (error) {
            console.error("Rename Error: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to rename category");
        } finally {
            setRenameCategoryObj(null);
        }
    };

    // --- REORDERING ---
    const moveCategory = async (e, index, direction) => {
        e.stopPropagation(); // Prevent accordion from toggling

        let newIndex = index;
        if (direction === 'up' && index > 0) newIndex = index - 1;
        if (direction === 'down' && index < categories.length - 1) newIndex = index + 1;

        if (newIndex === index) return; // No movement possible

        // Optimistically swap locally to avoid UI lag (we don't have a direct setter, but we can call API and fetch immediately)
        const newOrder = [...categories];
        const temp = newOrder[index];
        newOrder[index] = newOrder[newIndex];
        newOrder[newIndex] = temp;

        const orderedIds = newOrder.map(c => c._id);

        try {
            const { data } = await axios.put('/api/category/reorder', { orderedIds });
            if (data.success) {
                await fetchCategories(); // Refresh from DB to ensure sync
            }
        } catch (error) {
            toast.error("Failed to reorder categories");
            await fetchCategories(); // Revert on failure
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedCategoryIdx(index);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            e.target.classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        setDragOverCategoryIdx(index);
    };

    const handleDragEnd = async (e) => {
        e.target.classList.remove('opacity-50');

        if (draggedCategoryIdx === null || dragOverCategoryIdx === null || draggedCategoryIdx === dragOverCategoryIdx) {
            setDraggedCategoryIdx(null);
            setDragOverCategoryIdx(null);
            return;
        }

        const newOrder = [...categories];
        const draggedItem = newOrder.splice(draggedCategoryIdx, 1)[0];
        newOrder.splice(dragOverCategoryIdx, 0, draggedItem);

        setDraggedCategoryIdx(null);
        setDragOverCategoryIdx(null);

        const orderedIds = newOrder.map(c => c._id);

        try {
            const { data } = await axios.put('/api/category/reorder', { orderedIds });
            if (data.success) {
                await fetchCategories();
            }
        } catch (error) {
            toast.error("Failed to reorder categories");
            await fetchCategories();
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // --- ACCORDION & PRODUCT SELECTION ---
    const toggleCategory = (categoryName) => {
        if (expandedCategory === categoryName) {
            setExpandedCategory(null);
            setSelectedProducts([]); // clear selection when closing
        } else {
            setExpandedCategory(categoryName);
            setSelectedProducts([]); // clear selection when opening new
        }
    };

    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const selectAllInCategory = (categoryProducts) => {
        if (selectedProducts.length === categoryProducts.length) {
            setSelectedProducts([]); // deselect all
        } else {
            setSelectedProducts(categoryProducts.map(p => p._id)); // select all
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const { data } = await axios.delete(`/api/product/delete/${productId}`);
            if (data.success) {
                toast.success(data.message);
                if (fetchProducts) await fetchProducts();
            }
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const handleTransferSelected = async () => {
        if (!transferDestination || selectedProducts.length === 0) return;

        try {
            const { data } = await axios.put('/api/product/transfer', {
                productIds: selectedProducts,
                newCategory: transferDestination
            });

            if (data.success) {
                toast.success(`Transferred ${selectedProducts.length} products to ${transferDestination}`);
                setShowTransferModal(false);
                setSelectedProducts([]);
                setTransferDestination("");
                if (fetchProducts) await fetchProducts();
            }
        } catch (error) {
            console.error("Transfer Error: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to transfer products");
        }
    };

    const getProductsForCategory = (categoryName) => {
        return products.filter(p => p.category === categoryName);
    };

    return (
        <div className="flex-1 py-10 flex flex-col justify-between overflow-x-hidden">
            <div className="w-full md:p-10 p-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <FolderPlus size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Categories</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your store's categories</p>
                    </div>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="flex flex-col gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Category Name</label>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="e.g. Snacks, Drinks"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>
                        <div className="flex-1 w-full relative">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Category Image</label>
                            <input
                                type="file"
                                id="categoryImage"
                                accept="image/*"
                                onChange={(e) => setCategoryImage(e.target.files[0])}
                                className="hidden"
                                disabled={loading}
                            />
                            <label
                                htmlFor="categoryImage"
                                className={`flex items-center justify-between w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 cursor-pointer hover:border-indigo-500 transition-colors ${categoryImage ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500'}`}
                            >
                                <span className="truncate">{categoryImage ? categoryImage.name : "Choose an image..."}</span>
                                <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-lg">
                                    <Plus size={16} className="text-slate-700 dark:text-slate-300" />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={loading || !newCategory.trim() || !categoryImage}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow-indigo-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Adding...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Plus size={18} /> Add Category</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Category List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white shrink-0">Active Categories</h3>
                        <div className="relative w-full max-w-xs">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="Search categories…"
                                className="pl-8 pr-7 py-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            {categorySearch && (
                                <button onClick={() => setCategorySearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {categories.filter(c =>
                            !categorySearch.trim() ||
                            c.text?.toLowerCase().includes(categorySearch.toLowerCase())
                        ).length === 0 ? (
                            <div className="p-8 text-center text-slate-500">{categorySearch ? 'No categories match your search.' : 'No categories found. Add your first category above!'}</div>
                        ) : (
                            categories
                                .filter(c =>
                                    !categorySearch.trim() ||
                                    c.text?.toLowerCase().includes(categorySearch.toLowerCase())
                                ).map((category, idx) => {
                                    const categoryProducts = getProductsForCategory(category.text);
                                    const isExpanded = expandedCategory === category.text;

                                    return (
                                        <div
                                            key={category._id || idx}
                                            className={`flex flex-col border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all ${dragOverCategoryIdx === idx ? (dragOverCategoryIdx > draggedCategoryIdx ? 'border-b-2 border-b-indigo-500' : 'border-t-2 border-t-indigo-500') : ''} ${draggedCategoryIdx === idx ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragEnter={(e) => handleDragEnter(e, idx)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver}
                                        >
                                            {/* Category Header */}
                                            <div
                                                className={`px-6 py-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                                                onClick={() => toggleCategory(category.text)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-500 p-1 -ml-2" title="Drag to reorder" onClick={e => e.stopPropagation()}>
                                                        <GripVertical size={20} />
                                                    </div>
                                                    {category.image && (
                                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                                            <img
                                                                src={category.image}
                                                                alt={category.text}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-slate-700 dark:text-slate-300 font-medium text-lg flex items-center gap-2">
                                                            {category.text}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                            <PackageOpen size={14} /> {categoryProducts.length} Products
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Actions only appear on hover, click to stop propagation */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => moveCategory(e, idx, 'up')}
                                                            disabled={idx === 0}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                                            title="Move Up"
                                                        >
                                                            <ChevronUp size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => moveCategory(e, idx, 'down')}
                                                            disabled={idx === categories.length - 1}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                                            title="Move Down"
                                                        >
                                                            <ChevronDown size={18} />
                                                        </button>
                                                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenRename(category); }}
                                                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-all"
                                                            title="Rename Category"
                                                        >
                                                            <Edit2 size={20} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(category._id, category.text); }}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                                            title="Delete Category"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                    <div className="text-slate-400">
                                                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Products Accordion Content */}
                                            {isExpanded && (
                                                <div className="bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-3 px-6 animate-in slide-in-from-top-2 duration-200">
                                                    {categoryProducts.length === 0 ? (
                                                        <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm italic">
                                                            No products in this category.
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-3 relative">
                                                            {/* Accordion Actions Row */}
                                                            <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 mb-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); selectAllInCategory(categoryProducts); }}
                                                                    className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                                >
                                                                    {selectedProducts.length === categoryProducts.length ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                                                                    Select All
                                                                </button>

                                                                {selectedProducts.length > 0 && (
                                                                    <button
                                                                        onClick={() => { setTransferCategoryName(category.text); setShowTransferModal(true); }}
                                                                        className="flex items-center gap-2 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                                                    >
                                                                        <CornerUpRight size={16} />
                                                                        Transfer Selected ({selectedProducts.length})
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Product List */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                                                                {categoryProducts.map((product) => {
                                                                    const isSelected = selectedProducts.includes(product._id);
                                                                    return (
                                                                        <div
                                                                            key={product._id}
                                                                            onClick={() => toggleProductSelection(product._id)}
                                                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 bg-white dark:bg-slate-800/80'} shadow-sm`}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="flex-shrink-0">
                                                                                    {isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-400" />}
                                                                                </div>
                                                                                <img src={`${import.meta.env.VITE_BACKEND_URL}/images/${product.image[0]}`} alt={product.name} className="w-10 h-10 object-contain rounded-md bg-white border border-slate-100 dark:border-slate-700" />
                                                                                <div>
                                                                                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-[180px]">{product.name}</p>
                                                                                    <p className="text-xs text-slate-500">${product.price}</p>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }}
                                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                                title="Delete Product"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div >

            {/* Custom Delete Confirmation Modal */}
            {
                deleteCategoryId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-3 text-red-600 mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <Trash2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Category</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
                                Are you sure you want to delete this category? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3 font-medium">
                                <button
                                    onClick={() => setDeleteCategoryId(null)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-red-500/20 transition-all font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Rename Category Modal */}
            {
                renameCategoryObj && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                    <Edit2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rename Category</h3>
                            </div>
                            <div className="mb-6">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">New Category Name</label>
                                <input
                                    type="text"
                                    value={newRenameValue}
                                    onChange={(e) => setNewRenameValue(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none px-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 font-medium">
                                <button
                                    onClick={() => setRenameCategoryObj(null)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRename}
                                    disabled={!newRenameValue.trim() || newRenameValue.trim() === renameCategoryObj.text}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white shadow-sm hover:shadow-indigo-500/20 transition-all font-medium flex items-center gap-2"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Transfer Products Modal */}
            {
                showTransferModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                    <CornerUpRight size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transfer Products</h3>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    You are about to move <strong className="text-indigo-600 dark:text-indigo-400">{selectedProducts.length}</strong> products out of <strong className="text-slate-900 dark:text-white">{transferCategoryName}</strong>.
                                    Please select their new destination category below:
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
                                        .filter(c => c.text !== transferCategoryName) // Don't allow transferring to the same category
                                        .map(category => (
                                            <option key={category._id} value={category.text}>
                                                {category.text}
                                            </option>
                                        ))
                                    }
                                </select>
                                {categories.length <= 1 && (
                                    <p className="text-xs text-red-500 mt-2">You need at least two categories to perform a transfer.</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 font-medium">
                                <button
                                    onClick={() => { setShowTransferModal(false); setTransferDestination(""); }}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTransferSelected}
                                    disabled={!transferDestination}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white shadow-sm hover:shadow-indigo-500/20 transition-all font-medium flex items-center gap-2"
                                >
                                    Transfer {selectedProducts.length} Items
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Advanced Delete Category Modal (When Products Exist) */}
            {
                categoryToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border-2 border-red-500/20">
                            <div className="flex items-center gap-3 text-red-600 mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <Trash2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Warning: Products Detected</h3>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 mb-6 border border-red-100 dark:border-red-900/30">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    The category <strong className="font-bold">{categoryToDelete.text}</strong> currently contains <strong className="font-bold">{getProductsForCategory(categoryToDelete.text).length}</strong> products.
                                    Before deleting this category, you must decide what to do with its products.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        // Trigger bulk transfer flow
                                        const catProducts = getProductsForCategory(categoryToDelete.text);
                                        setSelectedProducts(catProducts.map(p => p._id));
                                        setTransferCategoryName(categoryToDelete.text);
                                        setCategoryToDelete(null); // Close this modal
                                        setShowTransferModal(true); // Open transfer modal
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-medium transition-colors border border-indigo-100 dark:border-indigo-800/50"
                                >
                                    <CornerUpRight size={18} />
                                    Transfer Products First
                                </button>

                                <div className="relative py-2 flex items-center">
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">OR</span>
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (window.confirm(`Are you absolutely sure? This will PERMANENTLY delete ${getProductsForCategory(categoryToDelete.text).length} products.`)) {
                                            confirmDelete();
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-red-500/20 font-medium transition-all"
                                >
                                    <Trash2 size={18} />
                                    Delete Category AND All Products
                                </button>

                                <button
                                    onClick={() => setCategoryToDelete(null)}
                                    className="w-full mt-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CategoryManager;
