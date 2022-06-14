class ResourcesModel {
	formats: string;
	name: string;
	url: string;

	constructor(formats: string, name: string, url: string) {
		this.formats = formats;
		this.name = name;
		this.url = url;
	}
}

export default ResourcesModel;
