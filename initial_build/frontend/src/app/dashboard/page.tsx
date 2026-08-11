"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<any[]>([]);
  const [patientName, setPatientName] = useState<string>("Unknown Patient");
  const [patientCode, setPatientCode] = useState<string>("P-Unknown");
  const [role, setRole] = useState<string | null>(null);
  
  // Custom Modal State for Toggle
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{ medId: string; medName: string; currentStatus: boolean } | null>(null);

  // Custom Modal State for Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<{ medId: string; medName: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("patient_id");
      const userRole = localStorage.getItem("access_role");
      setRole(userRole);
      
      if (!token) {
        router.push("/");
        return;
      }
      
      try {
        // Fetch patient details
        const patientResponse = await fetch(`http://127.0.0.1:8000/patients/${token}`);
        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          setPatientName(patientData.name);
          setPatientCode(patientData.patient_code);
        }

        // Fetch medications
        fetchMedications(token);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchMedications = async (token: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/patient/${token}`);
      if (response.ok) {
        const data = await response.json();
        setMedications(data);
      } else {
        console.error("Failed to fetch medications");
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const confirmToggle = (medId: string, currentStatus: boolean, medName: string) => {
    if (role !== 'editor') return;
    setModalData({ medId, medName, currentStatus });
    setShowModal(true);
  };

  const executeToggle = async () => {
    if (!modalData) return;
    const { medId, currentStatus, medName } = modalData;
    const action = currentStatus ? "deactivate" : "activate";
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/${medId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (response.ok) {
        const token = localStorage.getItem("patient_id");
        if (token) fetchMedications(token);
      } else {
        alert(`Failed to ${action} medication.`);
      }
    } catch (error) {
      console.error("Error toggling medication status:", error);
      alert(`An error occurred while trying to ${action} medication.`);
    } finally {
      setShowModal(false);
      setModalData(null);
    }
  };

  const confirmDelete = (medId: string, medName: string) => {
    if (role !== 'editor') return;
    setDeleteModalData({ medId, medName });
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deleteModalData) return;
    const { medId, medName } = deleteModalData;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/${medId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const token = localStorage.getItem("patient_id");
        if (token) fetchMedications(token);
      } else {
        alert(`Failed to delete medication.`);
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert(`An error occurred while trying to delete medication.`);
    } finally {
      setShowDeleteModal(false);
      setDeleteModalData(null);
    }
  };

  if (loading) return null;

  const activeMedications = medications.filter(m => m.is_active);
  const inactiveMedications = medications.filter(m => !m.is_active);

  return (
    <div className="min-h-screen w-full px-6 py-6 animate-in fade-in duration-500">
      
      {/* Background elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-[10%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <header className="flex justify-between items-center mb-10 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Daily Schedule</h1>
          <p className="text-gray-400 mt-1">Patient: {patientName} ({patientCode})</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("patient_id");
            router.push("/");
          }}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </header>

      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Active Medications</h2>
          {role === 'editor' && (
            <Link href="/dashboard/add" className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {activeMedications.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">No active medications</div>
          )}
          {activeMedications.map((med) => (
            <div key={med.id} className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-slate-800/40 transition-all cursor-default group">
              
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                <img src={med.medicine_image || "https://via.placeholder.com/150/3b82f6/ffffff?text=Pill"} alt={med.medicine_name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{med.medicine_name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/20">
                    {med.dose}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{med.frequency}</p>
                {med.notes && (
                  <p className="text-gray-500 text-xs mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {med.notes}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex flex-row items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                 <div className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/10 mb-2">
                   {med.time}
                 </div>
                 
                 {role === 'editor' && (
                   <div className="flex items-center gap-3">
                     <label className="relative inline-flex items-center cursor-pointer" title="Deactivate">
                       <input 
                         type="checkbox" 
                         className="sr-only peer" 
                         checked={med.is_active} 
                         onChange={() => confirmToggle(med.id, med.is_active, med.medicine_name)}
                       />
                       <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                     </label>

                     <Link href={`/dashboard/edit/${med.id}`} className="text-gray-500 hover:text-white p-1 transition-colors" title="Edit">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                         <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                       </svg>
                     </Link>

                     <button onClick={() => confirmDelete(med.id, med.medicine_name)} className="text-red-400/70 hover:text-red-400 p-1 transition-colors" title="Delete">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                       </svg>
                     </button>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>

        {inactiveMedications.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-400">Inactive Medications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full opacity-60">
              {inactiveMedications.map((med) => (
                <div key={med.id} className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all cursor-default">
                  
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 transition-colors grayscale">
                    <img src={med.medicine_image || "https://via.placeholder.com/150/3b82f6/ffffff?text=Pill"} alt={med.medicine_name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white line-through">{med.medicine_name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-500/20 text-gray-300 text-xs font-medium border border-gray-500/20">
                        {med.dose}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{med.frequency}</p>
                  </div>

                  <div className="shrink-0 flex flex-row items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                     {role === 'editor' && (
                       <div className="flex items-center gap-3 mt-4 sm:mt-0">
                         <label className="relative inline-flex items-center cursor-pointer" title="Activate">
                           <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={med.is_active} 
                             onChange={() => confirmToggle(med.id, med.is_active, med.medicine_name)}
                           />
                           <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                         </label>

                         <Link href={`/dashboard/edit/${med.id}`} className="text-gray-500 hover:text-white p-1 transition-colors" title="Edit">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                             <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                           </svg>
                         </Link>

                         <button onClick={() => confirmDelete(med.id, med.medicine_name)} className="text-red-400/70 hover:text-red-400 p-1 transition-colors" title="Delete">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                           </svg>
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Custom Confirmation Modal */}
      {showModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">
              {modalData.currentStatus ? "Deactivate" : "Activate"} Medication
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to {modalData.currentStatus ? "deactivate" : "activate"} <strong>{modalData.medName}</strong>? 
              {modalData.currentStatus ? " It will be moved to the inactive list." : " It will be moved back to your active schedule."}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeToggle}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && deleteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Delete Medication</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to completely delete <strong>{deleteModalData.medName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
