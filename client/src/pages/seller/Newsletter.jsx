import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { Mail, Users, Plus, Send, Trash2, RefreshCw, Eye, Code, Type } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import JoditEditor from 'jodit-react';
import { useRef, useMemo } from 'react';

const Newsletter = () => {
    const { axios, backendUrl } = useContext(AppContext);

    // Subscriber State
    const [subscribers, setSubscribers] = useState([]);
    const [loadingSubscribers, setLoadingSubscribers] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [adding, setAdding] = useState(false);

    // Compose State
    const editor = useRef(null);
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('<h2>Hello Subscribers!</h2><p>Here are our latest updates...</p>');
    const [sending, setSending] = useState(false);
    const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'html'

    // Preview Modal State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Jodit Editor Configuration
    const config = useMemo(() => ({
        readonly: false,
        placeholder: 'Start writing your newsletter...',
        height: 500,
        toolbarSticky: false,
        theme: 'default',
        insertImageAsBase64URI: false, // Disable base64 insertion
        style: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
        },
        uploader: {
            url: `${backendUrl}/api/newsletter/upload-image`,
            format: 'json',
            method: 'POST',
            prepareData: function (data) {
                return data;
            },
            isSuccess: function (resp) {
                return resp.success;
            },
            getMessage: function (resp) {
                return resp.message;
            },
            process: function (resp) {
                return {
                    files: [resp.data.link],
                    path: resp.data.link,
                    baseurl: '',
                    error: resp.success ? false : resp.message,
                    msg: resp.message
                };
            },
            error: function (e) {
                console.error("Upload error:", e);
                toast.error("Failed to upload image");
            },
            withCredentials: true,
            filesVariableName: 'image',
        },
        buttons: [
            'source', '|',
            'bold', 'strikethrough', 'underline', 'italic', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'image', 'video', 'table', 'link', '|',
            'align', 'undo', 'redo', '|',
            'hr', 'eraser', 'copyformat', '|',
            'symbol', 'fullsize', 'print', 'about'
        ],
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
    }), []);

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState(null);

    // Send Confirmation Modal State
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    const fetchSubscribers = async () => {
        setLoadingSubscribers(true);
        try {
            const { data } = await axios.get('/api/newsletter/subscribers');
            if (data.success) {
                setSubscribers(data.subscribers);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch subscribers');
        } finally {
            setLoadingSubscribers(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleAddSubscriber = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        setAdding(true);
        try {
            const { data } = await axios.post('/api/newsletter/subscribe', { email: newEmail });
            if (data.success) {
                toast.success("Subscriber added successfully");
                setNewEmail('');
                fetchSubscribers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add subscriber");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteClick = (id) => {
        setSubscriberToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSubscriber = async () => {
        if (!subscriberToDelete) return;

        try {
            const { data } = await axios.delete(`/api/newsletter/subscribers/${subscriberToDelete}`);
            if (data.success) {
                toast.success("Subscriber removed successfully");
                setSubscribers(prev => prev.filter(s => s._id !== subscriberToDelete));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove subscriber");
        } finally {
            setIsDeleteModalOpen(false);
            setSubscriberToDelete(null);
        }
    };

    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !htmlContent.trim()) {
            toast.error("Subject and content are required");
            return;
        }
        if (subscribers.length === 0) {
            toast.error("No subscribers to send to!");
            return;
        }

        // Open custom confirmation modal instead of window.confirm
        setIsSendModalOpen(true);
    };

    const confirmSendNewsletter = async () => {
        setIsSendModalOpen(false);
        setSending(true);
        try {
            const { data } = await axios.post('/api/newsletter/send', {
                subject,
                htmlContent
            });
            if (data.success) {
                toast.success(`Newsletter sending initiated to ${subscribers.length} subscribers`);
                setSubject('');
                setHtmlContent('<h2>Hello Subscribers!</h2><p>Here are our latest updates...</p>');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send newsletter");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto text-slate-800 dark:text-slate-100">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="text-indigo-500" />
                        Newsletter Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your subscribers and send HTML newsletters.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Subscribers Management */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Add Subscriber Panel */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Plus size={18} className="text-indigo-500" />
                                Add Subscriber
                            </h2>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleAddSubscriber} className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="user@example.com"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {adding ? <RefreshCw className="animate-spin" size={18} /> : <span>Add Email</span>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Subscribers List Panel */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Users size={18} className="text-indigo-500" />
                                Subscribers ({subscribers.length})
                            </h2>
                            <button onClick={fetchSubscribers} title="Refresh" className="text-slate-500 hover:text-indigo-500 transition-colors">
                                <RefreshCw size={16} className={loadingSubscribers ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto max-h-[500px]">
                            {loadingSubscribers ? (
                                <div className="p-8 flex justify-center text-indigo-500">
                                    <RefreshCw className="animate-spin" />
                                </div>
                            ) : subscribers.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                    No subscribers found.
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {subscribers.map((sub) => (
                                        <li key={sub._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="truncate pr-4 flex-1">
                                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{sub.email}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Joined: {new Date(sub.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                title="Remove"
                                                onClick={() => handleDeleteClick(sub._id)}
                                                className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Compose Newsletter */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Send size={18} className="text-indigo-500" />
                                Compose & Send
                            </h2>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <form onSubmit={handleSendNewsletter} className="flex-1 flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Subject / Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Exciting News from Gramodaya!"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Email Body
                                        </label>

                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('visual')}
                                                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'visual' ? 'bg-white dark:bg-slate-700 shadow flex items-center gap-1 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                            >
                                                <Type size={14} /> Word Editor
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('html')}
                                                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'html' ? 'bg-white dark:bg-slate-700 shadow flex items-center gap-1 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                            >
                                                <Code size={14} /> HTML
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                        Craft your email visually. Images and styling will work out of the box. The Gramodaya Header and Footer (with unsubscribe link) will be automatically wrapped securely around your content.
                                    </p>

                                    <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white">
                                        {viewMode === 'visual' ? (
                                            <div className="text-slate-900 prose-sm dark:prose-invert max-w-none">
                                                <JoditEditor
                                                    ref={editor}
                                                    value={htmlContent}
                                                    config={config}
                                                    tabIndex={1}
                                                    onBlur={newContent => setHtmlContent(newContent)}
                                                    onChange={newContent => { }} // Handle on blur for better performance
                                                />
                                            </div>
                                        ) : (
                                            <textarea
                                                required
                                                placeholder={'<h2>Hello Subscribers!</h2>\\n<p>Here are our new updates...</p>'}
                                                className="w-full h-[400px] p-4 bg-slate-900 text-green-400 font-mono text-sm leading-relaxed outline-none resize-y"
                                                value={htmlContent}
                                                onChange={(e) => setHtmlContent(e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewOpen(true)}
                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Eye size={18} />
                                        <span>Preview</span>
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={sending || subscribers.length === 0}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {sending ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={18} />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>Send to {subscribers.length} Subscribers</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteSubscriber}
                title="Remove Subscriber"
                message="Are you sure you want to remove this email from your mailing list? They will no longer receive newsletters."
                confirmText="Remove"
                isDanger={true}
            />

            <ConfirmModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                onConfirm={confirmSendNewsletter}
                title="Send Newsletter"
                message={`Are you sure you want to send this newsletter to ${subscribers.length} subscribers? This action cannot be undone.`}
                confirmText="Send Now"
                cancelText="Review Again"
                isDanger={false}
            />

            {/* Email Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-slate-100 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-300">
                        {/* Modal Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 shadow-sm z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Eye size={20} className="text-indigo-500" />
                                    Email Preview
                                </h3>
                                <p className="text-sm text-slate-500">Subject: <span className="font-semibold text-slate-700">{subject || '(No Subject)'}</span></p>
                            </div>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Preview Content Area (Matches actual email style logic from email.service.js) */}
                        <div className="flex-1 overflow-y-auto bg-[#f4f7f6] p-4 md:p-8">
                            <div className="max-w-[600px] mx-auto bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                                {/* Email Header Wrapper */}
                                <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '20px', textAlign: 'center' }}>
                                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Gramodaya</h1>
                                </div>

                                {/* User Content */}
                                <div
                                    style={{ padding: '30px', lineHeight: 1.6, color: '#333' }}
                                    className="prose prose-sm max-w-none prose-img:rounded-md prose-img:shadow-sm"
                                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                                />

                                {/* Email Footer Wrapper & Unsubscribe UI */}
                                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#aaa', padding: '0 30px' }}>
                                    <p>You are receiving this email because you subscribed to our newsletter.</p>
                                    <p>To stop receiving these emails, <a href="#" style={{ color: '#aaa', textDecoration: 'underline' }}>unsubscribe here</a>.</p>
                                </div>
                                <div style={{ backgroundColor: '#f9f9f9', textAlign: 'center', padding: '20px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', marginTop: '20px' }}>
                                    <p>&copy; {new Date().getFullYear()} Gramodaya. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Newsletter;
