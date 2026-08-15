"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL, apiFetch } from "../../../../config";

export default function EditPatient() {
  const { id } = useParams();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [notes, setNotes] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/patients/${id}`);
        if (response.ok) {
          const data = await response.json();
          setName(data.name || "");
          setDateOfBirth(data.date_of_birth || "");
          setGender(data.gender || "");
          setBloodGroup(data.blood_group || "");
          setNotes(data.notes || "");
        } else {
          console.error("Patient not found");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPatient();
    }
  }, [id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await apiFetch(`${API_BASE_URL}/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          date_of_birth: dateOfBirth || undefined,
          gender: gender || undefined,
          blood_group: bloodGroup || undefined,
          notes: notes || undefined
        })
      });

      if (response.ok) {
        router.push(`/dashboard/patients/${id}`);
      } else {
        alert("Failed to update patient.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-300 py-6">
      
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
          <nav className="flex text-sm text-gray-500 mt-1">
            <ol className="flex items-center space-x-2">
              <li><Link href="/dashboard" className="hover:text-gray-900 transition-colors">Patients</Link></li>
              <li><span>/</span></li>
              <li><Link href={`/dashboard/patients/${id}`} className="hover:text-gray-900 transition-colors">{name}</Link></li>
              <li><span>/</span></li>
              <li className="text-gray-900 font-medium">Edit</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Date of Birth</label>
              <input
                type="date"
                required
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Gender</label>
              <select
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Blood Group</label>
              <select
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="" disabled>Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Notes (Optional)</label>
            <textarea
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-3 text-sm"
              rows={4}
              placeholder="Any additional notes or medical history..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#FF6600] hover:bg-[#E65C00] transition-colors shadow-sm disabled:opacity-50 flex items-center"
              disabled={saving || !name || !dateOfBirth}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
