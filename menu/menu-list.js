Vue.component('vtd', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {

	var menu = new Vue({
		el: '#menus',
		data: {
			rawMenuList: [],
			classificationID: -1,
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
						url: '<img style="width:80px;height:80px;" alt="图片丢了" src="' + getValue(item, 'menuimage.0.url') + '"></img>',
						sizeAndPrice: app.getSizeAndPrice(item)
					}
				});
			}
		},
		created: function() {
			this.initClassificationId();
			if (this.classificationID !== -1)
				this.initRawMenuList();
			else
				alert('请选择正确的菜单分类');
		},
		methods: {

			getSizeAndPrice: function(menu) {
				var id = 0;
				var size = [];
				if (!!menu.largePrice) { //有值
					size.push({
						id: ++id,
						value: '大份',
						price: menu.largePrice
					});
				}
				if (!!menu.mediumPrice) { //有值
					size.push({
						id: ++id,
						value: '中份',
						price: menu.mediumPrice
					});
				}
				if (!!menu.smallPrice) { //有值
					size.push({
						id: ++id,
						value: '小份',
						price: menu.smallPrice
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
					var classificationID = queryString.split('=')[1];
					that.classificationID = classificationID;
				} catch (e) {
					console.log(e);
					that.classificationID = -1;
				}
			},

			initRawMenuList: function() {
				let app = this;
				app.getMenuList();
			},

			getMenuList: function() {
				var app = this;
				var url = 'menu/back/listmenu';
				simpleAxios.get(url, {
					params: {
						classificationId: app.classificationID
					}
				}).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						console.log(res.data);
						app.processRawMenuList(res.data.menus);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

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
				item.classification = {id : that.classificationID};
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
			goToAdd : function(){
				document.location.href = 'add.html?id='+this.classificationID;
			}

		}
	});




})
