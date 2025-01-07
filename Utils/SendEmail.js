require("dotenv").config()
const nodemailer = require("nodemailer")

const transporter=nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: 465,
    secure:true,
    auth: {
        user:process.env.ADMIN_EMAIL ,
        pass: process.env.ADMIN_EMAIL_PASSWORD
    }
});

async function sendEmail(to,template){
    var message = {
        from:process.env.ADMIN_EMAIL,
        to:to,
        subject:"DroneConnect | Email verification",
        html:template
    }
   // console.log(transporter)
    let info = await transporter.sendMail(message)
    if(info){
        return true
    }
    return false
}
module.exports=sendEmail
