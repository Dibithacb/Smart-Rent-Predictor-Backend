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
        const { id } = req.params;
        const updateData = req.body;
        
        console.log('🔍 Updating property ID:', id);
        console.log('📦 Received update data:', JSON.stringify(updateData, null, 2));
        
        // Check if property exists
        const existingProperty = await Property.findById(id);
        if (!existingProperty) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        // Prepare update data to match the schema
        const mappedData = {};
        
        // Basic fields
        if (updateData.title !== undefined) mappedData.title = updateData.title;
        if (updateData.description !== undefined) mappedData.description = updateData.description;
        if (updateData.price !== undefined) mappedData.price = updateData.price;
        if (updateData.predictedPrice !== undefined) mappedData.predictedPrice = updateData.predictedPrice;
        if (updateData.priceTrend !== undefined) mappedData.priceTrend = updateData.priceTrend;
        if (updateData.type !== undefined) mappedData.type = updateData.type; // Schema uses 'type', not 'propertyType'
        if (updateData.bedrooms !== undefined) mappedData.bedrooms = updateData.bedrooms;
        if (updateData.bathrooms !== undefined) mappedData.bathrooms = updateData.bathrooms;
        if (updateData.sqft !== undefined) mappedData.sqft = updateData.sqft;
        if (updateData.rating !== undefined) mappedData.rating = updateData.rating;
        if (updateData.reviews !== undefined) mappedData.reviews = updateData.reviews;
        if (updateData.status !== undefined) mappedData.status = updateData.status;
        
        // Handle location (schema expects lat, lng, area, emirate)
        if (updateData.location) {
            mappedData.location = {
                lat: updateData.location.lat || existingProperty.location.lat,
                lng: updateData.location.lng || existingProperty.location.lng,
                area: updateData.location.area || existingProperty.location.area,
                emirate: updateData.location.emirate || existingProperty.location.emirate
            };
        }
        
        // Handle amenities
        if (updateData.amenities !== undefined) {
            mappedData.amenities = updateData.amenities;
        }
        
        // Handle images
        if (updateData.images !== undefined) {
            mappedData.images = updateData.images;
        }
        
        // Handle features - match the featuresSchema
        if (updateData.features) {
            mappedData.features = {};
            
            // Map frontend fields to schema fields
            if (updateData.features.furnished !== undefined) 
                mappedData.features.furnished = updateData.features.furnished;
            
            // Map view (frontend) to appropriate schema fields
            const viewType = updateData.features.view;
            if (viewType) {
                switch(viewType) {
                    case 'waterfront':
                        mappedData.features.waterfront = true;
                        break;
                    case 'sea':
                        mappedData.features.seaView = true;
                        break;
                    case 'city':
                        mappedData.features.cityView = true;
                        break;
                    case 'golf':
                        mappedData.features.golfView = true;
                        break;
                    case 'garden':
                        mappedData.features.garden = true;
                        break;
                    case 'pool':
                        mappedData.features.pool = true;
                        break;
                    default:
                        mappedData.features.view = viewType;
                }
            }
            
            // Map floor
            if (updateData.features.floor !== undefined) 
                mappedData.features.floor = updateData.features.floor;
            
            // Handle other features
            if (updateData.features.maidRoom !== undefined) 
                mappedData.features.maidRoom = updateData.features.maidRoom;
            if (updateData.features.studyRoom !== undefined) 
                mappedData.features.studyRoom = updateData.features.studyRoom;
            if (updateData.features.privatePool !== undefined) 
                mappedData.features.privatePool = updateData.features.privatePool;
            if (updateData.features.beachFront !== undefined) 
                mappedData.features.beachFront = updateData.features.beachFront;
        }
        
        // Update updatedAt timestamp
        mappedData.updatedAt = new Date();
        
        console.log('📝 Mapped data for update:', JSON.stringify(mappedData, null, 2));
        
        // Update property
        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { $set: mappedData },
            { 
                new: true,           // Return updated document
                runValidators: true  // Run schema validation
            }
        );
        
        console.log('✅ Property updated successfully');
        
        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty
        });
        
    } catch (error) {
        console.error('❌ Error updating property:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value',
                field: Object.keys(error.keyPattern)[0]
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating property',
            error: error.message
        });
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