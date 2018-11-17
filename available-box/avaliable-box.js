Vue.component('vtd',{
	props : ['box'],
	template : `<td></td>`
});

$(function() {

	var boxReserve = new Vue({
		el: '#boxes',
		data: {
			rawAvaliableBoxList: [],
			colsPerRow: 5, //table每行显示的列个数,
			selectedDate : null,
			launchButtonNotAvaliable: [0, 2],
			supperButtonNotAvaliable: [1, 2],
			loadingComplete : false,
		},

		created: function() {
			this.selectedDate = globalGetToday('-');
			this.getAvaliableBox();
		},

		computed: {
			
			imgSizeStyle : function(){
				var app = this;
				return 	'width :' + 100/app.colsPerRow + '%;' + 'height :' + 100/app.colsPerRow + '%;';
			},
			
			twoDimensionBoxList: function() {
				var app = this;
				return changeArrayTo2DimensionalArray(
					app.rawAvaliableBoxList.map(function(item, index) {
						
						var launchBtnAvaliable = app.launchButtonNotAvaliable.indexOf(item.reserveStatus) == -1;
						var supperBtnAvaliable = app.supperButtonNotAvaliable.indexOf(item.reserveStatus) == -1;
						
						return {
							
							id: item.id,
							roomName: item.roomName,
							roomNumber: item.roomNumber,
							roomSize: item.roomSize,
							boxURL: getValue(item, 'boximage.0.url'),
							launchButtonAvaliable: launchBtnAvaliable,
							supperButtonAvaliable: supperBtnAvaliable
						}
					}),
					app.colsPerRow
				);
			}
		},


		methods: {
			
			getAvaliableBox: function() {
				var app = this;
				var url = 'box/listnullbox?reservationsStartTime=';
				var selectedDate = app.selectedDate;
				app.loadingComplete = false;
				simpleAxios.get(url + selectedDate).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.processRawAvaliableBoxList(res.data.boxs);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {
					console.log(app.loadingComplete);
					app.loadingComplete = true;
					console.log(app.loadingComplete);
				});
			},

			processRawAvaliableBoxList: function(boxList) {
				var app = this;
				app.rawAvaliableBoxList = boxList;
			},

			goToReservePage : function(reserveTime,id,rowIndex,colIndex){
				var app = this;
				var index = rowIndex * app.colsPerRow + colIndex;
				var box = app.rawAvaliableBoxList[index];
				if(box.id != id){
					alert('页面发生错误,请重新查询');
					return;
				}
				var reserveInfo = {
					customer : {
						id : CUSTOMERID//后台管理人员专用
					},
					box : [{
						id : id,
						roomNumber : box.roomNumber
					}],
					reservationType : reserveTime === 'launch' ? '午餐预订' : '晚餐预订',
					reservationsMode : '只订座',
					reservationsStartTime : app.selectedDate
				};
				var jsonString = encodeURI(JSON.stringify(reserveInfo));
				var url = './reserve.html?info=' + jsonString;
				window.location.href = url;
			},
			
			queryAvaliableBox : function(){
				this.getAvaliableBox();
			},
			
			colsPerRowCheck : function(){
				console.log(this.colsPerRow);
				if(!this.colsPerRow || this.colsPerRow == 1)
					this.colsPerRow = 2;
			}
			

		}
	});

});

function changeArrayTo2DimensionalArray(arr, cols) {
	if (cols == '0' || !cols || isNaN(cols) || !Array.isArray(arr) || arr.length === 0)
		return arr;
	cols = parseInt(cols);
	var newArr = [];
	var beginIndex = 0; //include
	var endIndex = beginIndex + cols; //not include
	var lastIndex = arr.length - 1;
	while (beginIndex <= lastIndex) {
		newArr.push(arr.slice(beginIndex, endIndex));
		beginIndex = endIndex;
		endIndex += cols;
	}
	return newArr;
}
