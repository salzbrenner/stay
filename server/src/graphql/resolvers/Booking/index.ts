import { IResolvers } from "graphql-tools";
import { Booking, Database, Listing } from "../../../lib/types";

export const bookingsResolvers: IResolvers = {
  Booking: {
    id: (listing: Booking): string => {
      return listing._id.toString();
    },
    listing: (
      booking: Booking,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    },
  },
};
