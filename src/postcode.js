const JSONRequest = require("./request");

class PostcodeClient {
	constructor (options) {
		if(!options) throw new TypeError("'options' has to be set");
		if(!options.key) throw new TypeError("'options.key' has to be set");
		if(!options.secret) throw new TypeError("'options.secret' has to be set");

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

	signal(options) {
		if(!options || typeof options != "object") throw new TypeError("'options' is required and should be an object");
		if(Object.keys(options).length == 0) throw new TypeError("'options' must have at least one option");

		return new Promise((resolve, reject) => {
			this._r.post("/signal/check", options)
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				if(err.statusCode === 400) {
					err.code = err.json.exceptionId;
					reject(err);
				}else{
					reject(error);
				}
			});
		});
	}
};

module.exports = PostcodeClient;