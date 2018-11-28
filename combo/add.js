$(function() {

	var combo = new Vue({
		el: '#combo',
		data: {
			combo: {
				id: null,
				comboName: null,
				comboPrice: null,
				comboIntroduction: null,
			},
			comboPropertyValueReasonable: {
				comboName: true,
				comboPrice: true,
				comboIntroduction: true,
				image: true,
				image2: true
			}
		},

		methods: {

			submit: function() {
				if(this.checkIfCanSubmit())
					this.addNewComboBackEnd();
			},

			prepareParams: function() {
				var params = new FormData();
				// params.append('jsonCombo', encodeURI(JSON.stringify(this.combo)));
				for(property in this.combo) {
					if(this.combo[property])
						params.append(property, this.combo[property]);
				}
				var image = document.getElementById('combo-image').files[0];
				var image2 = document.getElementById('combo-image2').files[0];
				params.append('comboImg', image);
				params.append('comboImg2', image2);
				return params;
			},

			addNewComboBackEnd: function() {
				var app = this;
				var url = 'combo/back/savecombo';
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
					var file = document.getElementById('combo-image').files[0];
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
			
			fileChange2: function() {
				var img2= document.getElementById('preview2');
				try {
					var file = document.getElementById('combo-image2').files[0];
					var imageType = /^image\//;
					if(!imageType.test(file.type))
						return;
				} catch(e) {
					console.log(e);
					img2.src = '';
					return;
				}

				//开始处理
				img2.file = file;
				var reader = new FileReader();
				//onload 该事件在读取操作完成时触发。
				reader.onload = (function(img2) {
					return function(e) {
						img2.src = e.target.result;
					};
				})(img2);
				reader.readAsDataURL(file);
			},

			checkIfCanSubmit: function() {
				var app = this;

				app.comboNameCheck();
				app.comboPriceCheck();
				app.imagecheck();

				var checkFileds = ['comboName', 'comboPrice', 'image','image2'];
				var obj = app.comboPropertyValueReasonable;
				for(property in obj) {
					if(checkFileds.indexOf(property) != -1 && !obj[property])
						return false;
				}
				return true;
			},

			comboNameCheck: function() {
				var app = this;
				var combo = app.combo;
				app.comboPropertyValueReasonable.comboName = !(!combo.comboName || combo.comboName.length > 20)
			},

			comboPriceCheck: function() {
				var app = this;
				var combo = app.combo;
				app.comboPropertyValueReasonable.comboPrice = !(!combo.comboPrice || isNaN(combo.comboPrice) || combo.comboPrice < 0);
			},

			imagecheck: function() {
				var app = this;
				var file = document.getElementById('combo-image').files;
				var file2 = document.getElementById('combo-image2').files;
				app.comboPropertyValueReasonable.image = !(!file || file.length == 0);
				app.comboPropertyValueReasonable.image2 = !(!file2 || file2.length == 0);
			}
		}
	});
});