let express = require('express');
let subpath = require('path');
let session = require('express-session');
let SQLiteStore = require('connect-sqlite3')(session);
let hierarchy = require('../../routes/hierarchy');

let mockApp = express();

mockApp.set('views', subpath.join(__dirname, '../../views'));
mockApp.set('view engine', 'ejs');

mockApp.use(session({
  store: new SQLiteStore(),
  secret: 'reallyBadSecret',
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  resave: false,
  saveUninitialized: false
}));

mockApp.use((req, res, next) => {
  req.session.username = 'invalid';
  req.session.password = 'invalid';
  req.session.teamName = 'invalid';
  next();
});

mockApp.use(express.static(subpath.join(__dirname, 'public')));

mockApp.use('/hierarchy', hierarchy);

module.exports = mockApp;
