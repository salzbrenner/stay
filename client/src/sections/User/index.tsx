import { Col, Layout, Row } from "antd";
import React, { useState } from "react";
import { useQuery } from "react-apollo";
import { useParams, useSearchParams } from "react-router-dom";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { USER } from "../../lib/graphql";
import {
  User as UserData,
  UserVariables,
} from "../../lib/graphql/queries/User/__generated__/User";
import { useScrollToTop } from "../../lib/hooks";
import { Viewer } from "../../lib/types";
import { UserBookings, UserListings, UserProfile } from "./components";

type RouteParams = {
  id: string;
};

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const PAGE_LIMIT = 4;

export const User = ({ viewer, setViewer }: Props) => {
  useScrollToTop();

  const [params] = useSearchParams();
  const [listingsPage, setListingsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  let { id } = useParams<RouteParams>();

  // useQuery() makes query when page loads
  // but ALSO makes query when any variables are updated
  // in this case, listingsPage or bookingsPage
  // are set from state (clicks) and so the query is run again
  const { data, loading, error, refetch } = useQuery<UserData, UserVariables>(
    USER,
    {
      variables: {
        id: id as string,
        bookingsPage,
        listingsPage,
        limit: PAGE_LIMIT,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleUserRefetch = async () => {
    refetch();
  };

  const stripeError = params.get("stripe_error");
  const stripeErrorBanner = stripeError ? (
    <ErrorBanner description="We had issue connecting with Stripe. Please try again soon." />
  ) : null;

  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or there's been an error. Please try again." />
        <PageSkeleton />
      </Content>
    );
  }
  const user = data ? data.user : null;
  const viewerIsUser = viewer.id === id;

  const userListings = user ? user.listings : null;
  const userBookings = user ? user.bookings : null;

  const userProfileElement = user ? (
    <UserProfile
      user={user}
      viewerIsUser={viewerIsUser}
      viewer={viewer}
      setViewer={setViewer}
      handleUserRefetch={handleUserRefetch}
    />
  ) : null;

  const userListingsElement = userListings ? (
    <UserListings
      userListings={userListings}
      listingsPage={listingsPage}
      limit={PAGE_LIMIT}
      setListingsPage={setListingsPage}
    />
  ) : null;

  const userBookingsElement = userListings ? (
    <UserBookings
      userBookings={userBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  return (
    <Content className="user">
      {stripeErrorBanner}
      <Row>
        <Col xs={24}>{userProfileElement}</Col>
        <Col xs={24}>
          {userListingsElement}
          {userBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};
