/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, Brain, Search, Trash2, BookOpen, Layers, 
  HelpCircle, ChevronRight, ChevronDown, CheckCircle, RefreshCw, FileSpreadsheet 
} from "lucide-react";
import { AHSPItem, Component } from "./types";
import { 
  DEFAULT_COMPONENTS, STANDARD_AHSP_DATABASE 
} from "./data/standardAhsp";

import AiAhspCreator from "./components/AiAhspCreator";
import RabDocumentCompiler from "./components/RabDocumentCompiler";

export default function App() {
  const [customAhspDatabase, setCustomAhspDatabase] = useState<AHSPItem[]>([]);
  const [customComponents, setCustomComponents] = useState<Component[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "standar" | "kustom">("semua");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"asisten" | "dokumen">("asisten");

  // Load from localStorage on initialization
  useEffect(() => {
    const savedCustomAhsp = localStorage.getItem("rab_sh_custom_ahsp");
    const savedCustomComponents = localStorage.getItem("rab_sh_custom_components");

    if (savedCustomAhsp) {
      try {
        setCustomAhspDatabase(JSON.parse(savedCustomAhsp));
      } catch (e) {
        console.error("Error loading custom AHSP:", e);
      }
    }

    if (savedCustomComponents) {
      try {
        setCustomComponents(JSON.parse(savedCustomComponents));
      } catch (e) {
        console.error("Error loading custom components:", e);
      }
    }
  }, []);

  // Save changes to localStorage on updates
  useEffect(() => {
    localStorage.setItem("rab_sh_custom_ahsp", JSON.stringify(customAhspDatabase));
  }, [customAhspDatabase]);

  useEffect(() => {
    localStorage.setItem("rab_sh_custom_components", JSON.stringify(customComponents));
  }, [customComponents]);

  // Combine standard PUPR and AI-generated AHSPs
  const fullAhspDatabase = useMemo(() => {
    return [...customAhspDatabase, ...STANDARD_AHSP_DATABASE];
  }, [customAhspDatabase]);

  // Combine standard and custom component types
  const fullComponentsDatabase = useMemo(() => {
    return [...DEFAULT_COMPONENTS, ...customComponents];
  }, [customComponents]);

  // Handle adding custom items from AI generator
  const handleAddCustomAhsp = (newItem: AHSPItem, newComponents: Component[]) => {
    setCustomAhspDatabase((prev) => {
      if (prev.some((a) => a.id === newItem.id)) return prev;
      return [newItem, ...prev]; // Put new AI generation at the top
    });

    setCustomComponents((prev) => {
      const filtered = newComponents.filter((c) => !prev.some((existing) => existing.id === c.id));
      return [...prev, ...filtered];
    });

    // Auto-select/expand the newly designed item to inspect details
    setExpandedItemId(newItem.id);
  };

  // Handle deleting a custom designed AHSP item
  const handleDeleteCustomAhsp = (id: string) => {
    if (confirm("Hapus item analisa draf kustom ini dari pustaka Anda?")) {
      setCustomAhspDatabase((prev) => prev.filter((a) => a.id !== id));
      if (expandedItemId === id) setExpandedItemId(null);
    }
  };

  // Filter items based on search query and selected filter tabs
  const filteredAhspItems = useMemo(() => {
    return fullAhspDatabase.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterType === "semua" ||
        (filterType === "id-CUSTOM" && item.isCustom) || // backwards compatibility
        (filterType === "kustom" && item.isCustom) ||
        (filterType === "standar" && !item.isCustom);

      return matchesSearch && matchesFilter;
    });
  }, [fullAhspDatabase, searchQuery, filterType]);

  // Total statistics for indicator cards
  const stats = useMemo(() => {
    const totalItems = fullAhspDatabase.length;
    const standardCount = STANDARD_AHSP_DATABASE.length;
    const customCount = customAhspDatabase.length;
    
    return {
      totalItems,
      standardCount,
      customCount
    };
  }, [fullAhspDatabase, customAhspDatabase]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100" id="applet-viewport">
      {/* Mini Top Banner with dynamic modern look */}
      <header className="bg-slate-900 text-white shadow-md shrink-0 select-none print:hidden border-b border-slate-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-md shadow-blue-500/20 tracking-tighter animate-pulse">
              AI
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2 leading-none">
                Analisa AHSP Pintar AI
                <span className="text-[10px] bg-slate-800 text-blue-400 font-semibold px-2 py-0.5 rounded border border-blue-900/60 ml-1">
                  PUPR / AI-Engine v3.5
                </span>
              </h1>
              <span className="text-xs text-slate-400 mt-1 block">Asisten Khusus Perancangan & Pemetaan Koefisien Pekerjaan Konstruksi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400">Total Pustaka Aktif:</span>
            <span className="px-3 py-1 bg-slate-950 rounded-lg text-xs font-mono font-bold text-blue-400 border border-slate-800">
              {stats.totalItems} Analisa
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <div className="bg-slate-900 border-t border-slate-800 shrink-0 select-none print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-6">
          <button
            onClick={() => setActiveTab("asisten")}
            className={`py-3 text-xs uppercase tracking-wider font-extrabold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "asisten"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4" />
            Asisten Rancang AHSP
          </button>
          
          <button
            onClick={() => setActiveTab("dokumen")}
            className={`py-3 text-xs uppercase tracking-wider font-extrabold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "dokumen"
                ? "border-blue-500 text-blue-405"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Kompiler Berkas RAB
            <span className="text-[9px] bg-blue-500/25 text-blue-400 px-1.5 py-0.5 rounded font-extrabold animate-pulse">
              BARU (AI)
            </span>
          </button>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="border-b border-slate-200 bg-white px-4 md:px-6 py-2.5 flex flex-wrap gap-x-8 gap-y-2 shrink-0 select-none print:hidden shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STANDARD SNI:</span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {stats.standardCount} Pekerjaan
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RANCANGAN AI:</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            {stats.customCount} Kustom
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PEDOMAN TEKNIS:</span>
          <span className="text-xs font-semibold text-blue-600 italic">
            Permen PUPR No. 01/PRT/M/2022
          </span>
        </div>
      </div>

      {activeTab === "asisten" ? (
        /* Main Single Screen Split Layout */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: AI AHSP Interactive Designer */}
          <section className="md:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 mb-1 border-b border-slate-100">
                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                  <Brain className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Panduan Asisten Rancang</h2>
              </div>
              
              <p className="text-xs text-slate-650 leading-relaxed">
                Ketikkan rincian modul pekerjaan konstruksi kustom yang ingin Anda ketahui analisis koefisiennya. 
                Asisten AI akan mengurai indeks kebutuhan murni untuk komponen 
                <strong> Bahan</strong>, <strong> Tenaga Kerja</strong>, maupun <strong> Peralatan Kerja</strong>.
              </p>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-1.5 text-[11px] text-blue-900">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-blue-800">
                  Fitur Analisa Murni:
                </span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Bebas unsur komersial & harga dinamis daerah.</li>
                  <li>Fokus murni pada perancangan rekayasa kuantitas teknik sipil.</li>
                  <li>Menghitung proporsi indeks koefisien secara akurat.</li>
                </ul>
              </div>
            </div>

            {/* AI AHSP Creator Card */}
            <AiAhspCreator 
              onAddCustomAhsp={handleAddCustomAhsp}
              existingAhspCodes={fullAhspDatabase.map((a) => a.id)}
            />
          </section>

          {/* Right Column: Library and Directory View */}
          <section className="md:col-span-7 space-y-4 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-950">Pustaka Koefisien AHSP</h2>
                  <p className="text-[11px] text-slate-500">Cari, filter, dan teliti indeks analisis koefisien</p>
                </div>
              </div>

              {/* Clear Custom Items action if there are any */}
              {customAhspDatabase.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Reset seluruh data analisa kustom rancangan AI?")) {
                      setCustomAhspDatabase([]);
                      setExpandedItemId(null);
                    }
                  }}
                  className="text-[10px] text-red-650 hover:text-red-750 font-bold uppercase tracking-wider border border-red-200 bg-red-50/60 px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer self-start sm:self-auto"
                >
                  Clear Kustom
                </button>
              )}
            </div>

            {/* Search, Filters, and Navigation Controls */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari analisa pekerjaan berdasarkan nama atau kode (kontruksi, plesteran, bata...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Segmented Filter Buttons */}
              <div className="flex rounded-lg border border-slate-250 p-0.5 bg-slate-100/80">
                {(["semua", "standar", "kustom"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`flex-1 py-1.5 text-center rounded-md font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all duration-150 ${
                      filterType === tab
                        ? "bg-white text-blue-900 shadow-sm border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    {tab === "semua" ? `Semua (${stats.totalItems})` : tab === "standar" ? `PUPR Standar (${stats.standardCount})` : `Kustom AI (${stats.customCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* AHSP Catalog List View */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredAhspItems.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 border border-slate-150 rounded-xl">
                  <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-medium">Tidak ada item analisa ditemukan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Coba gunakan kata kunci pencarian lain atau buat baru menggunakan asisten AI.</p>
                </div>
              ) : (
                filteredAhspItems.map((item) => {
                  const isExpanded = expandedItemId === item.id;
                  return (
                    <div 
                      key={item.id}
                      className={`border rounded-xl transition-all duration-150 bg-white ${
                        isExpanded 
                          ? "border-blue-300 ring-1 ring-blue-100" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Item Card Header */}
                      <div 
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-3.5 flex items-start gap-3 cursor-pointer select-none"
                      >
                        <div className="mt-0.5 mt-1 shrink-0 p-1 bg-slate-50 text-slate-500 rounded">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded">
                              {item.id}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Satuan Kerja: {item.unit}
                            </span>
                            {item.isCustom && (
                              <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-250 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                RANCANGAN AI
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 md:line-clamp-none">
                            {item.name}
                          </h3>
                        </div>

                        {item.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomAhsp(item.id);
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-450 hover:text-red-700 rounded transition cursor-pointer self-center"
                            title="Hapus analisa kustom"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Expandable Coefficients Analysis Layout */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-4 rounded-b-xl animate-fade-in space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-blue-900 border-l-2 border-blue-600 pl-2 uppercase tracking-wide">
                              Daftar Komponen & Koefisien Indeks Maksimal
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium font-mono">
                              Keakuratan Tinggi per {item.unit}
                            </span>
                          </div>

                          <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="bg-slate-100 text-slate-650 font-bold uppercase tracking-widest text-[9px] border-b border-slate-200">
                                  <th className="py-2 px-3">Komponen Bahan/Tenaga/Alat</th>
                                  <th className="py-2 px-3 text-center w-24">Kategori</th>
                                  <th className="py-2 px-3 text-center w-20">Satuan</th>
                                  <th className="py-2 px-3 text-right w-24">Koefisien</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-800">
                                {item.coefficients.map((coef, idx) => {
                                  const comp = fullComponentsDatabase.find((c) => c.id === coef.componentId);
                                  const name = comp ? comp.name : coef.componentId;
                                  const category = comp ? comp.category : "bahan";
                                  const unit = comp ? comp.unit : "-";

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/40 text-slate-750">
                                      <td className="py-2 px-3 text-xs font-medium text-slate-900">
                                        {name}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <span
                                          className={`inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                                            category === "bahan"
                                              ? "bg-amber-50 text-amber-700 border border-amber-100/60"
                                              : category === "tenaga"
                                              ? "bg-blue-50 text-blue-700 border border-blue-100/60"
                                              : "bg-purple-50 text-purple-700 border border-purple-100/60"
                                          }`}
                                        >
                                          {category}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px]">
                                        {unit}
                                      </td>
                                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                        {coef.coefficient.toFixed(4)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          <RabDocumentCompiler 
            fullAhspDatabase={fullAhspDatabase}
            fullComponentsDatabase={fullComponentsDatabase}
            onAddCustomAhsp={handleAddCustomAhsp}
          />
        </main>
      )}

      {/* Bottom Status Bar matching the design theme exactly */}
      <footer className="bg-slate-200 border-t border-slate-300 py-3 px-4 flex items-center justify-between text-[10px] text-slate-500 shrink-0 uppercase tracking-widest font-bold select-none print:hidden">
        <div className="flex gap-4">
          <span className="text-slate-600">STATUS: INTERACTIVE AI RUNNING</span>
          <span className="text-emerald-700 italic flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
            ● Model Online
          </span>
        </div>
        <div className="text-right text-slate-600">
          Analisa AHSP Pintar v3.5 | Sesi Bebas Biaya Finansial & Estimor
        </div>
      </footer>
    </div>
  );
}
