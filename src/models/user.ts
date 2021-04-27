import { Schema, model, Document } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";
import { Id } from "./common";

export interface IUser extends Document {
	id: string;
	username: string;
	password: string;
	bio: string;
	gender: "Male" | "Female" | "Other";
	friends: string[];
}

const userSchema = new Schema({
	_id: Id,
	username: {
		type: String,
		unique: true,
		required: true,
		maxlength: 20,
		pattern: /[A-z]/,
	},
	password: {
		type: String,
		required: true,
		unique: false,
		select: false,
	},
	bio: {
		type: String,
		maxlength: 150,
		default: "No bio provided",
	},
	gender: {
		type: String,
		pattern: /["Male" | "Female" | "Other"]/,
		default: "Other",
	},
	friends: {
		type: [String],
		ref: "user",
		default: [],
	},
});

export const User = model<IUser>("user", userSchema);

export const UserTC = composeWithMongoose(User, {
	// @ts-ignore Typescript says to pass this arary to fields.remove but it doesn't work
	// So we are pretending this is `composeMongoose` function because it works
	removeFields: ["password", "_id"],
});
