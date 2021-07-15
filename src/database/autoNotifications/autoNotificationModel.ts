class AutoNotificationModel {
	message: string;
	psimRoom: string;
	minimumWait: number;
	minimumMessages: number;

	constructor(message: string, psimRoom: string, minimumWait: number, minimumMessages: number) {
		this.message = message;
		this.psimRoom = psimRoom;
		this.minimumWait = minimumWait;
		this.minimumMessages = minimumMessages;
	}
}

export default AutoNotificationModel;
