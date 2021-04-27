import { User, UserTC } from "../models/user";

export const UserQuery = {
	userById: UserTC.getResolver("findById"),
	userByIds: UserTC.getResolver("findByIds"),
	user: UserTC.getResolver("findOne"),
	users: UserTC.getResolver("findMany"),
	userCount: UserTC.getResolver("count"),
	userConnection: UserTC.getResolver("connection"),
	userPagination: UserTC.getResolver("pagination"),
};

export const UserMutation = {
	userCreateOne: UserTC.getResolver("createOne"),
	userCreateMany: UserTC.getResolver("createMany"),
	userUpdateById: UserTC.getResolver("updateById"),
	userUpdateOne: UserTC.getResolver("updateOne"),
	userUpdateMany: UserTC.getResolver("updateMany"),
	userRemoveById: UserTC.getResolver("removeById"),
	userRemoveOne: UserTC.getResolver("removeOne"),
	userRemoveMany: UserTC.getResolver("removeMany"),
};

export const UserSubscription = {};
