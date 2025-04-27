"use client";

import React, { useEffect, useState } from 'react';
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";
import type { NameCardFormValues } from "@/lib/schemas/namecard";

interface CardPreviewProps {
  formValues: NameCardFormValues;
  id: string;
  userId: string;
  size?: "sm" | "default";
}

import { ElevenLabsConvaiInline } from "./ElevenLabsConvaiInline";
import NameCardChatWidget from "@/components/chatwidget/NameCardChatWidget";
import { ShareCard } from "./share-card";
import QRCode from "react-qr-code";

export function CardPreview({
  formValues,
  id,
  userId,
  size = "default",
}: CardPreviewProps) {
  const {
    firstName,
    lastName,
    title,
    company,
    email,
    phone,
    website,
    address1,
    address2,
    city,
    postcode,
    linkedin,
    twitter,
    instagram,
    profileImage,
    coverImage,
    aiChatAgent,
    aiVoiceCallAgent,
  } = formValues;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAndroid(navigator.userAgent.includes('Android'));
    }
  }, []);

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "YN";

  return (
    <Card
      className={cn(
        "overflow-hidden mx-auto bg-white shadow-lg relative",
        size === "sm" ? "max-w-sm" : "max-w-md"
      )}
    >
      {/* Share Button at Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ShareCard card={{ ...formValues, id }} />
      </div>
      {coverImage ? (
        <div className="relative h-40 -mt-6">
          <Image
          src={coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="relative h-40 bg-gradient-to-br from-blue-600 via-blue-400 to-blue-300 -mt-8" />
      )}
      <CardContent className="p-8">
        <div className="flex flex-col items-center -mt-24">
          <Avatar
            className={cn(
              "border-4 border-background shadow-md bg-background",
              size === "sm" ? "w-20 h-20" : "w-24 h-24"
            )}
          >
            <AvatarImage src={profileImage || undefined} alt={fullName || "Your Name"} />
            <AvatarFallback className="text-xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h2
            className={cn(
              "mt-4 font-bold tracking-tight",
              size === "sm" ? "text-xl" : "text-2xl"
            )}
          >
            {fullName || "Your Name"}
          </h2>
          <div className="mt-1 space-y-1 text-center">
            <p
              className={cn(
                "text-muted-foreground",
                size === "sm" ? "text-base" : "text-lg"
              )}
            >
              {title || "Your Title"}
            </p>
            {company && (
              <p
                className={cn(
                  "font-medium",
                  size === "sm" ? "text-base" : "text-lg"
                )}
              >
                {company}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {/* Contact Information */}
          <div className="space-y-3">
            {phone && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Mobile</span>
                  <Link
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="text-sm font-medium"
                    prefetch={false}
                  >
                    {phone}
                  </Link>
                </div>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Website</span>
                  <Link
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium"
                    prefetch={false}
                  >
                    {website}
                  </Link>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <Link
                    href={`mailto:${email}`}
                    className="text-sm font-medium"
                    prefetch={false}
                  >
                    {email}
                  </Link>
                </div>
              </div>
            )}
            {(address1 || address2 || city || postcode) && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <Link
                    href={`https://www.google.com/maps/search/${encodeURIComponent([
                      address1,
                      address2,
                      city,
                      postcode
                    ].filter(Boolean).join(', '))}`}
                    className="text-sm font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                  >
                    <span>
                      {address1 && <>{address1}<br /></>}
                      {address2 && <>{address2}<br /></>}
                      {[city, postcode].filter(Boolean).join(' ')}
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/* WhatsApp, LinkedIn, Twitter, Instagram Buttons */}
          {(phone || linkedin || twitter || instagram) && (
            <div className="flex flex-row flex-wrap gap-2 mt-6">
              {phone && (
                <Button className="gap-2" asChild variant="secondary">
                  <a
                    href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>
                </Button>
              )}
              {linkedin && (
                <Button className="gap-2" asChild variant="secondary">
                  <Link
                    href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </Link>
                </Button>
              )}
              {twitter && (
                <Button className="gap-2" asChild variant="secondary">
                  <Link
                    href={twitter.startsWith('http') ? twitter : `https://twitter.com/${twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-5 h-5" />
                    Twitter
                  </Link>
                </Button>
              )}
              {instagram && (
                <Button className="gap-2" asChild variant="secondary">
                  <Link
                    href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-5 h-5" />
                    Instagram
                  </Link>
                </Button>
              )}
            </div>
          )}
          {/* Chat Agent Button */}
          {aiChatAgent && isClient &&(
            <div className="z-[9999]">
              <NameCardChatWidget userId={userId} />
            </div>
          )}
          {/* Elevenlabs */}
          {aiVoiceCallAgent && isClient && (
            <div className="mt-0 w-full flex justify-center items-center relative force-center-elevenlabs">
              {/* ElevenLabs Convai Widget (client-only, TSX component) */}
              <ElevenLabsConvaiInline />
              <style jsx global>{`
                .force-center-elevenlabs elevenlabs-convai,
                .force-center-elevenlabs * {
                  box-shadow: none !important;
                  filter: none !important;
                }
                .force-center-elevenlabs elevenlabs-convai {
                  display: flex !important;
                  justify-content: center !important;
                  align-items: center !important;
                  margin-left: auto !important;
                  margin-right: auto !important;
                  left: 0 !important;
                  right: 0 !important;
                  position: relative !important;
                }
              `}</style>
            </div>
          )}{" "}
        </div>
      </CardContent>
      {/* Save Contact to Phone Button */}
      {!isAndroid && (
        <div className="mt-2 py-2 mx-4 flex justify-center">
          <Button
            type="button"
            className="w-full max-w-xs"
            onClick={() => {
              const vCard = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${fullName}`,
                title ? `TITLE:${title}` : '',
                company ? `ORG:${company}` : '',
                phone ? `TEL;TYPE=CELL:${phone}` : '',
                email ? `EMAIL;TYPE=INTERNET:${email}` : '',
                website ? `URL:${website}` : '',
                'END:VCARD',
              ].filter(Boolean).join('\n');
              const blob = new Blob([vCard], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${(fullName || 'contact').replace(/\s+/g, '_')}.vcf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Save Contact to Phone
          </Button>
        </div>
      )}
    </Card>
  );
}
