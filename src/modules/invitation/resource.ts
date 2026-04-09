import { UserColumn } from "../user/resource";
export interface InvitationColumn {
  id: number;
  eventId: number;
  familyId: number | null;
  invited_by: number;
  userId: number | null;
  responded_by: number | null;
  status: string | null;
  isArrivalPickupRequired: boolean | null;
  isDeparturePickupRequired: boolean | null;
  isAccomodation: boolean | null;
  arrival_date_time: Date | null;
  departure_date_time: Date | null;
  joined_at: Date | null;
  notes: string | null;
  respondedAt: string | null;
  updatedAt: Date | null;
  createdAt: Date;
}
export interface FamilyInvitationResponseColumn {
  user_detail: UserColumn;
  event_guest: {
    id: number;
    userId: number;
    eventId: number;
    familyId: number | null;
    invited_by: number;
    role: string | null;
    status: string | null;
    notes: string | null;
    arrival_date_time: Date | null;
    departure_date_time: Date | null;
    isAccomodation: boolean | null;
    isArrivalPickupRequired: boolean | null;
    isDeparturePickupRequired: boolean | null;
    joined_at: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export interface Invitation_Event {
  id: number;
  event_detail: {
    id: number;
    title: string | null;
    startDateTime: Date | string;
    endDateTime: Date | string;
    location: string | null;
    venue: string | null;
    imageUrl: string | null;
  };
  invitation_status: string | null;
  invited_by: number;
  familyId: number | null;
  role?: string | null;
}
export interface Hotel_responce {
  user_detail: UserColumn | null;
  user_room: string | null;
  category: string | null;
}
class Resource {
  static toJson(invitation: InvitationColumn) {
    const data = {
      id: invitation.id,
      responded_by: invitation.responded_by,
      notes: invitation.notes,
      status: invitation.status,
      respondedAt: invitation.respondedAt,
      updatedAt: invitation.updatedAt
        ? invitation.updatedAt.toISOString()
        : null,
      createdAt: invitation.createdAt
        ? invitation.createdAt.toISOString()
        : null,
    };
    return data;
  }
  static toEventJson(invitation: Invitation_Event) {
    const data: Partial<Invitation_Event> = {
      id: invitation.id,
      event_detail: invitation.event_detail,
      invitation_status: invitation.invitation_status,
      invited_by: invitation.invited_by,
      familyId: invitation.familyId,
      role: invitation.role ?? "Guest",
    };
    return data;
  }

  static toFamilyInvitationResponseJson(
    data: FamilyInvitationResponseColumn,
  ): FamilyInvitationResponseColumn {
    return {
      user_detail: data.user_detail,
      event_guest: data.event_guest,
    };
  }

  static familyInvitationResponseCollection(
    data: FamilyInvitationResponseColumn[],
  ) {
    return data.map(this.toFamilyInvitationResponseJson);
  }

  static invitationeventCollection(invitations: Invitation_Event[]) {
    return invitations.map(this.toEventJson);
  }
  static toRoomJson(hotel_responce: Hotel_responce): Hotel_responce {
    return {
      user_detail: hotel_responce.user_detail,
      user_room: hotel_responce.user_room,
      category: hotel_responce.category,
    };
  }
  static toRoomCollection(hotel_responce: Hotel_responce[]): Hotel_responce[] {
    return hotel_responce.map(this.toRoomJson);
  }
}
export default Resource;
