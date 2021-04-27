import { Resolver } from "graphql-compose";

function adminAccess(resolvers: { [key: string]: Resolver }) {
	Object.keys(resolvers).forEach((k) => {
		resolvers[k] = resolvers[k].wrapResolve((next) => (rp) => {
			if (!rp.context.isAdmin) {
				throw new Error("You should be admin, to have access to this action.");
			}
			return next(rp);
		});
	});
	return resolvers;
}
