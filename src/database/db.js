import mongoose from "mongoose";


const MAX_RETRIES = 3
const RETRY_INTERVAL = 5000 // 5 secs


class DatabaseConnection{
    constructor(){
        this.retryCount = 0
        this.isConnected = false

        // configurate mongoose settings
        mongoose.set("strictQuery", true)


        mongoose.connection.on("connected", () => {
            this.isConnected = true
            console.log("MONGODB CONNECTED SUCCESSFULLY")
        })

        mongoose.connection.on("error",() => {
            this.isConnected = false
            console.log("MONGODB CONNECTION ERROR")
        })

        mongoose.connection.on("disconnected",() => {
            this.isConnected = false
            console.log("MONGODB DISCONNECTED")
            // TODO: retry connection
            this.handleDisconnection()
        })

        process.on("SIGTERM", this.handleAppTermination.bind(this))
    }

    async connect(){
        try {
            if(!process.env.MONGO_URI){
                throw new Error("MONGO_URI is Not Defined in env varibales")
            }
            const connectionOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS:5000,
                socketTimeoutMS: 5000,
                family: 4 // use Ipv4
            }
            if(process.env.NODE_ENV === "development"){
                mongoose.set("debug", true)
            }
            await mongoose.connect(process.env.MONGO_URI, connectionOptions)
            this.retryCount = 0 // reset retry count on success
        } catch (error) {
            console.error(error.message)
            await this.handleDisconnectionError()
        }
    }

    async handleDisconnectionError(){
        if(this.retryCount < MAX_RETRIES){
            this.retryCount++
            console.log(`Retrying connection ${this.retryCount} times`);
            // 
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL))
            return this.connect()
        }else{
            console.error("Failed to connect to database after multiple retries")
            process.exit(1)
        }
    }

    async handleDisconnection(){
        if(!this.isConnected){
            console.log("Reconnecting to database....");
            this.connect()
        }
    }

    async handleAppTermination(){
        try {
            await mongoose.connection.close()
            console.log("MONGODB CONNECTION CLOSED SUCCESSFULLY");
            process.exit(0)
        } catch (error) {
            console.error("Error During Database Disconnection");
            
            process.exit(1)
        }
    }

    getConnection(){
        return {
            isConnected:this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        }
    }
}


// create a singleton instance
const databaseConnection = new DatabaseConnection()
export default databaseConnection.connect.bind(databaseConnection)
export const getDBStatus = databaseConnection.getConnection.bind(databaseConnection)