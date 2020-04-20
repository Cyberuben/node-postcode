let chai				= require("chai");
let expect				= chai.expect;
let assert				= chai.assert;

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

chai.should();

let PostcodeClient		= require("../lib/postcode");
let JSONRequest			= require("../lib/request");

describe("Postcode.nl API wrapper", () => {
	describe("PostcodeClient", () => {
		describe("#constructor()", () => {
			it("requires 'options.key' and 'options.secret'", () => {
				(() => {
					new PostcodeClient();
				}).should.throw(TypeError);

				(() => {
					new PostcodeClient({});
				}).should.throw(TypeError);

				(() => {
					new PostcodeClient({key: "test"});
				}).should.throw(TypeError);

				(() => {
					new PostcodeClient({secret: "test"});
				}).should.throw(TypeError);

				(() => {
					new PostcodeClient({key: "test", secret: "test"});
				}).should.not.throw(TypeError);
			});

			it("should have an instance of JSONRequest and options", () => {
				var client = new PostcodeClient({key: "test", secret: "test"});
				client._r.should.be.instanceof(JSONRequest);
				client._options.should.be.an("object");
			});
		});

		describe("#address()", () => {
			it("should throw an error on invalid postcodes", () => {
				var client = new PostcodeClient({key: "test", secret: "test"});

				(() => {
					client.address("0000");
				}).should.throw(TypeError);

				(() => {
					client.address("0000AA");
				}).should.throw(TypeError);
			});

			it("should fix simple client errors in postcodes", () => {
				var client = new PostcodeClient({key: "test", secret: "test"});

				(() => {
					client.address("1111    Aa", 1);
				}).should.not.throw(TypeError);
			});

			it("should not accept non-integers or invalid ranges", () => {
				var client = new PostcodeClient({key: "test", secret: "test"});

				(() => {
					client.address("1111AA", -1);
				}).should.throw(TypeError);

				(() => {
					client.address("1111AA", 100000);
				}).should.throw(TypeError);

				(() => {
					client.address("1111AA", 3.14);
				}).should.throw(TypeError);

				(() => {
					client.address("1111AA", "10");
				}).should.throw(TypeError);

				(() => {
					client.address("1111AA", {foo: "bar"});
				}).should.throw(TypeError);

				(() => {
					client.address("1111AA", () => {});
				}).should.throw(TypeError);
			});

			it("should be able to start requesting the address", () => {
				var client = new PostcodeClient({
					key: API_KEY,
					secret: API_SECRET
				});

				(() => {
					client.address("1111AA", 1);
				}).should.not.throw(TypeError);
			});

			it("should be able to return valid address info", (done) => {
				expect(API_KEY).to.be.ok;
				expect(API_SECRET).to.be.ok;

				var client = new PostcodeClient({
					key: API_KEY,
					secret: API_SECRET
				});

				return client.address("1111AA", 1)
					.then((addressDetails) => {
						addressDetails.should.be.an("object");
					})
					.catch((err) => {
						assert(err === undefined, "Bad credentials supplied in environment variables");
						done();
					});
			});
		});

		describe("#signal()", () => {
			expect(API_KEY).to.be.ok;
			expect(API_SECRET).to.be.ok;

			var client = new PostcodeClient({
				key: API_KEY,
				secret: API_SECRET
			});

			it("should error on empty / invalid options object", () => {
				(() => {
					client.signal();
				}).should.throw(TypeError);

				(() => {
					client.signal({});
				}).should.throw(TypeError);
			});

			it("should return a promise on 'valid' options object", () => {
				client.signal({
					test: "test"
				}).should.be.instanceof(Promise);
			});

			it("should be able to generate a response", (done) => {
				return client.signal({
						transaction: {
							deliveryAddress: {
								postcode: "1111AA",
								houseNumber: 1,
								country: "NL"
							}
						}
					})
					.then((signalDetails) => {
						signalDetails.should.be.an("object");
						signalDetails.checkId.should.be.a("string");
					})
					.catch((err) => {
						assert(err === undefined, "Error calling the API: "+err.message);
						done();
					});
			});
		});
	});
});