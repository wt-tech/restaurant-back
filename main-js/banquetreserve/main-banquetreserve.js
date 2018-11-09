//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#banquetreserve',
		data: {
			rawBanquetReserveList: [],
			field: ['id', 'index', 'reservationsName', 'reservationsSex', 'reservationsTel', 'reservationsNum', 'reservationsCombo', 'reservationsStartTime','reserveTime', 'remarks'], //index指序号
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
						reservationsCombo: getValue(banquetreserve, 'combo.comboName')+'('+getValue(banquetreserve, 'combo.comboPrice')+'元/桌)',
						reservationsStartTime: getDateOfDateTime(getValue(banquetreserve, 'reservationsStartTime')),
						reserveTime: getDateOfDateTime(getValue(banquetreserve, 'reserveTime')),
						remarks: getValue(banquetreserve, 'remarks'),
						id: getValue(banquetreserve, 'id')
					};
				});
			}
		},

		created: function() {
			var that = this;
			that.initRawbanquetreserveList();
		},

		methods: {
			initRawbanquetreserveList: function(PageNo) {
				var that = this;
				var currentPageNo = PageNo || that.currentPageNo;
				simpleAxios.get('banquetreserve/back/listbanquetreserve?currentPageNo=' + currentPageNo).then(function(res) {
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