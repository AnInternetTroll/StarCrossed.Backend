const fetch = require("node-fetch");
const config = require("../config.json");
const { sha256 } = require("./utils");

/**
 * Register
 * @param {string} username The username of the user to be logged in
 * @param {string} password The user's password in plain text
 */
 async function register(username, password) {
	const req = await fetch(`${config.base_url}/auth/register`, {
		method: "POST",
		headers: {
			authorization: `Basic ${Buffer.from(`${username}:${await sha256(password)}`, "utf-8").toString("base64")}`,
		},
	});
	return {status: req.status, statusText: req.statusText};
}

/**
 * Login
 * @param {string} username The username of the user to be logged in
 * @param {string} password The user's password in plain text
 */
async function loginBasic(username, password) {
	const req = await fetch(`${config.base_url}/auth/token`, {
		headers: {
			authorization: `Basic ${Buffer.from(`${username}:${await sha256(password)}`, "utf-8").toString("base64")}`,
		},
	});
	return {status: req.status, statusText: req.statusText};
}

/**
 * Delete
 * @param {string} username The username of the user to be logged in
 * @param {string} password The user's password in plain text
 */
 async function deleteAccount(username, password) {
	password = await sha256(password);
	const req = await fetch(`${config.base_url}/auth/user`, {
		method: "DELETE",
		headers: {
			authorization: `Basic ${Buffer.from(`${username}:${password}`, "utf-8").toString("base64")}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			password,
		}),
	});
	return {status: req.status, statusText: req.statusText};
}

module.exports.register = register;
module.exports.loginBasic = loginBasic;
module.exports.deleteAccount = deleteAccount;
