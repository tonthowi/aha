import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  Auth
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
  Firestore
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, FirebaseStorage } from "firebase/storage";
import { 
  PostRecord, 
  UserRecord, 
  LikeRecord, 
  BookmarkRecord, 
  CommentRecord 
} from "@/lib/types/schema";
import { validateFile, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/utils/fileUtils';

// Auth functions
export const logoutUser = () => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  return signOut(auth);
};

export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// User management
export const createUserProfile = async (userData: Omit<UserRecord, 'createdAt' | 'updatedAt'>) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const userRef = doc(firestore, "users", userData.uid);
    const timestamp = new Date().toISOString();
    
    await setDoc(userRef, {
      ...userData,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    
    return userData.uid;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserRecord | null> => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const userDoc = await getDoc(doc(firestore, "users", uid));
    return userDoc.exists() ? userDoc.data() as UserRecord : null;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<Omit<UserRecord, 'uid' | 'createdAt'>>) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

// Post management
export const createPost = async (postData: any): Promise<string> => {
  try {
    // Use getFirestore() directly to avoid the undefined check
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
    
    // Add document to Firestore
    const docRef = await addDoc(postsCollection, postWithTimestamp);
    
    // Update the document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getPosts = async (options?: { 
  limit?: number, 
  orderByField?: keyof PostRecord,
  orderDirection?: 'asc' | 'desc',
  filterByAuthor?: string
}) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    let postsQuery = collection(firestore, "posts");
    
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
    throw error;
  }
};

export const getPostById = async (postId: string): Promise<PostRecord | null> => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const postDoc = await getDoc(doc(firestore, "posts", postId));
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
    throw error;
  }
};

export const updatePost = async (postId: string, data: Partial<Omit<PostRecord, 'id' | 'authorId' | 'createdAt'>>) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const postRef = doc(firestore, "posts", postId);
    await updateDoc(postRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    await deleteDoc(doc(firestore, "posts", postId));
  } catch (error) {
    throw error;
  }
};

// Interaction management (likes, bookmarks)
export const toggleLike = async (postId: string, userId: string): Promise<boolean> => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const likeRef = doc(firestore, "likes", `${userId}_${postId}`);
    const likeDoc = await getDoc(likeRef);
    
    const postRef = doc(firestore, "posts", postId);
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
    throw error;
  }
};

export const toggleBookmark = async (postId: string, userId: string): Promise<boolean> => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const bookmarkRef = doc(firestore, "bookmarks", `${userId}_${postId}`);
    const bookmarkDoc = await getDoc(bookmarkRef);
    
    const postRef = doc(firestore, "posts", postId);
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
      return false; // Indicates the post is now unbookmarked
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
    throw error;
  }
};

export const getUserLikes = async (userId: string): Promise<string[]> => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const likesQuery = query(collection(firestore, "likes"), where("userId", "==", userId));
    const likesSnapshot = await getDocs(likesQuery);
    return likesSnapshot.docs.map(doc => doc.data().postId);
  } catch (error) {
    throw error;
  }
};

export const getUserBookmarks = async (userId: string): Promise<string[]> => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  try {
    const firestore = db as Firestore;
    const bookmarksQuery = query(collection(firestore, "bookmarks"), where("userId", "==", userId));
    const bookmarksSnapshot = await getDocs(bookmarksQuery);
    return bookmarksSnapshot.docs.map(doc => doc.data().postId);
  } catch (error) {
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string, metadata?: Record<string, any>) => {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized");
  }
  
  try {
    // Server-side validation for all uploads
    const validation = validateFile(file, {
      maxSize: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_IMAGE_TYPES,
    });
    
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }
    
    // Additional validation for media uploads
    if (path.startsWith('posts/media/')) {
      // Ensure the path uses a secure filename pattern
      const pathParts = path.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      console.log('Validating filename:', filename);
      
      // Ensure metadata contains required fields
      if (!metadata?.userId) {
        throw new Error('User ID is required in metadata');
      }
      
      if (!metadata?.contentType) {
        throw new Error('Content type is required in metadata');
      }
      
      // Instead of validating the filename format, ensure it's secure by
      // generating a new secure filename
      const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
      const safeExtension = fileExtension.replace(/[^a-z0-9]/gi, '');
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15).replace(/[^a-z0-9]/gi, '');
      const secureFilename = `${timestamp}_${randomString}.${safeExtension}`;
      
      // Update the path with the secure filename
      pathParts[pathParts.length - 1] = secureFilename;
      path = pathParts.join('/');
      
      console.log('Using secure filename:', secureFilename);
    }
    
    const firebaseStorage = storage as FirebaseStorage;
    const storageRef = ref(firebaseStorage, path);
    
    // Add content type to metadata if not already present
    const updatedMetadata = {
      ...metadata,
      contentType: metadata?.contentType || file.type,
      securityValidated: 'true', // Mark as validated for security
      validatedAt: new Date().toISOString() // Add validation timestamp
    };
    
    const snapshot = await uploadBytes(storageRef, file, updatedMetadata);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Error in uploadFile:", error);
    throw error;
  }
};

// Realtime listeners
export const subscribeToUserLikes = (userId: string, callback: (likedPostIds: string[]) => void) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  const firestore = db as Firestore;
  const likesQuery = query(collection(firestore, "likes"), where("userId", "==", userId));
  return onSnapshot(likesQuery, (snapshot) => {
    const likedPostIds = snapshot.docs.map(doc => doc.data().postId);
    callback(likedPostIds);
  });
};

export const subscribeToUserBookmarks = (userId: string, callback: (bookmarkedPostIds: string[]) => void) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  const firestore = db as Firestore;
  const bookmarksQuery = query(collection(firestore, "bookmarks"), where("userId", "==", userId));
  return onSnapshot(bookmarksQuery, (snapshot) => {
    const bookmarkedPostIds = snapshot.docs.map(doc => doc.data().postId);
    callback(bookmarkedPostIds);
  });
};

export const subscribeToPostUpdates = (callback: (posts: PostRecord[]) => void, options?: {
  limit?: number,
  filterByAuthor?: string
}) => {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized");
  }
  
  const firestore = db as Firestore;
  let constraints: any[] = [];
  
  if (options?.filterByAuthor) {
    constraints.push(where("authorId", "==", options.filterByAuthor));
  }
  
  constraints.push(orderBy("createdAt", "desc"));
  
  if (options?.limit) {
    constraints.push(limit(options.limit));
  }
  
  const postsQuery = query(collection(firestore, "posts"), ...constraints);
  
  return onSnapshot(postsQuery, (snapshot) => {
    const posts = snapshot.docs.map(doc => {
      const data = doc.data() as PostRecord;
      // Ensure the document has an id field that matches its document ID
      if (!data.id) {
        data.id = doc.id;
      }
      return data;
    });
    callback(posts);
  });
};
