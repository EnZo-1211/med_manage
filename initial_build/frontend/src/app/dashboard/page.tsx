"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<any[]>([]);

  useEffect(() => {
    const fetchMedications = async () => {
      const token = localStorage.getItem("patient_id");
      if (!token) {
        router.push("/");
        return;
      }
      
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
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Background elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-[10%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <header className="flex justify-between items-center mb-10 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Daily Schedule</h1>
          <p className="text-gray-400 mt-1">Patient: P-10382</p>
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
          <Link href="/dashboard/add" className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New
          </Link>
        </div>

        <div className="grid gap-4">
          {medications.map((med) => (
            <div key={med.id} className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-slate-800/40 transition-all cursor-pointer group">
              
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {med.notes}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                 <div className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/10">
                   {med.time}
                 </div>
                 <button className="text-gray-500 hover:text-white mt-2 p-1 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                     <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                   </svg>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
