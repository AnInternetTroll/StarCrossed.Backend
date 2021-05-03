import { Message, MessageTC } from "../models/message";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export const MessageQuery = {
	messageById: MessageTC.getResolver("findById"),
	messageByIds: MessageTC.getResolver("findByIds"),
	message: MessageTC.getResolver("findOne"),
	messages: MessageTC.getResolver("findMany"),
	messageCount: MessageTC.getResolver("count"),
	messageConnection: MessageTC.getResolver("connection"),
	messagePagination: MessageTC.getResolver("pagination"),
};

export const MessageMutation = {
	messagePost: MessageTC.getResolver("postOne", [
		async (next, s, a, c, i) => {
			const res = await next(s, a, c, i);
			const _id = res?.record?._id;
			if (_id) pubsub.publish("MESSAGE_ADDED", _id);
			return res;
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
		resolve: (_id: string) => Message.findById(_id),
		subscribe: () => pubsub.asyncIterator(["MESSAGE_ADDED"]),
	},
};
