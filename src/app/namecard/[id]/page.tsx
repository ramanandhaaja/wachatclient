import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardPreview } from "@/components/namecard/card-preview";
import { CardViewAnalytics } from "@/components/analytics/CardViewAnalytics";
import { CardLayout } from "@/components/namecard/card-layout";
import { prisma } from "@/lib/prisma";
import { toNameCardFormValues } from "@/lib/schemas/namecard";

const getCard = cache(async (id: string) => {
  return prisma.nameCard.findUnique({
    where: { id },
    include: { user: true },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return { title: "Card Not Found" };
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
  const card = await getCard(id);

  if (!card) {
    notFound();
  }

  return (
    <CardLayout>
      <CardViewAnalytics cardId={card.id} userId={card.userId} />
      <CardPreview
        formValues={toNameCardFormValues(card)}
        id={card.id}
        userId={card.userId}
      />
    </CardLayout>
  );
}
