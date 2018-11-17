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
			initRawbanquetreserveList: function(PageNo, param = null) {
				var that = this;
				var currentPageNo = PageNo || that.currentPageNo;
				if(param != null) {
					param.currentPageNo = 1;
				} else
					param = {
						currentPageNo: currentPageNo
					};
				simpleAxios.get('banquetreserve/back/listbanquetreserve', {
					params: param
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
				var that = this;
				var page = 1;
				var infor = that.inputs;
				var starttime = that.starttime;
				var endtime = that.endtime;
				var timetype = that.timetype;
				var combotypeId = that.combotypeId;
				var reg = /^[A-Za-z\u4e00-\u9fa5]*$/;
				var telephone = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
				var cell = /^[1][3,4,5,7,8][0-9]{9}$/;
				if(infor != null) {
					if(reg.test(infor) === true) {
						that.initRawbanquetreserveList(page, {
							reservationsName: encodeURI(infor)
						});
						return;
					}
					if(telephone.test(infor) === true || cell.test(infor) === true) {
						that.initRawbanquetreserveList(page, {
							reservationsTel: infor
						});
						return;
					}
					alert("您输入的姓名或者手机号码格式不正确");
					return;
				};
				if(starttime != null || endtime != null) {
					if(starttime == null || endtime == null) { //如果用户只选择了一个时间
						alert("开始时间和结束时间都必须选择");
						return;
					}
					if(timetype == '请选择') { //如果用户没有选择时间类型
						alert("请选择时间类型再提交");
						return;
					}
					if(endtime < starttime) { //如果用户选择的结束时间小于开始时间
						alert("结束时间不能小于开始时间");
						return;
					}
					if(timetype == '就餐时间') {
						that.initRawbanquetreserveList(page, {
							EatStartTime: starttime,
							EatEndTime: endtime
						});
					} else {
						that.initRawbanquetreserveList(page, {
							reserveStartTime: starttime,
							reserveEndTime: endtime
						});
					}
				}
				/*;
								if(combotype != '请选择') {
									that.initRawbanquetreserveList(page, {
										combo ={
											id: combotypeId
										}
									});
								}*/
			},
			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawbanquetreserveList(that.currentPageNo);
			},
			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initRawbanquetreserveList(currentPageNo);
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
					that.initRawbanquetreserveList(currentPageNo);
				}
			},
			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.initRawbanquetreserveList(that.totalPage);
			}

		},

	})
});