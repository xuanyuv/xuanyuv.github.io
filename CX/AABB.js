//	AABB盒子碰撞模型类 碰撞箱
//	by chenxuan20141206
var AABB=function (_x,_y,_w,_h){
	this.checkHit=function (_OtherAABBObj){
		//	检测碰撞
		if(this.isInside(_OtherAABBObj)){
			return true;
		}
		if(_OtherAABBObj.isInside(this)){
			return true;
		}
		return false;
	}
	this.isInside=function (_OtherAABBObj){
		//	检测该AABB对象的点是否在_OtherAABBObj内
		var pointList=this.getPointAABB();
		var len=pointList.length;
		for(var i=0;i<len;i++){
			var pX=pointList[i][0];
			var pY=pointList[i][1];
			// console.log(pX,pY);
			if(
				pX<=_OtherAABBObj.x+_OtherAABBObj.width&&
				pX>=_OtherAABBObj.x&&
				pY<=_OtherAABBObj.y+_OtherAABBObj.height&&
				pY>=_OtherAABBObj.y
			){
				return true;
			}
		}
		return false;
	}
	this.getPointAABB=function (){
		//	获得该AABB对象所有构成的点 , 返回点的数组
		return [
			[this.getX()+this.width,this.getY()],
			[this.getX(),this.getY()],
			[this.getX(),this.getY()+this.height],
			[this.getX()+this.width,this.getY()+this.height]
		];
	}
	this.getX=function (){
		return this.x+this.insideX;
	}
	this.getY=function (){
		return this.y+this.insideY;
	}
	this.init=function (_x,_y,_w,_h){
		//	初始化
		this.x=_x;
		this.y=_y;
		this.width=_w;
		this.height=_h;
	}

	this.x=0;
	this.y=0;
	this.insideX=0;
	this.insideY=0;
	this.width=0;
	this.height=0;
	this.init(_x,_y,_w,_h);
}