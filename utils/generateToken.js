const jwt=require('jsonwebtoken')

const generateToken=(payload)=>{
    return jwt.sign({payload:payload},process.env.JWT_SECRET_KEY,{
        expiresIn:"15m"
    })
}

module.exports=generateToken