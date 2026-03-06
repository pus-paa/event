
export interface InvitationUserResponse {
  userId: number;
  phone: string | null;
  username: string | null;
  notes: string | null;
  status: string | null;
}


export interface EventInvitationColumn {
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

export interface Invitation_Event {
 id: number;
  event_detail: {
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
  role: string | null; // temp and only done the filtering inthe bacend 
}
class Resource {
  static toJson(rsvp: EventInvitationColumn) {
    const data: Partial<EventInvitationColumn> = {
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
      invited_by: invitation.invited_by,
      familyId: invitation.familyId,
      invitation_status: invitation.invitation_status,
      role: invitation.role ||"Guest",
    }
    return data;
  }
  static invitationeventCollection(invitations: Invitation_Event[]) {
    return invitations.map(this.toEventJson);
  }
}
export default Resource;
