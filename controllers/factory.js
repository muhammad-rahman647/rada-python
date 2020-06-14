const catchAsync = require('../utils/catchAsync');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.forgotPasswordOne = (Model, schemaType, renderView) =>
   catchAsync(async (req, res, next) => {
      const {
         email
      } = req.body;

      if (!email) {
         return res.render(`${renderView}/forgot-password`, {
            pageTitle: 'Forgot Password',
            error_msg: 'Please provide the email address....'
         })
      }

      const doc = await Model.findOne({
         email: email,
      });

      if (!doc) {
         const error = new Error('Something Wrong...')
         return next(
            error
         );
      }

      const resetToken = doc.generatePasswordRest();
      await doc.save({
         validateBeforeSave: false,
      });

      console.log(doc);

      try {
         const restURL = `${req.protocol}://${req.get(
        'host'
      )}/${schemaType}/resetPassword/${resetToken}`;

         const message = `Forget your password Submit patch request with new password and confirmPassword to: ${restURL}.\nIf you didn't forget your password, please ignore this email!`;

         const msg = {
            to: doc.email,
            from: 'info@rada.com',
            subject: 'Your password rest token (valid for 10 min)',
            text: message,
            html: `<p>${message}</p>`,
         };

         await sgMail.send(msg);

         req.flash('success_msg', 'Succesfully send to your email...');
         res.redirect(`/${renderView}/login`);
      } catch (err) {
         doc.resetPasswordToken = undefined;
         doc.resetPasswordExpires = undefined;
         await doc.save({
            validateBeforeSave: false,
         });

         return next(
            err
         );
      }
   });

exports.resetPasswordOne = (Model, renderView, redirectView) =>
   catchAsync(async (req, res, next) => {
      const {
         token,
         userId
      } = req.body;
      console.log(req.body);

      const doc = await Model.findOne({
         _id: req.body.userId,
         resetPasswordToken: token,
         resetPasswordExpires: {
            $gt: Date.now()
         },
      });

      console.log(doc);

      if (!doc) {
         return res.render(renderView, {
            userId: userId,
            error_msg: 'Token is not verified....',
            resetToken: token,
         });
      }

      doc.password = req.body.password;
      doc.resetPasswordToken = undefined;
      doc.resetPasswordExpires = undefined;
      await doc.save();

      req.flash('success_msg', 'Successfully updated...');
      res.redirect(redirectView);
   });