$(function() {

	var reserve = new Vue({
		el: '#boxReserve',

		data: {
			reserveInfo: {
				box: [{}],

			},
			reserveInfoAvaliable: {
				tel: true,
				num: true
			}
		},

		computed: {
			telLength: function() {
				return this.reserveInfo.reservationsTel.length;
			}
		},

		created: function() {
			var app = this;
			app.initBoxInfo();
			if (app.reserveInfo.box[0].id == null) {
				alert('初始化失败,请重新选择包厢');
				return false;
			}
		},

		methods: {

			initBoxInfo: function() {
				var that = this;
				try {
					var queryString = document.location.search;
					queryString = queryString.substr(1, queryString.length - 1);
					var jsonBox = queryString.split('=')[1];
					var reserveInfo = JSON.parse(decodeURI(jsonBox));
					reserveInfo.reservationsTel = '';
					console.log(reserveInfo);
					that.reserveInfo = reserveInfo;
				} catch (e) {
					that.reserveInfo.box[0].id = null;
				}
			},

			/**信息验证**/
			checkNum: function() {
				var app = this;
				var num = app.reserveInfo.reservationsNum;
				if(num == '' || num == null){
					app.reserveInfoAvaliable.num = true;
					return;
				}
				var pattern = /^[\d]{1,3}$/;
				if (pattern.test(num)) { //联系方式合法
					app.reserveInfoAvaliable.num = true;
				} else //联系方式不合法
					app.reserveInfoAvaliable.num = false;
			},
			checkTel: function() {
				var app = this;
				var tel = app.reserveInfo.reservationsTel;
				var telephone = /^[\d-]{5,14}$/;
				var cell = /^[1][3,4,5,7,8,9][0-9]{9}$/;

				if (telephone.test(tel) === true || cell.test(tel) === true) {
					app.reserveInfoAvaliable.tel = true;
				} else
					app.reserveInfoAvaliable.tel = false;
			},
			sexChanged: function(gender, event) {
				this.reserveInfo.reservationsSex = gender;
				console.log(this.reserveInfo);
			},

			submit: function() {
				var app = this;
				app.checkNum();
				app.checkTel();
				if(app.reserveInfoAvaliable.tel && app.reserveInfoAvaliable.num)
					app.saveReserveInfo();
			},
			
			saveReserveInfo : function(){
				var app = this;
				var url = 'reserve/back/savereserve';
				jsonAxios.post(url, app.reserveInfo).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('预订成功');
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			}

		}
	});

});
