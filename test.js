function toBase64Url(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}
toBase64Url('pngToBase64/cross_red.png', function(base64Url){
  console.log('base64Url : ', base64Url);
});


/*
this is memo
num_array = [0,1,2,3,4,5]
print(num_array[0::2])
result...[0, 2, 4]

*/
