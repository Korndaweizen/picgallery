$quality="medium";
$qualityMode="";
$qualityTimer=null;
$qualityTimerInterval=30; //Seconds 30 is default
$backgroudDLrunning=false;
$inbetweenPicDL=false;

function changeQualityMode(){
    console.log("Quality Settings are being changed:")
    if($("#radio_ownsrcset").is(":checked"))
      $qualityMode="Quality_Screensize";
    if($("#radio_qtpt").is(":checked"))
      $qualityMode="Quality_Throughput";
    if($("#radio_qtptotf").is(":checked"))
      $qualityMode="Quality_Throughput_OTF";  
    if($("#radio_uncompressed").is(":checked"))
      $qualityMode="Quality_Manual";  
    if($("#radio_large").is(":checked"))
      $qualityMode="Quality_Manual";
    if($("#radio_xlarge").is(":checked"))
      $qualityMode="Quality_Manual"; 
    if($("#radio_medium").is(":checked"))
      $qualityMode="Quality_Manual"; 
    if($("#radio_small").is(":checked"))
      $qualityMode="Quality_Manual"; 
    sendLog("Changed_Quality_Mode "+$qualityMode + " ServerIP " + $server);
    setQuality();
};

function setQuality() {
    clearInterval($qualityTimer);
    console.log("Quality Settings are being changed:")
    if($qualityMode=="Quality_Screensize")
      setQualityByScreenSize();
    if($qualityMode=="Quality_Throughput"){
      getTptBackground();
      $qualityTimer = setInterval(getTptBackground, $qualityTimerInterval*1000);
    }

    //if($qualityMode=="Quality_Throughput_OTF")
    //  getTptOTF();   

    if($("#radio_uncompressed").is(":checked"))
      $quality="uncompressed";    
    if($("#radio_xlarge").is(":checked"))
      $quality="xlarge";
    if($("#radio_large").is(":checked"))
      $quality="large";
    if($("#radio_medium").is(":checked"))
      $quality="medium";
    if($("#radio_small").is(":checked"))
      $quality="small";
    if($qualityMode=="Quality_Manual"){
      sendLog("Set_New_Quality "+$quality+ " Mode "+$qualityMode + " ServerIP " + $server);
    }
};

function setQualityByScreenSize() {
    console.log("screen.Width: "+screen.width);
    $quality="uncompressed";
    if (viewportWidth<= 2048)
      $quality="xlarge";
    if (viewportWidth<= 1024)
      $quality="large";
    if (viewportWidth<= 640)
      $quality="medium";
    if (viewportWidth<= 320)
      $quality="small";
    sendLog("Set_New_Quality "+$quality+ " Mode "+$qualityMode + " Width " + viewportWidth + " Height "+ viewportHeight + " ServerIP " + $server);  
};

function getTptBackground() {
  console.log("getTptBackground");
  if($pictureDLrunning==false && $backgroudDLrunning==false ){
    $inbetweenPicDL=false;
    $backgroudDLrunning=true;
    getTpt($server+"images/1mb.jpg", 1018).then(function(speed) {
      var throughput = speed[1].toFixed(2);
      if($inbetweenPicDL==false ){
        setQualityByTpt(throughput);
      }
      $backgroudDLrunning=false;
    }).catch(function(error) {
      console.log("getTpt Error: "+String(error));
      $backgroudDLrunning=false;
    });
  } else {
    console.log('Background dl failed cause conditioning');
  }
};

/**
 * Pings a url.
 * @param  {String} url
 * @param  {Number} multiplier - optional, factor to adjust the ping by.  0.3 works well for HTTP servers.
 * @return {Promise} promise that resolves to a ping (ms, float).
 */
function getTptOTF(imgUrl,imgNo) {
  return new Promise(function(resolve, reject) {

    var request;
    var imgSize;
    var image;  

    request = $.ajax({
      type: "HEAD",
      url: imgUrl,
      success: function () {
        imgSize=request.getResponseHeader("Content-Length")/1000;
        console.log("Size is " + imgSize + " KB");
        console.log(request);
        getTpt(imgUrl, imgSize).then(function(retval) {
          var throughput=retval[1].toFixed(2);
          image=retval[0];
          var loadTime= retval[2];
          sendQualityLog("Current_Quality "+$quality+ " Mode "+$qualityMode + " LoadTime: " + loadTime + " ImgSize: " + request.getResponseHeader("Content-Length") + " Throughput_In_KB_s " + throughput + " Picture: " + imgNo +" ServerIP " + $server);
          if($qualityMode=="Quality_Throughput_OTF"){
            setQualityByTpt(throughput);
          }
          resolve(image);
        }).catch(function(error) {
          reject("setQualitybyTptOTF Error: "+String(error));
        });
      }
    });

    // Set a timeout for 10mins.
    var timeoutMs=600000; //ms
    var timeoutMinutes=timeoutMs/60000
    setTimeout(function() { reject(Error('Timeout: '+timeoutMinutes+'min')); }, timeoutMs);
  });
};

function setQualityByTpt(throughput){
  var quality=$quality;
  if(throughput>=5600)
    $quality="uncompressed";
  if(throughput<5600)
    $quality="xlarge";
  if(throughput<1230)
    $quality="large";
  if(throughput<330)
    $quality="medium";
  if(throughput<140)
    $quality="small";
  if (quality != $quality)
    sendLog("Set_New_Quality "+$quality+ " Mode "+$qualityMode + " Throughput_In_KB_s " + throughput + " ServerIP " + $server);
  if (quality == $quality)
    sendLog("Quality_did_not_change "+$quality+ " Mode "+$qualityMode + " Throughput_In_KB_s " + throughput + " ServerIP " + $server);
};