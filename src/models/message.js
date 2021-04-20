const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
	content: {
		type: string,
		required: true,
		maxlength: 1000,
	},
	author: {
		type: string,
		ref: "user",
		required: true,
	},
	room: {
		type: string,
		ref: "room",
		required: true,
	}
});

const Message = model("message", messageSchema);

module.exports = Message;
