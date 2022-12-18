require('dotenv').config();
const express = require('express');
const nodeMailer = require("nodemailer");
const app = express();
const User = require('./models/usermodel');
const UserOTPverification = require('./userOtpVerification');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// const port = 3000


let transporter = nodeMailer.createTransport({
    host:'smpt-mail.outlock.com',
    auth:{
        user:process.env.SMPT_MAIL,
        pass:process.env.SMPT_PASSWORD
    }
});


const sendOTPVerificationEmail = async({_id, email}, res)=>{
    try{
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        //mail option
        const mailOption = {
            from:process.env.SMPT_MAIL,
            to:email,
            subject:'Verify Your Email',
            html:`<p>Enter <b>${otp}</b> in the app to verify your email address and complete the Registration</p><p>This code expire in 1 hour</p>`,

            
        }
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification =  new UserOTPverification({
            userId:_id,
            otp:hashedOTP,
            createdAt:Date.now(),
            expireAt:Date.now() + 3600000,
        })
        await newOTPVerification.save();
        await transporter.sendMail(mailOption);
        res.json({
            status:'painding',
            message:'Verification otp email send',
            data:{
                userId:_id,
                email
            }
        })
    }
    catch(error){
        res.json({
            status:'failed',
            message:error.message
        })
    }
}

const port = process.env.PORT

app.use('/',(req,res)=>{
    res.send('<h1>Hello!</h1>')
})

app.listen(port, () => {
  console.log(`Server is Running at http://localhost:${port}`);
})