const joi = require('@hapi/joi');

exports.createUserValidation = joi.object().keys({
   email: joi.string().email(),
   name: joi.string(),
   password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
   companyName: joi.string(),
   _admin: joi.string()
});

exports.resetPasswordValidation = joi.object().keys({
   password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
   rePassword: joi.ref('password'),
   userId: joi.string(),
   token: joi.string()
});