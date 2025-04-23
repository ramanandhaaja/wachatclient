"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Link2, Mail, Smartphone, Contact } from "lucide-react";
import { toast } from "sonner";
import { NameCardFormValues } from "@/lib/schemas/namecard";
import QRCode from "react-qr-code";

interface ShareCardProps {
  card: NameCardFormValues & { id: string };
  className?: string;
}

export function ShareCard({ card, className }: ShareCardProps) {
  const [activeTab, setActiveTab] = useState("qr");

  // TODO: Update with your actual domain
  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/namecard/${card.id}`;
  // QRCode will be rendered locally using the <QRCode /> component

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const shareViaEmail = () => {
    const fullName = [card.firstName, card.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const subject = encodeURIComponent(`${fullName}'s Digital Name Card`);
    const body = encodeURIComponent(`Here's my digital name card: ${cardUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Here's my digital name card: ${cardUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <div className="px-6 py-5">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg mb-1">
              Share Your Name Card
            </DialogTitle>
            <DialogDescription className="text-sm">
              Choose how you want to share your digital name card
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="qr"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-2"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted border rounded-lg overflow-hidden h-20">
              <TabsTrigger
                value="qr"
                className="flex flex-col items-center justify-center h-full py-3 gap-1"
              >
                <QrCode className="h-5 w-5" />
                <span className="text-xs">Show Namecard</span>
              </TabsTrigger>
              <TabsTrigger
                value="download"
                className="flex flex-col items-center justify-center h-full py-3 gap-1"
              >
                <Contact className="h-5 w-5" />
                <span className="text-xs">Download Contact</span>
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="flex flex-col items-center justify-center h-full py-3 gap-1"
              >
                <Link2 className="h-5 w-5" />
                <span className="text-xs">Direct Link</span>
              </TabsTrigger>
              {/* QR Code for vCard 
              <TabsTrigger
                value="email"
                className="flex flex-col items-center justify-center h-full py-3 gap-1"
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs">Email</span>
              </TabsTrigger>
              <TabsTrigger
                value="whatsapp"
                className="flex flex-col items-center justify-center h-full py-3 gap-1"
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-xs">WhatsApp</span>
              </TabsTrigger>
              */}
            </TabsList>

            <TabsContent
              value="qr"
              className="flex flex-col items-center px-2 pb-2 pt-2"
            >
              <div className="bg-white p-3 rounded-lg shadow-md mb-4 border">
                <QRCode value={cardUrl} size={176} className="w-44 h-44" />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Scan this QR code to open the digital name card
              </p>
            </TabsContent>

            <TabsContent
              value="download"
              className="flex flex-col items-center px-2 pb-2 pt-2"
            >
              <div className="bg-white p-3 rounded-lg shadow-md mb-4 border">
                <QRCode
                  value={[
                    "BEGIN:VCARD",
                    "VERSION:3.0",
                    `FN:${[card.firstName, card.lastName]
                      .filter(Boolean)
                      .join(" ")}`,
                    card.title ? `TITLE:${card.title}` : "",
                    card.company ? `ORG:${card.company}` : "",
                    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
                    card.email ? `EMAIL;TYPE=INTERNET:${card.email}` : "",
                    card.website ? `URL:${card.website}` : "",
                    "END:VCARD",
                  ]
                    .filter(Boolean)
                    .join("\n")}
                  size={176}
                  className="w-44 h-44"
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Scan to save contact
              </p>
            </TabsContent>

            <TabsContent value="link" className="flex flex-col px-2 pb-2 pt-2">
              <div className="bg-white p-3 rounded-lg shadow-md mb-4 border w-fit max-w-[390px] overflow-x-auto mx-auto">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm truncate whitespace-nowrap min-w-0 shrink"
                    title={cardUrl}
                  >
                    {cardUrl}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={copyToClipboard}>
                      Copy
                    </Button>
                    <Button size="sm" asChild>
                      <a
                        href={cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-3 text-muted-foreground">
                Share this link via text message, social media, or any other
                platform
              </p>
            </TabsContent>

            <TabsContent value="email" className="flex flex-col px-2 pb-2 pt-2">
              <p className="text-sm mb-3">
                Send your digital name card via email.
              </p>
              <Button className="w-full" onClick={shareViaEmail}>
                Send Email
              </Button>
            </TabsContent>

            <TabsContent
              value="whatsapp"
              className="flex flex-col px-2 pb-2 pt-2"
            >
              <p className="text-sm mb-3">
                Share your digital name card via WhatsApp.
              </p>
              <Button className="w-full" onClick={shareViaWhatsApp}>
                Share on WhatsApp
              </Button>
            </TabsContent>
            <TabsContent value="more" className="flex flex-col px-2 pb-2 pt-2">
              <p className="text-sm mb-3">More sharing options coming soon.</p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
