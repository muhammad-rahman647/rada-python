const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendenceSchema = Schema({
   temperature: {
      type: String,
      required: true
   },
   date: {
      type: Date,
      default: Date.now
   },
   _employeeId: {
      type: Schema.Types.String,
      ref: 'Employee',
      required: true
   }
});

const Attendence = mongoose.model('Attendence', attendenceSchema);

module.exports = Attendence;