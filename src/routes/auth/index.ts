import { Router } from "express";
import { User } from "../../models/user";
import createError from "http-errors";
import * as utils from "./utils";

const router = Router();

router.get("/token", utils.restrictRoute, async (req, res, next) => {
	if (!req.user) return next(createError(500, "Something went wrong :/"));
	res.jsonp({
		message: "Succesfully authentificated",
		token: await utils.createToken(req.user.id),
	});
});

router.post("/register", async (req, res, next) => {
	const header = utils.decodeAuthHeader(req.headers.authorization);
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

router.get("/user", utils.restrictRoute, (req, res) => {
	res.jsonp(req.user);
});

router.delete("/user", utils.restrictRoute, async (req, res, next) => {
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
