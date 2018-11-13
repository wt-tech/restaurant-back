$(function() {

	var menu = new Vue({
		el: '#menu',
		data: {
			menuBak : null,
			menuChanged : false,
			menu: {
				classification: {
					id: null
				},
				name: '',
				largePrice: null,
				mediumPrice: null,
				smallPrice: null,
				salesVolume: null,
				url : null,//该值 等于 menuimage[0].url
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
			this.initMenu();
			if (this.menu.classification.id == null) {
				alert('请重新点击修改');
				return false;
			}
		},

		mounted: function() {
			var app = this;
			this.$nextTick(function() {
				app.initCheckBox();
			})
		},


		methods: {

			initMenu: function() {
				var that = this;
				try {
					var queryString = document.location.search;
					queryString = queryString.substr(1, queryString.length - 1);
					var josnMenu = queryString.split('=')[1];
					var menu = JSON.parse(decodeURI(josnMenu));
					menu.url = getValue(menu,'menuimage.0.url');
					that.menu = menu;
					var menuBak = {};
					$.extend(menuBak,menu);
					that.menuBak = menuBak;
				} catch (e) {
					that.menu.classification.id = null;
				}
			},

			submit: function() {
				if(!this.checkIfCanSubmit())//检查是否所填值合适
					return;
				if(!this.checkIfValueChaned()){//检查是否修改
					alert('请先修改后再提交');
					return;
				}
				this.updateMenuBackEnd();
			},

			prepareParams: function() {
				var params = new FormData();
				params.append('jsonMenu', encodeURI(JSON.stringify(this.menu)));
				var image = document.getElementById('menu-image').files[0];
				console.log(image);
				if(image)
					params.append('menuImg', image);
				return params;
			},

			updateMenuBackEnd: function() {
				var app = this;
				var url = 'menu/back/updatemenu';
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
				if(this.menuChanged)
					return true;
				var res1= JSON.stringify(this.menu);
				var res2= JSON.stringify(this.menuBak);
				
				return res1 != res2;
			},

			fileChange: function() {
				this.menuChanged = true;
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

			initCheckBox: function() {
				var largeElements = document.getElementsByClassName('large');
				var mediumElements = document.getElementsByClassName('medium');
				var smallElements = document.getElementsByClassName('small');

				if (this.menu.largePrice) { //有值
					largeElements[0].checked = true;
					largeElements[1].removeAttribute('disabled')
				} else { //没值
					largeElements[0].removeAttribute('checked');
					largeElements[1].disabled = true;
				}
				if (this.menu.mediumPrice) {
					mediumElements[0].checked = true;
					mediumElements[1].removeAttribute('disabled')
				} else { //没值
					mediumElements[0].removeAttribute('checked');
					mediumElements[1].disabled = true;
				}
				if (this.menu.smallPrice) {
					smallElements[0].checked = true;
					smallElements[1].removeAttribute('disabled')
				} else { //没值
					smallElements[0].removeAttribute('checked');
					smallElements[1].disabled = true;
				}
			},

			checkboxChanged: function(event, type) {
				var checked = event.target.checked;
				var element = document.getElementsByClassName(type)[1];
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
				// app.imagecheck();
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
			
// 			imagecheck : function(){
// 				var app = this;
// 				var file = document.getElementById('menu-image').files;
// 				app.menuPropertyValueReasonable.image = !(!file || file.length == 0);
// 				var img = document.getElementById('preview');	
// 			},
			
			imageNotExist : function(event){
				console.log(event);
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
