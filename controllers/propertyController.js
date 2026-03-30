const Property=require('../models/propertySchema')

//Get all properties
const getAllProperties=async (req,res) => {
    try {
        const properties=await Property.find({})
        .sort({createdAt:-1})
        res.status(200).json({
            success:true,
            count:properties.length,
            data:properties
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:'Error fetching properties',
            error:error.message
        })
    }
}

//Get sigle property by id
const getPropertyById=async (req,res)=>{
    try {
        const propertyId=req.params?.id
        const property=await Property.findById(propertyId)
        if(!property){
            return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
        }

        res.status(200).json({
            success:true,
            data:property
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'Error in fetching property',
            error:error.message
        })
    }
}



// Search properties
const searchProperties=async (req,res)=>{
    try {
        const {q,emirate,type,minPrice,maxPrice,bedrooms}=req.query
        const filter={}
        //Text search
        if (q){
            filter.$text={$seach:q};
        }

        //other filters
        if (emirate) filter['location.emirate']=emirate
        if (type) filter.type=type
        if (bedrooms) filter.bedrooms=parseInt(bedrooms)

        //Price range
        if (minPrice || maxPrice){
            filter.price={}
            if(minPrice) filter.price.$gte=parseInt(minPrice)
            if (maxPrice) filter.price.$lte = parseInt(maxPrice);
        }

        const properties=await Property.find(filter)
        .sort(q ? {score:{$meta:'textScore'}}:{createdAt:-1})
    } catch (error) {
        console.error('Error searching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching properties',
      error: error.message
    });
    }
}
    
// Create new property (admin only)
const createProperty=async (req,res)=>{
    try {
        console.log('Received property data:',req.body)

        // Check if property with same ID already exists
        const existingProperty = await Property.findOne({ id: req.body.id });
        
        if (existingProperty) {
            console.log('⚠️ Property ID already exists:', req.body.id);
            return res.status(409).json({
                success: false,
                message: `Property with ID "${req.body.id}" already exists. Please use a different ID.`,
                existingProperty: {
                    id: existingProperty.id,
                    title: existingProperty.title
                }
            });
        }
        
        //Convert string numbers to actual numbers
        const propertyData={
            ...req.body,
            price:parseFloat(req.body.price),
            predictedPrice:req.body.predictedPrice ? parseFloat(req.body.predictedPrice) : undefined,
            bedrooms:parseInt(req.body.bedrooms),
            bathrooms:parseInt(req.body.bathrooms),
            sqft:parseInt(req.body.sqft),
            rating:req.body.rating ? parseFloat(req.body.rating) :0,
            reviews:parseInt(req.body.reviews) || 0

        }
        const property=await Property.create(propertyData)
        res.status(201).json({
            success:true,
            message:'Property created successfully',
            data:property
        })
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Error in creating Property",
        error: error.message,
        stack: error.stack
    })
    }
}

//update property
const updateProperty=async (req,res)=>{
    try {
         const propertyId = req.params?.id;
        const property=await Property.findByIdAndUpdate(
            propertyId,
            req.body,
            {new:true,runValidators:true}
         )

         if(!property){
            return res.status(404).json({
                success:false,
                message:'Property not found'
            })
         }

         res.status(200).json({
            success:true,
            message:'Property updated successfully',
            data:property
         })
    } catch (error) {
        console.error('Error updating property:',error)
        res.status(500).json({
            success:false,
            message: 'Error updating property',
            error: error.message
        })
    }
}

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params?.id;
    
    const property = await Property.findOneAndDelete(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};

module.exports={createProperty,getAllProperties,getPropertyById,updateProperty,deleteProperty,searchProperties}