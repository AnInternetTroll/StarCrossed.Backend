import { SchemaComposer } from "graphql-compose";

const schemaComposer = new SchemaComposer();

import { UserQuery, UserMutation, UserSubscription } from "./user";
import { RoomQuery, RoomMutation, RoomSubscription } from "./room";

schemaComposer.Query.addFields({
	...UserQuery,
	...RoomQuery,
});

schemaComposer.Mutation.addFields({
	...UserMutation,
	...RoomMutation,
});

schemaComposer.Subscription.addFields({
	//...UserSubscription,
	...RoomSubscription,
});

export default schemaComposer.buildSchema();
