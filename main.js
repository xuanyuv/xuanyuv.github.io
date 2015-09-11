//	整个游戏控制
//	by chenxuan 20141207
var main=function (){
	this.setStage=function (){
		//	获得舞台大小
		this.stageWidth=this.stage.offsetWidth;
		this.stageHeight=this.stage.offsetHeight;
	}
	this.initWorld=function (){
		//	初始化游戏世界
		this.world=new CXWorld({
			stage:this.stage,
			width:this.stageWidth,
			height:this.stageHeight
		},{
			main:this
		});
	}
	this.initGame=function (){
		//	初始化游戏设置
		this.player=new PlayerPlane(this.world,0,0);
		this.player.setPosition(
			(this.stageWidth-this.player.width)/2,
			this.stageHeight-this.player.height
		);
		this.world.add(this.player);
	}
	this.initEnemyPlaneAdder=function (){
		this.enemyC[1]=true;
	}
	this.addEnemy_1=function (theWorld){
		if(this.enemyC[1]){
			this.enemyC[1]=false;

			//	创建敌机1
			var oneEnemy=new Enemy_1(this.world);
			oneEnemy.setPosition(Math.random()*(theWorld.stages.width-oneEnemy.width));
		
			//	设置敌机速度
			oneEnemy.speed=Math.round(Math.random()*4+2);
			//	设置得分
			oneEnemy.mark=Math.round(64/oneEnemy.speed);
			
			oneEnemy.addIn();

			var timer=new CXTime(theWorld);
			timer.setCount(600,(function (){
				this.enemyC[1]=true;
			}).bind(this));
			timer.start();
		}
	}
	this.worldFrameDo=function (theWorld){
		this.addEnemy_1(theWorld);

		//	判断主角飞机是否死亡
		if(!this.player.alive){
			var f;
			(f=this.gameOverDo)();
		}
	}
	this.gameRun=function (){
		//	开始游戏
		this.alive=true;
		this.world.add(this);
		this.world.start();
		
		trace("game is started");
	}
	this.gameStop=function (){
		this.alive=false;
		this.world.stop();
	}
	this.init=function (){
		//	整体初始化
		this.setStage();
		this.initWorld();
		this.initGame();
		this.initEnemyPlaneAdder();
	}
	this.gameOver=function (_f){
		this.gameOverDo=_f;
	}


	this.stageWidth=0;
	this.stageHeight=0;
	this.stage=document.getElementById("stage");
	this.world=null;
	this.alive=true;
	this.enemyC=[];
	this.gameOverDo=null;
	this.mark=0;
	this.init();
}


window.onload=function (){
	m=new main();

	m.stage.style.display="none";
	var buttonBox=document.getElementById("msgBox");
	var buttonOfGame=document.getElementById("button");
	buttonOfGame.onclick=function (){
		buttonBox.style.display="none";
		m.stage.style.display="block";
		m.gameRun();
	}
	m.gameOver(function (){
		m.gameStop();
		buttonBox.style.display="block";
		buttonOfGame.innerHTML=
			"游戏结束<br/>"+
			"得分: "+m.mark+
			"<br/>刷新页面重新游戏";
		buttonOfGame.onclick=null;
		m.stage.style.display="none";
	});
}