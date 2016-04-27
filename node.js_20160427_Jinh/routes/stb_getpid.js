'use strict'

var spawn = require('child_process').spawn;

// ps aux output mapping
var MAPPING = {
	pid: 1,
	name: 5
};

var find = function (input, callback) {
	var ps = spawn('ps', ['-ef']);
	var grep = spawn('grep', [input]);

	ps.stdout.on('data', function(data){
		grep.stdin.write(data);

	});

	ps.on('close', function(code) {
		grep.stdin.end();

	});

	ps.stderr.on('data', function(data) {
		post(callback, data);
	});

	grep.stdout.on('data', function(data) {
		var result = parse(data);
		post(callback, null, result);
	});

	grep.stderr.on('data', function(data) {
		post(callback, data);
	});


	grep.on('close', function(code) {
		if(code !== 0)
	{
		// error
		post(callback, new Error('No process found.'));
	}

	});

};

var post = function (callback, error, result) {
	result = result || [];

	if (typeof callback === 'function') {
		callback(error, result);
	}
};

var parse = function(input) {

	var result = [];
	var data = '';
	var proc;
	data = input.toString();

	data = data.replace(/ +/g, ' ');
	data = data.replace(/\n/g, ' ');
	console.log(data);
	proc = parseRow(data);

	return proc;
};

var parseRow = function (input) {
	var data = input.split(' ');

	return {
		pid: parseInt(data[MAPPING.pid]),
			name: data[MAPPING.name]
	};
};

module.exports.find = find;
