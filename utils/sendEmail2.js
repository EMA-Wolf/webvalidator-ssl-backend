require("dotenv").config() 
const nodemailer = require("nodemailer")


const sendEmail2 = async (to, subject, text,attachmentContent) =>{

    const transporter = nodemailer.createTransport({
        service:"Gmail",
        port:465,
        secure:true,
        // logger:true,
        // debug:true,  
        secureConnection:false,
        auth:{
            user:process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls:{
            rejectUnauthorized:true
        },
    })

    const mailOptions = { 
        from: process.env.EMAIL,
        to,
        subject,
        text,
    }

    try{
        await transporter.sendMail(mailOptions);
        console.log("Email sent succesfully")
    }catch(err){
        console.error(`Error sending email ${err.message}`)
    }
}

module.exports = sendEmail2