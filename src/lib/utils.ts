import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAvatarUrl = (name: string, avatarUrl?: string) => {
  if (avatarUrl) return avatarUrl;
  
  // Use the avatar placeholder API with the user's name
  return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(name)}`;
};

export function formatTimestamp(date: string | Date): string {
  try {
    const d = new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
    
    const now = new Date();
    
    // Format the date part: "Wed, Feb 26"
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    // Format the time part: "10:42 AM"
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Calculate the relative time
    const diffInMilliseconds = now.getTime() - d.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let relativeTime = '';
    if (diffInDays > 0) {
      relativeTime = `(${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago)`;
    } else if (diffInHours > 0) {
      relativeTime = `(${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago)`;
    } else if (diffInMinutes > 0) {
      relativeTime = `(${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago)`;
    } else {
      relativeTime = '(just now)';
    }

    return `${dateStr}, ${timeStr} ${relativeTime}`;
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid Date";
  }
} 