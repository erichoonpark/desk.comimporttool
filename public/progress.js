/**
 * TextProgress
 * Copyright (c) 2015
 * by Jonatan Olsson (https://www.jonatanolsson.se)
 */

var currentProgress = 0;

function atest (elemSelector, range) {
   $(elemSelector).data("animated", false).textProgress(range.value);
}



var testSetInterval = setInterval(function(){
  if(currentProgress >= 100){
    clearInterval(testSetInterval);
    // $.get("/importLog", function(data) {
    //   console.log("importLog: "+ data[0]);
    // });
    alert("We are done");
  } else {
    $.get("/progressnumber", function(data) {
      console.log("data: "+ data);
      currentProgress = data;
      atest('.html',{value:data});
    })
    console.log("currentProgress: " + currentProgress);
  }
}, 500)
