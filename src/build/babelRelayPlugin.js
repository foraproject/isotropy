var getbabelRelayPlugin = require('babel-relay-plugin');
var schema = require('../test/react/my-schema.json');

module.exports = getbabelRelayPlugin(schema.data);
