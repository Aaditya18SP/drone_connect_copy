const jwt = require("jsonwebtoken")
const reqAuth= (req,res,next)=>{
    try{

        let token = req.get("Authorization")
        if(!token){
            return res.status(400).json({message: "No token provided"})
        }

        token = token.match(/(?<=Bearer\s*)\S+/)[0]
        console.log("Token is:")
        console.log(token)

        let result = jwt.verify(token,process.env.JWT_SECRET)
        if(result){
            next()
        }
        else{
            return res.status(401).json({})
        }
    }catch(err){
        //TODO : dignostic
        console.log("Error while authorizing the request " )
        console.log(err)
        return res.status(401).json({message:"Couldn't validate the request due to some internal error."})
    }
}


module.exports = reqAuth
