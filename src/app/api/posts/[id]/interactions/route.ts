import { NextRequest, NextResponse } from "next/server";
import { toggleLike, toggleBookmark } from "@/lib/firebase/firebaseUtils";

// POST /api/posts/[id]/interactions
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    // Get request data
    const requestData = await request.json();
    const { action, session } = requestData;
    
    // Verify authentication
    if (!session || !session.user || !session.user.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User not logged in" },
        { status: 401 }
      );
    }
    
    const userId = session.user.uid;
    
    // Check action type
    if (!action || (action !== 'like' && action !== 'bookmark')) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'like' or 'bookmark'" },
        { status: 400 }
      );
    }
    
    let result: boolean;
    
    // Perform the action
    if (action === 'like') {
      result = await toggleLike(postId, userId);
    } else {
      result = await toggleBookmark(postId, userId);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        action,
        state: result,
        message: result
          ? `Post ${action === 'like' ? 'liked' : 'bookmarked'} successfully`
          : `Post ${action === 'like' ? 'unliked' : 'unbookmarked'} successfully`
      }
    });
  } catch (error: any) {
    console.error(`Error handling post interaction:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process interaction" },
      { status: 500 }
    );
  }
} 