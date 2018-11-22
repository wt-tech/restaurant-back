$(function() {

	var box = new Vue({
		el: '#box',
		data: {
			box: {
				roomNumber : null,
				roomName : null,
				roomSize : null,
				roomIntroduction : null
			},
			boxPropertyValueReasonable : {
				roomNumber : true,
				roomName : true,
				roomSize : true,
				roomIntroduction : true,
				image : true,
				roomNumberExist : true
			}
		},

		methods: {
			
			submit: function() {
				if(this.checkIfCanSubmit())
					this.addNewBoxBackEnd();
			},

			prepareParams: function() {
				var params = new FormData();
				// params.append('jsonBox', encodeURI(JSON.stringify(this.box)));
				for(property in this.box){
					if(this.box[property])
						params.append(property,this.box[property]);
				}
				var image = document.getElementById('box-image').files[0];
				params.append('boxImg', image);
				return params;
			},

			addNewBoxBackEnd: function() {
				var app = this;
				var url = 'box/back/savebox';
				var formData = app.prepareParams();
				fileAxios.post(url, formData).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('添加成功');
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},

			fileChange: function() {
				var img = document.getElementById('preview');
				try {
					var file = document.getElementById('box-image').files[0];
					var imageType = /^image\//;
					if (!imageType.test(file.type))
						return;
				} catch (e) {
					console.log(e);
					img.src = '';
					return;
				}

				//开始处理
				img.file = file;
				var reader = new FileReader();
				//onload 该事件在读取操作完成时触发。
				reader.onload = (function(img) {
					return function(e) {
						img.src = e.target.result;
					};
				})(img);
				reader.readAsDataURL(file);
			},


			
			checkIfCanSubmit : function(){
				var app = this;
				
				app.roomNameCheck();
				app.roomNumberCheck();
				app.roomSizeCheck();
				app.imagecheck();
				
				var checkFileds = ['roomNumber','roomName','roomSize','image','roomNumberExist'];
				var obj = app.boxPropertyValueReasonable;
				for(property in obj){
					if(checkFileds.indexOf(property) != -1 && !obj[property] )
						return false;
				}
				return true;
			},
			
			roomNameCheck : function(){
				var app = this;
				var box = app.box;
				app.boxPropertyValueReasonable.roomName = !(box.roomName && box.roomName.length > 20)
			},
			roomNumberCheck : function(){
				var app = this;
				var box = app.box;
				/*检查是否填写*/
				app.boxPropertyValueReasonable.roomNumber = !(!box.roomNumber || isNaN(box.roomNumber) || box.roomNumber < 0);
				/*检查是否重复录入该包厢,并且只有当输入的包厢号合法之后才检查*/
				if(app.boxPropertyValueReasonable.roomNumber){
					app.roomNumberExistCheck();
				}
			},
			
			roomNumberExistCheck : function(){
				var app = this;
				var box = app.box;
				var url = "box/back/boxcheck?roomNumber=" + box.roomNumber;
				simpleAxios.get(url).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.boxPropertyValueReasonable.roomNumberExist = !res.data.existFlag;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},
			
			roomSizeCheck : function(){
				var app = this;
				var box = app.box;
				app.boxPropertyValueReasonable.roomSize = !(isNaN(box.roomSize) || box.roomSize < 1 );
			},
			
			imagecheck : function(){
				var app = this;
				var file = document.getElementById('box-image').files;
				app.boxPropertyValueReasonable.image = !(!file || file.length == 0);
			}
			
		}
	});
});
