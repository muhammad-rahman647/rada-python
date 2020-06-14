const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
   name: {
      type: String,
      required: true,
      unique: true
   },
   photos: [String],
   _user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
   }
}, {
   timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;