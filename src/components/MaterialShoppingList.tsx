import React, { useMemo } from "react";
import { ListChecks, Package, Users, Wrench, FileText, Printer } from "lucide-react";
import { Project, Component, RABItem, AHSPItem } from "../types";
import { DEFAULT_COMPONENTS, formatRupiah, formatNumber, getComponentPrice } from "../data/standardAhsp";

interface MaterialShoppingListProps {
  project: Project;
  ahspDatabase: AHSPItem[];
  components: Component[];
}

export default function MaterialShoppingList({ project, ahspDatabase, components }: MaterialShoppingListProps) {
  
  // Calculate aggregated component needs based on project items and coefficients
  const shoppingData = useMemo(() => {
    const aggregates: Record<string, number> = {};

    project.items.forEach((item) => {
      const activeAhsp = ahspDatabase.find((a) => a.id === item.ahspId);
      if (!activeAhsp) return;

      activeAhsp.coefficients.forEach((coef) => {
        const requiredQuantity = coef.coefficient * item.volume;
        if (aggregates[coef.componentId] === undefined) {
          aggregates[coef.componentId] = 0;
        }
        aggregates[coef.componentId] += requiredQuantity;
      });
    });

    const resultList = Object.entries(aggregates).map(([compId, totalQty]) => {
      const comp = components.find((c) => c.id === compId) || DEFAULT_COMPONENTS.find((c) => c.id === compId);
      const unitPrice = getComponentPrice(compId, project.componentPrices, components);
      const totalCost = totalQty * unitPrice;

      return {
        id: compId,
        name: comp ? comp.name : compId,
        category: comp ? comp.category : ("bahan" as const),
        unit: comp ? comp.unit : "unit",
        totalQty,
        unitPrice,
        totalCost,
      };
    });

    // Sort by cost descending
    return resultList.sort((a, b) => b.totalCost - a.totalCost);
  }, [project, ahspDatabase, components]);

  // Split into categories
  const bahanList = shoppingData.filter((i) => i.category === "bahan");
  const tenagaList = shoppingData.filter((i) => i.category === "tenaga");
  const alatList = shoppingData.filter((i) => i.category === "alat");

  const grandTotalBahan = bahanList.reduce((sum, item) => sum + item.totalCost, 0);
  const grandTotalTenaga = tenagaList.reduce((sum, item) => sum + item.totalCost, 0);
  const grandTotalAlat = alatList.reduce((sum, item) => sum + item.totalCost, 0);
  const totalProjectCost = grandTotalBahan + grandTotalTenaga + grandTotalAlat;

  const handlePrint = () => {
    window.print();
  };

  // Convert materials to commercial units helpers
  const getCommercialConversion = (compId: string, qty: number): string | null => {
    if (compId === "semen_pc") {
      const bags40 = Math.ceil(qty / 40);
      const bags50 = Math.ceil(qty / 50);
      return `~ ${formatNumber(bags40, 0)} Sak (kemasan 40kg) / ~ ${formatNumber(bags50, 0)} Sak (kemasan 50kg)`;
    }
    if (compId === "pasir_pasang" || compId === "pasir_beton" || compId === "pasir_urug" || compId === "batu_belah" || compId === "batu_pecah_12") {
      const colts = Math.ceil(qty / 1.5); // Carry pick-up colt is approx 1.5 m3
      const tronton = Math.ceil(qty / 7.5); // Dump truck is approx 7.5 m3
      return `~ ${formatNumber(colts, 0)} Colt Pick-up / ~ ${formatNumber(tronton, 0)} Truk Dump`;
    }
    if (compId === "bata_merah") {
      return `~ ${formatNumber(qty, 0)} Buah Bata`;
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6" id="procurement-list-tab">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-semibold text-lg text-slate-900">Rekapitulasi Kebutuhan Bahan, Upah & Alat</h2>
          <p className="text-xs text-slate-500">
            Kumpulan total kebutuhan sumber daya bangunan yang otomatis dihitung berdasarkan volume RAB proyek yang aktif.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Rekap
          </button>
        </div>
      </div>

      {shoppingData.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500 text-sm">
          <ListChecks className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          Belum ada item pekerjaan di RAB Anda.
          <p className="text-xs text-slate-400 mt-1">Silakan tambahkan pekerjaan pada lembar kerja RAB terlebih dahulu.</p>
        </div>
      ) : (
        <div className="space-y-8 print:space-y-6">
          {/* Bahan Section */}
          {bahanList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <Package className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">A. Material & Bahan Bangunan</h3>
              </div>
              <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold text-[9px] border-b border-slate-100">
                        <th className="py-2.5 px-3 w-1/2">Item Bahan</th>
                        <th className="py-2.5 px-3 text-right">Total Kebutuhan</th>
                        <th className="py-2.5 px-3 text-center">Satuan</th>
                        <th className="py-2.5 px-3 text-slate-600 print:hidden">Estimasi Kemasan Niaga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {bahanList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40">
                          <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatNumber(item.totalQty, 3)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-500">{item.unit}</td>
                          <td className="py-2 px-3 text-xs text-slate-500 bg-slate-50/50 print:hidden">
                            {getCommercialConversion(item.id, item.totalQty) || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tenaga Section */}
          {tenagaList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">B. Tenaga Kerja Lapangan</h3>
              </div>
              <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold text-[9px] border-b border-slate-100">
                        <th className="py-2.5 px-3">Profesi Tenaga</th>
                        <th className="py-2.5 px-3 text-right">Alokasi Mandays</th>
                        <th className="py-2.5 px-3 text-center">Satuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {tenagaList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40">
                          <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatNumber(item.totalQty, 2)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-500">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Alat Section */}
          {alatList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <Wrench className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">C. Peralatan Kerja</h3>
              </div>
              <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold text-[9px] border-b border-slate-100">
                        <th className="py-2.5 px-3">Nama Alat</th>
                        <th className="py-2.5 px-3 text-right">Volume Sewa / Unit</th>
                        <th className="py-2.5 px-3 text-center">Satuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {alatList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/40">
                          <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatNumber(item.totalQty, 2)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-500">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
