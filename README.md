# TIL! - Today I Learned

A platform for capturing and sharing your daily learning moments and discoveries. Turn your "TIL!" moments into lasting knowledge.

## Getting started
To create a new project, you go to `/paths`, choose from our list of Paths, and then use Cursor's Composer feature to quickly scaffold your project!

You can also edit the Path's prompt template to be whatever you like!

## Environment Setup

This project requires several environment variables to function properly. Follow these steps to set up your environment:

1. Copy the `.env.example` file to a new file named `.env.local`
2. Fill in all the required environment variables with your actual credentials
3. **IMPORTANT**: Never commit your `.env.local` file to version control

### Firebase Configuration

You'll need to create a Firebase project and add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### Security Best Practices

To keep your API keys and credentials secure:

1. Never hardcode API keys or credentials directly in your code
2. Always use environment variables for sensitive information
3. Add API key restrictions in your Google Cloud Console to limit usage
4. Regularly rotate your API keys, especially if you suspect they may have been compromised
5. Use `.gitignore` to prevent committing sensitive files

## Technologies used
This doesn't really matter, but is useful for the AI to understand more about this project. We are using the following technologies
- React with Next.js 14 App Router
- TailwindCSS
- Firebase Auth, Storage, and Database
- Multiple AI endpoints including OpenAI, Anthropic, and Replicate using Vercel's AI SDK
