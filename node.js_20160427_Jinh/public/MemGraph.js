
var init = 0;
var meminfoStarted = 0;
var socket;

function startSocketIO()
{
	if(init === 0 )
	{
		socket = io.connect();

		socket.on('toclient', function(data){
			console.log(data);
		});

		socket.on('stdout', function(data){
			console.log("STDOUT!");
			console.log(data);
			console.log(JSON.stringify(data));
		});
		socket.on('stderr', function(data){
			console.log("STDERR!");
			console.log(JSON.stringify(data));
		});
		socket.on('error', function(data){
			console.log("ERROR!");
			console.log(JSON.stringify(data));
		});
		socket.on('meminfo', function(data){

			//data.meminfo
			if(meminfoStarted === 0)
			{
				var titleArray = [];
				titleArray[0] = 'Date';
				for(i = 0 ; i < data.meminfo.length ; ++i)
				{
					titleArray.push(data.meminfo[i].proc_name);
				}
				vmsize_data[0] = titleArray;
				vmrss_data[0] = titleArray;

				meminfoStarted = 1;
			}	

			var vmsizeArray = [];
			var vmrssArray = [];
			vmrssArray[0] = vmsizeArray[0] = getCurrentTime();
			for(i = 0 ; i < data.meminfo.length ; ++i)
			{
				vmsizeArray.push(data.meminfo[i].mem_info.vmsize);
				vmrssArray.push(data.meminfo[i].mem_info.vmrss);

			}

			vmsize_data.push(vmsizeArray);
			vmrss_data.push(vmrssArray);

			// draw meminfo
			console.log(data);
			drawVmsizeChart();
			drawVmrssChart();
		});

		init = 1;
	}
}

function getCurrentTime()
{
	var dt = new Date();
	var month = dt.getMonth()+1;
	var d = dt.getFullYear() + '-' + month + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
	return d;
}


function startMemInfoButtonClicked()
{	
	if(meminfoStarted === 0)
	{
		var proc_name= document.getElementById('proc_name');
		var duration = document.getElementById('duration');
		var msg = {};

		var procStrings = proc_name.value;
		console.log(procStrings);
		var strArray = procStrings.split(' ');
		console.log(strArray);
		var procArray = new Array();
		for(i=0 ; i < strArray.length; ++i)
		{
			procArray.push(strArray[i]);
		}
		msg.proc_name = procArray;
		msg.duration = duration.value;

		console.log(msg);

		// initilize to mem data
		vmsize_data.splice(0, vmsize_data.length);
		vmrss_data.splice(0, vmrss_data.length); 

		// start meminfo
		socket.emit('meminfo_start', msg);
	}

}

function stopMemInfoButtonClicked()
{	
	var proc_name= document.getElementById('proc_name');

	var msg = {};
	msg.proc_name = proc_name.value;

	console.log(msg);

	socket.emit('meminfo_stop', msg);
	
	meminfoStarted = 0;
}
