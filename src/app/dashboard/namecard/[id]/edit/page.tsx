import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CardForm } from "../../../../../components/namecard/card-form";
import { toNameCardFormValues } from "@/lib/schemas/namecard";

export default async function EditNameCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const nameCard = await prisma.nameCard.findFirst({
    where: { id, userId: user.id },
  });

  if (!nameCard) {
    notFound();
  }

  return (
    <CardForm initialData={toNameCardFormValues(nameCard)} id={id} userId={user.id} />
  );
}
