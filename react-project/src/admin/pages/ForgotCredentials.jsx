
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../utils/api';
import '../admin.css';

const ForgotCredentials = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await adminApi.post('/auth/forgot', { contact: email });
            setMessage('OTP sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await adminApi.post('/auth/verify-otp', { contact: email, otp });
            setMessage('OTP Verified. Please enter new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await adminApi.post('/auth/reset-password', { contact: email, otp, newPassword });
            alert('Password reset successfully. Please login.');
            navigate('/admin/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Reset Credentials</h1>
                {error && <div className="error-alert">{error}</div>}
                {message && <div style={{ color: 'var(--admin-success)', marginBottom: '1rem', padding: '0.5rem', background: '#d1fae5', borderRadius: '0.375rem', fontSize: '0.875rem' }}>{message}</div>}

                {step === 1 && (
                    <form onSubmit={handleRequestOtp}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label className="form-label">Enter OTP</label>
                            <input
                                type="text"
                                className="form-input"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                placeholder="6-digit code"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Reset Password...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <a href="/admin/login" style={{ color: 'var(--admin-text-light)', fontSize: '0.875rem', textDecoration: 'none' }}>Back to Login</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotCredentials;
