import { useQuery } from '@tanstack/react-query';

const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  cardViews: (userId: string) => [...ANALYTICS_KEYS.all, 'cardViews', userId] as const,
};

async function fetchCardViews(userId: string): Promise<number> {
  const response = await fetch(`/api/analytics/card-views?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch card views');
  }
  const data = await response.json();
  return data.views;
}

export function useCardViews(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? ANALYTICS_KEYS.cardViews(userId) : [],
    queryFn: () => (userId ? fetchCardViews(userId) : Promise.resolve(0)),
    enabled: !!userId,
  });
}
