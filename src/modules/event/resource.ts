import User from "@/modules/user/resource";
import { photos } from "@/constant";
export interface EventColumn {
  id?: number;
  title: string | null;
  description: string | null;
  dressCode: string | null;
  type: any;
  budget: number | null;
  theme: string | null;
  venueBusinessid: number | null;
  venueId?: number | undefined | null;
  parentId: number | null;
  startDateTime: Date | null;
  endDateTime: Date | null;
  attire: string | null;
  side: string | null;
  location: string | null;
  venue: string | null;
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
      theme: event.theme,
      parentId: event.parentId,
      location: event.location,
      venueBusinessid: event.venueBusinessid,
      venue: event.venue,
      venueId: event.venueId,
      role: event.role,
      status: "upcoming",
      organizer: event.organizer,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      rsvpDeadline: event.rsvpDeadline,
      imageUrl: photos[Math.floor(((Math.random() * 1000) % 6) + 1)]?.url || event.imageUrl
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
