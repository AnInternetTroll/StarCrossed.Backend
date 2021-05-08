import { Schema, model, Document } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";
import { Id } from "./common";
import { ExpressContext } from "apollo-server-express";

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

RoomTC.addResolver({
	type: [RoomTC],
	name: "rooms",
	args: {
		description: "String",
		name: "String",
		_id: "String",
	},
	resolve: async ({
		context,
		args,
	}: {
		context: ExpressContext;
		args: any;
	}): Promise<IRoom[]> => await Room.find({
			...args,
			members: context.user?.id,
		}).exec(),
});

RoomTC.addResolver({
	type: RoomTC,
	name: "createNew",
	args: {
		description: "String",
		name: "String!",
		members: "[String]",
	},
	resolve: async ({
		context,
		args,
	}: {
		context: ExpressContext;
		args: any;
	}): Promise<IRoom> => {
		const room = new Room({
			owner: context.user!.id || context.user,
			...args,
		});
		await room.save();
		// @ts-ignore If the statement above doesn't throw an error then there will definetly be a room with this ID
		return await Room.findById(room.id).exec();
	},
});
