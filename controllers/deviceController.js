const fs = require('fs');
const {
   spawn
} = require('child_process');
const util = require('util');
const directoryCreator = util.promisify(fs.exists);
const moment = require('moment');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const Attendence = require('../models/attendence');

const promiseReplace = id => new Promise((resolves, rejects) => {
   resolves(id.replace(/[\[\]']+/g, ''));
   if (!id) {
      rejects('id not found.');
   }
});

const removeFile = dir => {
   fs.rmdir(`${dir}`, {
      recursive: true
   }, (err) => {
      if (err) {
         throw err;
      }

      console.log(`file is deleted!`);
   });
}

const createAttendence = (id, code, req, res) => {
   const attendence = new Attendence({
      _employeeId: id
   });
   attendence.temperature = req.body.temperature;
   attendence.save().then(() => {

      removeFile(req);
      if (code === 0) {
         res.status(200).send({
            status: 'success',
            data: {}
         });
      }

   }).catch(err => console.log(err));
}


exports.receiveRequest = catchAsync(async (req, res, next) => {

   const year = moment().year();
   const month = moment().month() + 1;
   const day = moment().date();

   const date = moment.utc(`${year}-${month}-${day}`, "YYYY-MM-DD");

   const randomDir = Date.now();
   const dir = `images/${randomDir}`;

   directoryCreator(dir).then(exist => {
      if (!exist) {
         fs.mkdir(dir, err => console.log(err));
      }
   });

   const filename = `employee-${Date.now()}.jpeg`;
   const directory = `${dir}/${filename}`;

   await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({
         quality: 100,
      })
      .toFile(directory);


   if (!req.body.userId || !req.body.temperature) {
      const error = new Error('Please provide the user ID');
      error.statusCode = 404;
      return next(error);
   }

   let employeeId;

   // const filePath = req.file.path;

   const python = spawn('python', [
      'inference.py',
      `${req.body.userId}`,
      `./${directory}`
   ]);

   python.stdout.on('data', function (data) {
      console.log('Pipe data from python script ...');
      employeeId = data.toString();
   });

   python.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);

      if (!employeeId) {
         const error = new Error('Please provide the user ID');
         error.statusCode = 404;
         return next(error);
      }

      // let attendece = false;

      promiseReplace(employeeId).then(uid => {
         id = uid.trim();

         if (id) {
            Attendence.findOne({
               _employeeId: id,
               date: {
                  $eq: date
               }
            }).then(docs => {
               if (!docs) {
                  return createAttendence(id, code, req, res);
               }
               docs.temperature = req.body.temperature;
               docs.markAttendence();
               docs.save().then((doc) => {
                  removeFile(dir);

                  if (code === 0) {
                     return res.status(200).send({
                        status: 'success',
                        data: {}
                     });
                  }
               }).catch(err => next(err));
            }).catch(err => next(err));
         }

      }).catch(err => console.log(err));

      // Attendence.findOne({
      //    _employeeId: id,
      //    date: new Date(year, month, date)
      // }).then(doc => {
      //    if (!doc) {
      //       return attendece = true;
      //    }
      //    console.log(doc);
      // }).catch(err => console.log(err));

      // send data to browse;
      if (code === 1) {
         return res.status(404).json({
            status: 'fail',
            data: {
               message: 'No found User!'
            }
         });
      }
   });

});