"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AddMedicine() {
  const { id } = useParams();
  const router = useRouter();
  
  const [step, setStep] = useState(3); // Defaulting to step 3 to match the template UI
  
  const [formData, setFormData] = useState({
    medicine_name: 'Paracetamol',
    dose: '1 tablet',
    frequency: 'Twice daily',
    timing: 'After food',
    start_date: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Saving medicine", formData);
    router.push(`/dashboard/patients/${id}`);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Add Medicine</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <ol className="flex items-center space-x-2">
              <li><Link href="/dashboard" className="hover:text-gray-900 transition-colors">Patients</Link></li>
              <li><span>/</span></li>
              <li><Link href={`/dashboard/patients/${id}`} className="hover:text-gray-900 transition-colors">{id}</Link></li>
              <li><span>/</span></li>
              <li className="text-gray-900 font-medium">Add Medicine</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          
          <div className="flex flex-col items-center bg-white px-4 relative">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-2 shadow-[0_0_0_4px_white]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Search Medicine</span>
          </div>

          <div className="flex flex-col items-center bg-white px-4 relative">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-2 shadow-[0_0_0_4px_white]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Confirm Medicine</span>
          </div>

          <div className="flex flex-col items-center bg-white px-4 relative">
            <div className="w-8 h-8 rounded-full bg-[#FF6600] text-white flex items-center justify-center font-bold mb-2 shadow-[0_0_0_4px_white]">
              3
            </div>
            <span className="text-sm font-bold text-gray-900">Add Details</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dose</label>
              <select className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm">
                <option>1 tablet</option>
                <option>2 tablets</option>
                <option>5 ml</option>
                <option>10 ml</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Frequency</label>
              <select className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm">
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Thrice daily</option>
                <option>As needed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timing</label>
              <select className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm">
                <option>After food</option>
                <option>Before food</option>
                <option>With food</option>
                <option>Empty stomach</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                  defaultValue="2025-08-01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <input 
                type="text" 
                placeholder="Any additional notes"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
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
              Save Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
