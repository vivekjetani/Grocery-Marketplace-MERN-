import { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MailX, ArrowLeft, Loader } from 'lucide-react';

const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { axios } = useContext(AppContext);

    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleUnsubscribe = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid unsubscribe link. Token is missing.');
                return;
            }

            try {
                const { data } = await axios.post('/api/newsletter/unsubscribe', { token });
                if (data.success) {
                    setStatus('success');
                    setMessage('You have been successfully unsubscribed from our newsletter.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to unsubscribe. Please try again later.');
            }
        };

        handleUnsubscribe();
    }, [token, axios]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-center p-8 border border-slate-200 dark:border-slate-800">
                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <Loader className="w-12 h-12 text-indigo-500 animate-spin" />
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Processing...</h2>
                        <p className="text-slate-500 dark:text-slate-400">Please wait while we process your request.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center gap-4 py-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                            <MailX className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Unsubscribed</h2>
                        <p className="text-slate-600 dark:text-slate-300">{message}</p>
                        <Link
                            to="/"
                            className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors w-full"
                        >
                            Return to Homepage
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center gap-4 py-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                            <MailX className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Error</h2>
                        <p className="text-slate-600 dark:text-slate-300">{message}</p>
                        <Link
                            to="/"
                            className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition-colors w-full"
                        >
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Unsubscribe;
