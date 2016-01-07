var config = require('./config.json'),
	XenoBotConnector = require('./XenoBotConnector.js'),
	LocalPlayersStorage = require('./LocalPlayersStorage.js');

var xenoBotConnector = new XenoBotConnector(config.port)
xenoBotConnector.init();

var localPlayersStorage = new LocalPlayersStorage();

xenoBotConnector.addEventListener(function(_event, info) {
	localPlayersStorage.update(_event, info);
});

localPlayersStorage.display();