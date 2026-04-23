import User from "@/modules/user/resource";
export interface EventColumn {
  id?: number;
  title: string | null;
  description: string | null;
  dressCode: string | null;
  type: any;
  budget: number | null;
  theme: string | null;
  parentId: number | null;
  startDateTime: Date | null;
  endDateTime: Date | null;
  attire: string | null;
  side: string | null;
  location: string | null;
  status?: string | null;
  organizer: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  role?: string | null;
  date: string | null;
  imageUrl: string | null;
  rsvpDeadline?: string | null;
}
export interface EventGuestColumn {
  user: User;
  category: string | null;
  invited_by: User;
  joined_at: string;
  rsvp_status: string | null;
  rsvp_respondAt: string | null;
}

class Resource {
  static toJson(event: Partial<EventColumn>): Partial<EventColumn> | null {
    if (!event) return null;
    const data: Partial<EventColumn> = {
      id: event.id,
      title: event.title,
      dressCode: event.dressCode,
      description: event.description,
      type: event.type,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      budget: event.budget || null,
      theme: event.theme || "Cozy",
      parentId: event.parentId,
      location: event.location,
      role: event.role,
      status: "upcoming",
      organizer: event.organizer,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      rsvpDeadline: (event as any).rsvp_deadline ?? event.rsvpDeadline ?? null,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAoqHk60jIeSNZ9ki1c8iJtQhNgAylhPNie7B-e6RbVhqxqPZYWqYOStnWl2heFJMQW4km9uazp2AJ27FMETIhQQO3tXxYSIvbPNLiMuyf2dg0b3qT3v_GGw5YsO8M3pcj5Bnk0kNmcSQKT1p6x0bsxOFgm0JL10HY5_xet3NtTFkdXUpZlZid6xWZ7LqikDKmn0bLoVzit5hQKLe7VmvXCaa50hemlczbPWpDQbXcqd7R368vilNmPfa2ysrPk64t5Wga7Wgb-EVU",
    };
    return data;
  }
  static collection(events: Partial<EventColumn>[]) {
    return events.map(this.toJson);
  }
  static event_guest_toJson(event_guest: Partial<EventGuestColumn>) {
    if (!event_guest) return null;
    return {
      ...event_guest,
    };
  }
  static collectionEventGuest(event_guest: Partial<EventGuestColumn>[]) {
    return event_guest.map(this.event_guest_toJson);
  }
}
export default Resource;
