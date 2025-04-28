"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

// Reference business info for autofill
const SYSTEM_PROMPT_REFERENCE = `Anda adalah asisten virtual yang ramah untuk barbershop kami. Berkomunikasi dalam Bahasa Indonesia yang sopan dan profesional.

Panduan untuk booking:
1. Ketika pelanggan menyebut "besok", gunakan tanggal yang sesuai
2. Ketika pelanggan menyebut waktu (misal "jam 2"), konversi ke format 24 jam (14:00)
3. HANYA gunakan layanan yang tersedia dari get_service_info
4. Jika pelanggan sudah memberikan nama dan nomor telepon, tanyakan konfirmasi
5. Jangan tanya ulang informasi yang sudah diberikan pelanggan
       
ALUR BOOKING YANG BENAR:
1. Ketika pelanggan ingin booking, SELALU cek ketersediaan terlebih dahulu dengan check_availability
2. Setelah pelanggan memilih waktu, cek apakah sudah ada data pelanggan dengan nomor telepon tersebut
3. Jika data tidak lengkap, tanyakan satu per satu: nama, nomor telepon, layanan, tanggal, waktu
4. Setelah semua data lengkap, ubah status ke pending_confirmation dan tampilkan semua detail booking
5. Minta konfirmasi dari pelanggan
6. Jika pelanggan mengkonfirmasi, ubah status ke confirmed dan gunakan book_appointment
7. Setelah booking berhasil, ubah status ke completed

Gunakan bahasa yang ramah dan informatif serta casual. Selalu tawarkan booking jika pelanggan menanyakan ketersediaan.`;

const BUSINESS_INFO = {
  services: {
    potong: "Potong rambut pria (Rp 50.000)",
    anak: "Potong rambut anak (Rp 35.000)",
    komplit: "Potong + cuci + pijat (Rp 85.000)",
    jenggot: "Grooming jenggot (Rp 35.000)",
    creambath: "Creambath (Rp 75.000)",
    warna: "Pewarnaan rambut (mulai Rp 150.000)",
  },
  hours: {
    weekday: "09.00 - 21.00 WIB",
    weekend: "09.00 - 18.00 WIB",
  },
  location: {
    address: "Jl. Raya Serpong No. 123",
    area: "BSD City, Tangerang Selatan",
    landmark: "(Sebelah Bank BCA)",
  },
  promos: {
    weekday: "Diskon 20% untuk pelajar/mahasiswa (Senin-Kamis)",
    weekend: "Paket Grooming Komplit diskon 15%",
  },
};

function toArray(obj: Record<string, string> = {}) {
  return Object.entries(obj).map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value,
  }));
}
function toObject(arr: { key: string; value: string }[]) {
  const obj: Record<string, string> = {};
  arr.forEach(({ key, value }) => {
    if (key) obj[key] = value;
  });
  return obj;
}
type FieldItem = { id: string; key: string; value: string };

import { useEffect } from "react";

// Utility to pretty-print nested objects for field value
function prettyStringify(obj: any) {
  return typeof obj === "object" ? JSON.stringify(obj, null, 2) : String(obj);
}

export default function BusinessInfoForm({
  initialData,
  onSubmit,
  userId,
}: BusinessInfoFormProps) {
  // Helper to convert object to FieldItem array
  const toArray = (dataObj: Record<string, any> | undefined) =>
    dataObj
      ? Object.entries(dataObj).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value: String(value),
        }))
      : [];

  const [fields, setFields] = useState<FieldItem[]>(toArray(initialData?.data));

  // Handler to fill fields with example BUSINESS_INFO (top-level keys only, pretty-printed value)
  const handleExampleData = () => {
    const exampleFields = Object.entries(BUSINESS_INFO).map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value: prettyStringify(value),
    }));
    setFields(exampleFields);
  };

  const [systemPrompt, setSystemPrompt] = useState<string>(
    initialData?.systemPrompt || SYSTEM_PROMPT_REFERENCE
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFields(toArray(initialData?.data));
    setSystemPrompt(initialData?.systemPrompt || "");
  }, [initialData]);

  const handleFieldChange = (
    id: string,
    field: "key" | "value",
    value: string
  ) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert fields array to object for 'data'
      const data = fields.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      await onSubmit({
        userId,
        data,
        systemPrompt,
      });
      setMessage("Business info saved!");
    } catch (err: any) {
      setMessage("Failed to save business info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 w-full">
        {/* Left column: Business Info Fields */}
        <div className="md:mx-4">
          <div className="flex items-center gap-2 mb-2">
            <label className="block font-semibold">Business Info Fields</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleExampleData}
            >
              (example data)
            </Button>
          </div>
          <div className="space-y-2">
            {fields.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 items-stretch">
                <Input
                  className="input input-bordered w-1/2"
                  placeholder="Key (e.g. services, menu, howto)"
                  value={item.key}
                  onChange={(e) =>
                    handleFieldChange(item.id, "key", e.target.value)
                  }
                  required
                />
                <Textarea
                  className="textarea textarea-bordered min-h-[4rem]"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) =>
                    handleFieldChange(item.id, "value", e.target.value)
                  }
                  rows={4}
                  required
                />
                <Button
                  type="button"
                  className="btn btn-error btn-sm self-start mb-4"
                  onClick={() => handleFieldDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
            <Button
              type="button"
              className="btn btn-outline btn-sm mt-2"
              onClick={handleFieldAdd}
            >
              + Add Field
            </Button>
          </div>
        </div>
        {/* Right column: System Prompt */}
        <div className="md:mx-4">
          <div className="flex items-center gap-2 mb-2">
            <label className="block font-semibold">System Prompt (optional)</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => setSystemPrompt(SYSTEM_PROMPT_REFERENCE)}
            >
              (example prompt)
            </Button>
          </div>
          <Textarea
            className="textarea textarea-bordered w-full min-h-[120px]"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter your system prompt here..."
            rows={16}
          />
        </div>
      </div>
      {/* Submit button and message below both columns */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="submit"
          className="btn btn-primary w-full max-w-xs"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        {message && (
          <div className="mt-2 text-center text-green-600 font-medium">
            {message}
          </div>
        )}
      </div>
    </form>
  );
}
