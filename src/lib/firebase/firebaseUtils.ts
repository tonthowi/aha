import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  onSnapshot,
  DocumentSnapshot,
  DocumentData,
  QuerySnapshot,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  PostRecord, 
  UserRecord, 
  LikeRecord, 
  BookmarkRecord, 
  CommentRecord 
} from "@/lib/types/schema";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// User management
export const createUserProfile = async (userData: Omit<UserRecord, 'createdAt' | 'updatedAt'>) => {
  try {
    const userRef = doc(db, "users", userData.uid);
    const timestamp = new Date().toISOString();
    
    await setDoc(userRef, {
      ...userData,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    
    return userData.uid;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserRecord | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() as UserRecord : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<Omit<UserRecord, 'uid' | 'createdAt'>>) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Post management
export const createPost = async (postData: any): Promise<string> => {
  console.log('firebaseUtils: createPost called with data', postData);
  try {
    const db = getFirestore();
    const postsCollection = collection(db, 'posts');
    
    // Use ISO string for timestamp instead of serverTimestamp
    const timestamp = new Date().toISOString();
    
    // Add timestamp
    const postWithTimestamp = {
      ...postData,
      createdAt: timestamp,
      updatedAt: timestamp,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
    };
    
    console.log('firebaseUtils: Prepared post data with timestamp', postWithTimestamp);
    
    // Add document to Firestore
    const docRef = await addDoc(postsCollection, postWithTimestamp);
    console.log('firebaseUtils: Post created successfully with ID', docRef.id);
    
    // Update the document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return docRef.id;
  } catch (error) {
    console.error('firebaseUtils: Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (options?: { 
  limit?: number, 
  orderByField?: keyof PostRecord,
  orderDirection?: 'asc' | 'desc',
  filterByAuthor?: string
}) => {
  try {
    let postsQuery = collection(db, "posts");
    
    // Build query based on options
    let constraints: any[] = [];
    
    if (options?.filterByAuthor) {
      constraints.push(where("authorId", "==", options.filterByAuthor));
    }
    
    // Default sorting
    const sortField = options?.orderByField || "createdAt";
    const sortDirection = options?.orderDirection || "desc";
    constraints.push(orderBy(sortField, sortDirection));
    
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }
    
    const q = query(postsQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as PostRecord);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const getPostById = async (postId: string): Promise<PostRecord | null> => {
  try {
    const postDoc = await getDoc(doc(db, "posts", postId));
    if (!postDoc.exists()) {
      return null;
    }
    
    // Ensure the document has an id field that matches its document ID
    const data = postDoc.data() as PostRecord;
    if (!data.id) {
      data.id = postDoc.id;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
};

export const updatePost = async (postId: string, data: Partial<Omit<PostRecord, 'id' | 'authorId' | 'createdAt'>>) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// Interaction management (likes, bookmarks)
export const toggleLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, "likes", `${userId}_${postId}`);
    const likeDoc = await getDoc(likeRef);
    
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }
    
    if (likeDoc.exists()) {
      // Unlike: Remove like document and decrement post like count
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likeCount: Math.max(0, (postDoc.data() as PostRecord).likeCount - 1),
      });
      return false; // Indicates the post is now unliked
    } else {
      // Like: Create like document and increment post like count
      const timestamp = new Date().toISOString();
      await setDoc(likeRef, {
        id: `${userId}_${postId}`,
        postId,
        userId,
        createdAt: timestamp,
      });
      
      await updateDoc(postRef, {
        likeCount: ((postDoc.data() as PostRecord).likeCount || 0) + 1,
      });
      return true; // Indicates the post is now liked
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const toggleBookmark = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const bookmarkRef = doc(db, "bookmarks", `${userId}_${postId}`);
    const bookmarkDoc = await getDoc(bookmarkRef);
    
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }
    
    if (bookmarkDoc.exists()) {
      // Remove bookmark
      await deleteDoc(bookmarkRef);
      await updateDoc(postRef, {
        bookmarkCount: Math.max(0, (postDoc.data() as PostRecord).bookmarkCount - 1),
      });
      return false; // Indicates the post is now un-bookmarked
    } else {
      // Add bookmark
      const timestamp = new Date().toISOString();
      await setDoc(bookmarkRef, {
        id: `${userId}_${postId}`,
        postId,
        userId,
        createdAt: timestamp,
      });
      
      await updateDoc(postRef, {
        bookmarkCount: ((postDoc.data() as PostRecord).bookmarkCount || 0) + 1,
      });
      return true; // Indicates the post is now bookmarked
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

export const getUserLikes = async (userId: string): Promise<string[]> => {
  try {
    const q = query(collection(db, "likes"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => (doc.data() as LikeRecord).postId);
  } catch (error) {
    console.error("Error fetching user likes:", error);
    throw error;
  }
};

export const getUserBookmarks = async (userId: string): Promise<string[]> => {
  try {
    const q = query(collection(db, "bookmarks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => (doc.data() as BookmarkRecord).postId);
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string, metadata?: Record<string, any>) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { customMetadata: metadata });
  return getDownloadURL(storageRef);
};

// Realtime listeners
export const subscribeToUserLikes = (userId: string, callback: (likedPostIds: string[]) => void) => {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const likedPostIds = snapshot.docs.map(doc => (doc.data() as LikeRecord).postId);
    callback(likedPostIds);
  });
};

export const subscribeToUserBookmarks = (userId: string, callback: (bookmarkedPostIds: string[]) => void) => {
  const q = query(collection(db, "bookmarks"), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const bookmarkedPostIds = snapshot.docs.map(doc => (doc.data() as BookmarkRecord).postId);
    callback(bookmarkedPostIds);
  });
};

export const subscribeToPostUpdates = (callback: (posts: PostRecord[]) => void, options?: {
  limit?: number,
  filterByAuthor?: string
}) => {
  let constraints: any[] = [orderBy("createdAt", "desc")];
  
  if (options?.filterByAuthor) {
    constraints.push(where("authorId", "==", options.filterByAuthor));
  }
  
  if (options?.limit) {
    constraints.push(limit(options.limit));
  }
  
  const q = query(collection(db, "posts"), ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => {
      // Ensure the document has an id field that matches its document ID
      const data = doc.data() as PostRecord;
      if (!data.id) {
        data.id = doc.id;
      }
      return data;
    });
    callback(posts);
  });
};
