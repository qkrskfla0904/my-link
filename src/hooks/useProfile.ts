"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/types";
import {
  getUserProfileFromFirestore,
  updateUserProfileInFirestore,
  syncUserProfileToFirestore,
} from "@/lib/links";

/**
 * Hook to fetch user profile from Firestore via TanStack Query (No real-time listeners)
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery<Partial<UserProfile> | null>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getUserProfileFromFirestore(userId);
    },
    enabled: Boolean(userId),
  });
}

export interface UpdateProfileInput {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  tags?: string[];
  statusMessage?: string;
  isAvailableForHire?: boolean;
}

/**
 * Hook to update user profile in Firestore with Optimistic Updates
 */
export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      await updateUserProfileInFirestore(userId, data);
    },
    // Optimistic Update: mutate 시작 즉시 캐시 선반영
    onMutate: async (newProfileData: UpdateProfileInput) => {
      if (!userId) return;

      // 1. 진행 중인 쿼리 취소 (선반영 데이터 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });

      // 2. 롤백을 위한 이전 프로필 데이터 스냅샷 저장
      const previousProfile = queryClient.getQueryData<Partial<UserProfile> | null>([
        "userProfile",
        userId,
      ]);

      // 3. 캐시 데이터를 새 값으로 즉각 낙관적 갱신 (화면에 0ms 즉각 반영)
      queryClient.setQueryData<Partial<UserProfile> | null>(
        ["userProfile", userId],
        (old) => {
          return {
            ...old,
            id: userId,
            displayName: newProfileData.displayName.trim(),
            bio:
              newProfileData.bio !== undefined
                ? newProfileData.bio.trim()
                : old?.bio,
            avatarUrl:
              newProfileData.avatarUrl !== undefined
                ? newProfileData.avatarUrl.trim()
                : old?.avatarUrl,
            tags: newProfileData.tags || old?.tags,
            statusMessage:
              newProfileData.statusMessage !== undefined
                ? newProfileData.statusMessage.trim()
                : old?.statusMessage,
            isAvailableForHire:
              newProfileData.isAvailableForHire ?? old?.isAvailableForHire,
          };
        }
      );

      // context에 이전 스냅샷 반환
      return { previousProfile };
    },
    // 서버 통신 오류 발생 시 이전 스냅샷으로 즉시 롤백
    onError: (_err, _newProfileData, context) => {
      if (context?.previousProfile !== undefined && userId) {
        queryClient.setQueryData(["userProfile", userId], context.previousProfile);
      }
    },
    // 성공/실패 여부와 상관없이 서버와 최종 일치시키기 위해 쿼리 무효화
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      }
    },
  });
}

/**
 * Hook to sync initial login user data to Firestore
 */
export function useSyncUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: {
        displayName?: string | null;
        email?: string | null;
        photoURL?: string | null;
        bio?: string;
      };
    }) => {
      await syncUserProfileToFirestore(userId, userData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", variables.userId] });
    },
  });
}
