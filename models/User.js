const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		email: {
			type: String,
		},
		password: {
			type: String,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		wallet: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform(_, ret) {
				delete ret.password;
			},
			versionKey: false,
		},
	}
);

module.exports = mongoose.model("User", UserSchema);
