const mongoose = require('mongoose')

const activitySchema = require('./activity')

const { Schema, model } = mongoose;

const destinationSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		images: String,
		schedule: String,
		lat: Number,
		lon: Number,
		population: Number,
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		activities: [activitySchema],
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Destination', destinationSchema)
