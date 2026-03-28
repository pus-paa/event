
export interface BusinessColumn {
	id: number;
	business_name: string;
	type?: string | null;
	category?: string | null;
	avatar?: string | null;
	cover?: string | null;
	location?: string | null;
	city?: string | null;
	country?: string | null;
	legal_document?: string | null;
	is_verified?: boolean | null;
	owner_id: number;
	description?: string | null;
	price_starting_from?: number | null;
	years_of_experience?: number | null;
	team_size?: number | null;
	service_area?: string | null;
	contact_person_name?: string | null;
	contact_phone?: string | null;
	website_url?: string | null;
	instagram_url?: string | null;
	whatsapp_number?: string | null;
	provides_home_service?: boolean | null;
	travel_policy?: string | null;
	cancellation_policy?: string | null;
	createdAt?: Date | null;
	updatedAt?: Date | null;
}

class Resource {
	/** Shape a raw DB row into the public business object */
	static toJson(row: BusinessColumn): Partial<BusinessColumn> | null {
		if (!row) return null;
		return {
			id: row.id,
			business_name: row.business_name,
			type: row.type,
			category: row.category,
			avatar: row.avatar,
			cover: row.cover,
			location: row.location,
			city: row.city,
			country: row.country,
			is_verified: row.is_verified,
			owner_id: row.owner_id,
			description: row.description,
			price_starting_from: row.price_starting_from,
			years_of_experience: row.years_of_experience,
			team_size: row.team_size,
			service_area: row.service_area,
			contact_person_name: row.contact_person_name,
			contact_phone: row.contact_phone,
			website_url: row.website_url,
			instagram_url: row.instagram_url,
			whatsapp_number: row.whatsapp_number,
			provides_home_service: row.provides_home_service,
			travel_policy: row.travel_policy,
			cancellation_policy: row.cancellation_policy,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	static collection(rows: BusinessColumn[]) {
		return rows.map((r) => Resource.toJson(r));
	}
}

export default Resource;
