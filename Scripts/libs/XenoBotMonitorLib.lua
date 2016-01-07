require("libs\\JSON")
require('libs\\XenoBotExtendedLib')


function XenoBotMonitor(_port, _optionalConfig)
	local self = {}
	local config = nil
	local subscriberPort = nil
	local publisherPort = nil
	local variableStorage = nil
	local subscriber = nil
	local publisher = nil
	local updaterModule = nil

	-- WE WILL BE ENUMS! xD
	local PRIVATE_PROXY = 1
	local LOCAL_PROXY = 2

	--publisher thingy
	local sendToServer = function(topic, data)
		local topic = topic or ""

		local packet = {}
		if (type(data) == "table") then
			packet["characterName"] = Self.Name()
			packet["data"] = data
			publisher:PublishMessage(topic, JSON:encode(packet))
		end
	end

	-- init
	(function(_port, _optionalConfig)
		local getStarterStorage = function(name)
			local storage = {}
			local baseFunctions = {
				{ exportedVar = "current_health", functionName = Self.Health },
				{ exportedVar = "max_health", functionName = Self.MaxHealth },
				{ exportedVar = "current_mana", functionName = Self.Mana },
				{ exportedVar = "max_mana", functionName = Self.MaxMana },
				{ exportedVar = "current_level", functionName = Self.Level },
				{ exportedVar = "percent_experience", functionName = Self.ExpPercent },
				{ exportedVar = "vocation", functionName = Self.Vocation },
				{ exportedVar = "self_position", functionName = Self.Position },
				{ exportedVar = "is_connection_alive", functionName = os.time }
			}

			for key in pairs(baseFunctions) do
				if (type(baseFunctions[key].functionName) ~= "function") then print("U need to pass function not value.") end
				table.insert(storage, baseFunctions[key])
			end

			local fromConfig = _optionalConfig and _optionalConfig[name] or {}
			for key in pairs(fromConfig) do
				if (type(fromConfig[key].functionName) ~= "function") then print("U need to pass function not value.") end
				table.insert(storage, fromConfig[key])
			end

			return storage
		end

		variableStorage = getStarterStorage(Self.Name())
		subscriberPort = _port or 6666
		subscriber = IpcSubscriberSocket.New("sub-socket", subscriberPort)
		subscriber:AddTopic("AVAIABLE_PORT")
		subscriber:AddTopic("CHAT_SAY")

		local getPublisherPort = function()
			local timeStamp = os.clock()
			while (true) do
				if (os.clock() - timeStamp > 2) then
					print("Start NODE.JS server first.")
				end
			    local hasMessage, topic, data = subscriber:Recv()
			    if (hasMessage and topic == "AVAIABLE_PORT") then
			        print("[%s]: %s", topic, data)
			        return data
			    end
			end
		end

		publisherPort = getPublisherPort()
		publisher = IpcPublisherSocket.New("variable_sender_IPC_" .. os.clock(), publisherPort)

		local composed = { }
		for variable_key in pairs(variableStorage) do
			variableStorage[variable_key].value = variableStorage[variable_key].functionName()
			local key = variableStorage[variable_key].exportedVar
			local value = variableStorage[variable_key].value
			composed[variableStorage[variable_key].exportedVar] = variableStorage[variable_key].value
		end

		wait(500)
		sendToServer("NEW_CONNECTION", composed)

		-- function speechProxyCallback(type, speaker, level, text)
		-- 	local tbl = { type = type, speaker = speaker, level = level, text = text, time = os.time()}
		--     sendToServer("CHAT", tbl)
		-- end

		-- PrivateMessageProxy.OnReceive("Private Message Proxy", function (proxy, speaker, level, text)
		-- 	speechProxyCallback(PRIVATE_PROXY, speaker, level, text)
		-- end)

		-- LocalSpeechProxy.OnReceive("Local Message Proxy", function (proxy, msgType, speaker, level, text)
		-- 	speechProxyCallback(LOCAL_PROXY, speaker, level, text)
		-- end)

		print("[XenoBotMonitor]: initalized!")
	end)(_port, _optionalConfig)


	local updateTick = function()
		local composed = { }

		local infoChanged = false
		for variable_key in pairs(variableStorage) do
			if (variableStorage[variable_key].value ~= variableStorage[variable_key].functionName()
				and -- \/ comparing points xD
				table.serialize(variableStorage[variable_key].value) ~= table.serialize(variableStorage[variable_key].functionName())) then
				variableStorage[variable_key].value = variableStorage[variable_key].functionName()
				local key = variableStorage[variable_key].exportedVar
				local value = variableStorage[variable_key].value
				composed[key] = value
				infoChanged = true
			end
		end

		if (infoChanged) then
			sendToServer("DATA_UPDATE_BOT", composed)
		end
	end

	local getIncommingChatMsgs = function()
	    local hasMessage, topic, data = subscriber:Recv()
	    if (hasMessage and topic == "CHAT_SAY") then
	        local data = JSON:decode(data)
	        if (data["from"] == Self.Name()) then
		        if (data["type"] == LOCAL_PROXY) then
		        	Self.Say(data.text)
		        elseif (data["type"] == PRIVATE_PROXY) then
		        	Self.PrivateMessage(data.to, data.text)
		        end
		    end
	    end
	end

	self.update = function()
		updateTick()
	end

	self.runUpdater = function(miliseconds)
		local updateFrequency = miliseconds or 1000
		wait(math.random(200))

		updaterModule = Module.New("updater_module_" .. os.clock(), function(mod)
			--getIncommingChatMsgs()
			updateTick()
			mod:Delay(updateFrequency)
		end)
		print("[XenoBotMonitor]: started auto updating!")
	end

	self.pauseUpdater = function()
		print("[XenoBotMonitor]: paused auto updating!")	
		return updaterModule and updaterModule:Stop() or nil
	end

	self.resumeUpdater = function()
		print("[XenoBotMonitor]: resumed auto updating!")
		return updaterModule and updaterModule:Start() or nil
	end

	return self
end