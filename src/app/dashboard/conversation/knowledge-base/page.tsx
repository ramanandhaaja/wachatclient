import BusinessInfoForm, { BusinessInfoData } from "./business-info-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Server action to fetch business info for the current user
async function getBusinessInfo(userId: string): Promise<BusinessInfoData | null> {
  const info = await prisma.businessInfo.findFirst({ where: { userId } });
  if (!info) return null;
  return {
    id: info.id,
    userId: info.userId,
    services: info.services as Record<string, string>,
    hours: info.hours as Record<string, string>,
    location: info.location as Record<string, string>,
    promos: info.promos as Record<string, string>,
  };
}

// Server action to save business info for the current user
async function saveBusinessInfo(data: BusinessInfoData): Promise<void> {
  if (data.id) {
    await prisma.businessInfo.update({
      where: { id: data.id },
      data: {
        services: data.services,
        hours: data.hours,
        location: data.location,
        promos: data.promos,
      },
    });
  } else {
    await prisma.businessInfo.create({
      data: {
        userId: data.userId,
        services: data.services,
        hours: data.hours,
        location: data.location,
        promos: data.promos,
      },
    });
  }
}

export default async function KnowledgeBasePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const initialData = await getBusinessInfo(userId);

  // This uses a server action for save
  async function handleSubmit(data: BusinessInfoData) {
    "use server";
    await saveBusinessInfo(data);
  }

  return (
    <div className="h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-lg shadow-sm">
      <div className="w-full pt-12 pb-12">
        <BusinessInfoForm
          initialData={initialData || { userId, services: {}, hours: {}, location: {}, promos: {} }}
          onSubmit={handleSubmit}
          userId={userId}
        />
      </div>
    </div>
  );
}
