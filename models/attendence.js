const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const attendenceSchema = new Schema({
  date: {
    type: Date,
    default: function () {
      const year = moment().year();
      const month = moment().month() + 1;
      const day = moment().date();

      const date = moment.utc(`${year}-${month}-${day}`, 'YYYY-MM-DD');
      return date;
    },
  },
  checkInTime: [
    {
      time: Date,
      temperature: String,
    },
  ],
  checkOutTime: [
    {
      time: Date,
      temperature: String,
    },
  ],
  count: {
    type: Number,
    default: -1,
  },
  _employeeId: {
    type: Schema.Types.String,
    ref: 'Employee',
    required: true,
  },
});

attendenceSchema.pre('save', function (next) {
  if (this.count === -1) {
    this.checkInTime.push({
      time: Date.now(),
      temperature: this.temperature,
    });
    this.count += 1;
  }
  this.temperature = undefined;
  next();
});

attendenceSchema.methods.markAttendence = function () {
  if (this.count % 2 === 0) {
    this.checkOutTime.push({
      time: new Date(),
      temperature: this.temperature,
    });
    this.count += 1;
  } else if (this.count % 2 === 1) {
    this.checkInTime.push({
      time: new Date(),
      temperature: this.temperature,
    });
    this.count += 1;
  }
};

const Attendence = mongoose.model('Attendence', attendenceSchema);

module.exports = Attendence;
