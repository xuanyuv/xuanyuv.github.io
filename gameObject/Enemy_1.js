//	敌机1
//	by chenxuan20141207
var Enemy_1=function (world){
	//	继承CXObject并绑定dom对象
	CXObject.call(this,world,document.createElement("img"));
	this.init=function (){
		this.dom.src="src/enemy_1.png";
		this.initAABB();
	}
	this.initAABB=function(){
		this.addAABB(16,26,12,10);
		this.addAABB(70,26,10,11);
		this.addAABB(5,34,86,17);
		this.addAABB(39,12,20,58);
		this.addAABB(47,82,9,12);
		this.addAABB(41,70,19,13);
	}
	this.fly=function(theWorld){
		//	让敌机飞
		this.y+=this.speed;
		this.setPosition();
		if(this.y>theWorld.stages.height+this.height){
			this.alive=false;
			this.removeDomFromStage();
		}
	}
	this.FrameDo=function (theWorld){
		this.fly(theWorld);
	}

	this.height=100;
	this.width=100;
	this.speed=2;
	this.mark=2;
	this.init();
}