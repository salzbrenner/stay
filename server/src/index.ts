// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";
import compression from "compression";

const mount = async (app: Application) => {
  const db = await connectDatabase();

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser(process.env.SECRET));
  app.use(compression());

  app.use(express.static(`${__dirname}/client`));
  app.get("/*", (_req, res) => res.sendFile(`${__dirname}/client/index.html`));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // context is 3rd positional argument in resolvers
    context: ({ req, res }) => ({ db, req, res }),
  });
  await server.start();
  server.applyMiddleware({ app, path: "/api" });

  app.listen(process.env.PORT);

  console.log(`[app]: http://localhost:${process.env.PORT}`);
};

mount(express());
