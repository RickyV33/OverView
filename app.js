let express = require('express');
let path = require('path');
let logger = require('morgan');
let session = require('express-session');
let SQLiteStore = require('connect-sqlite3')(session);
let bodyParser = require('body-parser');

// TODO: Refactor these into a single routes module
let routes = require('./routes/index');
let logout = require('./routes/logout');
let hierarchy = require('./routes/hierarchy');
let graph = require('./routes/graph');
let projects = require('./routes/projects');
let logout = require('./routes/logout');
let hierarchy = require('./routes/hierarchy');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  store: new SQLiteStore(),
  secret: process.env.SESSION_SECRET || 'reallyBadSecret',
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  resave: false,
  saveUninitialized: false
}));

// Middleware to add the teamName to the session from the .env config file
app.use(function (req, res, next) {
  var teamName = req.session.teamName;
  if (!teamName) {
    req.session.teamName = process.env.TEAM_NAME || 'sevensource';
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/logout', logout);
app.use('/hierarchy', hierarchy);
app.use('/graph', graph);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
