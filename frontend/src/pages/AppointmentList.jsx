import React, { useState, useEffect } from 'react';
import { Calendar, Clock, UserRound, MapPin, CheckCircle, Clock3, Plus, XCircle } from 'lucide-react';
import api from '../api/axiosInstance';
import BookAppointmentModal from '../components/BookAppointmentModal';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const role = localStorage.getItem('role') || 'Admin';

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('appointments/');
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><Clock3 size={14}/> Scheduled</span>;
      case 'Completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><CheckCircle size={14}/> Completed</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full w-fit">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-full w-fit">{status}</span>;
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await api.patch(`appointments/${id}/status/`, { status: 'Completed' });
      setAppointments(appointments.map(apt => apt.id === id ? res.data : apt));
    } catch (err) {
      console.error(err);
      alert('Failed to mark appointment as completed.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.patch(`appointments/${id}/status/`, { status: 'Cancelled' });
      setAppointments(appointments.map(apt => apt.id === id ? res.data : apt));
    } catch (err) {
      console.error(err);
      alert('Failed to cancel appointment.');
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    statusFilter === 'All' || apt.status === statusFilter
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="text-medical-600 dark:text-medical-400" />
            {role === 'Patient' ? 'My Appointments' : 'All Appointments'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and view your scheduled clinic visits.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-medical-200 transition-all outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {role === 'Patient' && (
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 bg-medical-600 hover:bg-medical-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={16} /> Book Appointment
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 dark:border-medical-400"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md border border-red-100 dark:border-red-800">
          {error}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No appointments found</h3>
          <p className="text-slate-500 dark:text-slate-400">There are no appointments matching the selected filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map(apt => (
            <div key={apt.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Decorative side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-medical-500/20 group-hover:bg-medical-500 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-medical-50 dark:bg-slate-700 p-2 rounded-lg text-medical-600 dark:text-medical-400">
                      <UserRound size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {role === 'Patient' ? apt.doctor_name : apt.patient_name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {role === 'Patient' ? apt.doctor_specialty : 'Patient'}
                      </p>
                    </div>
                  </div>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 mt-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm text-medical-600 dark:text-medical-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date</p>
                    <p className="font-semibold">{apt.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm text-medical-600 dark:text-medical-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Time</p>
                    <p className="font-semibold">{apt.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm text-medical-600 dark:text-medical-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Location</p>
                    <p className="font-semibold">Maternal Health Clinic</p>
                  </div>
                </div>
              </div>
              
              {apt.status === 'Scheduled' && (
                <div className="mt-4 flex gap-2">
                  {role === 'Admin' && (
                    <button 
                      onClick={() => handleComplete(apt.id)}
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-green-200 dark:border-green-800/50"
                    >
                      <CheckCircle size={16} /> Mark as Completed
                    </button>
                  )}
                  <button 
                    onClick={() => handleCancel(apt.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-red-200 dark:border-red-800/50"
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <BookAppointmentModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        onSuccess={fetchAppointments} 
      />
    </div>
  );
}
