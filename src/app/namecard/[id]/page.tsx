import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardPreview } from "@/components/namecard/card-preview";
import { CardViewAnalytics } from "@/components/analytics/CardViewAnalytics";
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
      firstName: true,
      lastName: true,
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
    title: `${card.firstName} ${card.lastName}'s Name Card`,
    description: `${card.firstName} ${card.lastName}${card.title ? ` - ${card.title}` : ""}${
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
    include: {
      user: true,
    },
  });

  if (!card) {
    notFound();
  }

  return (
    <CardLayout>
      <CardViewAnalytics cardId={card.id} userId={card.userId} />
      <CardPreview
        formValues={{
          firstName: card.firstName || "",
          lastName: card.lastName || "",
          email: card.email || "",
          title: card.title || "",
          phone: card.phone || "",
          address1: card.address1 || "",
          address2: card.address2 || "",    
          city: card.city || "",  
          postcode: card.postcode || "",
          company: card.company || undefined,
          website: card.website || undefined,
          linkedin: card.linkedin || undefined,
          twitter: card.twitter || undefined,
          instagram: card.instagram || undefined,
          aiChatAgent: card.aiChatAgent || false,
          aiVoiceCallAgent: card.aiVoiceCallAgent || false,
          profileImage: card.profileImage || null,
          coverImage: card.coverImage || null,
        }}
        id={card.id}
        userId={card.userId}
      />
    </CardLayout>
  );
}
