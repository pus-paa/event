export interface WeddingTodoTemplateItem {
  title: string;
  task?: string;
  monthsBeforeWedding?: number;
  dayOffset?: number;
  reminderDaysBefore?: number;
  status?: "pending" | "in_progress" | "done";
}

export const DEFAULT_WEDDING_TODO_TEMPLATE: WeddingTodoTemplateItem[] = [
  // 10-12 months before
  { title: "Check if your wedding date is on an auspicious day", monthsBeforeWedding: 12, reminderDaysBefore: 14, status: "pending" },
  { title: "Do you want a destination wedding?", monthsBeforeWedding: 12, reminderDaysBefore: 14, status: "pending" },
  { title: "Shortlist date options for all pre-wedding functions", monthsBeforeWedding: 12, reminderDaysBefore: 10, status: "pending" },
  { title: "Delegate responsibilities", monthsBeforeWedding: 11, reminderDaysBefore: 10, status: "pending" },
  { title: "Decide whether to use a wedding planner", monthsBeforeWedding: 11, reminderDaysBefore: 10, status: "pending" },
  { title: "Create initial guest list", monthsBeforeWedding: 11, reminderDaysBefore: 7, status: "pending" },
  { title: "Confirm venue budget", monthsBeforeWedding: 10, reminderDaysBefore: 7, status: "pending" },
  { title: "Explore and shortlist venues", monthsBeforeWedding: 10, reminderDaysBefore: 7, status: "pending" },
  { title: "Visit shortlisted venues", monthsBeforeWedding: 10, reminderDaysBefore: 5, status: "pending" },
  { title: "Shortlist photographers and videographers", monthsBeforeWedding: 10, reminderDaysBefore: 7, status: "pending" },

  // 7-9 months before
  { title: "Finalize venue", monthsBeforeWedding: 9, reminderDaysBefore: 10, status: "pending" },
  { title: "Book bridal makeup artist", monthsBeforeWedding: 9, reminderDaysBefore: 7, status: "pending" },
  { title: "Confirm photographer", monthsBeforeWedding: 8, reminderDaysBefore: 7, status: "pending" },
  { title: "Confirm videographer", monthsBeforeWedding: 8, reminderDaysBefore: 7, status: "pending" },
  { title: "Create wedding website", monthsBeforeWedding: 8, reminderDaysBefore: 7, status: "pending" },
  { title: "Create wedding hashtag", monthsBeforeWedding: 8, reminderDaysBefore: 7, status: "pending" },
  { title: "Book your florist", monthsBeforeWedding: 7, reminderDaysBefore: 7, status: "pending" },

  // 4-6 months before
  { title: "Book accommodation for outstation guests", monthsBeforeWedding: 6, reminderDaysBefore: 10, status: "pending" },
  { title: "Finalize and book DJ", monthsBeforeWedding: 5, reminderDaysBefore: 7, status: "pending" },
  { title: "Finalize and book choreographer", monthsBeforeWedding: 5, reminderDaysBefore: 7, status: "pending" },
  { title: "Shortlist and buy wedding outfit", monthsBeforeWedding: 5, reminderDaysBefore: 7, status: "pending" },
  { title: "Finalize groom outfits", monthsBeforeWedding: 4, reminderDaysBefore: 7, status: "pending" },
  { title: "Begin legal marriage steps", monthsBeforeWedding: 4, reminderDaysBefore: 7, status: "pending" },
  { title: "Start planning honeymoon", monthsBeforeWedding: 4, reminderDaysBefore: 7, status: "pending" },
  { title: "Finalize priest/pandit", monthsBeforeWedding: 4, reminderDaysBefore: 7, status: "pending" },

  // 2-3 months before
  { title: "Finalize decor vendor", monthsBeforeWedding: 3, reminderDaysBefore: 7, status: "pending" },
  { title: "Book caterer", monthsBeforeWedding: 3, reminderDaysBefore: 7, status: "pending" },
  { title: "Order wedding invitations", monthsBeforeWedding: 3, reminderDaysBefore: 10, status: "pending" },
  { title: "Purchase wedding rings", monthsBeforeWedding: 2, reminderDaysBefore: 7, status: "pending" },
  { title: "Book honeymoon", monthsBeforeWedding: 2, reminderDaysBefore: 7, status: "pending" },
  { title: "Book wedding car", monthsBeforeWedding: 2, reminderDaysBefore: 7, status: "pending" },
  { title: "Shortlist and buy bride/groom shoes", monthsBeforeWedding: 2, reminderDaysBefore: 7, status: "pending" },

  // 1 month before (explicitly requested)
  { title: "Finalize music for wedding and pre-wedding events", monthsBeforeWedding: 1, reminderDaysBefore: 5, status: "pending" },
  { title: "Gather vendors for a venue visit", monthsBeforeWedding: 1, reminderDaysBefore: 5, status: "pending" },
  { title: "Attend final outfit fittings", monthsBeforeWedding: 1, reminderDaysBefore: 5, status: "pending" },
  { title: "Confirm final details with all vendors", monthsBeforeWedding: 1, reminderDaysBefore: 3, status: "pending" },

  // 2 weeks / last week before
  { title: "Take care of your skin", dayOffset: -14, reminderDaysBefore: 3, status: "pending" },
  { title: "Pack your honeymoon bags", dayOffset: -14, reminderDaysBefore: 3, status: "pending" },
  { title: "Book your wedding cake", dayOffset: -7, reminderDaysBefore: 2, status: "pending" },
  { title: "Prepare bridal bag to take to the venue", dayOffset: -7, reminderDaysBefore: 2, status: "pending" },

  // after wedding
  { title: "Download your wedding photographs", dayOffset: 7, reminderDaysBefore: 0, status: "pending" },
  { title: "Rate and review your vendors", dayOffset: 10, reminderDaysBefore: 0, status: "pending" },
];
