class SimpleCommandsModel {
	input: string;
	psimRooms: string[];
	minimumRank: string;
	publicRank: string;
	userOverrides: string[];
	output: string;

	constructor(
		input: string,
		psimRooms: string[],
		minimumRank: string,
		publicRank: string,
		userOverrides: string[],
		output: string
	) {
		this.input = input;
		this.psimRooms = psimRooms;
		this.minimumRank = minimumRank;
		this.publicRank = publicRank;
		this.userOverrides = userOverrides;
		this.output = output;
	}
}

export default SimpleCommandsModel;
