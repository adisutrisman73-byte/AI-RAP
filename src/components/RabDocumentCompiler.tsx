import React, { useState, useMemo } from "react";
import { 
  FileText, Upload, Sparkles, Brain, CheckCircle, RefreshCw, 
  HelpCircle, ChevronRight, Grid, Package, Layers, Plus, 
  AlertCircle, Download, FileSpreadsheet, Eye, ChevronDown, Check, Trash2 
} from "lucide-react";
import { AHSPItem, Component } from "../types";
import { DEFAULT_COMPONENTS } from "../data/standardAhsp";

interface ParsedWorkItem {
  id: string;
  rawName: string;
  volume: number;
  unit: string;
  assignedAhspId: string; // Ref to AHSP id
  specification?: string; // Custom specifications
  marginPct?: number; // Custom margin percentage override
}

// Helper to estimate initial specification from item name
const suggestSpecification = (name: string): string => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("galian")) return "h=0.75 m";
  if (lowercaseName.includes("pasir urug") || (lowercaseName.includes("urugan") && lowercaseName.includes("pasir"))) return "t=5 cm";
  if (lowercaseName.includes("batu kosong") || lowercaseName.includes("anstamping") || lowercaseName.includes("aanstamping")) return "t=10 cm";
  if (lowercaseName.includes("pasangan pondasi") || lowercaseName.includes("pas. pondasi") || lowercaseName.includes("batu kali")) return "campuran 1:4";
  if (lowercaseName.includes("plesteran")) return "tebal 15 mm";
  if (lowercaseName.includes("acian")) return "semen murni";
  if (lowercaseName.includes("keramik") && lowercaseName.includes("60x60")) return "60x60 cm polos";
  if (lowercaseName.includes("keramik") && lowercaseName.includes("40x45")) return "40x40 cm tekstur";
  if (lowercaseName.includes("beton") && (lowercaseName.includes("k-225") || lowercaseName.includes("k225"))) return "mutu K-225";
  if (lowercaseName.includes("beton") && (lowercaseName.includes("k-175") || lowercaseName.includes("k175"))) return "mutu K-175";
  return "";
};

interface RabDocumentCompilerProps {
  fullAhspDatabase: AHSPItem[];
  fullComponentsDatabase: Component[];
  onAddCustomAhsp: (newItem: AHSPItem, newComponents: Component[]) => void;
}

export default function RabDocumentCompiler({ 
  fullAhspDatabase, 
  fullComponentsDatabase,
  onAddCustomAhsp 
}: RabDocumentCompilerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Parsed items from document
  const [parsedItems, setParsedItems] = useState<ParsedWorkItem[]>([]);
  const [currentStep, setCurrentStep] = useState<"upload" | "workspace">("upload");
  
  // Workspace tabs
  const [workspaceTab, setWorkspaceTab] = useState<"mapping" | "spreadsheet">("mapping");
  
  // Custom margin control state (default 25%)
  const [globalMarginPct, setGlobalMarginPct] = useState<number>(25);
  
  // Automatic AI scheduling for all items
  const [isAutoGeneratingAll, setIsAutoGeneratingAll] = useState(false);
  const [autoGenerateProgress, setAutoGenerateProgress] = useState(0);

  // Tracking custom generation state inside mapping
  const [generatingForIdx, setGeneratingForIdx] = useState<number | null>(null);

  // Simple heuristic mapper to suggest AHSP ID from title
  const suggestAhspId = (name: string, database: AHSPItem[]): string => {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes("galian") || lowercaseName.includes("tanah")) {
      const match = database.find(a => a.id.startsWith("A.2.2"));
      if (match) return match.id;
    }
    if (lowercaseName.includes("urug") || lowercaseName.includes("pasir urug")) {
      const match = database.find(a => a.id.includes("A.2.3"));
      if (match) return match.id;
    }
    if (lowercaseName.includes("pondasi") || lowercaseName.includes("batu kali")) {
      const match = database.find(a => a.id.includes("A.3.2"));
      if (match) return match.id;
    }
    if (lowercaseName.includes("beton") || lowercaseName.includes("k-225") || lowercaseName.includes("fc'")) {
      const match = database.find(a => a.id.includes("A.4.1"));
      if (match) return match.id;
    }
    if (lowercaseName.includes("dinding") || lowercaseName.includes("bata merah") || lowercaseName.includes("pasangan bata")) {
      const match = database.find(a => a.id.includes("A.4.4.1"));
      if (match) return match.id;
    }
    if (lowercaseName.includes("plesteran")) {
      const match = database.find(a => a.id.includes("A.4.4.2.4") || a.id.includes("A.4.4.2"));
      if (match) return match.id;
    }
    if (lowercaseName.includes("acian")) {
      const match = database.find(a => a.id.includes("A.4.4.2.27"));
      if (match) return match.id;
    }
    if (lowercaseName.includes("keramik") && (lowercaseName.includes("60x60") || lowercaseName.includes("60"))) {
      const match = database.find(a => a.id === "A.4.4.3.35");
      if (match) return match.id;
    }
    if (lowercaseName.includes("keramik") && (lowercaseName.includes("40x40") || lowercaseName.includes("40"))) {
      const match = database.find(a => a.id === "A.4.4.3.33");
      if (match) return match.id;
    }
    if (lowercaseName.includes("keramik") && lowercaseName.includes("dinding")) {
      const match = database.find(a => a.id === "A.4.4.3.54");
      if (match) return match.id;
    }
    if (lowercaseName.includes("rangka") || lowercaseName.includes("baja ringan") || lowercaseName.includes("roof truss")) {
      const match = database.find(a => a.id === "A.4.2.1.20");
      if (match) return match.id;
    }
    if (lowercaseName.includes("genteng") || lowercaseName.includes("penutup atap")) {
      const match = database.find(a => a.id === "A.4.5.1.19");
      if (match) return match.id;
    }
    if (lowercaseName.includes("titik") || lowercaseName.includes("listrik") || lowercaseName.includes("lampu")) {
      const match = database.find(a => a.id === "A.8.4.1.3");
      if (match) return match.id;
    }
    if (lowercaseName.includes("fitting")) {
      const match = database.find(a => a.id === "A.8.4.1.12");
      if (match) return match.id;
    }
    if (lowercaseName.includes("stop kontak") || lowercaseName.includes("saklar")) {
      const match = database.find(a => a.id === "A.8.4.1.20");
      if (match) return match.id;
    }
    if (lowercaseName.includes("pipa") || lowercaseName.includes("air bersih")) {
      const match = database.find(a => a.id === "A.5.1.1.2");
      if (match) return match.id;
    }
    if (lowercaseName.includes("kran")) {
      const match = database.find(a => a.id === "A.5.1.1.19");
      if (match) return match.id;
    }
    
    return ""; // Default to unassigned
  };

  // Convert uploaded file to base64 string
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const resultString = reader.result as string;
        // Strip out metadata prefix (e.g., "data:application/pdf;base64,")
        const base64Content = resultString.split(",")[1];
        resolve(base64Content);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFile = e.dataTransfer.files[0];
      validateAndProcessFile(uploadedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (uploadedFile: File) => {
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
      "application/vnd.ms-excel",
      "text/csv"
    ];
    const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase();
    
    if (validTypes.includes(uploadedFile.type) || ["xlsx", "xls", "pdf", "csv"].includes(fileExtension || "")) {
      setFile(uploadedFile);
      setErrorMessage(null);
    } else {
      setErrorMessage("Format file tidak didukung. Silakan gunakan PDF, Excel (xlsx/xls), atau CSV.");
    }
  };

  const handleParseDocument = async () => {
    if (!file) return;

    setIsParsing(true);
    setErrorMessage(null);

    try {
      const base64Data = await getBase64(file);
      
      const response = await fetch("/api/ahsp/parse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data,
          mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
          fileName: file.name
        })
      });

      if (!response.ok) {
        let errorMessage = "Gagal memproses berkas.";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (_) {
          errorMessage = `Server mengembalikan status error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const resData = await response.json();
      
      if (!resData.items || !Array.isArray(resData.items)) {
        throw new Error("Format respon tidak sesuai standar ekstrasi.");
      }

      // Map parsed items and auto-calculate heuristics
      const compiledItems: ParsedWorkItem[] = resData.items.map((raw: any, idx: number) => {
        const cleanedName = raw.rawName || "Item Pekerjaan";
        const cleanVolume = Number(raw.volume) || 1.0;
        const cleanUnit = (raw.unit || "m2").toLowerCase();

        return {
          id: `item-${Date.now()}-${idx}`,
          rawName: cleanedName,
          volume: cleanVolume,
          unit: cleanUnit,
          assignedAhspId: suggestAhspId(cleanedName, fullAhspDatabase),
          specification: suggestSpecification(cleanedName),
          marginPct: undefined
        };
      });

      setParsedItems(compiledItems);
      setCurrentStep("workspace");

    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Gagal menganalisis dokumen. Periksa tipe file dan coba kembali.");
    } finally {
      setIsParsing(false);
    }
  };

  // Run real-time on-the-fly custom AI generation for an item row
  const handleGenerateAiItem = async (idx: number, name: string) => {
    setGeneratingForIdx(idx);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ahsp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: name }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal menghasilkan koefisien dari AI.";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (_) {
          errorMessage = `Server mengembalikan status error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const generatedData = await response.json();

      // Convert generated components format to the schema
      const generatedComps = generatedData.components || [];
      const coefficients = generatedComps.map((comp: any) => {
        const sanitizedId = "custom_" + comp.name.toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .substring(0, 30);
        return {
          componentId: sanitizedId,
          coefficient: Number(comp.coefficient) || 0
        };
      });

      // Avoid duplication of codes or names
      const generatedCode = generatedData.code || `A.CUST.${Date.now().toString().slice(-4)}`;
      const newAhspItem: AHSPItem = {
        id: fullAhspDatabase.some(a => a.id === generatedCode) 
          ? `${generatedCode}-CUSTOM-${Date.now().toString().slice(-3)}` 
          : generatedCode,
        name: generatedData.name || name,
        unit: generatedData.unit || "m2",
        coefficients,
        isCustom: true
      };

      const newComponents: Component[] = generatedComps.map((comp: any, cIdx: number) => {
        const id = coefficients[cIdx].componentId;
        return {
          id,
          name: comp.name,
          category: comp.category,
          unit: comp.unit,
          defaultPrice: comp.price
        };
      });

      // Register custom item into our catalog
      onAddCustomAhsp(newAhspItem, newComponents);

      // Re-map the selected item in the list
      setParsedItems(prev => {
        const updated = [...prev];
        updated[idx].assignedAhspId = newAhspItem.id;
        return updated;
      });

    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Gagal merancang AI untuk item "${name}": ${err.message}`);
    } finally {
      setGeneratingForIdx(null);
    }
  };

  // Interactive update of assignment
  const handleAssignAhsp = (idx: number, id: string) => {
    setParsedItems(prev => {
      const updated = [...prev];
      updated[idx].assignedAhspId = id;
      return updated;
    });
  };

  // Remove a row from workspace
  const handleRemoveItem = (idx: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Update specification
  const handleUpdateSpec = (idx: number, spec: string) => {
    setParsedItems(prev => {
      const updated = [...prev];
      updated[idx].specification = spec;
      return updated;
    });
  };

  // Update volume
  const handleUpdateItemVolume = (idx: number, volStr: string) => {
    const vol = parseFloat(volStr) || 0;
    setParsedItems(prev => {
      const updated = [...prev];
      updated[idx].volume = vol;
      return updated;
    });
  };

  // Update custom margin per item row
  const handleUpdateItemMargin = (idx: number, marginStr: string) => {
    const margin = parseFloat(marginStr);
    setParsedItems(prev => {
      const updated = [...prev];
      updated[idx].marginPct = isNaN(margin) ? undefined : margin;
      return updated;
    });
  };

  // Run automatic design flow sequentially for all unmapped items in parsedItems
  const handleAutoGenerateAll = async () => {
    if (parsedItems.length === 0) return;
    setIsAutoGeneratingAll(true);
    setAutoGenerateProgress(0);
    setErrorMessage(null);

    let successCount = 0;
    let failCount = 0;

    // We do sequential calls to be nice on rate limiters and log structured progress
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      
      // Update progress fraction
      setAutoGenerateProgress(Math.round((i / parsedItems.length) * 100));

      if (item.assignedAhspId) {
        // Alread mapped!
        successCount++;
        continue;
      }

      try {
        const response = await fetch("/api/ahsp/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemName: item.rawName }),
        });

        if (!response.ok) {
          let errMsg = `Server returned ${response.status}`;
          try {
            const errBody = await response.json();
            if (errBody && errBody.error) {
              errMsg = errBody.error;
            }
          } catch (_) {}
          throw new Error(errMsg);
        }

        const generatedData = await response.json();
        const generatedComps = generatedData.components || [];
        const coefficients = generatedComps.map((comp: any) => {
          const sanitizedId = "custom_" + comp.name.toLowerCase()
            .replace(/[^a-z0-9_]/g, "_")
            .substring(0, 30);
          return {
            componentId: sanitizedId,
            coefficient: Number(comp.coefficient) || 0
          };
        });

        const generatedCode = generatedData.code || `A.CUST.${Date.now().toString().slice(-4)}`;
        
        // Ensure unique ID inside state
        const generatedId = fullAhspDatabase.some(a => a.id === generatedCode) 
          ? `${generatedCode}-AUTO-${Date.now().toString().slice(-3)}-${i}` 
          : generatedCode;

        const newAhspItem: AHSPItem = {
          id: generatedId,
          name: generatedData.name || item.rawName,
          unit: generatedData.unit || "m2",
          coefficients,
          isCustom: true
        };

        const newComponents: Component[] = generatedComps.map((comp: any, cIdx: number) => {
          const id = coefficients[cIdx].componentId;
          return {
            id,
            name: comp.name,
            category: comp.category,
            unit: comp.unit,
            defaultPrice: comp.price
          };
        });

        // Register custom items in cache
        onAddCustomAhsp(newAhspItem, newComponents);

        // Assign to parsed items
        setParsedItems(prev => {
          const updated = [...prev];
          const foundIdx = updated.findIndex(p => p.id === item.id);
          if (foundIdx !== -1) {
            updated[foundIdx].assignedAhspId = generatedId;
          }
          return updated;
        });

        successCount++;
      } catch (err: any) {
        console.error(`Error auto designing item "${item.rawName}":`, err);
        failCount++;
      }
    }

    setAutoGenerateProgress(100);
    setIsAutoGeneratingAll(false);

    if (failCount > 0) {
      setErrorMessage(`Otomatisasi selesai dengan beberapa kesalahan. Berhasil disinkronkan: ${successCount} item. Gagal: ${failCount} item.`);
    } else {
      setErrorMessage(null);
    }
  };

  // Compile rolled-up quantities of absolute material components!
  const compiledProjectMaterials = useMemo(() => {
    const quantities: Record<string, { name: string; category: string; unit: string; quantity: number }> = {};

    parsedItems.forEach((item) => {
      if (!item.assignedAhspId) return;
      const ahsp = fullAhspDatabase.find(a => a.id === item.assignedAhspId);
      if (!ahsp) return;

      ahsp.coefficients.forEach((coef) => {
        const comp = fullComponentsDatabase.find(c => c.id === coef.componentId);
        if (!comp || comp.category !== "bahan") return;

        const totalComponentVolume = item.volume * coef.coefficient;

        if (quantities[coef.componentId]) {
          quantities[coef.componentId].quantity += totalComponentVolume;
        } else {
          quantities[coef.componentId] = {
            name: comp.name,
            category: comp.category,
            unit: comp.unit,
            quantity: totalComponentVolume
          };
        }
      });
    });

    return Object.values(quantities).filter(m => m.category === "bahan");
  }, [parsedItems, fullAhspDatabase, fullComponentsDatabase]);

  // Rupiah currency formatter
  const rp = (num: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Group work items by construction headings
  const itemsByGroup = useMemo(() => {
    const groups: Record<string, any[]> = {
      "Pekerjaan Persiapan & Tanah": [],
      "Pekerjaan Pondasi & Beton": [],
      "Pekerjaan Dinding & Plesteran": [],
      "Pekerjaan Penutup Lantai & Dinding": [],
      "Pekerjaan Atap & Rangka": [],
      "Pekerjaan Instalasi Air & Sanitasi": [],
      "Pekerjaan Listrik & Lainnya": []
    };

    parsedItems.forEach((item, originalIdx) => {
      const name = item.rawName.toLowerCase();
      const itemWithIdx = { ...item, originalIdx };

      if (name.includes("galian") || name.includes("urug") || name.includes("timbun") || name.includes("persiapan") || name.includes("bowplank") || name.includes("tampis")) {
        groups["Pekerjaan Persiapan & Tanah"].push(itemWithIdx);
      } else if (name.includes("pondasi") || name.includes("kali") || name.includes("beton") || name.includes("sloof") || name.includes("kolom") || name.includes("ringbalk") || name.includes("balok") || name.includes("plat")) {
        groups["Pekerjaan Pondasi & Beton"].push(itemWithIdx);
      } else if (name.includes("bata") || name.includes("dinding") || name.includes("pas.") || name.includes("pasangan") || name.includes("plesteran") || name.includes("acian") || name.includes("skirting")) {
        groups["Pekerjaan Dinding & Plesteran"].push(itemWithIdx);
      } else if (name.includes("keramik") || name.includes("ubin") || name.includes("tegel") || name.includes("granit") || name.includes("marmer") || name.includes("parquet")) {
        groups["Pekerjaan Penutup Lantai & Dinding"].push(itemWithIdx);
      } else if (name.includes("atap") || name.includes("baja ringan") || name.includes("rangka") || name.includes("kuda") || name.includes("genteng") || name.includes("nok") || name.includes("roof")) {
        groups["Pekerjaan Atap & Rangka"].push(itemWithIdx);
      } else if (name.includes("pipa") || name.includes("saluran") || name.includes("sanitair") || name.includes("kran") || name.includes("wastafel") || name.includes("closet") || name.includes("bidet")) {
        groups["Pekerjaan Instalasi Air & Sanitasi"].push(itemWithIdx);
      } else {
        groups["Pekerjaan Listrik & Lainnya"].push(itemWithIdx);
      }
    });

    const result: Record<string, any[]> = {};
    Object.keys(groups).forEach((key) => {
      if (groups[key].length > 0) {
        result[key] = groups[key];
      }
    });

    if (Object.keys(result).length === 0 && parsedItems.length > 0) {
      result["Pekerjaan Rencana Anggaran Biaya (RAB)"] = parsedItems.map((item, originalIdx) => ({ ...item, originalIdx }));
    }

    return result;
  }, [parsedItems]);

  // Aggregate category metrics
  const calculateCategoryTotals = (rows: any[]) => {
    let totalJumlahHarga = 0;
    let totalRapBahan = 0;
    let totalMarginNominal = 0;
    let marginPctSum = 0;

    rows.forEach((item) => {
      const assignedAhsp = fullAhspDatabase.find(a => a.id === item.assignedAhspId);
      const itemMarginPct = item.marginPct !== undefined ? item.marginPct : globalMarginPct;
      
      let rapBahanUnit = 0;

      if (assignedAhsp) {
        assignedAhsp.coefficients.forEach((coef) => {
          const comp = fullComponentsDatabase.find(c => c.id === coef.componentId);
          if (!comp) return;
          const price = comp.defaultPrice || 0;
          
          if (comp.category === "bahan") {
            rapBahanUnit += coef.coefficient * price;
          }
        });
      }

      const unitCost = rapBahanUnit;
      const sellingUnitPrice = unitCost * (1 + itemMarginPct / 100);
      
      totalJumlahHarga += sellingUnitPrice * item.volume;
      totalRapBahan += rapBahanUnit * item.volume;
      totalMarginNominal += (sellingUnitPrice - unitCost) * item.volume;
      marginPctSum += itemMarginPct;
    });

    return {
      totalJumlahHarga,
      totalRapBahan,
      totalRapUpah: 0,
      totalMarginNominal,
      averageMarginPct: rows.length > 0 ? marginPctSum / rows.length : 0
    };
  };

  return (
    <>
      {/* Interactive view - hidden when printing */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 print:hidden" id="document-compiler-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">Kompiler Dokumen RAB & Analisa Volume Pintar</h2>
              <p className="text-[11px] text-slate-500 font-medium">Unggah berkas Bill of Quantities untuk mengurai koefisien bahan dan upah secara komprehensif</p>
            </div>
          </div>

          {currentStep === "workspace" && (
            <button
              id="btn-restart-doc"
              onClick={() => {
                setFile(null);
                setParsedItems([]);
                setCurrentStep("upload");
              }}
              className="text-xs font-bold text-red-650 hover:text-red-855 px-3.5 py-2 rounded-xl hover:bg-slate-50 border border-slate-205 transition cursor-pointer"
            >
              Mulai Ulang Dokumen
            </button>
          )}
        </div>

      {currentStep === "upload" ? (
        <div className="space-y-4">
            <div 
              id="dropzone-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition duration-150 ${
                isDragOver 
                  ? "border-blue-500 bg-blue-50/40" 
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="file"
                id="compiler-file-upload"
                accept=".pdf, .xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="compiler-file-upload" className="cursor-pointer space-y-3 block">
                <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <Upload className="w-7 h-7 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">
                    Seret & letakkan dokumen di sini, atau klik untuk memilih file
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium font-sans">
                    Mendukung berkas penawaran RAB / Bill of Quantities (PDF, Excel, atau CSV)
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div id="selected-file-panel" className="flex items-center gap-3.5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl animate-fade-in">
                <FileText className="w-9 h-9 text-blue-650 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-450 font-mono font-bold">Ukuran: {(file.size / 1024).toFixed(1)} KB</p>
                </div>
                
                <button
                  id="btn-trigger-parse"
                  onClick={handleParseDocument}
                  disabled={isParsing}
                  className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-100 transition cursor-pointer"
                >
                  {isParsing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      AI Menganalisa...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      Ekstrak & Urutkan RAB
                    </>
                  )}
                </button>
              </div>
            )}

            {isParsing && (
              <div id="parse-loader-status" className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-705">
                  <span className="flex items-center gap-1.5 font-sans font-extrabold text-blue-800">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Mengekstraksi baris volume & merelasikan indeks AHSP PUPR...
                  </span>
                  <span className="text-blue-605">Proses Ekstraksi Aktif</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[85%] rounded-full animate-pulse"></div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Tips: Gemini mengkategorikan penawaran harga, menganalisis total satuan volume murni, serta mengonversinya menjadi struktur data modular RAB-RAP.
                </p>
              </div>
            )}

            {errorMessage && (
              <div id="error-message-box" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest block">Format Dokumen Ideal</span>
              <p className="text-slate-600 leading-relaxed font-medium">
                Sistem akan memindai tabel dan mencari kolom deskripsi pekerjaan beserta volumenya. Gambar hasil pemindaian yang jelas, file PDF murni, maupun file lembar Excel sangat disarankan untuk ekstraksi berakurasi tinggi.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Steps & Workspace Tab Toggles */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 gap-4" id="workspace-controls-panel">
              <div className="flex border-b border-slate-200" id="workspace-tabs-container font-sans">
                <button
                  id="tab-mapping"
                  onClick={() => setWorkspaceTab("mapping")}
                  className={`py-3 px-5 text-xs font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                    workspaceTab === "mapping"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-450 hover:text-slate-800"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  1. Pemetaan & Koefisien AHSP ({parsedItems.length} Baris)
                </button>
                <button
                  id="tab-spreadsheet"
                  onClick={() => setWorkspaceTab("spreadsheet")}
                  className={`py-3 px-5 text-xs font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                    workspaceTab === "spreadsheet"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-450 hover:text-slate-800"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  2. Lembar Analisis Excel & Profit Margin (RAB/RAP)
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {parsedItems.some(i => !i.assignedAhspId) && (
                  <button
                    id="btn-auto-all-ai"
                    onClick={handleAutoGenerateAll}
                    disabled={isAutoGeneratingAll}
                    className="px-4.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                  >
                    {isAutoGeneratingAll ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        Mendesain Otomatis ({autoGenerateProgress}%)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
                        Otomatisasi Semua Rancangan AI ({parsedItems.filter(i => !i.assignedAhspId).length} Item)
                      </>
                    )}
                  </button>
                )}
                
                <button
                  id="btn-quick-print"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Cetak Laporan Kuantitas
                </button>
              </div>
            </div>

            {isAutoGeneratingAll && (
              <div id="auto-progress-bar-container" className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2 animate-fade-in shadow-sm">
                <div className="flex justify-between text-xs font-extrabold text-amber-800">
                  <span className="flex items-center gap-1 font-sans">
                    <Brain className="w-4 h-4 text-amber-500 animate-bounce" />
                    Sedang merancang AHSP & mengurai komponen bahan/upah untuk seluruh pekerjaan...
                  </span>
                  <span>{autoGenerateProgress}% Selesai</span>
                </div>
                <div className="w-full bg-slate-205 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${autoGenerateProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {workspaceTab === "mapping" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="mapping-tab-view">
                
                {/* Left Box: Column mapping / check extracted list */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Hasil Ekstruksi & Pemetaan Koefisien ({parsedItems.length} Item)
                    </h3>
                    <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 font-bold px-2 py-0.5 rounded">
                      LENGKAP
                    </span>
                  </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {parsedItems.map((item, idx) => {
                  const assignedAhsp = fullAhspDatabase.find(a => a.id === item.assignedAhspId);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`border p-3.5 rounded-xl bg-slate-50 space-y-3 transition ${
                        assignedAhsp 
                          ? "border-emerald-250 bg-emerald-50/10" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Baris #{idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 leading-normal truncate-2-lines">
                            {item.rawName}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">
                              Volume Pekerjaan:
                            </span>
                            <span className="text-xs font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                              {item.volume} {item.unit}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                          title="Hapus item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Matching AHSP Panel */}
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2.5 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Pemetaan Standar Koefisien PUPR:
                          </span>
                          
                          {generatingForIdx === idx ? (
                            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Mengurai AI...
                            </span>
                          ) : (
                            !assignedAhsp && (
                              <button
                                onClick={() => handleGenerateAiItem(idx, item.rawName)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              >
                                <Brain className="w-3.5 h-3.5 text-blue-500" />
                                Rancang AHSP Pintar (AI)
                              </button>
                            )
                          )}
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={item.assignedAhspId}
                            onChange={(e) => handleAssignAhsp(idx, e.target.value)}
                            className="flex-1 text-xs border border-slate-250 bg-white rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">-- Hubungkan dengan Analisa Koefisien --</option>
                            {fullAhspDatabase.map((ahsp) => (
                              <option key={ahsp.id} value={ahsp.id}>
                                [{ahsp.id}] {ahsp.name} ({ahsp.unit})
                              </option>
                            ))}
                          </select>

                          {assignedAhsp && (
                            <span className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0" title="Matang terpetakan">
                              <CheckCircle className="w-5 h-5" />
                            </span>
                          )}
                        </div>

                        {assignedAhsp && (
                          <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 space-y-1">
                            <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-450 block">Komponen Koefisien Terurai:</span>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              {assignedAhsp.coefficients.slice(0, 3).map((coef, cIdx) => {
                                const comp = fullComponentsDatabase.find(c => c.id === coef.componentId);
                                return (
                                  <span key={cIdx} className="bg-white border border-slate-200 rounded px-1">
                                    {comp ? comp.name.split(" per ")[0] : coef.componentId}: <strong>{(coef.coefficient * item.volume).toFixed(2)} {comp?.unit}</strong>
                                  </span>
                                );
                              })}
                              {assignedAhsp.coefficients.length > 3 && (
                                <span className="text-[9px] italic text-slate-450 self-center">+{assignedAhsp.coefficients.length - 3} lainnya</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Box: Dynamic rolled-up totals */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="pb-3 border-b border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">REKAPITULASI PROPOSAL</span>
                <h3 className="font-bold text-sm text-slate-900">Rekap Kuantitas Volume Komparatif</h3>
              </div>

              {compiledProjectMaterials.length === 0 ? (
                <div className="text-center py-10 bg-white border border-slate-150 rounded-xl space-y-2">
                  <HelpCircle className="w-8 h-8 text-slate-350 mx-auto" />
                  <p className="text-xs text-slate-600 font-semibold px-4">Belum ada rincian bahan terurai</p>
                  <p className="text-[10px] text-slate-405 px-4">Uraikan koefisien item pekerjaan di kolom sebelah kiri untuk merekap volume bahan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kebutuhan Bahan Utama:</span>
                    <div className="divide-y divide-slate-150 bg-white border border-slate-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                      {compiledProjectMaterials
                        .filter(m => m.category === "bahan")
                        .map((material, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between gap-4 text-xs">
                            <span className="font-medium text-slate-800 line-clamp-1">{material.name}</span>
                            <span className="font-mono font-bold text-slate-900 whitespace-nowrap bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                              {material.quantity.toFixed(2)} {material.unit}
                            </span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <button
                      onClick={() => window.print()}
                      className="w-full py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Cetak Laporan Kuantitas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: EXCEL SPREADSHEET & MARGIN WORKBOOK VIEW */
          <div id="excel-spreadsheet-tab-view" className="space-y-4 animate-fade-in font-sans">
            {/* Profit margins control panel */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans shadow-sm font-medium">
              <div className="space-y-1 md:max-w-md">
                <label className="text-xs font-extrabold text-slate-800 block">Markup Profit & Overhead Proyek (Global Percentage):</label>
                <p className="text-[11px] text-slate-500 font-medium">Beban margin keuntungan ditambahkan ke harga pokok murni bahan & tenaga kerja untuk menghitung nilai jual penawaran.</p>
              </div>
              
              <div className="flex items-center gap-3 font-semibold">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={globalMarginPct}
                  onChange={(e) => setGlobalMarginPct(Number(e.target.value))}
                  className="w-48 cursor-pointer accent-blue-600"
                />
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number"
                    min="0"
                    max="150"
                    value={globalMarginPct}
                    onChange={(e) => setGlobalMarginPct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-18 text-xs font-bold border border-slate-300 rounded-xl p-2 text-center bg-white"
                  />
                  <span className="text-xs font-extrabold text-slate-850">%</span>
                </div>
              </div>
            </div>

            {/* SPREADSHEET EMULATOR CONTAINER */}
            <div className="overflow-x-auto border border-slate-300 rounded-2xl shadow-md bg-white max-w-full">
              <table className="w-full text-left border-collapse min-w-[1300px] font-sans">
                <thead>
                  {/* Row 1 Headers */}
                  <tr className="bg-slate-105 text-slate-800 text-[10px] font-bold uppercase border-b border-slate-300">
                    <th className="py-2.5 px-2 border-r border-slate-300 text-center w-12" rowSpan={2}>No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 w-80" rowSpan={2}>Uraian Pekerjaan (Item BoQ)</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 w-44" rowSpan={2}>Spesifikasi Teknis</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-28" rowSpan={2}>Volume Kerja / Sat</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right w-36" rowSpan={2}>Harga Satuan Jual (RAB)</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right w-40" rowSpan={2}>Harga Penawaran Total (RAB)</th>
                    <th className="py-1.5 px-3 border-r border-slate-300 text-center text-[9px]" colSpan={2}>Anggaran Fisik Bahan (RAP)</th>
                    <th className="py-0.5 px-3 text-center text-[9px]" colSpan={2}>Profit & Overhead Margin</th>
                  </tr>
                  {/* Row 2 Sub-Headers */}
                  <tr className="bg-slate-50 text-slate-600 text-[9px] font-extrabold uppercase border-b border-slate-300">
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-32">Harga Satuan</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-36">Jumlah Harga</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-32">Nominal (Margin)</th>
                    <th className="py-2 px-2 text-center w-20">Margin Pct</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(itemsByGroup).map((groupName, gIdx) => {
                    const groupRows: any[] = itemsByGroup[groupName];
                    if (groupRows.length === 0) return null;

                    // Calculate totals for categoric rows
                    const totals = calculateCategoryTotals(groupRows);

                    return (
                      <React.Fragment key={groupName}>
                        {/* SECTION ROW HEADER */}
                        <tr className="bg-blue-50/70 font-black text-slate-900 border-t border-b border-slate-300 text-[11px] select-none">
                          <td className="py-3 px-2 border-r border-slate-300 text-center font-mono">{String.fromCharCode(65 + gIdx)}</td>
                          <td className="py-3 px-3 border-r border-slate-300 font-extrabold animate-none" colSpan={2}>{groupName}</td>
                          <td className="py-3 px-3 border-r border-slate-300"></td>
                          <td className="py-3 px-3 border-r border-slate-300"></td>
                          <td className="py-3 px-3 border-r border-slate-300 text-right font-mono text-slate-950 font-black">{rp(totals.totalJumlahHarga)}</td>
                          <td className="py-3 px-2 border-r border-slate-300 text-right font-mono text-slate-550"></td>
                          <td className="py-3 px-2 border-r border-slate-300 text-right font-mono text-slate-705 font-bold">{rp(totals.totalRapBahan)}</td>
                          <td className="py-3 px-2 border-r border-slate-300 text-right font-mono text-emerald-850 font-black">{rp(totals.totalMarginNominal)}</td>
                          <td className="py-3 px-2 text-center font-mono text-blue-900 bg-slate-100 font-black">{totals.averageMarginPct.toFixed(2)}%</td>
                        </tr>

                        {/* ITEM ROWS under this section */}
                        {groupRows.map((item, rIdx) => {
                          const assignedAhsp = fullAhspDatabase.find(a => a.id === item.assignedAhspId);
                          
                          // Margin markup override check
                          const itemMarginPct = item.marginPct !== undefined ? item.marginPct : globalMarginPct;
                          
                          let rapBahanUnit = 0;

                          if (assignedAhsp) {
                            assignedAhsp.coefficients.forEach((coef) => {
                              const comp = fullComponentsDatabase.find(c => c.id === coef.componentId);
                              if (!comp || comp.category !== "bahan") return;
                              const price = comp.defaultPrice || 0;
                              rapBahanUnit += coef.coefficient * price;
                            });
                          }

                          const unitCost = rapBahanUnit;
                          const sellingUnitPrice = unitCost * (1 + itemMarginPct / 100);
                          
                          const jumlahHargaSelling = sellingUnitPrice * item.volume;
                          const rapBahanJumlah = rapBahanUnit * item.volume;
                          const marginNominalJumlah = (sellingUnitPrice - unitCost) * item.volume;

                          return (
                            <React.Fragment key={item.id}>
                              <tr className="border-b border-slate-200 text-[11px] font-medium hover:bg-slate-50/40">
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center text-slate-400 font-mono">{rIdx + 1}</td>
                                <td className="py-2.5 px-3 border-r border-slate-200">
                                  <div className="space-y-1">
                                    <div className="font-extrabold text-slate-900 leading-snug">{item.rawName}</div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[9px] font-bold py-0.5 px-1.5 bg-slate-100 border border-slate-200 rounded-md text-slate-550 font-mono">
                                        {assignedAhsp ? `AHSP: ${assignedAhsp.id}` : "Kustomisasi Manual"}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                
                                {/* Editable Specification Comments */}
                                <td className="py-2 px-2 border-r border-slate-200">
                                  <input 
                                    type="text"
                                    placeholder="Ketik spesifikasi..."
                                    value={item.specification || ""}
                                    onChange={(e) => handleUpdateSpec(item.originalIdx, e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-250 bg-white rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                                  />
                                </td>

                                {/* Editable Volume Row Cell */}
                                <td className="py-2 px-2 border-r border-slate-200 text-center">
                                  <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-250 rounded-lg p-1.2 font-bold text-slate-800">
                                    <input 
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={item.volume}
                                      onChange={(e) => handleUpdateItemVolume(item.originalIdx, e.target.value)}
                                      className="w-16 text-center text-xs border-0 bg-transparent font-bold text-slate-800 p-0 focus:outline-none focus:ring-0 font-mono"
                                    />
                                    <span className="text-[10px] uppercase font-sans text-slate-500 leading-none">{item.unit}</span>
                                  </div>
                                </td>

                                {/* Calculated Costs */}
                                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">{rp(sellingUnitPrice)}</td>
                                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-black text-slate-950 bg-slate-50/40">{rp(jumlahHargaSelling)}</td>
                                
                                <td className="py-2.5 px-2 border-r border-slate-200 text-right font-mono text-slate-450">{rp(rapBahanUnit)}</td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-right font-mono text-slate-800 font-semibold">{rp(rapBahanJumlah)}</td>
                                
                                <td className="py-2.5 px-2 border-r border-slate-200 text-right font-mono font-bold text-emerald-800 bg-emerald-50/10">{rp(marginNominalJumlah)}</td>
                                
                                {/* Editable custom margin override per row cell */}
                                <td className="py-1 px-1 text-center bg-slate-100/30">
                                  <input 
                                    type="number"
                                    min="0"
                                    max="150"
                                    placeholder={`${globalMarginPct}`}
                                    value={item.marginPct !== undefined ? item.marginPct : ""}
                                    onChange={(e) => handleUpdateItemMargin(item.originalIdx, e.target.value)}
                                    className="w-12 text-center text-xs border border-slate-250 rounded-lg p-1 bg-white font-bold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    title={`Override margin. Kosongkan untuk mengikuti global default profit (${globalMarginPct}%)`}
                                  />
                                </td>
                              </tr>

                              {/* ORANGE NESTED BREAKDOWNS OF INDIVIDUAL COEF */}
                              {assignedAhsp && assignedAhsp.coefficients.map((coef, cIdx) => {
                                const comp = fullComponentsDatabase.find(c => c.id === coef.componentId);
                                if (!comp || comp.category !== "bahan") return null;

                                const componentQuantity = coef.coefficient * item.volume;
                                const componentPrice = comp.defaultPrice || 0;
                                const componentSum = componentQuantity * componentPrice;

                                return (
                                  <tr key={`comp-${cIdx}`} className="border-b border-slate-100 bg-orange-50/10 text-[10px] font-bold text-orange-600/90 italic hover:bg-orange-50/20 select-none">
                                    <td className="py-1.5 px-2 border-r border-slate-200"></td>
                                    <td className="py-1.5 px-3 border-r border-slate-200 font-medium pl-6 text-orange-600/80 truncate">
                                      └─ {comp.name}
                                    </td>
                                    <td className="py-1.5 px-2 border-r border-slate-200 text-center animate-none"></td>
                                    
                                    {/* Subvolume quantity breakdown */}
                                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono font-bold text-orange-650">
                                      {componentQuantity.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} {comp.unit}
                                    </td>
                                    
                                    <td className="py-1.5 px-3 border-r border-slate-200"></td>
                                    <td className="py-1.5 px-3 border-r border-slate-200"></td>
                                    
                                    {/* Materials Left Pricing */}
                                    <td className="py-1.5 px-2 border-r border-slate-200 text-right font-mono font-medium">
                                      {rp(componentPrice)}
                                    </td>
                                    <td className="py-1.5 px-2 border-r border-slate-200 text-right font-mono">
                                      {rp(componentSum)}
                                    </td>
                                    
                                    <td className="py-1.5 px-2 border-r border-slate-200 text-right"></td>
                                    <td className="py-1.5 px-2 text-center text-slate-400"></td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </div>
        )}
      </div>

    {/* PRINT-ONLY OFFICIAL FORMATTED QUANTITY STUDY REPORT */}
    {currentStep === "workspace" && (
      <div className="hidden print:block bg-white text-black font-sans p-2 space-y-8 print:w-full w-full" id="document-compiler-print-report">
        <div className="text-center space-y-2 border-b-4 border-double border-black pb-4">
          <h1 className="text-xl font-black uppercase tracking-tight">Laporan Rekapitulasi Kuantitas Bahan (Material)</h1>
          <h2 className="text-sm font-semibold uppercase text-slate-700 tracking-wide">Penyelarasan Nilai Koefisien Analisis Harga Satuan Pekerjaan (AHSP) PUPR</h2>
          <p className="text-[10px] text-slate-500 italic">Berdasarkan Standar Peraturan Menteri PUPR No. 1/PRT/M/2022 & Perhitungan Pintar AI</p>
        </div>

        {/* DOKUMEN METADATA GRID */}
        <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 text-xs">
          <div className="space-y-1">
            <div><span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">Nama Dokumen Asal:</span> <span className="font-semibold text-slate-800">{file?.name || "Rencana Desain Manual / Tanpa Berkas"}</span></div>
            <div><span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">Status Perhitungan:</span> <span className="font-semibold text-slate-800">100% Terpetakan & Terurai Selesai</span></div>
          </div>
          <div className="space-y-1 text-right">
            <div><span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block text-right">Tanggal Cetak:</span> <span className="font-semibold text-slate-800">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div>
            <div><span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block text-right">Metode Analisis:</span> <span className="font-semibold text-slate-800 font-mono">BoQ Quantity Surveying (QS) Engine</span></div>
          </div>
        </div>

        {/* BAGIAN 1: DAFTAR RINCIAN PEKERJAAN & PEMETAAN AHSP */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider border-l-4 border-black pl-2">BAGIAN I. Rencana Volume Pekerjaan & Sinkronisasi AHSP</h3>
          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-black font-bold uppercase text-[10px] text-slate-800 animate-none">
                <th className="py-2 px-3 border border-black text-center w-12 mr-1">No</th>
                <th className="py-2 px-3 border border-black">Uraian / Deskripsi Pekerjaan Fisik</th>
                <th className="py-2 px-3 border border-black text-center w-24">Volume</th>
                <th className="py-2 px-3 border border-black text-center w-16">Satuan</th>
                <th className="py-2 px-3 border border-black text-center w-28">Kode AHSP</th>
                <th className="py-2 px-3 border border-black">Definisi Deskripsi AHSP Terpetakan</th>
              </tr>
            </thead>
            <tbody>
              {parsedItems.map((item, idx) => {
                const assignedAhsp = fullAhspDatabase.find(a => a.id === item.assignedAhspId);
                return (
                  <tr key={item.id} className="border-b border-black font-sans leading-relaxed text-[11px]">
                    <td className="py-2.5 px-3 border border-black text-center font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 border border-black font-semibold text-slate-900">{item.rawName}</td>
                    <td className="py-2.5 px-3 border border-black text-center font-mono font-black text-slate-950">
                      {item.volume.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 border border-black text-center font-semibold text-slate-800">{item.unit}</td>
                    <td className="py-2.5 px-3 border border-black text-center font-mono font-bold text-slate-900 bg-slate-50">{item.assignedAhspId || <span className="text-red-500">-</span>}</td>
                    <td className="py-2.5 px-3 border border-black text-slate-705 italic">
                      {assignedAhsp ? assignedAhsp.name : <span className="text-red-500 font-semibold uppercase">Belum Dihubungkan</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BAGIAN 2: REKAPITULASI KEBUTUHAN SUMBER DAYA TOTAL */}
        <div className="space-y-4 pt-4 page-break-before">
          <h3 className="text-xs font-black uppercase tracking-wider border-l-4 border-black pl-2">BAGIAN II. Ringkasan Kebutuhan Volume Murni Bahan (Material)</h3>
          
          <div className="pb-4">
            {/* KOLOM BAHAN TOTAL */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">Kebutuhan Bahan Utama (Material)</span>
              <table className="w-full text-left border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-105 border-b border-black font-bold uppercase text-[9px] text-slate-800">
                    <th className="py-2 px-2 border border-black text-center w-12">No</th>
                    <th className="py-2 px-3 border border-black">Deskripsi Material/Bahan Utama</th>
                    <th className="py-2 px-3 border border-black text-right w-36">Kuantitas Total</th>
                    <th className="py-2 px-3 border border-black text-center w-20">Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {compiledProjectMaterials.filter(m => m.category === "bahan").length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 px-2 border border-black text-center text-slate-400 italic">Tidak ada bahan terakumulasi</td>
                    </tr>
                  ) : (
                    compiledProjectMaterials
                      .filter(m => m.category === "bahan")
                      .map((material, idx) => (
                        <tr key={idx} className="border-b border-black text-[11px] font-medium leading-relaxed font-sans">
                          <td className="py-2 px-2 border border-black text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 border border-black font-semibold text-slate-900">{material.name}</td>
                          <td className="py-2 px-3 border border-black text-right font-mono font-black text-slate-950">
                            {material.quantity.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                          </td>
                          <td className="py-2 px-3 border border-black text-center font-bold text-slate-700">{material.unit}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIGN-OFF PANEL TANDA TANGAN */}
        <div className="pt-20 select-none">
          <div className="grid grid-cols-3 gap-8 text-center text-xs">
            <div className="space-y-16">
              <p>Disetujui Oleh,<br /><span className="font-bold text-slate-500 text-[10px] uppercase">Pemilik Proyek (Client)</span></p>
              <div className="border-b border-black w-3/4 mx-auto"></div>
            </div>
            <div className="space-y-16">
              <p>Diperiksa Oleh,<br /><span className="font-bold text-slate-500 text-[10px] uppercase">Site Project Manager (PM)</span></p>
              <div className="border-b border-black w-3/4 mx-auto"></div>
            </div>
            <div className="space-y-16">
              <p>Dihitung Oleh,<br /><span className="font-bold text-slate-500 text-[10px] uppercase">Senior Quantity Surveyor (QS)</span></p>
              <div className="border-b border-black w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
}
