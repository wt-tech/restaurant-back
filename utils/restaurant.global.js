
var _pageSize = 7;//分页,每页显示条目
var _imgsizes = 20971520;//图片大小最大为20M

const STATUS_OK = 200;
const SUCCESS = 'success';
const FAIL = 'fail';
const TEN = 10;


const HTTP_PROTOCOL = 'http:';
const WS_PROTOCOL = 'ws:';

const DOMAIN = '192.168.0.177:8888';
// const DOMAIN = '192.168.0.109:8080';
// const DOMAIN = 'www.qghls.com';

const CONTEXT = '/restaurant/'

const HTTP_BASEURL = HTTP_PROTOCOL +'//'+ DOMAIN + CONTEXT;

const WS_BASEURL = WS_PROTOCOL +'//'+ DOMAIN + CONTEXT;



//新建axios实例,普通form表单
var simpleAxios = axios.create({

	baseURL : HTTP_BASEURL,
    timeout : 60000,
    withCredentials: true, // 允许携带cookie
    headers:{
        'Content-type': 'application/x-www-form-urlencoded'
    }
});
//axios实例,携带文件上传
var fileAxios = axios.create({

	baseURL : HTTP_BASEURL,
    timeout : 60000,
    withCredentials: true, // 允许携带cookie
    headers:{
        'Content-type': 'multipart/form-data'
    }
});
//axios实例,json发送数据
var jsonAxios = axios.create({
	baseURL : HTTP_BASEURL,
    timeout : 60000,
    withCredentials: true, // 允许携带cookie
    headers:{
        'Content-type': 'application/json'
    }
});


 function backEndExceptionHanlder(res,message=null){
	if(!!message){
		alert(message);
		return;
	}
	if(res.status==STATUS_OK && res.data.status == FAIL){//后端的GloblalExceptionHandler抛出的错误信息
		var errors = res.data.errors;
		var tips = res.data.tips;
		alert(!!errors?errors:tips);
	}else
		alert('未知错误');
}

function unknownError(err){
	alert('未知错误');
}


/**
 * 获取object的key属性的值
 * 若不存在该属性,或该属性为null均返回空字符串
 */
function getValue(object,key){
	var value = object;
	var properties = key.split('.');
	
	try{
		for(var tempProperty of properties){
			value = value[tempProperty];
		}
	}catch(err){
		value = null;
	}
	return value==null?'':value;
}

/**
 * 对字符串类型的日期时间简单处理
 * 返回日期部分
 */
function getDateOfDateTime(dateTime){
	if(dateTime == null || typeof dateTime != 'string')
		return '';
	if(dateTime.length <= TEN)
		return dateTime;
	return dateTime.substr(0,TEN);
}

/**
 * 根据数组内部元素的id(如果有)定位索引.
 */
Array.prototype.indexOfByElementId = function(elementId){
	var index = -1;//找到的索引
	this.some(function(element,indax,that){
		if(element.id == elementId){
			index = indax;
			return true;
		}
		return false;
	});
	return index;
}


Array.prototype.remove = function(elementId){
	var result = false;
	var index = this.indexOfByElementId(elementId); 
	if(index != -1){
		this.splice(index,1);
		result = true;
	}
	return result;
}


Date.prototype.format = function (format) {
    var date = {
         "M+": this.getMonth() + 1,
         "d+": this.getDate(),
         "h+": this.getHours(),
         "m+": this.getMinutes(),
         "s+": this.getSeconds(),
         "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
     };
     if (/(y+)/i.test(format)) {
         format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
     }
     for (var k in date) {
         if (new RegExp("(" + k + ")").test(format)) {
             format = format.replace(RegExp.$1, RegExp.$1.length == 1
            ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
         }
     }
     return format;
 }

