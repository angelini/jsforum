var config      = require('../config');
var REDIS_PORT  = config.REDIS_PORT;

var redis       = require('redis');

module.exports  = redis.createClient(REDIS_PORT);