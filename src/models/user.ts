import { Schema, model, Document } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";
import { Id } from "./common";
import { ExpressContext } from "apollo-server-express";

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
	removeFields: ["password"],
});

UserTC.addResolver({
	name: "viewer",
	type: UserTC,
	resolve: ({ context }: { context: ExpressContext }) => context?.user,
});

UserTC.addRelation("friends", {
	resolver: () => UserTC.getResolver("findByIds"),
	prepareArgs: {
		_ids: (source) => source.friends,
	},
	projection: { friends: 1 },
});

UserTC.addResolver({
	name: "viewerUpdate",
	type: UserTC,
	args: {
		username: "String",
		gender: "String",
		bio: "String",
	},
	resolve: async ({
		context,
		args,
	}: {
		context: ExpressContext;
		args: IUser;
	}): Promise<IUser | null> =>
		await User.findByIdAndUpdate(context.user?.id || "", args),
});
