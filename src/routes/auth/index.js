const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router()

function decodeAuth(value) {
	if (!value) return false;
	const [type, data] = value.split(" ");
	switch(type) {
		case "Basic": 
			const [username, password] = data.split(":");
			return {type, username, password};
			break;
		case "Bearer":
		const jwtData;
	}
}


router.get("/login", (req, res) => {

})
