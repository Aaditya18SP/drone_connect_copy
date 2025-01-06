function generateOTP(){
    let idx = 0;
    let OTPlength = 6;
    let otp = ""
    while(idx <6){
        otp +=Math.floor(Math.random()*10)
        idx++
    }
    return otp;

}

module.exports = generateOTP
