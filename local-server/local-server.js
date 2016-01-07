var config = require('./config.json');
// config.port
// config.authenticationKey

function XenoBotConnector(port) {
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


function LocalPlayersStorage() {
	this.storage = {};
}

LocalPlayersStorage.prototype.update = function(_event, info) {
	var characterName = info["characterName"] || -1;
	var authKey = 1;//info["authKey"] || -1;

	if (characterName == -1 || authKey == -1) return;
	for (var key in info["data"]) {
		if (this.storage[characterName]) {
			if (this.storage[characterName][key] !== info["data"][key]) {
				this.storage[characterName][key] = info["data"][key];
			}
		} else {
			this.storage[characterName] = {};
			this.storage[characterName] = info["data"];
			//this.storage[characterName]["authKey"] = authKey;
		}
	}
};

LocalPlayersStorage.prototype.debug = function() {
	(function(self) {
		setInterval(function(){
			process.stdout.write('\033c');
			console.log(self.storage);
		}, 200);
	})(this)
};

LocalPlayersStorage.prototype.getStorage = function() {
	return this.storage;
};


var connection = new XenoBotConnector(config.port);
connection.init();

var localPlayersStorage = new LocalPlayersStorage();

connection.addEventListener(function(_event, info) {
	localPlayersStorage.update(_event, info);
});

localPlayersStorage.debug();

// var allPlayerStorage = {};
// connection.addEventListener(function (_event, data) {
// 	if (_event == "CHAT") {
// 		//chat????????????????????
// 		// send info to sockets on selected bot page
// 		io.emit(data.to, data);
// 		return;
// 	}

// 	if (_event == "NEW_CONNECTION") {
// 		// send info about new connection to all sockets on index page
// 		// update allPlayerStorage
// 		for (var key in data) {
// 			if (data.hasOwnProperty(key)) {
// 				allPlayerStorage[data.characterName] = data;
// 			}
// 		}
// 		io.emit('getWholeInfo', allPlayerStorage);
// 		return;
// 	}

// 	if (_event == "DATA_UPDATE_BOT") {
// 		// if info contains hp, mana, exp, level, name change send it to all connected sockets on index page
// 		// send info to socket connected on selected bot page
// 		// update allPlayerStorage
// 		if (allPlayerStorage[data.characterName]) {
// 			//if player is already added just update
// 			for (var key in data) {
// 				if (data.hasOwnProperty(key)) {
// 					if (allPlayerStorage[data.characterName][key] != data[key]) {
// 						var part = allPlayerStorage[data.characterName];
// 						part[key] = data[key];
// 						//allPlayerStorage[data.characterName] = part;
// 					}
// 				}
// 			}
// 			io.emit('updatedPlayerData', allPlayerStorage);
// 		}
// 		io.emit(data.characterName, allPlayerStorage[data.characterName]);
// 		return;
// 	}
// });