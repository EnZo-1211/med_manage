"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL, apiFetch } from "../../../config";

export default function EditMedication() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [medName, setMedName] = useState("");
  const [notes, setNotes] = useState("");
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [specificTimes, setSpecificTimes] = useState<string[]>(['', '', '', '']);
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/medications/${id}`);
        if (response.ok) {
          const data = await response.json();
          setMedName(data.medicine_name);
          setDose(data.dose);
          setFrequency(data.frequency);
          setNotes(data.notes || "");
          
          if (data.day_of_week) {
            setDayOfWeek(data.day_of_week);
            setIsScheduleEnabled(true);
          } else if (data.time) {
            const times = data.time.split(',');
            const newTimes = ['', '', '', ''];
            times.forEach((t: string, i: number) => { if (i < 4) newTimes[i] = t; });
            setSpecificTimes(newTimes);
            setIsScheduleEnabled(true);
          }
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
      const isWeekly = frequency === "Once a week";
      
      let numInputs = 0;
      if (frequency === "Once daily") numInputs = 1;
      else if (frequency === "Twice daily") numInputs = 2;
      else if (frequency === "Thrice daily" || frequency === "Every 8 hours") numInputs = 3;
      
      const validTimes = specificTimes.slice(0, numInputs).filter(t => t !== "");
      const timeString = isScheduleEnabled && !isWeekly && validTimes.length > 0 ? validTimes.join(',') : null;
      const dayString = isScheduleEnabled && isWeekly ? dayOfWeek : null;

      const response = await apiFetch(`${API_BASE_URL}/medications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dose: dose,
          frequency: frequency,
          time: timeString,
          day_of_week: dayString,
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
                <label className="text-sm font-medium text-gray-300 block mb-2">Dose (per serving)</label>
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
                  <option value="Once a week">Once a week</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-4 mb-4">
                <label className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isScheduleEnabled}
                    onChange={(e) => setIsScheduleEnabled(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-600 bg-gray-700"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Add Specific Schedule (Optional)</div>
                    <div className="text-xs text-gray-400 mt-0.5">Set exact times or days for this medication</div>
                  </div>
                </label>

                {isScheduleEnabled && (
                  <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
                    {frequency === "Once a week" ? (
                      <div className="space-y-2 max-w-sm">
                        <label className="text-sm font-medium text-gray-300">Day of Week</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl input-field text-sm appearance-none"
                          value={dayOfWeek}
                          onChange={(e) => setDayOfWeek(e.target.value)}
                        >
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                    ) : frequency === "As needed" ? (
                      <div className="text-sm text-gray-400 italic">No specific schedule needed for "As needed" frequency.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: frequency === "Once daily" ? 1 : frequency === "Twice daily" ? 2 : 3 }).map((_, idx) => (
                          <div key={idx} className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Dose {idx + 1} Time</label>
                            <input 
                              type="time" 
                              className="w-full px-4 py-3 rounded-xl input-field text-sm"
                              value={specificTimes[idx]}
                              onChange={(e) => {
                                const newTimes = [...specificTimes];
                                newTimes[idx] = e.target.value;
                                setSpecificTimes(newTimes);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
