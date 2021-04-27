import { Room, RoomTC } from "../models/room";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export const RoomQuery = {
	roomById: RoomTC.getResolver("findById"),
	roomByIds: RoomTC.getResolver("findByIds"),
	room: RoomTC.getResolver("findOne"),
	rooms: RoomTC.getResolver("findMany"),
	roomCount: RoomTC.getResolver("count"),
	roomConnection: RoomTC.getResolver("connection"),
	roomPagination: RoomTC.getResolver("pagination"),
};

export const RoomMutation = {
	roomCreateOne: RoomTC.getResolver("createOne", [
		async (next, s, a, c, i) => {
			const res = await next(s, a, c, i);
			const _id = res?.record?._id;
			if (_id) pubsub.publish("ROOM_ADDED", _id);
			return res;
		},
	]),
	roomCreateMany: RoomTC.getResolver("createMany"),
	roomUpdateById: RoomTC.getResolver("updateById"),
	roomUpdateOne: RoomTC.getResolver("updateOne"),
	roomUpdateMany: RoomTC.getResolver("updateMany"),
	roomRemoveById: RoomTC.getResolver("removeById"),
	roomRemoveOne: RoomTC.getResolver("removeOne"),
	roomRemoveMany: RoomTC.getResolver("removeMany"),
};

export const RoomSubscription = {
	roomAdded: {
		type: RoomTC,
		resolve: (_id: string) => Room.findById(_id),
		subscribe: () => pubsub.asyncIterator(["ROOM_ADDED"]),
	},
};
