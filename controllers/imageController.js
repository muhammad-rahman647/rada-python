const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const randomDir = Date.now();

      const dir = `images/${randomDir}`;

      fs.exists(dir, exist => {
         if (!exist) {
            return fs.mkdir(dir, error => cb(error, dir))
         }
         return cb(null, dir)
      });
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
   }
});

const fileFilter = (req, file, cb) => {
   if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
   ) {
      cb(null, true);
   } else {
      cb(null, false);
   }
};


const upload = multer({
   storage: storage,
   fileFilter: fileFilter
});

exports.uploadThree = upload.array('photos', 3);
exports.uploadOne = upload.single('image');