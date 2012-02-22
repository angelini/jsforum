(function(Thread) {
  
  var Message = app.module('message');

  Thread.Model = Backbone.Model.extend({
    fetchMessages: function(callback) {
      if(this.messages) {
        return callback(null, this.messages);
      }

      var that = this;
      var options = {
        section_id: this.collection.section_id,
        thread_id: this.id
      }

      var messages = new Message.Collection([], options);

      messages.fetch({
        success: function() {
          that.messages = messages;
          callback(null, messages);
        },

        error: function(messages, err) {
          callback(err);
        }
      });
    }
  });

  Thread.Collection = Backbone.Collection.extend({
    model: Thread.Model,

    url: function() {
      return '/sections/' + this.section_id + '/threads';
    },

    initialize: function(attributes, options) {
      _.bindAll(this);
      this.section_id = options.section_id;
    },

    comparator: function(thread) {
      return thread.get('created');
    }
  });

  Thread.SingleView = Backbone.View.extend({
    tagName: 'li',

    className: 'thread well',

    events: {
      'click': 'openThread'
    },

    initialize: function() {
      _.bindAll(this);
      this.template = $('#thread-tmpl').html();
    },

    render: function() {
      var html = Mustache.to_html(this.template, this.model.attributes);
      this.$el.html(html);
      
      return this;
    },

    openThread: function() {
      app.router.navigate(
        '/sections/' + this.model.collection.section_id + '/threads/' + this.model.id, 
        { trigger: true }
      );
    }
  });

  Thread.ListView = Backbone.View.extend({
    className: 'threads',

    initialize: function() {
      _.bindAll(this);
      this.template = $('#threads-tmpl').html();
    },

    render: function() {
      var html = Mustache.to_html(this.template, this.collection.attributes);
      this.$el.html(html);

      var $list = this.$el.find('ul');

      this.collection.each(function(thread) {
        var single = new Thread.SingleView({
          model: thread
        });

        $list.append(single.render().el);
      });

      return this;
    }
  });

})(app.module('thread'));