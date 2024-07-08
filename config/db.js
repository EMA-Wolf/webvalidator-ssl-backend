const mongoose = require("mongoose")

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          })
        console.log("Connect to MongoDB successfully")
    }catch(err){
        console.log(`Connection failed: ${err.message} `)
    }
}
module.exports = connectDB