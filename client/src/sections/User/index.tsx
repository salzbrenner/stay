import { Col, Layout, Row } from "antd";
import React from "react";
import { useQuery } from "react-apollo";
import { useParams } from "react-router-dom";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { USER } from "../../lib/graphql";
import {
  User as UserData,
  UserVariables,
} from "../../lib/graphql/queries/User/__generated__/User";
import { Viewer } from "../../lib/types";
import { UserProfile } from "./components";

type RouteParams = {
  id: string;
};

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;

export const User = ({ viewer }: Props) => {
  let { id } = useParams<RouteParams>();
  const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: id as string,
    },
  });

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

  const userProfileElement = user ? (
    <UserProfile user={user} viewerIsUser={viewerIsUser} />
  ) : null;
  return (
    <Content>
      <Row>
        <Col xs={24}>{userProfileElement}</Col>
      </Row>
    </Content>
  );
};
