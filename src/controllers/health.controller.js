import { getDBStatus } from "../database/db.js"



export const checkHealth = async (req,res) => {
    try {
        const dbStatus = await getDBStatus()    
    
        const healthStatus = {
            status:"OK",
            timeStamp:new Date().toISOString(),
            services:{
                database:{
                    status:dbStatus.isConnected ? "healthy" : "unhealthy",
                    details:{
                        ...dbStatus,
                        readyState:getReadyStateText(dbStatus.readyState)
                    }
                },
                server:{
                    status:"healthy",
                    uptime:process.uptime(),
                    memoryUsage:process.memoryUsage(),
                }
            },
        }
    
        const httpStatus = healthStatus.services.database.status === "healthy" ? 200 : 503
    
        return res.status(httpStatus).json(healthStatus)
    } catch (error) {
        console.error("Health Check Failed",error);
        res.status(500).json({
            status:"ERROR",
            error:error.message,
            timeStamp: new Date().toISOString()

        })
    }
}


// utility method
function getReadyStateText(state) {
    switch (state) {
        case 0: return "disconnected"
        case 1: return "connected"
        case 2: return "connecting"
        case 3: return "disconnecting"
        default: return "unknown"
    }
}