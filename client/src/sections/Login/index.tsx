import { useApolloClient, useMutation } from "@apollo/client";
import { Card, Layout, Typography, Spin } from "antd";
import { Viewer } from "../../lib/types";
import { ErrorBanner } from "../../lib/components";
import { AUTH_URL, LOG_IN } from "../../lib/graphql";
import {
  LogIn as LogInData,
  LogInVariables,
} from "../../lib/graphql/mutations/Login/__generated__/LogIn";
import { AuthUrl as AuthUrlData } from "../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl";
import googleLogo from "./assets/google_logo.jpg";
import {
  displayErrorMessage,
  displaySuccessNotification,
} from "../../lib/utils";
import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useScrollToTop } from "../../lib/hooks";

interface Props {
  setViewer: (viewer: Viewer) => void;
}
const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = ({ setViewer }: Props) => {
  useScrollToTop();
  // useQuery from @apollo/client runs query on mount
  // but we want to run query manually on specific action, so
  // grab the apollo client with this hook
  const client = useApolloClient();
  const [logIn, { data: logInData, loading: logInLoading, error: logInError }] =
    useMutation<LogInData, LogInVariables>(LOG_IN, {
      onCompleted: (data) => {
        if (data && data.logIn && data.logIn.token) {
          setViewer(data.logIn);
          sessionStorage.setItem("token", data.logIn.token);
          displaySuccessNotification("You've successfully logged in!");
        }
      },
      onError: (error) => {
        console.log(error);
      },
    });

  // the useRef returns a mutable object that persists for lifetime of component
  const logInRef = useRef(logIn);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      try {
        logInRef.current({
          variables: {
            input: { code },
          },
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrlData>({
        query: AUTH_URL,
      });
      window.location.href = data.authUrl;
    } catch (error) {
      displayErrorMessage(
        "Sorry! There was a problem logging in. Please try again later."
      );
      console.log(error);
    }
  };

  if (logInLoading) {
    return (
      <Content>
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }
  if (logInData && logInData.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Navigate to={`/user/${viewerId}`} />;
  }

  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="Sorry! There was a problem logging in. Please try again later." />
  ) : null;
  return (
    <Content className="log-in">
      {logInErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Log in to Stay!
          </Title>
          <Text>Sign in with Google to start booking available rentals!</Text>
        </div>
        <button
          className="log-in-card__google-button"
          onClick={handleAuthorize}
        >
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">
            Sign in with Google
          </span>
        </button>
        <Text type="secondary">
          Note: By signing in, you'll be redirected to the Google consent form
          to sign in with your Google account.
        </Text>
      </Card>
    </Content>
  );
};
