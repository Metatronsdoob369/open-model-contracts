2026-04-11T10:14:53.251Z,1297.251587,9f53000,6 [FLog::Output] ---START_FILE:ReplicatedStorage.Utilities.SupportLibrary---
2026-04-11T10:14:53.251Z,1297.251587,9f53000,6 [FLog::Output] SupportLibrary = {};

function SupportLibrary.FindTableOccurrences(Haystack, Needle)
	-- Returns the positions of instances of `needle` in table `haystack`

	local Positions = {};

	-- Add any indexes from `Haystack` that are `Needle`
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			table.insert(Positions, Index);
		end;
	end;

	return Positions;
end;

function SupportLibrary.FindTableOccurrence(Haystack, Needle)
	-- Returns one occurrence of `Needle` in `Haystack`

	-- Search for the first instance of `Needle` found and return it
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			return Index;
		end;
	end;

	-- If no occurrences exist, return `nil`
	return nil;

end;

function SupportLibrary.IsInTable(Haystack, Needle)
	-- Returns whether the given `Needle` can be found within table `Haystack`

	-- Go through every value in `Haystack` and return whether `Needle` is found
	for _, Value in pairs(Haystack) do
	
2026-04-11T10:14:53.251Z,1297.251709,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:14:57.553Z,1301.553467,9f53000,6 [FLog::Output] ---START_FILE:ReplicatedStorage.Utilities.SupportLibrary---
2026-04-11T10:14:57.553Z,1301.553467,9f53000,6 [FLog::Output] SupportLibrary = {};

function SupportLibrary.FindTableOccurrences(Haystack, Needle)
	-- Returns the positions of instances of `needle` in table `haystack`

	local Positions = {};

	-- Add any indexes from `Haystack` that are `Needle`
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			table.insert(Positions, Index);
		end;
	end;

	return Positions;
end;

function SupportLibrary.FindTableOccurrence(Haystack, Needle)
	-- Returns one occurrence of `Needle` in `Haystack`

	-- Search for the first instance of `Needle` found and return it
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			return Index;
		end;
	end;

	-- If no occurrences exist, return `nil`
	return nil;

end;

function SupportLibrary.IsInTable(Haystack, Needle)
	-- Returns whether the given `Needle` can be found within table `Haystack`

	-- Go through every value in `Haystack` and return whether `Needle` is found
	for _, Value in pairs(Haystack) do
	
2026-04-11T10:14:57.553Z,1301.553589,9f53000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:15:25.518Z,1329.518799,911a000,6 [FLog::Output] ---START_FILE:ReplicatedStorage.Utilities.SupportLibrary---
2026-04-11T10:15:25.518Z,1329.518921,911a000,6 [FLog::Output] SupportLibrary = {};

function SupportLibrary.FindTableOccurrences(Haystack, Needle)
	-- Returns the positions of instances of `needle` in table `haystack`

	local Positions = {};

	-- Add any indexes from `Haystack` that are `Needle`
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			table.insert(Positions, Index);
		end;
	end;

	return Positions;
end;

function SupportLibrary.FindTableOccurrence(Haystack, Needle)
	-- Returns one occurrence of `Needle` in `Haystack`

	-- Search for the first instance of `Needle` found and return it
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			return Index;
		end;
	end;

	-- If no occurrences exist, return `nil`
	return nil;

end;

function SupportLibrary.IsInTable(Haystack, Needle)
	-- Returns whether the given `Needle` can be found within table `Haystack`

	-- Go through every value in `Haystack` and return whether `Needle` is found
	for _, Value in pairs(Haystack) do
	
2026-04-11T10:15:25.518Z,1329.518921,911a000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:21.060Z,1445.060913,9b4d000,6 [FLog::Output] ---START_FILE:ReplicatedStorage.Utilities.SupportLibrary---
2026-04-11T10:17:21.060Z,1445.060913,9b4d000,6 [FLog::Output] SupportLibrary = {};

function SupportLibrary.FindTableOccurrences(Haystack, Needle)
	-- Returns the positions of instances of `needle` in table `haystack`

	local Positions = {};

	-- Add any indexes from `Haystack` that are `Needle`
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			table.insert(Positions, Index);
		end;
	end;

	return Positions;
end;

function SupportLibrary.FindTableOccurrence(Haystack, Needle)
	-- Returns one occurrence of `Needle` in `Haystack`

	-- Search for the first instance of `Needle` found and return it
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			return Index;
		end;
	end;

	-- If no occurrences exist, return `nil`
	return nil;

end;

function SupportLibrary.IsInTable(Haystack, Needle)
	-- Returns whether the given `Needle` can be found within table `Haystack`

	-- Go through every value in `Haystack` and return whether `Needle` is found
	for _, Value in pairs(Haystack) do
	
2026-04-11T10:17:21.060Z,1445.060913,9b4d000,6 [FLog::Output] ---END_FILE---
2026-04-11T10:17:27.063Z,1451.063965,9f53000,6 [FLog::Output] ---START_FILE:ReplicatedStorage.Utilities.SupportLibrary---
2026-04-11T10:17:27.063Z,1451.063965,9f53000,6 [FLog::Output] SupportLibrary = {};

function SupportLibrary.FindTableOccurrences(Haystack, Needle)
	-- Returns the positions of instances of `needle` in table `haystack`

	local Positions = {};

	-- Add any indexes from `Haystack` that are `Needle`
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			table.insert(Positions, Index);
		end;
	end;

	return Positions;
end;

function SupportLibrary.FindTableOccurrence(Haystack, Needle)
	-- Returns one occurrence of `Needle` in `Haystack`

	-- Search for the first instance of `Needle` found and return it
	for Index, Value in pairs(Haystack) do
		if Value == Needle then
			return Index;
		end;
	end;

	-- If no occurrences exist, return `nil`
	return nil;

end;

function SupportLibrary.IsInTable(Haystack, Needle)
	-- Returns whether the given `Needle` can be found within table `Haystack`

	-- Go through every value in `Haystack` and return whether `Needle` is found
	for _, Value in pairs(Haystack) do
	
2026-04-11T10:17:27.063Z,1451.063965,9f53000,6 [FLog::Output] ---END_FILE---
