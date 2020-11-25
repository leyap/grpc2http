var createError = require('http-errors');
// var compression = require('compression'); //gzip
var express = require('express');
var path = require('path');
var logger = require('morgan');

var grpc = require('./grpc/grpc_client');

var indexRouter = require('./routes/index');

var app = express();
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public')));

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('X-Powered-By', 'lisper.xd.node');
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
};

// app.use(compression()); //gzip
app.use(allowCrossDomain);//运用跨域的中间件

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);
  // render the error page
  res.sendStatus(err.status || 500);
  res.json({
    r: 408,
    msg: err.toString()
  });
});

module.exports = app;
