import { Layout, Spin } from "antd";
import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CONNECT_STRIPE } from "../../lib/graphql";
import {
  ConnectStripeVariables,
  ConnectStripe as ConnectStripeData,
} from "../../lib/graphql/mutations/ConnectStripe/__generated__/ConnectStripe";

import { Viewer } from "../../lib/types";
import { displaySuccessNotification } from "../../lib/utils";

const { Content } = Layout;

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const Stripe = ({ viewer, setViewer }: Props) => {
  const navigate = useNavigate();

  const [connectStripe, { data, loading, error }] = useMutation<
    ConnectStripeData,
    ConnectStripeVariables
  >(CONNECT_STRIPE, {
    onCompleted: (data) => {
      if (data && data.connectStripe) {
        setViewer({ ...viewer, hasWallet: data.connectStripe.hasWallet });
        displaySuccessNotification(
          "You've successfully connected your Stripe Account!",
          "You can now begin to create listings in the Host page."
        );
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const connectStripeRef = useRef(connectStripe);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      try {
        connectStripeRef.current({
          variables: {
            input: {
              code,
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (data && data.connectStripe) {
    return <Navigate to={`/user/${viewer.id}`} />;
  }

  if (loading) {
    return (
      <Content>
        <Spin size="large" tip="Connecting your Stripe account..." />
      </Content>
    );
  }

  if (error) {
    return <Navigate to={`/user/${viewer.id}?stripe_error=true`} />;
  }

  return null;
};
