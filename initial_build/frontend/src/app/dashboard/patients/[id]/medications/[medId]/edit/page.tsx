"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../../../config";

export default function EditMedicine() {
  const { id, medId } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    medicine_name: '',
    dose: '',
    frequency: '',
    notes: ''
  });

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/medications/${medId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            medicine_name: data.medicine_name,
            dose: data.dose,
            frequency: data.frequency,
            notes: data.notes || ''
          });
        }
      } catch (error) {
        console.error("Error fetching medication:", error);
      } finally {
        setLoading(false);
      }
    };
    if (medId) {
      fetchMedication();
    }
  }, [medId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/medications/${medId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dose: formData.dose, 
          frequency: formData.frequency, 
          notes: formData.notes,
          is_active: true // Always reactivate when updating dosage from here
        })
      });
      if (response.ok) {
        router.push(`/dashboard/patients/${id}`);
      } else {
        alert("Failed to update medication");
      }
    } catch (error) {
      console.error("Error updating medication:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Back Button and Title */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Medication: {formData.medicine_name}</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <ol className="flex items-center space-x-2">
              <li><Link href="/dashboard" className="hover:text-gray-900 transition-colors">Patients</Link></li>
              <li><span>/</span></li>
              <li><Link href={`/dashboard/patients/${id}`} className="hover:text-gray-900 transition-colors">{id}</Link></li>
              <li><span>/</span></li>
              <li className="text-gray-900 font-medium">Edit</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dose</label>
              <input 
                type="text" 
                value={formData.dose}
                onChange={(e) => setFormData({...formData, dose: e.target.value})}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Frequency</label>
              <input 
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional notes"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#FF6600] hover:bg-[#E65C00] transition-colors shadow-sm"
            >
              Update and Reactivate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
