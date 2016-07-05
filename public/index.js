$(document).ready(function () {
  //On Click Submission

  //Validate form input for valid desk.com site name

  $( "#submitSite" ).click(function(evt) {
    //Prevent Default of changing pages
    evt.preventDefault();
    var siteName = $("#siteName").val();
    window.location = "/desk?site=" + siteName;
  });
});
