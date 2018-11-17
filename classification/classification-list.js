
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {

	var classification = new Vue({
		el: '#classifications',
		data: {
			rawClassificationList: [],
			menuName : '',
		},
		computed: {
			classificationList : function(){
				return this.rawClassificationList.map(function(item,index){
					return {
						index : index + 1,
						id : item.id,
						name : item.name,
						subMenu : '<a href="../menu/menu-list.html?id='+item.id+'&name='+encodeURI(item.name)+'">查看菜品</a>'
					}
				});
			}
		},
		created: function() {
			this.initRawClassificationList();
		},
		methods:{


			refresh : function(){
				this.initRawClassificationList();
			},

			initRawClassificationList: function() {
				let app = this;
				app.getClassificationList();
			},

			getClassificationList: function() {
				var app = this;
				var url = 'classification/back/listclassification';
				simpleAxios.get(url).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						app.processRawClassificationList(res.data.classifications);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},
			
			processRawClassificationList : function(classifications){
				var app = this;
				if(Array.isArray(classifications)){//是数组
					app.rawClassificationList = classifications;
				}
			},
			
			updateClassification : function(index){
				var that = this;
				var item =  that.rawClassificationList[index];
				var jsonString = encodeURI(JSON.stringify(item));
				window.location.href="./add-update.html?item="+jsonString;
			},
			deleteClassification : function(index,id){
				
				console.log(index,id);
				if(window.confirm('确定要删除该分类以及该分类下所有产品吗?')){
					this.deleteClassificationBackEnd(index,id);
				}
			},
			
			deleteClassificationBackEnd : function(index,id){
				var app = this;
				simpleAxios.delete('classification/back/removeclassification/'+id).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('删除成功!');
						app.deleteClassificationFrontEnd(index);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(res);
				});
				
			},
			deleteClassificationFrontEnd : function(index){
				this.rawClassificationList.splice(index,1);
			},
			
			gotoMenuList : function(){
				var app = this;
				var url = '../menu/menu-list.html?name=' + encodeURI(app.menuName);
				document.location.href = url;
			}
			
		}
	});




})
