var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var spawn = require('child_process').spawn;
var multer = require('multer');

var stb_getpid = require('./stb_getpid');

var tc_app_upload = multer({ dest: './tc/' });
var user_app_upload = multer({ dest: './userapp/' });

var RESULT_FILE_NAME = 'result.json';
var PARAMS_FILE_NAME = 'param.json';


exports.setRouter = function(app) {
	// Router Setting
	app.get('/', get_main_page);
	app.get('/upload/tc_app', get_upload_tc_app);
	app.get('/upload/user_app', get_upload_user_app);
	app.get('/list/tc', get_tc_list);
	app.get('/list/userapp', get_userapp_list);
	app.get('/tc/:app_name', run_tc_proc);
	app.get('/app/:app_name', run_app_proc);
	app.get('/meminfo', meminfo_proc);

	app.post('/upload/tc_app', tc_app_upload.single('uploadFile'), post_upload_tc_app);
	app.post('/upload/user_app', user_app_upload.single('uploadFile'), post_upload_user_app);

	app.post('/tc/:app_name', run_tc_proc);
	app.post('/app/:app_name', run_app_proc);

	app.post('/linuxcmd', post_linux_cmd);
};


// GET Methods ---------------------------------------------------
function get_main_page(req, res) {
	fs.readFile('./public/AppkitTestKit.html', function (error, data) {
		if (error) {
			console.log(error);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		}
	});
};

function meminfo_proc(req, res) {

	fs.readFile('./public/MemGraph.html', function (error, data) {
		if (error) {
			console.log(error);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		}
	});
};

function get_upload_tc_app(req, res) {
	fs.readFile('./uploadTC.html', function (error, data) {
		if (error) {
			console.log(error);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		}
	});
};

function get_upload_user_app(req, res) {
	fs.readFile('./uploadUserApp.html', function (error, data) {
		if (error) {
			console.log(error);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		}
	});
};

function get_tc_list(req, res) {
	fs.readdir('./tc/', function(err, files){
		if(err) {
			throw err;
		}
		console.log(files);

		var result = {tc_app_list:[]};
		result.tc_app_list = files;
		res.send(result);
	});
};

function get_userapp_list(req, res) {
	fs.readdir('./userapp/', function(err, files){
		if(err) {
			throw err;
		}
		console.log(files);

		var result = {user_app_list:[]};
		result.user_app_list = files;
		res.send(result);
	});
};

// POST Methods ---------------------------------------------------
function post_upload_tc_app(req, res) {
	var target = req.file.destination + req.file.originalname;

	fs.rename(req.file.path, target, function(err){
		if(err) {
			console.log(err);
			res.status(500).send('Fail to file upload..');
		} else {
			console.log('TC-App is uploaded( %s )', target);
			res.status(200).send('Success to file upload - ' + req.file.originalname);

			spawn('chmod', ['755', target]);
		}
	});
};

function post_upload_user_app(req, res) {
	var target = req.file.destination + req.file.originalname;

	fs.rename(req.file.path, target, function(err){
		if(err) {
			console.log(err);
			res.status(500).send('Fail to file upload..');
		} else {
			console.log('User-App is uploaded( %s )', target);
			res.status(200).send('Success to file upload - ' + req.file.originalname);

			spawn('chmod', ['755', target]);
		}
	});
};

function run_tc_proc(req, res) {
	var parsedObj = url.parse(req.url);
	var query = querystring.parse(parsedObj.query);
	var app_name= req.params.app_name;
	var app_path = './tc/' + app_name;

	if(query.withparams== 'y')
	{
		var params = req.body; 
		console.log(params);
		fs.writeFile(app_path + '.json', JSON.stringify(params), function(err) {
			run_app(req, res, app_path, query.withparams);

		});
	} else {
		run_app(req, res, app_path, query.withparams);
	}
};

function run_app_proc(req, res) {
	var parsedObj = url.parse(req.url);
	var query = querystring.parse(parsedObj.query);
	var app_name = req.params.app_name;
	var app_path = './userapp/' + app_name;
	if(query.withparams== 'y')
	{
		var params = req.body; 
		console.log(params);
		fs.writeFile(app_path + '.json', JSON.stringify(params), function(err) {
			run_app(req, res, app_path, query.withparams);

		});
	} else {
		run_app(req, res, app_path, query.withparams);
	}
};


// run linux command
function post_linux_cmd(req, res) {
	var cmdObject = req.body;
	var cmdString = cmdObject.cmd;
	var args = cmdObject.args;

	var run_cmd;

	console.log('Request Linux CMD');
	console.log(cmdObject);
	if(args != undefined)
	{
		// run with arguments
		run_cmd = spawn(cmdString, args);
	}
	else
	{
		// no argument command
		run_cmd= spawn(cmdString, []);
	}

	run_cmd.on('error', function(err){
		var message = {};
		message.msg = err.path + ': command not found';
		console.log(err);
		emitEvent('error', message);

		var result = {};
		result.returnCode = -1;
		res.status(200).send(result);
	});

	run_cmd.stdout.on('data', function(data){
		var message = {};
		message.msg = data;
		console.log(message.msg);
		emitEvent('stdout', message);
	});

	run_cmd.stderr.on('data', function(data){
		var message = {};
		message.msg = data;
		console.log(message.msg);
		emitEvent('stderr', message);
	});

	run_cmd.on('close', function(code){
		var result = {};
		result.returnCode = code;
		
		//send result
		res.status(200).send(result);
	});
};





function run_app(req, res, app_path, withParam) {

	var param_filename = app_path + '.json';
	var run_tc;

	// TODO: delete result.json
	if(withParam == 'y') {
		run_tc = spawn(app_path, [param_filename]);
	} else {
		run_tc = spawn(app_path);
	}

	console.log('spawn( ' + app_path + ' )');

	run_tc.stdout.on('data', function(data){
		console.log('stdout ++++++++++++');
		console.log(data);
		console.log('stdout ++++++++++++');
		console.log("STD OUT!!!!!!!!!!!!!!!");
		var message = {};
		message.msg = data;
		console.log(message.msg);
		emitEvent('stdout', message);
	});

	run_tc.stderr.on('data', function(data){
		var app_event;
		var message = {};
		console.log('stderr ++++++++++++');
		console.log("%s", data);
		console.log('stderr ++++++++++++');
		try {
			app_event = JSON.parse(data);

		} catch (e) {
			console.log(e);
			message.msg = e;
			emitEvent('strerr', message);
			return;		   	
		}
		
		console.log("STDERROR!!!!!!!!!!!!!!!");
		message.msg = data;
		console.log(message.msg);
		emitEvent('stderr', message);
	});

	// If close event is received, must send result that has been written in result.json file.
	run_tc.on('close', function(code){
		fs.unlink(param_filename, function(err) {
			if(err) {
				console.log(err);
			}

			console.log('Delete param file - ' + param_filename);
		});

		fs.readFile(RESULT_FILE_NAME, 'utf8',  function(err, data) {
			var result;
			if(err) {
				console.log(err);
				
			}
			console.log('TC( ' + app_path + ' ) Done');
			console.log(result);
			result = JSON.parse(data);
			console.log(result);

			//send result
			res.status(200).send(result);

		});
	});

	console.log('run app success!!!!!!\n');

};
