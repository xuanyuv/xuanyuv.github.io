//	by chenxuan 20140519

//	bind函数
Function.prototype.bind=function (_this){
	var _f=this;
	return function (){
		return _f.apply(_this,arguments);
	}
}

//	中途输出函数
trace=function (_val){
	try{
		console.log(_val);
	}catch(e){}
	return _val;
}
