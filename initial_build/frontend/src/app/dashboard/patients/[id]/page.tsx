"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('medications');
  const role = "editor"; // Assuming editor for this admin view

  // Modal State for Toggle
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{ medId: string; medName: string; currentStatus: boolean; dose?: string; frequency?: string; notes?: string } | null>(null);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [dosageOption, setDosageOption] = useState<'keep' | 'change'>('keep');

  // Modal State for Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<{ medId: string; medName: string } | null>(null);

  const fetchData = async () => {
    try {
      // Fetch patient details
      const patientResponse = await fetch(`http://127.0.0.1:8000/patients/${id}`);
      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        setPatient(patientData);
        
        // Fetch medications
        const medResponse = await fetch(`http://127.0.0.1:8000/medications/patient/${id}`);
        if (medResponse.ok) {
          const medData = await medResponse.json();
          setMedications(medData);
        }

        // Fetch reports
        const reportsResponse = await fetch(`http://127.0.0.1:8000/reports/patient/${id}`);
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setReports(reportsData);
        }
      } else {
        console.error("Patient not found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const confirmToggle = (medId: string, currentStatus: boolean, medName: string, dose?: string, frequency?: string, notes?: string) => {
    if (role !== 'editor') return;
    setModalData({ medId, medName, currentStatus, dose, frequency, notes });
    setIsNoteExpanded(false);
    setShowModal(true);
  };

  const executeToggle = async () => {
    if (!modalData) return;
    const { medId, currentStatus } = modalData;
    const action = currentStatus ? "deactivate" : "activate";
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/${medId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (response.ok) {
        fetchData();
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
    const { medId } = deleteModalData;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/${medId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchData();
      } else {
        alert("Failed to delete medication.");
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert("An error occurred while trying to delete the medication.");
    } finally {
      setShowDeleteModal(false);
      setDeleteModalData(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/reports/patient/${id}`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        fetchData(); // Refresh reports
      } else {
        alert("Failed to upload report.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/reports/${reportId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchData();
      } else {
        alert("Failed to delete report.");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center py-12 text-gray-500">Patient not found</div>;
  }

  const activeMedications = medications.filter(m => m.is_active !== false);
  const inactiveMedications = medications.filter(m => m.is_active === false);

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-300 pb-12">
      
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-6">
        <ol className="flex items-center space-x-2">
          <li><Link href="/dashboard" className="hover:text-gray-900 transition-colors">Patients</Link></li>
          <li><span>/</span></li>
          <li className="text-gray-900 font-medium">{patient.patient_code}</li>
        </ol>
      </nav>

      {/* Top Section: Profile Card taking full width */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center md:text-left pt-2">
            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mt-2">
              <span>Patient ID: {patient.patient_code}</span>
              <span>•</span>
              <span>Age: {calculateAge(patient.date_of_birth)}</span>
              <span>•</span>
              <span>{patient.gender || 'Unknown'}</span>
            </div>
          </div>
        </div>
        
        <button className="py-2.5 px-6 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 whitespace-nowrap shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Patient
        </button>
      </div>

      {/* Bottom Section: Tabs and Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-2 overflow-x-auto">
          {['Overview', 'Medications', 'Reports', 'History'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-8 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.toLowerCase()
                  ? 'border-orange-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
              {['History'].includes(tab) && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 font-semibold">Soon</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'medications' && (
            <div className="space-y-8">
              
              {/* Active Medications */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Current Medications</h3>
                  <Link 
                    href={`/dashboard/patients/${id}/add`}
                    className="bg-[#FF6600] hover:bg-[#E65C00] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Medicine
                  </Link>
                </div>

                {activeMedications.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    No active medications found for this patient.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {activeMedications.map((med) => (
                      <div key={med.id} className="flex flex-col p-5 rounded-xl border bg-white border-gray-200 shadow-sm relative group hover:border-orange-300 transition-colors">
                        
                        {/* Toggle Switch */}
                        {role === 'editor' && (
                          <div className="absolute top-4 right-4 z-10">
                            <label className="relative inline-flex items-center cursor-pointer" title="Deactivate">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={med.is_active !== false} 
                                onChange={() => confirmToggle(med.id, med.is_active !== false, med.medicine_name, med.dose, med.frequency, med.notes)}
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                            {med.medicine_image ? (
                              <img src={med.medicine_image} alt={med.medicine_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl text-gray-300">💊</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <h4 className="text-base font-bold text-gray-900 truncate" title={med.medicine_name}>
                              {med.medicine_name}
                            </h4>
                            {med.dose && <div className="text-sm text-gray-500 mt-0.5">{med.dose}</div>}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600 mb-4 flex-1">
                          {med.frequency && <span>{med.frequency}</span>}
                          {med.frequency && med.time && <span className="text-gray-300">•</span>}
                          {med.time && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {med.time.includes('Morning') ? 'Morning' : med.time.includes('Night') ? 'Night' : med.time}
                            </span>
                          )}
                          {med.notes && <div className="w-full text-xs text-gray-500 mt-1">{med.notes}</div>}
                        </div>

                        {role === 'editor' && (
                          <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100 mt-auto">
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button onClick={() => confirmDelete(med.id, med.medicine_name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inactive Medications */}
              {inactiveMedications.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-6">Inactive Medications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
                    {inactiveMedications.map((med) => (
                      <div key={med.id} className="flex flex-col p-5 rounded-xl border bg-gray-50 border-gray-200 relative">
                        
                        {/* Toggle Switch */}
                        {role === 'editor' && (
                          <div className="absolute top-4 right-4 z-10">
                            <label className="relative inline-flex items-center cursor-pointer" title="Activate">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={med.is_active !== false} 
                                onChange={() => confirmToggle(med.id, false, med.medicine_name, med.dose, med.frequency, med.notes)}
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 grayscale">
                            {med.medicine_image ? (
                              <img src={med.medicine_image} alt={med.medicine_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl text-gray-300">💊</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <h4 className="text-base font-bold text-gray-500 truncate" title={med.medicine_name}>
                              {med.medicine_name}
                            </h4>
                            {med.dose && <div className="text-sm text-gray-400 mt-0.5">{med.dose}</div>}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 mb-4 flex-1">
                          {med.frequency && <span>{med.frequency}</span>}
                        </div>

                        {role === 'editor' && (
                          <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-200 mt-auto">
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button onClick={() => confirmDelete(med.id, med.medicine_name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Box */}
              <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-orange-700 font-medium">Always consult your doctor before making any changes to medications.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Prescriptions & Reports</h3>
                <label className="bg-[#FF6600] hover:bg-[#E65C00] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Report
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.pdf" 
                    onChange={handleFileUpload} 
                  />
                </label>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  No reports or prescriptions found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:border-orange-300 transition-colors flex flex-col">
                      <a href={`http://127.0.0.1:8000${report.file_path}`} target="_blank" rel="noopener noreferrer" className="block h-40 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {report.file_name?.toLowerCase().endsWith('.pdf') ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                           </svg>
                        ) : (
                           <img src={`http://127.0.0.1:8000${report.file_path}`} alt="Report" className="w-full h-full object-cover" />
                        )}
                      </a>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={report.file_name}>{report.file_name || 'Report'}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(report.created_at).toLocaleDateString()}</div>
                        {report.notes && <div className="text-sm text-gray-600 mt-2 truncate">{report.notes}</div>}
                        <button onClick={() => handleDeleteReport(report.id)} className="text-red-500 text-xs mt-auto pt-3 hover:text-red-700 font-medium text-left">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {!['medications', 'reports'].includes(activeTab) && (
            <div className="py-12 text-center text-gray-500">
              This section is under development.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      
      {/* Toggle Modal */}
      {showModal && modalData && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {modalData.currentStatus ? "Deactivate" : "Activate"} Medication
        </h3>
        
        {modalData.currentStatus ? (
          <p className="text-gray-500 mb-6 text-sm">
            Are you sure you want to deactivate <strong>{modalData.medName}</strong>? 
            It will be moved to the inactive list.
          </p>
        ) : (
          <div className="mb-6">
            <p className="text-gray-500 mb-4 text-sm">
              You are about to activate <strong>{modalData.medName}</strong>. Do you want to keep the same dosage or change it?
            </p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="dosageOption" 
                  value="keep" 
                  checked={dosageOption === 'keep'}
                  onChange={() => setDosageOption('keep')}
                  className="mt-1 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Keep same dosage</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {modalData.dose || 'Will reactivate with the previous dose'}
                    {modalData.frequency ? ` • ${modalData.frequency}` : ''}
                  </div>
                  {modalData.notes && (
                    <div className="text-xs text-gray-400 mt-1 italic">
                      Note: {isNoteExpanded || modalData.notes.length <= 60 
                        ? modalData.notes 
                        : `${modalData.notes.substring(0, 60)}... `}
                      {modalData.notes.length > 60 && (
                        <button 
                          onClick={(e) => { e.preventDefault(); setIsNoteExpanded(!isNoteExpanded); }} 
                          className="text-orange-500 hover:underline ml-1 font-medium"
                        >
                          {isNoteExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="dosageOption" 
                  value="change" 
                  checked={dosageOption === 'change'}
                  onChange={() => setDosageOption('change')}
                  className="mt-1 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Change dosage</div>
                  <div className="text-xs text-gray-500 mt-0.5">Redirects to edit page</div>
                </div>
              </label>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => { setShowModal(false); setDosageOption('keep'); }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (!modalData.currentStatus && dosageOption === 'change') {
                router.push(`/dashboard/patients/${id}/medications/${modalData.medId}/edit`);
                setShowModal(false);
              } else {
                executeToggle();
              }
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#FF6600] hover:bg-[#E65C00] text-white transition-colors"
          >
            {(!modalData.currentStatus && dosageOption === 'change') ? "Continue to Edit" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )}

      {/* Delete Modal */}
      {showDeleteModal && deleteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Medication</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to completely delete <strong>{deleteModalData.medName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
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
