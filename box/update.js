$(function() {
	var box = new Vue({
		el: '#box',
		data: {
			boxBak : null,
			boxChanged : false,
			box: {
				id : null,
				roomNumber : null,
				roomName : null,
				roomSize : null,
				roomIntroduction : null,
				url : null,//该值 等于 boximage[0].url
			},
			boxPropertyValueReasonable : {
				roomNumber : true,
				roomName : true,
				roomSize : true,
				roomIntroduction : true,
				image : true
			}
		},

		created : function(){
			this.initBox();
			if (this.box.id == null) {
				alert('请重新点击修改');
				return false;
			}
		},

		methods: {
			
			initBox : function(){
				var that = this;
				try {
					var queryString = document.location.search;
					queryString = queryString.substr(1, queryString.length - 1);
					var jsonBox = queryString.split('=')[1];
					var box = JSON.parse(decodeURI(jsonBox));
					box.url = getValue(box,'boximage.0.url');
					that.box = box;
					var boxBak = {};
					$.extend(boxBak,box);
					that.boxBak = boxBak;
				} catch (e) {
					that.box.id = null;
				}
			},
			
			
			submit: function() {
				if(!this.checkIfCanSubmit())//检查是否所填值合适
					return;
				if(!this.checkIfValueChaned()){//检查是否修改
					alert('请先修改后再提交');
					return;
				}
				this.updateBoxBackEnd();
			},

			prepareParams: function() {
				var params = new FormData();
				for(property in this.box){
					if(this.box[property] && property !== 'boximage')
						params.append(property,this.box[property]);
				}
				var image = document.getElementById('box-image').files[0];
				if(image)
					params.append('boxImg', image);
				return params;
			},

			updateBoxBackEnd: function() {
				var app = this;
				var url = 'box/back/updatebox';
				var formData = app.prepareParams();
				fileAxios.post(url, formData).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('修改成功');
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},

			checkIfValueChaned : function(){
				if(this.boxChanged)
					return true;
				var res1= JSON.stringify(this.box);
				var res2= JSON.stringify(this.boxBak);
				
				return res1 != res2;
			},


			fileChange: function() {
				this.boxChanged = true;
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
				
				var checkFileds = ['roomNumber','roomName','roomSize','image'];
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
				console.log(box.roomNumber);
				console.log(isNaN(box.roomNumber));
				console.log(box.roomNumber < 0);
				console.log(!(isNaN(box.roomNumber) || box.roomNumber < 0));
				app.boxPropertyValueReasonable.roomNumber = !(!box.roomNumber || isNaN(box.roomNumber) || box.roomNumber < 0);
			},
			roomSizeCheck : function(){
				var app = this;
				var box = app.box;
				app.boxPropertyValueReasonable.roomSize = !(isNaN(box.roomSize) || box.roomSize < 1 );
			}
		}
	});
});
