import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = 'http://127.0.0.1:5005';

export default function Login({ onLogin, onToast, theme, setTheme }) {
  const [activeTab, setActiveTab] = useState('login'); // login, register
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('customer'); // customer, owner

  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      onToast('Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: email.trim(),
        password
      });
      
      const { token, user } = response.data;
      // Pass token and user data back to App
      onLogin({ ...user, token });
      onToast(`Welcome back, ${user.name}!`);
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed. Please check credentials.';
      onToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regPhone.trim()) {
      onToast('Please fill in all registration fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        role: regRole
      });

      const { token, user } = response.data;
      onLogin({ ...user, token });
      onToast(`Registration successful! Welcome, ${user.name}!`);
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 'Registration failed. Email might already be taken.';
      onToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 w-full bg-[var(--color-bg)] transition-colors duration-300">
      {/* Background blobs */}
      <div className="blob w-[40vw] h-[40vw] bg-indigo-600 top-[10%] left-[10%]"></div>
      <div className="blob w-[50vw] h-[50vw] bg-pink-500 bottom-[10%] right-[10%]"></div>

      <div className="w-full max-w-md p-8 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--color-shadow)] relative z-10">
        {/* Theme Toggle Button */}
        {setTheme && (
          <button 
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-sec)] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        )}

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-gradient text-white font-extrabold flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            P
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)]">PrintFlow Account</h2>
          <p className="text-sm text-[var(--color-text-sec)] mt-1">
            {activeTab === 'login' ? 'Sign in to access your print customizer' : 'Create an account to start configuring'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-405'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-405'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-gradient bg-accent-gradient-hover text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 mt-6 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g. Pallavi"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Email Address</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">WhatsApp / Phone Number</label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Password</label>
              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text)]">Select Portal Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="form-control"
              >
                <option value="customer">Customer (Browse & Customize)</option>
                <option value="owner">Shop Owner (Manage Orders & Dashboard)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-gradient bg-accent-gradient-hover text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 mt-6 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
