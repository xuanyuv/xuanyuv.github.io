//	玩家飞机
//	by chenxuan 20141207
var PlayerPlane=function (world,x,y){
	//	继承CXObject并绑定dom对象
	CXObject.call(this,world,document.getElementById('PlayerPlane'));

	this.init=function (x,y){
		this.setPosition(x,y);
		this.initAABB();
	}
	this.initAABB=function (){
		//	设置碰撞箱
		this.addAABB(37,24,20,58);
		this.addAABB(31,45,33,13);
		this.addAABB(21,58,55,25);
		this.addAABB(11,72,79,12);
	}
	this.fly=function (direction){
		//	向某一个方向飞一段距离
		switch(direction){
			case "up":
				this.y-=this.speedY;
				break;
			case "down":
				this.y+=this.speedY;
				break;
			case "left":
				this.x-=this.speedX;
				break;
			case "right":
				this.x+=this.speedX;
				break;
		}
		this.setPosition();
	}
	this.FrameDo=function (theWorld){
	
		// 移动控制  
		if(theWorld.getKey(87)){
			this.fly("up");
		}
		if(theWorld.getKey(65)){
			this.fly("left");
		}
		if(theWorld.getKey(83)){
			this.fly("down");
		}
		if(theWorld.getKey(68)){
			this.fly("right");
		}

		if(theWorld.getKey(74)){
			//	发射子弹
			if(this.canShut){
				this.canShut=false

				//	生成子弹
				var oneBullet=new Bullet(theWorld);
				//	设置子弹速度
				oneBullet.speed=-9.2;
				
				oneBullet.setPosition(this.x+43,this.y-20);
				
				oneBullet.addIn();

				//	用定时器控制子弹发射的频率
				var timeCounter=new CXTime(theWorld);
				timeCounter.setCount(300,(function (){
					this.canShut=true;
				}).bind(this));
				timeCounter.start();

			}
		}

		// 检测飞机碰撞
		var elements=theWorld.worldElements;
		var len=elements.length;
		for(var i=0;i<len;i++){
			if(elements[i].AABBs&&elements[i]!=this){
				if(elements[i].isHit(this)){
					this.alive=false;
					break;
				}
			}
		}


	}

	//	键值
	//	w87 a65 s83 d68 j74

	this.width=100;
	this.height=100;
	this.speedY=2;	//	纵向飞行速度
	this.speedX=4.8;	//	横向飞行速度
	this.canShut=true;	//	控制子弹的发射
	this.init(x,y);
}