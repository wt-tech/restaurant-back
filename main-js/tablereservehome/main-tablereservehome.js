//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#tablereservehome',
		data: {
			rawTableReserveHomeList: [],
			inputs: null,
			starttime: null,
			endtime: null,
			NewtableNum: null,
			tableReserveHomeId: null,
			Boxnum: '请选择',
			Tablenum: '请选择',
			timetype: '请选择',
			field: ['id', 'index', 'reservationsName', 'reservationsSex', 'reservationsTel', 'reservationsNum', 'reservationsStartTime', 'reserveTime', 'remarks', 'tableNum'], //index指序号
			totalCount: '',
			totalPage: '',
			currentPageNo: 1,
			display: 'display : none',
			displaytablenum: 'display : none',
			rawMenuList: [],
			fields: ['id', 'index', 'name', 'specifications', 'choosePrice', 'menuCount'], //index指序号
			BoxList: [],
			TableList: []
		},
		computed: {
			tablereservehomeList: function() {
				var that = this;
				return that.rawTableReserveHomeList.map(function(tablereservehome, index) {
					return {
						index: index + 1,
						reservationsName: getValue(tablereservehome, 'reservationsName'),
						reservationsSex: getValue(tablereservehome, 'reservationsSex'),
						reservationsTel: getValue(tablereservehome, 'reservationsTel'),
						reservationsNum: getValue(tablereservehome, 'reservationsNum'),
						reservationsStartTime: getDateOfDateTime(getValue(tablereservehome, 'reservationsStartTime')),
						reserveTime: getDateOfDateTime(getValue(tablereservehome, 'reserveTime')),
						remarks: getValue(tablereservehome, 'remarks'),
						tableNum: getValue(tablereservehome, 'tableNum'),
						id: getValue(tablereservehome, 'id')
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
			that.initRawtablereservehomeList();
		},

		methods: {
			initRawtablereservehomeList: function(PageNo, param = null) {
				var that = this;
				var currentPageNo = PageNo || that.currentPageNo;
				if(param != null) {
					param.currentPageNo = currentPageNo;
				} else
					param = {
						currentPageNo: currentPageNo
					};
				simpleAxios.get('tablereservehome/back/listtablereservehome?', {
					params: param
				}).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawTableReserveHomeList = resData.tablereservehomes;
						that.totalPage = Math.ceil(resData.totalCount / resData.pageSize);
						that.totalCount = resData.totalCount;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},

			checkdish: function(tablereservehome) {
				var that = this;
				var params = new FormData();
				var id = tablereservehome.id;
				this.showDiv(tablereservehome);
				simpleAxios.get('tablereservehome/back/gettablereservehome/' + id).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawMenuList = resData.tablereservehome.menu;
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
				that.initRawtablereservehomeList(page, this.combinationParameter());
			},

			combinationParameter: function() {
				var that = this;
				var infor = that.inputs;
				var starttime = that.starttime;
				var endtime = that.endtime;
				var timetype = that.timetype;
				var params = {};
				this.infor(params, infor);
				this.time(params, starttime, endtime, timetype);
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
			hideDiv: function() {
				this.display = 'display : none';
			},

			showDiv: function(tablereservehome) {
				this.display = 'display : block';
			},

			hideTablenum: function() {
				var that = this;
				that.NewtableNum = null;
				that.Tablenum = '请选择';
				that.Boxnum = '请选择';
				this.displaytablenum = 'display : none';
			},

			showTablenum: function(tablereservehome) {
				this.displaytablenum = 'display : block';
			},

			editTableNum: function(tablereservehome) {
				this.showTablenum(tablereservehome);
				this.tableReserveHomeId = tablereservehome.id;
				var that = this;
				simpleAxios.get('box/back/listbox').then(function(res) {
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							var resData = res.data;
							that.BoxList = resData.boxs;
						} else
							backEndExceptionHanlder(res);
					}).catch(function(err) {
						unknownError(err);
					}),
					simpleAxios.get('table/back/listtable').then(function(res) {
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							var resData = res.data;
							that.TableList = resData.tables;
						} else
							backEndExceptionHanlder(res);
					}).catch(function(err) {
						unknownError(err);
					})
			},

			addBoxNum: function() {
				var that = this;
				if(that.Boxnum != '请选择') {
					that.NewtableNum = that.Boxnum;
					that.Tablenum = '请选择';
				}
			},
			addTableNum: function() {
				var that = this;
				if(that.Tablenum != '请选择') {
					that.NewtableNum = that.Tablenum;
					that.Boxnum = '请选择';
				}
			},
			addFinalNum: function() {
				var that = this;
				var id = that.tableReserveHomeId;
				var NewtableNum = that.NewtableNum;
				if(NewtableNum == null || NewtableNum == "") return;
				var params = new FormData();
				params.append('id', id);
				params.append('tableNum', NewtableNum);
				simpleAxios.post('tablereservehome/back/updatetablenum', params).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						that.hideTablenum();
						alert("添加成功");
						that.initRawtablereservehomeList(that.currentPageNo, that.combinationParameter());
					} else {
						alert("添加失败");
						backEndExceptionHanlder(res);
					}
				}).catch(function(err) {
					unknownError(err);
				})
			},

			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawtablereservehomeList(that.currentPageNo, that.combinationParameter());
			},
			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initRawtablereservehomeList(currentPageNo, that.combinationParameter());
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
					that.initRawtablereservehomeList(currentPageNo, that.combinationParameter());
				}
			},
			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.initRawtablereservehomeList(that.totalPage, that.combinationParameter());
			}

		}
	})
});