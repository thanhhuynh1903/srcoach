export const capitalizeFirstLetter = (str: string) => {
  if (!str) {
    return '';
  }
  return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMins > 0) {
    return `${diffMins}m ago`;
  } else {
    return 'Just now';
  }
};

export function formatTimestampAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  
  // Get time components
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  // Get date components
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  // Calculate differences
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Check if it's today
  const isToday = now.toDateString() === date.toDateString();
  if (isToday) {
    return time;
  }
  
  // Check if it was yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();
  if (isYesterday) {
    return `Yesterday at ${time}`;
  }
  
  // Check if it was within the last week (but more than 1 day ago)
  const isWithinLastWeek = diffInDays > 1 && diffInDays < 7;
  if (isWithinLastWeek) {
    return `${diffInDays}d ago at ${time}`;
  }
  
  // For anything older than a week
  return `${day}/${month}/${year} ${time}`;
}