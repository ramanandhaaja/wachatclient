import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NameCardFormValues } from '@/lib/schemas/namecard';

const NAMECARD_KEYS = {
  all: ['namecards'] as const,
  card: (id: string) => [...NAMECARD_KEYS.all, id] as const,
};

interface NameCard extends NameCardFormValues {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

async function fetchNameCards(): Promise<NameCard[]> {
  const response = await fetch('/api/namecards');
  if (!response.ok) {
    throw new Error('Failed to fetch name cards');
  }
  const data = await response.json();
  return data.cards.map((card: any) => ({
    ...card,
    createdAt: new Date(card.createdAt),
    updatedAt: new Date(card.updatedAt),
  }));
}

async function createNameCard(input: NameCardFormValues): Promise<NameCard> {
  const response = await fetch('/api/namecards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create name card');
  }
  const data = await response.json();
  return {
    ...data.card,
    createdAt: new Date(data.card.createdAt),
    updatedAt: new Date(data.card.updatedAt),
  };
}

async function updateNameCard(id: string, input: NameCardFormValues): Promise<NameCard> {
  const response = await fetch(`/api/namecards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update name card');
  }
  const data = await response.json();
  return {
    ...data.card,
    createdAt: new Date(data.card.createdAt),
    updatedAt: new Date(data.card.updatedAt),
  };
}

async function deleteNameCard(id: string): Promise<void> {
  const response = await fetch(`/api/namecards/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete name card');
  }
}

export function useNameCard() {
  const queryClient = useQueryClient();

  return {
    useQuery: () =>
      useQuery({
        queryKey: NAMECARD_KEYS.all,
        queryFn: fetchNameCards,
      }),

    useCreate: () =>
      useMutation({
        mutationFn: createNameCard,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: NAMECARD_KEYS.all });
        },
      }),

    useUpdate: () =>
      useMutation({
        mutationFn: ({ id, input }: { id: string; input: NameCardFormValues }) =>
          updateNameCard(id, input),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: NAMECARD_KEYS.card(id) });
          queryClient.invalidateQueries({ queryKey: NAMECARD_KEYS.all });
        },
      }),

    useDelete: () =>
      useMutation({
        mutationFn: deleteNameCard,
        onSuccess: (_, id) => {
          queryClient.invalidateQueries({ queryKey: NAMECARD_KEYS.card(id) });
          queryClient.invalidateQueries({ queryKey: NAMECARD_KEYS.all });
        },
      }),
  };
}
