"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Globe, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";
import type { NameCardFormValues } from "@/lib/schemas/namecard";

interface CardPreviewProps {
  formValues: NameCardFormValues;
  size?: "sm" | "default";
}

export function CardPreview({ formValues, size = "default" }: CardPreviewProps) {
  const {
    name,
    title,
    company,
    email,
    phone,
    website,
    location,
    linkedin,
    twitter,
    instagram,
    profileImage,
    coverImage,
  } = formValues;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={cn(
      "overflow-hidden mx-auto bg-white shadow-lg",
      size === "sm" ? "max-w-sm" : "max-w-md"
    )}>
      {coverImage ? (
        <div className="relative h-40">
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
          <Avatar className={cn(
            "border-4 border-background shadow-md bg-background",
            size === "sm" ? "w-20 h-20" : "w-24 h-24"
          )}>
            <AvatarImage src={profileImage} alt={name} />
            <AvatarFallback className="text-xl font-medium">{initials}</AvatarFallback>
          </Avatar>

          <h2 className={cn(
            "mt-4 font-bold tracking-tight",
            size === "sm" ? "text-xl" : "text-2xl"
          )}>{name || "Your Name"}</h2>
          <div className="mt-1 space-y-1 text-center">
            <p className={cn(
              "text-muted-foreground",
              size === "sm" ? "text-base" : "text-lg"
            )}>
              {title || "Your Title"}
            </p>
            {company && (
              <p className={cn(
                "font-medium",
                size === "sm" ? "text-base" : "text-lg"
              )}>
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
                  <span className="text-sm font-medium">{phone}</span>
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
                  <span className="text-sm font-medium">{website}</span>
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
                  <span className="text-sm font-medium">{email}</span>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Button */}
          {phone && (
            <Button className="w-full mt-6 gap-2" asChild>
              <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Add me on WhatsApp
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
