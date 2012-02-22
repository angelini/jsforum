(function(Login) {

  var AUTH  = 'user-auth';
  var SPLIT = '::';

  var AUTH_RE = new RegExp(AUTH + '=(\\S+?)' + SPLIT);
  
  Login.Model = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this);
      this.setUsername();
    },

    setUsername: function() {
      var auth = document.cookie.match(AUTH_RE);

      if (auth && auth.length == 2) {
        this.set('username', auth[1]);
      }
    },

    login: function(username, password) {
      var that = this;

      var data = {
        username: username,
        password: password
      };

      $.ajax({
        url: '/login',
        type: 'POST',
        data: data,
        statusCode: {
          500: function() {
            app.error('Internal Server Error');
          },

          401: function() {
            app.error('Incorect Password');
          },

          200: function() {
            that.trigger('logged-in');
          }
        }
      })
    },

    logout: function() {
      $.cookie(AUTH, null);
      this.set('username', null);
      this.trigger('logged-out');
    },

    register: function(username, email, password) {
      var that = this;

      var data = {
        username: username,
        email: email,
        password: password
      };

      $.ajax({
        url: '/users',
        type: 'POST',
        data: data,
        statusCode: {
          500: function() {
            app.error('Internal Server Error');
          },

          409: function() {
            app.error('Username Already In Use');
          },

          201: function() {
            that.login(data.username, data.password);
          }
        }
      })
    }
  });

  Login.StatusView = Backbone.View.extend({
    className: 'login-status',

    events: {
      'click .login': 'login',
      'click .logout': 'logout'
    },

    initialize: function() {
      _.bindAll(this);
      this.inTemplate = $('#logged-in-tmpl').html();
      this.outTemplate = $('#logged-out-tmpl').html();

      this.model.bind('logged-in', this.update);
      this.model.bind('logged-out', this.update);
    },

    render: function() {
      if (this.model.get('username')) {
        var html = Mustache.to_html(this.inTemplate, this.model.attributes);
        this.$el.html(html);
      
      } else {
        this.$el.html(this.outTemplate);  
      }

      return this;
    },

    update: function() {
      this.model.setUsername();
      this.render();
    },

    login: function() {
      var modalView = new Login.ModalView({
        model: this.model
      });

      app.$main.append(modalView.render().el);
      var $modal = app.$main.find('#login-modal');

      $modal.on('hidden', function() {
        $modal.remove();
      });

      $modal.modal();
    },

    logout: function() {
      this.model.logout();
      app.router.navigate('/', { trigger: true });
    }
  });

  Login.ModalView = Backbone.View.extend({
    events: {
      'submit .login': 'login',
      'submit .register': 'register'
    },

    initialize: function() {
      _.bindAll(this);
      this.template = $('#login-modal-tmpl').html();

      this.model.bind('logged-in', this.close);
    },

    render: function() {
      this.$el.html(this.template);
      return this;
    },

    close: function() {
      var $modal = this.$el.find('#login-modal');

      $modal.on('hidden', function() {
        $modal.remove();
      });
      
      $modal.modal('hide');
    },

    login: function(ev) {
      ev.preventDefault();
      
      var $login = this.$el.find('.login');

      var username = $login.find('input[name="username"]').val();
      var password = $login.find('input[name="password"]').val();

      this.model.login(username, password);
    },

    register: function(ev) {
      ev.preventDefault();

      var $register = this.$el.find('.register');

      var username = $register.find('input[name="username"]').val();
      var password = $register.find('input[name="password"]').val();
      var email = $register.find('input[name="email"]').val();

      this.model.register(username, email, password);
    }
  });

})(app.module('login'));