import FamilyModel from "./model"
import UserService from "@/modules/user/service"
export interface FamilyColumn {
  id: number;
  familyName: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FamilyMemberColumn {
  familyId: number | null;
  id?: number;
  relation: string | null;
  username?: string | null;
  email: string;
  foodPreference?: string | null;
  dob?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  phone?: string | null;
}

export type FamilyInsert = Omit<FamilyColumn, "id" | "createdAt" | "updatedAt">;

class Resource {
  static toJson(family: FamilyColumn): Partial<FamilyColumn> | null {
    if (!family) return null;
    const data: Partial<FamilyColumn> = {
      id: family.id,
      familyName: family.familyName,
      createdBy: family.createdBy,
    };
    return data;
  }
  static collection(admins: FamilyColumn[]) {
    return admins.map(this.toJson);
  }

  static toJsonMember(
    member: FamilyMemberColumn,
  ): Partial<FamilyMemberColumn> | null {
    if (!member) return null;
    const data: Partial<FamilyMemberColumn> = {
      familyId: member.familyId || null,
      relation: member.relation,
      username: member.username,
      email: member.email,
      foodPreference: member.foodPreference || null,
      dob: member.dob || undefined,
      phone: member.phone || null,
    };
    return data;
  }

  static collectionMembers(members: FamilyMemberColumn[]) {
    return members.map(this.toJsonMember);
  }
}


export default Resource;
