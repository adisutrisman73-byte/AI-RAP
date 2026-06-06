import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as XLSX from "xlsx";

// Load environment variables
dotenv.config();

// Shared Gemini client utility
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Dynamic, self-healing Gemini model pool to handle rate-limits and quotas gracefully
let modelsToTry = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

// Resilient Gemini generator helper with retry & fallback
async function generateContentWithRetry(params: any): Promise<any> {
  const maxRetries = 3;
  let lastError: any = null;

  // Clone current list to prevent concurrent request race conditions
  const currentModels = [...modelsToTry];

  for (const modelName of currentModels) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        console.log(`[Gemini] Attempting generation with model: ${modelName} (attempt ${attempt + 1}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });

        // SUCCESS! Promote this model to the top of our pool for future requests
        const idx = modelsToTry.indexOf(modelName);
        if (idx > 0) {
          console.log(`[Gemini] Promoting successful model "${modelName}" to the top of the preference pool.`);
          modelsToTry.splice(idx, 1);
          modelsToTry.unshift(modelName);
        }

        return response;
      } catch (err: any) {
        attempt++;
        lastError = err;
        console.warn(`[Gemini] Attempt ${attempt} failed for ${modelName}. Error: ${err.message || err}`);
        
        // Detect 429 Rate Limit / Quota Exceeded / Resource Exhausted
        const isQuotaError = 
          err.status === 429 || 
          (err.message && (
            err.message.includes("quota") || 
            err.message.includes("Quota") || 
            err.message.includes("RESOURCE_EXHAUSTED") || 
            err.message.includes("429")
          ));

        if (isQuotaError) {
          console.warn(`[Gemini] Model "${modelName}" hit quota limit. Skipping remaining attempts to avoid timeouts and switching models.`);
          
          // Depromote this model in the pool so future queries don't waste time on it
          const idx = modelsToTry.indexOf(modelName);
          if (idx !== -1) {
            modelsToTry.splice(idx, 1);
            modelsToTry.push(modelName); // Move to the end
          }
          
          break; // Break current prompt's retry-loop for this model and try the next model
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware with custom larger size limit for base64 documents
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route: Generate custom AHSP item via Gemini
  app.post("/api/ahsp/generate", async (req, res) => {
    try {
      const { itemName, customInstruction } = req.body;
      if (!itemName || typeof itemName !== "string") {
        return res.status(400).json({ error: "Item name is required and must be a string." });
      }

      console.log(`Generating AHSP coefficients for: "${itemName}"...`);

      const prompt = `Analisis dan buatlah koefisien AHSP (Analisa Harga Satuan Pekerjaan) konstruksi untuk item pekerjaan berikut: "${itemName}".
${customInstruction ? `Instruksi tambahan: ${customInstruction}` : ""}

Berikan rincian koefisien bahan (material), tenaga kerja (pekerja, tukang, dll. dalam satuan OH), dan peralatan (jika ada), yang akurat secara teknik sipil Indonesia (mengikuti kaidah AHSP Kementerian PUPR). Berikan juga estimasi harga satuan pasar yang wajar untuk setiap komponen di Indonesia saat ini dalam Rupiah (Rp).`;

      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah asisten ahli Estimator Biaya Konstruksi dan Teknik Sipil profesional Indonesia yang ahli dalam menyusun Analisa Harga Satuan Pekerjaan (AHSP) PUPR standar nasional.",
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: {
                type: Type.STRING,
                description: "Kode AHSP PUPR formal atau buat kode buatan yang relevan, contoh: A.4.2.1.X",
              },
              name: {
                type: Type.STRING,
                description: "Nama formal item pekerjaan dalam Bahasa Indonesia, contoh: Pemasangan Penutup Atap Genteng Keramik",
              },
              unit: {
                type: Type.STRING,
                description: "Satuan pengukuran volume utama pekerjaan, contoh: m3, m2, m', kg, buah, ls",
              },
              components: {
                type: Type.ARRAY,
                description: "Daftar rincian komponen bahan, tenaga kerja, dan peralatan",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                      description: "Nama spesifik komponen, contoh: 'Semen Portland (PC)', 'Pasir Pasang', 'Pekerja', 'Tukang Kayu', 'Sewa Molen Beton'",
                    },
                    category: {
                      type: Type.STRING,
                      description: "Ketegori komponen, harus salah satu dari: 'bahan', 'tenaga', atau 'alat'",
                    },
                    unit: {
                      type: Type.STRING,
                      description: "Satuan komponen, contoh: kg, m3, buah, batang, OH (Orang Hari) untuk tenaga, atau sewa-hari/jam untuk alat",
                    },
                    coefficient: {
                      type: Type.NUMBER,
                      description: "Koefisien kebutuhan unit komponen per 1 unit pekerjaan utama",
                    },
                    price: {
                      type: Type.NUMBER,
                      description: "Estimasi realistis harga satuan unit komponen dalam Rupiah (Rp), contoh: 1500, 240000, 120000",
                    },
                  },
                  required: ["name", "category", "unit", "coefficient", "price"],
                },
              },
            },
            required: ["code", "name", "unit", "components"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini.");
      }

      const generatedAHSP = JSON.parse(responseText.trim());
      return res.json(generatedAHSP);
    } catch (error: any) {
      console.error("Error generating AHSP:", error);
      return res.status(500).json({
        error: "Gagal mendesain AHSP menggunakan AI. Silakan coba deskripsi yang lebih spesifik.",
        details: error?.message || error,
      });
    }
  });

  // API Route: Parse PDF or Excel document to extract work items
  app.post("/api/ahsp/parse-document", async (req, res) => {
    try {
      const { base64Data, mimeType, fileName } = req.body;
      if (!base64Data || typeof base64Data !== "string") {
        return res.status(400).json({ error: "Data berkas base64 harus disediakan." });
      }
      if (!mimeType || typeof mimeType !== "string") {
        return res.status(400).json({ error: "Tipe MIME berkas harus disediakan." });
      }

      console.log(`Analyzing document "${fileName || "unnamed"}" with MIME type: "${mimeType}"...`);

      const isPdf = mimeType === "application/pdf" || (fileName && fileName.toLowerCase().endsWith(".pdf"));
      let response;

      if (isPdf) {
        // PDF files can be sent directly to Gemini's files API / inlineData
        const filePart = {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data,
          }
        };

        const promptText = `Ekstrak secara lengkap rincian item pekerjaan utama (konstruksi, finishing, mep, atau sipil lainnya) dari dokumen terlampir. 
Identifikasi nama/uraian setiap pekerjaan ("rawName"), nilai kuantitas/volumenya ("volume"), dan satuan kerjanya yang tercantum ("unit").
Abaikan baris total, rekapitulasi utama, atau baris kosong yang tidak merepresentasikan volume pekerjaan fisik riil.`;

        response = await generateContentWithRetry({
          model: "gemini-3.5-flash",
          contents: [filePart, { text: promptText }],
          config: {
            systemInstruction: "Anda adalah analis kuantitas (Quantity Surveyor) senior dalam bidang sipil konstruksi di Indonesia yang profesional. Tugas Anda adalah melakukan ekstraksi data volume pekerjaan konstruksi dari dokumen RAB, BoQ, atau Excel rencana kerja ke format data digital JSON secara presisi tanpa rekayasa data numerik.",
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: {
                  type: Type.ARRAY,
                  description: "Daftar baris item pekerjaan fisik yang berhasil diekstrak dan dideteksi secara lengkap",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rawName: {
                        type: Type.STRING,
                        description: "Deskripsi asli item pekerjaan dari lembar dokumen, misal: 'Pekerjaan Galian Tanah Biasa'",
                      },
                      volume: {
                        type: Type.NUMBER,
                        description: "Kuantitas atau volume pekerjaan dalam bentuk angka desimal, misal: 45.2",
                      },
                      unit: {
                        type: Type.STRING,
                        description: "Satuan pekerjaan penentu, kriteria standar seperti m3, m2, m', kg, buah, titik, ls dll. jika tidak ada silakan isi 'm2' atau 'ls' sesuai sifat kerjanya.",
                      },
                    },
                    required: ["rawName", "volume", "unit"],
                  },
                },
              },
              required: ["items"],
            },
          },
        });
      } else {
        // Spreadsheet or CSV files: parse to clean CSV text on the server
        let sheetText = "";
        try {
          const workbook = XLSX.read(base64Data, { type: "base64" });
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            if (csv.trim()) {
              sheetText += `### TAB/SHEET: ${sheetName} ###\n${csv}\n\n`;
            }
          });
        } catch (err: any) {
          console.error("SheetJS failed to read spreadsheet binary", err);
          throw new Error(`Pustaka Excel gagal membaca berkas: ${err.message || err}`);
        }

        if (!sheetText.trim()) {
          throw new Error("Berkas spreadsheet kosong atau tidak berisi sel data yang valid.");
        }

        const promptText = `Berikut adalah data lembar kerja konstruksi (spreadsheet dalam format CSV) yang perlu Anda analisa:
        
--- DATA LEMBAR KERJA MULAI ---
${sheetText}
--- DATA LEMBAR KERJA SELESAI ---

Ekstrak secara lengkap rincian item pekerjaan utama (konstruksi, finishing, mep, atau sipil lainnya) dari lembar kerja tersebut.
Identifikasi nama/uraian setiap pekerjaan ("rawName"), nilai kuantitas/volumenya ("volume"), dan satuan kerjanya yang tercantum ("unit").
Abaikan baris total, rekapitulasi utama, atau baris kosong yang tidak merepresentasikan volume pekerjaan fisik riil.`;

        response = await generateContentWithRetry({
          model: "gemini-3.5-flash",
          contents: promptText,
          config: {
            systemInstruction: "Anda adalah analis kuantitas (Quantity Surveyor) senior dalam bidang sipil konstruksi di Indonesia yang profesional. Tugas Anda adalah melakukan ekstraksi data volume pekerjaan konstruksi dari dokumen RAB, BoQ, atau Excel rencana kerja ke format data digital JSON secara presisi tanpa rekayasa data numerik.",
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: {
                  type: Type.ARRAY,
                  description: "Daftar baris item pekerjaan fisik yang berhasil diekstrak dan dideteksi secara lengkap",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rawName: {
                        type: Type.STRING,
                        description: "Deskripsi asli item pekerjaan dari lembar dokumen, misal: 'Pekerjaan Galian Tanah Biasa'",
                      },
                      volume: {
                        type: Type.NUMBER,
                        description: "Kuantitas atau volume pekerjaan dalam bentuk angka desimal, misal: 45.2",
                      },
                      unit: {
                        type: Type.STRING,
                        description: "Satuan pekerjaan penentu, kriteria standar seperti m3, m2, m', kg, buah, titik, ls dll. jika tidak ada silakan isi 'm2' atau 'ls' sesuai sifat kerjanya.",
                      },
                    },
                    required: ["rawName", "volume", "unit"],
                  },
                },
              },
              required: ["items"],
            },
          },
        });
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Respon kosong diterima dari Gemini.");
      }

      const parsedJSON = JSON.parse(responseText.trim());
      return res.json(parsedJSON);
    } catch (error: any) {
      console.error("Error parsing document with Gemini:", error);
      return res.status(500).json({
        error: "Gagal membaca berkas menggunakan AI. Pastikan berkas berupa tabel RAB/BoQ PDF atau Excel yang valid.",
        details: error?.message || error,
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite middleware / static files paths configuration
  const distPath = path.join(process.cwd(), "dist");

  // Determine if we are in development mode by checking if we are NOT running the compiled production bundle
  const isDevMode = 
    !process.argv[1] || 
    !process.argv[1].endsWith("server.cjs");

  // Debug environment endpoint
  app.get("/api/env-debug", (req, res) => {
    res.json({
      nodeEnv: process.env.NODE_ENV,
      argv: process.argv,
      isDevMode,
      distPath,
      hasServerCjs: fs.existsSync(path.join(distPath, "server.cjs")),
      hasIndexHtml: fs.existsSync(path.join(distPath, "index.html")),
      disableHmr: process.env.DISABLE_HMR,
    });
  });

  if (isDevMode) {
    console.log("Starting server with Vite Middleware (Live Development Mode)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode serving built static assets...");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup failure:", err);
});
