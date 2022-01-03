import { Col, Layout, Row } from "antd";

import React, { useState } from "react";
import { useQuery } from "react-apollo";
import { useParams } from "react-router";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { LISTING } from "../../lib/graphql";
import {
  Listing as ListingData,
  ListingVariables,
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import { ListingBookings, ListingDetails } from "./components";
import { mockListingBookings } from "./components/mock";

type MatchParams = {
  id: string;
};
const PAGE_LIMIT = 3;
const { Content } = Layout;

export const Listing = () => {
  const [bookingsPage, setBookingsPage] = useState(1);
  let { id } = useParams<MatchParams>();

  const { loading, data, error } = useQuery<ListingData, ListingVariables>(
    LISTING,
    {
      variables: {
        id: id as string,
        bookingsPage: 1,
        limit: PAGE_LIMIT,
      },
    }
  );
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

  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};
