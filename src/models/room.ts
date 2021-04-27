import { Schema, model, Document } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";
import { Id } from "./common";

export interface IRoom extends Document {
	id: string;
	name: string;
	owner: string;
	members: string[];
	description: string;
}

const roomSchema = new Schema({
	_id: Id,
	name: {
		type: String,
		required: true,
		maxlength: 30,
	},
	owner: {
		type: String,
		ref: "user",
		required: true,
	},
	members: {
		type: [String],
		ref: "user",
		default: function () {
			return [this.owner];
		},
	},
	description: {
		type: String,
		maxlength: 150,
	},
});

export const Room = model<IRoom>("room", roomSchema);

export const RoomTC = composeWithMongoose(Room, {
	description:
		"A room, also known as a channel, is where users send messages. ",
});
