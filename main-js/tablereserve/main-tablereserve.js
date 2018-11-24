//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#tablereserve',
		data: {
			rawTableReserveList: [],
			inputs: null,
			starttime: null,
			endtime: null,
			seattype: '请选择',
			field: ['id', 'index', 'nickname', 'number', 'reserveTime'], //index指序号
			totalCount: '',
			totalPage: '',
			currentPageNo: 1,
			display: 'display : none',
			rawMenuList: [],
			fields: ['id', 'index', 'name', 'specifications', 'choosePrice', 'menuCount'], //index指序号
		},
		computed: {
			tablereserveList: function() {
				var that = this;
				return that.rawTableReserveList.map(function(tablereserve, index) {
					return {
						index: index + 1,
						nickname: getValue(tablereserve, 'customer.nickname'),
						number: getValue(tablereserve, 'box.roomNumber') + getValue(tablereserve, 'table.number'),
						reserveTime: getDateOfDateTime(getValue(tablereserve, 'reserveTime')),
						id: getValue(tablereserve, 'id')
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
			}
		},

		created: function() {
			var that = this;
			that.initRawtablereserveList();
		},

		methods: {
			initRawtablereserveList: function(PageNo, Param = null) {
				var that = this;
				var currentPageNo = PageNo || that.currentPageNo;
				var param = {
					currentPageNo: currentPageNo
				}
				if(Param != null) {
					var queryString = encodeURI(JSON.stringify(Param));
					param.queryString = queryString;
				}
				simpleAxios.get('tablereserve/back/listtablereserve?', {
					params: param
				}).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawTableReserveList = resData.tablereserves;
						that.totalPage = Math.ceil(resData.totalCount / resData.pageSize);
						that.totalCount = resData.totalCount;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},

			checkdish: function(tablereserve) {
				var that = this;
				var params = new FormData();
				var id = tablereserve.id;
				this.showDiv(tablereserve);
				simpleAxios.get('tablereserve/back/gettablereserve/' + id).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawMenuList = resData.tablereserve.menu;
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
				that.initRawtablereserveList(page, this.combinationParameter());
			},

			combinationParameter: function() {
				var that = this;
				var infor = that.inputs;
				var starttime = that.starttime;
				var endtime = that.endtime;
				var seattype = that.seattype;
				var params = {};
				this.infor(params, infor);
				this.time(params, starttime, endtime);
				this.seattypes(params, seattype);
				return params;
			},

			infor: function(params, infor) {
				if(infor != null && infor != "") {
					customers = {
						nickname: encodeURI(infor)
					}
					params.customer = customers;
				};
				return params;
			},

			time: function(params, starttime, endtime) {
				if((starttime != null && starttime != "") || (endtime != null && endtime != "")) {
					if(starttime != null && starttime != "") {
						params.reserveStartTime = starttime;
					}
					if((endtime != null && endtime != "") && (starttime == null || starttime == "")) {
						var endtimes = new Date(endtime);
						endtimes.setDate(endtimes.getDate() + 1);
						endtimes = globalGetToday('-', endtimes);
						params.reserveEndTime = endtimes;
					}
					if((endtime != null && endtime != "") && (starttime != null && starttime != "")) {
						var endtimes = new Date(endtime);
						endtimes.setDate(endtimes.getDate() + 1);
						endtimes = globalGetToday('-', endtimes);
						params.reserveEndTime = endtimes;
					}
					if((starttime != null && starttime != "") && (endtime != null && endtime != "") && (endtime < starttime)) { //如果用户选择的结束时间小于开始时间
						alert("结束时间不能小于开始时间");
						return;
					}
				}
				return params;
			},

			seattypes: function(params, seattype) {
				var that = this;
				if(seattype != '请选择') {
					params.type = encodeURI(seattype);
				} 
				return params;
			},

			hideDiv: function() {
				this.display = 'display : none';
			},
			showDiv: function(tablereserve) {
				this.display = 'display : block';
			},

			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawtablereserveList(that.currentPageNo, that.combinationParameter());
			},
			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initRawtablereserveList(currentPageNo, that.combinationParameter());
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
					that.initRawtablereserveList(currentPageNo, that.combinationParameter());
				}
			},
			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.initRawtablereserveList(that.totalPage, that.combinationParameter());
			}

		},

	})
});