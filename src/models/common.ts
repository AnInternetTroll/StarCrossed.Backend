import FlakeId from "flakeid";

//initiate flake
export const flake = new FlakeId({
	mid: 42, // Define machine id
	timeOffset: Date.UTC(2021, 0, 1), // Define epoch
});

export const Id = {
	type: String,
	default: () => flake.gen().toString(),
	pattern: /^[0-9]*$/,
};
