import { ObjectId } from "bson";
import { IResolvers } from "graphql-tools";
import { Database, Listing } from "../../../lib/types";

export const resolvers: IResolvers = {
  Query: {
    listings: async (
      _root: undefined,
      _args: Record<string, never>,
      { db }: { db: Database } // check index.ts where context is set
    ): Promise<Listing[]> => await db.listings.find({}).toArray(),
  },
  Mutation: {
    deleteListing: async (
      _root: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Listing> => {
      const deleteResult = await db.listings.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!deleteResult.value) {
        throw new Error("Failed to delete listing");
      }
      return deleteResult.value;
    },
  },
  Listing: {
    // the argument comes from the parent fields - ie deleteListing, listings above
    id: (listing: Listing): string => listing._id.toString(),
    // don't have to define all the props like title, b/c if unspecified, apollo is just
    // returning the named prop directly like below
    // title: (listing: Listing) => listing.title,
  },
};
