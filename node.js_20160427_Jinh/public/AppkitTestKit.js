
var init = 0;
var socket;


function startSocketIO()
{
	if(init === 0 )
	{
		socket = io.connect();

		socket.on('toclient', function(data){
			console.log(data);
			writeToLogArea(data.msg);
		});

		socket.on('stdout', function(data){
			console.log("STDOUT!");
			console.log(data);
			console.log(JSON.stringify(data));
			writeToLogArea(data.msg);
		});
		socket.on('stderr', function(data){
			console.log("STDERR!");
			console.log(JSON.stringify(data));
			writeToLogArea(data.msg);
		});
		socket.on('error', function(data){
			console.log("ERROR!");
			console.log(JSON.stringify(data));
			writeToLogArea(data.msg);
		});
		socket.on('meminfo', function(data){
			console.log(data);
		});

		init = 1;
	}
}


function writeToLogArea(data)
{	
	var item = document.getElementById('logArea');
	if(data instanceof ArrayBuffer)
	{
		console.log('ArrayBuffer!!!!!!!');
		var dataview = new DataView(data);
		var ints = new Uint8Array(data.byteLength);
		var str = ''; 
		for(var i = 0; i < ints.length; i++) 
		{    
			ints[i] = dataview.getUint8(i);
			str += String.fromCharCode(ints[i]);
		}    
		console.log(str);
//		item.focus();
		item.innerHTML = item.value + '\n' + str; 

	}
	else
	{
		item.innerHTML = item.value + '\n' + data;
//		item.focus();
		console.log(data);
	}
}

function writeToStdLogArea(arBuffer)
{	
	var item = document.getElementById('logArea');

	var view = new DataView(arBuffer, 2, 2);
	console.log(view.byteOffset);



	item.innerHTML = item.value + '\n' + strData;

	console.log(strData);
}

function appListResult(data)
{
	var jsonData = JSON.stringify(data);
	
	var appList = document.getElementById('tc_select');
	for(i=0; i< data.tc_app_list.length ; ++i)
	{
			console.log(data.tc_app_list[i]);
			tc_select.options[i+1] = new Option(data.tc_app_list[i], data.tc_app_list[i]);
	}
}

function getAppList()
{
	var tclistURL = "/list/tc";
	$.get(tclistURL, appListResult);
}

function runResult(data)
{
	var jsonData = JSON.stringify(data, undefined, 4);
	var resultArea = document.getElementById('resultArea');
	console.log(data);
	console.log(jsonData);
	resultArea.innerHTML = jsonData;
}

function runAppButtonClicked()
{	
	var select = document.getElementById('tc_select');
	var tc_name = select.options[select.selectedIndex].text;
	var runURL = '/tc/' + tc_name;

	$.get(runURL, runResult);
}



function clearLogArea()
{
	var x = document.getElementById('logArea');
	x.innerHTML = "";
}

function clearResultArea()
{
	var x = document.getElementById('resultArea');
	x.innerHTML = "";
}


function cmdResult(data)
{
	var jsonData = JSON.stringify(data, undefined, 4);
	var resultArea = document.getElementById('resultArea');
	console.log(data);
	console.log(jsonData);

	clearResultArea();
	resultArea.innerHTML = jsonData;
}

function runCmdButtonClicked()
{	
	var cmdURL = '/linuxcmd'
	var x = document.getElementById("cmd_text");
	var cmdString = x.value;
	console.log("TEXT : " + cmdString);

	if('cmdString' == '') return;

	clearLogArea();

	var strArray = cmdString.split(' ');
	var cmdJson = {};
	cmdJson.cmd = strArray[0];

	var argsArray = new Array();
	if(strArray.length > 1)
	{
		for(i=1 ; i < strArray.length ; ++i)
		{
			argsArray.push(strArray[i]);
		}
		cmdJson.args = argsArray;
	}

	console.log(cmdJson);
	$.post( cmdURL, cmdJson, cmdResult);
}

function runKillAllButtonClicked()
{	
	var cmdURL = '/linuxcmd'
	var x = document.getElementById("cmd_text");
	var cmdString = x.value;
	console.log("TEXT : " + cmdString);

	if('cmdString' == '') return;

	clearLogArea();

	var strArray = cmdString.split(' ');
	var cmdJson = {};
	cmdJson.cmd = 'killall'

	
	var argsArray = new Array();
	argsArray.push('-9');
	argsArray.push(strArray[0]);
	cmdJson.args = argsArray;

	console.log(cmdJson);
	$.post( cmdURL, cmdJson, cmdResult);
}







function clearLogButtonClicked()
{	
	var x = document.getElementById('logArea');

	console.log("clearLogButtonClicked!!");
	x.innerHTML = "";
}

function saveLogButtonClicked()
{	
	alert("Not yet implement.");
}

function clearResultButtonClicked()
{	
	var x = document.getElementById('resultArea');

	console.log("clearResultButtonClicked!!");
	x.innerHTML = "";
}

function saveResultButtonClicked()
{	
	alert("Not yet implement.");
}








var g_db = {
	"userId" : "b2120h412",
	"authToken" : "whoisyourdaddy"
};

var sequeceNumber = 0;

function getDB(){
	return g_db;
}

function getUserId()
{
	var db = getDB();
	return db.userId;
}
function getAuthToken()
{
	var db = getDB();
	return db.authToken;
}

function setUserId(userId)
{
	var db = getDB();
	db.userId = userId;	
}

function setAuthToken(token)
{
	var db = getDB();
	db.authToken = token;	
}


// **************************************
// <HTTP Request and response>
// **************************************
function writeOutputString(strData)
{	
	var outputCanvas = document.getElementById('output');
	var newItem = document.createElement('pre');
	newItem.innerHTML = strData;	
	outputCanvas.insertBefore(newItem, outputCanvas.childNodes[0]);

}


function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
            	if (/recordingId/.test(match)) {
            		cls = 'id';
            	}else{            		            	
                cls = 'key';
              }
            } else {            	
                cls = 'string';              
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function getResult(data)
{
	var jsonData = null;	
	jsonData = syntaxHighlight(data);
	writeOutputString(jsonData);
	
}

function requestToScheduler( action, requestUrl, title, data )
{
	sequeceNumber++;
	writeOutputString("<b>" +sequeceNumber+": " + title +" : " + requestUrl + "</b>");
	
	switch(action)
	{
		case "GET" : 
		{
			$.get( requestUrl, getResult ); 
			return;
		}
		case "POST":
		{
			$.post( requestUrl, data, getResult);
			return;
		}
		
	}	
	alert("requestToScheduler error");
}
// **************************************

	

// **************************************
// <Button Clicked>
// **************************************
function getBaseUrl()
{	
	var x = document.getElementById( "txtBaseUrl" );
	var baseUrl = x.value;
	return baseUrl;
}

function getButtonClicked( input_id, title, type )
{	
	var x = document.getElementById( input_id );
	var requestUrl = getBaseUrl() +x.value;	
	var data = "";
	var postId = null;
	console.log(requestUrl);
	
	switch(type)
	{
		case "POST" :
		{
			postId = input_id+"POST";
			x = document.getElementById( postId );			
			data = x.value;
		}			
	}
	
	requestToScheduler( type	,requestUrl, title , data);	
}

function cleanOutputButtonClicked()
{	
	var x = document.getElementById("output");
	x.innerHTML = "";
}

var time = 0;
var timerId = null;
var timer_status = "none";
function updateTime( out )
{
		timerId = setTimeout(
		function(){		
			time++;
			out.value = time;
			updateTime(out);
		}, 
	1000);
}
function stopTimer(out)
{
	window.clearTimeout(timerId);
}
function resetTimer(out)
{
	window.clearTimeout(timerId);
	out.value = "0";
	time = 0;
}


function timerClicked(outputId)
{
	var out = document.getElementById( outputId );
	var btnComponent = document.getElementById( "btnTimer" );
	switch(timer_status)
	{
		case "none":	// => to Start
			updateTime(out);
			btnComponent.value = "STOP TIMER";			
			timer_status = "start";
			break;
		case "start":
			stopTimer(out);
			btnComponent.value = "RESET TIMER";			
			timer_status = "stop";
			break;
		case "stop":
			resetTimer(out);
			btnComponent.value = "START TIMER";			
			timer_status = "none";
			break;		
	}
	
}
// **************************************


function calc1_onKeyUp()
{
	var base10 =0 , base16 =0;	
	var x = document.getElementById( 'txtCalc10_1'	);
	base10 =  x.value;
	base10 *= 1;	// convert number
	base16 = base10.toString(16).toUpperCase();	
	
	x = document.getElementById( 'txtCalc16_1'	);
	x.value = "0x" + base16;	
}
	
function calc2_onKeyUp()
{
	var base10 =0 , base16 =0;
	var x = document.getElementById( 'txtCalc16_2'	);
	base16 =  x.value;
	base16 *= 1;	// convert number
	base10 = base16.toString(10).toUpperCase();
	
	x = document.getElementById( 'txtCalc10_2'	);
	x.value = base10;	
}


function getEpochTime( editId )
{
	var date = new Date();
	var x = document.getElementById( editId );
	
	var intVal = 0;
	intVal = date.getTime();
	intVal = intVal/1000;	
	intVal = Math.round(intVal);	
	x.value = intVal;
}

function getEpochTime2( epochId, offsetId)
{
	var val = 0;
	var x = document.getElementById( epochId );
	val = x.value*1;
	x = document.getElementById( offsetId );
	val = val + (x.value*1);
	val = val * 1000;
	
	x = document.getElementById( "txtEpochTimeSum" );
	x.value = val;	
}

function startMemInfoButtonClicked()
{	
	var proc_name= document.getElementById('proc_name');
	var duration = document.getElementById('duration');

	var msg = {};
	msg.proc_name = proc_name;
	msg.duration = duration;

	socket.emit('meminfo_start', msg);
}

function stopMemInfoButtonClicked()
{	
	var proc_name= document.getElementById('proc_name');

	var msg = {};
	msg.proc_name = proc_name;

	socket.emit('meminfo_stop', msg);
}
