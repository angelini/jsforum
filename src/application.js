var app = {
  module: (function() {
    var modules = {};

    return function(name) {
      if (modules[name]) {
        return modules[name];
      }

      modules[name] = {};

      return modules[name];
    }
  })(),

  $main: (function() {
    return $('#main');
  })(),

  $top: (function() {
    return $('#top');
  })(),

  error: (function() {
    var template = $('#error-tmpl').html();

    return function(message) {
      var html = Mustache.to_html(template, {message: message});
      var $prependTo = this.$main;
      var $login_modal = this.$main.find('#login-modal');

      if ($login_modal.length > 0) {
        $prependTo = $login_modal.find('.modal-body');
      }

      $prependTo.prepend(html)
                .find('.alert')
                .alert();
    }
  })(),

  clear: function() {
    this.$main.empty();
  },

  loginStatus: function() {
    var Login = app.module('login');

    var loginStatusView = new Login.StatusView({
      model: app.login
    });

    app.$top.find('.login-status').remove();
    app.$top.append(loginStatusView.render().el);
  },

  init: function(callback) {
    var Login = app.module('login');
    app.login = new Login.Model();

    app.loginStatus();

    app.login.bind('change-status', function() {
      app.login.setUsername();
      app.loginStatus();
    });

    var Section = app.module('section');
    var sections = new Section.Collection();

    sections.fetch({
      success: function() {
        this.initialized = 1;
        app.sections = sections;
        callback(null);
      },

      error: function(sections, err) {
        callback(err);
      }
    });
  },

  mainView: function(sid) {
    var Section = app.module('section');
    var sectionsView = new Section.ListView({
      collection: app.sections
    });

    app.$main.append(sectionsView.render().el);

    if (sid) {
      app.sections.get(sid).trigger('open');
    }
  },

  threadView: function(sid, tid) {
    var Section = app.module('section');
    var Message = app.module('message');

    var navSectionsView = new Section.NavView({
      collection: app.sections
    });

    app.$main.append(navSectionsView.render().el);

    var section = app.sections.get(sid);
    section.fetchThreads(function(err, threads) {
      if (err) { return app.error('Fetch Error: ' + err.statusText); }

      var thread = threads.get(tid);
      thread.fetchMessages(function(err, messages) {
        if (err) { return app.error('Fetch Error: ' + err.statusText); }
        
        var messagesView = new Message.ListView({
          collection: messages
        });

        app.$main.append(messagesView.render().el);
      });
    });
  }
};

jQuery(function($) {
  var Router = Backbone.Router.extend({
    routes: {
      '': 'mainView',
      'sections/:sid': 'openSection',
      'sections/:sid/threads/:tid': 'openThread'
    },

    mainView: function() {
      app.clear();
      app.mainView();
    },

    openSection: function(sid) {
      app.clear();
      app.mainView(sid);
    },

    openThread: function(sid, tid) {
      app.clear();
      app.threadView(sid, tid);
    }
  });

  app.init(function(err) {
    if(err) { return app.error('Fetch Error: ' + err.statusText); }

    app.router = new Router();
    Backbone.history.start();
  });
});