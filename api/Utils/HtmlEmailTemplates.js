function get_otp_template(email,otp){
return `
<!DOCTYPE HTML>
<html>
    <body style="background-color:#ebebed;font-family:'Verdana', sans-serif;font-size:16px;">

        <div style="margin:20px 0vw 20px;height:90vh;background-color:#ffffff;border-radius:12px;padding-bottom:12px">

            <p style="margin:0px;background-image:linear-gradient(#001e80,#4545bf );border-radius:12px 12px 0px 0px;font-size:2rem;padding-top:1rem;font-weight:bold;color:#ffffff;text-align:center;height:10vh">
            Drone Connect
            </p>

            <table style="margin:0px 12px">
                <tbody>
                    <tr>
                        <td><h3 style="font-size:30px;margin-bottom:8px">Greetings ${email}, </h3>
                            <p style="padding:0px; margin:0px;color:#001e80">You are just one step away from joining us.</p>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <p style= "margin-bottom:2px">Mentioned below is your One Time Password(OTP) for verifying your email. <span style ="font-weight:bold">OTP is valid only for 5 minutes</span>. </p> 
                            <p style= "margin-top:0px">Please do not share your OTP with anyone else.</p>
                        </td>
                    </tr>

                    <tr >
                        <td style="padding-top:18px">
                            <p style="font-weight:bold; font-size:30px; text-align:center;color:#001e80">${otp}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style="margin-top:100px">Regards,<br> <span style="color:#001e80;font-weight:bold">Drone Connect</span></p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
</html>
        `;
}

module.exports={get_otp_template}


