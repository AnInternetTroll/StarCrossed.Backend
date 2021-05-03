import { SchemaComposer } from "graphql-compose";

const schemaComposer = new SchemaComposer();

import { UserQuery, UserMutation, UserSubscription } from "./user";
import { RoomQuery, RoomMutation, RoomSubscription } from "./room";
import { MessageQuery, MessageMutation, MessageSubscription } from "./message";

schemaComposer.Query.addFields({
	...UserQuery,
	...RoomQuery,
	...MessageQuery,
});

schemaComposer.Mutation.addFields({
	...UserMutation,
	...RoomMutation,
	...MessageMutation,
});

schemaComposer.Subscription.addFields({
	//...UserSubscription,
	...RoomSubscription,
	...MessageSubscription,
});

export default schemaComposer.buildSchema();
