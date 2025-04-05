/**
 * Date formatting utilities
 */

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | number | null): string {
    if (!date) return 'Never';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Format relative time if recent
    const now = new Date();
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Format as date if more than a day old
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  /**
   * Format date for next review (specifically for spaced repetition)
   */
  export function formatReviewDate(date: Date | string | number | null): string {
    if (!date) return 'Not scheduled';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    
    // Same day
    if (
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear()
    ) {
      return 'Today';
    }
    
    // Tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (
      dateObj.getDate() === tomorrow.getDate() &&
      dateObj.getMonth() === tomorrow.getMonth() &&
      dateObj.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow';
    }
    
    // Format normally
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  /**
   * Format a duration in milliseconds to a readable string
   */
  export function formatDuration(durationMs: number): string {
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours} hour${hours !== 1 ? 's' : ''}${
      remainingMinutes ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''
    }`;
  }