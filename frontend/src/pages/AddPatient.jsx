import React, { useState } from 'react';
import { UserPlus, UserRound, Phone, Activity, Weight, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosInstance';

export default function AddPatient() {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    base_weight: '',
    phone_number: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await api.post('patients/create/', {
        full_name: formData.full_name,
        age: parseInt(formData.age),
        base_weight: parseFloat(formData.base_weight),
        phone_number: formData.phone_number
      });
      console.log("Patient created:", response.data);
      setStatus('success');
      setFormData({ full_name: '', age: '', base_weight: '', phone_number: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'Failed to register patient. Please check the inputs.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 bg-medical-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-medical-100 text-medical-600 rounded-lg">
              <UserPlus size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Register New Patient</h2>
          </div>
          <p className="text-slate-500">Enter the patient's core demographic data carefully.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-200 focus:border-medical-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="10" max="80"
                    placeholder="e.g. 28"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-200 focus:border-medical-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Base Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    step="0.1"
                    name="base_weight"
                    value={formData.base_weight}
                    onChange={handleChange}
                    required
                    min="30" max="250"
                    placeholder="e.g. 65.5"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-200 focus:border-medical-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +1 555-0199"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-200 focus:border-medical-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
              <CheckCircle2 size={18} />
              Patient registered successfully!
            </div>
          )}

          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-medical-600 hover:bg-medical-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-medical-500/20"
          >
            {status === 'loading' ? 'Registering...' : 'Register Patient'}
          </button>
        </form>
      </div>
    </div>
  );
}
