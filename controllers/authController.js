const bcrypt = require("bcrypt")
const {validationResult} = require("express-validator")
const User = require("../models/User")

const Signup = async (req,res) =>{
const errors = validationResult(req)

if(!errors.isEmpty()){
return res.status(400).send({error: errors.array()})
}


const {email, username ,password,confirmPassword} = req.body

try{
let user = await User.findOne({email})

if(user){
return res.status(400).send({message:"User already exist"})
}

//Create new User
user = new User({email,username,password})

if(user.password !== confirmPassword){
    return res.status(400).json({message:"Password don't match"})
}

//Encrypt password
user.password = await bcrypt.hash(password,13)

//Save newly created user to database
await user.save()

const userResponse = await User.findOne({email});
 const finalResponse = userResponse.toObject()
 delete finalResponse.password

//Return response to frontend
res.json({user:finalResponse,message:"User created Succefully"})


}catch(err){
console.error(`Error creating new user ${err.message}`)
res.send(500).send("Server error")
}
}

const Login = async (req,res) =>{
    const errors = validationResult(req)

if(!errors.isEmpty()){
        return res.status(400).send({error: errors.array()})
    }


const {email, password} = req.body
    
 try{
  let user = await User.findOne({email})

  if(!user){
    console.log(`User does not exist ${email}`)
    return res.status(400).send({message:"User does not exist"})
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch){
    console.log(`Incorrect password ${email}`)
    return res.status(400).send({message:"Invalid creditentials"})
  }


  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({user:userResponse,message:"Login succesfully"})
  

    }catch(err){
        console.error(`Error finding user ${err.message}`)
        res.status(400).send(`Error finding user ${err.message}`)
    }
}

module.exports = {Signup, Login}