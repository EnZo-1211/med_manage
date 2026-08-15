"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL, apiFetch } from "../../../../config";

interface MedicineCandidate {
  name: string;
  generic_name?: string;
  brand_name?: string;
}

export default function AddMedicine() {
  const { id } = useParams();
  const router = useRouter();
  
  const [medName, setMedName] = useState("");
  const [searchResults, setSearchResults] = useState<MedicineCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [dose, setDose] = useState("1 tablet");
  const [frequency, setFrequency] = useState("Twice daily");
  const [timing, setTiming] = useState("After food"); // old timing (route/instructions)
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [specificTimes, setSpecificTimes] = useState<string[]>(['', '', '', '']);
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (medName.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiFetch(`${API_BASE_URL}/medicines/search?q=${encodeURIComponent(medName)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [medName]);

  const handleSelectMedication = (name: string) => {
    setMedName(name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create/Find medicine genericly first
      const medRes = await apiFetch(`${API_BASE_URL}/medicines/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: medName,
          primary_image_url: "https://via.placeholder.com/150/3b82f6/ffffff?text=Pill" 
        })
      });
      const medData = await medRes.json();

      const isWeekly = frequency === "Once a week";
      
      // Figure out how many times to save based on frequency
      let numInputs = 0;
      if (frequency === "Once daily") numInputs = 1;
      else if (frequency === "Twice daily") numInputs = 2;
      else if (frequency === "Thrice daily" || frequency === "Every 8 hours") numInputs = 3;
      
      const validTimes = specificTimes.slice(0, numInputs).filter(t => t !== "");
      const timeString = isScheduleEnabled && !isWeekly && validTimes.length > 0 ? validTimes.join(',') : undefined;
      const dayString = isScheduleEnabled && isWeekly ? dayOfWeek : undefined;

      // 2. Add patient medication
      const response = await apiFetch(`${API_BASE_URL}/medications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: id,
          medicine_id: medData.id,
          dose,
          frequency,
          instructions: timing, // Use instructions field for 'timing' (After food, etc)
          time: timeString,
          day_of_week: dayString,
          start_date: startDate,
          notes
        }),
      });

      if (response.ok) {
        router.replace(`/dashboard/patients/${id}`);
      } else {
        console.error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving medicine", error);
    } finally {
      setLoading(false);
    }
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
        
        {/* Simplified Header instead of Stepper */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h2 className="text-lg font-semibold text-gray-900">Medicine Details</h2>
          <p className="text-sm text-gray-500 mt-1">Search for a medicine and enter the prescription details below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-8">
            <label className="text-sm font-medium text-gray-700 block mb-2">Medicine Name</label>
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                required
                placeholder="Search e.g., Aspirin"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm pr-10"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {isSearching && (
                <div className="absolute right-10 top-3.5">
                  <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <div 
                      key={idx}
                      className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      onClick={() => handleSelectMedication(result.name)}
                    >
                      <p className="text-sm font-medium text-gray-900">{result.name}</p>
                      {(result.generic_name || result.brand_name) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {result.generic_name && `Generic: ${result.generic_name}`}
                          {result.generic_name && result.brand_name && ' | '}
                          {result.brand_name && `Brand: ${result.brand_name}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dose (per serving)</label>
              <select 
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
              >
                <option>1 tablet</option>
                <option>2 tablets</option>
                <option>5 ml</option>
                <option>10 ml</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Frequency</label>
              <select 
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Thrice daily</option>
                <option>As needed</option>
                <option>Once a week</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Instructions</label>
              <select 
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
              >
                <option>After food</option>
                <option>Before food</option>
                <option>With food</option>
                <option>Empty stomach</option>
              </select>
            </div>
          </div>

            <div className="md:col-span-3 space-y-4">
              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isScheduleEnabled}
                  onChange={(e) => setIsScheduleEnabled(e.target.checked)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Add Specific Schedule (Optional)</div>
                  <div className="text-xs text-gray-500 mt-0.5">Set exact times or days for this medication</div>
                </div>
              </label>

              {isScheduleEnabled && (
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                  {frequency === "Once a week" ? (
                    <div className="space-y-2 max-w-sm">
                      <label className="text-sm font-medium text-gray-700">Day of Week</label>
                      <select 
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(e.target.value)}
                      >
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                      </select>
                    </div>
                  ) : frequency === "As needed" ? (
                    <div className="text-sm text-gray-500 italic">No specific schedule needed for "As needed" frequency.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: frequency === "Once daily" ? 1 : frequency === "Twice daily" ? 2 : 3 }).map((_, idx) => (
                        <div key={idx} className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Dose {idx + 1} Time</label>
                          <input 
                            type="time" 
                            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <input 
                type="text" 
                placeholder="Any additional notes"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#FF6600] hover:bg-[#E65C00] transition-colors shadow-sm disabled:opacity-50 flex items-center"
              disabled={loading || !medName}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Medicine"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
