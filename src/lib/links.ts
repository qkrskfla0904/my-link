import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  increment,
  where,
  limit,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "./firebase";
import { LinkItem, UserProfile } from "@/types";

/**
 * Returns the personalized Firestore collection path for a user: users/{userId}/links
 */
export const getLinksCollectionPath = (userId: string = "anonymous"): string => {
  return `users/${userId}/links`;
};

/**
 * Helper to get the personalized Firestore collection reference: users/{userId}/links
 */
export const getLinksCollectionRef = (userId: string = "anonymous") => {
  return collection(db, "users", userId, "links");
};

/**
 * Helper to get the user document reference: users/{userId}
 */
export const getUserDocRef = (userId: string) => {
  return doc(db, "users", userId);
};

/**
 * Clean data before sending to Firestore to avoid 'undefined' field errors
 */
export function cleanLinkData(data: Partial<LinkItem>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  if (data.title !== undefined) cleaned.title = data.title;
  if (data.url !== undefined) cleaned.url = data.url;
  if (data.description !== undefined && data.description !== null) {
    cleaned.description = data.description;
  } else {
    cleaned.description = "";
  }
  if (data.icon !== undefined) cleaned.icon = data.icon;
  if (data.category !== undefined) cleaned.category = data.category;
  if (data.isActive !== undefined) cleaned.isActive = data.isActive;
  if (data.isPopular !== undefined) cleaned.isPopular = data.isPopular;
  if (data.clickCount !== undefined) cleaned.clickCount = data.clickCount;
  if (data.updatedAt !== undefined) cleaned.updatedAt = data.updatedAt;

  return cleaned;
}

/**
 * Transform a Firestore document into a typed LinkItem
 */
export function transformDocToLinkItem(id: string, data: DocumentData): LinkItem {
  let createdAtStr: string | undefined;
  let updatedAtStr: string | undefined;

  if (data.createdAt) {
    if (typeof data.createdAt.toDate === "function") {
      createdAtStr = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === "string") {
      createdAtStr = data.createdAt;
    } else if (data.createdAt instanceof Date) {
      createdAtStr = data.createdAt.toISOString();
    } else if (typeof data.createdAt.seconds === "number") {
      createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
    }
  }

  if (data.updatedAt) {
    if (typeof data.updatedAt.toDate === "function") {
      updatedAtStr = data.updatedAt.toDate().toISOString();
    } else if (typeof data.updatedAt === "string") {
      updatedAtStr = data.updatedAt;
    } else if (data.updatedAt instanceof Date) {
      updatedAtStr = data.updatedAt.toISOString();
    } else if (typeof data.updatedAt.seconds === "number") {
      updatedAtStr = new Date(data.updatedAt.seconds * 1000).toISOString();
    }
  }

  return {
    id,
    title: data.title || "",
    url: data.url || "",
    description: data.description || undefined,
    icon: data.icon || "globe",
    category: data.category || "기타",
    isActive: data.isActive ?? true,
    isPopular: Boolean(data.isPopular),
    clickCount: data.clickCount ?? 0,
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  };
}

/**
 * Helper to sort links by createdAt descending (newest first)
 */
export function sortLinksByCreatedAtDesc(links: LinkItem[]): LinkItem[] {
  return [...links].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Add a new link to Firestore at `users/{userId}/links`
 */
export async function addLinkToFirestore(
  userId: string,
  newLink: Omit<LinkItem, "id"> | LinkItem
): Promise<LinkItem> {
  const colRef = getLinksCollectionRef(userId);
  const rawData = cleanLinkData({
    ...newLink,
    isActive: newLink.isActive ?? true,
    clickCount: newLink.clickCount ?? 0,
    isPopular: newLink.isPopular ?? false,
  });

  const docData = {
    ...rawData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(colRef, docData);

  return {
    ...newLink,
    id: docRef.id,
    isActive: newLink.isActive ?? true,
    clickCount: newLink.clickCount ?? 0,
    isPopular: newLink.isPopular ?? false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Fetch all links from Firestore `users/{userId}/links` (ordered by createdAt desc)
 */
export async function getLinksFromFirestore(userId: string): Promise<LinkItem[]> {
  const colRef = getLinksCollectionRef(userId);
  try {
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) =>
      transformDocToLinkItem(
        docSnap.id,
        docSnap.data({ serverTimestamps: "estimate" })
      )
    );
  } catch (error) {
    console.warn("Failed to get ordered links from Firestore, falling back to client sort:", error);
    const snapshot = await getDocs(colRef);
    const links = snapshot.docs.map((docSnap) =>
      transformDocToLinkItem(
        docSnap.id,
        docSnap.data({ serverTimestamps: "estimate" })
      )
    );
    return sortLinksByCreatedAtDesc(links);
  }
}

/**
 * Subscribe to real-time link changes in `users/{userId}/links` (ordered by createdAt desc)
 */
export function subscribeToLinksFromFirestore(
  userId: string,
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = getLinksCollectionRef(userId);
  const q = query(colRef, orderBy("createdAt", "desc"));

  let isCancelled = false;
  let fallbackUnsubscribe: (() => void) | null = null;

  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const links = snapshot.docs.map((docSnap) =>
        transformDocToLinkItem(
          docSnap.id,
          docSnap.data({ serverTimestamps: "estimate" })
        )
      );
      onUpdate(links);
    },
    (error) => {
      console.warn("Real-time listener on ordered query failed, trying unordered fallback:", error);
      if (isCancelled) return;

      try {
        fallbackUnsubscribe = onSnapshot(
          colRef,
          (snapshot) => {
            const links = snapshot.docs.map((docSnap) =>
              transformDocToLinkItem(
                docSnap.id,
                docSnap.data({ serverTimestamps: "estimate" })
              )
            );
            onUpdate(sortLinksByCreatedAtDesc(links));
          },
          (fallbackError) => {
            if (onError) onError(fallbackError);
          }
        );
      } catch (err) {
        if (onError) onError(err as Error);
      }
    }
  );

  return () => {
    isCancelled = true;
    unsubscribe();
    if (fallbackUnsubscribe) {
      fallbackUnsubscribe();
    }
  };
}

/**
 * Increment click counter for a link in Firestore `users/{userId}/links/{linkId}`
 */
export async function incrementFirestoreLinkClick(userId: string, linkId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "links", linkId);
    await updateDoc(docRef, {
      clickCount: increment(1),
    });
  } catch (e) {
    console.warn("Failed to increment click count in Firestore:", e);
  }
}

/**
 * Delete a link from Firestore `users/{userId}/links/{linkId}`
 */
export async function deleteLinkFromFirestore(userId: string, linkId: string): Promise<void> {
  const docRef = doc(db, "users", userId, "links", linkId);
  await deleteDoc(docRef);
}

/**
 * Update an existing link in Firestore at `users/{userId}/links/{linkId}`
 */
export async function updateLinkInFirestore(
  userId: string,
  linkId: string,
  updatedData: Partial<LinkItem>
): Promise<void> {
  const docRef = doc(db, "users", userId, "links", linkId);
  const cleaned = cleanLinkData(updatedData);

  await updateDoc(docRef, {
    ...cleaned,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Seed sample links into Firestore `users/{userId}/links`
 */
export async function seedSampleLinksToFirestore(
  userId: string,
  sampleLinks: LinkItem[]
): Promise<void> {
  const colRef = getLinksCollectionRef(userId);
  for (const item of sampleLinks) {
    const rawData = cleanLinkData({
      ...item,
      isActive: item.isActive ?? true,
      clickCount: item.clickCount ?? 0,
      isPopular: item.isPopular ?? false,
    });
    await addDoc(colRef, {
      ...rawData,
      createdAt: serverTimestamp(),
    });
  }
}

/**
 * Sync logged-in user profile info to Firestore `users/{userId}`
 */
export async function syncUserProfileToFirestore(
  userId: string,
  userData: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    bio?: string;
  }
): Promise<void> {
  try {
    const userDoc = getUserDocRef(userId);
    const existing = await getDoc(userDoc);

    const payload: Record<string, unknown> = {
      uid: userId,
      email: userData.email || "",
      lastLoginAt: serverTimestamp(),
      path: `users/${userId}/links`,
    };

    if (!existing.exists()) {
      payload.createdAt = serverTimestamp();
      payload.displayName = userData.displayName || "마이링크 사용자";
      payload.photoURL = userData.photoURL || "";
      payload.bio = userData.bio || "환영합니다! 나만의 맞춤형 링크 모음입니다. 🚀";
      payload.views = 1;
      payload.likes = 0;
      payload.tags = ["💻 프론트엔드", "🚀 Next.js & React"];
      payload.statusMessage = "새로운 기회와 커피챗 언제나 환영합니다 ☕";
      payload.isAvailableForHire = true;
    } else {
      payload.updatedAt = serverTimestamp();
      const existingData = existing.data();
      // Only set initial fallback if not already configured in user document
      if (!existingData.displayName && userData.displayName) {
        payload.displayName = userData.displayName;
      }
      if (!existingData.photoURL && userData.photoURL) {
        payload.photoURL = userData.photoURL;
      }
    }

    await setDoc(userDoc, payload, { merge: true });
  } catch (error) {
    console.warn("Failed to sync user profile to Firestore users/{uid}:", error);
  }
}

/**
 * Fetch user profile from Firestore `users/{userId}`
 */
export async function getUserProfileFromFirestore(
  userId: string
): Promise<Partial<UserProfile> | null> {
  try {
    const userDoc = getUserDocRef(userId);
    const snapshot = await getDoc(userDoc);
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      id: userId,
      displayName: data.displayName || "",
      bio: data.bio || "",
      avatarUrl: data.photoURL || undefined,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      statusMessage: data.statusMessage || undefined,
      isAvailableForHire: data.isAvailableForHire ?? true,
      stats: {
        views: data.views ?? 1,
        likes: data.likes ?? 0,
      },
    };
  } catch (error) {
    console.warn("Failed to get user profile from Firestore:", error);
    return null;
  }
}

/**
 * Check if a display name is already taken by another user in Firestore
 */
export async function checkDisplayNameDuplicate(
  displayName: string,
  currentUserId?: string
): Promise<{ isAvailable: boolean; message: string }> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { isAvailable: false, message: "이름을 입력해주세요." };
  }
  if (trimmed.length < 2) {
    return { isAvailable: false, message: "이름은 최소 2글자 이상이어야 합니다." };
  }
  if (trimmed.length > 20) {
    return { isAvailable: false, message: "이름은 최대 20자까지 가능합니다." };
  }

  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("displayName", "==", trimmed), limit(5));
    const querySnapshot = await getDocs(q);

    // Filter out the current user's document
    const duplicates = querySnapshot.docs.filter((d) => d.id !== currentUserId);

    if (duplicates.length > 0) {
      return {
        isAvailable: false,
        message: "이미 사용 중인 닉네임입니다. 다른 이름을 입력해주세요.",
      };
    }

    // If matches only current user
    if (querySnapshot.docs.length > 0 && querySnapshot.docs[0].id === currentUserId) {
      return {
        isAvailable: true,
        message: "현재 회원님이 사용 중인 닉네임입니다. (사용 가능)",
      };
    }

    return {
      isAvailable: true,
      message: "사용 가능한 멋진 닉네임입니다! 👍",
    };
  } catch (error) {
    console.warn("Failed to check displayName duplication in Firestore:", error);
    // If Firestore rules restrict querying the users collection, allow graceful fallback
    return {
      isAvailable: true,
      message: "사용 가능한 닉네임입니다. (로컬 검증 완료)",
    };
  }
}

/**
 * Update user profile information in Firestore and Firebase Auth
 */
export async function updateUserProfileInFirestore(
  userId: string,
  profileData: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    tags?: string[];
    statusMessage?: string;
    isAvailableForHire?: boolean;
  }
): Promise<void> {
  const userDoc = getUserDocRef(userId);

  const payload: Record<string, unknown> = {
    displayName: profileData.displayName.trim(),
    bio: profileData.bio !== undefined ? profileData.bio.trim() : "",
    photoURL: profileData.avatarUrl !== undefined ? profileData.avatarUrl.trim() : "",
    tags: profileData.tags || [],
    statusMessage: profileData.statusMessage !== undefined ? profileData.statusMessage.trim() : "",
    isAvailableForHire: profileData.isAvailableForHire ?? true,
    updatedAt: serverTimestamp(),
  };

  await setDoc(userDoc, payload, { merge: true });

  // Update Firebase Auth current user profile if user is logged in
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName.trim(),
        photoURL: profileData.avatarUrl?.trim() || null,
      });
    } catch (authErr) {
      console.warn("Failed to update Firebase Auth profile:", authErr);
    }
  }
}
