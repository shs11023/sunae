function sleep(ms){
	ts1 = new Date().getTime() + ms;
	do ts2 = new Date().getTime(); while (ts2<ts1);
}

function isPrime(n) {
	var			retval = true;

	if (n >= 2)
	{
		for (var i = 2, m = Math.sqrt(n); i<=m; i++)
		{
			if (n % i === 0)
			{
				retval = false;
				break;
			}
		}
	}
	else
	{
		retval = false;
	}

	sleep(10000);

	return retval;
}
