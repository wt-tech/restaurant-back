//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#banquetreserve',
		data: {
			rawBanquetReserveList: [],
			inputs: null,
			starttime: null,
			endtime: null,
			timetype: '请选择',
			combotypeId: '请选择',
			rawcomboList: [{
				id: '',
				name: ''
			}],
			field: ['id', 'index', 'reservationsName', 'reservationsSex', 'reservationsTel', 'reservationsNum', 'reservationsCombo', 'reservationsStartTime', 'reserveTime', 'remarks'], //index指序号
			totalCount: '',
			totalPage: '',
			currentPageNo: 1
		},
		computed: {
			banquetreserveList: function() {
				var that = this;
				return that.rawBanquetReserveList.map(function(banquetreserve, index) {
					return {
						index: index + 1,
						reservationsName: getValue(banquetreserve, 'reservationsName'),
						reservationsSex: getValue(banquetreserve, 'reservationsSex'),
						reservationsTel: getValue(banquetreserve, 'reservationsTel'),
						reservationsNum: getValue(banquetreserve, 'reservationsNum'),
						reservationsCombo: getValue(banquetreserve, 'combo.comboName') + '(' + getValue(banquetreserve, 'combo.comboPrice') + '元/桌)',
						reservationsStartTime: getDateOfDateTime(getValue(banquetreserve, 'reservationsStartTime')),
						reserveTime: getDateOfDateTime(getValue(banquetreserve, 'reserveTime')),
						remarks: getValue(banquetreserve, 'remarks'),
						id: getValue(banquetreserve, 'id')
					};
				});
			},

			comboList: function() {
				var that = this;
				return that.rawcomboList.map(function(combo, index) {
					return {
						name: getValue(combo, 'comboName'),
						id: getValue(combo, 'id')
					};
				});
			}

		},

		created: function() {
			var that = this;
			that.initRawbanquetreserveList();
			that.initRawcomboList();
		},

		methods: {
			initRawbanquetreserveList: function(PageNo, Param = null) {
				var that = this;
				var currentPageNo = PageNo || that.currentPageNo;
				var param={
						currentPageNo: currentPageNo
				}
				if(Param != null) {
					var queryString = encodeURI(JSON.stringify(Param));
					param.queryString = queryString;
				}
				simpleAxios.get('banquetreserve/back/listbanquetreserve', {
					params : param
				}).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawBanquetReserveList = resData.banquetreserves;
						that.totalPage = Math.ceil(resData.totalCount / resData.pageSize);
						that.totalCount = resData.totalCount;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},

			initRawcomboList: function() {
				var that = this;
				simpleAxios.get('combo/back/listallcombo').then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawcomboList = resData.combos;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},
			submit: function() {
				var page = 1;
				var that = this;
				that.currentPageNo = 1;
				that.initRawbanquetreserveList(page, that.combinationParameter());
			},

			combinationParameter: function() {
				var that = this;
				var infor = that.inputs;
				var starttime = that.starttime;
				var endtime = that.endtime;
				var timetype = that.timetype;
				var combotypeId = that.combotypeId;
				var params = {};
				this.infor(params, infor);
				this.time(params, starttime, endtime, timetype);
				this.combotypes(params, combotypeId);
				//console.log(params);
				return params;
			},

			infor: function(params, infor) {
				var reg = /^[A-Za-z\u4e00-\u9fa5]*$/;
				var telephone = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
				var cell = /^[1][3,4,5,7,8,9][0-9]{9}$/;
				if(infor != null) {
					if(reg.test(infor) === true) {
						params.reservationsName = encodeURI(infor);
					} else if(telephone.test(infor) === true || cell.test(infor) === true) {
						params.reservationsTel = infor;
					} else {
						alert("您输入的姓名或者手机号码格式不正确");
					}
				};
				return params;
			},

			time: function(params, starttime, endtime, timetype) {
				if((starttime != null && starttime != "") || (endtime != null && endtime != "")) {
					if(timetype == '请选择') { //如果用户没有选择时间类型
						alert("请选择时间类型再提交");
						return;
					}
					if(starttime != null && starttime != "") {
						if(timetype == '就餐时间') {
							params.EatStartTime = starttime;
						} else {
							params.reserveStartTime = starttime;
						}
					}
					if((endtime != null && endtime != "") && (starttime == null || starttime == "")) {
						var endtimes = new Date(endtime);
						endtimes.setDate(endtimes.getDate() + 1);
						endtimes = globalGetToday('-', endtimes);
						if(timetype == '就餐时间') {
							params.EatEndTime = endtimes;
						} else {
							params.reserveEndTime = endtimes;
						}
					}
					if((endtime != null && endtime != "") && (starttime != null && starttime != "")) {
						var endtimes = new Date(endtime);
						endtimes.setDate(endtimes.getDate() + 1);
						endtimes = globalGetToday('-', endtimes);
						if(timetype == '就餐时间') {
							params.EatEndTime = endtime;
						} else {
							params.reserveEndTime = endtimes;
						}
					}
					if((starttime != null && starttime != "") && (endtime != null && endtime != "") && (endtime < starttime)) { //如果用户选择的结束时间小于开始时间
						alert("结束时间不能小于开始时间");
						return;
					}
				}
				return params;
			},
			combotypes: function(params, combotypeId) {
				if(combotypeId != '请选择') {
					combos = {
						id: combotypeId
					}
					//console.log(combos);
					params.combo = combos;
				}
				return params;
			},
			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawbanquetreserveList(that.currentPageNo, that.combinationParameter());
			},
			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initRawbanquetreserveList(currentPageNo, that.combinationParameter());
				} else {
					alert('已经是第一页');
				}
			},
			nextPage: function() {
				var that = this;
				var currentPageNo = that.currentPageNo;
				if(that.totalPage == currentPageNo) {
					alert('已经是最后一页');
				} else {
					currentPageNo++;
					that.currentPageNo = currentPageNo;
					that.initRawbanquetreserveList(currentPageNo, that.combinationParameter());
				}
			},
			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.initRawbanquetreserveList(that.totalPage, that.combinationParameter());
			}

		},

	})
});