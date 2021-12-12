import { gql } from "apollo-boost";
import { FC } from "react";
import { useQuery, useMutation } from "react-apollo";
import { Listings as ListingsData } from "./__generated__/Listings";
import {
  DeleteListing as DeleteListingData,
  DeleteListingVariables,
} from "./__generated__/DeleteListing";
import "./styles/Listings.css";
import { Alert, List, Avatar, Button, Spin } from "antd";
import { ListingsSkeletons } from "./components";

const LISTINGS = gql`
  query Listings {
    listings {
      id
      title
      image
      address
      price
      numOfGuests
      numOfBeds
      numOfBaths
      rating
    }
  }
`;

const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id) {
      id
    }
  }
`;

interface Props {
  title: string;
}
export const Listings: FC<Props> = ({ title }) => {
  const { data, loading, refetch, error } = useQuery<ListingsData>(LISTINGS);

  const [
    deleteListing,
    { loading: deleteListingLoading, error: deleteListingError },
  ] = useMutation<DeleteListingData, DeleteListingVariables>(DELETE_LISTING);

  const handleDeleteListing = async (id: string) => {
    await deleteListing({ variables: { id } });
    refetch();
  };

  const listings = data ? data.listings : null;

  const listingsList = listings ? (
    <List
      itemLayout="horizontal"
      dataSource={listings}
      renderItem={(listing) => (
        <List.Item
          actions={[
            <Button
              type={"primary"}
              onClick={() => handleDeleteListing(listing.id)}
            >
              Delete
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={listing.title}
            description={listing.address}
            avatar={<Avatar src={listing.image} shape="square" size={48} />}
          />
        </List.Item>
      )}
    />
  ) : null;

  if (loading) {
    return (
      <div className="listings">
        <ListingsSkeletons title={title} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="listings">
        <ListingsSkeletons title={title} error />
      </div>
    );
  }

  const deleteListingErrorAlert = deleteListingError ? (
    <Alert
      className="listings__alert"
      type="error"
      message="Uh oh! Something went wrong - please try again later"
    />
  ) : null;

  return (
    <div className="listings">
      <Spin spinning={deleteListingLoading} />
      {deleteListingErrorAlert}
      <h2>{title}</h2>
      {listingsList}
    </div>
  );
};
