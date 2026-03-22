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
import { QrCode, Link2, Contact } from "lucide-react";
import { toast } from "sonner";
import { NameCardFormValues, generateVCard } from "@/lib/schemas/namecard";
import QRCode from "react-qr-code";

interface ShareCardProps {
  card: NameCardFormValues & { id: string };
  className?: string;
}

export function ShareCard({ card, className }: ShareCardProps) {
  const [activeTab, setActiveTab] = useState("qr");

  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/namecard/${card.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
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
                  value={generateVCard(card)}
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
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
