import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Smartphone } from 'lucide-react';
import { useAuthStore } from '@store/authStore';

function LoginPage() {
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
  });
  const [showOTPInput, setShowOTPInput] = useState(false);

  const { login, loginWithOTP, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/');
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    // In real app, send OTP to phone
    setShowOTPInput(true);
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    const success = await loginWithOTP(formData.phone, formData.otp);
    if (success) {
      navigate('/');
    }
  };

  const handleQuickLogin = async (role) => {
    let email = '';
    let password = 'demo123';

    switch (role) {
      case 'salesperson':
        email = 'albert.ramirez@company.com';
        break;
      case 'manager':
        email = 'rahul.kumar@company.com';
        break;
      case 'admin':
        email = 'admin@company.com';
        break;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full mb-4">
            <Smartphone className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Field Force Tracking</h1>
          <p className="text-primary-100">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Tab Switch */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                loginMode === 'email'
                  ? 'bg-white text-primary-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setLoginMode('otp')}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                loginMode === 'otp'
                  ? 'bg-white text-primary-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              OTP
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email Login Form */}
          {loginMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input pl-10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-3"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {loginMode === 'otp' && (
            <form onSubmit={showOTPInput ? handleOTPLogin : handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input pl-10"
                    placeholder="Enter your phone number"
                    required
                    disabled={showOTPInput}
                  />
                </div>
              </div>

              {showOTPInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({ ...formData, otp: e.target.value })
                    }
                    className="input"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Demo OTP: 123456
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-3"
              >
                {isLoading
                  ? 'Processing...'
                  : showOTPInput
                  ? 'Verify OTP'
                  : 'Send OTP'}
              </button>

              {showOTPInput && (
                <button
                  type="button"
                  onClick={() => setShowOTPInput(false)}
                  className="w-full text-sm text-primary-600 hover:text-primary-700"
                >
                  Change phone number
                </button>
              )}
            </form>
          )}

          {/* Quick Login (Demo) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">Quick Demo Login:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('salesperson')}
                className="btn btn-secondary text-xs py-2"
                disabled={isLoading}
              >
                Salesperson
              </button>
              <button
                onClick={() => handleQuickLogin('manager')}
                className="btn btn-secondary text-xs py-2"
                disabled={isLoading}
              >
                Manager
              </button>
              <button
                onClick={() => handleQuickLogin('admin')}
                className="btn btn-secondary text-xs py-2"
                disabled={isLoading}
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-primary-100 text-sm">
          <p>&copy; 2024 Field Force Tracking. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
