import { Schema, model, Document } from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";
import { Id } from "./common";
import { ExpressContext } from "apollo-server-express";
import { UserInputError } from "apollo-server-errors";
import { User, UserTC } from "./user";

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

RoomTC.addRelation("owner", {
	resolver: () => UserTC.getResolver("findById"),
	prepareArgs: {
		_id: (source) => source.owner,
	},
	projection: { owner: 1 },
});

RoomTC.addRelation("members", {
	resolver: () => UserTC.getResolver("findByIds"),
	prepareArgs: {
		_ids: (source) => source.members || [],
	},
	projection: { members: 1 },
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
	}): Promise<IRoom[]> =>
		await Room.find({
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

RoomTC.addResolver({
	type: RoomTC,
	name: "addMemberToRoom",
	description: "Add users by name to one of your rooms.",
	args: {
		members: "[String]!",
		room: "String!",
	},
	resolve: async ({
		context,
		args,
	}: {
		context: ExpressContext;
		args: any;
	}): Promise<IRoom> => {
		const room = await Room.findOne({
			_id: args.room,
			members: context.user?.id,
		}).exec();
		if (!room) throw new UserInputError("Room not found.");
		if (room.owner !== context.user?.id)
			throw new UserInputError("You are not the owner of this room.");
		const members = await User.find({ username: args.members });
		if (!members.length) throw new UserInputError("No users found.");
		members.forEach((el) => {
			if (room.members.includes(el.id))
				throw new UserInputError("Member already in the room.");
		});
		await Room.findByIdAndUpdate(args.room, {
			$push: {
				members: members.map((el) => el.id),
			},
		});
		// @ts-ignore If the statement above doesn't throw an error then there will definetly be a room with this ID
		return await Room.findById(room.id).exec();
	},
});
