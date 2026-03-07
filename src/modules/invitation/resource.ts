export interface RsvpColumn {
  id: number;
  eventId: number;
  familyId: number;
  invited_by: number;
  event_guest_id: string;
  responded_by: number;
  status: string;
  notes: string;
  respondedAt: string;
  updatedAt: string;
}

export interface EventInvitationColumn {
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
  invited_by: number;
  familyId: number | null;
  invitation_status: string | null;
  role: string | null;
}

export interface FamilyInvitationResponseColumn {
  user_detail: {
    id: number;
    username: string | null;
    email: string;
    phone: string | null;
    photo: string | null;
    familyId: number | null;
    relation: string | null;
  };
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
    joined_at: string | null;
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
  role?: string | null; // temp and only done the filtering inthe bacend 
}
class Resource {
  static toJson(rsvp: RsvpColumn) {
    const data: Partial<RsvpColumn> = {
      id: rsvp.id,
      event_guest_id: rsvp.event_guest_id,
      responded_by: rsvp.responded_by,
      notes: rsvp.notes,
      status: rsvp.status,
      respondedAt: rsvp.respondedAt,
      updatedAt: rsvp.updatedAt,
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
      role: invitation.role ?? "Guest"
    }
    return data;
  }

  static toFamilyInvitationResponseJson(data: FamilyInvitationResponseColumn): FamilyInvitationResponseColumn {
    return {
      user_detail: data.user_detail,
      event_guest: data.event_guest,
    };
  }

  static familyInvitationResponseCollection(data: FamilyInvitationResponseColumn[]) {
    return data.map(this.toFamilyInvitationResponseJson);
  }

  static invitationeventCollection(invitations: Invitation_Event[]) {
    return invitations.map(this.toEventJson)
  }
}
export default Resource;
