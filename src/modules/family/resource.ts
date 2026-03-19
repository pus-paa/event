import { UserColumn } from "@/modules/user/resource";
export interface FamilyColumn {
  id: number;
  familyName: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export type FamilyMemberColumn = UserColumn;

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
    const data: Partial<FamilyMemberColumn> = member; // all the data are the users data that are selected fromt he table 
    return data;
  }

  static collectionMembers(members: FamilyMemberColumn[]) {
    return members.map(this.toJsonMember);
  }
}

export default Resource;
