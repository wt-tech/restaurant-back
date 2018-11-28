//定义一个变量


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

	

		methods: {

			initDishOrderInfo: function() {
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

			initRawMenuList: function() {
				var that = this;
				var id = that.dishOrder.id;
				simpleAxios.get('dishorder/back/listdishordermenu/' + id).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawMenuList = resData.dishordermenu;
						console.log(that.rawMenuList);
						setTimeout(that.initlodop,1000);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},

			initlodop: function() {
				var lodop;
				//需要打印的内容
				//初始化变量 str1 str2默认不填 ，是注册正版时的验证账号密码
				lodop = getLodop('','');
				//设置打印页面大小，这里3表示纵向打印且纸高“按内容的高度”；48表示纸宽48mm；20表示页底空白2.0mm
				lodop.SET_PRINT_PAGESIZE(3,'68mm','2mm',"CreateCustomPage");

				//设置打印页面内容  10为上边距 0为左边距 100%为宽度 ""为高度，发现不填也没事，html是打印内容 
				lodop.ADD_PRINT_HTM(10, 0, "100%", "", document.getElementById('menu-list').innerHTML);
				console.log(document.getElementById('menu-list').innerHTML);
				
				lodop.PRINT();
			},

			initRawBoxList : function(){
				var that = this;
				var id = that.dishOrder.id;

				simpleAxios.get('dishorder/back/listdishorderbox/' + id).then(function(res) {
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
