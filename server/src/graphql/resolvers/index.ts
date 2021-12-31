import merge from "lodash.merge";
import { viewerResolvers } from "./Viewer";
import { userResolvers } from "./User";
import { listingResolvers } from "./Listing";
import { bookingsResolvers } from "./Booking";

export const resolvers = merge(
  bookingsResolvers,
  userResolvers,
  viewerResolvers,
  listingResolvers
);
