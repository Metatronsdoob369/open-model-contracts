local RideGenerator = {}

function RideGenerator:generateRide(name, x, y)
    local ride = {
        name = name,
        position = { x = x, y = y },
        condition = "rickety",
        description = "A " .. name .. " that sways and groans with every movement."
    }
    return ride
end

function RideGenerator:generateAllRides()
    local rides = {}
    table.insert(rides, self:generateRide("Ferris Wheel", 40, 15))
    table.insert(rides, self:generateRide("Carousel", 50, 20))
    table.insert(rides, self:generateRide("Ghost Train", 45, 25))
    return rides
end

return RideGenerator