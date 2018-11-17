
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	
	var comboes = new Vue({
		el: '#combo',
		data: {
			rawComboList: [],
		},
		computed: {
			comboList : function(){
				return this.rawComboList.map(function(item,index){
					return {
						index : index + 1,
						id : item.id,
						comboName : item.comboName,
						comboIntroduction : item.comboIntroduction,
						comboPrice : item.comboPrice,
						comboimage : '<img alt="尚未上传图片" style="width:80px;height:80px;" src="' + getValue(item,'comboimage.0.url') + '"></img>',
					}
				});
			}
		},
		created: function() {
			this.initRawComboList();
		},
		methods:{

			refresh : function(){
				this.initRawComboList();
			},

			initRawComboList: function() {
				let app = this;
				app.getComboList();
			},

			getComboList: function() {
				var app = this;
				var url = 'combo/back/listcombo?currentPageNo=1';
				simpleAxios.get(url).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						app.processRawComboList(res.data.combos);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},
			
			processRawComboList : function(classifications){
				var app = this;
				if(Array.isArray(classifications)){//是数组
					app.rawComboList = classifications;
				}
			},
			
			updateCombo : function(index){
				var that = this;
				var item =  that.rawComboList[index];
				var jsonString = encodeURI(JSON.stringify(item));
				window.location.href="./update.html?item="+jsonString;
			},
			
			deleteCombo : function(index,id){
				if(window.confirm('确定要删除该包厢吗?')){
					this.deleteComboBackEnd(index,id);
				}
			},
			
			deleteComboBackEnd : function(index,id){
				var app = this;
				simpleAxios.delete('combo/back/removecombo/'+id).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('删除成功!');
						app.deleteComboFrontEnd(index);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				});
				
			},
			deleteComboFrontEnd : function(index){
				this.rawComboList.splice(index,1);
			}
			
		}
	});
})
