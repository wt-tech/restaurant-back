// 感觉好像没必要使用vue
var websocket = null;
const HEART_PACKET = 0;//心跳包.

$(function(){
	options();
});


function options(){//就是为了获取cookie 没有其他作用
	simpleAxios.get('').then(function(res){
		console.log(res);
		console.log(res.headers);
	}).catch(function(){
		
	}).finally(function(){
		createWebsocket();
	});
}

function createWebsocket(){
	if(websocket == null || websocket.readyState===WebSocket.CLOSED){
		var url = WS_BASEURL + 'notifyHandler';
		if ('WebSocket' in window) {
			websocket = new WebSocket(url);
		} 
		else if ('MozWebSocket' in window) {
			websocket = new MozWebSocket(url);
		} 
		else {
			websocket = new SockJS(url);
		}
		websocket.onopen = onOpen;
		websocket.onmessage = onMessage;
		websocket.onerror = onError;
		websocket.onclose = onClose;
	}
}

/**
 * 连接建立成功后,就一直发送心跳包.
 */
function onOpen(open){
	sendHeartPacket();
}

/**
 * 出现异常时,主动
 */
function onError(err){
	console.log(err);
}

/**
 * 连接断开后,每隔一分钟会尝试重新建立连接
 */
function onClose(reason){
	setTimeout("createWebsocket()",60*1000);
}

function onMessage(message){
	console.log(message);
	let notify = JSON.parse(message.data);
	saveMessage2SessionStorage(notify);
	updateLeftMenuNotifyCounts(notify);
	playNotifyVoice(notify);
}


function playNotifyVoice(notify){
	var src = "resource/new-order.ogg";
	var voice = new Audio(src);
	voice.play();
}

/**
 * 每隔一分钟发送一次心跳包
 */
function sendHeartPacket(){
	if(websocket != null && websocket.readyState===WebSocket.OPEN){//socket处于open状态
		try{
			websocket.send(HEART_PACKET);
		}catch(excpetion){
			alert('发送心跳包失败,请刷新页面,重新连接');
		}
		setTimeout("sendHeartPacket()", 60*1000);
	}
}

/**
 * 
 */
function saveMessage2SessionStorage(notify){
	var numbers = getSpecificNotifyNumbers(notify);
	window.sessionStorage.setItem(notify.type,++numbers);	
}

/**
 * toBeChangedElements一定会包含两个元素,一个是span父元素,另一个是span下面的超连接a子元素.
 */
function updateLeftMenuNotifyCounts(notify){
	var reserves = ['boxReserve','banquetReserve'];
	var orders = ['codeScanOrder','tableReserve'];
	var numbers = getSpecificNotifyNumbers(notify);
	var totalNumbers = 0;
	if(reserves.indexOf(notify.type) != -1){
		totalNumbers = 
			getSpecificNotifyNumbers({type : 'boxReserve'}) + 
			getSpecificNotifyNumbers({type : 'banquetReserve'});
	}else{
		totalNumbers = 
			getSpecificNotifyNumbers({type : 'codeScanOrder'}) + 
			getSpecificNotifyNumbers({type : 'tableReserve'});
	}
	
	var leftDocument = window.frames['leftFrame'].document;
	var toBeChangedElements = leftDocument.getElementsByClassName(notify.type);
	console.log(toBeChangedElements);
	decorateLabelWithNumbers(toBeChangedElements[0],totalNumbers);
	decorateLabelWithNumbers(toBeChangedElements[1],numbers);
	
}

function decorateLabelWithNumbers(label,numbers){
	if(numbers === 0){
		label.classList.add('hide');
	}else{
		label.classList.remove('hide');
		label.innerHTML = numbers;
	}
}



function getSpecificNotifyNumbers(notify){
	var orderType = notify.type;
	var counts = window.sessionStorage.getItem(orderType);
	if(!counts)//null undefined 0 '' 均直接赋值 0
		counts = 0;
	else{
		counts = parseInt(counts);
		if(isNaN(counts))
			counts = 0;
	}
	return counts;
}

function resetSpecificNotifyNumbers(notify){
	var orderType = notify.type;
	var numbers = getSpecificNotifyNumbers(notify);
	window.sessionStorage.setItem(orderType,0);
	updateLeftMenuNotifyCounts(notify);
}