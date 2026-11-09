"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinkItem } from "@/types";
import {
  getLinksFromFirestore,
  addLinkToFirestore,
  updateLinkInFirestore,
  deleteLinkFromFirestore,
  incrementFirestoreLinkClick,
  seedSampleLinksToFirestore,
} from "@/lib/links";

/**
 * Hook to fetch user links from Firestore via TanStack Query (No real-time listeners)
 */
export function useLinks(userId: string | undefined) {
  return useQuery<LinkItem[]>({
    queryKey: ["links", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getLinksFromFirestore(userId);
    },
    enabled: Boolean(userId),
  });
}

/**
 * Hook to add a new link to Firestore
 */
export function useAddLink(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLink: LinkItem) => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      return await addLinkToFirestore(userId, newLink);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["links", userId] });
      }
    },
  });
}

/**
 * Hook to update an existing link in Firestore
 */
export function useUpdateLink(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      linkId,
      data,
    }: {
      linkId: string;
      data: Partial<LinkItem>;
    }) => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      await updateLinkInFirestore(userId, linkId, data);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["links", userId] });
      }
    },
  });
}

/**
 * Hook to delete a link from Firestore
 */
export function useDeleteLink(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      await deleteLinkFromFirestore(userId, linkId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["links", userId] });
      }
    },
  });
}

/**
 * Hook to increment click count for a link
 */
export function useIncrementLinkClick(userId: string | undefined) {
  return useMutation({
    mutationFn: async (linkId: string) => {
      if (!userId) return;
      await incrementFirestoreLinkClick(userId, linkId);
    },
  });
}

/**
 * Hook to seed starter sample links into Firestore
 */
export function useSeedSampleLinks(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sampleLinks: LinkItem[]) => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      await seedSampleLinksToFirestore(userId, sampleLinks);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["links", userId] });
      }
    },
  });
}
