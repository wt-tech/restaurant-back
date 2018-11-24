//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#reserve',
		data: {
			rawReserveList: [],
			inputs: null,
			starttime: null,
			endtime: null,
			timetype: '请选择',
			reservetype: '请选择',
			reservemode: '请选择',
			field: ['id', 'index', 'reservationsName', 'reservationsSex', 'reservationsTel', 'reservationsNum', 'reservationsStartTime', 'reservationType', 'reserveTime', 'reservationsMode', 'remarks', 'EatStartTime',
				'EatEndTime', 'reserveStartTime', 'reserveEndTime'
			], //index指序号
			totalCount: '',
			totalPage: '',
			currentPageNo: 1,
			display: 'display : none',
			displays: 'display : none',
			rawMenuList: [],
			fields: ['id', 'index', 'name', 'specifications', 'choosePrice', 'menuCount'], //index指序号
			rawBoxList: [],
			fieldbox: ['id', 'index', 'roomNumber', 'roomName'] //index指序号
		},
		computed: {
			reserveList: function() {
				var that = this;
				return that.rawReserveList.map(function(reserve, index) {
					return {
						index: index + 1,
						reservationsName: getValue(reserve, 'reservationsName'),
						reservationsSex: getValue(reserve, 'reservationsSex'),
						reservationsTel: getValue(reserve, 'reservationsTel'),
						reservationsNum: getValue(reserve, 'reservationsNum'),
						reservationsStartTime: getDateOfDateTime(getValue(reserve, 'reservationsStartTime')),
						reservationType: getValue(reserve, 'reservationType'),
						reserveTime: getDateOfDateTime(getValue(reserve, 'reserveTime')),
						reservationsMode: getValue(reserve, 'reservationsMode'),
						remarks: getValue(reserve, 'remarks'),
						id: getValue(reserve, 'id')
					};
				});
			},

			menuList: function() {
				var that = this;
				return that.rawMenuList.map(function(menu, index) {
					return {
						index: index + 1,
						name: getValue(menu, 'name'),
						menuCount: getValue(menu, 'menuCount'),
						specifications: getValue(menu, 'specifications'),
						choosePrice: getValue(menu, 'choosePrice'),
						id: getValue(menu, 'id')
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
						id: getValue(box, 'id')
					};
				});
			}
		},

		created: function() {
			var that = this;
			that.initRawreserveList();
		},

		methods: {
			initRawreserveList: function(PageNo, param = null) {
				var that = this;
				var currentPageNo = PageNo || that.currentPageNo;
				if(param != null) {
					param.currentPageNo = currentPageNo;
				} else
					param = {
						currentPageNo: currentPageNo
					};
				simpleAxios.get('reserve/back/listreserve?', {
					params: param
				}).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawReserveList = resData.reserves;
						that.totalPage = Math.ceil(resData.totalCount / resData.pageSize);
						that.totalCount = resData.totalCount;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},

			checkdish: function(reserve, content) {
				var that = this;
				var params = new FormData();
				var id = reserve.id;
				if('包厢' == content) {
					this.showDivs(reserve);
					simpleAxios.get('reserve/back/getreserve/' + id).then(function(res) {
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							var resData = res.data;
							that.rawBoxList = resData.reserve.box;
						} else
							backEndExceptionHanlder(res);
					}).catch(function(err) {
						unknownError(err);
					})
				} else {
					if(reserve.reservationsMode == '只订座') {
						alert('顾客没有点菜');
					} else {
						this.showDiv(reserve);
						simpleAxios.get('reserve/back/getreserve/' + id).then(function(res) {
							if(res.status == STATUS_OK && res.data.status == SUCCESS) {
								var resData = res.data;
								that.rawMenuList = resData.reserve.menu;
							} else
								backEndExceptionHanlder(res);
						}).catch(function(err) {
							unknownError(err);
						})
					}
				}
			},
			submit: function() {
				var page = 1;
				var that = this;
				that.currentPageNo = 1;
				that.initRawreserveList(page, this.combinationParameter());
			},

			combinationParameter: function() {
				var that = this;
				var infor = that.inputs;
				var starttime = that.starttime;
				var endtime = that.endtime;
				var timetype = that.timetype;
				var reservetype = that.reservetype;
				var reservemode = that.reservemode;
				var params = {};
				this.infor(params, infor);
				this.time(params, starttime, endtime, timetype);
				this.reservetypes(params, reservetype);
				this.reservemodes(params, reservemode);
				console.log(params);
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

			reservetypes: function(params, reservetype) {
				if(reservetype != '请选择') {
					params.reservationType = encodeURI(reservetype);
				}
				return params;
			},

			reservemodes: function(params, reservemode) {
				if(reservemode != '请选择') {
					params.reservationsMode = encodeURI(reservemode);
				}
				return params;
			},

			hideDiv: function() {
				this.display = 'display : none';
			},
			hideDivs: function() {
				this.displays = 'display : none';
			},
			showDiv: function(reserve) {
				this.display = 'display : block';
			},
			showDivs: function(reserve) {
				this.displays = 'display : block';
			},

			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawreserveList(that.currentPageNo, that.combinationParameter());
			},
			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initRawreserveList(currentPageNo, that.combinationParameter());
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
					that.initRawreserveList(currentPageNo, that.combinationParameter());
				}
			},
			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.initRawreserveList(that.totalPage, that.combinationParameter());
			}

		},

	})
});