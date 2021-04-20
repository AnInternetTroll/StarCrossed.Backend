const {Schema, model} = require("mongoose");

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true,
		maxlength: 20,
		pattern: /[a-Z]/,
	},
	password: {
		type: String,
		required: true,
		unique: false,
		select: false,
	},
	bio: {
		type: String,
		maxlength: 150,
		default: "No bio provided",
	},
	gender: {
		type: String,
		pattern: /["Male" | "Female" | "Other"]/,
	},
	friends: {
		type: [string],
		ref: "user"
	}
})

const User = model("user", userSchema);

module.exports = User;
