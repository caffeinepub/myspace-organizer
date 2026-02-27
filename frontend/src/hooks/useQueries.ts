// This file is kept minimal as we use custom hooks for each feature
// Backend is a stub - all data is stored in IndexedDB
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function usePing() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['ping'],
    queryFn: async () => {
      if (!actor) return 'offline';
      try {
        return await actor.ping();
      } catch {
        return 'offline';
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
  });
}
