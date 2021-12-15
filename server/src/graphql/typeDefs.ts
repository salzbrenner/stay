import { gql } from "apollo-server-core";

export const typeDefs = gql`
  type Query {
    authUrl: String!
  }

  type Mutation {
    logIn: String!
    logOut: String!
  }
`;
