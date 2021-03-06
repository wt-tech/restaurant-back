Vue.component('vtd', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {

	var classification = new Vue({
		el: '#boxes',
		data: {
			rawBoxList: [],
			roomNumber : null,
			/*new add here*/
			pageInfo : {
				currentPageNo : 1,
				totalCount : 0,
				pageSize : 6,
				totalPages : 0,
			},
			loadingComplete : false,
			/*new add end*/
		},
		computed: {
			boxList: function() {
				return this.rawBoxList.map(function(item, index) {
					return {
						index: index + 1,
						id: item.id,
						roomNumber: item.roomNumber,
						roomName: item.roomName,
						roomSize: item.roomSize,
						roomIntroduction: item.roomIntroduction,
						boximage: '<img alt="尚未上传图片" style="width:80px;height:80px;" src="' + getValue(item, 'boximage.0.url') +
							'"></img>',
						url : item.url,
					}
				});
			}
		},
		created: function() {
			this.initRawBoxList();
		},
		methods: {


			refresh: function() {
				this.initRawBoxList();
			},

			initRawBoxList: function() {
				let app = this;
				app.getBoxList();
			},

			/*new add here*/
			prepareGetParmas : function(){
				var app = this;
				return {//get请求的参数,就是这种格式.
					params : {
						currentPageNo : app.pageInfo.currentPageNo,
						roomNumber : app.roomNumber,
					}
				};
			},
			
			fuzzyQuery : function(){
				this.pageInfo.currentPageNo = 1;
				this.getBoxList();
			},
			
			processPageInfo : function(totalCount,pageSize){
				this.pageInfo.totalCount = totalCount;
				this.pageInfo.pageSize = pageSize;
				try{
					this.pageInfo.totalPages = Math.ceil(totalCount/pageSize);
				}catch(e){
					this.pageInfo.totalPages = 0;
				}
			},
			
			nextPage : function(){
				var app = this;
				if(app.pageInfo.currentPageNo < app.pageInfo.totalPages){
					app.pageInfo.currentPageNo = app.pageInfo.currentPageNo +1;
					app.getBoxList();
				}
				else{
					alert('已经是最后一页了');
				}
			},
			
			prePage : function(){
				var app = this;
				if(app.pageInfo.currentPageNo > 1){
					app.pageInfo.currentPageNo = app.pageInfo.currentPageNo -1;
					app.getBoxList();
				}
				else{
					alert('已经是第一页了');
				}
			},
			
			lastPage : function(){
				
				var app = this;
				if(app.pageInfo.currentPageNo != app.pageInfo.totalPages){
					app.pageInfo.currentPageNo = app.pageInfo.totalPages;
					app.getBoxList();
				}
				else{
					alert('已经是最后一页了');
				}
			},
			
			firstPage : function(){
				var app = this;
				if(app.pageInfo.currentPageNo != 1){
					app.pageInfo.currentPageNo = -1;
					app.getBoxList();
				}
				else{
					alert('已经是第一页了');
				}
			},
			/*new add end*/
			
			getBoxList: function() {
				var app = this;
				var url = 'box/back/listbox';
				app.loadingComplete = false;
				var params = app.prepareGetParmas();
				simpleAxios.get(url,params).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.processRawBoxList(res.data.boxs);
						/*new add here*/
						app.processPageInfo(res.data.totalCount,res.data.pageSize);
						/*new add end*/
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {
					app.loadingComplete = true;
				});
			},

			processRawBoxList: function(classifications) {
				var app = this;
				if (Array.isArray(classifications)) { //是数组
					app.rawBoxList = classifications;
				}
			},

			updateBox: function(index) {
				var that = this;
				var item = that.rawBoxList[index];
				var jsonString = encodeURI(JSON.stringify(item));
				window.location.href = "./update.html?item=" + jsonString;
			},

			deleteBox: function(index, id) {
				if (window.confirm('确定要删除该包厢吗?')) {
					this.deleteBoxBackEnd(index, id);
				}
			},

			deleteBoxBackEnd: function(index, id) {
				var app = this;
				simpleAxios.delete('box/back/removebox/' + id).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('删除成功!');
						app.deleteBoxFrontEnd(index);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				});

			},
			deleteBoxFrontEnd: function(index) {
				this.rawBoxList.splice(index, 1);
			},


			generateMiniCode: function(index, id) {
				//1.生成access_token
				//2.生成小程序码
				var app = this;
				app.getAccessToken().then(function(accessToken) {
					var item = app.rawBoxList[index];
					app.getMiniQRCode(item).then(function(result) {
						//更新box表
						app.updateBoxBackEnd(index, id, result.url);
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
						scene: CODE_BOX_PREFIX + item.id,
						page: CODE_MENU_PAGE_PATH,
						access_token: app.accessToken,
						imgName: CODE_BOX_PREFIX + '-' + item.roomNumber//用于给最终生成的小程序码命名
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

			updateBoxURLFrontEnd: function(index, id, url) {
				var item = this.rawBoxList[index];
				item.url = url;
				this.rawBoxList.splice(index, 1, item);
				if(url)
					alert("生成小程序码成功");
			},

			prepareUpdateParams : function(item,imageUrl){
				var params = new FormData();
				for(property in item){
					if(property != 'boximage' && property != 'url' && item[property])
						params.append(property,item[property]);
				}
				params.append('url', imageUrl);
				return params;
			},
			
			updateBoxBackEnd: function(index, id, imageUrl) {
				//1.更新前端url
				var app = this;
				var url = 'box/back/updatebox';
				var item = app.rawBoxList[index];
				
				simpleAxios.post(url, app.prepareUpdateParams(item,imageUrl)).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.updateBoxURLFrontEnd(index, id, imageUrl);
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
