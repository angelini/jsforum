var validob         = require('validob');
var MessageStorage  = require('../../../../storage/message_storage');

var storage = new MessageStorage();

var Message = new validob.Schema({
  message: { rule: String, required: true },
  username: { rule: String, required: true }
});

var Messages = {
  Resource: {
    get: function(sid, tid, mid, callback) {
      storage.getMessage(sid, tid, mid, callback);
    },

    delete: function(sid, tid, mid, callback) {
      storage.removeMessage(sid, tid, mid, callback);
    }
  },

  Collection: {
    get: function(sid, tid, callback) {
      storage.getMessages(sid, tid, callback);
    },

    post: function(sid, tid, callback) {
      var validated = Message.validate(this.body);

      if (validated.valid === false) {
        return callback({
          error: 'Error validating message body',
          missing: validated.missing,
          fields: validated.error,
          body: this.body
        });
      }

      validated.body.created = Date.now();

      storage.createMessage(sid, tid, validated.body, function(err, mid) {
        if (err) { return callback(err); }

        callback(null, { statusCode: 201, id: mid });
      });
    }
  }
};

module.exports = Messages;