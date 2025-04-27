"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { CardPreview } from "@/components/namecard/card-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlusCircle,
  Users,
  QrCode,
  ExternalLink,
  Activity,
  Loader2,
} from "lucide-react";
import { useCardViews } from "@/hooks/use-analytics";
import { useSession } from "next-auth/react";
import { ShareCard } from "../../../components/namecard/share-card";
import { useNameCard } from "@/hooks/use-namecard";

type BusinessCardProps = {
  id: string;
  name: string;
  title: string;
  company?: string;
  email: string;
  phone: string;
  website?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postcode?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  profileImage?: string;
  coverImage?: string;
};

// Temporary analytics data
const demoAnalytics = {
  views: 32,
  shares: 8,
  saves: 5,
  clicks: 12,
};

export default function NameCardDashboard() {
  const { useQuery, useDelete } = useNameCard();
  const { data: cards = [], isLoading } = useQuery();
  const { mutate: deleteCard } = useDelete();

  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: cardViews = 0, isLoading: isViewsLoading } = useCardViews(userId);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Name Cards</h1>
          <p className="text-gray-600 mt-1">Manage your digital name cards</p>
        </div>
        <Link href="/dashboard/namecard/create">
          <Button className="mt-4 md:mt-0 gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Card
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{cards.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Card Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ExternalLink className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
  {isViewsLoading ? <Loader2 className="animate-spin" /> : cardViews}
</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              QR Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <QrCode className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{demoAnalytics.shares}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Link Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{demoAnalytics.clicks}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="my-cards">
          <TabsList>
            <TabsTrigger value="my-cards">My Cards</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="my-cards" className="mt-6">
            {cards.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No cards yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first digital name card to get started
                </p>
                <Link href="/dashboard/namecard/create">
                  <Button>Create Card</Button>
                </Link>
              </div>
            ) : (
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                      <div key={card.id} className="relative group">
                        <CardPreview
                          size="sm"
                          id={card.id}
                          userId={userId ?? ""}
                          formValues={{
                            firstName: card.firstName || "",
                            lastName: card.lastName || "",
                            title: card.title,
                            company: card.company || "",
                            email: card.email || "",
                            phone: card.phone || "",
                            website: card.website || "",
                            address1: card.address1 || "",
                            address2: card.address2 || "",
                            city: card.city || "",
                            postcode: card.postcode || "",
                            linkedin: card.linkedin || "",
                            twitter: card.twitter || "",
                            instagram: card.instagram || "",
                            profileImage: card.profileImage || "",
                            coverImage: card.coverImage || "",
                            aiChatAgent: card.aiChatAgent ?? false,
                            aiVoiceCallAgent: card.aiVoiceCallAgent ?? false,
                          }}
                        />
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/namecard/${card.id}/edit`}
                              className="flex"
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                className="min-w-[64px]"
                              >
                                Edit
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="aspect-square w-8 p-0 flex items-center justify-center"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Name Card
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this name
                                    card? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCard(card.id)}
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Performance</CardTitle>
                <CardDescription>
                  View statistics for all your digital name cards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
                  <p className="text-gray-500">
                    Detailed analytics coming soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
