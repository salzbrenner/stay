import { Card, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { formatListingPrice, iconColor } from "../../utils";
import { NavLink } from "react-router-dom";

interface Props {
  listing: {
    id: string;
    title: string;
    image: string;
    address: string;
    price: number;
    numOfGuests: number;
  };
}

const { Text, Title } = Typography;

export const ListingCard = ({ listing }: Props) => {
  const { id, title, image, address, price, numOfGuests } = listing;

  return (
    <NavLink to={`/listing/${id}`}>
      <Card
        hoverable
        cover={
          <div
            className="listing-card__cover-img"
            style={{ backgroundImage: `url(${image})` }}
          />
        }
      >
        <div className="listing-card__details">
          <div className="listing-card__description">
            <Title level={4} className="listing-card__price">
              {formatListingPrice(price)}
              <span>/day</span>
            </Title>
            <Text strong ellipsis className="listing-card__address">
              {title}
            </Text>
            <Text ellipsis className="listing-card__location">
              {address}
            </Text>
          </div>
          <div className="listing-card__dimensions listing-card__dimensions--guests">
            <UserOutlined style={{ color: iconColor }} className="mr-1" />
            <Text>{numOfGuests} guests</Text>
          </div>
        </div>
      </Card>
    </NavLink>
  );
};
