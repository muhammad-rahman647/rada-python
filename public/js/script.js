function previewImages() {

   var preview = document.querySelector('#preview');

   if (this.files) {
      [].forEach.call(this.files, readAndPreview);
   }

   function readAndPreview(file) {

      // Make sure `file.name` matches our extensions criteria
      if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
         return alert(file.name + " is not an image");
      } // else...

      var reader = new FileReader();

      reader.addEventListener("load", function () {
         var image = new Image();
         image.height = 300;
         image.title = file.name;
         image.src = this.result;
         preview.appendChild(image);
      });

      reader.readAsDataURL(file);

   }

}

document.querySelector('#file-input').addEventListener("change", previewImages);

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();

$('#datepicker').datepicker({
   uiLibrary: 'bootstrap4',
   minViewMode: 1,
   autoclose: true,
   startDate: new Date(year, month, '01'), //set it here
   endDate: new Date(year + 1, month, '31')
});