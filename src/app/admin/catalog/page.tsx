'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, ShieldCheck, AlertCircle, Check } from 'lucide-react';

export default function AdminCatalogManager() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingMed, setEditingMed] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editAnupana, setEditAnupana] = useState('');
  const [editPrescOnly, setEditPrescOnly] = useState(false);
  const [editDesc, setEditDesc] = useState('');

  // Creating state
  const [creatingMed, setCreatingMed] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newAnupana, setNewAnupana] = useState('');
  const [newPrescOnly, setNewPrescOnly] = useState(false);
  const [newDesc, setNewDesc] = useState('');

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/catalog');
      if (res.ok) {
        const json = await res.json();
        setMedicines(json.medicines);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          dosage: newDosage,
          anupana: newAnupana,
          prescriptionOnly: newPrescOnly,
          description: newDesc,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Medicine added to Ayurvedic catalog successfully!');
        setCreatingMed(false);
        setNewName('');
        setNewDosage('');
        setNewAnupana('');
        setNewPrescOnly(false);
        setNewDesc('');
        fetchCatalog();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to add medicine.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (med: any) => {
    setEditingMed(med);
    setEditName(med.name);
    setEditDosage(med.dosage);
    setEditAnupana(med.anupana);
    setEditPrescOnly(med.prescriptionOnly);
    setEditDesc(med.description || '');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/catalog/${editingMed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          dosage: editDosage,
          anupana: editAnupana,
          prescriptionOnly: editPrescOnly,
          description: editDesc,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Medicine updated successfully!');
        setEditingMed(null);
        fetchCatalog();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update medicine.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from the catalog?`)) return;

    setSuccessMsg('');
    setErrorMsg('');
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/catalog/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMsg('Medicine deleted successfully.');
        fetchCatalog();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to delete medicine.');
      }
    } catch (e) {
      setErrorMsg('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">Ayurvedic Medicine Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">Manage medicines, set standard dosages, and classify prescription-only items.</p>
        </div>
        <button
          onClick={() => setCreatingMed(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition duration-200 flex items-center space-x-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Herb / Vati</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-900 text-emerald-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-900 text-red-300 p-4 rounded-xl text-sm font-semibold flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Catalog List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span>Syncing Ayurvedic formulary...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((med) => (
            <div key={med.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display font-bold text-lg text-white">{med.name}</h3>
                  {med.prescriptionOnly && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-950 border border-red-900 text-red-400 uppercase">
                      Rx Only
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 font-bold block">Standard Dosage</span>
                    <span className="font-semibold">{med.dosage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Anupana (Vehicle)</span>
                    <span className="font-semibold">{med.anupana}</span>
                  </div>
                  {med.description && (
                    <p className="text-[11px] text-slate-400 mt-3 italic line-clamp-3">"{med.description}"</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-slate-800 mt-6 pt-4">
                <button
                  onClick={() => handleEditClick(med)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-slate-300 flex items-center cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(med.id, med.name)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-950 text-xs font-bold rounded text-red-400 flex items-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {creatingMed && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-white mb-6">Add Medicine to Catalog</h3>
            <form onSubmit={handleCreateMedicine} className="space-y-4">
              <div>
                <label htmlFor="new-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medicine Name</label>
                <input
                  id="new-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ashwagandha Churna"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-dosage" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Standard Dosage</label>
                  <input
                    id="new-dosage"
                    type="text"
                    required
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="1-2 tablets daily"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                  />
                </div>
                <div>
                  <label htmlFor="new-anupana" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anupana (Vehicle)</label>
                  <input
                    id="new-anupana"
                    type="text"
                    required
                    value={newAnupana}
                    onChange={(e) => setNewAnupana(e.target.value)}
                    placeholder="Warm water / honey"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="new-presc"
                  type="checkbox"
                  checked={newPrescOnly}
                  onChange={(e) => setNewPrescOnly(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-slate-700 rounded focus:ring-red-500 bg-slate-950 cursor-pointer"
                />
                <label htmlFor="new-presc" className="ml-2 text-xs text-slate-400 font-bold uppercase tracking-wider cursor-pointer">
                  Prescription Only (Rx)
                </label>
              </div>

              <div>
                <label htmlFor="new-desc" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Indications</label>
                <textarea
                  id="new-desc"
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe indications, therapeutic actions, and precautions..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreatingMed(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 font-bold rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm flex items-center cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingMed && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-white mb-6">Edit Medicine Details</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label htmlFor="edit-name-inp" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medicine Name</label>
                <input
                  id="edit-name-inp"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-dosage-inp" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Standard Dosage</label>
                  <input
                    id="edit-dosage-inp"
                    type="text"
                    required
                    value={editDosage}
                    onChange={(e) => setEditDosage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                  />
                </div>
                <div>
                  <label htmlFor="edit-anupana-inp" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anupana (Vehicle)</label>
                  <input
                    id="edit-anupana-inp"
                    type="text"
                    required
                    value={editAnupana}
                    onChange={(e) => setEditAnupana(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="edit-presc-inp"
                  type="checkbox"
                  checked={editPrescOnly}
                  onChange={(e) => setEditPrescOnly(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-slate-700 rounded focus:ring-red-500 bg-slate-955 cursor-pointer"
                />
                <label htmlFor="edit-presc-inp" className="ml-2 text-xs text-slate-400 font-bold uppercase tracking-wider cursor-pointer">
                  Prescription Only (Rx)
                </label>
              </div>

              <div>
                <label htmlFor="edit-desc-inp" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Indications</label>
                <textarea
                  id="edit-desc-inp"
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-955 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-950"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMed(null)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 font-bold rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm flex items-center cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
