import BusinessInfoForm, { BusinessInfoData } from "./business-info-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";

// Server action to fetch business info for the current user
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

async function getBusinessInfo(
  userId: string
): Promise<BusinessInfoData | null> {
  try {
    const info = await prisma.businessInfo.findFirst({ where: { userId } });
    if (!info) return null;

    return {
      id: info.id,
      userId: info.userId,
      data: info.data as Record<string, string>,
      systemPrompt: info.systemPrompt || "",
    };
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2024"
    ) {
      // Connection pool timeout error
      console.error("Database connection pool timeout:", {
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      // You might want to implement a retry mechanism here
      throw error;
    }

    // Log other errors
    console.error("Unexpected error in getBusinessInfo:", {
      userId,
      error,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

// Server action to save business info for the current user
async function saveBusinessInfo(data: BusinessInfoData): Promise<void> {
  // Find existing business info for this user
  const existing = await prisma.businessInfo.findFirst({
    where: { userId: data.userId },
  });

  if (existing) {
    // Update the existing business info
    await prisma.businessInfo.update({
      where: { id: existing.id },
      data: {
        data: data.data,
        systemPrompt: data.systemPrompt,
      },
    });
  } else {
    // Create a new business info
    await prisma.businessInfo.create({
      data: {
        userId: data.userId,
        data: data.data,
        systemPrompt: data.systemPrompt,
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
    <Suspense fallback={<Loading />}>
      <div className="h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-lg shadow-sm">
        <div className="w-full pt-12 pb-12">
          <BusinessInfoForm
            initialData={initialData || { userId, data: {}, systemPrompt: "" }}
            onSubmit={handleSubmit}
            userId={userId}
          />
        </div>
      </div>
    </Suspense>
  );
}
