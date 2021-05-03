import { Request, Response, NextFunction } from "express";
import { AccessToken, IAccessToken } from "../../models/access_token";
import jwt from "jsonwebtoken";
import { secret } from "../../config.json";
import createError from "http-errors";
import { User } from "../../models/user";

export interface AuthHeaderBasic {
	type: "Basic";
	username: string;
	password: string;
}

export interface AuthHeaderBearer {
	type: "Bearer";
	token: string;
}

export function decodeAuthHeader(
	authorization: string = ""
): AuthHeaderBasic | AuthHeaderBearer {
	const [type, value] = authorization.split(" ");
	switch (type) {
		case "Basic":
			const [username, password] = Buffer.from(value, "base64")
				.toString()
				.split(":");
			return { type, username, password };
			break;
		case "Bearer":
			return { type, token: value };
			break;
		default:
			throw createError(401, "Invalid authentification method");
			break;
	}
}
export async function parseToken(
	token: string,
	strict = false
): Promise<false | IAccessToken> {
	const data = jwt.verify(token, secret) as IAccessToken | string;
	if (strict) {
		const existingToken = await AccessToken.findOne({
			token: token,
			user: typeof data !== "string" ? data.user : undefined,
		}).populate("user");
		if (existingToken) return existingToken;
		else return false;
	} else {
		return typeof data === "string" ? false : data;
	}
}

export async function createToken(userId: string): Promise<string> {
	const token = new AccessToken({
		user: userId,
	});
	await token.save();
	setTimeout(() => AccessToken.findByIdAndDelete(token._id), token.exp);
	return token.token;
}

export async function restrictRoute(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const auth: string = req.headers.authorization || req.cookies.authorization;
	if (!auth)
		return next(createError(401, "No authorization method has been provided"));
	let header: AuthHeaderBasic | AuthHeaderBearer;
	try {
		header = decodeAuthHeader(auth);
	} catch (err) {
		return next(createError(err));
	}
	switch (header.type) {
		case "Basic":
			req.user = await User.findOne({
				username: header.username,
				password: header.password,
			}).exec();
			if (!req.user)
				return next(createError(403, "Wrong username or password"));
			break;
		case "Bearer":
			let token: IAccessToken | false;
			try {
				token = await parseToken(header.token, true);
			} catch (err) {
				if (err.name === "TokenExpiredError")
					return next(createError(403, "Token has expired."));
				else if (err.name === "JsonWebTokenError")
					return next(createError(403, "Token has been tampered with."));
				else return next(createError(500, err));
			}
			if (token && typeof token.user !== "string") req.user = token.user;
			else return next(createError(403, "Invalid token, please try again"));
			break;
		default:
			return next(
				createError(401, "Invalid formatting of authorization method")
			);
			break;
	}
	next();
}
