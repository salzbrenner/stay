import React from "react";
import { Alert, Divider, Skeleton } from "antd";
import "./styles/ListingSkeleton.css";

interface Props {
  title: string;
  error?: boolean;
}

export const ListingsSkeletons = ({ title, error = false }: Props) => {
  const errorAlert = error ? (
    <Alert
      className="listings-skeleton__alert"
      type="error"
      message="Uh oh! Something went wrong - please try again later"
    />
  ) : null;
  return (
    <div className="listings-skeleton">
      {errorAlert}
      <h2>{title}</h2>
      <Skeleton active paragraph={{ rows: 1 }} />
      <Divider />
      <Skeleton active paragraph={{ rows: 1 }} />
      <Divider />
      <Skeleton active paragraph={{ rows: 1 }} />
    </div>
  );
};
