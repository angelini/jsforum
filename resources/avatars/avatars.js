var config        = require('../../config');
var GRAVATAR_URL  = config.GRAVATAR_URL;

var UserStorage   = require('../../storage/user_storage');

var storage = new UserStorage();

var Avatars = {
  Resource: {
    get: function(username, callback) {
      var result = {
        statusCode: 302,
        headers: {
          Location: GRAVATAR_URL
        }
      };

      storage.getUser(username, function(err, user) {
        if (err) {
          return callback(err);
        }

        if (!user) {
          result.statusCode = 404;
          callback(null, result);
        }

        result.headers.Location = result.headers.Location.replace('{{hash}}', user.emailhash);
        callback(null, result);
      });
    }
  }
};

module.exports = Avatars;