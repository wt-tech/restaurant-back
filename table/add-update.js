$(function() {

	var table = new Vue({
		el: '#table',
		data: {
			tableBak : {},
			table: {},
			type: 'add',
			tablePropertyValueReasonable : {
				tableNumber : true,
				tableNumberExist : true,
				tableName : true
			}
		},

		created: function() {
			this.initTable();
		},
		methods: {

			initTable: function() {
				var that = this;
				var queryString = window.location.search;
				if (queryString.length > 0) {
					queryString = queryString.substr(1, queryString.length - 1);
					try {
						var params = queryString.split('=')[1];
						var item = JSON.parse(decodeURI(params));
						if (item != null) {
							that.type = 'update';
							that.table = item;
							$.extend(that.tableBak,item);
						}
					} catch (e) { //发生异常就认为是add 而不是update.
						console.log(e);
						that.type = 'add';
						that.table = {};
					}
				}
			},
			
			checkIfValueChaned : function(){
				var res1= JSON.stringify(this.table);
				var res2= JSON.stringify(this.tableBak);
				return res1 != res2;
			},
			
			
			prpareUpdateParams : function(){
				var app = this;
				var params = new FormData();
				params.append('number',app.table.number);
				params.append('tableName',app.table.tableName);
				params.append('id',app.table.id);
				
				return params;
			},

			update: function() {
				var app = this;
				var url = 'table/back/updatetable';
				
				if(!app.checkIfValueChaned()){
					alert('请先修改');
					return false;
				}
					
				
				
				var params = app.prpareUpdateParams();
				simpleAxios.post(url, params).then(function(res) {
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
				var url = 'table/back/savetable';
				var params = new FormData();
				params.append('number',app.table.number);
				simpleAxios.post(url, params).then(function(res) {
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
				var that = this;
				if(!that.checkIfCanSubmit())//填写信息有误.
					return false;
					
				var type = that.type;
				if (type === 'add')
					that.add();
				else
					that.update();
			},
			
			checkIfCanSubmit : function(){
				var that = this;
				
				that.tableNameCheck();
				that.tableNumberCheck();
				
				var checkFileds = ['tableNumber','tableName','tableNumberExist'];
				var obj = that.tablePropertyValueReasonable;
				for(property in obj){
					if(checkFileds.indexOf(property) != -1 && !obj[property] )
						return false;
				}
				return true;
			},
			
			tableNameCheck : function(){
				var app = this;
				var table = app.table;
				app.tablePropertyValueReasonable.tableName = !(table.tableName && table.tableName.length > 20)
			},
			
			tableNumberCheck : function(){
				var app = this;
				var table = app.table;
				/*检查是否填写*/
				app.tablePropertyValueReasonable.tableNumber = !(!table.number || isNaN(table.number) || table.number < 0);
				/*检查是否重复录入该桌子,并且只有当输入的桌子号合法之后才检查*/
				if(app.tablePropertyValueReasonable.tableNumber){
					app.tableNumberExistCheck();
				}
			},
			
			tableNumberExistCheck : function(){
				var app = this;
				var table = app.table;
				/*如果桌子号没改动直接返回*/
				if(table.number == app.tableBak.number){
					app.tablePropertyValueReasonable.tableNumberExist = true;
					return;
				}
				var url = "table/back/tablecheck?tableNumber=" + table.number;
				simpleAxios.get(url).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.tablePropertyValueReasonable.tableNumberExist = !res.data.existFlag;
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
