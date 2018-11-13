
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {

	var classification = new Vue({
		el: '#boxes',
		data: {
			rawBoxList: [],
		},
		computed: {
			boxList : function(){
				return this.rawBoxList.map(function(item,index){
					return {
						index : index + 1,
						id : item.id,
						roomNumber : item.roomNumber,
						roomName : item.roomName,
						roomSize : item.roomSize,
						roomIntroduction : item.roomIntroduction,
						boximage : '<img alt="尚未上传图片" style="width:80px;height:80px;" src="' + getValue(item,'boximage.0.url') + '"></img>',
					}
				});
			}
		},
		created: function() {
			this.initRawBoxList();
		},
		methods:{


			refresh : function(){
				this.initRawBoxList();
			},

			initRawBoxList: function() {
				let app = this;
				app.getBoxList();
			},

			getBoxList: function() {
				var app = this;
				var url = 'box/listbox?currentPageNo=1';
				simpleAxios.get(url).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						app.processRawBoxList(res.data.boxs);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},
			
			processRawBoxList : function(classifications){
				var app = this;
				if(Array.isArray(classifications)){//是数组
					app.rawBoxList = classifications;
				}
			},
			
			updateBox : function(index){
				var that = this;
				var item =  that.rawBoxList[index];
				var jsonString = encodeURI(JSON.stringify(item));
				window.location.href="./update.html?item="+jsonString;
			},
			
			deleteBox : function(index,id){
				if(window.confirm('确定要删除该包厢吗?')){
					this.deleteBoxBackEnd(index,id);
				}
			},
			
			deleteBoxBackEnd : function(index,id){
				var app = this;
				simpleAxios.delete('box/back/removebox/'+id).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('删除成功!');
						app.deleteBoxFrontEnd(index);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				});
				
			},
			deleteBoxFrontEnd : function(index){
				this.rawBoxList.splice(index,1);
			}
			
		}
	});
})
