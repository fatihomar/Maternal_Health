import React, { useState } from 'react';
import { X, User, Save, Loader2 } from 'lucide-react';
import api from '../api/axiosInstance';

export default function ProfileModal({ isOpen, onClose }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [baseWeight, setBaseWeight] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [msg, setMsg] = useState('');
  const role = localStorage.getItem('role');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMsg('');

    try {
      const data = { first_name: firstName, last_name: lastName };
      if (role === 'Patient') {
        if (phoneNumber) data.phone_number = phoneNumber;
        if (baseWeight) data.base_weight = baseWeight;
      }
      
      const res = await api.put('auth/update-profile/', data);
      localStorage.setItem('user_name', res.data.name);
      setStatus('success');
      setMsg('Profile updated successfully! Refresh to see changes.');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to update names everywhere
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMsg('Failed to update profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up relative border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <User className="text-medical-600 dark:text-medical-400" size={20} />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit Profile</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-medical-200 outline-none"
              placeholder="E.g. Fatih"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-medical-200 outline-none"
              placeholder="E.g. Scott"
            />
          </div>

          {role === 'Patient' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-medical-200 outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={baseWeight}
                  onChange={(e) => setBaseWeight(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-medical-200 outline-none"
                  placeholder="Optional"
                />
              </div>
            </>
          )}

          {status === 'success' && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{msg}</p>}
          {status === 'error' && <p className="text-sm font-medium text-red-600 dark:text-red-400">{msg}</p>}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-medical-600 hover:bg-medical-700 text-white font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
