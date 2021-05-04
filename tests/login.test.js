const {register, loginBasic, deleteAccount } = require("./helpers/login");

test("Register a test user", () => {
	return register().then((status) => {
		expect(status.status).toBe(200);
	});
});

test("Login with a username and password", () => {
	return loginBasic().then((status) => {
		expect(status.status).toBe(200);
	});
});

test("Delete a user", () => {
	return deleteAccount().then((status) => {
		expect(status.status).toBe(204);
	});
});
