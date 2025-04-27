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
import {
  nameCardSchema,
  type NameCardFormValues,
} from "@/lib/schemas/namecard";
import { Card, CardContent } from "@/components/ui/card";
import { CardPreview } from "./card-preview";
import { useNameCard } from "@/hooks/use-namecard";
import { uploadImageToSupabase } from "@/lib/upload-image";
import { useSession } from "next-auth/react";
import { resizeImageFile } from "@/lib/image-resize";
import Image from "next/image";

interface CardFormProps {
  initialData?: NameCardFormValues;
  id?: string;
}

export function CardForm({ initialData, id }: CardFormProps) {
  const { data: session } = useSession();
  const form = useForm<NameCardFormValues>({
    resolver: zodResolver(nameCardSchema),
    defaultValues: {
      ...initialData,
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      title: initialData?.title || "",
      company: initialData?.company || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      website: initialData?.website || "",
      address1: initialData?.address1 || "",
      address2: initialData?.address2 || "",
      city: initialData?.city || "",
      postcode: initialData?.postcode || "",
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
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        company: initialData.company || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        website: initialData.website || "",
        address1: initialData.address1 || "",
        address2: initialData.address2 || "",
        city: initialData.city || "",
        postcode: initialData.postcode || "",
        linkedin: initialData.linkedin || "",
        twitter: initialData.twitter || "",
        instagram: initialData.instagram || "",
        profileImage: initialData.profileImage || "",
        coverImage: initialData.coverImage || "",
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
      console.error(
        `Error ${isEditing ? "updating" : "creating"} card:`,
        error
      );
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-6"
              >
                <TabsContent value="details" className="space-y-4">
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="w-1/2">
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="w-1/2">
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="address1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 2</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apartment, suite, etc. (optional)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postcode</FormLabel>
                            <FormControl>
                              <Input placeholder="Postcode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                            <Input
                              placeholder="https://example.com"
                              {...field}
                            />
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
                            <Input
                              placeholder="https://linkedin.com/in/username"
                              {...field}
                            />
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
                            <Input
                              placeholder="https://twitter.com/username"
                              {...field}
                            />
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
                            <Input
                              placeholder="https://instagram.com/username"
                              {...field}
                            />
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
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">
                            Chat Agent
                          </FormLabel>
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
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">
                            Voice Call Agent
                          </FormLabel>
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
                          <FormLabel>Profile Image</FormLabel>
                          <FormControl>
                            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                              <div
                                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary transition"
                                onClick={() =>
                                  document
                                    .getElementById("profile-image-upload")
                                    ?.click()
                                }
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    document
                                      .getElementById("profile-image-upload")
                                      ?.click();
                                }}
                                role="button"
                                aria-label="Upload profile image"
                              >
                                {typeof field.value === "string" &&
                                field.value.length > 0 ? (
                                  <div className="w-full flex flex-col items-center gap-2">
                                    <Image
                                      src={field.value}
                                      alt="Profile Preview"
                                      width={80}
                                      height={80}
                                      className="rounded-md border object-cover"
                                    />
                                    <Button
                                      type="button"
                                      className="mt-2"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => field.onChange(null)}
                                    >
                                      Remove Image
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <svg
                                      className="mx-auto h-12 w-12 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16.5 12.5L12 17m0 0l-4.5-4.5M12 17V3"
                                      />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">
                                      Optimize profile size 80 x 80 px
                                    </p>
                                    <Button
                                      type="button"
                                      className="mt-3"
                                      variant="default"
                                      size="sm"
                                    >
                                      Upload Image
                                    </Button>
                                    <Input
                                      id="profile-image-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!session?.user?.id) {
                                          toast.error(
                                            "You must be logged in to upload images."
                                          );
                                          return;
                                        }
                                        if (file) {
                                          try {
                                            const resizedFile =
                                              await resizeImageFile(
                                                file,
                                                320,
                                                320,
                                                1
                                              );
                                            const profileFileName = `${session.user.id}_${id}_profile.jpg`;
                                            const url =
                                              await uploadImageToSupabase(
                                                resizedFile,
                                                "profileimage",
                                                session.user.id,
                                                profileFileName
                                              );
                                            if (url) {
                                              field.onChange(url);
                                              toast.success("Image uploaded!");
                                            } else {
                                              toast.error(
                                                "Failed to upload image"
                                              );
                                            }
                                          } catch (err) {
                                            toast.error(
                                              "Image too large or could not be processed"
                                            );
                                          }
                                        }
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
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
                          <FormLabel>Cover Image</FormLabel>
                          <FormControl>
                            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                              <div
                                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary transition"
                                onClick={() =>
                                  document
                                    .getElementById("cover-image-upload")
                                    ?.click()
                                }
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    document
                                      .getElementById("cover-image-upload")
                                      ?.click();
                                }}
                                role="button"
                                aria-label="Upload cover image"
                              >
                                {!field.value ? (
                                  <>
                                    <svg
                                      className="mx-auto h-12 w-12 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16.5 12.5L12 17m0 0l-4.5-4.5M12 17V3"
                                      />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">
                                      Optimize banner size 1200 x 628 px
                                    </p>
                                    <Button
                                      type="button"
                                      className="mt-3"
                                      variant="default"
                                      size="sm"
                                    >
                                      Upload Image
                                    </Button>
                                    <Input
                                      id="cover-image-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!session?.user?.id) {
                                          toast.error(
                                            "You must be logged in to upload images."
                                          );
                                          return;
                                        }
                                        if (file) {
                                          try {
                                            const resizedFile =
                                              await resizeImageFile(
                                                file,
                                                1200,
                                                628,
                                                1
                                              );
                                            const coverFileName = `${session.user.id}_${id}_cover.jpg`;
                                            const url =
                                              await uploadImageToSupabase(
                                                resizedFile,
                                                "coverimage",
                                                session.user.id,
                                                coverFileName
                                              );
                                            if (url) {
                                              field.onChange(url);
                                              toast.success(
                                                "Cover image uploaded!"
                                              );
                                            } else {
                                              toast.error(
                                                "Failed to upload cover image"
                                              );
                                            }
                                          } catch (err) {
                                            toast.error(
                                              "Image too large or could not be processed"
                                            );
                                          }
                                        }
                                      }}
                                    />
                                  </>
                                ) : (
                                  <div className="w-full flex flex-col items-center gap-2">
                                    <Image
                                      src={field.value}
                                      alt="Cover Preview"
                                      width={320}
                                      height={80}
                                      className="rounded-md border object-cover"
                                    />
                                    <Button
                                      type="button"
                                      className="mt-2"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => field.onChange("")}
                                    >
                                      Remove Image
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
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
            <CardPreview formValues={formValues} id={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
