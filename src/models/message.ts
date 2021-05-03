import { Schema, model, Document } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";
import { Id } from "./common";
import { IUser } from "./user";
import { IRoom, Room } from "./room";
import { ExpressContext } from "apollo-server-express";

export interface IMessage extends Document {
	id: string;
	content: string;
	author: string | IUser;
	room: string | IRoom;
}

const messageSchema = new Schema({
	_id: Id,
	content: {
		type: String,
		required: true,
		maxlength: 1000,
	},
	author: {
		type: String,
		ref: "user",
		required: true,
	},
	room: {
		type: String,
		ref: "room",
		required: true,
	},
});

export const Message = model<IMessage>("message", messageSchema);

export const MessageTC = composeWithMongoose(Message, {
	description: "A message is what users send in rooms. ",
});

MessageTC.addResolver({
	name: "postOne",
	type: MessageTC,
	args: {
		content: "String!",
		room: "String!",
	},
	resolve: async ({
		context,
		args,
	}: {
		context: ExpressContext;
		args: any;
	}): Promise<IMessage> => {
		if (!context.user) throw new Error("No user logged in");
		const room = await Room.findById(args.room);
		if (!room) throw new Error("Invalid room provided.");
		if (
			!room.members.includes(
				typeof context.user === "string" ? context.user : context.user.id
			)
		)
			throw new Error("Invalid room provided.");
		const message = new Message({
			author: context.user!.id,
			...args,
		});
		await message.save();
		// @ts-ignore If the statement above doesn't throw an error then there will definetly be a message with this ID
		return await Message.findById(message.id).exec();
	},
});
