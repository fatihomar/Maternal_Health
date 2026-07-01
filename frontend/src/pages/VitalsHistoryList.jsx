import React, { useEffect, useState } from 'react';
import { ActivitySquare, FileClock, Thermometer, Droplets, HeartPulse } from 'lucide-react';
import api from '../api/axiosInstance';

export default function VitalsHistoryList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('vitals-data/');
        setLogs(response.data);
      } catch (err) {
        console.error("Failed to load vitals history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredLogs = logs.filter(log => 
    riskFilter === 'All' || log.risk_level === riskFilter
  );

  const getRiskBadge = (level) => {
    switch (level) {
      case 'High':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold ring-1 ring-red-200">HIGH RISK</span>;
      case 'Mid':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold ring-1 ring-amber-200">MID RISK</span>;
      case 'Low':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold ring-1 ring-emerald-200">LOW RISK</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold ring-1 ring-slate-200">{level || 'UNKNOWN'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Machine Learning Medical Records</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review historical risk predictions across the clinic.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-medical-200 transition-all outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Mid">Mid Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 animate-pulse">Loading medical records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 mb-4">
              <FileClock size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-white">No predictions logged</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Run a patient's vitals through the ML predictor to generate history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prediction Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">A.I. Risk Result</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">BP (Sys/Dia)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sugar / Temp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-medical-50 dark:bg-slate-700 text-medical-600 dark:text-medical-400 flex items-center justify-center font-bold text-xs border border-medical-100 dark:border-slate-600">
                          {log.patient_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{log.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(log.recorded_at).toLocaleDateString()} <span className="text-xs ml-1 opacity-75">{new Date(log.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getRiskBadge(log.risk_level)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <ActivitySquare size={14} className="text-slate-400 dark:text-slate-500"/>
                        {log.systolic_bp} / {log.diastolic_bp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400 text-xs">
                        <span className="flex items-center gap-1"><Droplets size={12}/> {log.blood_sugar} mg/dL</span>
                        <span className="flex items-center gap-1"><Thermometer size={12}/> {log.body_temp} °F</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <HeartPulse size={14} className="text-rose-400 dark:text-rose-500"/>
                        {log.heart_rate}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
