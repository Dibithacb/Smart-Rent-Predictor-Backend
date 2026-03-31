const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone:{
        type: String
    },
    password:{
        type:String,
        required:true,
        min:6
    },
    role:{
        type:String,
        enum:['admin','user','agent'],
        default: 'user'
    },
    status:{
        type:String,
        default:'active'
    },
    favorites: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        }],
        default: [] // 👈 Set default empty array
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    created_at:{
        type:Date,
        default:Date.now
    }    
})

module.exports=mongoose.model('users',userSchema)