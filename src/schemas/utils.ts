import { Resolver } from "graphql-compose";

export function adminAccess(resolvers: { [key: string]: Resolver }) {
	Object.keys(resolvers).forEach((k) => {
		resolvers[k] = resolvers[k].wrapResolve((next) => (rp) => {
			if (!rp.context.user.admin) {
				throw new Error("You should be admin, to have access to this action.");
			}
			return next(rp);
		});
	});
	return resolvers;
}

export function isAuthAccess(resolvers: { [key: string]: Resolver }) {
	Object.keys(resolvers).forEach((k) => {
		resolvers[k] = resolvers[k].wrapResolve((next) => (rp) => {
			if (!rp.context.user) {
				throw new Error("You need to be logged in to use this");
			}
			return next(rp);
		});
	});
	return resolvers;
}
