import React, { useState } from "react";
import { 
  Calculator, FileSpreadsheet, FolderOpen, Plus, Heart, 
  Trash2, Layers, Calendar, Check, AlertCircle, Edit, Save 
} from "lucide-react";
import { Project, ProjectHistoryItem } from "../types";
import { formatRupiah } from "../data/standardAhsp";

interface BudgetSummaryProps {
  project: Project;
  projectHistory: ProjectHistoryItem[];
  onSelectProject: (projectId: string) => void;
  onNewProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectMeta: (name: string, desc: string) => void;
  totalCost: number;
  materialsCost: number;
  laborCost: number;
  toolsCost: number;
}

export default function BudgetSummary({
  project,
  projectHistory,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onUpdateProjectMeta,
  totalCost,
  materialsCost,
  laborCost,
  toolsCost,
}: BudgetSummaryProps) {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editingName, setEditingName] = useState(project.name);
  const [editingDesc, setEditingDesc] = useState(project.description);
  const [newProjName, setNewProjName] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const materialsPercent = totalCost > 0 ? (materialsCost / totalCost) * 100 : 0;
  const laborPercent = totalCost > 0 ? (laborCost / totalCost) * 100 : 0;
  const toolsPercent = totalCost > 0 ? (toolsCost / totalCost) * 100 : 0;

  const handleSaveMeta = () => {
    onUpdateProjectMeta(editingName.trim() || "Proyek Berjalan", editingDesc.trim());
    setIsEditingMeta(false);
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    onNewProject(newProjName.trim());
    setNewProjName("");
    setIsCreatingProject(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="rab-summary-analytics">
      {/* Left panel: Project selector and history */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 lg:col-span-1">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 align-middle">
            <Layers className="w-4 h-4 text-slate-400" />
            Daftar & Kontrol Proyek
          </h3>
          <button
            onClick={() => setIsCreatingProject(!isCreatingProject)}
            className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded cursor-pointer transition-colors flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            Proyek Baru
          </button>
        </div>

        {isCreatingProject && (
          <form onSubmit={handleCreateProjectSubmit} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 animate-slide-down">
            <span className="block text-[10px] font-bold text-slate-600 uppercase">Nama Proyek Baru</span>
            <input
              type="text"
              placeholder="Contoh: Renovasi Ruko Kebayoran..."
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              required
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="px-2.5 py-1 text-[10px] border border-slate-250 rounded text-slate-650 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[10px] bg-blue-600 hover:bg-blue-750 rounded text-white font-semibold cursor-pointer"
              >
                Buat Proyek
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
          {projectHistory.map((hist) => {
            const isActive = hist.id === project.id;
            return (
              <div
                key={hist.id}
                className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition ${
                  isActive
                    ? "border-blue-400 bg-blue-50/50 text-blue-950 font-semibold shadow-inner"
                    : "border-slate-150 hover:bg-slate-50 text-slate-755 hover:text-slate-900"
                }`}
              >
                <button
                  onClick={() => onSelectProject(hist.id)}
                  className="flex-1 text-left font-medium overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer hover:text-blue-600"
                >
                  {hist.name}
                </button>
                {projectHistory.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus proyek "${hist.name}" secara permanen?`)) {
                        onDeleteProject(hist.id);
                      }
                    }}
                    className={`ml-2 p-1 rounded transition hover:bg-red-100 hover:text-red-650 cursor-pointer ${
                      isActive ? "text-blue-400 hover:text-red-600" : "text-slate-400"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          {isEditingMeta ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1">Nama Proyek</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1">Deskripsi / Lokasi</label>
                <textarea
                  value={editingDesc}
                  rows={2}
                  onChange={(e) => setEditingDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Ketik detail rincian atau alamat pembangunan..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveMeta}
                  className="flex-1 py-1 px-3 bg-emerald-600 hover:bg-emerald-750 text-white font-semibold text-xs rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Catatan
                </button>
                <button
                  onClick={() => {
                    setEditingName(project.name);
                    setEditingDesc(project.description);
                    setIsEditingMeta(false);
                  }}
                  className="py-1 px-2.5 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between group">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <span>{project.name}</span>
                </h4>
                <button
                  onClick={() => {
                    setEditingName(project.name);
                    setEditingDesc(project.description);
                    setIsEditingMeta(true);
                  }}
                  className="p-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
                  title="Edit info proyek"
                >
                  <Edit className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                {project.description || "Belum ada keterangan proyek. Klik ikon pensil untuk menambahkan lokasi atau catatan pengerjaan."}
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-450">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Dibuat pada: {new Date(project.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center panel: KPI Cards for Structural Items and Indices */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest px-2.5 py-0.5 bg-blue-50/80 border border-blue-100/60 rounded inline-block">
            Rangkuman Analisa Koefisien Pekerjaan
          </span>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bagian Pekerjaan (Divisi)</span>
              <span className="font-bold text-2xl text-slate-900 font-mono block mt-1">{project.sections.length}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Kelompok divisi konstruksi aktif</span>
            </div>
            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
              <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Rincian Item Pekerjaan</span>
              <span className="font-bold text-2xl text-blue-900 font-mono block mt-1">{project.items.length}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Total analisa AHSP terpilih</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs">
          <h4 className="font-bold text-slate-800">Petunjuk Analisa Indeks & Koefisien</h4>
          <p className="text-slate-550 leading-relaxed text-[11px]">
            Sistem saat ini difokuskan sepenuhnya untuk menyusun daftar kuantitas pekerjaan konstruksi beserta breakdown 
            koefisien indeks bahan, tenaga, dan alat sesuai pedoman teknis atau model rancangan kustom kecerdasan buatan (AI).
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100 rounded">
              ✔ Referensi PUPR No. 01/2022
            </span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100 rounded">
              ✔ Estimasi Kuantitas Murni
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100 rounded">
              ✔ Bebas Unsur Biaya / Finansial
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
