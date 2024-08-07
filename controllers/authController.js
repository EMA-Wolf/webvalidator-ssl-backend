const bcrypt = require("bcrypt")
const {validationResult} = require("express-validator")
const User = require("../models/User")
const sendEmail2 = require("../utils/sendEmail2")
const crypto = require("crypto")


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

const updateUser = async (req, res) => {

  const errors = validationResult(req)

if(!errors.isEmpty()){
return res.status(400).send({error: errors.array()})
}

  const { userId, email, username } = req.body;

  console.log(`Update to User profile request by ${userId}`)

  try {
      let user = await User.findById(userId);

      if (!user) {
        console.log(`User ${userId} not found`);
          return res.status(404).send({ message: "User not found" });
      }

      user.email = email || user.email;
      user.username = username || user.username;

      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;
      console.log(`Updated details for user ${userId}`)
      res.json({ user: userResponse, message: "User updated successfully" });

  } catch (err) {
      console.error(`Error updating user ${err.message}`);
      res.status(500).json({message:"Server error"});
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.body;

  console.log(`User ${userId} requseted for deletion`);

  try {
    let user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      console.log(`User ${userId} not found`);
      return res.status(404).send({ message: "User not found" });
    }
    
    console.log(`User ${userId} deleted successfully`);
      res.json({ message: "User deleted successfully" });

      const userEmail = user.email;

      const subject = "Account Deletion Confirmation";
      const text = `Dear ${user.username},\n\nYour account has been successfully deleted. All your data has been removed from our system. We appreciate your time with us.\n\nBest regards,\nYour Company Name`;

      await sendEmail2(userEmail, subject, text);

  } catch (err) {
      console.error(`Error deleting user ${err.message}`);
      res.status(500).json({message:"Server error"});
  }
};



const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'User with this email does not exist' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    const subject = "Password Reset Request";
    const text = `You are receiving this email because you (or someone else) have requested to reset your password.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    await sendEmail2(user.email, subject, text);

    res.json({ message: 'Password reset link has been sent to your email' });

  } catch (err) {
    console.error(`Error requesting password reset: ${err.message}`);
    res.status(500).send("Server error");
  }
};

// Render the reset password form
const renderResetPasswordForm = (req, res) => {
  res.render('resetPassword', { token: req.params.token });
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 13);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log(`Password reset for user ${user.email}`);
    // res.json({ message: 'Password has been reset successfully' });
    res.render("resetSuccessFull")

  } catch (err) {
    console.error(`Error resetting password: ${err.message}`);
    res.status(500).send("Server error");
  }
};

module.exports = {Signup, Login, updateUser, deleteUser, requestPasswordReset , renderResetPasswordForm , resetPassword}