const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = Schema({
   email: {
      type: String,
      required: [true, 'name is required']
   },
   name: {
      type: String,
      required: [true, 'email is required.'],
   },
   password: {
      type: String,
      required: true,
   },
   companyName: {
      type: String,
      required: true
   },
   resetPasswordToken: String,
   resetPasswordExpires: Date,
   _admin: {
      type: Schema.Types.ObjectId
   }
}, {
   timestamps: true,
   toJSON: {
      virtuals: true
   },
   toObject: {
      virtuals: true
   }
});

userSchema.virtual('employees', {
   ref: 'Employee',
   localField: '_id',
   foreignField: '_user',
   justOne: false,
   count: true
});

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   this.password = await bcrypt.hash(this.password, 12);
   next();
});

userSchema.methods.comparePassword = async function (
   candidatePassword,
   userPassword
) {
   return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.generatePasswordRest = function () {
   const resetToken = crypto.randomBytes(20).toString('hex');

   this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

   this.resetPasswordExpires = Date.now() + 3600000;

   return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;