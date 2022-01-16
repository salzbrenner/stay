import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Listings as ListingsData,
  ListingsVariables,
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { ListingsFilter } from "../../lib/graphql/globalTypes";

import { Col, Row, Layout, Typography } from "antd";
import { displayErrorMessage } from "../../lib/utils";
import { HomeHero, HomeListings, HomeListingsSkeleton } from "./components";
import mapBackground from "./assets/map-background.jpg";
import sanFransiscoImage from "./assets/san-fransisco.jpg";
import cancunImage from "./assets/cancun.jpg";
import { useQuery } from "react-apollo";
import { LISTINGS } from "../../lib/graphql";

const { Content } = Layout;
const { Paragraph, Title } = Typography;

export const Home = () => {
  const { loading, data } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      variables: {
        filter: ListingsFilter.PRICE_HIGH_TO_LOW,
        page: 1,
        limit: 4,
      },
    }
  );

  const { loading: budgetLoading, data: budgetData } = useQuery<
    ListingsData,
    ListingsVariables
  >(LISTINGS, {
    variables: {
      filter: ListingsFilter.PRICE_LOW_TO_HIGH,
      page: 1,
      limit: 4,
    },
  });
  const navigate = useNavigate();
  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      navigate(`/listings/${trimmedValue}`);
    } else {
      displayErrorMessage("Please enter a valid search!");
    }
  };

  const renderListingsSection = (type: ListingsFilter) => {
    const dataSource =
      type === ListingsFilter.PRICE_HIGH_TO_LOW ? data : budgetData;
    const title =
      type === ListingsFilter.PRICE_HIGH_TO_LOW
        ? "Premium Listings"
        : "Great Deals!";

    if (loading) {
      return <HomeListingsSkeleton />;
    }

    if (dataSource) {
      return (
        <HomeListings title={title} listings={dataSource.listings.result} />
      );
    }

    return null;
  };

  return (
    <Content
      className="home"
      style={{ backgroundImage: `url(${mapBackground})` }}
    >
      <HomeHero onSearch={onSearch} />

      <div className="home__cta-section">
        <Title level={2} className="home__cta-section-title">
          Your guide for all things rental
        </Title>
        <Paragraph>
          Helping you make the best decisions in renting your last minute
          locations.
        </Paragraph>
        <Link
          to="/listings/united%20states"
          className="ant-btn ant-btn-primary ant-btn-lg home__cta-section-button"
        >
          Popular listings in the United States
        </Link>
      </div>

      {renderListingsSection(ListingsFilter.PRICE_LOW_TO_HIGH)}
      {renderListingsSection(ListingsFilter.PRICE_HIGH_TO_LOW)}

      <div className="home__listings">
        <Title level={4} className="home__listings-title">
          Listings of any kind
        </Title>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Link to="/listings/san%20fransisco">
              <div className="home__listings-img-cover">
                <img
                  src={sanFransiscoImage}
                  alt="San Fransisco"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link to="/listings/cancún">
              <div className="home__listings-img-cover">
                <img
                  src={cancunImage}
                  alt="Cancún"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </Content>
  );
};
