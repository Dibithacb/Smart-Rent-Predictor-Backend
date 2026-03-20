// models/propertySchema.js
const mongoose = require('mongoose');

// Location Sub-schema
const locationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  emirate: {
    type: String,
    required: true,
    enum: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain']
  }
}, { _id: false });

// Features Sub-schema
const featuresSchema = new mongoose.Schema({
  furnished: {
    type: Boolean,
    default: false
  },
  view: {
    type: String,
    enum: ['waterfront', 'marina', 'city', 'sea', 'golf', 'garden', 'pool', 'none'],
    default: 'none'
  },
  floor: {
    type: Number,
    min: 0
  },
  privatePool: {
    type: Boolean,
    default: false
  },
  beachFront: {
    type: Boolean,
    default: false
  },
  garden: {
    type: Boolean,
    default: false
  },
  golfView: {
    type: Boolean,
    default: false
  },
  cityView: {
    type: Boolean,
    default: false
  },
  seaView: {
    type: Boolean,
    default: false
  },
  maidRoom: {
    type: Boolean,
    default: false
  },
  studyRoom: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Main Property Schema
const propertySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  predictedPrice: {
    type: Number,
    min: 0
  },
  predicted_rent: {
    type: Number,
    min: 0
  },
  priceTrend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  type: {
    type: String,
    required: true,
    enum: ['apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'duplex']
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sqft: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: locationSchema,
    required: true
  },
  amenities: [{
    type: String,
    enum: [
      'pool', 'gym', 'parking', 'security', 'balcony', 'spa',
      'garden', 'beach-access', 'maid-room', 'concierge', 'children-area',
      'study-room', 'private-garden', 'bbq-area', 'jacuzzi', 'sauna',
      'elevator', 'central-ac', 'double-glazing', 'built-in-wardrobes'
    ]
  }],
  images: [{
    type: String,
    required:true
    // validate: {
    //   validator: function(v) {
    //     // FIXED: More flexible URL validation that accepts query parameters
    //     return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i.test(v);
    //   },
    //   message: 'Invalid image URL format. Must be a valid image URL (jpg, jpeg, png, webp, gif, bmp)'
    // }
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    min: 0,
    default: 0
  },
  popularity: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  features: {
    type: featuresSchema,
    default: {}
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'pending'],
    default: 'available'
  },
  listedDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
propertySchema.index({ 'location.emirate': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ 'location.area': 1 });
propertySchema.index({ rating: -1 });
propertySchema.index({ popularity: -1 });
propertySchema.index({ status: 1 });

// Text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.area': 'text'
}, {
  weights: {
    title: 5,
    description: 3,
    'location.area': 4
  }
});

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0
  }).format(this.price);
});

// Virtual for price per sqft
propertySchema.virtual('pricePerSqft').get(function() {
  if (this.sqft > 0) {
    return Math.round(this.price / this.sqft);
  }
  return 0;
});

propertySchema.pre('save', async function () {

  this.updatedAt = Date.now();

  if (!this.id) {
    const prefix = this.location.emirate.substring(0, 3).toUpperCase();

    const count = await mongoose.model('Property').countDocuments({
      'location.emirate': this.location.emirate
    });

    this.id = `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;