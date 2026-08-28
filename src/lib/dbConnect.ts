import mongoose from "mongoose";

type connectionObj =  {
   isConnected?: number
}

const connection : connectionObj = {}

async function dbConnect() : Promise<void>{
    if(connection.isConnected){
        console.log("MongoDB is already connected !")
        return
    }

    try {
        const db =  await mongoose.connect(process.env.MONGODB_URI || '')
        console.log(db)
        connection.isConnected = db.connections[0].readyState 
        console.log("Connection with MongoDB established !")

    } catch (error) {
        console.log("Connection with MongoDB failed !")
        console.log(error)
        process.exit(1)
    }
}

export default dbConnect