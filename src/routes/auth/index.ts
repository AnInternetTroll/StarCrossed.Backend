import { Router, Request, Response, NextFunction } from "express";
import { User } from "../../models/user";
import { AccessToken, IAccessToken } from "../../models/access_token";
import jwt from "jsonwebtoken";
import { secret } from "../../config.json";
import createError from "http-errors";
const router = Router();

interface AuthHeaderBasic {
	type: "Basic";
	username: string;
	password: string;
}

interface AuthHeaderBearer {
	type: "Bearer";
	token: string;
}

function decodeAuthHeader(
	authorization: string
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
async function parseToken(
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

async function createToken(userId: string): Promise<string> {
	const token = new AccessToken({
		user: userId,
	});
	await token.save();
	setTimeout(() => AccessToken.findByIdAndDelete(token._id), token.exp);
	return token.token;
}

async function restrictRoute(
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

router.get("/token", restrictRoute, async (req, res, next) => {
	if (!req.user) return next(createError(500, "Something went wrong :/"));
	res.jsonp({
		message: "Succesfully authentificated",
		token: await createToken(req.user.id),
	});
});

router.post("/register", async (req, res, next) => {
	const header = decodeAuthHeader(req.headers.authorization || "");
	if (!header) return next(createError(401, "Bad authorization header"));
	const { type, ...data } = header;
	if (type !== "Basic")
		return next(
			createError(
				401,
				"You must use the `Basic` authorization scheme when registering. "
			)
		);
	try {
		const new_user = new User({
			...data,
			...req.body,
		});
		res.jsonp({
			message: "User Succesfully created!",
			user: await new_user.save(),
		});
	} catch (err) {
		next(createError(401, err));
	}
});

router.get("/user", restrictRoute, (req, res) => {
	res.jsonp(req.user);
});

router.delete("/user", restrictRoute, async (req, res, next) => {
	if (!req.body.password) return next(createError(401, "No password provided"));
	const user = await User.findOne({
		username: req.user?.username,
		password: req.body.password,
	}).exec();
	if (!user) return next(createError(404, "User not found"));
	else
		return res.status(204).jsonp({
			message: "User succesfully deleted",
			user: await user.delete(),
		});
});

export default router;
