/**
 * Formats a date string into a relative "time ago" string
 * @param {string} dateString 
 * @returns {string}
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return "";

  // If already formatted by backend
  if (
    typeof dateString === "string" &&
    (dateString.includes("ago") || dateString.includes("Just now"))
  ) {
    return dateString;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

/**
 * Counts total nested replies recursively
 * @param {Array} replies 
 * @returns {number}
 */
export const countReplies = (replies) => {
  if (!replies || replies.length === 0) return 0;
  return replies.reduce(
    (total, reply) => total + 1 + countReplies(reply.replies || []),
    0,
  );
};

/**
 * Normalizes a reply tree to ensure consistent field names (author/content/upvotes)
 * @param {Array} items 
 * @returns {Array}
 */
export const normalizeRepliesTree = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item.id,
    author: item.author ?? item.username ?? "Unknown",
    content: item.content ?? item.text,
    createdAt: item.createdAt ?? item.date_created,
    updatedAt: item.updatedAt,
    upvotes:
      typeof item.upvotes === "number"
        ? item.upvotes
        : (item.likes || 0) - (item.dislikes || 0),
    replies: normalizeRepliesTree(item.replies || []),
  }));
};

/**
 * Normalizes a thread object
 * @param {Object} thread 
 * @returns {Object}
 */
export const normalizeThread = (thread) => {
  if (!thread) return null;

  return {
    id: thread.id,
    title: thread.title,
    content: thread.text ?? thread.content, // handles both db field names
    author: thread.u_id ?? thread.username ?? thread.author ?? "Unknown",
    createdAt: thread.date_created ?? thread.createdAt,
    updatedAt: thread.date_updated ?? thread.updatedAt,
    upvotes: thread.likes ?? thread.upvotes ?? 0,
    commentCount: thread.comment_count ?? thread.commentCount ?? 0,
  };
};

/**
 * Normalizes a scene object
 * @param {Object} item 
 * @returns {Object}
 */
export const normalizeScene = (item) => {
  if (!item) return null;
  const id = item.scene_id ?? item.id ?? item._id;

  return {
    id,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    isOfficial: Boolean(item.isOfficial ?? item.official ?? false),
    members:
      item.members ??
      item.memberCount ??
      item.followers ??
      item.followersCount ??
      0,
    createdBy: item.owner ?? item.createdBy,
    createdAt: item.createdAt ?? item.date_created,
    updatedAt: item.updatedAt ?? item.date_updated,
    albumId: item.albumId ?? null,
    numThreads: item.numThreads ?? item.threadsCount ?? 0,
  };
};
