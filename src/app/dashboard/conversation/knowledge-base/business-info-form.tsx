"use client";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface BusinessInfoData {
  id?: string;
  userId: string;
  services: Record<string, string>;
  hours: Record<string, string>;
  location: Record<string, string>;
  promos: Record<string, string>;
  systemPrompt: string;
}

interface BusinessInfoFormProps {
  initialData?: BusinessInfoData;
  onSubmit: (data: BusinessInfoData) => Promise<void>;
  userId: string;
}


// Reference business info for autofill
const SYSTEM_PROMPT_REFERENCE = 
`Anda adalah asisten virtual yang ramah untuk barbershop kami. Berkomunikasi dalam Bahasa Indonesia yang sopan dan profesional.

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
    'potong': 'Potong rambut pria (Rp 50.000)',
    'anak': 'Potong rambut anak (Rp 35.000)',
    'komplit': 'Potong + cuci + pijat (Rp 85.000)',
    'jenggot': 'Grooming jenggot (Rp 35.000)',
    'creambath': 'Creambath (Rp 75.000)',
    'warna': 'Pewarnaan rambut (mulai Rp 150.000)',
  },
  hours: {
    weekday: '09.00 - 21.00 WIB',
    weekend: '09.00 - 18.00 WIB'
  },
  location: {
    address: 'Jl. Raya Serpong No. 123',
    area: 'BSD City, Tangerang Selatan',
    landmark: '(Sebelah Bank BCA)'
  },
  promos: {
    weekday: 'Diskon 20% untuk pelajar/mahasiswa (Senin-Kamis)',
    weekend: 'Paket Grooming Komplit diskon 15%'
  }
};

function toArray(obj: Record<string, string> = {}) {
  return Object.entries(obj).map(([key, value]) => ({ id: crypto.randomUUID(), key, value }));
}
function toObject(arr: { key: string; value: string }[]) {
  const obj: Record<string, string> = {};
  arr.forEach(({ key, value }) => {
    if (key) obj[key] = value;
  });
  return obj;
}

type FieldItem = { id: string; key: string; value: string };

export default function BusinessInfoForm({ initialData, onSubmit, userId }: BusinessInfoFormProps) {
  const [services, setServices] = useState<{ id: string; key: string; value: string }[]>(toArray(initialData?.services));
  const [hours, setHours] = useState<{ id: string; key: string; value: string }[]>(toArray(initialData?.hours));
  const [location, setLocation] = useState<{ id: string; key: string; value: string }[]>(toArray(initialData?.location));
  const [promos, setPromos] = useState<{ id: string; key: string; value: string }[]>(toArray(initialData?.promos));
  const [systemPrompt, setSystemPrompt] = useState<string>(initialData?.systemPrompt || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleArrayChange = (setter: any, id: string, field: 'key' | 'value', value: string) => {
    setter((prev: any[]) => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleArrayDelete = (setter: any, id: string) => {
    setter((prev: any[]) => prev.filter(item => item.id !== id));
  };
  const handleArrayAdd = (setter: any) => {
    setter((prev: any[]) => [...prev, { id: crypto.randomUUID(), key: '', value: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        id: initialData?.id,
        userId,
        services: toObject(services),
        hours: toObject(hours),
        location: toObject(location),
        promos: toObject(promos),
        systemPrompt,
      });
      setMessage("Business info saved successfully!");
    } catch (err: any) {
      setMessage(err.message || "Failed to save business info.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="flex gap-8">
    <Card className="w-full max-w-xl ml-8">
      <div className="bg-transparent p-0 w-full">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h2 className="text-xl font-bold">Business Info</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setServices(toArray(BUSINESS_INFO.services));
              setHours(toArray(BUSINESS_INFO.hours));
              setLocation(toArray(BUSINESS_INFO.location));
              setPromos(toArray(BUSINESS_INFO.promos));
            }}
          >
            Autofill Reference Data
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Services */}
          <div>
            <Label className="font-semibold mb-2 block">Services</Label>
            {services.map((item: FieldItem) => (
              <div key={item.id} className="flex gap-2 mb-2 items-start">
                <Input
                  value={item.key}
                  onChange={e => handleArrayChange(setServices, item.id, 'key', e.target.value)}
                  placeholder="Service key (e.g. potong)"
                  required
                />
                <Textarea
                  value={item.value}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange(setServices, item.id, 'value', e.target.value)}
                  placeholder="Description"
                  required
                  className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <Button type="button" variant="ghost" size="sm" className="text-red-600 px-2 py-1" onClick={() => handleArrayDelete(setServices, item.id)}>
                  Delete
                </Button>
              </div>
            ))}
            <Button type="button" variant="link" className="text-blue-600 mt-1 px-0" onClick={() => handleArrayAdd(setServices)}>
              + Add Service
            </Button>
          </div>

          {/* Hours */}
          <div>
            <Label className="font-semibold mb-2 block">Hours</Label>
            {hours.map((item: FieldItem) => (
              <div key={item.id} className="flex gap-2 mb-2 items-start">
                <Input
                  value={item.key}
                  onChange={e => handleArrayChange(setHours, item.id, 'key', e.target.value)}
                  placeholder="Day (e.g. weekday)"
                  required
                />
                <Input
                  value={item.value}
                  onChange={e => handleArrayChange(setHours, item.id, 'value', e.target.value)}
                  placeholder="Time (e.g. 09.00 - 21.00 WIB)"
                  required
                />
                <Button type="button" variant="ghost" size="sm" className="text-red-600 px-2 py-1" onClick={() => handleArrayDelete(setHours, item.id)}>
                  Delete
                </Button>
              </div>
            ))}
            <Button type="button" variant="link" className="text-blue-600 mt-1 px-0" onClick={() => handleArrayAdd(setHours)}>
              + Add Hour
            </Button>
          </div>

          {/* Location */}
          <div>
            <Label className="font-semibold mb-2 block">Location</Label>
            {location.map((item: FieldItem) => (
              <div key={item.id} className="flex gap-2 mb-2 items-start">
                <Input
                  value={item.key}
                  onChange={e => handleArrayChange(setLocation, item.id, 'key', e.target.value)}
                  placeholder="Location key (e.g. address)"
                  required
                />
                <Textarea
                  value={item.value}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange(setLocation, item.id, 'value', e.target.value)}
                  placeholder="Value"
                  required
                  className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <Button type="button" variant="ghost" size="sm" className="text-red-600 px-2 py-1" onClick={() => handleArrayDelete(setLocation, item.id)}>
                  Delete
                </Button>
              </div>
            ))}
            <Button type="button" variant="link" className="text-blue-600 mt-1 px-0" onClick={() => handleArrayAdd(setLocation)}>
              + Add Location Field
            </Button>
          </div>

          {/* Promos */}
          <div>
            <Label className="font-semibold mb-2 block">Promos</Label>
            {promos.map((item: FieldItem) => (
              <div key={item.id} className="flex gap-2 mb-2 items-start">
                <Input
                  value={item.key}
                  onChange={e => handleArrayChange(setPromos, item.id, 'key', e.target.value)}
                  placeholder="Promo key (e.g. weekday)"
                  required
                />
                <Textarea
                  value={item.value}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange(setPromos, item.id, 'value', e.target.value)}
                  placeholder="Promo description"
                  required
                  className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <Button type="button" variant="ghost" size="sm" className="text-red-600 px-2 py-1" onClick={() => handleArrayDelete(setPromos, item.id)}>
                  Delete
                </Button>
              </div>
            ))}
            <Button type="button" variant="link" className="text-blue-600 mt-1 px-0" onClick={() => handleArrayAdd(setPromos)}>
              + Add Promo
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 pt-6">
          <Button type="submit" className="w-full max-w-xs" disabled={loading}>
            {loading ? "Saving..." : "Save Business Info"}
          </Button>
          {message && <div className="mt-2 text-center text-green-600 font-medium">{message}</div>}
        </CardFooter>
      </div>
    </Card>
      <Card className="w-full max-w-xl h-fit mr-8">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <h2 className="text-xl font-bold">System Prompt</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSystemPrompt(SYSTEM_PROMPT_REFERENCE)}
          >
            Autofill System Prompt
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter your system prompt here..."
            className="min-h-[300px]"
          />
        </CardContent>
        <CardFooter>
        <div className="flex flex-col items-center gap-2">
        <Button type="submit" className="w-full max-w-xs" disabled={loading}>
          {loading ? "Saving..." : "Save All Changes"}
        </Button>
        {message && <div className="text-center text-green-600 font-medium">{message}</div>}
      </div>
        </CardFooter>
      </Card>
      
    </form>
  );
}
