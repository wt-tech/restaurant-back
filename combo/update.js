$(function() {

	var combo = new Vue({
		el: '#combo',
		data: {
			comboBak: null,
			comboChanged: false,
			combo: {
				id: null,
				comboName: null,
				comboPrice: null,
				comboIntroduction: null,
				url: null, //该值 等于 comboimage[0].url
				url2: null //该值 等于 comboimage[0].url
			},
			comboPropertyValueReasonable: {
				comboName: true,
				comboPrice: true,
				comboIntroduction: true,
				image: true,
				image2: true
			}
		},

		created: function() {
			this.initCombo();
			if(this.combo.id == null) {
				alert('请重新点击修改');
				return false;
			}
		},

		methods: {

			initCombo: function() {
				var that = this;
				try {
					var queryString = document.location.search;
					queryString = queryString.substr(1, queryString.length - 1);
					var jsonCombo = queryString.split('=')[1];
					var combo = JSON.parse(decodeURI(jsonCombo));
					combo.url = getValue(combo, 'comboimage.0.url');
					combo.url2 = getValue(combo, 'comboimage.0.url2');
					that.combo = combo;
					var comboBak = {};
					$.extend(comboBak, combo);
					that.comboBak = comboBak;
				} catch(e) {
					that.combo.id = null;
				}
			},

			submit: function() {
				if(!this.checkIfCanSubmit()) //检查是否所填值合适
					return;
				if(!this.checkIfValueChaned()) { //检查是否修改
					alert('请先修改后再提交');
					return;
				}
				this.updateComboBackEnd();
			},

			prepareParams: function() {
				var params = new FormData();
				for(property in this.combo) {
					if(this.combo[property] && property !== 'comboimage')
						params.append(property, this.combo[property]);
				}
				var image = document.getElementById('combo-image').files[0];
				var image2 = document.getElementById('combo-image2').files[0];
				if(image)
					params.append('comboImg', image);
				if(image2)
					params.append('comboImg2', image2);
				return params;
			},

			updateComboBackEnd: function() {
				var app = this;
				var url = 'combo/back/updatecombo';
				var formData = app.prepareParams();
				fileAxios.post(url, formData).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('修改成功');
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				}).finally(function() {

				});
			},

			checkIfValueChaned: function() {
				if(this.comboChanged)
					return true;
				var res1 = JSON.stringify(this.combo);
				var res2 = JSON.stringify(this.comboBak);

				return res1 != res2;
			},

			fileChange: function() {
				this.comboChanged = true;
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
				var img2 = document.getElementById('preview2');
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

				var checkFileds = ['comboPrice', 'comboName'];
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

		}
	});
});