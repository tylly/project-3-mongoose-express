const mongoose = require('mongoose')

const activitySchema = require('./activity')

const destinationSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		images: String,
		schedule: String,
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
