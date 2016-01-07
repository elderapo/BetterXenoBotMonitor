Self.HealthPercentagle = function()
	return (Self.Health() / Self.MaxHealth()) * 100
end

Self.ManaPercentagle = function()
	return (Self.Mana() / Self.MaxMana()) * 100
end

Self.Vocation = function()
	local promotion = Self.Soul() > 100 and 2 or 1
	local config = {
		[15] = {"Knight", "Elite Knight"},
		[10] = {"Paladin", "Royal Paladin"},
		[5] =  {
			{ "Sorcerer", "Master Sorcerer", items = { "Velvet Mantle", "Dragon Robe", "Robe of the Underworld",
															"Shimmer Wand", "Wand of Cosmic Energy", "Wand of Decay",
															"Wand of Defiance", "Wand of Dimensions", "Wand of Draconia",
															"Wand of Dragonbreath", "Wand of Everblazing", "Wand of Inferno",
															"Wand of Starstorm", "Wand of Voodoo", "Wand of Vortex" }
			},
			{"Druid", "Elder Druid", items = { "Greenwood Coat", "Robe of the Ice Queen", "Glacial Rod", "Hailstorm Rod",
													"Moonlight Rod", "Muck Rod", "Necrotic Rod", "Northwind Rod",
													"Shimmer Rod", "Snakebite Rod", "Springsprout Rod", "Terra Rod",
													"Underworld Rod" }
			}
		},
	}
	function checkIfMsOrEd()
		if (type(config[(Self.MaxHealth()-185) / (Self.Level()-8)][1]) == "table") then

			local tbl = config[(Self.MaxHealth()-185) / (Self.Level()-8)]
			for voc in pairs(tbl) do
				for item in pairs(tbl[voc].items) do
					if (Item.GetID(tbl[voc].items[item]) == Self.Weapon().id or Item.GetID(tbl[voc].items[item]) == Self.Armor().id) then
						return tbl[voc][promotion] or nil
					end
				end
			end
		end
		return nil
	end
	return checkIfMsOrEd() or (type(config[(Self.MaxHealth()-185) / (Self.Level()-8)][promotion]) == "string" and config[(Self.MaxHealth()-185) / (Self.Level()-8)][promotion] or nil) or "unknown"
end

Self.ExperiencePercent = function()
	function expAtLevel(targetLevel)
		return ((50/3) * (targetLevel^3) - (100 * targetLevel^2) + ((850/3) * targetLevel) - 200)
	end

	function expRequiredForLevel()
		local nextLevel = Self.Level() + 1
		return expAtLevel(nextLevel + 1) - expAtLevel(nextLevel)
	end

	function experienceLeftForCurrentLevel()
		return ((50/3) * ((Self.Level() + 1)^3) - (100 * (Self.Level() + 1)^2) + ((850/3) * (Self.Level() + 1)) - 200) - Self.Experience()
	end

	return  math.floor(100 - ((experienceLeftForCurrentLevel() / expRequiredForLevel()) * 100))
end

Self.ExpPercent = Self.ExperiencePercent

Self.Name = function()
	local name = getCreatureName(getCreatureListIndex(getSelfID()))
	name = string.gsub(name, "\'", "")
	name = string.gsub(name, "Elderapo", "")
	name = string.gsub(name, "%(", "")
	name = string.gsub(name, "%)", "")
	return name == "" and getCreatureName(getCreatureListIndex(getSelfID())) or name
end
