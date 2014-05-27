var serialport = require('serialport'),
	SerialPort = serialport.SerialPort,
	comport = process.argv [3] || '/dev/ttyACM0';

var serialPort = new SerialPort(comport, {
	baudrate: 9600,
	parser: serialport.parsers.readline("\r\n")
});

serialPort.open(function () {
	var crypto = require('crypto'),
		socket = require ('socket.io-client').connect('http://temp.stoodliner.com:8015/'),
		publicSecret, privateSecret;
	
	socket.on('connect', function () {
		socket.on('auth', function (data) {
			publicSecret = data.secret;
			privateSecret = crypto.createHash('md5').update(publicSecret+process.argv [2]).digest('hex');
		});

		serialPort.on('data', function (temp) {
			socket.emit('data', {
				point: [(new Date()).getTime(), parseFloat(temp)],
				secret: privateSecret
			});
		});
	});
});
