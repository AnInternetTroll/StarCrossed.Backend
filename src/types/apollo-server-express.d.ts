import { IUser } from "../models/user";

declare module "apollo-server-express" {
	export interface ExpressContext {
		user?: IUser | null;
	}
}
