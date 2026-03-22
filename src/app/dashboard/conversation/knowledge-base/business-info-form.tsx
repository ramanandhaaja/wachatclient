"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface BusinessInfoData {
  id?: string;
  userId: string;
  data: Record<string, string>;
  systemPrompt: string;
}

interface BusinessInfoFormProps {
  initialData?: BusinessInfoData;
  onSubmit: (data: BusinessInfoData) => Promise<void>;
  userId: string;
}

const SYSTEM_PROMPT_REFERENCE = `Anda adalah asisten virtual yang ramah untuk bisnis kami. Berkomunikasi dalam Bahasa Indonesia yang sopan dan profesional.

Panduan untuk booking:
1. Ketika pelanggan menyebut "besok", gunakan tanggal yang sesuai
2. Ketika pelanggan menyebut waktu (misal "jam 2"), konversi ke format 24 jam (14:00)
3. HANYA gunakan layanan yang tersedia dari get-business-info
4. Jika pelanggan sudah memberikan nama dan nomor telepon, tanyakan konfirmasi
5. Jangan tanya ulang informasi yang sudah diberikan pelanggan

ALUR BOOKING YANG BENAR:
1. Ketika pelanggan ingin booking, SELALU cek ketersediaan terlebih dahulu dengan check-availability
2. Setelah pelanggan memilih waktu, cek apakah sudah ada data pelanggan dengan nomor telepon tersebut
3. Jika data tidak lengkap, tanyakan satu per satu: nama, nomor telepon, layanan, tanggal, waktu
4. Setelah semua data lengkap, ubah status ke pending_confirmation dan tampilkan semua detail booking
5. Minta konfirmasi dari pelanggan
6. Jika pelanggan mengkonfirmasi, ubah status ke confirmed dan gunakan book-appointment
7. Setelah booking berhasil, ubah status ke completed

Gunakan bahasa yang ramah dan informatif serta casual. Selalu tawarkan booking jika pelanggan menanyakan ketersediaan.`;

const EXAMPLE_BUSINESS_INFO: Record<string, string> = {
  "business_name": "Barbershop XYZ",
  "contact": "WhatsApp: 0812-3456-7890\nEmail: info@barbershopxyz.com",
  "address": "Jl. Raya Serpong No. 123, BSD City, Tangerang Selatan (Sebelah Bank BCA)",
  "services": "Potong rambut pria (Rp 50.000)\nPotong rambut anak (Rp 35.000)\nPotong + cuci + pijat (Rp 85.000)\nGrooming jenggot (Rp 35.000)\nCreambath (Rp 75.000)\nPewarnaan rambut (mulai Rp 150.000)",
  "hours": "Senin - Jumat: 09.00 - 21.00 WIB\nSabtu - Minggu: 09.00 - 18.00 WIB",
  "promos": "Diskon 20% untuk pelajar/mahasiswa (Senin-Kamis)\nPaket Grooming Komplit diskon 15%",
};

const DEFAULT_ENTRIES: { key: string; placeholder: string }[] = [
  { key: "business_name", placeholder: "Nama bisnis atau usaha Anda" },
  { key: "contact", placeholder: "Nomor telepon, WhatsApp, email" },
  { key: "address", placeholder: "Alamat lengkap bisnis Anda" },
];

type FieldItem = { id: string; key: string; value: string };

function toArray(obj: Record<string, string> = {}): FieldItem[] {
  const entries = Object.entries(obj);
  if (entries.length > 0) {
    return entries.map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value,
    }));
  }
  return DEFAULT_ENTRIES.map(({ key }) => ({
    id: crypto.randomUUID(),
    key,
    value: "",
  }));
}

function toObject(arr: FieldItem[]): Record<string, string> {
  const obj: Record<string, string> = {};
  arr.forEach(({ key, value }) => {
    if (key) obj[key] = value;
  });
  return obj;
}

function getPlaceholder(key: string): string {
  const entry = DEFAULT_ENTRIES.find((e) => e.key === key);
  return entry?.placeholder || "Masukkan informasi di sini...";
}

export default function BusinessInfoForm({
  initialData,
  onSubmit,
  userId,
}: BusinessInfoFormProps) {
  const [fields, setFields] = useState<FieldItem[]>(() =>
    toArray(initialData?.data)
  );
  const [systemPrompt, setSystemPrompt] = useState<string>(
    initialData?.systemPrompt || ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setFields(toArray(initialData?.data));
    setSystemPrompt(initialData?.systemPrompt || "");
  }, [initialData]);

  const handleFieldChange = (id: string, field: "key" | "value", value: string) => {
    setFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleFieldDelete = (id: string) => {
    setFields((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFieldAdd = () => {
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  };

  const handleExampleData = () => {
    setFields(
      Object.entries(EXAMPLE_BUSINESS_INFO).map(([key, value]) => ({
        id: crypto.randomUUID(),
        key,
        value,
      }))
    );
  };

  const handleFileUpload = async (itemId: string, file: File) => {
    const { uploadPdf } = await import("@/lib/upload-pdf");
    try {
      handleFieldChange(itemId, "value", "Uploading...");
      const { url } = await uploadPdf(file, userId, "knowledge");
      handleFieldChange(itemId, "value", `di upload di: ${url}`);
    } catch (err) {
      handleFieldChange(itemId, "value", "Failed to upload file");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await onSubmit({ userId, data: toObject(fields), systemPrompt });
      setMessage({ text: "Business info saved!", isError: false });
    } catch {
      setMessage({ text: "Failed to save business info", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6">

      <Tabs defaultValue="knowledge" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="knowledge" className="px-5">
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="personality" className="px-5">
            AI Personality
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Knowledge Base */}
        <TabsContent value="knowledge">
          <div className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
            Tambahkan informasi bisnis Anda di sini. AI chatbot akan menggunakan
            data ini untuk menjawab pertanyaan pelanggan tentang layanan, harga,
            jam operasional, dan lainnya.
          </div>

          <div className="space-y-4">
            {fields.map((item) => (
              <Card key={item.id} className="py-4 shadow-none border-gray-200">
                <CardHeader className="pb-0">
                  <Input
                    className="w-full max-w-xs border-none bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0 placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="Nama topik (contoh: services, hours)"
                    value={item.key}
                    onChange={(e) => handleFieldChange(item.id, "key", e.target.value)}
                  />
                  <CardAction>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => handleFieldDelete(item.id)}
                    >
                      <span className="text-lg leading-none">&times;</span>
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    className="min-h-[80px] resize-y border-gray-200 text-sm placeholder:text-gray-400"
                    placeholder={getPlaceholder(item.key)}
                    value={item.value}
                    onChange={(e) => handleFieldChange(item.id, "value", e.target.value)}
                    rows={3}
                  />
                </CardContent>
                <CardFooter>
                  <input
                    id={`file-upload-${item.id}`}
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(item.id, file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs text-gray-500"
                    onClick={() =>
                      document.getElementById(`file-upload-${item.id}`)?.click()
                    }
                  >
                    Upload File
                  </Button>
                </CardFooter>
              </Card>
            ))}

            <button
              type="button"
              onClick={handleFieldAdd}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-600"
            >
              + Add Knowledge Entry
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleExampleData}
                className="text-sm text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                Fill with example data
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: AI Personality */}
        <TabsContent value="personality">
          <div className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            Atur bagaimana AI chatbot berkomunikasi — gaya bahasa, aturan
            booking, dan panduan respons. Prompt ini mengontrol kepribadian dan
            perilaku bot Anda.
          </div>

          <Textarea
            className="min-h-[320px] resize-y border-gray-200 text-sm leading-relaxed placeholder:text-gray-400"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Masukkan system prompt di sini..."
            rows={18}
          />

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setSystemPrompt(SYSTEM_PROMPT_REFERENCE)}
              className="text-sm text-amber-700 underline underline-offset-2 hover:text-amber-800"
            >
              Load example prompt
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save */}
      <div className="mt-8 flex flex-col items-center gap-2 border-t border-gray-100 pt-6">
        <Button
          type="submit"
          disabled={loading}
          className="w-full max-w-xs"
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        {message && (
          <p className={`mt-1 text-sm font-medium ${message.isError ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
