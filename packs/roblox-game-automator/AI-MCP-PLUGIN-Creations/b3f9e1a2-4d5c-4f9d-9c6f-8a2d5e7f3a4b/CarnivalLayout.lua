local CarnivalLayout = {}

CarnivalLayout.layout = {
    entrance = { x = 0, y = 0, description = "The grand, creaky gates of the haunted carnival." },
    mainPath = {
        { x = 10, y = 0, description = "A winding path lined with flickering lanterns." },
        { x = 20, y = 5, description = "The path narrows, shadows dance eerily." },
        { x = 30, y = 10, description = "A fork in the road, one path leads to the rides, the other to the haunted house." }
    },
    ridesArea = {
        { x = 40, y = 15, description = "The rickety Ferris wheel looms overhead, creaking ominously." },
        { x = 50, y = 20, description = "A carousel spins slowly, its music distorted and haunting." }
    },
    hauntedHouse = { x = 35, y = 25, description = "The haunted house stands tall, its windows dark and foreboding." },
    foodStalls = {
        { x = 25, y = 30, description = "A popcorn stand, the smell of burnt kernels fills the air." },
        { x = 30, y = 35, description = "A cotton candy stall, the candy is a sickly shade of green." }
    }
}

return CarnivalLayout