import { UserColumn } from "../user/resource";

export interface InvitationColumn {
  id: number;
  userId: number | null;
  hasCheckedIn: boolean | null;
  hasCheckedOut: boolean | null;
  eventId: number;
  familyId: number | null;
  respondedBy: number | null;
  respondedAt: Date | null;
  invitedBy: number;
  role: string;
  status: string | null;
  notes: string | null;
  category: string;
  isArrivalPickupRequired: boolean | null;
  isDeparturePickupRequired: boolean | null;
  unInvitedSubevent: number[] ;
  organizerNote: string | null;
  arrivalDatetime: Date | null;
  departureDatetime: Date | null;
  isAccomodation: boolean | null;
  joinedAt: Date | null;
  assignedRoom: string | null;
  arrivalInfo: string | null;
  departureInfo: string | null;
  updatedAt: Date | null;
  createdAt: Date;
}

export interface FamilyInvitationResponseColumn {
  user: UserColumn;
  eventGuest: InvitationColumn | null;
  familyName: string;
}

export interface Invitation_Event {
  id: number;
  event: {
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
  user: UserColumn | null;
  room: string | null;
  hasCheckedIn: boolean | null;
  hasCheckedOut: boolean | null;
  category: string;
  invitationId: number;
}

class Resource {
  static toJson(invitation: InvitationColumn) {
    const data = {
      id: invitation.id,
      respondedBy: invitation.respondedBy,
      notes: invitation.notes,
      status: invitation.status,
      respondedAt: invitation.respondedAt,
      updatedAt: invitation.updatedAt,
      createdAt: invitation.createdAt
    };
    return data;
  }
  static toEventJson(invitation: Invitation_Event) {
    const data: Partial<Invitation_Event> = {
      id: invitation.id,
      event: invitation.event,
      invitation_status: invitation.invitation_status,
      invited_by: invitation.invited_by,
      familyId: invitation.familyId,
      role: invitation.role,
    };
    return data;
  }

  static toFamilyInvitationResponseJson(
    data: FamilyInvitationResponseColumn,
  ): FamilyInvitationResponseColumn {
    return {
      user: data.user,
      eventGuest: data.eventGuest,
      familyName: data.familyName
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
      user: hotel_responce.user,
      room: hotel_responce.room,
      category: hotel_responce.category,
      invitationId: hotel_responce.invitationId,
      hasCheckedIn: hotel_responce.hasCheckedIn,
      hasCheckedOut: hotel_responce.hasCheckedOut

    };
  }
  static toRoomCollection(hotel_responce: Hotel_responce[]): Hotel_responce[] {
    return hotel_responce.map(this.toRoomJson);
  }
  static toRoomGroupCollection(hotel_responce: Hotel_responce[]) {
    const grouped = new Map<string, any[]>();

    hotel_responce.forEach((item) => {
      const room = item.room || "Unassigned";
      if (!grouped.has(room)) {
        grouped.set(room, []);
      }
      grouped.get(room)?.push({
        user: item.user,
        category: item.category,
        invitationId: item.invitationId,
        hasCheckedIn: item.hasCheckedIn,
        hasCheckedOut: item.hasCheckedOut,
      });
    });

    return Array.from(grouped.entries()).map(([room, users]) => ({
      room,
      eachuser: users,
    }));
  }
}
export default Resource;
