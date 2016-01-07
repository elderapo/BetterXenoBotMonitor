require('libs\\XenoBotMonitorLib')

--[[
	Additional variables "exported" to XBMonitor.
	Ex. If you want to check profit made by "Elderapo" is his cassino.
]]--

PROFIT = 123123123

function getProfit()
	return PROFIT -- here you should use your global variable with total profit
end

local customFunctions = {
	["Elderapo"] = {
		{ exportedVar = "profit", -- name of exported var
		functionName = getProfit }, -- FUNCTION that returs some value
	},
}

XBmonitor = XenoBotMonitor(6666, customFunctions)
XBmonitor.runUpdater(200)