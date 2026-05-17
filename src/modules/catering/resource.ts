export interface CateringColumn {
  id: number;
  name: string;
  perPlateprice: string;
  startDateTime: Date;
  endDateTime: Date;
  noOfpax: number | null | undefined;
  eventId: number;
  mealType: string;
  isVeg: boolean;
  vendorId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MenuItemColumn {
  id: number;
  name: string;
  description: string;
  cateringId: number;
  type: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

class Resource {
  static toJson(
    catering: Partial<CateringColumn>,
  ): Partial<CateringColumn> | null {
    if (!catering) return null;
    const data: Partial<CateringColumn> = {
      id: catering.id,
      eventId: catering.eventId,
      vendorId: catering.vendorId,
      isVeg: catering.isVeg,
      name: catering.name,
      perPlateprice: catering.perPlateprice,
      noOfpax: catering.noOfpax,
      startDateTime: catering.startDateTime,
      endDateTime: catering.endDateTime,
      mealType: catering.mealType,
      createdAt: catering.createdAt,
      updatedAt: catering.updatedAt,
    };

    return data;
  }

  static toJsonMenu(
    menuItem: Partial<MenuItemColumn>,
  ): Partial<MenuItemColumn> | null {
    if (!menuItem) return null;

    const data: Partial<MenuItemColumn> = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      cateringId: menuItem.cateringId,
      type: menuItem.type,
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };

    return data;
  }

  static collection(
    caterings: Partial<CateringColumn>[],
  ): (Partial<CateringColumn> | null)[] {
    return caterings.map(this.toJson);
  }

  static menuCollection(
    menuItems: Partial<MenuItemColumn>[],
  ): (Partial<MenuItemColumn> | null)[] {
    return menuItems.map(this.toJsonMenu);
  }
}

export default Resource;
