const path = require('path');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const flash = require('connect-flash');
const helmet = require('helmet');
const session = require('express-session');
const mongoSantize = require('express-mongo-sanitize');
const compression = require('compression');

// ImportRoutes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const indexRoutes = require('./routes/indexRoutes');

const app = express();

// passport config
require('./config/passport')(passport);

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// set views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// bodyParser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// secure headers
app.use(helmet());

// Mongo Santization NOSql injection
app.use(mongoSantize());

// compression

app.use(compression());

// passport middlewares
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

// global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.use('*', (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    bg_color: '',
    email: '',
  });
});

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('500', {
    pageTitle: '500',
  });
});

// app.all('*', (req, res, next) => {
//   next(new Error(`Can't find ${req.originalUrl} on this server!`));
// });

module.exports = app;
