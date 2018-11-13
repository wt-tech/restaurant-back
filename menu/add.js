$(function() {

	var menu = new Vue({
		el: '#menu',
		data: {
			menu: {
				classification: {
					id: null
				},
				name: '',
				largePrice: null,
				mediumPrice: null,
				smallPrice: null,
				salesVolume: null,
			},
			menuPropertyValueReasonable : {
				name: true,
				largePrice: true,
				mediumPrice: true,
				smallPrice: true,
				salesVolume: true,
				image : true,
				atLeastCheckOnePrice : true
			}
		},

		computed: {


		},

		created: function() {
			this.initClassificationId();
			if (this.menu.classification.id == null) {
				alert('请重新点击新增菜品');
			}
		},



		methods: {

			initClassificationId: function() {
				var that = this;
				try {
					var queryString = document.location.search;
					queryString = queryString.substr(1, queryString.length - 1);
					var classificationID = queryString.split('=')[1];
					that.menu.classification.id = classificationID;
				} catch (e) {
					console.log(e);
					that.menu.classification.id = null;
				}
			},

			submit: function() {
				if(this.checkIfCanSubmit())
					this.addNewMenuBackEnd();
			},

			prepareParams: function() {
				var params = new FormData();
				params.append('jsonMenu', encodeURI(JSON.stringify(this.menu)));
				var image = document.getElementById('menu-image').files[0];
				params.append('menuImg', image);
				return params;
			},

			addNewMenuBackEnd: function() {
				var app = this;
				var url = 'menu/back/savemenu';
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
					var file = document.getElementById('menu-image').files[0];
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

			checkboxChanged: function(event, type) {
				var checked = event.target.checked;
				var element = document.getElementById(type);
				if (checked) {
					element.removeAttribute('disabled')
				} else{
					element.disabled = true;
					//同时还要设置对应的price为0
					var property = type+'Price';
					this.menu[property] = 0;
				}
			},
			
			checkIfCanSubmit : function(){
				var app = this;
				
				app.nameCheck();
				app.salesVolumeCheck();
				app.imagecheck();
				app.atLeastCheckOnePrice();
				
				var checkFileds = ['name','atLeastCheckOnePrice','salesVolume','image'];
				var obj = app.menuPropertyValueReasonable;
				for(property in obj){
					if(checkFileds.indexOf(property) != -1 && !obj[property] )
						return false;
				}
				return true;
			},
			
			nameCheck : function(){
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.name = (menu.name || menu.name.length > 20)
			},
			salesVolumeCheck : function(){
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.salesVolume = !(isNaN(menu.salesVolume) || menu.salesVolume < 0);
			},
			largePriceCheck : function(){
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.largePrice = !(isNaN(menu.largePrice) || menu.largePrice < 0 || menu.largePrice == 0);
			},
			
			mediumPriceCheck : function(){
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.mediumPrice = !(isNaN(menu.mediumPrice) || menu.mediumPrice < 0 || menu.mediumPrice == 0);
			},
			
			smallPriceCheck : function(){
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.smallPrice = !(isNaN(menu.smallPrice) || menu.smallPrice < 0 || menu.smallPrice == 0);
			},
			
			imagecheck : function(){
				var app = this;
				var file = document.getElementById('menu-image').files;
				app.menuPropertyValueReasonable.image = !(!file || file.length == 0);
			},
			
			atLeastCheckOnePrice : function(){
				var app = this;
				var menu = app.menu;
				var prices = ['smallPrice','mediumPrice','largePrice'];
				for(var price of prices){
					if(menu[price] && app.menuPropertyValueReasonable[price]){
						app.menuPropertyValueReasonable.atLeastCheckOnePrice = true;
						return;
					}
				}
				app.menuPropertyValueReasonable.atLeastCheckOnePrice = false;
			}
			
		}
	});
});