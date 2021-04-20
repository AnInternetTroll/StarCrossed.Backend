const {Schema, model} = require("mongoose");

const roomSchema = new Schema({
	name: {
		type: string,
		required: true,
		maxlength: 30,
	},
	owner: {
		type: string,
		ref: "user",
		required: true,
	},
	members: {
		type: [string],
		ref: "user",
		default: function() {
			return [this.owner];
		}
	},
	description: {
		type: string,
		maxlength: 150,
	},
})

const Room = model("room", roomSchema);

module.exports = Room;
