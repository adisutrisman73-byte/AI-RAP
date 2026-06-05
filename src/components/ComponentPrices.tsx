import React, { useState } from "react";
import { Search, RotateCcw, Check, HelpCircle, AlertCircle, Sparkles } from "lucide-react";
import { Component } from "../types";
import { formatRupiah, DEFAULT_COMPONENTS } from "../data/standardAhsp";

interface ComponentPricesProps {
  components: Component[];
  projectPrices: Record<string, number>;
  onUpdatePrice: (componentId: string, price: number) => void;
  onResetPrices: () => void;
}

export default function ComponentPrices({
  components,
  projectPrices,
  onUpdatePrice,
  onResetPrices,
}: ComponentPricesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"semua" | "bahan" | "tenaga" | "alat">("semua");

  const filteredComponents = components.filter((comp) => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "semua" || comp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getPrice = (compId: string, defaultPr: number): number => {
    return projectPrices[compId] !== undefined ? projectPrices[compId] : defaultPr;
  };

  const isOverridden = (compId: string): boolean => {
    return projectPrices[compId] !== undefined;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6" id="pricing-settings-tab">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-semibold text-lg text-slate-900">Daftar Harga Satuan Dasar (Bahan, Upah & Alat)</h2>
          <p className="text-xs text-slate-500">
            Sesuaikan harga bahan bangunan, upah harian tenaga kerja, serta sewa peralatan konstruksi sesuai lokasi proyek Anda.
          </p>
        </div>
        <button
          onClick={onResetPrices}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Kembalikan Default
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari semen, pasir, bata, pekerja, dll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 overflow-x-auto">
          {(["semua", "bahan", "tenaga", "alat"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition ${
                activeCategory === cat
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {cat === "semua" ? "Semua Item" : cat === "tenaga" ? "Upah Tenaga" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Nama Komponen</th>
                <th className="py-3 px-4 text-center">Kategori</th>
                <th className="py-3 px-4 text-center">Satuan</th>
                <th className="py-3 px-4 text-right">Harga Default</th>
                <th className="py-3 px-4 text-right w-44">Harga Satuan Lokasi</th>
                <th className="py-3 px-4 text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((comp) => {
                  const currPrice = getPrice(comp.id, comp.defaultPrice);
                  const overridden = isOverridden(comp.id);
                  const isCustom = comp.id.startsWith("custom_");

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{comp.name}</div>
                        {isCustom && (
                          <span className="inline-flex items-center gap-0.5 mt-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.2 rounded">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Custom
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            comp.category === "bahan"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : comp.category === "tenaga"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : "bg-purple-50 text-purple-700 border border-purple-100"
                          }`}
                        >
                          {comp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-semibold font-mono">
                        {comp.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-mono">
                        {formatRupiah(comp.defaultPrice)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative flex items-center justify-end">
                          <span className="absolute left-3 text-slate-400 font-semibold text-xs pointer-events-none">Rp</span>
                          <input
                            type="number"
                            value={currPrice || ""}
                            onChange={(e) => onUpdatePrice(comp.id, Math.max(0, Number(e.target.value)))}
                            className={`w-36 pl-8 pr-2 py-1.5 text-right font-mono font-semibold rounded-md border text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white transition ${
                              overridden
                                ? "border-blue-400 text-blue-700 font-bold bg-blue-50/20"
                                : "border-slate-300 text-slate-800"
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {overridden ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 animate-fade-in">
                            <Check className="w-3 h-3 text-blue-500" />
                            Disesuaikan
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 px-2 py-0.5 border border-dashed border-slate-200 rounded-full bg-slate-50 select-none">
                            Standar
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    <AlertCircle className="w-5 h-5 mx-auto mb-2 text-slate-300" />
                    Tidak ada komponen yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50/50 rounded-lg flex items-start gap-2.5 text-xs text-blue-800 border border-blue-100/60 leading-relaxed">
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <strong>Tips Estimator:</strong> Koefisien AHSP menetapkan proporsi konstan dari volume pekerjaan (misal: 1 m2 pasang bata merah membutuhkan 70 buah bata). Jadi, <strong>Daftar Harga Lokasi</strong> inilah yang paling penting disesuaikan untuk mendapatkan kalkulasi total biaya RAB yang akurat di daerah masing-masing.
        </div>
      </div>
    </div>
  );
}
