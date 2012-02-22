var config      = require('../../config');
var EMAIL_TEST  = config.EMAIL_TEST;

var validob     = require('validob');
var UserStorage = require('../../storage/user_storage');

var storage = new UserStorage();

var User = new validob.Schema({
  username: { rule: String, required: true },
  password: { rule: String, required: true },
  email: { rule: EMAIL_TEST, required: true }
});

var Users = {
  Resource: {
    
  },

  Collection: {
    post: function(callback) {
      var validated = User.validate(this.body);

      if (validated.valid === false) {
        return callback({
          error: 'Error validating user body',
          missing: validated.missing,
          fields: validated.error,
          body: this.body
        });
      }

      validated.body.created = Date.now();

      storage.createUser(validated.body.username, validated.body, function(err) {
        if (err) { return callback(err); }

        callback(null, { statusCode: 201 });
      });
    }
  }
};

module.exports = Users;