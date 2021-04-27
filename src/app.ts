import { ApolloServer } from "apollo-server-express";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import mongooseTimestamp from "mongoose-timestamp";
import config from "./config.json";
import createError from "http-errors";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const development = process.env.NODE_ENV === "development";
// These stuff should be set before loading any schemes
mongoose.set("debug", development);
mongoose.plugin(mongooseTimestamp, {
	createdAt: "created_at",
	updatedAt: "updated_at",
});

import schema from "./schemas";

import AuthRouter from "./routes/auth";
import { HttpError } from "http-errors";

config.port ??= 5000;
config.mongodb_url ??= "mongodb://localhost/starcrossed";
config.secret ??= "hunter2";

const app = express();

mongoose.connect(config.mongodb_url, {
	useNewUrlParser: true,
	// replicaSet: "rs0",
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});

const server = new ApolloServer({
	schema,
	playground: true,
	tracing: true,
	introspection: true,
	context: ({ req }) => {
		// Context logic here
		// Specifically authentification verification
		return req;
	},
});

server.applyMiddleware({
	app,
	path: "/graphql",
	cors: true,
	onHealthCheck: () =>
		new Promise((resolve, reject) => {
			if (mongoose.connection.readyState > 0) {
				resolve(true);
			} else {
				reject(false);
			}
		}),
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/auth", AuthRouter);
app.use((req, res, next) => next(createError(404)));
// Error handler
app.use(
	(err: HttpError, req: Request, res: Response, next: NextFunction): void => {
		res.status(err.status || 500).jsonp({
			message: err.message,
			err,
			stack: development ? err.stack : undefined,
		});
	}
);

let httpServer: http.Server;

if (!development) {
	httpServer = http.createServer(app);
} else {
	httpServer = https.createServer(
		{
			key: fs.readFileSync(path.join(__dirname, "..", "confs", "./server.key")),
			cert: fs.readFileSync(
				path.join(__dirname, "..", "confs", "./server.cert")
			),
		},
		app
	);
}
server.installSubscriptionHandlers(httpServer);

httpServer.listen(config.port, () => {
	console.log(`Online at ${development ? "https" : "http"}://localhost:${config.port}/`);
});
