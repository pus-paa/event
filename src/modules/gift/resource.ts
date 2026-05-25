
export interface GiftCategoryColumn {
  id: number;
  name: string;
  eventId: number;
  createdBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GiftColumn {
  id: number;
  name: string;
  category: string | null;
  eventId: number;
  value: number | null;
  createdBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GiftCategoryWithGifts extends GiftCategoryColumn {
  gifts: Partial<GiftColumn>[];
}

class Resource {
  static toCategoryJson(
    category: Partial<GiftCategoryColumn> | null ,
  ): Partial<GiftCategoryColumn> | null {
    if (!category) return null;
    return {
      id: category.id,
      name: category.name,
      eventId: category.eventId as number,
      createdBy: category.createdBy ?? null,
      createdAt: category.createdAt ?? null,
      updatedAt: category.updatedAt ?? null,
    };
  }

  static toGiftJson(gift: Partial<GiftColumn> | null): Partial<GiftColumn> | null {
    if (!gift) return null;
    return {
      id: gift.id,
      name: gift.name,
      category: gift.category ?? null,
      eventId: gift.eventId as number,
      value: gift.value ?? null,
      createdBy: gift.createdBy ?? null,
      createdAt: gift.createdAt ?? null,
      updatedAt: gift.updatedAt ?? null,
    };
  }

  static categoryCollection(categories: Partial<GiftCategoryColumn>[]) {
    return categories.map(this.toCategoryJson).filter(Boolean);
  }

  static giftCollection(gifts: Partial<GiftColumn>[]) {
    return gifts.map(this.toGiftJson).filter(Boolean);
  }

  static groupByCategory(
    categories: GiftCategoryColumn[],
    gifts: Partial<GiftColumn>[],
  ): GiftCategoryWithGifts[] {
    const grouped = new Map<string, GiftCategoryWithGifts>();

    categories.forEach((category) => {
      const key = category.name ?? "Uncategorized";
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: category.id ?? 0,
          name: category.name ?? null,
          eventId: category.eventId as number,
          createdBy: category.createdBy ?? null,
          createdAt: category.createdAt ?? null,
          updatedAt: category.updatedAt ?? null,
          gifts: [],
        });
      }
    });

    gifts.forEach((gift) => {
      const key = gift.category ?? "Uncategorized";
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: 0,
          name: gift.category ?? "Uncategorized",
          eventId: gift.eventId as number,
          createdBy: null,
          createdAt: null,
          updatedAt: null,
          gifts: [],
        });
      }
      grouped.get(key)?.gifts.push(this.toGiftJson(gift) as GiftColumn);
    });

    return Array.from(grouped.values());
  }
}
export default Resource;
