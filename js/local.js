var Local=function () {
    var game;
    var INTERVAL=200;
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
            }else if(e.keyCode==37){//左
                game.left();

            }else if(e.keyCode==39){//右
                game.right();

            }else if(e.keyCode==40){//下
                game.down();

            }else if(e.keyCode==32){//空格
                game.fall();
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
           var line=game.checkClear();
           if(line){
              game.addScore(line);
           }
          var gameOver=game.checkGameOver();
          if(gameOver){
              game.gameOver(false);
              stop();
          }else {
              game.performNext(genarateType(), generateDir());
          }
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
            if(time%10==0){
                game.addTailLines(generateBottomLines(1));
            }
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
        game.init(doms,genarateType(),generateDir());//初始化随机产生方块
        bindKeyDown();
        game.performNext(genarateType(),generateDir());//定时器开启前产生下一个方块
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
    this.start=start;

}