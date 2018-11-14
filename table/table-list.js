Vue.component('vtd', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {

	var table = new Vue({
		el: '#tables',
		data: {
			rawTableList: [],
			accessToken: null
		},
		computed: {
			tableList: function() {
				return this.rawTableList.map(function(item, index) {
					return {
						index: index + 1,
						id: item.id,
						number: item.number,
						image: item.image,
					}
				});
			}
		},
		created: function() {
			this.initRawTableList();
		},
		methods: {


			refresh: function() {
				this.initRawTableList();
			},

			initRawTableList: function() {
				let app = this;
				app.getTableList();
			},

			getTableList: function() {
				var app = this;
				var url = 'table/back/listtable?currentPageNo=1';
				simpleAxios.get(url).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.processRawTableList(res.data.tables);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},

			processRawTableList: function(tables) {
				var app = this;
				if (Array.isArray(tables)) { //是数组
					app.rawTableList = tables;
				}
			},

			updateTable: function(index) {
				var that = this;
				var item = that.rawTableList[index];
				var jsonString = encodeURI(JSON.stringify(item));
				window.location.href = "./add-update.html?item=" + jsonString;
			},
			deleteTable: function(index, id) {
				var that = this;
				var item = that.rawTableList[index];
				if (window.confirm('确定要删除'+ item.number +'号桌吗?')) {
					this.deleteTableBackEnd(index, id);
				}
			},

			deleteTableBackEnd: function(index, id) {
				var app = this;
				simpleAxios.delete('table/back/removetable/' + id).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('删除成功!');
						app.deleteTableFrontEnd(index);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(res);
				});

			},
			deleteTableFrontEnd: function(index) {
				this.rawTableList.splice(index, 1);
			},
			generateMiniCode: function(index, id) {
				//1.生成access_token
				//2.生成小程序码
				var app = this;
				app.getAccessToken().then(function(accessToken) {
					var item = app.rawTableList[index];
					app.getMiniQRCode(item).then(function(result) {
						//更新table表
						app.updateTableBackEnd(index, id, result.url);
					});
				});
			},

			/**
			 * 每次获取的access_token有时间限制.这里每次都重新调用一次.
			 */
			getAccessToken: function(callBack) {
				var app = this;
				const promise = new Promise(function(resolve, reject) {
					var url = 'code/back/accesstoken';
					simpleAxios.get(url).then(function(res) {
						if (res.status == STATUS_OK && res.data.status == SUCCESS) {
							var result = JSON.parse(res.data.result);
							app.accessToken = result.access_token;
							resolve();
						} else {
							backEndExceptionHanlder(res);
							alert('生成小程序码失败');
						}
					}).catch(function(err) {
						alert('生成小程序码失败');
					});
				});
				return promise;
			},

			getMiniQRCode: function(item) {
				var app = this;
				const promise = new Promise(function(resolved, rejected) {
					var url = 'code/back/wxcode';
					var params = {
						scene: CODE_TABLE_PREFIX+item.id,
						page: CODE_MENU_PAGE_PATH,
						access_token: app.accessToken,
						imgName : CODE_TABLE_PREFIX+'-'+item.number
					};
					jsonAxios.post(url, params).then(function(res) {
						if (res.status == STATUS_OK && res.data.status == SUCCESS) {
							resolved(res.data);
						} else {
							backEndExceptionHanlder(res);
							alert('生成小程序码失败');
						}
					}).catch(function(err) {
						alert('生成小程序码失败');
					});
				});

				return promise;
			},

			updateTableURLFrontEnd: function(index, id, url) {

				var item = this.rawTableList[index];
				item.image = url;
				this.rawTableList.splice(index, 1, item);
				if(url)
					alert("生成小程序码成功");
			},

			updateTableBackEnd: function(index, id, imageUrl) {
				//1.更新前端url
				var app = this;
				var url = 'table/back/updatetable';
				var item = app.rawTableList[index];
				var params = new FormData();
				params.append('number', item.number);
				params.append('image', imageUrl);
				params.append('id',item.id);
				simpleAxios.post(url, params).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.updateTableURLFrontEnd(index, id, imageUrl);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			}
		}
	});




})
