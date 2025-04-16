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
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const nameCard = await getNameCard(params.id, session.user.id);

  if (!nameCard) {
    notFound();
  }

  const formData = {
    name: nameCard.name,
    email: nameCard.email || '',
    title: nameCard.title || '',
    phone: nameCard.phone || '',
    location: nameCard.location || '',
    company: nameCard.company || '',
    website: nameCard.website || '',
    linkedin: nameCard.linkedin || '',
    twitter: nameCard.twitter || '',
    instagram: nameCard.instagram || '',
    profileImage: nameCard.profileImage || '',
    coverImage: nameCard.coverImage || '',
  };

  return (
    <CardForm initialData={formData} id={params.id} />
  );
}
