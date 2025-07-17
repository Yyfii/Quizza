import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import userModel from '../models/userModel.js';

//User Registration and Welcome email
export const register = async (req, res) =>{
    const {name, email, password} = req.body
    if(!name | !email | !password){
        return res.json({success: false, message: 'Missing details'})
    }

    try{

        //try to create the user account and store it on the database
        //we need to encrypt the password
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({success: false, message: 'User already exists!'})
        }

        const hashedPassword = await bycrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedPassword})
        //save user in the database
        await user.save();
        
        //generate the token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 //seven days 
        });

        // sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email, //email from the user,
            subject: 'Welcome to Quizza',
            text: `Hello ${name}, welcome to Quizza website. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

        //user succesfully created
        return res.json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
        }
        });

    } catch (error){
        res.json({success: false, message: error.message})
    }
}

//User login
export const login = async (req, res)=> {
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: 'Email and password are required'})
    }

    try{
        //the user exists with this id?
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'Invalid email'})
        }

        const isMatch = await bycrypt.compare(password, user.password)

        if(!isMatch){
            //if the password is not matching
            return res.json({success: false, message: 'Invalid password'})
        }

        //add the other properties

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 //seven days 
        });

        return res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            }
        });
        

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//User logout
export const logout = async (req, res) =>{
    try{
        //clear the cookie from response
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: "Logged Out"})

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Send Verification OTP to the User´s Email
export const sendVerifyOtp  = async (req, res)=>{
    try{
        const userId = req.user?.id;

        const user = await userModel.findById(userId);

        if (user.isAccountVerified){
            //user already verified
            return res.json({success: false, message: "Account already verified"})
        }
        //Generate a 3 digit number
        const otp = String(Math.floor(100000 + Math.random() * 900000))

        // save this otp in the database for the user
        user.verifyOtp = otp
        user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email, //email from the user,
            subject: 'Quizza- Account verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOptions);

        res.json({success: true, message: 'Verification OTP Sent on Email' })


    } catch(error){
        res.json({success: false, message: error.message })
    }
}

//Get the otp and verify the user account
export const verifyEmail = async (req, res)=>{
    //
    const userId =  req.user?.id;
    const {otp} = req.body

    //check
    if(!userId | !otp){
        return res.json({success: false, message: 'Missing details'});
    }
    try{
        //find the user
        const user = await userModel.findById(userId)

        if(!user){
            return res.json({success: false, message: 'User not found' })
        }
        //verify the otp
        if(user.verifyOtp == '' || user.verifyOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP' })
        }

        if(user.verifyOtpExpiredAt < Date.now()){
            //expired otp
            return res.json({success: false, message: 'OTP Expired' })
        }

        //verify the user account
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiredAt = 0;

        //save
        await user.save();
        return res.json({success: true, message: 'Email verified successfully'})

    } catch (error){
        return res.json({success: false, message: error.message })
    }

}

//Verify if user is authenticated or not
export const isAuthenticated = async (req, res)=>{
    try {

        return res.json({success: true})
        
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

//Send password reset OTP
export const sendResetOtp = async (req, res) =>{
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message: 'Email is required'})
    }
    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success: false, message: 'User not found'})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        // save this otp in the database for the user
        user.resetOtp = otp
        user.resetOtpExpiredAt = Date.now() + 15 * 60 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email, //email from the user,
            subject: 'Quizza- Password Reset OTP',
            text: `Your OTP for reseting your password is ${otp}. Use this to proceed with reseting your password.`
        };

        await transporter.sendMail(mailOptions);

        return res.json({success: true, message: 'OTP sent to your email'})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

// Reset User Password
export const resetPassword = async (req, res)=>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: 'Email, OTP, and new password are required'});

    }
    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }
        //if the otp is expired
        if(user.resetOtpExpiredAt < Date.now()){
            return res.json({success: false, message: 'OTP Expired'});
        }

        //OTP Valid
        //encrypt
        const hashedPassword = await bycrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.resetOtp = ''
        user.resetOtpExpiredAt = 0

        //save
        await user.save();
        return res.json({success: true, message: 'Password has been reset successfully!'});

        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const getUserInfo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, userData: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

