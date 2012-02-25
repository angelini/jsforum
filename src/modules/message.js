(function(Message) {

  Message.Model = Backbone.Model.extend({
    deleteMessage: function() {
      this.destroy();
    }
  });

  Message.Collection = Backbone.Collection.extend({
    model: Message.Model,

    url: function() {
      return '/sections/' + this.section_id + '/threads/' + this.thread_id + '/messages';
    },

    initialize: function(attributes, options) {
      _.bindAll(this);
      this.section_id = options.section_id;
      this.thread_id = options.thread_id;
    },

    comparator: function(message) {
      return message.get('created');
    },

    newMessage: function(username, text) {
      var message = new Message.Model({
        username: username,
        message: text
      });

      this.add(message);

      message.save({
        error: function(message, err) {
          app.error('Save Error: ' + err.statusText);
        }
      });
    }
  });

  Message.SingleView = Backbone.View.extend({
    tagName: 'li',

    className: 'message',

    events: {
      'click .close': 'deleteMessage'
    },

    initialize: function() {
      _.bindAll(this);
      this.template = $('#message-tmpl').html();
    },

    render: function() {
      var html = Mustache.to_html(this.template, this.model.attributes);
      this.$el.html(html);

      return this;
    },

    deleteMessage: function(ev) {
      ev.preventDefault();

      if (this.model.get('username') != app.login.get('username')) {
        return app.error('You Did Not Create This Message');
      }

      this.model.deleteMessage();
    }
  });

  Message.ListView = Backbone.View.extend({
    className: 'messages span9',
    
    events: {
      'submit form': 'newMessage'
    },

    initialize: function() {
      _.bindAll(this);
      this.template = $('#messages-tmpl').html();

      this.collection.bind('add', this.render);
      this.collection.bind('destroy', this.render);
    },

    render: function() {
      var html = Mustache.to_html(this.template, this.collection.attributes);
      this.$el.html(html);

      var $list = this.$el.find('ul');

      this.collection.each(function(message) {
        var single = new Message.SingleView({
          model: message
        });

        $list.append(single.render().el);
      });

      return this;
    },

    newMessage: function(ev) {
      ev.preventDefault();

      var that = this;

      app.requireLogin(function(username) {
        var $textarea = that.$el.find('textarea');
        
        var text = $textarea.val();
        that.collection.newMessage(username, text);

        $textarea.val('');
      });
    }
  });

})(app.module('message'));