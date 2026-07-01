import React, { useState, useEffect } from 'react';
import { X, Bell, Activity, Clock } from 'lucide-react';
import api from '../api/axiosInstance';

export default function NotificationsModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const res = await api.get('activity-logs/');
          setLogs(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-slide-up relative border border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="text-medical-600 dark:text-medical-400" size={20} />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Activity Logs</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Loading system logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">No activity logs found.</div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {logs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-4 items-start">
                  <div className="p-2 bg-medical-50 dark:bg-slate-700 text-medical-600 dark:text-medical-400 rounded-full shrink-0 mt-1">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {log.action_type}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
                      <Clock size={12} />
                      {new Date(log.timestamp).toLocaleString()} 
                      <span className="mx-1">•</span>
                      User: {log.user_name || log.user_username || 'System'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
