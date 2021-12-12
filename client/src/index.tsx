import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { Listings } from "./sections";
import "./styles/index.css";

const client = new ApolloClient({
  uri: "/api", // can set instead of localhost:9000/api b/c of proxy in package.json
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Listings title="My house listings" />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
