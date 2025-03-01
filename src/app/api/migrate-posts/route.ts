import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

// This API route will update all existing posts to include authorId
// It's a one-time migration script that should be run manually

export async function GET(request: NextRequest) {
  try {
    // Check for a secret key to prevent unauthorized access
    const url = new URL(request.url);
    const secretKey = url.searchParams.get("key");
    
    // Simple security check - in production, use a more secure method
    if (secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get all posts
    const postsRef = collection(db, "posts");
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
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", postData.authorName));
        const userSnapshot = await getDocs(q);
        
        if (!userSnapshot.empty) {
          // Found a user with matching display name
          const userData = userSnapshot.docs[0].data();
          const userId = userData.uid;
          
          // Update the post with the authorId
          const postRef = doc(db, "posts", postId);
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