"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddMedication() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleNext = () => setStep(2);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const patientId = localStorage.getItem("patient_id");
      if (!patientId) {
        router.push("/");
        return;
      }

      // 1. Create generic medicine (we'll just use the name for V1)
      const medRes = await fetch("http://127.0.0.1:8000/medicines/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: medName,
          primary_image_url: "https://via.placeholder.com/150/3b82f6/ffffff?text=Pill" 
        })
      });
      
      const medData = await medRes.json();

      // 2. Add patient medication
      const addRes = await fetch("http://127.0.0.1:8000/medications/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          medicine_id: medData.id,
          dose: dose,
          frequency: frequency,
          notes: notes
        })
      });

      if (addRes.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to add medication.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      
      <header className="flex items-center mb-10 pt-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors mr-4 bg-slate-800/50 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Add Medication</h1>
      </header>

      <div className="glass-panel p-8 rounded-2xl">
        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400'}`}>1</div>
          <div className={`h-1 flex-grow mx-2 rounded ${step === 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-gray-400'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold text-white mb-6">Identify Medicine</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Medicine Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search e.g., Aspirin"
                    className="w-full px-4 py-3 pl-10 rounded-xl input-field text-sm"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 mt-2">Start typing to search our database.</p>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Upload Photo (Manual Entry)</label>
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:bg-slate-800/50 hover:border-blue-500/50 transition-colors cursor-pointer group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-500 group-hover:text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">Click to upload a picture of the pill or bottle</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!medName}
              className="w-full py-3 mt-8 rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Dosage
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSave} className="animate-in slide-in-from-right-4 duration-300 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Set Instructions for {medName}</h2>
            
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Dosage (e.g. 1 pill, 10mg)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl input-field text-sm"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Frequency</label>
              <select 
                required
                className="w-full px-4 py-3 rounded-xl input-field text-sm appearance-none"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="" disabled>Select how often</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="As needed">As needed</option>
                <option value="Every 8 hours">Every 8 hours</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Further Instructions / Notes (Optional)</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl input-field text-sm"
                rows={3}
                placeholder="e.g. Take with food, swallow whole"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-[2] py-3 rounded-xl btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Medication"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
