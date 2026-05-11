/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoPost {
  id: string;
  author: string;
  caption: string;
  music: string;
  likes: string;
  commentsCount: string;
  shares: string;
  videoUrl: string;
  category?: string;
  comments?: {
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }[];
}

export interface User {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
}

export interface LiveSession {
  id: string; // usually same as hostId or channel name
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  viewersCount: number;
  isLive: boolean;
  startedAt: number;
}
