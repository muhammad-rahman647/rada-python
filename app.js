const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const flash = require('connect-flash');
const helmet = require('helmet');
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);
const mongoSantize = require('express-mongo-sanitize');
const compression = require('compression');

// ImportRoutes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const indexRoutes = require('./routes/indexRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const MONGODB_URI = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const app = express();

const store = new mongoStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

// passport config
require('./config/passport')(passport);

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// set views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// bodyParser
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: true,
  })
);

// session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: {
    //    maxAge: 3600000,
    //    expires: new Date(Date.now() + 3600000)
    // }
  })
);

app.use(morgan('common', {
  stream: fs.createWriteStream('./access.log', {
    flags: 'a'
  })
}));

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
app.use('/api/v1/device', deviceRoutes);
app.use('/api/v1/employee', employeeRoutes);

app.use('*', (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    bg_color: '',
    email: '',
  });
});

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (req.originalUrl.startsWith('/api')) {
    console.log(error);
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
    });
  }

  console.log(error);
  res.status(500).render('500', {
    pageTitle: '500',
  });
});

// app.all('*', (req, res, next) => {
//   next(new Error(`Can't find ${req.originalUrl} on this server!`));
// });

module.exports = app;