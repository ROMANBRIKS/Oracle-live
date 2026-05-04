/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  likes: string[]; // array of uids
  commentsCount: number;
  sharesCount: number;
  createdAt: number;
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
