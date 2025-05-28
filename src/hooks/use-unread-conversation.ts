import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export function useConversationsWithUnread(
  userId: string,
  source?: "web" | "whatsapp",
  showArchived?: boolean
) {
  return useQuery({
    queryKey: ["conversations-with-unread", userId, source, showArchived],
    enabled: !!userId,
    queryFn: async () => {
      let url = `/api/webhook/web-chatbot/conversation-with-unread?user_id=${userId}`;
      if (source) {
        url += `&source=${source}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
  });
}

export function useMarkMessagesAsRead() {
  return useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      const res = await fetch("/api/webhook/web-chatbot/mark-read-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (!res.ok) throw new Error("Failed to mark messages as read");
      return res.json();
    },
  });
}
