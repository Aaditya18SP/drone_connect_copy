const bcryptjs = require("bcryptjs");
const { get_db } = require("../Utils/MongoConnect.js");
const jwt = require("jsonwebtoken")
const {get_otp_template} = require("../Utils/HtmlEmailTemplates.js")
const sendEmail = require("../Utils/SendEmail.js")
const generateOTP = require("../Utils/GenerateOTP.js")
const tryCatchWrapper = require("../Utils/TryCatchWrapper.js")

/////////////////////////////Internal functions\\\\\\\\\\\\\\\\\\\\\\\\\\

function sendResponse(statuscode, message, res) {

    return res.status(statuscode).json({ message: message });
}

/////////////////////////////Exported functions\\\\\\\\\\\\\\\\\\\\\\\\\\
//1. Login
const ulogin = tryCatchWrapper(async (req, res,next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendResponse(401, "No details provided", res);
    }
    if (email.length < 1) {
        return sendResponse(401, "No email provided", res);
    }
    if (password.length < 1 || password.length < 8) {
        //TODO: set up diagnostic
        console.log(`Invalid password. Length of password is:${password.length}`);
        return sendResponse(
            401,
            "Invalid password provided.Length is less than 8 characters",
            res
        );
    }

    if (!email.match(/\S+@\S+\.\S+/)) {
        //TODO: set up diagnostic
        console.log("Email regex not matched: Email is" + email);
        return sendResponse(401, "Invalid email provided", res);
    }
    const isDigitPresent = password.match(/\d+/);
    const isSmallAlphaPresent = password.match(/[a-z]+/);
    const isUpperAlphaPresent = password.match(/[A-Z]+/);
    const isSpecialCharPresent = password.match(/[^\w]+/);
    if (
        !(
            isDigitPresent &&
            isSmallAlphaPresent &&
            isUpperAlphaPresent &&
            isSpecialCharPresent
        )
    ) {
        var msg = "Invalid password provided";
        if (!isDigitPresent) msg += ": digit not present";
        if (!isSmallAlphaPresent) msg += ": lowercase alphabet not present";
        if (!isUpperAlphaPresent) msg += ": uppercase alphabet not present";
        if (!isSpecialCharPresent) msg += ": special character not present";
        //TODO: set up diagnostic
        console.log(
            "Password regex not matched: Password is " + password + " " + msg
        );
        return sendResponse(401, msg, res);
    }

    let db = get_db();
    let user_col = await db.collection("user");
    let result = await user_col.findOne({ email: email });
    if (!result) {
        return sendResponse(401, "No such user present", res);
    }
    if (bcryptjs.compareSync(password, result.password)) {
        token=jwt.sign({data:email+(Date.now()/1000)},process.env.JWT_SECRET,{ expiresIn: '30d' })
        return res.status(200).cookie("token",token,{
            expires: new Date(Date.now() + 30 * 24 * 60 * 60),
            httpOnly: true,
            sameSite: "none",
            secure: true,
        }).json({success:true,message:"Login successful",token:token})
        //return sendResponse(200, "Login successful", res);
    }
    return sendResponse(401, "Incorrect password", res);
})

//Registration
const uregister = tryCatchWrapper(async (req, res,next) => {
    let db = get_db();
    // Note(458): user type options
    // c=>customer, p=>pilot (freelance), o=>organization(service provider)
    const user_type_options = ["c", "o", "p"];

    const {token, name, district, city, state, pincode, email, password, user_type } =
        req.body;

    //Note(458): Assuming that the token is not preceeded with the "Bearer" word
    if(!token){
        return sendResponse(403,"No token provided",res)
    }
    let extracted_contents = jwt.verify(token, process.env.JWT_SECRET)

    let token_email = (extracted_contents.data.split('?'))[0]

    if (
        !name ||
        !district ||
        !city ||
        !state ||
        !pincode ||
        !city ||
        !email ||
        !password ||
        !user_type
    ) {
        return sendResponse(401, "No details provided", res);
    }

    if (name.length < 1) {
        return sendResponse(401, "No name provided", res);
    }

    if (district.length < 1) {
        return sendResponse(401, "No district provided", res);
    }
    if (city.length < 1) {
        return sendResponse(401, "No city provided", res);
    }
    if (state.length < 1) {
        return sendResponse(401, "No state provided", res);
    }
    if (pincode.length < 1) {
        return sendResponse(401, "No pincode provided", res);
    }
    if (user_type.length < 1) {
        return sendResponse(401, "No user type provided", res);
    }
    if (email.length < 1) {
        return sendResponse(401, "No email provided", res);
    }
    if (password.length < 1 || password.length < 8) {
        //TODO: set up diagnostic
        console.log(`Invalid password. Length of password is:${password.length}`);
        return sendResponse(
            401,
            "Invalid password provided.Length is less than 8 characters",
            res
        );
    }

    if (!email.match(/\S+@\S+\.\S+/)) {
        //TODO: set up diagnostic
        console.log("Email regex not matched: Email is" + email);
        return sendResponse(401, "Invalid email provided", res);
    }

    if(email !== token_email){
        return sendResponse(403, "Unauthorized email used", res)
    }
    if (!pincode.match(/\d{6}/)) {
        return sendResponse(401, "Invalide pincode", res);
    }

    const isDigitPresent = password.match(/\d+/);
    const isSmallAlphaPresent = password.match(/[a-z]+/);
    const isUpperAlphaPresent = password.match(/[A-Z]+/);
    const isSpecialCharPresent = password.match(/[^\w]+/);
    if (
        !(
            isDigitPresent &&
            isSmallAlphaPresent &&
            isUpperAlphaPresent &&
            isSpecialCharPresent
        )
    ) {
        var msg = "Invalid password provided";
        if (!isDigitPresent) msg += ": digit not present";
        if (!isSmallAlphaPresent) msg += ": lowercase alphabet not present";
        if (!isUpperAlphaPresent) msg += ": uppercase alphabet not present";
        if (!isSpecialCharPresent) msg += ": special character not present";
        //TODO: set up diagnostic
        console.log(
            "Password regex not matched: Password is " + password + " " + msg
        );
        return sendResponse(401, msg, res);
    }

    if (!user_type_options.includes(user_type)) {
        return sendResponse(401, "Invalid User type", res);
    }

    var salt = bcryptjs.genSaltSync(10);
    var hashed_password = bcryptjs.hashSync(password, salt);

    let user_col = await db.collection("user");

    //TODO: this check is to be done when sending the otp email
    if (await user_col.findOne({ email: email })) {
        return sendResponse(401, "User with this email already exists", res);
    }

    let new_user_doc = {
        name: name,
        district: district,
        city: city,
        state: state,
        pincode: pincode,
        email: email,
        password: hashed_password,
        user_type: user_type,
    };
    let result = await user_col.insertOne(new_user_doc);

    return sendResponse(200, result, res);
});

//Send Email containing OTP
const sendEmailVerificationOTP=tryCatchWrapper(async(req,res)=>{
    const {email} = req.body;
    if(!email || email.length<1){
        return sendResponse(401,"No email provided",res)
    }
    if (!email.match(/\S+@\S+\.\S+/)) {
        //TODO: set up diagnostic
        console.log("Email regex not matched: Email is" + email);
        return sendResponse(401, "Invalid email provided", res);
    }

    let user_col = await get_db().collection("user");

    if (await user_col.findOne({ email: email })) {
        return sendResponse(401, "User with this email already exists", res);
    }
    let otp = generateOTP()

    //save the otp in the database
    let otp_col = await get_db().collection("otp")
    if(await otp_col.findOne({email:email})){
        await otp_col.deleteMany({email:email})
    }

    let result =await otp_col.insertOne({email:email,otp:bcryptjs.hashSync(otp, bcryptjs.genSaltSync(10)),created_at:new Date()})
    //let hashed_otp = bcryptjs.hashSync(otp,bcryptjs.genSaltSync(10))

    let status= await sendEmail(email,get_otp_template(email.match(/\S+(?=[\+,@])/),otp))

    if(status && result.insertedId){
        return res.status(200).json({success:true,message:"Email sent successfully"})
    }
    else if(!status){
        return res.status(400).json({success:false,message:"Error sending email"})
    }else{
        return res.status(400).json({success:false,message:"Error saving OTP in database"})
    }

});

//Verify the OTP sent
const verifyOTP=tryCatchWrapper(async(req,res,next)=>{
    const {otp,email} = req.body;
    if(!otp ){
        return sendResponse(401,"No OTP provided", res)
    }

    if(otp.length <6 || !otp.match(/\d{6}/)){
        return sendResponse(401,"Invalid OTP",res)
    }
    if(!email){
        return sendResponse(401,"No email provided",res)
    }

    if (!email.match(/\S+@\S+\.\S+/)) {
        //TODO: set up diagnostic
        console.log("Email regex not matched: Email is" + email);
        return sendResponse(401, "Invalid email provided", res);
    }

    let time_now = Date.now();

    let db= get_db()
    let otp_col = await db.collection('otp')
    let result = await otp_col.find({email:email}).sort({created_at:-1})
    let otp_results=[]
    let i=0;
    for await(const doc of result){
        otp_results[i] = doc;
        i++
    }
    if(otp_results.length<1){
        return res.status(401).json({success:false, message:"No valid OTP in the database for this email"})
    }
    if(bcryptjs.compareSync(otp,otp_results[0].otp)){
        let token = jwt.sign({data:email+"?"+Date.now()},process.env.JWT_SECRET,{expiresIn:"30m"})
        return res.status(200).json({success:true, message:"OTP authenticated successfully",token:token})
    }
    else{
        return res.status(401).json({success:false,message:"Incorrect OTP"})
    }

});

const checkIfEmailExistsAndSendOTP = tryCatchWrapper(async(req,res,next)=>{
    const {email} = req.body
    if(!email){
        return sendResponse(401,"No email provided",res)
    }

    if (!email.match(/\S+@\S+\.\S+/)) {
        //TODO: set up diagnostic
        console.log("Email regex not matched: Email is" + email);
        return sendResponse(401, "Invalid email provided", res);
    }

    let db = get_db()
    let users_col = await db.collection("user")
    let result = await users_col.findOne({email:email})
    if(result){    
        let otp = generateOTP()

        //save the otp in the database
        let otp_col = db.collection("otp")
        if(await otp_col.findOne({email:email})){
            await otp_col.deleteMany({email:email})
        }

        let result =await otp_col.insertOne({email:email,otp:bcryptjs.hashSync(otp, bcryptjs.genSaltSync(10)),created_at:new Date()})
        //let hashed_otp = bcryptjs.hashSync(otp,bcryptjs.genSaltSync(10))

        let status= await sendEmail(email,get_otp_template(email.match(/\S+(?=[\+,@])/),otp))

        let token=jwt.sign({data:email+(Date.now()/1000)},process.env.JWT_SECRET,{ expiresIn: '10m' })
        if(status && result.insertedId){
            //Note(458): "fp" stands for forgot password token
            return res.status(200).cookie("fptoken",token,{
                expires: new Date(Date.now() + 600),
                httpOnly: true,
                sameSite: "none",
                secure: true,
            }).json({success:true,message:"Email sent successfully"})
        }
        else if(!status){
            return res.status(400).json({success:false,message:"Error sending email"})
        }else{
            return res.status(400).json({success:false,message:"Error saving OTP in database"})
        }

    }else{
        return res.status(400).json({success:false, message: "User with entered email doesn't exist"})
    }
})


const resetPassword = tryCatchWrapper( async (req,res,next)=>{
    const {email, password} = req.body
    if(!email){
        return sendResponse(401,"No email provided",res)
    }

    if (!email.match(/\S+@\S+\.\S+/)) {
        //TODO: set up diagnostic
        console.log("Email regex not matched: Email is" + email);
        return sendResponse(401, "Invalid email provided", res);
    }
    if(!password){
        return sendResponse(401,"No password provided", res) 
    }
    const isDigitPresent = password.match(/\d+/);
    const isSmallAlphaPresent = password.match(/[a-z]+/);
    const isUpperAlphaPresent = password.match(/[A-Z]+/);
    const isSpecialCharPresent = password.match(/[^\w]+/);
    if (
        !(
            isDigitPresent &&
            isSmallAlphaPresent &&
            isUpperAlphaPresent &&
            isSpecialCharPresent
        )
    ) {
        var msg = "Invalid password provided";
        if (!isDigitPresent) msg += ": digit not present";
        if (!isSmallAlphaPresent) msg += ": lowercase alphabet not present";
        if (!isUpperAlphaPresent) msg += ": uppercase alphabet not present";
        if (!isSpecialCharPresent) msg += ": special character not present";
        //TODO: set up diagnostic
        console.log(
            "Password regex not matched: Password is " + password + " " + msg
        );
        return sendResponse(401, msg, res);
    }


    let user_col = await get_db().collection("user")
    let result = await user_col.updateOne({"email":email}, {$set: {"password":bcryptjs.hashSync(password, bcryptjs.genSaltSync(10))}} )
    if(result.modifiedCount ==1){
        return res.status(200).json({success: true, message: "Password reset successfully"})

    }
    else{
        //TODO: diagnostics
        console.log("password reset result is:", result)
        return res.status(400).json({success:false, message:"Password couldn't be reset. Please try again later"})
    }
})


module.exports = { ulogin, uregister,sendEmailVerificationOTP,verifyOTP,checkIfEmailExistsAndSendOTP,resetPassword };
