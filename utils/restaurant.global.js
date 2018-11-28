
var _pageSize = 7;//分页,每页显示条目
var _imgsizes = 20971520;//图片大小最大为20M

const STATUS_OK = 200;
const SUCCESS = 'success';
const FAIL = 'fail';
const TEN = 10;

//小程序码相关开始
const CODE_MENU_PAGE_PATH = 'pages/details/details';
const CODE_TABLE_PREFIX = 'TAB-';
const CODE_BOX_PREFIX = 'BOX-';
//小程序码相关结束

const HTTP_PROTOCOL = 'https:';
const WS_PROTOCOL = 'wss:';

// const DOMAIN = '192.168.0.177:8888';

 // const DOMAIN = '192.168.0.109:8080';
const DOMAIN = 'www.qghls.com';

const CONTEXT = '/restaurant/';

const HTTP_BASEURL = HTTP_PROTOCOL +'//'+ DOMAIN + CONTEXT;

const WS_BASEURL = WS_PROTOCOL +'//'+ DOMAIN + CONTEXT;

//客户ID,供后台管理人员使用
const CUSTOMERID = 1;


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
	alert('网络故障');
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

function globalGetToday(seperator,date_now=null){
	if(date_now == null)
	date_now = new Date();
	var year = date_now.getFullYear();
	var month = date_now.getMonth()+1 < 10 ? "0"+(date_now.getMonth()+1) : (date_now.getMonth()+1);
	var date = date_now.getDate() < 10 ? "0"+date_now.getDate() : date_now.getDate();
	
	return [year,month,date].join(seperator);
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

/*$(function(){
    //得到当前时间
	var date_now = new Date();
	//得到当前年份
	var year = date_now.getFullYear();
	//得到当前月份
	var month = date_now.getMonth()+1 < 10 ? "0"+(date_now.getMonth()+1) : (date_now.getMonth()+1);
	//得到当前日子
	var date = date_now.getDate() < 10 ? "0"+date_now.getDate() : date_now.getDate();
	//设置input标签的max属性
	$("#datetime").attr("max",year+"-"+month+"-"+date);
	
	$("#datetimes").attr("max",year+"-"+month+"-"+date);
})*/
//})

function alert(e){
    $("body").append('<div id="msg"><div id="msg_top">温馨提示<span class="msg_close">×</span></div><div id="msg_cont">'+e+'</div><div class="msg_close" id="msg_clear">确定</div></div>');
    $(".msg_close").click(function (){
    $("#msg").remove();
    });
}


// function getURLParams(){
// 	var finalRes = '';
// 	try{
// 		var queryString = window.location.search;
// 		var regex = /[?]([\d\D]*?)=([\d\D]*?)(?:&|$)/;
// 		finalRes = queryString.match(regex);
// 		console.log(finalRes);
// 	}catch(e){
// 		console.log(e);
// 		finalRes = '';
// 	}
// 	return finalRes;
// 	
// }

