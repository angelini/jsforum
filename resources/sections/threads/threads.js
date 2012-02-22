var validob = require('validob');
var ThreadStorage = require('../../../storage/thread_storage');

var storage = new ThreadStorage();

var Thread = new validob.Schema({
  title: { rule: String, required: true },
  username: { rule: String, required: true }
});

var Threads = {
  Resource: {
    get: function(sid, tid, callback) {
      storage.getThread(sid, tid, callback);
    },

    delete: function(sid, tid, callback) {
      storage.removeThread(sid, tid, callback);
    }
  },

  Collection: {
    get: function(sid, callback) {
      storage.getThreads(sid, callback);
    },

    post: function(sid, callback) {
      var validated = Thread.validate(this.body);
      
      if (validated.valid === false) {
        return callback({
          error: 'Error validating thread body',
          missing: validated.missing,
          fields: validated.error,
          body: this.body
        });
      }

      validated.body.created = Date.now();
      validated.body.message_count = 0;

      storage.createThread(sid, validated.body, function(err, tid) {
        if (err) { return callback(err); }

        callback(null, { statusCode: 201, id: tid });
      });
    }
  }
};

module.exports = Threads;