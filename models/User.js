const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    email:{type: String, required: true, unique:true},
    username:{type: String, unique:true},
    password:{type:String, required:true},
    sites:[
        {
            name:{type:String},
            hasSSL:{type:Boolean},
            hasMalware:{type:Boolean},
            isLive:{type:Boolean},
            redirectTo:{type:String},
        },
    ]
})

module.exports = mongoose.model("User",UserSchema,"User")