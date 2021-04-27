import { Schema, model, Document } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";
import { Id } from "./common";
import { IUser } from "./user";
import { IRoom } from "./room";

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
