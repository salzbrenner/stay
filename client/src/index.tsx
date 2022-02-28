import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ApolloProvider,
  useMutation,
  InMemoryCache,
  ApolloClient,
  createHttpLink,
} from "@apollo/client";
import {
  AppHeader,
  Home,
  Host,
  Listing,
  Listings,
  Login,
  NotFound,
  Stripe,
  User,
} from "./sections";
import { LOG_IN } from "./lib/graphql";
import {
  LogIn as LogInData,
  LogInVariables,
} from "./lib/graphql/mutations/Login/__generated__/LogIn";
import { Viewer } from "./lib/types";
import "./styles/index.css";
import { Affix, Layout, Spin } from "antd";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "/api", // can set instead of localhost:9000/api b/c of proxy in package.json
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      "X-CSRF-TOKEN": token || "",
    },
  };
});
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
};

const stripePromise = loadStripe(
  process.env.REACT_APP_S_PUBLISHABLE_KEY as string
);

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn) {
        setViewer(data.logIn);

        if (data.logIn.token) {
          sessionStorage.setItem("token", data.logIn.token);
        } else {
          sessionStorage.removeItem("token");
        }
      }
    },
  });

  const logInRef = useRef(logIn);

  useEffect(() => {
    logInRef.current();
  }, []);

  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Stay" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to verify you were logged in. Please try again later." />
  ) : null;

  return (
    <Router>
      <Layout id="app">
        {logInErrorBannerElement}
        <Affix offsetTop={0} className="app_affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<Host viewer={viewer} />} />
          <Route
            path="/listing/:id"
            element={
              <Elements stripe={stripePromise}>
                <Listing viewer={viewer} />
              </Elements>
            }
          />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:location" element={<Listings />} />
          <Route path="/login" element={<Login setViewer={setViewer} />} />
          <Route
            path="/user/:id"
            element={<User viewer={viewer} setViewer={setViewer} />}
          />
          <Route
            path="/stripe"
            element={<Stripe viewer={viewer} setViewer={setViewer} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
};

ReactDOM.render(
  // antd doesn't work with strict mode currently
  // <React.StrictMode>
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  // </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
