Vue.component('vtd', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {

	var menu = new Vue({
		el: '#menus',
		data: {
			rawMenuList: [],
			classificationID: null,
			classificationName: '菜品',
			menuName: '',
			/*new add here*/
			pageInfo: {
				currentPageNo: 1,
				totalCount: 0,
				pageSize: 6,
				totalPages: 0,
			},
			loadingComplete: false,
			/*new add end*/
		},
		computed: {
			menuList: function() {
				var app = this;
				return this.rawMenuList.map(function(item, index) {
					return {
						index: index + 1,
						id: item.id,
						name: item.name,
						salesVolume: getValue(item, 'salesVolume'),
						url: '<img style="width:80px;height:80px;" alt="图片丢了" src="' + getValue(item, 'menuimage.0.url') +
							'"></img>',
						sizeAndPrice: app.getSizeAndPrice(item),
						classificationName : '<a href="./menu-list.html?id='+ getValue(item,'classification.id') 
						+ '&name='+ getValue(item,'classification.name') +'">' + getValue(item,'classification.name') + '</a>',
					}
				});
			}
		},
		created: function() {
			this.initClassificationId();
			if (this.classificationID == null &&  !this.menuName)
				alert('请选择正确的菜单分类');
			else
				this.initRawMenuList();
		},
		methods: {
			getSizeAndPrice: function(menu) {
				var id = 0;
				var size = [];
				if (!!menu.largePrice) { //有值
					size.push({
						id: ++id,
						value: '大',
						price: menu.largePrice,
						unit:menu.unit
					});
				}
				if (!!menu.mediumPrice) { //有值
					size.push({
						id: ++id,
						value: '中',
						price: menu.mediumPrice,
						unit:menu.unit
					});
				}
				if (!!menu.smallPrice) { //有值
					size.push({
						id: ++id,
						value: '小',
						price: menu.smallPrice,
						unit:menu.unit
					});
				}
				if (!!menu.uncertainPrice) { //有值
					size.push({
						id: ++id,
						value: null,
						price: menu.uncertainPrice
					});
				}
				return size;
			},

			refresh: function() {
				this.initRawMenuList();
			},

			initClassificationId: function() {
				var that = this;
				try {
					var queryString = document.location.search;
					queryString = queryString.substr(1, queryString.length - 1);
					var params = queryString.split('&');

					if (Array.isArray(params) && params.length == 2) {
						var firstParam = params[0].split('=');
						if (firstParam[0] == 'id' && !isNaN(firstParam[1])) {
							that.classificationID = firstParam[1];
						}
						var secondParam = params[1].split('=');
						if (secondParam[0] == 'name') {
							that.classificationName = decodeURI(secondParam[1]);
						}
					} else if (params.length == 1) {
						var firstParam = params[0].split('=');
						if (firstParam[0] == 'name') {
							that.menuName = decodeURI(firstParam[1]);
						}
					}
				} catch (e) {
					console.log(e);
					that.classificationID = null;
					that.classificationName = '菜品'
				}
			},

			initRawMenuList: function() {
				let app = this;
				app.getMenuList();
			},

			getMenuList: function() {
				var app = this;
				var url =app.classificationID? 'menu/back/listmenu' : 'menu/back/listmenubyname';
				app.loadingComplete = false;
				simpleAxios.get(url, app.prepareGetParmas()).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.processRawMenuList(res.data.menus);
						/*new add here*/
						app.processPageInfo(res.data.totalCount, res.data.pageSize);
						/*new add end*/
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {
					app.loadingComplete = true;
				});
			},

			processRawMenuList: function(menus) {
				var app = this;
				if (Array.isArray(menus)) { //是数组
					app.rawMenuList = menus;
				}
			},

			updateMenu: function(index) {
				var that = this;
				var item = that.rawMenuList[index];
				item.classification = {
					id: that.classificationID
				};
				var jsonString = encodeURI(JSON.stringify(item));
				document.location.href = "./update.html?item=" + jsonString;
			},
			deleteMenu: function(index, id) {

				console.log(index, id);
				if (window.confirm('确定要删除菜品吗?')) {
					this.deleteMenuBackEnd(index, id);
				}
			},

			deleteMenuBackEnd: function(index, id) {
				var app = this;
				simpleAxios.delete('menu/back/removemenu/' + id).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('删除成功!');
						app.deleteClassificationFrontEnd(index);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(res);
				});
			},
			deleteClassificationFrontEnd: function(index) {
				this.rawMenuList.splice(index, 1);
			},
			goToAdd: function() {
				var queryString = '';
				if(this.classificationID)
					queryString = '?id=' + this.classificationID;
				document.location.href = 'add.html' + queryString;
			},


			/*new add here*/
			prepareGetParmas: function() {
				var app = this;
				var params = {
					currentPageNo: app.pageInfo.currentPageNo,
					menuName: encodeURI(app.menuName)
				};
				if (app.classificationID) {
					params.classificationId = app.classificationID;
				}
				return { //get请求的参数,就是这种格式.
					params: params
				};
			},

			fuzzyQuery: function() {
				this.pageInfo.currentPageNo = 1;
				this.getMenuList();
			},

			processPageInfo: function(totalCount, pageSize) {
				this.pageInfo.totalCount = totalCount;
				this.pageInfo.pageSize = pageSize;
				try {
					this.pageInfo.totalPages = Math.ceil(totalCount / pageSize);
				} catch (e) {
					this.pageInfo.totalPages = 0;
				}
			},

			nextPage: function() {
				var app = this;
				if (app.pageInfo.currentPageNo < app.pageInfo.totalPages) {
					app.pageInfo.currentPageNo = app.pageInfo.currentPageNo + 1;
					app.getMenuList();
				} else {
					alert('已经是最后一页了');
				}
			},

			prePage: function() {
				var app = this;
				if (app.pageInfo.currentPageNo > 1) {
					app.pageInfo.currentPageNo = app.pageInfo.currentPageNo - 1;
					app.getMenuList();
				} else {
					alert('已经是第一页了');
				}
			},

			lastPage: function() {

				var app = this;
				if (app.pageInfo.currentPageNo != app.pageInfo.totalPages) {
					app.pageInfo.currentPageNo = app.pageInfo.totalPages;
					app.getMenuList();
				} else {
					alert('已经是最后一页了');
				}
			},

			firstPage: function() {
				var app = this;
				if (app.pageInfo.currentPageNo != 1) {
					app.pageInfo.currentPageNo = -1;
					app.getMenuList();
				} else {
					alert('已经是第一页了');
				}
			},
			/*new add end*/
		}
	});




})
