import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  increment,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { LinkItem } from "@/types";

// Collection path specified by user requirements
export const LINKS_COLLECTION_PATH = "users/anonymous/links";

/**
 * Helper to get the Firestore collection reference
 */
export const getLinksCollectionRef = () => {
  return collection(db, "users", "anonymous", "links");
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

  return cleaned;
}

/**
 * Transform a Firestore document into a typed LinkItem
 */
export function transformDocToLinkItem(id: string, data: DocumentData): LinkItem {
  let createdAtStr: string | undefined;

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
 * Add a new link to Firestore at `users/anonymous/links`
 */
export async function addLinkToFirestore(
  newLink: Omit<LinkItem, "id"> | LinkItem
): Promise<LinkItem> {
  const colRef = getLinksCollectionRef();
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
 * Fetch all links from Firestore `users/anonymous/links` (ordered by createdAt desc)
 */
export async function getLinksFromFirestore(): Promise<LinkItem[]> {
  const colRef = getLinksCollectionRef();
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
 * Subscribe to real-time link changes in `users/anonymous/links` (ordered by createdAt desc)
 * Automatically updates when links are added, modified, or removed.
 */
export function subscribeToLinksFromFirestore(
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = getLinksCollectionRef();
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
 * Increment click counter for a link in Firestore
 */
export async function incrementFirestoreLinkClick(linkId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", "anonymous", "links", linkId);
    await updateDoc(docRef, {
      clickCount: increment(1),
    });
  } catch (e) {
    console.warn("Failed to increment click count in Firestore:", e);
  }
}

/**
 * Delete a link from Firestore
 */
export async function deleteLinkFromFirestore(linkId: string): Promise<void> {
  const docRef = doc(db, "users", "anonymous", "links", linkId);
  await deleteDoc(docRef);
}

/**
 * Update an existing link in Firestore at `users/anonymous/links`
 */
export async function updateLinkInFirestore(
  linkId: string,
  updatedData: Partial<LinkItem>
): Promise<void> {
  const docRef = doc(db, "users", "anonymous", "links", linkId);
  const cleaned = cleanLinkData(updatedData);

  await updateDoc(docRef, {
    ...cleaned,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Seed sample links into Firestore (users/anonymous/links)
 */
export async function seedSampleLinksToFirestore(sampleLinks: LinkItem[]): Promise<void> {
  const colRef = getLinksCollectionRef();
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
