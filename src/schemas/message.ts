import { Message, MessageTC, IMessage } from "../models/message";
import { PubSub } from "graphql-subscriptions";
import { withFilter } from "apollo-server-express";
import { Room } from "../models/room";

const pubsub = new PubSub();

export const MessageQuery = {
	messageById: MessageTC.getResolver("findById"),
	messageByIds: MessageTC.getResolver("findByIds"),
	message: MessageTC.getResolver("findOne"),
	messages: MessageTC.getResolver("messages"),
	messageCount: MessageTC.getResolver("count"),
	messageConnection: MessageTC.getResolver("connection"),
	messagePagination: MessageTC.getResolver("pagination"),
};

export const MessageMutation = {
	messagePost: MessageTC.getResolver("postOne", [
		async (next, s, a, c, i) => {
			const msg = await next(s, a, c, i);
			const room = await Room.findById(msg._id);
			if (msg && room)
				pubsub.publish("MESSAGE_ADDED", { msg, context: c, room });
			return msg;
		},
	]),
	messageCreateMany: MessageTC.getResolver("createMany"),
	messageUpdateById: MessageTC.getResolver("updateById"),
	messageUpdateOne: MessageTC.getResolver("updateOne"),
	messageUpdateMany: MessageTC.getResolver("updateMany"),
	messageRemoveById: MessageTC.getResolver("removeById"),
	messageRemoveOne: MessageTC.getResolver("removeOne"),
	messageRemoveMany: MessageTC.getResolver("removeMany"),
};

export const MessageSubscription = {
	messageAdded: {
		type: MessageTC,
		args: {
			room: "String!",
		},
		resolve: ({ msg }: { msg: IMessage }) => msg,
		subscribe: withFilter(
			() => pubsub.asyncIterator(["MESSAGE_ADDED"]),
			(payload, variables) =>
				payload.room.members.includes(payload.context.user._id) &&
				payload.msg.room === variables.room
		),
	},
};
