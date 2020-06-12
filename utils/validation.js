const joi = require('@hapi/joi');

exports.createUserValidation = joi.object().keys({
   email: joi.string().email(),
   password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
   companyName: joi.string(),
   _admin: joi.string()
});