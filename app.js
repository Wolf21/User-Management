const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const csrf = require('csurf');
const flash = require('connect-flash');
const _ = require('underscore');
const moment = require('moment');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/test', { useMongoClient: true });

app.use(express.static('public'));
app.set('view engine', 'jade');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./config/passport')(passport);
require('./secret/secret');

app.use(validator());

app.use(session({
    secret: 'Thisismytestkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(flash());
app.use(csrf({ cookie: true }));

app.use(passport.initialize());
app.use(passport.session());

// Middleware user define.
app.use((req, res, next) => {
    res.locals.csrf_token = req.csrfToken();
    res.locals.user = req.user;
    console.log("URL " + req.url + ": " + req.user);
    next();
});

app.locals._ = _;
app.locals.moment = moment;

require('./routes/user')(app, passport);
require('./routes/admin')(app,passport);

app.get('*', (req, res) => {
    res.render('404');
});

app.listen(8088, () => {
    console.log('Listening on port 5001...');
});