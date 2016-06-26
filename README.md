# node-postcode [![Build Status](https://travis-ci.org/Cyberuben/node-postcode.svg?branch=master)](https://travis-ci.org/Cyberuben/node-postcode)
API wrapper for the Postcode.nl API. 

Features:
- gathering addresses using postcode, house number and house number addition
- verifying address data

# Example

```javascript
var Postcode = require("node-postcode").Postcode;
var client = new Postcode({
  key: /* your API key */,
  secret: /* your API secret */
});

client.address("1111AA", 1)
.then(function (addressDetails) {
  /* addressDetails contains information about the address (if valid) */
});
```

# Installation

```bash
$ npm i node-postcode
```

You can retrieve your own API credentials [over here](https://account.postcode.nl/registreer) (only available in Dutch at time of writing).

# API Reference

## PostcodeClient (Class)

The client exposing the `address` and `signal` functions

### new PostcodeClient(`options`)
- **Arguments**
  - `options` - An object containing `key` and `secret` (required)

- **Example**

  ```javascript
  new PostcodeClient({
    key: "YOUR_KEY",
    secret: "YOUR_SECRET"
  });
  ```
- **Returns**

  An instance of the `PostcodeClient` class

### PostcodeClient.address(`postcode`, `number`[, `numberAddition`])
- **Arguments**
  - `postcode` - `required` A postcode in the format `1111AA` (4 digits, 2 letters). Can not start with a 0. Letters do not have to be in uppercase as these will be forced to uppercase when making the API call. `1111 AA` is also accepted, as spaces in the string are removed
  - `number` - `required` An integer in the range of 0 - 99999
  - `numberAddition` - An addition to the `number`. Can indicate which apartment, room, office

- **Example**
  
  ```javascript
  client.address("1111AA", 1)
  .then(function (addressDetails) {
    /* 
      addressDetails = { street: 'Diemerkade',
        houseNumber: 1,
        houseNumberAddition: '',
        postcode: '1111AA',
        city: 'Diemen',
        municipality: 'Diemen',
        province: 'Noord-Holland',
        rdX: 125497,
        rdY: 483727,
        latitude: 52.34067657,
        longitude: 4.95429501,
        bagNumberDesignationId: '0384200000016667',
        bagAddressableObjectId: '0384010000016511',
        addressType: 'building',
        purposes: [ 'residency' ],
        surfaceArea: 64,
        houseNumberAdditions: [ '' ] }
    */
  })
  .catch(function (err) {
    /* Err will contain the error returned by either the API or the HTTP request */
  });
  ```

- **Returns**

  Returns a `Promise`. When successful, `.then(function (addressDetails) {})` is returned. The format and explanation of the returned data can be found [at the official documentation](https://api.postcode.nl/documentation/address-api) of the API. When an error occurs, `.catch(function (err) {})` contains the error given. When `err.code == "PostcodeNl_Service_PostcodeAddress_AddressNotFoundException"`, the `postcode` and `number` supplied do not resolve to an address. 

  When `numberAddition` is supplied, but `houseNumberAddition` is an empty string, the `numberAddition` can not be verified, but this does not mean that mail sent to this address will not be accepted.
  
# Tests

To run the tests created for this plugin, run the following command:

```
$ npm test
```

To make sure all tests succeed, make sure that you set the environment variables `API_KEY` and `API_SECRET` to their correct values. Errors will be thrown if the credentials are not valid
