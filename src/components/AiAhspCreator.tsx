import React, { useState } from "react";
import { Sparkles, Brain, Plus, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { AHSPItem, Component } from "../types";
import { DEFAULT_COMPONENTS, formatRupiah } from "../data/standardAhsp";

interface AiAhspCreatorProps {
  onAddCustomAhsp: (newItem: AHSPItem, newComponents: Component[]) => void;
  existingAhspCodes: string[];
}

export default function AiAhspCreator({ onAddCustomAhsp, existingAhspCodes }: AiAhspCreatorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    item: AHSPItem;
    tempComponents: { name: string; category: "bahan" | "tenaga" | "alat"; unit: string; coefficient: number; price: number }[];
  } | null>(null);

  const samplePrompts = [
    "Pemasangan rangka atap baja ringan profil C75 per m2",
    "Pemasangan kusen pintu aluminium 4 inch per meter lari",
    "Instalasi kabel listrik fitting lampu titik per ls",
    "Pemasangan lantai keramik 60x60 cm per m2",
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setPreviewItem(null);

    try {
      const response = await fetch("/api/ahsp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: prompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menghasilkan koefisien dari AI.");
      }

      const data = await response.json();
      
      // Structure the returned data into our schema
      const tempComponents = data.components || [];
      
      // Map components into AHSP Coefficients
      const coefficients = tempComponents.map((comp: any) => {
        // Create an ID for custom components safely
        const sanitizedCompId = "custom_" + comp.name.toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .substring(0, 30);
        return {
          componentId: sanitizedCompId,
          coefficient: Number(comp.coefficient) || 0,
        };
      });

      const designItem: AHSPItem = {
        id: existingAhspCodes.includes(data.code) ? `${data.code}-CUSTOM-${Date.now().toString().slice(-4)}` : data.code || `A.CUST.${Date.now().toString().slice(-4)}`,
        name: data.name || prompt,
        unit: data.unit || "m2",
        coefficients,
        isCustom: true,
      };

      setPreviewItem({
        item: designItem,
        tempComponents,
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat menghubungi asisten AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToCatalog = () => {
    if (!previewItem) return;

    const newComponents: Component[] = previewItem.tempComponents.map((comp, idx) => {
      const coef = previewItem.item.coefficients[idx];
      return {
        id: coef.componentId,
        name: comp.name,
        category: comp.category,
        unit: comp.unit,
        defaultPrice: comp.price,
      };
    });

    onAddCustomAhsp(previewItem.item, newComponents);
    
    // Reset state after successful save
    setPrompt("");
    setPreviewItem(null);
    alert("Berhasil menyimpan item pekerjaan baru ke katalog AHSP!");
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm" id="ai-ahsp-section">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-slate-900">Perancang AHSP Pintar (AI Assistant)</h2>
          <p className="text-xs text-slate-500">
            Dapatkan koefisien analisis PUPR otomatis untuk pekerjaan kustom dengan ketelitian tinggi berbasis kecerdasan buatan.
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-705 mb-1.5 uppercase tracking-wider">
            Deskripsikan Item Pekerjaan Konstruksi
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Pekerjaan Pemasangan Rangka Atap Baja Ringan per m2..."
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition duration-150 shrink-0 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Rancang AHSP
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500">Rekomendasi pencarian cepat:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                disabled={isGenerating}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 transition cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {previewItem && (
        <div className="mt-6 border border-blue-200 rounded-xl bg-white p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                AI Analisa Draft
              </span>
              <h3 className="font-semibold text-slate-950 mt-1">{previewItem.item.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kode Analisa: <strong className="font-mono text-blue-650">{previewItem.item.id}</strong> | Satuan Pekerjaan: <strong className="text-slate-800">{previewItem.item.unit}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveToCatalog}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Simpan ke Katalog
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase tracking-widest text-[10px]">
                  <th className="py-2.5 px-3">Komponen</th>
                  <th className="py-2.5 px-3 text-center">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Satuan</th>
                  <th className="py-2.5 px-3 text-right">Koefisien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewItem.tempComponents.map((comp, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-900">{comp.name}</td>
                      <td className="py-2 px-3 text-center">
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
                      <td className="py-2 px-3 text-center text-slate-600 font-mono">{comp.unit}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-800 font-medium">
                        {comp.coefficient.toFixed(4)}
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
}
