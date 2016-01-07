function XenoBotConnector(port) {
	console.log("xb connector");
	this._zmq = require('zmq');
	this._subscriber = this._zmq.socket('sub');
	this._publisher = this._zmq.socket('pub');
	this._port = port || 6666;
	this._port_offset = 2;
	this._shouldAddNewSubscriber = false;
}

XenoBotConnector.prototype.sendToTibia = function(topic, data) {
	var topic = topic || "";
	var data = typeof data == "string" ? data : JSON.stringify(data);
	this._publisher.send([topic, data]);
};

XenoBotConnector.prototype.addEventListener = function(callback) {
	this._subscriber.on('message', function (topic, data) {
		var eventName = topic.toString();
		var data = JSON.parse(data.toString() || {});
		callback(eventName, data);
	});
};

XenoBotConnector.prototype.init = function() {
	this._publisher.bind('tcp://*:' + this._port, function(err) {
		if (err)
			console.log(err)
	});

	// broadcast avaiable port and listen on it when someone connects
	setInterval((function(self) {
		return function() {
			self._publisher.send(["AVAIABLE_PORT", self._port + self._port_offset]);
			if (!self._shouldAddNewSubscriber) {
				self._subscriber.connect('tcp://127.0.0.1:' + (self._port + self._port_offset));
				self._shouldAddNewSubscriber = true;
			}
		}
	})(this), 100); 

	this._subscriber.connect('tcp://127.0.0.1:' + (this._port + 1));
	this._subscriber.subscribe('');

	// listen for new connection
	(function(self) {
		self._subscriber.on('message', function (topic) {
			var topic = topic.toString();
			if (topic == "NEW_CONNECTION") {
				self._port_offset++;
				self._shouldAddNewSubscriber = false;
			}
		});
	})(this);
};

module.exports = XenoBotConnector;
