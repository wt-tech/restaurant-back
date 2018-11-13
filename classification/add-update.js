$(function() {

	var classification = new Vue({
		el: '#classification',
		data: {
			classification: {},
			type: 'add',
		},

		created: function() {
			this.initClassification();
			//this.initRawClassificationList();
		},
		methods: {

			initClassification: function() {
				var that = this;
				var queryString = window.location.search;
				if (queryString.length > 0) {
					queryString = queryString.substr(1, queryString.length - 1);
					try {
						var params = queryString.split('=')[1];
						var item = JSON.parse(decodeURI(params));
						if (item != null) {
							that.type = 'update';
							that.classification = item;
						}
					} catch (e) { //发生异常就认为是add 而不是update.
						console.log(e);
						that.type = 'add';
						that.classification = {};
					}
				}
			},


			update: function() {
				var app = this;
				var url = 'classification/back/updateclassification';
				jsonAxios.put(url, app.classification).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('更新成功');
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},

			add: function() {
				var app = this;
				var url = 'classification/back/saveclassification';

				jsonAxios.post(url, app.classification).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('添加成功');
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},




			submit: function() {
				let that = this;
				var type = that.type;
				if (type === 'add')
					that.add();
				else
					that.update();
			}
		}
	});




})
