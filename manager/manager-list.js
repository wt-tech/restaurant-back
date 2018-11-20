
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {

	var manager = new Vue({
		el: '#managers',
		data: {
			rawManagerList: [],
			loadingComplete : false,
			icbxd : null
		},
		computed: {
			managerList : function(){
				return this.rawManagerList.map(function(item,index){
					return {
						index : index + 1,
						icbxd : item
					}
				});
			}
		},
		created: function() {
			this.initRawManagerList();
		},
		methods:{


			refresh : function(){
				this.initRawManagerList();
			},

			initRawManagerList: function() {
				let app = this;
				app.getManagerList();
			},

			getManagerList: function() {
				var app = this;
				var url = 'customer/back/manager';
				app.loadingComplete = false;
				simpleAxios.get(url).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						app.processRawManagerList(res.data.managerList);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {
					app.loadingComplete = true;
				});
			},
			
			processRawManagerList : function(managers){
				var app = this;
				if(Array.isArray(managers)){//是数组
					app.rawManagerList = managers;
				}
			},
			
			deleteManager : function(icbxd,index){
				var tips = '确定要移除' + icbxd + '号管理员吗';
				if(window.confirm(tips)){
					this.deleteManagerBackEnd(icbxd,index);
				}
			},
			
			deleteManagerBackEnd : function(icbxd,index){
				var app = this;
				app.loadingComplete = false;
				params = new FormData();
				params.append('icbxd',icbxd);
				simpleAxios.post('customer/back/dmanager',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('删除成功!');
						app.deleteManagerFrontEnd(index);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(res);
				}).finally(function() {
					app.loadingComplete = true;
				});
				
			},
			deleteManagerFrontEnd : function(index){
				this.rawManagerList.splice(index,1);
			},
			
			checkIcbxdResonable : function(){
				return !isNaN(this.icbxd) && this.icbxd && this.icbxd > 0;
			},
			
			addManager : function(){
				var app = this;
				if(app.checkIcbxdResonable())
					app.addManagerBackEnd();
				else
					alert('用户编号格式不正确');
			},
			
			addManagerBackEnd : function(){
				
				var app = this;
				app.loadingComplete = false;
				params = new FormData();
				params.append('icbxd',app.icbxd);
				
				simpleAxios.post('customer/back/amanager',params).then(function(res){	
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('添加成功!');
						app.refresh();
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(res);
				}).finally(function() {
					app.loadingComplete = true;
				});
			},
		}
	});




})
