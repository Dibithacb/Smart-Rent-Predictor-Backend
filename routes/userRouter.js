const express=require('express')
const { register, login,checkUser,logout,addFavorite,removeFavorite,checkFavorite,getFavorites,getFavoriteCount } = require("../controllers/userController");
const validateToken = require('../middlewares/authMiddleware');

const userRouter=express.Router()

//User routes
userRouter.post('/register',register)
userRouter.post('/login',login)
userRouter.get('/checkUser',validateToken,checkUser)
userRouter.post('/logout',validateToken,logout)

//Favorite routes(Protected)
userRouter.post('/addFavorite',validateToken,addFavorite)
userRouter.delete('/removeFavorite/:propertyId',validateToken,removeFavorite)
userRouter.get('/checkFavorite/:propertyId',validateToken,checkFavorite)
userRouter.get('/favorites',validateToken,getFavorites)
userRouter.get('/favoriteCount',validateToken,getFavoriteCount)

module.exports=userRouter