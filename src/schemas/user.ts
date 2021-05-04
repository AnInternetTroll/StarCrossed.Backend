import { User, UserTC } from "../models/user";
import { isAuthAccess } from "./utils";

export const UserQuery = {
	userById: UserTC.getResolver("findById"),
	userByIds: UserTC.getResolver("findByIds"),
	user: UserTC.getResolver("findOne"),
	users: UserTC.getResolver("findMany"),
	userCount: UserTC.getResolver("count"),
	userConnection: UserTC.getResolver("connection"),
	userPagination: UserTC.getResolver("pagination"),
	...isAuthAccess({
		viewer: UserTC.getResolver("viewer"),
	}),
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
	...isAuthAccess({
		viewerUpdate: UserTC.getResolver("viewerUpdate"),
	}),
};

export const UserSubscription = {};
