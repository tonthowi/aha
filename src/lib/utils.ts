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