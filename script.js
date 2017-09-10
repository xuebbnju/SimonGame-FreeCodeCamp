$('window').ready(function () {
  
var AudioContext=window.AudioContext||window.webkitAudioContext||false;
if(!AudioContext){
 alert("抱歉，您的浏览器不支持web audio API!")
}else{

var audioCtx = new AudioContext();
var frequencies=[293.66,440.00,  523.25,349.23];
var errOsc = audioCtx.createOscillator();
errOsc.type='triangle';
 errOsc.frequency.value = 196;
  errOsc.start(0.0);
  var errNode = audioCtx.createGain();
    errOsc.connect(errNode);
    errNode.gain.value = 0;
    errNode.connect(audioCtx.destination);
 var vol=0.5;
 var ramp=0.05;   
var game={};
game.init=function () {

	this.lastPush=-1;
	this.list=[];
	this.lock=false;
	this.count=0;
	this.click=0;
}
game.reset=function(){
	game.init();
	this.strict=false;

}

var oscillators=frequencies.map(function(f){
   var osc=audioCtx.createOscillator();
   osc.type='sine';
   osc.frequency.value=f;
   osc.start(0.0);
   return osc;
});

var gainNodes=oscillators.map(function(o){
  var g=audioCtx.createGain();
  o.connect(g);
  g.connect(audioCtx.destination);
  g.gain.value=0;
  return g;

});

function playTone(num){
	 gainNodes[num].gain
        .linearRampToValueAtTime(vol, audioCtx.currentTime + ramp);
      game.currPush = $('#'+num);
      game.currPush.addClass('light');

}
function stopTones(){
	 if(game.currPush)
        game.currPush.removeClass('light');
      gainNodes.forEach(function(g){
        g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + ramp);
      });
      game.currPush = undefined;
      game.currOsc = undefined;
}
function playErr(){
	errNode.gain.linearRampToValueAtTime(vol,audioCtx.currentTime+ramp);
}
function stopErr(){
	errNode.gain.linearRampToValueAtTime(0,audioCtx.currentTime+ramp);

}
function addStep(){
	
	game.list.push(Math.floor(Math.random()*4));
	console.log(game.list);
	game.timeStep=setTimeStep(game.count++);
	
	game.handlPlay=setTimeout(playList,500);
}
function setTimeStep(num){

	 var tSteps = [1250 , 1000 , 750, 500 ];
      if (num < 4)
        return tSteps[0];
      if (num < 8)
        return tSteps[1];
      if (num < 12)
        return tSteps[2];
      return tSteps[3];
}
function clearTimers(){
	clearInterval(game.handList);
	clearInterval(game.handlFlash);
	clearTimeout(game.handlPlay);
	clearTimeout(game.toFlash);
}
function playList(){
	$('#count').text((game.count<10?'0':'')+game.count).removeClass('countOff');
    var i=0;
    game.lock=true;
	game.handList=setInterval(function(){
     playTone(game.list[i]);
     game.handlPlay=setTimeout(stopTones,game.timeStep/2-10);
	 i++;
    if(i==game.count){
    	clearInterval(game.handList);
    	game.lock=false;
    	$('.push').removeClass('unclickable');
    	game.handlPlay=setTimeout(notifyError,5*game.timeStep);

    }
   




	},game.timeStep)
}

function notifyError(obj){
		game.click=0;
   $('.push').removeClass('clickable');
   game.lock=true;
   playErr();
   if(obj){
   	obj.addClass('light');
   }
   game.handlPlay=setTimeout(function(){
   stopErr();
    if(obj){
   obj.removeClass('light');
   }
   	
   	game.toList = setTimeout(function(){
          if(game.strict)
            gameStart();
            else
              playList();
        },1000);



   },1000);


	flashMessage('!!',2)
}
function notifyWin(){
		game.click=0;
 var cnt=0;
 game.handList=setInterval(function(){
   playTone(game.lastPush);
   game.handlPlay=setTimeout(stopTones() ,80);
   cnt++;
   if(cnt==8){
   	clearInterval(game.handList);
   }



 },160)

  flashMessage('**',2);
}
function pushColor(obj){
    if(!game.lock){
    	
    	

    	clearTimeout(game.handlPlay);
      var id=parseInt( obj.attr('id'));
      console.log('id:'+game.click);
       console.log('game.list:'+game.list[game.click]);
      if(id==game.list[game.click]&&game.click<game.count){
      	console.log('game.count:'+game.count);
      	game.click++;
        playTone(id);
        game.lastPush=id;
        if(game.click<game.count){
        game.handlPlay=setTimeout(notifyError,5*game.timeStep);

        }else if(game.click==20){
        	$('.push').removeClass('clickable');
        	  game.handlPlay=setTimeout(notifyWin,game.timeStep);
        }else{
        	$('.push').removeClass('clickable');
        	game.click=0;
        	addStep();
        }
        

      }else{

      	  
          notifyError(obj);
      }




    }

}




$('.push').mousedown(function(){
      pushColor($(this));
    });

$('*').mouseup(function(e){
      e.stopPropagation();
      if(!game.lock)
        stopTones();
    });
function gameStart(){

    clearTimers();
	stopErr();
	stopTones();
	$('#count').text('--').removeClass('countOff');
    flashMessage('--',1);
    game.init();
    game.handlPlay=setTimeout(addStep,1000);
}

function flashMessage(msg,num){
  $('#count').text(msg);
  var flash=function(){
  	$('#count').addClass('countOff');
    game.toFlash=setTimeout(function(){

    	$('#count').removeClass('countOff');
    },250);	
  }
  var cnt=0;
  flash();
  game.handlFlash=setInterval(function(){
    flash();
    cnt++;
    if(cnt===num){
    	clearInterval(game.handlFlash);
    }

  },500);
}



function toggleStrict(){
	console.log(1);
	$('#circle').toggleClass('strictOn');
	game.strict=!game.strict;
}

$('#switch').on('click',function () {
  
    $(this).toggleClass('open');
    if($('#switch').hasClass('open')){
    
      $('button').removeClass('unclickable');
      $('#count').removeClass('countOff');
      $('#start').click(gameStart);
      $('#strict').click(toggleStrict);

    }else{
      clearTimers();
      game.reset();
      stopTones();
      stopErr();
       $('#count').text('--');
      $('#count').addClass('countOff');
     $('#circle').removeClass('strictOn');
       $('.push').addClass('unclickable');
        $('#start').off('click');
        $('#strict').off('click');
         $('button').addClass('unclickable');




    }

  });


game.reset();
}


  
});