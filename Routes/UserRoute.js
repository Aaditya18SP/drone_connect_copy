const router = require('express').Router()
const reqAuth = require("../Middlewares/AuthMiddleware.js")
const {ulogin, uregister, sendEmailVerificationOTP,verifyOTP, checkIfEmailExistsAndSendOTP,resetPassword} = require("../Controllers/UserController.js")

router.post("/login",ulogin)
router.post("/register", uregister)
router.post("/sendotp",sendEmailVerificationOTP)
router.post("/verifyotp",verifyOTP)
router.post("/fpcheckemail",checkIfEmailExistsAndSendOTP)
router.post("/resetpassword",reqAuth,resetPassword)
module.exports =router
