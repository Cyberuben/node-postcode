const https = require("https");

class JSONRequest {
  constructor(options) {
    this._options = options;
  }

  _requestOptions(method, path, headers, encoding) {
    if (!headers) {
      headers = {
        "Content-Type": "application/json",
      };
    }

    if (!encoding) {
      encoding = "utf8";
    }

    return {
      method,
      headers,
      encoding,
      hostname: "api.postcode.eu",
      path: "/rest" + path,
      auth: this._options.key + ":" + this._options.secret,
    };
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
          if (response.statusCode === 200) {
            resolve(JSON.parse(string));
          } else if (response.statusCode === 401) {
            reject(
              Object.assign(new Error("Invalid credentials for call"), {
                statusCode: response.statusCode,
                headers: response.headers,
              })
            );
          } else {
            let json;
            let error = "Request returned HTTP code " + response.statusCode;
            try {
              json = JSON.parse(string);
              if (json && json.exception) {
                error = json.exception;
              }
            } catch (err) {
              reject(err);
            }
            reject(
              Object.assign(new Error(error), {
                string,
                json,
                statusCode: response.statusCode,
                headers: response.headers,
              })
            );
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
      const request = https.request(opts, (res) => {
        resolve(this._parseJsonResponse(res));
      });
      request.on("error", reject);
      request.end();
    });
  }

  post(path, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const opts = this._requestOptions("POST", path, {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
      });

      const request = https.request(opts, (res) => {
        resolve(this._parseJsonResponse(res));
      });
      request.write(postData);
      request.on("error", reject);
      request.end();
    });
  }
}

module.exports = JSONRequest;
