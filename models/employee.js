const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
   name: {
      type: String,
      required: true,
      unique: true
   },
   dir: String,
   photos: [String],
   _user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   _userId: {
      type: Schema.Types.String,
      ref: 'User',
      required: true
   },
   trainId: {
      type: String,
      unique: true,
      required: true
   }
}, {
   timestamps: true,
   // toJSON: {
   //    virtuals: true
   // },
   // toObject: {
   //    virtuals: true
   // }
});

// employeeSchema.virtual('attendence', {
//    ref: 'Attendence',
//    localField: 'trainId',
//    foreignField: '_employeeId',
//    justOne: false,
// });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;