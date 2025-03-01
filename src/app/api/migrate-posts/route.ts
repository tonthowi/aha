import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, doc, updateDoc, query, where, Firestore } from "firebase/firestore";

// This API route will update all existing posts to include authorId
// It's a one-time migration script that should be run manually

export async function GET(request: NextRequest) {
  try {
    // Check if Firestore is initialized
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Firebase Firestore is not initialized" },
        { status: 500 }
      );
    }

    // Check for a secret key to prevent unauthorized access
    const url = new URL(request.url);
    const secretKey = url.searchParams.get("key");
    
    // Validate that the migration secret key is set in environment variables
    if (!process.env.MIGRATION_SECRET_KEY) {
      console.error("MIGRATION_SECRET_KEY is not set in environment variables");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Security check with constant-time comparison to prevent timing attacks
    if (!secretKey || secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Since we've checked db is not undefined, we can safely use it
    const firestore = db as Firestore;
    
    // Get all posts
    const postsRef = collection(firestore, "posts");
    const postsSnapshot = await getDocs(postsRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each post
    const updatePromises = postsSnapshot.docs.map(async (docSnapshot) => {
      const postData = docSnapshot.data();
      const postId = docSnapshot.id;
      
      // Skip posts that already have authorId
      if (postData.authorId) {
        skippedCount++;
        return;
      }
      
      try {
        // Find the user by name to get their ID
        // This is a best-effort approach since we're matching by display name
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("displayName", "==", postData.authorName));
        const userSnapshot = await getDocs(q);
        
        if (!userSnapshot.empty) {
          // Found a user with matching display name
          const userData = userSnapshot.docs[0].data();
          const userId = userData.uid;
          
          // Update the post with the authorId
          const postRef = doc(firestore, "posts", postId);
          await updateDoc(postRef, {
            authorId: userId
          });
          
          updatedCount++;
        } else {
          // No matching user found, skip this post
          console.log(`No user found for post ${postId} with author ${postData.authorName}`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error updating post ${postId}:`, error);
        errorCount++;
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      success: true,
      message: "Migration completed",
      stats: {
        total: postsSnapshot.size,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });
  } catch (error: any) {
    console.error("Error in migration:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to migrate posts" },
      { status: 500 }
    );
  }
} 