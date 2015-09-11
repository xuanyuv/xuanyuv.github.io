//	游戏单位类
//	by chenxuan20141206
var CXObject=function (world,dom){
	this.init=function (world,dom){
		this.dom=dom;
		this.world=world;
		this.setDomAbs();
	}
	this.setDomAbs=function (){
		//	设置dom对象为绝对定位
		this.dom.style.position="absolute";
		this.setDomXY();
	}
	this.setDomXY=function (){
		//	设置dom对象的left和top位置
		this.dom.style.left=this.x+"px";
		this.dom.style.top=this.y+"px";
	}
	this.setPosition=function (_x,_y){
		//	设置x,y坐标
		this.x=(typeof _x==="undefined")?this.x:_x;
		this.y=(typeof _y==="undefined")?this.y:_y;
		this.setDomXY();
	}
	this.worldFrameDo=function (world){
		//	游戏世界被运行时调用该函数
		this.resetAABB();
		this.FrameDo(world);
	}
	this.FrameDo=function (world){
		//	游戏世界刷新时也刷新该函数
		//	继承CXObject需要重写该函数
	}
	this.addAABB=function (_iX,_iY,_width,_height){
		//	添加一个碰撞箱
		var oneAABB=new AABB(this.x,this.y,_width,_height);
		oneAABB.insideX=_iX;
		oneAABB.insideY=_iY;
		this.AABBs.push(oneAABB);
	}
	this.resetAABB=function (){
		//	更新碰撞箱位置
		var len=this.AABBs.length;
		for(var i=0;i<len;i++){
			this.AABBs[i].x=this.x;
			this.AABBs[i].y=this.y;
		}
	}
	this.isHit=function (_obj){
		//	检测CXObject碰撞
		var len=this.AABBs.length;
		if(!_obj.AABBs){
			return false;
		}
		var lenObj=_obj.AABBs.length;
		// console.log(len,lenObj);
		for(var i=0;i<len;i++){
			for(var j=0;j<lenObj;j++){
				if(this.AABBs[i].checkHit(_obj.AABBs[j])){
					return true;
				}
			}
		}
		return false;
	}
	this.addDomToStage=function (_stage){
		_stage.appendChild(this.dom);
	}
	this.addIn=function (){
		this.world.add(this);
		this.addDomToStage(this.world.stages.stage);
	}
	this.removeDomFromStage=function (){
		try{
			this.dom.parentNode.removeChild(this.dom);
		}catch(e){}
	}

	this.x=0;
	this.y=0;
	this.alive=true;
	this.dom=null;
	this.AABBs=[];
	this.world=null;
	this.init(world,dom);
}