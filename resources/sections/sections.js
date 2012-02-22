var validob         = require('validob');
var SectionStorage  = require('../../storage/section_storage');

var storage = new SectionStorage();

var Section = new validob.Schema({
  title: { rule: String, required: true }
});

var Sections = {
  Resource: {
    get: function(sid, callback) {
      storage.getSection(sid, callback);
    }
  },

  Collection: {
    get: function(callback) {
      storage.getSections(callback);
    },

    post: function(callback) {
      var validated = Section.validate(this.body);
      
      if (validated.valid === false) {
        return callback({
          error: 'Error validating section body',
          missing: validated.missing,
          fields: validated.error,
          body: this.body
        });
      }

      validated.body.created = Date.now();
      validated.body.thread_count = 0;

      storage.createSection(validated.body, function(err, sid) {
        if (err) { return callback(err); }
        
        callback(null, { statusCode: 201, id: sid });
      });
    }
  }
};

module.exports = Sections;