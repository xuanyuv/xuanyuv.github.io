//	游戏世界类
//	by chenxuan20141206
var CXWorld=function (stageSettings,otherData){
	this.runWorld=function (){
		//	世界循环刷新
		var len=this.worldElements.length;
		var nextWorldElements=[];
		while(len--){
			var oneWorldElement=this.worldElements[len];
			oneWorldElement.worldFrameDo(this);
			if(oneWorldElement.alive){
				nextWorldElements.push(oneWorldElement);
			}
		}
		this.worldElements=nextWorldElements;
		var lenNext=this.nextFrameElements.length;
		while(lenNext--){
			this.worldElements.push(this.nextFrameElements[lenNext]);
		}
		this.nextFrameElements=[];
		// console.log(1);
	}
	this.start=function (){
		//	开始世界运作
		var _this=this;
		this.canRun=true;
		this.keyboard.listen();
		(function (){
			if(!_this.canRun){
				return;
			}
			_this.runWorld();
			setTimeout(arguments.callee,_this.frameTime);
		})();
	}
	this.stop=function (){
		//	停止世界运作
		this.canRun=false;
		this.keyboard.unlisten();
	}
	this.getKey=function (keyCode){
		//	获取按键状态
		return this.keyboard.getKey(keyCode);
	}
	this.init=function (stageSettings,otherData){
		//	初始化
		this.keyboard=new CXKeyboard();
		this.stages=stageSettings;
		this.otherData=otherData;
	}
	this.add=function (obj){
		//	添加游戏单位到游戏世界中
		this.nextFrameElements.push(obj);
	}
	this.clean=function (){
		//	清空游戏世界中的游戏单位
		this.worldElements=[];
	}

	this.canRun=false;
	this.frameTime=1000/60;
	this.worldElements=[];
	this.nextFrameElements=[];
	this.keyboard=null;
	this.stages=null;
	this.otherData=null;
	this.init(stageSettings,otherData);
}