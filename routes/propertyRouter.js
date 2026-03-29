const express=require('express')
const validateToken = require('../middlewares/authMiddleware')
const {createProperty,getAllProperties,getPropertyById,updateProperty,deleteProperty} = require('../controllers/propertyController')
const propertyRouter=express.Router()

//add property to cart- Todo
//propertyRouter.post('/addtoCart',validateToken,addToCart)

//Add property to database
propertyRouter.post('/addProperty',createProperty)

//Get all properties
propertyRouter.get('/getProperties',getAllProperties)

//Get property by Id
propertyRouter.get('/getProperty/:id',getPropertyById)


//Update Property by id
propertyRouter.put('/updateProperty/:id',updateProperty)

//deletye property ny id
propertyRouter.delete('/deleteProperty/:id',deleteProperty)

module.exports=propertyRouter