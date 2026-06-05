import React, { useState } from "react";
import { 
  Plus, Trash2, FolderPlus, FolderDot, ChevronDown, ChevronUp, 
  Settings, HelpCircle, Package, Users, Wrench, Edit, Layers, PlusCircle, Check
} from "lucide-react";
import { Project, RABItem, AHSPItem, Component, Section } from "../types";
import { 
  formatRupiah, formatNumber, calculateAHSPItemUnitPrice, getComponentPrice, DEFAULT_COMPONENTS 
} from "../data/standardAhsp";

interface BudgetTableProps {
  project: Project;
  ahspDatabase: AHSPItem[];
  components: Component[];
  onAddSection: (name: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddRABItem: (sectionId: string, ahspId: string) => void;
  onUpdateVolume: (itemId: string, volume: number) => void;
  onDeleteRABItem: (itemId: string) => void;
}

export default function BudgetTable({
  project,
  ahspDatabase,
  components,
  onAddSection,
  onDeleteSection,
  onAddRABItem,
  onUpdateVolume,
  onDeleteRABItem,
}: BudgetTableProps) {
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedAhspMap, setSelectedAhspMap] = useState<Record<string, string>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleAddSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    onAddSection(newSectionName.trim());
    setNewSectionName("");
  };

  const handleAddWorkItem = (sectionId: string) => {
    const ahspId = selectedAhspMap[sectionId];
    if (!ahspId) return;
    onAddRABItem(sectionId, ahspId);
    // Reset selection
    setSelectedAhspMap((prev) => ({ ...prev, [sectionId]: "" }));
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItemId((prev) => (prev === itemId ? null : itemId));
  };

  const currentProjectTotal = project.items.reduce((total, item) => {
    const ahsp = ahspDatabase.find((a) => a.id === item.ahspId);
    if (!ahsp) return total;
    const unitPrice = calculateAHSPItemUnitPrice(ahsp, project.componentPrices, components);
    return total + unitPrice * item.volume;
  }, 0);

  return (
    <div className="space-y-6" id="rab-workbook-tab">
      {/* Action panel to create a new section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-base text-slate-900">Lembar Kerja RAB Proyek</h2>
          <p className="text-xs text-slate-500">
            Kelompokkan pekerjaan konstruksi ke dalam blok-blok bagian, pilih AHSP, dan masukkan volume pekerjaan untuk mulai menghitung biaya.
          </p>
        </div>
        <form onSubmit={handleAddSectionSubmit} className="flex gap-2 max-w-sm w-full shrink-0">
          <input
            type="text"
            placeholder="Tambah Bagian Pekerjaan, misal: Pondasi..."
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-550"
          />
          <button
            type="submit"
            disabled={!newSectionName.trim()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Buat Bagian
          </button>
        </form>
      </div>

      {project.sections.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-250 rounded-xl py-12 px-4 text-center text-slate-500 text-sm">
          <FolderDot className="w-10 h-10 text-slate-350 mx-auto mb-2" />
          Belum ada Bagian Pekerjaan dibuat.
          <p className="text-xs text-slate-400 mt-1">
            Gunakan jalut form di atas untuk membuat pembagian, misalnya: "Pekerjaan Persiapan", "Pekerjaan Struktur".
          </p>
        </div>
      ) : (
        <div className="space-y-8" id="rab-sections-accordion">
          {project.sections.map((section) => {
            const sectionItems = project.items.filter((i) => i.sectionId === section.id);

            // Calculate section total
            const sectionTotalCost = sectionItems.reduce((total, item) => {
              const ahsp = ahspDatabase.find((a) => a.id === item.ahspId);
              if (!ahsp) return total;
              const unitPrice = calculateAHSPItemUnitPrice(ahsp, project.componentPrices, components);
              return total + unitPrice * item.volume;
            }, 0);

            return (
              <div
                key={section.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md/5 transition duration-150"
              >
                {/* Section Header */}
                <div className="bg-slate-50 px-4 py-3 md:px-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-200/80 text-slate-700 rounded-lg">
                      <FolderDot className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{section.name}</h3>
                      <span className="text-[10px] text-slate-500">
                        Total {sectionItems.length} rincian pekerjaan dalam divisi ini
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus seluruh bagian "${section.name}" beserta di dalamnya?`)) {
                          onDeleteSection(section.id);
                        }
                      }}
                      className="p-1.5 border border-red-200 text-red-650 bg-red-50/50 hover:bg-red-50 rounded-lg text-xs flex items-center justify-center cursor-pointer transition shrink-0"
                      title="Hapus Bagian Pekerjaan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Worker Content inside this Section */}
                <div className="p-4 md:p-5 space-y-4">
                  {/* Select and add custom/prebuilt ahsp item picker */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-end pt-1 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <div className="flex-1 w-full animate-fade-in">
                      <label className="block text-[10px] font-bold text-slate-550 mb-1 uppercase tracking-wider">
                        Pilih Pekerjaan Standar AHSP atau AI Custom untuk Ditambahkan
                      </label>
                      <select
                        value={selectedAhspMap[section.id] || ""}
                        onChange={(e) =>
                          setSelectedAhspMap((prev) => ({ ...prev, [section.id]: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 border rounded-lg border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">-- Pilih item pekerjaan konstruksi --</option>
                        
                        {/* Standard Items Group */}
                        <optgroup label="Standar AHSP PUPR">
                          {ahspDatabase.filter(a => !a.isCustom).map((ahsp) => (
                            <option key={ahsp.id} value={ahsp.id}>
                              [{ahsp.id}] {ahsp.name} (per {ahsp.unit})
                            </option>
                          ))}
                        </optgroup>

                        {/* AI Customized Items Group */}
                        {ahspDatabase.some(a => a.isCustom) && (
                          <optgroup label="Asisten AI (Custom)">
                            {ahspDatabase.filter(a => a.isCustom).map((ahsp) => (
                              <option key={ahsp.id} value={ahsp.id}>
                                [AI Custom] {ahsp.name} (per {ahsp.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                    <button
                      onClick={() => handleAddWorkItem(section.id)}
                      disabled={!selectedAhspMap[section.id]}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer h-8 w-full sm:w-auto"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Tambah Pekerjaan
                    </button>
                  </div>

                  {/* List of active work items in the section */}
                  {sectionItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-100 rounded-lg">
                      Belum ada rincian pekerjaan ditambahkan di bagian ini.
                    </div>
                  ) : (
                    <div className="border border-slate-200/80 rounded-lg overflow-hidden bg-white">
                      <div className="overflow-x-auto font-sans">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                              <th className="py-2.5 px-3">Kode / Deskripsi Pekerjaan</th>
                              <th className="py-2.5 px-3 text-center">Satuan</th>
                              <th className="py-2.5 px-3 text-right w-32">Volume Kerja</th>
                              <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sectionItems.map((item) => {
                              const ahsp = ahspDatabase.find((a) => a.id === item.ahspId);
                              if (!ahsp) return null;

                              const unitPrice = calculateAHSPItemUnitPrice(ahsp, project.componentPrices, components);
                              const totalCost = unitPrice * item.volume;
                              const isExpanded = expandedItemId === item.id;

                              return (
                                <React.Fragment key={item.id}>
                                  <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? "bg-blue-50/10" : ""}`}>
                                    <td className="py-3 px-3">
                                      <div className="flex items-center gap-1">
                                        <span className="font-mono text-[10px] text-gray-400 font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                          [{ahsp.id}]
                                        </span>
                                        {ahsp.isCustom && (
                                          <span className="text-[8px] bg-blue-100 text-blue-700 px-1 font-bold rounded uppercase tracking-wider whitespace-nowrap">
                                            AI CUSTOM
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-semibold text-slate-900 mt-1">{item.name}</div>
                                    </td>
                                    <td className="py-3 px-3 text-center font-mono text-slate-600 font-semibold">
                                      {ahsp.unit}
                                    </td>
                                    <td className="py-3 px-3">
                                      <input
                                        type="number"
                                        placeholder="0.0"
                                        value={item.volume === 0 ? "" : item.volume}
                                        onChange={(e) =>
                                          onUpdateVolume(item.id, Math.max(0, Number(e.target.value)))
                                        }
                                        className="w-full px-2 py-1 border border-slate-350 rounded-lg text-right font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                      />
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          onClick={() => toggleItemExpansion(item.id)}
                                          className={`p-1 border rounded-lg text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer transition-colors ${
                                            isExpanded
                                              ? "border-amber-300 text-amber-800 bg-amber-50"
                                              : "border-slate-200 text-slate-650 hover:bg-slate-100"
                                          }`}
                                          title="Detail Analisa AHSP"
                                        >
                                          {isExpanded ? (
                                            <>
                                              Tutup
                                              <ChevronUp className="w-3.5 h-3.5" />
                                            </>
                                          ) : (
                                            <>
                                              Analisa
                                              <ChevronDown className="w-3.5 h-3.5" />
                                            </>
                                          )}
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Hapus pekerjaan "${item.name}" dari lembar kerja?`)) {
                                              onDeleteRABItem(item.id);
                                            }
                                          }}
                                          className="p-1.5 border border-red-200 text-red-650 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                          title="Hapus Pekerjaan"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Detailed Analysis Coefficient Row Expansion */}
                                  {isExpanded && (
                                    <tr className="bg-slate-50/50">
                                      <td colSpan={4} className="py-4 px-6 border-y border-slate-200 animate-slide-down">
                                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="text-[11px] font-bold text-blue-900 border-l-2 border-blue-600 pl-2 uppercase tracking-wide">
                                              Rincian Analisa Koefisien AHSP Standar (Volume = {item.volume} {ahsp.unit})
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-500">
                                              Dihitung per 1 {ahsp.unit} pekerjaan
                                            </span>
                                          </div>

                                          <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                              <thead>
                                                <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/40">
                                                  <th className="py-2 px-3">Bahan, Tenaga & Alat</th>
                                                  <th className="py-2 px-3 text-center">Kategori</th>
                                                  <th className="py-2 px-3 text-center">Satuan</th>
                                                  <th className="py-2 px-3 text-right">Koefisien AHSP</th>
                                                  <th className="py-2 px-3 text-right">Total Kebutuhan Proyek</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100 text-slate-800">
                                                {ahsp.coefficients.map((coef) => {
                                                  const component = components.find((c) => c.id === coef.componentId) || DEFAULT_COMPONENTS.find((c) => c.id === coef.componentId);
                                                  const name = component ? component.name : coef.componentId;
                                                  const cat = component ? component.category : "bahan";
                                                  const unit = component ? component.unit : "-";

                                                  const itemTotalQty = coef.coefficient * item.volume;

                                                  return (
                                                    <tr key={coef.componentId} className="hover:bg-slate-50/50">
                                                      <td className="py-1.5 px-3 font-semibold text-slate-900">{name}</td>
                                                      <td className="py-1.5 px-3 text-center">
                                                        <span
                                                          className={`inline-block text-[9px] uppercase font-bold px-1 py-0.2 rounded ${
                                                            cat === "bahan"
                                                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                              : cat === "tenaga"
                                                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                              : "bg-purple-50 text-purple-700 border border-purple-100"
                                                          }`}
                                                        >
                                                          {cat}
                                                        </span>
                                                      </td>
                                                      <td className="py-1.5 px-3 text-center font-mono text-slate-500">
                                                        {unit}
                                                      </td>
                                                      <td className="py-1.5 px-3 text-right font-mono text-slate-700 font-medium">
                                                        {coef.coefficient.toFixed(4)}
                                                      </td>
                                                      <td className="py-1.5 px-3 text-right font-mono font-bold text-blue-900 bg-blue-50/30">
                                                        {formatNumber(itemTotalQty, 3)} {unit}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
