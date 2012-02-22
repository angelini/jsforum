(function(Message) {
  
  Message.Model = Backbone.Model.extend({
    
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
    }
  });

  Message.SingleView = Backbone.View.extend({
    tagName: 'li',

    className: 'message',

    initialize: function() {
      _.bindAll(this);
      this.template = $('#message-tmpl').html();
    },

    render: function() {
      var html = Mustache.to_html(this.template, this.model.attributes);
      this.$el.html(html);

      return this;
    }
  });

  Message.ListView = Backbone.View.extend({
    className: 'messages span9',
    
    initialize: function() {
      _.bindAll(this);
      this.template = $('#messages-tmpl').html();
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
    }    
  });

})(app.module('message'));