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
  invited: "invited",
  accepted: "accepted",
  rejected: "rejected",
} as const;
const role = {
  user: "user",
  admin: "admin",
  organizer: "organizer",
  guest: "guest",
};

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
const ROOT_PATH = path.join(__dirname);
export { role, ROOT_PATH, foodPreference, attendingstate, invitationStatus };
