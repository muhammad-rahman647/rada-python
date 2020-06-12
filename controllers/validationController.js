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
                  password: req.body.password,
                  companyName: req.body.companyName
               }
            });
         }
         console.log('Hello');
         next();
      } catch (error) {
         console.log(error);
      }
   };
}