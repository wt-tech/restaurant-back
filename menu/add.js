$(function() {

	var menu = new Vue({
		el: '#menu',
		data: {
			classificationList: [],
			menu: {
				classification: {
					id: null
				},
				name: '',
				largePrice: null,
				mediumPrice: null,
				smallPrice: null,
				uncertainPrice: null,
				salesVolume: null,
				unit:'份'
			},
			menuPropertyValueReasonable: {
				name: true,
				largePrice: true,
				mediumPrice: true,
				smallPrice: true,
				salesVolume: true,
				image: true,
				classification: true,
				atLeastCheckOnePrice: true
			}
		},

		computed: {

		},

		created: function() {
			this.initClassificationList();
			this.initClassificationId();
		},

		methods: {

			initClassificationList: function() {
				var app = this;
				simpleAxios.get('classification/back/listclassification').then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						app.classificationList = res.data.classifications;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},

			initClassificationId: function() {
				var that = this;
				try {
					var queryString = document.location.search;
					queryString = queryString.substr(1, queryString.length - 1);
					var classificationID = queryString.split('=')[1];
					that.menu.classification.id = classificationID;
				} catch(e) {
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
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
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
					if(!imageType.test(file.type))
						return;
				} catch(e) {
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
				if(checked) {
					element.removeAttribute('disabled');
					this.menu.uncertainPrice = null;
				} else {
					element.disabled = true;
					//同时还要设置对应的price为0
					var property = type + 'Price';
					this.menu[property] = 0;
				}
			},

			checkIfCanSubmit: function() {
				var app = this;

				app.nameCheck();
				app.classificationCheck();
				app.salesVolumeCheck();
				app.imagecheck();
				app.atLeastCheckOnePrice();

				var checkFileds = ['name', 'atLeastCheckOnePrice', 'salesVolume', 'image'];
				var obj = app.menuPropertyValueReasonable;
				for(property in obj) {
					if(checkFileds.indexOf(property) != -1 && !obj[property])
						return false;
				}
				return true;
			},

			nameCheck: function() {
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.name = (menu.name || menu.name.length > 20);
			},

			classificationCheck: function() {
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.classification = (menu.classification.id);
			},

			salesVolumeCheck: function() {
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.salesVolume = !(isNaN(menu.salesVolume) || menu.salesVolume < 0);
			},
			largePriceCheck: function() {
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.largePrice = !(isNaN(menu.largePrice) || menu.largePrice < 0 || menu.largePrice == 0);
			},

			mediumPriceCheck: function() {
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.mediumPrice = !(isNaN(menu.mediumPrice) || menu.mediumPrice < 0 || menu.mediumPrice == 0);
			},

			smallPriceCheck: function() {
				var app = this;
				var menu = app.menu;
				app.menuPropertyValueReasonable.smallPrice = !(isNaN(menu.smallPrice) || menu.smallPrice < 0 || menu.smallPrice == 0);
			},

			uncertainPriceCheck: function() {
				var app = this;
				var menu = app.menu;
				var types = ['large', 'medium', 'small'];
				for(var type of types) {
					var element = document.getElementById(type);
					var mychk = document.getElementsByName("Price");
					element.disabled = true;
					for(var i = 0; i < mychk.length; i++) {
						mychk[i].checked = false;
					}
				}
				menu.largePrice = null;
				menu.mediumPrice = null;
				menu.smallPrice = null;
			},
			imagecheck: function() {
				var app = this;
				var file = document.getElementById('menu-image').files;
				app.menuPropertyValueReasonable.image = !(!file || file.length == 0);
			},

			atLeastCheckOnePrice: function() {
				var app = this;
				console.log(app.menu.uncertainPrice);
				var menu = app.menu;
				var prices = ['smallPrice', 'mediumPrice', 'largePrice'];
				for(var price of prices) {
					if(menu[price] && app.menuPropertyValueReasonable[price]) {
						app.menuPropertyValueReasonable.atLeastCheckOnePrice = true;
						return;
					} else if(app.menu.uncertainPrice == '可预订' || app.menu.uncertainPrice == '时价') {
						app.menuPropertyValueReasonable.atLeastCheckOnePrice = true;
						return;
					}
				}
				app.menuPropertyValueReasonable.atLeastCheckOnePrice = false;
			}

		}
	});
});