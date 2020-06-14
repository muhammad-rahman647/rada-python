exports.validation = (schema, renderView) => {
   return async (req, res, next) => {
      try {
         const {
            error,
            value
         } = schema.validate(req.body);
         if (error) {
            // console.log(error);
            //       const { details } = error; 
            //  const message = details.map(i => i.message).join(',');
            return res.render(renderView, {
               pageTitle: 'Add User',
               bg_color: '',
               email: req.user.email,
               _admin: req.user._id,
               hasError: true,
               errors: error.details,
               user: {
                  email: req.body.email,
                  name: req.body.name,
                  password: req.body.password,
                  companyName: req.body.companyName
               }
            });
         }
         next();
      } catch (error) {
         console.log(error);
      }
   };
}

exports.validation1 = (schema, renderView) => {
   return async (req, res, next) => {
      try {
         const {
            error,
            value
         } = schema.validate(req.body);
         if (error) {
            // console.log(error);
            //       const { details } = error; 
            //  const message = details.map(i => i.message).join(',');
            return res.render(renderView, {
               pageTitle: 'Reset Password',
               userId: req.body.userId,
               resetToken: req.body.token,
               errors: error.details
            });
         }
         next();
      } catch (error) {
         console.log(error);
      }
   };
}