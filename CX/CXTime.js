//	定时类
//	by chenxuan20141207
var CXTime=function (theWorld){
	this.worldFrameDo=function (theWorld){

		//	开始增加时间
		this.time+=theWorld.frameTime;

		if(this.time>this.countTime){
			//	超过设定时间后执行设定函数
			var f;
			(f=this.timeUpDo)();
			this.time=0;

			//	定时器类型为1的话 , 则为一次性定时器
			//	一次性定时器超过设定时间后自动从游戏世界中分离
			if(this.type==1){
				this.alive=false;
			}
		}
	}
	this.setCount=function (time,_f){
		//	设置定时的时间和超时时执行的函数
		this.countTime=time;
		this.timeUpDo=_f;
	}
	this.start=function (){
		//	开始计时
		this.world.add(this);
	}
	this.init=function (theWorld){
		//	定时器初始化
		this.world=theWorld;
	}

	
	this.time=0;
	this.countTime=0;
	this.timeUpDo=null;
	this.world=null;
	this.alive=true;
	this.type=1;
	this.init(theWorld);
}