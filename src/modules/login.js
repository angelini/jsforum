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

    logout: function() {
      $.cookie(AUTH, null);
      this.set('username', null);
      this.trigger('change-status');
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
    },

    render: function() {
      this.$el.html(this.template);
      return this;
    },

    login: function(ev) {
      ev.preventDefault();
      var that = this;

      var data = {
        username: this.$el.find('input[name="username"]').val(),
        password: this.$el.find('input[name="password"]').val(),
      }

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
            var $modal = that.$el.find('#login-modal');
            that.model.trigger('change-status');

            $modal.on('hidden', function() {
              $modal.remove();
            });
            
            $modal.modal('hide');
          }
        }
      })
    },

    register: function() {
      
    }
  });

})(app.module('login'));