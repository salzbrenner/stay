import { Col, Layout, Row } from "antd";

import { useState } from "react";
import { useQuery } from "react-apollo";
import { useParams } from "react-router";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { LISTING } from "../../lib/graphql";
import {
  Listing as ListingData,
  ListingVariables,
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import {
  ListingBookings,
  ListingDetails,
  ListingCreateBooking,
  WrappedListingCreateBookingModal,
} from "./components";
import { Moment } from "moment";
import { mockListingBookings } from "./components/mock";
import { Viewer } from "../../lib/types";
import { useScrollToTop } from "../../lib/hooks";

type MatchParams = {
  id: string;
};
const PAGE_LIMIT = 3;
const { Content } = Layout;

export const Listing = ({ viewer }: { viewer: Viewer }) => {
  useScrollToTop();

  const [bookingsPage, setBookingsPage] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  let { id } = useParams<MatchParams>();

  const { loading, data, error, refetch } = useQuery<
    ListingData,
    ListingVariables
  >(LISTING, {
    variables: {
      id: id as string,
      bookingsPage: 1,
      limit: PAGE_LIMIT,
    },
  });

  const clearBookingData = () => {
    setModalVisible(false);
    setCheckInDate(null);
    setCheckOutDate(null);
  };

  const handleListingRefetch = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="This listing may not exist or we've encountered and error. Please try again." />
        <PageSkeleton />
      </Content>
    );
  }

  const listing = data ? data.listing : null;
  // const listingBookings = mockListingBookings;
  const listingBookings = listing ? listing.bookings : null;

  const listingDetailsElement = listing ? (
    <ListingDetails listing={listing} />
  ) : null;

  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  const listingCreateBookingElement = listing ? (
    <ListingCreateBooking
      viewer={viewer}
      host={listing.host}
      price={listing.price}
      bookingsIndex={listing.bookingsIndex}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
      setModalVisible={setModalVisible}
    />
  ) : null;

  const listingCreateBookingModalElement =
    listing && checkInDate && checkOutDate ? (
      <WrappedListingCreateBookingModal
        id={listing.id}
        modalVisible={modalVisible}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        price={listing.price}
        setModalVisible={setModalVisible}
        clearBookingData={clearBookingData}
        handleListingRefetch={handleListingRefetch}
      />
    ) : null;

  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>

        <Col xs={24} lg={10}>
          {listingCreateBookingElement}
        </Col>
      </Row>
      {listingCreateBookingModalElement}
    </Content>
  );
};
