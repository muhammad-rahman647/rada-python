const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = Schema({
   email: {
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
   passwordResetToken: String,
   passwordRestToken: Date,
   _admin: {
      type: Schema.Types.ObjectId
   }
}, {
   timestamps: true,
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

const User = mongoose.model('User', userSchema);

module.exports = User;