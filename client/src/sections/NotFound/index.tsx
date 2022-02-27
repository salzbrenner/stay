import React from "react";
import { Empty, Layout, Typography } from "antd";
import { Link } from "react-router-dom";

const { Content } = Layout;
const { Text } = Typography;

export const NotFound = () => {
  return (
    <Content className="not-found">
      <Empty
        description={
          <>
            <Text className="not-found__description-title">
              Uh-oh! Something went wrong :(
            </Text>
          </>
        }
      />
      <Link to="/" className="not-found__cta ant-btn ant-btn-primary">
        Go to Home
      </Link>
    </Content>
  );
};
