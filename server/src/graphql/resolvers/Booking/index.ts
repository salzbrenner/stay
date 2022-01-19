import { Request } from "express";
import { IResolvers } from "graphql-tools";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api";
import {
  Booking,
  BookingsIndex,
  Database,
  Listing,
  User,
} from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateBookingArgs } from "./types";

// this could be a lot more complex -
// not a robust solution for all edge cases, i.e. trying to book multiple years
// but works for this app
const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const year = dateCursor.getUTCFullYear();
    const month = dateCursor.getUTCMonth();
    const day = dateCursor.getUTCDate();

    if (!newBookingsIndex[year]) {
      newBookingsIndex[year] = {};
    }

    if (!newBookingsIndex[year][month]) {
      newBookingsIndex[year][month] = {};
    }

    if (!newBookingsIndex[year][month][day]) {
      newBookingsIndex[year][month][day] = true;
    } else {
      throw new Error(
        "selected dates can't overlap dates that have already been booked"
      );
    }

    // increment dateCursor by a day
    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

export const bookingsResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      {
        db,
        req,
      }: {
        db: Database;
        req: Request;
      }
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        // only a logged in user can make request
        const viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        // find listing document being booked
        const listing = await db.listings.findOne({
          _id: new ObjectId(id),
        });

        if (!listing) {
          throw new Error("listing can't be found");
        }

        // check viewer is not booking their own listing
        if (listing.host === viewer._id) {
          throw new Error("viewer can't book own listing");
        }

        // check that checkOut is not before checkIn
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("check out date can't be before check in date");
        }

        // create a new bookingsIndex for listing being booked
        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut
        );

        // get total price to charge
        const totalPrice =
          listing.price *
          // get difference in days between check in and check out, and +1 to also include the check in day
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        // get host user document
        const host = await db.users.findOne({
          _id: listing.host,
        });

        if (!host || !host.walletId) {
          throw new Error(
            "the host either can't be found or is not connected with stripe"
          );
        }

        // create Stripe charge on behalf of host
        await Stripe.charge({
          amount: totalPrice,
          source,
          stripeAccount: host.walletId,
        });

        // insert new booking doc
        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut,
        });

        const insertedBooking: Booking | null = await db.bookings.findOne({
          _id: insertRes.insertedId,
        });

        if (!insertedBooking) {
          throw new Error("can't inserted find booking");
        }

        // update host user doc to increment income

        await db.users.updateOne(
          {
            _id: host._id,
          },
          {
            $inc: { income: totalPrice },
          }
        );

        // update bookings field of tenant
        await db.users.updateOne(
          {
            _id: viewer._id,
          },
          {
            $push: { bookings: insertedBooking._id },
          }
        );

        // update bookings field of listing doc
        await db.listings.updateOne(
          {
            _id: listing._id,
          },
          {
            $set: { bookingsIndex },
            $push: { bookings: insertedBooking._id },
          }
        );

        // return inserted booking
        return insertedBooking;
      } catch (error) {
        throw new Error(`Failed to create new booking: ${error}`);
      }
    },
  },
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
    tenant: (
      booking: Booking,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<User | null> => {
      return db.users.findOne({ _id: booking.tenant });
    },
  },
};
