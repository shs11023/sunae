var http = require('http');
var util = require('util');
var date_utils = require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var fs = require('fs');

var stb_getpid = require('./routes/stb_getpid');

// local variable
var HTTP_PORT_NUMBER = 12321;
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(express.static('public'));

/*
process.on('uncaughtException', function(err) {
	console.error(err);
});
*/

require('./routes').setRouter(app);


var httpServer = http.createServer(app).listen(HTTP_PORT_NUMBER, function () {
	console.log('##############################################################');
	console.log('Simple RP Echo Server running port : ' + HTTP_PORT_NUMBER);
	console.log('##############################################################\n\n');
});

function getMemInfo(pid) {
	console.log('getMemInfo' + ' ' + pid);

};


var proc_list = [];
var meminfoTimer;
var runMeminfo = 0;

// socket.io
var io = socketio.listen(httpServer);
io.sockets.on('connection', function(socket) {
	socket.emit('toclient', {msg:'Websocket Connected!'});
	var msg = util.format('{"client": %s}', JSON.stringify(socket.handshake.address));
	console.log(msg);

	// start meminfo
	socket.on('meminfo_start', function(data) {
		if(runMeminfo === 0)
		{
			console.log('meminfo_start');
			console.log(data);

			for(i = 0 ; i < data.proc_name.length ; ++i )
			{ 
				var proc_name = data.proc_name[i];
				stb_getpid.find(proc_name, function(error, result) {
					if(error)
					{
						console.log('####### get pid error #######');
						console.log(error);

					} else {
						var proc_info = {};
						proc_info.name = result.name;
						proc_info.pid = result.pid;
						proc_list.push(proc_info);
					}
				});
				
			}

			// refresh interval. minimum 3sec
			var interval = 3;
			if(data.duration > 3) {
				interval = data.duration;
			}

			meminfoTimer = setInterval(function() {
				var msg = {};
				msg.meminfo = [];
				for(i = 0; i < proc_list.length ; ++i)
				{
					var info_path = '/proc/' + proc_list[i].pid + '/status';
					var data;
					try{
						data = fs.readFileSync(info_path, 'utf8');
					}catch(e){
						console.log(e);
						continue;
					}
					var start = data.indexOf('VmSize:');
					var end = data.indexOf('kB', start+7);
					var VmSize = data.substring(start+7, end);

					start = data.indexOf('VmRSS:');
					end = data.indexOf('kB', start+6);
					var VmRSS = data.substring(start+6, end);

					var result = {};
					var mem_info = {};
					result.proc_name = proc_list[i].name;
					mem_info.vmsize = parseInt(VmSize);
					mem_info.vmrss = parseInt(VmRSS);
					result.mem_info = mem_info;
					
					msg.meminfo.push(result);
					
				}

				// If would you like to watch the send message then print below. 
				//console.log(msg);
				socket.emit('meminfo', msg);


			}, interval*1000);

			runMeminfo = 1;
		}
	});

	// stop meminfo
	socket.on('meminfo_stop', function(data) {
		proc_list.splice(0, proc_list.length);
		clearInterval(meminfoTimer);
		console.log('meminfo_stop');
		console.log(data);

		runMeminfo = 0;
	});
});

var emitEvent = function(name, message) {
	console.log('emit( ' + name + ' ) : ' + message);
	io.sockets.emit(name, message);
};

exports.emitEvent = emitEvent;
global.emitEvent = emitEvent;
