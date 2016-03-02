importScripts("prime.js");

function postResultToParent(v1, v2, v3) {
	postMessage({
		msgType: "result",
		value1: v1,
		value2: v2,
		value3: v3
	});
}

addEventListener("message", function(event) {
	//var res = isPrime(event.data);
	//postMessage(res);
	var			res;

	console.log(">> Command [" + event.data.command + "]: value1=" + event.data.value1 + ", value2=" + event.data.value2, "value3=" + event.data.value3);
	res = isPrime(event.data.value1);
	console.log(">> Calculation Result : " + res);

	postResultToParent(res, 0, 0);
}, false);
