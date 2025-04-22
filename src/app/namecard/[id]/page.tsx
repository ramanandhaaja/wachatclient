import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardPreview } from "@/components/namecard/card-preview";
import { CardLayout } from "@/components/namecard/card-layout";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = await prisma.nameCard.findUnique({
    where: {
      id,

    },
    select: {
      name: true,
      title: true,
      company: true,
    },
  });

  if (!card) {
    return {
      title: "Card Not Found",
    };
  }

  return {
    title: `${card.name}'s Name Card`,
    description: `${card.name}${card.title ? ` - ${card.title}` : ""}${
      card.company ? ` at ${card.company}` : ""
    }`,
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await prisma.nameCard.findUnique({
    where: {
      id,
    },
  });

  if (!card) {
    notFound();
  }

  return (
    <CardLayout>
      <CardPreview
        formValues={{
          name: card.name,
          email: card.email || "",
          title: card.title || "",
          phone: card.phone || "",
          location: card.location || undefined,
          company: card.company || undefined,
          website: card.website || undefined,
          linkedin: card.linkedin || undefined,
          twitter: card.twitter || undefined,
          instagram: card.instagram || undefined,
          aiChatAgent: card.aiChatAgent || false,
          aiVoiceCallAgent: card.aiVoiceCallAgent || false,
          profileImage: card.profileImage || undefined,
          coverImage: card.coverImage || undefined,
        }}
        id={card.id}
      />
    </CardLayout>
  );
}
