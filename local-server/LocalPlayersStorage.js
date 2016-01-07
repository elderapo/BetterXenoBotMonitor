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

LocalPlayersStorage.prototype.display = function() {
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

module.exports = LocalPlayersStorage;
