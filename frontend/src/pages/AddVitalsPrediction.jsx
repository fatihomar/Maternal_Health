import React, { useState, useEffect } from 'react';
import { ActivitySquare, HeartPulse, Droplets, Thermometer, AlertCircle, CheckCircle2, FlaskConical, Cpu } from 'lucide-react';
import api from '../api/axiosInstance';

export default function AddVitalsPrediction() {
  const [patients, setPatients] = useState([]);
  
  const role = localStorage.getItem('role') || 'Admin';
  const storedPatientId = localStorage.getItem('patient_id') || '';

  const [formData, setFormData] = useState({
    patient_id: role === 'Patient' ? storedPatientId : '',
    systolic_bp: '',
    diastolic_bp: '',
    blood_sugar: '',
    body_temp: '',
    heart_rate: ''
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [predictionResult, setPredictionResult] = useState(null); // 'High', 'Mid', 'Low'
  const [allPredictions, setAllPredictions] = useState(null); // Object of 4 models
  const [errorMsg, setErrorMsg] = useState('');

  const [latestVitalsMap, setLatestVitalsMap] = useState({});

  useEffect(() => {
    if (role !== 'Patient') {
      const fetchData = async () => {
        try {
          const [patientsRes, vitalsRes] = await Promise.all([
            api.get('patients/'),
            api.get('vitals-data/')
          ]);
          setPatients(patientsRes.data);
          
          const vitalsMap = {};
          vitalsRes.data.forEach(v => {
            if (!vitalsMap[v.patient]) {
              vitalsMap[v.patient] = v;
            }
          });
          setLatestVitalsMap(vitalsMap);
        } catch (err) {
          console.error("Could not fetch data.", err);
        }
      };
      fetchData();
    }
  }, [role]);

  const handleChange = (e) => {
    if (e.target.name === 'patient_id' && role !== 'Patient') {
      const pId = e.target.value;
      const latest = latestVitalsMap[pId];
      if (latest) {
        setFormData({
          ...formData,
          patient_id: pId,
          systolic_bp: latest.systolic_bp,
          diastolic_bp: latest.diastolic_bp,
          blood_sugar: latest.blood_sugar,
          body_temp: latest.body_temp,
          heart_rate: latest.heart_rate,
        });
      } else {
        setFormData({
          ...formData,
          patient_id: pId,
          systolic_bp: '',
          diastolic_bp: '',
          blood_sugar: '',
          body_temp: '',
          heart_rate: '',
        });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setPredictionResult(null);
    setAllPredictions(null);
    setErrorMsg('');

    if (role === 'Patient' && !formData.patient_id) {
      setStatus('error');
      setErrorMsg('Session error: Patient ID missing. Please log out and log in again.');
      return;
    }

    try {
      const response = await api.post('vitals/predict/', {
        patient_id: parseInt(formData.patient_id),
        systolic_bp: parseFloat(formData.systolic_bp),
        diastolic_bp: parseFloat(formData.diastolic_bp),
        blood_sugar: parseFloat(formData.blood_sugar),
        body_temp: parseFloat(formData.body_temp),
        heart_rate: parseFloat(formData.heart_rate),
      });
      
      console.log("Prediction success:", response.data);
      setPredictionResult(response.data.predicted_risk_level);
      setAllPredictions(response.data.all_predictions);
      setStatus('success');
      
      setFormData({
        patient_id: formData.patient_id, 
        systolic_bp: '', diastolic_bp: '', blood_sugar: '', body_temp: '', heart_rate: ''
      });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.model_error || 'Failed to predict risk. Ensure inputs are valid numeric values.');
    }
  };

  const getRiskUI = (level) => {
    if (level === 'High') {
      return {
        bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', 
        icon: <AlertCircle size={28} className="text-red-500" />,
        message: 'CRITICAL WARNING: High Risk Configuration Detected.',
        badgeStyle: 'bg-red-100 text-red-700 ring-1 ring-red-200'
      };
    }
    if (level === 'Mid') {
      return {
        bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', 
        icon: <AlertCircle size={28} className="text-amber-500" />,
        message: 'ATTENTION: Medium Risk Configuration Detected. Monitor closely.',
        badgeStyle: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
      };
    }
    return { // Low Risk
      bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', 
      icon: <CheckCircle2 size={28} className="text-emerald-500" />,
      message: 'ALL CLEAR: Low Risk Configuration.',
      badgeStyle: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
    };
  };

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* --- PREDICTION ALERT MODAL/STATE --- */}
      {status === 'success' && predictionResult && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
          
          {/* Main Ensembled Result (Random Forest) */}
          <div className={`p-6 rounded-2xl border flex gap-4 shadow-sm ${getRiskUI(predictionResult).bg} ${getRiskUI(predictionResult).border}`}>
            <div className="flex-shrink-0 mt-1">
              {getRiskUI(predictionResult).icon}
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-1 ${getRiskUI(predictionResult).text}`}>
                Primary A.I. Result (Random Forest): {predictionResult} Risk
              </h3>
              <p className={`text-sm font-medium opacity-80 ${getRiskUI(predictionResult).text}`}>
                {getRiskUI(predictionResult).message}
              </p>
              <p className={`text-xs mt-3 bg-white/50 inline-block px-3 py-1 rounded-full font-medium ${getRiskUI(predictionResult).text}`}>
                 Analysis fully logged to Patient Record.
              </p>
            </div>
          </div>

          {/* Sub-Models Comparison Grid */}
          {allPredictions && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Cpu size={16} className="text-slate-400 dark:text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Full Ensemble Model Breakdown</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(allPredictions).map(([modelName, result]) => (
                  <div key={modelName} className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg flex flex-col justify-between items-start gap-3">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight">{modelName}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${getRiskUI(result).badgeStyle}`}>
                      {result} RISK
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- INPUT FORM CARD --- */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        <div className="p-8 bg-medical-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-medical-500 to-medical-600 text-white shadow-md shadow-medical-500/30 rounded-lg">
                <FlaskConical size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">A.I. Risk Predictor Ensemble</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400">Run vital signs through 4 independent Machine Learning models instantly.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {role !== 'Patient' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient</label>
              <select 
                name="patient_id" 
                value={formData.patient_id} 
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-medical-200 focus:border-medical-500 transition-all outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
              >
                <option value="" disabled>-- Ensure Patient is Selected --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    ID {p.id}: {p.full_name} (Age: {p.age})
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === 'Patient' && (
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold flex items-center gap-2">
                <ActivitySquare size={18} />
                Personal Vitals Submission
              </h3>
              <p className="text-sm mt-1">Please enter your current readings accurately for the A.I. to assess your health risk.</p>
            </div>
          )}

          <hr className="border-slate-100 dark:border-slate-700" />

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Systolic BP</label>
                <div className="relative">
                  <ActivitySquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input type="number" step="0.1" name="systolic_bp" value={formData.systolic_bp} onChange={handleChange} required placeholder="120"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-medical-200 outline-none dark:bg-slate-700 dark:text-white" />
                </div>
                <p className="text-xs text-slate-400 mt-1">Expected: 70 - 160</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Diastolic BP</label>
                <div className="relative">
                  <ActivitySquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input type="number" step="0.1" name="diastolic_bp" value={formData.diastolic_bp} onChange={handleChange} required placeholder="80"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-medical-200 outline-none dark:bg-slate-700 dark:text-white" />
                </div>
                <p className="text-xs text-slate-400 mt-1">Expected: 40 - 100</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Sugar</label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input type="number" step="0.1" name="blood_sugar" value={formData.blood_sugar} onChange={handleChange} required placeholder="7.5"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-medical-200 outline-none dark:bg-slate-700 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Body Temp (°F)</label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input type="number" step="0.1" name="body_temp" value={formData.body_temp} onChange={handleChange} required placeholder="98.6"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-medical-200 outline-none dark:bg-slate-700 dark:text-white" />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Heart Rate (bpm)</label>
              <div className="relative">
                <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input type="number" step="0.1" name="heart_rate" value={formData.heart_rate} onChange={handleChange} required placeholder="75"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-medical-200 outline-none dark:bg-slate-700 dark:text-white" />
              </div>
            </div>
            
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full mt-4 bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 text-white font-bold text-lg py-4 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-medical-500/30 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? 'Analyzing via 4 ML Models...' : 'Run Risk Analysis Prediction'}
            {!status && <FlaskConical size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
