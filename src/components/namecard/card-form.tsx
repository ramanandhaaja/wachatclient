"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { nameCardSchema, type NameCardFormValues } from "@/lib/schemas/namecard";
import { Card, CardContent } from "@/components/ui/card";
import { CardPreview } from "./card-preview";
import { useNameCard } from "@/hooks/use-namecard";

interface CardFormProps {
  initialData?: NameCardFormValues;
  id?: string;
}

export function CardForm({ initialData, id }: CardFormProps) {
  const form = useForm<NameCardFormValues>({
    resolver: zodResolver(nameCardSchema),
    defaultValues: {
      ...initialData,
      name: initialData?.name || "",
      title: initialData?.title || "",
      company: initialData?.company || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      website: initialData?.website || "",
      location: initialData?.location || "",
      linkedin: initialData?.linkedin || "",
      twitter: initialData?.twitter || "",
      instagram: initialData?.instagram || "",
      profileImage: initialData?.profileImage || "",
      coverImage: initialData?.coverImage || "",
      aiChatAgent: initialData?.aiChatAgent ?? false,
      aiVoiceCallAgent: initialData?.aiVoiceCallAgent ?? false,
    },
  });
  // Ensure form values are updated when initialData changes (important for edit)
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        aiChatAgent: initialData.aiChatAgent ?? false,
        aiVoiceCallAgent: initialData.aiVoiceCallAgent ?? false,
      });
    }
  }, [initialData, form]);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const isEditing = !!id;

  const { useCreate, useUpdate } = useNameCard();
  const createCard = useCreate();
  const updateCard = useUpdate();

  const onSubmit = async (data: NameCardFormValues) => {
    try {
      if (isEditing && id) {
        await updateCard.mutateAsync({ id, input: data });
        toast.success("Name card updated successfully!");
      } else {
        await createCard.mutateAsync(data);
        toast.success("Name card created successfully!");
      }
      router.push("/dashboard/namecard");
      router.refresh();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} card:`, error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} name card`);
    }
  };

  const formValues = form.watch();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? "Edit" : "Create"} Your Digital Name Card
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Card Details</TabsTrigger>
              <TabsTrigger value="ai-agent">AI Agent</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <TabsContent value="details" className="space-y-4">
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Social Links Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Links</h3>
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ai-agent" className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="aiChatAgent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="accent-primary border rounded"
                              checked={!!field.value}
                              onChange={e => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">Chat Agent</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aiVoiceCallAgent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="accent-primary border rounded"
                              checked={!!field.value}
                              onChange={e => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">Voice Call Agent</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="profileImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/profile.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="coverImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/cover.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <div className="flex justify-end">
                  <Button type="submit">
                    {isEditing ? "Update" : "Create"} Card
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h3 className="text-lg font-medium mb-4">Live Preview</h3>
            <CardPreview formValues={formValues} />
          </div>
        </div>
      </div>
    </div>
  );
}
