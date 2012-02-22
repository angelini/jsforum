var config    = require('../config');
var NEXT      = config.NEXT;
var THREAD    = config.THREAD;
var MESSAGE   = config.MESSAGE;
var MESSAGES  = config.MESSAGES;

var async   = require('async');
var Storage = require('./storage');

var MessageStorage = function() {
  Storage.call(this);
};

MessageStorage.prototype = Object.create(Storage.prototype);

MessageStorage.prototype.getMessage = function(sid, tid, mid, callback) {
  this.client.hgetall(this.cat(MESSAGE, sid, tid, mid), callback);
};

MessageStorage.prototype.getMessages = function(sid, tid, callback) {
  var that = this;

  this.client.smembers(this.cat(MESSAGES, sid, tid), function(err, message_keys) {
    if (err) { return callback(err); }

    function getInfo(message_key, callback) {
      var mid = that.split(message_key).pop();
      that.getMessage(sid, tid, mid, callback);
    }

    async.map(message_keys, getInfo, callback);
  });
};

MessageStorage.prototype.createMessage = function(sid, tid, message_info, callback) {
  var that = this;

  this.client.incr(this.cat(NEXT, MESSAGES), function(err, mid) {
    message_info.id = mid;

    function addIndex(callback) {
      that.client.sadd(that.cat(MESSAGES, sid, tid), that.cat(MESSAGE, sid, tid, mid), callback);
    };

    function setAttributes(callback) {
      that.client.hmset(that.cat(MESSAGE, sid, tid, mid), message_info, callback);
    };

    function incrThread(callback) {
      that.client.hincrby(that.cat(THREAD, sid, tid), 'message_count', 1, callback);
    };

    async.parallel([addIndex, setAttributes, incrThread], function(err) {
      callback(err, mid);
    });
  });
};

MessageStorage.prototype.removeMessage = function(sid, tid, mid, callback) {
  function removeIndex(callback) {
    this.client.srem((MESSAGES, sid, tid), this.cat(MESSAGE, sid, tid, mid), callback);
  };

  function removeAttributes(callback) {
    this.client.del(that.cat(MESSAGE, sid, tid, mid), callback);
  };

  function decrThread(callback) {
    this.client.hincrby(that.cat(THREAD, sid, tid), 'message_count', -1, callback);
  };

  async.parallel([removeIndex, removeAttributes, decrThread], callback);
};

module.exports = MessageStorage;