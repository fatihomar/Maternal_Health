import React, { useEffect, useState } from 'react';
import { Users, UserRound, CalendarHeart, Activity, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axiosInstance';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_patients: 0,
    total_doctors: 0,
    total_appointments: 0,
    total_vitals_recorded: 0
  });
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role') || 'Visitor';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, vitalsRes] = await Promise.all([
          api.get('dashboard/'),
          api.get('vitals-data/')
        ]);
        setStats(dashboardRes.data);
        setVitalsData(vitalsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Patients', value: stats.total_patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Doctors', value: stats.total_doctors, icon: UserRound, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Appointments', value: stats.total_appointments, icon: CalendarHeart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Vitals Logged', value: stats.total_vitals_recorded, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Loading dashboard...</div>;
  }

  // Calculate Risk Distribution
  const riskCounts = vitalsData.reduce((acc, log) => {
    acc[log.risk_level] = (acc[log.risk_level] || 0) + 1;
    return acc;
  }, {});
  
  const riskChartData = [
    { name: 'Low Risk', value: riskCounts['Low risk'] || riskCounts['Low'] || 0, color: '#10b981' },
    { name: 'Mid Risk', value: riskCounts['Mid risk'] || riskCounts['Mid'] || 0, color: '#f59e0b' },
    { name: 'High Risk', value: riskCounts['High risk'] || riskCounts['High'] || 0, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Calculate Activity over time
  const datesCount = vitalsData.reduce((acc, log) => {
    const date = new Date(log.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  const activityChartData = Object.keys(datesCount).map(date => ({
    date,
    'Vitals Logged': datesCount[date]
  })).slice(-7); // Last 7 active days

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          {role === 'Patient' ? 'My Overview' : 'Clinic Overview'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {role === 'Patient' ? 'High-level summary of your health records.' : 'High-level summary of the Maternal Health Risk System.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} dark:bg-opacity-20`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {vitalsData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Risk Distribution Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Risk Level Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Recent Vitals Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Vitals Logged" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-full text-slate-300 dark:text-slate-500 mb-4 border border-slate-100 dark:border-slate-700">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Analytics Engine</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm text-center">Charts predicting trends in maternal health risks will populate here over time as datasets grow.</p>
        </div>
      )}
    </div>
  );
}
