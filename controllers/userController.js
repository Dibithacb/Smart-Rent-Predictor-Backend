const User=require('../models/userSchema')
const bcrypt=require('bcrypt')
const generateToken=require('../utils/generateToken')

const register = async (req, res) => {
    try {

        const { name, email, phone, password, role } = req.body

        // check existing user
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        // hash password
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // create user
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role // schema default will apply if not provided
        })

        await user.save()

        res.status(201).json({
            message: "User registered successfully",
            user
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error.message
        })
    }
}
const login=async (req,res) => {
    try {
        if(!req.body){
            return res.status(400).json({error:"Login details cannot be empty"})
        }
        const {email,password}=req.body
        if((!email) || (!password)){
            return res.status(400).json({error:"Login details cannot be empty"})
        }
        const user=await User.findOne({email:email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const isValid=await bcrypt.compare(password,user.password)
        if(!isValid){
            return res.status(404).json({message:"Invalid password"})
        }
        console.log(isValid)
        //user authenticated, create token
        let payload={user:email,role:user.role}
        const token=generateToken(payload)
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"lax",
            maxAge:24*60*60*1000
        })
        res.status(200).json({message:"Login successful",
            user:{
                email:user.email,
                name:user.name,
                role:user.role,
                id:user._id
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
    }
}

const checkUser=async (req,res)=>{
    return res.status(200).json({message:"User validated"})
}

const logout=async (req,res) => {
    try {
          // Clear the cookie that stores the session/token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'strict',
      path: '/'
    });

    // Clear the cookie that stores the session ID (if using sessions)
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // If you're using sessions, destroy the session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }

    console.log('User logged out successfully');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
    } catch (error) {
           console.error('❌ Logout error:', error);
            return res.status(500).json({
            success: false,
            message: 'Error during logout',
            error: error.message
            });
    }
}

//Add to favorites
const addFavorite = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userEmail = req.user?.user;
        
        console.log('User email:', userEmail);
        console.log('Property ID:', propertyId);
        
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: 'Property ID is required'
            });
        }

        // Find user
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User found:', user.email);
        console.log('Current favorites (before):', user.favorites);

        // FIX: Handle null/undefined favorites
        if (!user.favorites) {
            user.favorites = []; // Initialize empty array if null/undefined
        }

        // Convert to strings for comparison (safe now because we ensured it's an array)
        const favoriteStrings = user.favorites.map(id => id ? id.toString() : '');
        console.log('Favorite strings:', favoriteStrings);

        // Check if already in favorites
        if (favoriteStrings.includes(propertyId)) {
            console.log('Property already in favorites');
            return res.status(400).json({
                success: false,
                message: 'Property already in favorites'
            });
        }

        // Add to favorites
        user.favorites.push(propertyId);
        await user.save();

        console.log('Updated favorites:', user.favorites);

        res.status(200).json({
            success: true,
            message: 'Added to favorites'
        });

    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to favorites',
            error: error.message
        });
    }
};

//Remove from favorites
const removeFavorite = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userEmail = req.user?.user;
        
        console.log('🔍 Removing favorite:', { propertyId, userEmail });

        // Find user
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Ensure favorites is an array
        if (!user.favorites) {
            user.favorites = [];
        }

        // Filter out null values and the property to remove
        const beforeCount = user.favorites.length;
        user.favorites = user.favorites.filter(id => 
            id !== null && id.toString() !== propertyId
        );
        const afterCount = user.favorites.length;

        // Save changes
        await user.save();

        res.status(200).json({
            success: true,
            message: afterCount < beforeCount ? 'Removed from favorites' : 'Property was not in favorites',
            removed: afterCount < beforeCount,
            favoritesCount: afterCount
        });

    } catch (error) {
        console.error('❌ Error removing favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from favorites',
            error: error.message
        });
    }
};

//check if property is in user's favorites
const checkFavorite=async (req,res) => {
    try {
        const {propertyId} =req.params
        const userEmail=req.user?.user
        const user=await User.findOne({email:userEmail})

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

         // FIX: Handle null/undefined favorites
        if (!user.favorites) {
            user.favorites = [];
        }

        const isFavorite=user.favorites && user.favorites.includes(propertyId)
        res.status(200).json({
            success: true,
            isFavorite
        });

    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({
        success: false,
        message: 'Error checking favorite',
        error: error.message
        });
    }
}

//Get all favorites for user
const getFavorites=async (req,res) => {
    try {
        const userEmail=req.user?.user
        const user=await User.findOne({email:userEmail})
        .populate('favorites')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            favorites: user.favorites || []
        });

    } catch (error) {
            console.error('Error getting favorites:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting favorites',
                error: error.message
            });
    }
}

//GET favorite count
const getFavoriteCount=async (req,res) => {
    try {
        const userEmail=req.user?.user

        if(!userEmail){
            return res.status(401).json({
                success:false,
                message:'User not authenticated'
            })
        }

        const user=await User.findOne({email:userEmail})
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found'
            })
        }

        //get count by filtering null values
        const favorites=user.favorites?.filter(id=>id!==null) || [];
        const count=favorites.length

        res.status(200).json({
            success:true,
            count
        })
    } catch (error) {
        console.error('Error getting favorite count:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting favorite count',
            error: error.message
        });
    }
}

module.exports={register,login,checkUser,logout,addFavorite,removeFavorite,checkFavorite,getFavorites,getFavoriteCount}

