import { ApolloServer } from "apollo-server-express";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import mongooseTimestamp from "mongoose-timestamp";
import config from "./config.json";
import createError from "http-errors";
import http from "http";

const development = process.env.NODE_ENV === "development";
// These stuff should be set before loading any schemes
mongoose.set("debug", development);
mongoose.plugin(mongooseTimestamp, {
	createdAt: "created_at",
	updatedAt: "updated_at",
});

import {
	decodeAuthHeader,
	parseToken,
	AuthHeaderBasic,
	AuthHeaderBearer,
} from "./routes/auth/utils";
import { IUser, User } from "./models/user";
import { IAccessToken } from "./models/access_token";

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
	context: async ({ req, res }) => {
		const auth: string =
			req?.headers?.authorization || req?.cookies?.authorization || "";
		let header: AuthHeaderBasic | AuthHeaderBearer;
		try {
			header = decodeAuthHeader(auth);
		} catch (err) {
			// This is what happens if there is no auth
			header = null;
		}
		let user: IUser | null = null;
		if (header)
			switch (header.type) {
				case "Basic":
					user = await User.findOne({
						username: header.username,
						password: header.password,
					}).exec();
					if (!user) throw createError(403, "Wrong username or password");
					break;
				case "Bearer":
					let token: IAccessToken | false;
					try {
						token = await parseToken(header.token, true);
					} catch (err) {
						if (err.name === "TokenExpiredError")
							throw createError(403, "Token has expired.");
						else if (err.name === "JsonWebTokenError")
							throw createError(403, "Token has been tampered with.");
						else throw createError(500, err);
					}
					if (token && typeof token.user !== "string") user = token.user;
					else throw createError(403, "Invalid token, please try again");
					break;
				default:
					break;
			}
		return { req, res, user };
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

let httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);
httpServer.listen(config.port, () => {
	console.log(`Online at http://localhost:${config.port}/`);
});
