import { User } from "../types";

const FOLLOWED_KEY = "oracle_followed_users";

export const userService = {
  getFollowedUsers: (): string[] => {
    const stored = localStorage.getItem(FOLLOWED_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  isFollowing: (username: string): boolean => {
    const followed = userService.getFollowedUsers();
    return followed.includes(username);
  },

  toggleFollow: (username: string): boolean => {
    const followed = userService.getFollowedUsers();
    let updated;
    let isNowFollowing;

    if (followed.includes(username)) {
      updated = followed.filter(u => u !== username);
      isNowFollowing = false;
    } else {
      updated = [...followed, username];
      isNowFollowing = true;
    }

    localStorage.setItem(FOLLOWED_KEY, JSON.stringify(updated));
    return isNowFollowing;
  },

  shareContent: async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (err) {
        console.error("Share failed:", err);
        return false;
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      return "copied";
    }
  }
};
