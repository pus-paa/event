export interface ReviewColumn {
  id: number;
  businessId: number;
  userId: number;
  // username: string;
  rating: number;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

class Resource {
  static toJson(
    review: Partial<ReviewColumn>,
  ): Partial<ReviewColumn> | null {
    if (!review) return null;
    return {
      id: review.id,
      businessId: review.businessId,
      userId: review.userId,
      // username: review.username,
      rating: review.rating,
      description: review.description,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  static collection(
    reviews: Partial<ReviewColumn>[],
  ): (Partial<ReviewColumn> | null)[] {
    return reviews.map(this.toJson);
  }
}

export default Resource;
