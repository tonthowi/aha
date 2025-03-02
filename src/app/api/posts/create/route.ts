import { NextRequest, NextResponse } from 'next/server';
import { createPost, uploadFile } from '@/lib/firebase/firebaseUtils';
import { validateFile, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, generateSecureFilename } from '@/lib/utils/fileUtils';
import { auth } from '@/lib/firebase/firebase';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from '@/lib/firebase/firebaseAdmin';

// Initialize Firebase Admin if not already initialized
let firebaseAdmin: any;
try {
  firebaseAdmin = getFirebaseAdmin();
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

// Validate content has at least 3 words
const validateContent = (content: string): boolean => {
  const words = content.trim().split(/\s+/);
  return words.length >= 3 && words[0] !== '';
};

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify token with Firebase Admin
    let userId: string;
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    
    // Validate content
    if (!content || !validateContent(content)) {
      return NextResponse.json(
        { error: 'Content must contain at least 3 words' },
        { status: 400 }
      );
    }
    
    // Validate category
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }
    
    // Process media files if any
    const mediaFiles = formData.getAll('media') as File[];
    const processedMedia = [];
    
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        // Skip if not a file
        if (!(file instanceof File)) continue;
        
        // Validate file
        const validation = validateFile(file, {
          maxSize: MAX_FILE_SIZE,
          allowedTypes: ALLOWED_IMAGE_TYPES,
        });
        
        if (!validation.valid) {
          return NextResponse.json(
            { error: `File validation failed: ${validation.error}` },
            { status: 400 }
          );
        }
        
        // Generate secure filename
        const secureFilename = generateSecureFilename(file.name);
        
        // Handle SVG files specifically
        let contentType = file.type;
        if (file.type === 'image/svg+xml') {
          // Ensure content type is correctly set for SVG files
          contentType = 'image/svg+xml';
        }
        
        // Upload to Firebase Storage
        const storagePath = `posts/media/${secureFilename}`;
        const metadata = {
          userId,
          contentType: contentType,
          originalFilename: file.name,
          securityValidated: 'true' // Mark as validated for security
        };
        
        const url = await uploadFile(file, storagePath, metadata);
        
        // Add to processed media
        processedMedia.push({
          type: 'image',
          url,
          filename: file.name,
          mimeType: file.type
        });
      }
    }
    
    // Create post data
    const postData = {
      content,
      category,
      authorId: userId,
      media: processedMedia.length > 0 ? processedMedia : [],
    };
    
    // Create post in Firebase
    const postId = await createPost(postData);
    
    return NextResponse.json({ success: true, postId });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 