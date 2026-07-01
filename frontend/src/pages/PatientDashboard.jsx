import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../api/axiosInstance';

export default function PatientDashboard() {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userName = localStorage.getItem('user_name') || 'Patient';

  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, loading, success, error
  const [bookingError, setBookingError] = useState('');
  const [bookedAppointment, setBookedAppointment] = useState(null);

  useEffect(() => {
    const fetchMyVitals = async () => {
      try {
        const response = await api.get('my-vitals/');
        setVitals(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load your medical records.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyVitals();
  }, []);

  const handleEmergencyBooking = async () => {
    setBookingStatus('loading');
    setBookingError('');
    try {
      const response = await api.post('appointments/emergency/');
      setBookedAppointment(response.data);
      setBookingStatus('success');
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
      if (err.response && err.response.data && err.response.data.error) {
        setBookingError(err.response.data.error);
      } else {
        setBookingError('Failed to book. Please call clinic.');
      }
    }
  };

  const latestVital = vitals.length > 0 ? vitals[0] : null;
  const isHighRisk = latestVital && latestVital.risk_level === 'High';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Welcome back, {userName}
          </h1>
          <p className="text-slate-500 mt-1">Here is your personal health overview.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md shadow-sm border border-red-100 flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      ) : (
        <>
          {/* High Risk Alert */}
          {isHighRisk && (
            <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-pulse-slow">
              <div className="flex items-start gap-4">
                <AlertTriangle size={32} className="shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold">CRITICAL ALERT: High Risk Detected</h3>
                  <p className="mt-2 font-medium">
                    Your latest medical readings indicate a high-risk condition. 
                    <strong className="block mt-1 underline">Please contact your doctor or visit the clinic immediately!</strong>
                  </p>
                  <div className="mt-4 text-sm bg-red-800/30 inline-block px-3 py-1 rounded">
                    Recorded at: {new Date(latestVital.recorded_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto shrink-0 bg-red-700/50 p-4 rounded-xl border border-red-500/30">
                {bookingStatus === 'success' && bookedAppointment ? (
                  <div className="text-center">
                    <CheckCircle className="mx-auto mb-2 text-green-300" size={28} />
                    <h4 className="font-bold text-green-100">Appointment Confirmed!</h4>
                    <p className="text-sm mt-1">Dr. {bookedAppointment.doctor}</p>
                    <p className="text-sm font-semibold">{bookedAppointment.date} at {bookedAppointment.time}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <button 
                      onClick={handleEmergencyBooking}
                      disabled={bookingStatus === 'loading'}
                      className="w-full md:w-auto bg-white text-red-700 hover:bg-red-50 font-bold py-3 px-6 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {bookingStatus === 'loading' ? 'Booking...' : 'Book Emergency Appointment'}
                    </button>
                    {bookingStatus === 'error' && (
                      <p className="text-xs text-red-200 mt-2 font-medium">{bookingError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Latest Status Summary */}
          {!isHighRisk && latestVital && (
            <div className="bg-green-50 text-green-800 p-6 rounded-lg shadow-sm border border-green-200 flex items-start gap-4">
              <CheckCircle size={32} className="shrink-0 mt-1 text-green-600" />
              <div>
                <h3 className="text-xl font-bold">Health Status: Normal / Low Risk</h3>
                <p className="mt-1">Your latest medical readings are looking good. Keep up the healthy habits!</p>
              </div>
            </div>
          )}

          {/* Latest Readings Details */}
          {latestVital ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-medical-500" />
                  Your Latest Readings
                </h3>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(latestVital.recorded_at).toLocaleDateString()}
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-slate-500 text-sm">Blood Pressure</div>
                  <div className="text-xl font-semibold text-slate-800 mt-1">
                    {latestVital.systolic_bp} / {latestVital.diastolic_bp}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-slate-500 text-sm">Blood Sugar</div>
                  <div className="text-xl font-semibold text-slate-800 mt-1">
                    {latestVital.blood_sugar} <span className="text-sm font-normal text-slate-500">mmol/L</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-slate-500 text-sm">Heart Rate</div>
                  <div className="text-xl font-semibold text-slate-800 mt-1">
                    {latestVital.heart_rate} <span className="text-sm font-normal text-slate-500">bpm</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-slate-500 text-sm">Temperature</div>
                  <div className="text-xl font-semibold text-slate-800 mt-1">
                    {latestVital.body_temp} <span className="text-sm font-normal text-slate-500">°C</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-slate-200">
              <Activity size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700">No medical records found</h3>
              <p className="text-slate-500 mt-1">You haven't had any vitals recorded yet.</p>
            </div>
          )}

          {/* History Table */}
          {vitals.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Previous Records</h3>
              <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">BP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sugar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Heart Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {vitals.slice(1).map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {new Date(record.recorded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {record.systolic_bp}/{record.diastolic_bp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {record.blood_sugar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {record.heart_rate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                            record.risk_level === 'Mid' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {record.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
