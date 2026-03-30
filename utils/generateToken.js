const jwt=require('jsonwebtoken')

const generateToken=(payload)=>{
    return jwt.sign({payload:payload},process.env.JWT_SECRET_KEY,{
        expiresIn:"3d"
    })
}

module.exports=generateToken