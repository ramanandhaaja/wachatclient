import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardForm } from "../../../../../components/namecard/card-form";

async function getNameCard(id: string, userId: string) {
  try {
    const card = await prisma.nameCard.findFirst({
      where: {
        id,
        userId,
      },
    });

    return card;
  } catch (error) {
    console.error('[GET_NAMECARD]', error);
    throw new Error('Failed to fetch name card');
  }
}



export default async function EditNameCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const nameCard = await getNameCard(id, session.user.id);

  if (!nameCard) {
    notFound();
  }

  const formData = {
    firstName: nameCard.firstName || '',
    lastName: nameCard.lastName || '',
    email: nameCard.email || '',
    title: nameCard.title || '',
    phone: nameCard.phone || '',
    address1: nameCard.address1 || '',
    address2: nameCard.address2 || '',
    city: nameCard.city || '',
    postcode: nameCard.postcode || '',
    company: nameCard.company || '',
    website: nameCard.website || '',
    linkedin: nameCard.linkedin || '',
    twitter: nameCard.twitter || '',
    instagram: nameCard.instagram || '',
    profileImage: nameCard.profileImage || '',
    coverImage: nameCard.coverImage || '',
    aiChatAgent: nameCard.aiChatAgent ?? false,
    aiVoiceCallAgent: nameCard.aiVoiceCallAgent ?? false,
  };

  return (
    <CardForm initialData={formData} id={id} />
  );
}
