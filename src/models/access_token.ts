import { Schema, model, Document } from "mongoose";
import { Id } from "./common";
import jwt from "jsonwebtoken";
import { secret } from "../config.json";
import { IUser } from "./user";

export interface IAccessToken extends Document {
	id: string;
	token: string;
	user: string | IUser;
	exp: number;
}

const accessTokenSchema = new Schema({
	_id: Id,
	user: {
		type: Id.type,
		ref: "user",
	},
	exp: {
		type: Number,
		// 1 hour
		default: () => Math.floor(Date.now() / 1000) + 60 * 60,
		alias: "expiration",
	},
	token: {
		type: String,
		required: true,
		inmutable: true,
		unique: true,
		select: false,
		default: function () {
			return jwt.sign(
				{
					exp: this.exp,
					user: this.user,
					id: this.id,
				},
				secret
			);
		},
	},
});

export const AccessToken = model<IAccessToken>(
	"access_token",
	accessTokenSchema
);
