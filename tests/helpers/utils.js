const cryptojs = require("crypto").webcrypto;

/**
 * Hash a string with sha256
 * @param {string} message Message to be encrypted
 * @returns {Promise<string>} Hashed message
 */
module.exports.sha256 = async function sha256(message) {
	// encode as UTF-8
	const msgBuffer = new TextEncoder().encode(message);

	// hash the message
	const hashBuffer = await cryptojs.subtle.digest("SHA-256", msgBuffer);

	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));

	// convert bytes to hex string
	const hashHex = hashArray
		.map((b) => ("00" + b.toString(16)).slice(-2))
		.join("");
	return hashHex;
};
