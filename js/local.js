var Local=function (socket) {
    var game;
    var INTERVAL=300;
    var timer=null;
    //时间计数器
    var timeCount=0;

    //时间
    var time=0;

    //监听按键事件
    var bindKeyDown=function(){
        document.onkeydown=function(e){
            if(e.keyCode==38){      //上
                game.rotate();
                socket.emit('rotate');
            }else if(e.keyCode==37){//左
                game.left();
                socket.emit('left');
            }else if(e.keyCode==39){//右
                game.right();
                socket.emit('right');
            }else if(e.keyCode==40){//下
                game.down();
                socket.emit('down');
            }else if(e.keyCode==32){//空格
                game.fall();
                socket.emit('fall');

            }
        }

    };

    //随机生成一个方块种类
    var genarateType=function () {
        return Math.ceil(Math.random()*7)-1;
    };

    //生成一个随机旋转数
    var generateDir=function () {
        return Math.ceil(Math.random()*4)-1;
    };

    var move =function () {
        timeFunction();
       if(!game.down()) {
           game.fixed();
           socket.emit('fixed');
           var line=game.checkClear();

           //如果消行了，则增加分数
           if(line){
              game.addScore(line);
              socket.emit('line',line);

            //如果消行大于1，则给对方增加难度
              if(line>1){
                 var bottomLines= generateBottomLines(line);
                 socket.emit('bottomLines',bottomLines);
              }
           }


          var gameOver=game.checkGameOver();
          if(gameOver){
              game.gameOver(false);
              document.getElementById('remote_gameOver').innerHTML="恭喜你，你赢了";
              socket.emit('lost');
              stop();
          }else {
              var t=genarateType();
              var d=generateDir();
              game.performNext(t,d);
              socket.emit('next',{type:t,dir:d});
          }
       }else{
           socket.emit('down');
       }
    };

    //随机生成干扰行

    var generateBottomLines=function(lineNum){
        var lines=[];
        for(var i =0;i<lineNum;i++){
            var line=[];
            for(var j=0;j<10;j++){
                line.push(Math.ceil(Math.random()*2)-1);
            }
            lines.push(line);
        }
        return lines;
    };

    //计时函数
    var timeFunction=function () {
        timeCount=timeCount+1;
        if(timeCount==5){
            timeCount=0;
            time=time+1;
            game.setTime(time);
            socket.emit('time',time);
        }
    };

    var start=function(){
        var doms={
            gameDiv:document.getElementById('local_game'),
            nextDiv:document.getElementById('local_next'),
            timeDiv:document.getElementById('local_time'),
            scoreDiv:document.getElementById('local_score'),
            resultDiv:document.getElementById('local_gameOver')

        };
        game=new Game();
        var type=genarateType();
        var dir=generateDir();
        game.init(doms,type,dir);//初始化随机产生方块
        socket.emit('init',{type:type,dir:dir});


        bindKeyDown();
        var t=genarateType();
        var d=generateDir();
        game.performNext(t,d);//定时器开启前产生下一个方块
        socket.emit('next',{type:t,dir:d});

        timer=setInterval(move,INTERVAL);
    };
    
    //结束游戏
    var stop=function () {
        if(timer){
            clearInterval(timer);
            timer=null;
        }
        document.onkeydown=null;
    }
    //导出API
    socket.on('start',function(){

        document.getElementById('waiting').innerHTML='';
        start();
    });
    socket.on('lost',function(){
        game.gameOver(true);
        stop();
    });
    socket.on('leave',function(){
        document.getElementById('local_gameOver').innerHTML='对方掉线啦';
        document.getElementById('remote_gameOver').innerHTML='你掉线啦';
        stop();
    });
    socket.on('bottomLines',function (data) {
       game.addTailLines(data);
       socket.emit('addTailLines',data);
    });
};