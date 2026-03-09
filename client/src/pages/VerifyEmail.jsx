import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { backendUrl, setShowUserLogin } = useAppContext();

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No token provided.');
                return;
            }

            try {
                const response = await axios.get(`${backendUrl}/api/user/verify-email/${token}`);
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message);
                    toast.success('Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed. Please try again.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(
                    error.response?.data?.message || 'Something went wrong. The link might be expired or invalid.'
                );
            }
        };

        verifyToken();
    }, [token, backendUrl]);

    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center flex flex-col items-center transition-all duration-300">

                {status === 'loading' && (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying...</h2>
                        <p className="text-gray-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <button
                            onClick={() => {
                                navigate('/');
                                setShowUserLogin(true);
                            }}
                            className="px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all w-full shadow-lg shadow-primary/30"
                        >
                            Log in to your account
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-20 h-20 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all w-full"
                        >
                            Return Home
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyEmail;
