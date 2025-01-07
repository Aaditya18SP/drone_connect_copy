function errorHandler(err,req,res,next){
    try{
        //log the error here

    }catch(e){
        console.log("File error:",e)
    }
    console.log(err)
    return res.status(500).json({message:"Apologies, something went wrong! Please try again later"})
}

module.exports= errorHandler
