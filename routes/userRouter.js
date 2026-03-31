const express=require('express')
const { register, login,checkUser,logout,addFavorite,removeFavorite,checkFavorite,getFavorites,getFavoriteCount,forgotPassword,resetPassword,verifyResetToken } = require("../controllers/userController");
const validateToken = require('../middlewares/authMiddleware');

const userRouter=express.Router()

//User routes
userRouter.post('/register',register)
userRouter.post('/login',login)
userRouter.get('/checkUser',validateToken,checkUser)
userRouter.post('/logout',validateToken,logout)
userRouter.post('/forgot-password',forgotPassword)
userRouter.post('/reset-password',resetPassword)
userRouter.get('/verify-reset-token/:token',verifyResetToken)

//Favorite routes(Protected)
userRouter.post('/addFavorite',validateToken,addFavorite)
userRouter.delete('/removeFavorite/:propertyId',validateToken,removeFavorite)
userRouter.get('/checkFavorite/:propertyId',validateToken,checkFavorite)
userRouter.get('/favorites',validateToken,getFavorites)
userRouter.get('/favoriteCount',validateToken,getFavoriteCount)

module.exports=userRouter