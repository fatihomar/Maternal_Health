import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { HeartPulse } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Clear any old/invalid tokens that might block the login request
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      
      const res = await api.post('auth/login/', { 
        username: cleanUsername, 
        password: cleanPassword 
      });
      
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_name', res.data.name);
      localStorage.setItem('role', res.data.role);
      if (res.data.patient_id) {
        localStorage.setItem('patient_id', res.data.patient_id);
      }
      
      // Redirect to dashboard
      window.location.href = '/'; 
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(`Server returned ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else {
        setError(`Network Error: ${err.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-medical-600">
          <HeartPulse size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to MHI System
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-medical-500 focus:border-medical-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-medical-500 focus:border-medical-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-medical-600 hover:bg-medical-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Are you a patient? </span>
            <a href="/register" className="text-medical-600 font-medium hover:text-medical-500">
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
