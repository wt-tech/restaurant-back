//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#dishorder',
		data: {
			currentSelectedDishOrder: '', //保存 点击查看菜品 对应的订单信息 json string格式
			rawDishOrderList: [],
			inputs: null,
			disabled: false,
			remarkObj: {
				remark: null,
			},
			Remarks: null,
			totalpay: null,
			totalamount: 0,
			starttime: null,
			endtime: null,
			dishorderId: null, //订单id，添加备注
			reservetype: '请选择',
			paystatus: '请选择',
			field: ['id', 'index', 'orderNumber', 'reserveType', 'totalCount', 'totalAmount', 'totalPayAmount', 'createTime', 'orderStatus', 'remarks'], //index指序号
			totalCount: '',
			totalPage: '',
			currentPageNo: 1,
			display: 'display : none',
			displays: 'display : none',
			displaymark: 'display : none',
			displaypay: 'display : none',
			rawMenuList: [],
			fields: ['id', 'index', 'name', 'specifications', 'unitPrice', 'dishCount', 'totalprice'], //index指序号
			rawBoxList: [],
			fieldbox: ['id', 'index', 'roomNumber', 'roomName', 'roomIntroduction'] //index指序号
		},
		computed: {
			dishorderList: function() {
				var that = this;
				return that.rawDishOrderList.map(function(dishorder, index) {
					return {
						index: index + 1,
						id: getValue(dishorder, 'id'),
						orderNumber: getValue(dishorder, 'orderNumber'),
						reserveType: getValue(dishorder, 'reserveType'),
						totalCount: getValue(dishorder, 'totalCount'),
						totalAmount: getValue(dishorder, 'totalAmount'),
						totalPayAmount: getValue(dishorder, 'totalPayAmount'),
						createTime: getValue(dishorder, 'createTime'),
						orderStatus: getValue(dishorder, 'orderStatus') === true ? '已付款' : '未付款',
						//remarks: getValue(dishorder, 'remark')
						remarks: '<div style="width:150px;white-space:normal;line-height:15px;">'+getValue(dishorder, 'remark')+'</div>'
					};
				});
			},
			menuList: function() {
				var that = this;
				return that.rawMenuList.map(function(dishorderline, index) {
					return {
						index: index + 1,
						name: getValue(dishorderline, 'menu.name'),
						dishCount: getValue(dishorderline, 'dishCount'),
						specifications: getValue(dishorderline, 'specifications'),
						unitPrice: getValue(dishorderline, 'unitPrice'),
						totalprice: getValue(dishorderline, 'unitPrice') == '可预订' || getValue(dishorderline, 'unitPrice') == '时价' ? null : getValue(dishorderline, 'dishCount') * getValue(dishorderline, 'unitPrice'),
						id: getValue(dishorderline, 'id')
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
						roomIntroduction: getValue(box, 'roomIntroduction'),
						id: getValue(box, 'id')
					};
				});
			}
		},

		created: function() {
			var that = this;
			that.initRawdishorderList();
		},

		methods: {
			initRawdishorderList: function(PageNo, param = null) {
				var that = this;
				var currentPageNo = PageNo || that.currentPageNo;
				if(param != null) {
					param.currentPageNo = currentPageNo;
				} else
					param = {
						currentPageNo: currentPageNo
					};
				simpleAxios.get('dishorder/back/listdishorder', {
					params: param
				}).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawDishOrderList = resData.dishorders;
						that.totalPage = Math.ceil(resData.totalCount / resData.pageSize);
						that.totalCount = resData.totalCount;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},
			checkdish: function(dishorder, content) {
				var that = this;
				var params = new FormData();
				var id = dishorder.id;
				if('包厢' == content) {
					this.showDivs(dishorder);
					simpleAxios.get('dishorder/back/listdishorderbox/' + id).then(function(res) {
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							var resData = res.data;
							that.rawBoxList = resData.dishorderbox;
						} else
							backEndExceptionHanlder(res);
					}).catch(function(err) {
						unknownError(err);
					})
				} else { //查看菜品信息
					this.showDiv(dishorder);
					this.currentSelectedDishOrder = encodeURI(JSON.stringify(dishorder));
					simpleAxios.get('dishorder/back/listdishordermenu/' + id).then(function(res) {
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							var resData = res.data;
							that.rawMenuList = resData.dishordermenu;
							console.log(that.rawMenuList);
						} else
							backEndExceptionHanlder(res);
					}).catch(function(err) {
						unknownError(err);
					})
				}
			},

			submit: function() {
				var page = 1;
				var that = this;
				that.currentPageNo = 1;
				that.initRawdishorderList(page, that.combinationParameter());
			},

			combinationParameter: function() {
				var that = this;
				var infor = that.inputs;
				var starttime = that.starttime;
				var endtime = that.endtime;
				var timetype = that.timetype;
				var reservetype = that.reservetype;
				var paystatus = that.paystatus;
				var params = {};
				this.infor(params, infor);
				this.time(params, starttime, endtime);
				this.reservetypes(params, reservetype);
				this.paystatuss(params, paystatus);
				console.log(params);
				return params;
			},

			infor: function(params, infor) {
				var reg = /^\d+$/;
				if(infor != null && infor != "") {
					if(reg.test(infor) === true) {
						params.tableOrboxNum = infor;
					} else {
						alert("您输入的格式可能不正确");
						return;
					}
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

			reservetypes: function(params, reservetype) {
				if(reservetype != '请选择') {
					params.reserveType = encodeURI(reservetype);
				}
				return params;
			},

			paystatuss: function(params, paystatus) {
				if(paystatus != '请选择') {
					params.orderStatus = paystatus;
				}
				return params;
			},

			submitRemark: function() {
				var that = this;
				var id = that.dishorderId;
				//console.log(id);
				var remark = that.remarkObj.remark;
				//console.log(remark);
				var params = new FormData();
				params.append('id', id);
				params.append('remark', remark);
				simpleAxios.post('dishorder/back/updatedishorderremark', params).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						that.hideDivMark();
						alert("提交成功");
						that.initRawdishorderList(that.currentPageNo, that.combinationParameter());
					} else {
						alert("提交失败");
						backEndExceptionHanlder(res);
					}
				}).catch(function(err) {
					unknownError(err);
				})
			},

			submitPay: function() {
				var that = this;
				var id = that.dishorderId;
				var totalpay = that.totalpay;
				if(totalpay == null || totalpay == "") return;
				var params = new FormData();
				params.append('id', id);
				params.append('totalPayAmount', totalpay);
				simpleAxios.post('dishorder/back/updatedishorderstatus', params).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						that.hideDivPay();
						alert("结算成功");
						that.initRawdishorderList(that.currentPageNo, that.combinationParameter());
					} else {
						alert("结算失败");
						backEndExceptionHanlder(res);
					}
				}).catch(function(err) {
					unknownError(err);
				})
			},

			goToPrintPage: function() {
				window.open("./print-menu.html?dishorder=" + this.currentSelectedDishOrder);
			},

			hideDiv: function() {
				this.display = 'display : none';
			},
			hideDivs: function() {
				this.displays = 'display : none';
			},
			hideDivMark: function() {
				this.displaymark = 'display : none';
			},
			hideDivPay: function() {
				this.displaypay = 'display : none';
			},
			showDiv: function(dishorder) {
				this.display = 'display : block';
			},
			showDivs: function(dishorder) {
				this.displays = 'display : block';
			},
			showDivMark: function(dishorder) {
				var that = this;
				that.displaymark = 'display : block';
				var id = dishorder.id;
				that.dishorderId = id;
				simpleAxios.get('dishorder/back/getdishorderremark/' + id).then(function(res) {
					//console.log(this);
					//console.log(that);
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data.dishorder;
						//console.log(res.data);
						if(resData == null || resData == "") {
							that.remarkObj = {};
						} else {
							that.remarkObj = resData;
						}
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},

			showDivPay: function(dishorder) {
				var that = this;
				that.displaypay = 'display : block';
				that.dishorderId = dishorder.id;
				if(dishorder.remarks == null || dishorder.remarks == "") {
					that.Remarks = '该订单暂无备注';
				} else {
					that.Remarks = that.remarkObj.remark;
				}
				that.totalamount = dishorder.totalAmount;
				//console.log(that.remarks);
			},

			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawdishorderList(that.currentPageNo, that.combinationParameter());
			},
			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initRawdishorderList(currentPageNo, that.combinationParameter());
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
					that.initRawdishorderList(currentPageNo, that.combinationParameter());
				}
			},
			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.initRawdishorderList(that.totalPage, that.combinationParameter());
			}

		},

	})
});