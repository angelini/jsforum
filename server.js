var config  = require('./config');
var PORT    = config.PORT;
var SPLIT   = config.SPLIT;
var AUTH    = config.AUTH;

var connect = require('connect');
var Cookies = require('cookies');
var Keygrip = require('keygrip');
var resty   = require('resty');

var UserStorage = require('./storage/user_storage');

var storage = new UserStorage();

var cookie_keys = new Keygrip(['S3KRIT1']);
var login_keys = new Keygrip(['S3KRIT2']);

var authenticate = function(req, res, next) {
  var cookies = new Cookies(req, res, cookie_keys);
  var user_auth = cookies.get(AUTH, { signed: true });

  if (!user_auth) { return next(); }

  var split = user_auth.split(SPLIT);

  if (split.length !== 2) { return next(); }

  var username = split[0];
  var key = split[1];

  if (login_keys.verify(username, key)) {
    req.token = { username: username };
  }

  next();
};

var router = connect.router(function(app) {
  app.post('/login', function(req, res) {
    var cookies = new Cookies(req, res, cookie_keys);

    storage.verify(req.body.username, req.body.password, function(err, result) {
      if (err && err.message != 'User Not Found') {
        res.writeHead(500, {'content-type': 'application/json'});
        return res.end(JSON.stringify({ error: 'Internal Error' }));
      }

      if (!result || (err && err.message == 'User Not Found')) {
        res.writeHead(401);
        return res.end();
      }

      hash = login_keys.sign(req.body.username);
      cookies.set(AUTH, req.body.username + SPLIT + hash, 
        { signed: true, httpOnly: false });

      res.writeHead(200, {'content-type': 'application/json'});
      res.end(JSON.stringify({}));
    });
  });

  app.get('/logout', function(req, res) {
    var cookies = new Cookies(req, res, cookie_keys);

    cookies.set(AUTH, undefined);
    res.writeHead(200, {'content-type': 'application/json'});
    res.end(JSON.stringify({}));
  });
});

var app = connect.createServer();
app.use(connect.logger('dev'));
app.use(connect.favicon());

app.use(connect.query());
app.use(connect.bodyParser());
app.use(connect.static(__dirname));

app.use(authenticate);
app.use(router);
app.use(resty.middleware(__dirname + '/resources'));

app.listen(PORT);

console.log('Server listening on port ' + PORT);
