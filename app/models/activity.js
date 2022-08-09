const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
		name: {
			type: String,
			required: true,
		},
		address: String,
		schedule: String,
		priority: Number,
		images: String,
		
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: false,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = activitySchema
