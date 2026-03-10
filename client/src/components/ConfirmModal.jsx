import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

/**
 * A reusable confirmation modal component.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Action when the modal is cancelled/closed.
 * @param {Function} props.onConfirm - Action when the confirm button is clicked.
 * @param {string} props.title - Title of the modal.
 * @param {string} props.message - Description/Message of the modal.
 * @param {string} [props.confirmText="Confirm"] - Text for the confirm button.
 * @param {string} [props.cancelText="Cancel"] - Text for the cancel button.
 * @param {boolean} [props.isDanger=true] - Whether this is a destructive action (styles it red).
 * @param {boolean} [props.isLoading=false] - Whether the confirm action is in progress.
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = true,
    isLoading = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500'}`}>
                                {isDanger ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3 justify-end mt-2">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-white ${isDanger
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {isDanger && <Trash2 size={18} />}
                                        {confirmText}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
