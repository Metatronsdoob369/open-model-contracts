--[[

	UIArranger.lua
	Utility module for handling UI layout and data sorting.

	Features:
	- ApplyLayoutOrder(elements, fixedOrder)
	  Assigns LayoutOrder to UI elements based on a fixed order first,
	  then randomizes the rest for variation.

	- GetSortedTable(data, sortBy?)
	  Converts a dictionary (e.g. FruitDatas.Fruits) into a sorted array.
	  Sorts alphabetically by Name, or numerically by a field in Info if provided.

	Use this for any shop category (Fruits, Armor, Potions, etc.)
	to control UI ordering and display consistency.

	@author Mys7o

]]

local UIArranger = {}

function UIArranger.GetSortedTable(data: {[string]: any}, sortBy: string?): { {Name: string, Info: any} }
    local sorted = {}

    for name, info in pairs(data) do
        table.insert(sorted, { Name = name, Info = info })
    end

    table.sort(sorted, function(a, b)
        if sortBy == "Name" then
            return a.Name < b.Name
			
        elseif sortBy and a.Info[sortBy] and b.Info[sortBy] then
            return a.Info[sortBy] < b.Info[sortBy]
        end

        -- default alphabetical
        return a.Name < b.Name
    end)

    return sorted
end

function UIArranger.ApplyLayoutOrder(elements: {Instance}, fixedOrder: {[number]: string})
	if not elements or #elements == 0 then return end
	fixedOrder = fixedOrder or {}

	local remaining = {}

	-- Step 1: Place fixed order items
	for _, element in ipairs(elements) do
		if element and element:IsA("GuiObject") then
			local matched = false

			for index, name in pairs(fixedOrder) do
				if element.Name == name then
					element.LayoutOrder = index
					matched = true
					break
				end
			end

			if not matched then
				table.insert(remaining, element)
			end
		end
	end

	-- Step 2: Randomize remaining items
	local orderStart = (#fixedOrder) + 1
	local indices = {}
	for i = orderStart, orderStart + #remaining - 1 do
		table.insert(indices, i)
	end

	-- Fisher-Yates shuffle
	for i = #indices, 2, -1 do
		local j = math.random(i)
		indices[i], indices[j] = indices[j], indices[i]
	end

	-- Step 3: Assign randomized layout orders
	for i, element in ipairs(remaining) do
		element.LayoutOrder = indices[i]
	end
end

return UIArranger