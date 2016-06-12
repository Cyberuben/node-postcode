var https = require("https");

class JSONRequest {
	constructor(options) {
		this._options = options;
	}

	_requestOptions(method, path, headers, encoding) {
		if(!headers) {
			headers = {
				"Content-Type": "application/json"
			};
		}

		if(!encoding) {
			encoding = "utf8";
		}

		return {
			method, headers, encoding,
			protocol: "https:",
			hostname: "api.postcode.nl",
			path: "/rest" + path,
			auth: this._options.key+":"+this._options.secret
		}
	}

	_parseJsonResponse(response) {
		return new Promise((resolve, reject) => {
			const strings = [];

			response.on("data", (chunk) => {
				strings.push(chunk);
			});

			response.on("end", () => {
				try {
					const string = strings.join("");
					if(response.statusCode === 200) {
						resolve(JSON.parse(string));
					}else if(response.statusCode === 401) {
						reject(Object.assign(new Error("Invalid credentials for call"), {
							statusCode: response.statusCode,
							headers: response.headers
						}));
					}else{
						var json;
						var error = "Request returned HTTP code "+response.statusCode;
						try {
							json = JSON.parse(string);
							if(json && json.exception) {
								error = json.exception;
							}
						} catch (err) {

						}
						reject(Object.assign(new Error(error), {
							string, json,
							statusCode: response.statusCode,
							headers: response.headers
						}));
					}
				} catch (err) {
					reject(err);
				}
			});

			response.on("error", reject);
		});
	}

	get(path) {
		return new Promise((resolve, reject) => {
			const opts = this._requestOptions("GET", path);
			const request = https.request(opts, res => {
				resolve(this._parseJsonResponse(res));
			});
			request.on("error", reject);
			request.end();
		});
	}
};

class PostcodeClient {
	constructor (options) {
		if(!options.hasOwnProperty("key")) throw new TypeError("'options.key' has to be set");
		if(!options.hasOwnProperty("secret")) throw new TypeError("'options.secret' has to be set");

		this._options = options;

		this._r = new JSONRequest(this._options);
	}

	address(postcode, number, numberAddition) {
		//Check if the postcode is set
		if(!postcode) throw new TypeError("'postcode' is required");
		
		// Rewrite the format to 1234AA (no space, capitalized)
		postcode = postcode.replace(/\s/g, "").toUpperCase();

		// Check if the postcode is a valid format
		if(!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode)) throw new TypeError("'postcode' is not in a valid format");

		let vars = {
			postcode: postcode
		};

		let path = "/addresses/"+postcode;
		if(number) {
			if(Number(number) === number && number >= 0 && number <= 99999 && number % 1 === 0) {
				path += "/"+number;
				vars.number = number;
				if(numberAddition) {
					path += "/"+numberAddition;
					vars.numberAddition = numberAddition;
				}
			}else{
				throw new TypeError("'number' is not a valid number or out of range");
			}
		}else{
			throw new TypeError("'number' is required");
		}

		return new Promise((resolve, reject) => {
			this._r.get(path)
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				if(err.statusCode === 404) {
					let error = new Error("Address not found");
					error.code = err.json.exceptionId;
					error.vars = vars;
					reject(error);
				}else{
					reject(err);
				}
			});
		});
	}
};

class iDEAL {

};

class PostcodeiDEALClient {

};

module.exports.Postcode = PostcodeClient;
module.exports.iDEAL = PostcodeiDEALClient;