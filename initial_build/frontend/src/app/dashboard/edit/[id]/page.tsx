"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditMedication() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/medications/${id}`);
        if (response.ok) {
          const data = await response.json();
          setMedName(data.medicine_name);
          setDose(data.dose);
          setFrequency(data.frequency);
          setNotes(data.notes || "");
        } else {
          alert("Medication not found.");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching medication:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchMedication();
    }
  }, [id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/medications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dose: dose,
          frequency: frequency,
          notes: notes
        })
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to update medication.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      
      <header className="flex items-center mb-10 pt-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors mr-4 bg-slate-800/50 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Edit Medication</h1>
      </header>

      <div className="glass-panel p-8 rounded-2xl">
        <form onSubmit={handleSave} className="animate-in slide-in-from-right-4 duration-300 space-y-8">
          
          {/* Identify Medicine Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Medicine</h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Medicine Name</label>
                <input
                  type="text"
                  disabled
                  className="w-full px-4 py-3 rounded-xl input-field text-sm opacity-60 cursor-not-allowed"
                  value={medName}
                />
                <p className="text-xs text-gray-500 mt-2">The medicine name cannot be changed. Add a new medication instead if needed.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-8"></div>

          {/* Instructions Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Update Instructions</h2>
            <div className="space-y-6">
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
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-3 rounded-xl btn-primary"
              disabled={saving || !dose || !frequency}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
