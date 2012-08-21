var express = require('express')
  , http = require('http')
  , mongoose = require('mongoose')
  , models = require('./models')
  , routes = require('./routes')
  , app = express();

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

routes.init(app);

var port = process.env.VCAP_APP_PORT || 3000;

if(process.env.VCAP_SERVICES){
  var services = JSON.parse(process.env.VCAP_SERVICES);
  var dbcreds = services['mongodb'][0].credentials;
}

if(dbcreds){
  console.log(dbcreds);
  mongoose.connect(dbcreds.host, dbcreds.db, dbcreds.port, {user: dbcreds.username, pass: dbcreds.password});
}else{
  mongoose.connect("127.0.0.1", "todomvc", 27017);
}

http.createServer(app).listen(port);
console.log("Express server listening on port" + port);
