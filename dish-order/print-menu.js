
$(function() {

	var classification = new Vue({
		el: '#menu-list',
		data: {
			rawMenuList: [],
			rawBoxList: [],
			dishOrder : {}
		},
		computed: {
			menuList: function() {
				var that = this;
				return that.rawMenuList.map(function(dishorderline, index) {
					return {
						index: index + 1,
						name: getValue(dishorderline, 'menu.name'),
						specifications: getValue(dishorderline, 'specifications'),
						unitPrice: getValue(dishorderline, 'unitPrice'),
						dishCount: getValue(dishorderline, 'dishCount'),
						totalprice: getValue(dishorderline, 'dishCount') * getValue(dishorderline, 'unitPrice'),
						id: getValue(dishorderline, 'id')
					};
				});
			},
			boxList: function() {
				var that = this;
				return that.rawBoxList.map(function(box, index) {
					return {
						index: index + 1,
						roomNumber: getValue(box, 'roomNumber'),
						roomName: getValue(box, 'roomName'),
						roomIntroduction: getValue(box, 'roomIntroduction'),
						id: getValue(box, 'id')
					};
				});
			}
		},
		created: function() {
			this.initDishOrderInfo();
			this.initRawMenuList();
			this.initRawBoxList();
		},
		methods:{
			
			initDishOrderInfo : function(){
				var queryString = window.location.search;
				if (queryString.length > 0) {
					queryString = queryString.substr(1, queryString.length - 1);
					try {
						var params = queryString.split('=')[1];
						var item = JSON.parse(decodeURI(params));
						if (item != null) {
							this.dishOrder = item;
						}
					} catch (e) { 
						alert('请重新点击打印按钮');
					}
				}
			},
			
			initRawMenuList : function(){
				var that = this;
				simpleAxios.get('dishorder/back/listdishordermenu/' + 94).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawMenuList = resData.dishordermenu;
						console.log(that.rawMenuList);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},
			initRawBoxList : function(){
				var that = this;
				simpleAxios.get('dishorder/back/listdishorderbox/' + 94).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawBoxList = resData.dishorderbox;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},
			
		}
	});
})
