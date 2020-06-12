const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
   email: {
      type: String,
      required: [true, 'email is required.'],
   },
   password: {
      type: String,
      required: true,
   },
   passwordResetToken: String,
   passwordRestToken: Date,
}, {
   timestamps: true,
   toJSON: {
      virtuals: true
   },
   toObject: {
      virtuals: true
   }
});

adminSchema.virtual('users', {
   ref: 'User',
   localField: '_id',
   foreignField: '_admin',
});

adminSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   this.password = await bcrypt.hash(this.password, 12);
   next();
});

adminSchema.methods.comparePassword = async function (
   candidatePassword,
   userPassword
) {
   return await bcrypt.compare(candidatePassword, userPassword);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;