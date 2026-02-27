// This file is kept minimal as we use custom hooks for each feature
// Backend is used for label persistence; all other data is stored in IndexedDB
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetAllLabels() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLabels();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
  });
}

export function useInitializeDefaultLabels() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.initializeDefaultLabels();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}
