var config  = require('../config');
var USER    = config.USER;
var USERS   = config.USERS;

var async   = require('async');
var bcrypt  = require('bcrypt');
var Storage = require('./storage');

var UserStorage = function() {
  Storage.call(this);
};

UserStorage.prototype = Object.create(Storage.prototype);

UserStorage.prototype.verify = function(username, password, callback) {
  this.getUser(username, function(err, user_info) {
    if(!user_info || !user_info.password) { return callback(new Error('User Not Found')); }

    bcrypt.compare(password, user_info.password, callback);
  });
};

UserStorage.prototype.getUser = function(username, callback) {
  this.client.hgetall(this.cat(USER, username), callback);
};

UserStorage.prototype.createUser = function(username, user_info, callback) {
  var that = this;

  function checkForConflict(callback) {
    that.client.get(that.cat(USER, username), function(err, user) {
      if (user) {
        return callback(new Error('User Already Exists'));
      }

      callback(err);
    });
  };

  function hashPassword(callback) {
    function createSalt(callback) {
      bcrypt.genSalt(10, callback);
    };

    function createHash(salt, callback) {
      bcrypt.hash(user_info.password, salt, callback);
    };

    function setPassword(hash, callback) {
      user_info.password = hash;
      callback(null);
    };

    async.waterfall([createSalt, createHash, setPassword], callback);
  };

  function saveUser(callback) {
    function addIndex(callback) {
      that.client.sadd(USERS, that.cat(USER, username), callback);
    };

    function setAttributes(callback) {
      that.client.hmset(that.cat(USER, username), user_info, callback);
    };

    async.parallel([addIndex, setAttributes], callback);
  };

  async.series([checkForConflict, hashPassword, saveUser], callback);
};

module.exports = UserStorage;