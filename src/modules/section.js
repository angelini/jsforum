(function(Section) {
  
  var Thread = app.module('thread');

  Section.Model = Backbone.Model.extend({
    fetchThreads: function(callback) {
      if(this.threads) {
        return callback(null, this.threads);
      }

      var that = this;
      var threads = new Thread.Collection([], { section_id: this.id });

      threads.fetch({
        success: function() {
          that.threads = threads;
          callback(null, threads);
        },

        error: function(threads, err) {
          callback(err);
        }
      });
    }
  });

  Section.Collection = Backbone.Collection.extend({
    model: Section.Model,

    url: '/sections',

    comparator: function(section) {
      return section.get('created');
    }
  });

  Section.SingleView = Backbone.View.extend({
    tagName: 'li',

    className: 'section',

    events: {
      'click .section-link': 'toggleThreads'
    },

    initialize: function() {
      _.bindAll(this);
      this.template = $('#section-tmpl').html();
      this.model.bind('open', this.showThreads);
    },

    render: function() {
      var html = Mustache.to_html(this.template, this.model.attributes);
      this.$el.html(html);

      return this;
    },

    showThreads: function() {
      var $el = this.$el;
      
      this.model.fetchThreads(function(err, threads) {
        if(err) { return app.error('Fetch Error: ' + err.statusText); }

        var threadsView = new Thread.ListView({
          collection: threads
        });

        $el.append(threadsView.render().el);
      });

      $el.find('.icon-plus').removeClass('icon-plus')
                            .addClass('icon-minus');

      app.router.navigate('/sections/' + this.model.id);
    },

    hideThreads: function() {
      var $el = this.$el;

      $el.find('.threads').remove();

      $el.find('.icon-minus').removeClass('icon-minus')
                             .addClass('icon-plus');

      app.router.navigate('/');
    },

    toggleThreads: function(ev) {
      ev.preventDefault();
      
      if (this.$el.find('.threads').length == 0) {
        this.showThreads();
      } else {
        this.hideThreads();
      }
    }
  });

  Section.NavElemView = Section.SingleView.extend({
    className: 'section-nav',

    initialize: function() {
      _.bindAll(this);
      this.template = $('#section-nav-tmpl').html();
    }
  });

  Section.ListView = Backbone.View.extend({
    className: 'sections',

    initialize: function() {
      _.bindAll(this);
      this.template = $('#sections-tmpl').html();
    },

    singleView: Section.SingleView,

    render: function() {
      var that = this;
      var html = Mustache.to_html(this.template, this.collection.attributes);
      this.$el.html(html);

      var $list = this.$el.find('ul');

      this.collection.each(function(section) {
        var single = new that.singleView({
          model: section
        });
        
        $list.append(single.render().el);
      });
      
      return this;
    }
  });

  Section.NavView = Section.ListView.extend({
    className: 'sections-nav span3 well',

    initialize: function() {
      _.bindAll(this);
      this.template = $('#sections-nav-tmpl').html();
    },

    singleView: Section.NavElemView
  });

})(app.module('section'));