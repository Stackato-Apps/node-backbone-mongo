var express = require('express')
  , http = require('http')
  , mongoose = require('mongoose')
  , models = require('./models')
  , routes = require('./routes')
  , app = express()
  , env = process.env.NODE_ENV || 'development'
  , errorhandler = require('errorhandler')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , morgan = require('morgan');

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(morgan('combined'));
app.use(require('stylus').middleware({ src: __dirname + '/public' }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(methodOverride());

if (env == 'development') {
  app.use(errorhandler());
}

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
