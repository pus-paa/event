import path from "path";

export const imageValidationExtensions = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "heic",
  "heif",
  "webp",
];
const foodPreference = {
  veg: "veg",
  nonVeg: "nonVeg",
  vegan: "vegan",
};
const attendingstate = {
  pending: "pending",
  completed: "completed",
};
const invitationStatus = {
  draft: "draft",
  pending: "pending",
  accepted: "accepted",
  rejected: "rejected",
} as const;
const role = {
  user: "user",
  admin: "admin",
  organizer: "organizer",
  guest: "guest",
};
export enum TODO_CATEGORIES {
  planning = "Planning",
  venue = "Venue",
  caterying = "Catering",
  decoration = "Decoration",
  photography = "Photography",
  entertainment = "Entertainment",
  guest = "Guest Management",
  transport = "Transport",
}


export enum VendorBusinessCategoryTypes {
  Venue = "Venue",
  PhotographerVideographer = "Photographers & Videographer",
  MakeupArtist = "Makeup Artist",
  BridalGrooming = "Bridal Grooming",
  MehendiArtist = "Mehendi Artist",
  WeddingPlannersDecorator = "Wedding Planners & Decorator",
  MusicEntertainment = "Music & Entertainment",
  InvitesGift = "Invites & Gift",
  FoodCatering = "Food & Catering",
  PreWeddingShoot = "Pre Wedding Shoot",
  BridalWear = "Bridal Wear",
  JewelryAccessories = "Jewelry & Accessories",
  SecurityGuard = "Security Guard",
  Baraat = "Baraat"
}
export const photos = [
  {
    id: "1",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDeW7ylSiob80ww9XoAOOV3fReuakm7CdifvgqSXNruTM_9zAafkSATg54Dmx3H7FAZ5KXTRd39NLDkX59Y3q3sxo1tkE7A7izp0iVgffzw7wQD1ZGNTwh0GVaKomwXQ9aAgwXmkYiHuyLVXHjwPa43pqfUwcXAnj00ohS22F1JIFaI0gqlP4ljcXEqU0-A1ZjuQLfYmk0FeUhi3kPIuFPTGwNPv_HTUqTqGaOGf9I_Hr5lb4N45xrwpUyAvH3ZVxD2I2QRXr3HmhQ",
  },

  {
    id: "2",
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1481669624812-c47721341026?q=80&w=1127&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1481669624812-c47721341026?q=80&w=1127&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "7",
    url: "https://plus.unsplash.com/premium_photo-1670333351937-68cb2735a0fd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

const ROOT_PATH = path.join(__dirname);
export { role, ROOT_PATH, foodPreference, attendingstate, invitationStatus };
