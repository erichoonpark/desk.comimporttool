$(document).ready(function () {
  //On Click Submission

  //Validate form input for valid desk.com site name

  $( "#submit" ).click(function(evt) {
    evt.preventDefault();
    //Variable List
    var input = document.getElementById("csv-file").files[0];
    //Check if customer or company radio
    if(document.getElementById('companyRadio').checked) {
      //Papa Parse Module to parse data
      Papa.parse(input, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
          $.ajax({
            type:"POST",
            data: JSON.stringify(results),
            url:"/company",
            contentType: "application/json",
            dataType: "JSON",
            success: successRedirect()
          });
        }
      });
    }
    else if(document.getElementById('customerRadio').checked) {
      Papa.parse(input, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
          //Ajax Post back to our server
          console.log(results.data);
          $.ajax({
            type:"POST",
            data: JSON.stringify(results),
            url:"/customer",
            contentType: "application/json",
            dataType: "JSON",
            success: successRedirect()
          });
        }
      });
    }
    function successRedirect(){
      window.location = "/progress.html"
    }

  });
});
