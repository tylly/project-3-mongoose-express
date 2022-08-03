const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
		name: {
			type: String,
			required: true,
		},
		address: String,
		schedule: String,
		priority: Number,
		
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = activitySchema
