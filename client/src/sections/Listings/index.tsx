import { Affix, Layout, List, Typography } from "antd";
import { ListingCard, ErrorBanner } from "../../lib/components";
import { LISTINGS } from "../../lib/graphql";
import {
  ListingsVariables,
  Listings as ListingsData,
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { ListingsFilter } from "../../lib/graphql/globalTypes";
import { useQuery } from "react-apollo";
import { NavLink, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ListingsFilters,
  ListingsPagination,
  ListingsSkeleton,
} from "./components";
import { useScrollToTop } from "../../lib/hooks";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const PAGE_LIMIT = 8;

type MatchParams = {
  location: string;
};

export const Listings = () => {
  useScrollToTop();

  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const [page, setPage] = useState(1);
  const { location } = useParams<MatchParams>();
  const locationRef = useRef(location);
  const { data, loading, error } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      // when location changes and not on first page
      // skip updating b/c setPage in useEffect will call
      // the query again
      skip: locationRef.current !== location && page !== 1,
      variables: {
        location,
        filter,
        page,
        limit: PAGE_LIMIT,
      },
    }
  );

  useEffect(() => {
    // if location changes, reset to first page
    setPage(1);
  }, [location]);

  if (loading) {
    return (
      <Content className="listings">
        <ListingsSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="We couldn't find anything matching your search, or have encountered an error" />
        <ListingsSkeleton />
      </Content>
    );
  }

  const listings = data ? data.listings : null;
  const listingsRegion = listings ? listings.region : null;

  const listingsSectionElement =
    listings && listings.result.length ? (
      <div>
        <Affix offsetTop={64}>
          <div>
            <ListingsPagination
              total={listings.total}
              page={page}
              limit={PAGE_LIMIT}
              setPage={setPage}
            />
            <ListingsFilters
              filter={filter}
              setFilter={setFilter}
            ></ListingsFilters>
          </div>
        </Affix>

        <List
          grid={{
            gutter: 8,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          dataSource={listings.result}
          renderItem={(listing) => (
            <List.Item>
              <ListingCard listing={listing} />
            </List.Item>
          )}
        />
      </div>
    ) : (
      <div>
        <Paragraph>
          It appears that no listings have been create for{" "}
          <Text mark>"{listingsRegion}"</Text>
        </Paragraph>
        <Paragraph>
          Be the first person to create a{" "}
          <NavLink to="/host">listing in this area</NavLink>!
        </Paragraph>
      </div>
    );

  const listingsRegionElement = listingsRegion ? (
    <Title level={3} className="listings__title">
      Results for "{listingsRegion}"
    </Title>
  ) : null;

  return (
    <Content className="listings">
      {listingsRegionElement}
      {listingsSectionElement}
    </Content>
  );
};
