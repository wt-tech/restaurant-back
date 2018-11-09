//获取bannerId


$(function(){
	
	var banner = new Vue({
		el : '#banner',
		data : {
			bannerId : null,
			banner : {
				id : null,
				imgName : null,
				onUse : null,
				uploadTime : null,
				url : null
			},
			bannerBak :{//备份banner,点击重置按钮生效
				id : null,
				imgName : null,
				onUse : null,
				uploadTime : null,
				url : null
			},
		},
		
		created : function(){
			this.initBannerId();
			this.initBanner();
		},
		
		methods : {
			
			initBannerId : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					var id = search.split('=')[1];
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
				this.bannerId = id;
			},
			//获取信息
			initBanner : function(){
				this.getBanner(this.bannerId);
			},
			
			getBanner : function(bannerId){
				var that = this;
				simpleAxios.get('banner/back/getbanner?id='+this.bannerId).then(function(res){
					if(res.status == STATUS_OK){
						that.banner = res.data;
						that.banner.id = that.bannerId;
						$.extend(that.bannerBak,that.banner);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				});
			},
		
			displayImg : function(){
                var img = $('#imgInput')[0].files[0];
				var reads = new FileReader();
				reads.readAsDataURL(img);
				reads.onload = function(e){
					$('#img').attr('src',this.result);
				}
            },
		
			reset : function(){
				$.extend(this.banner,this.bannerBak);
				//重置预览图片
				$('#img').attr('src',this.banner.url);
			},
			
			//点击提交按钮
			submit : function(){
				var that = this;
				var params = that.prepareUpdateParams();
				fileAxios.post("banner/back/updatebanner",params).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						//TODO 
						alert('修改成功');
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
			
			prepareUpdateParams : function(){
				var that = this;
				var params = new FormData();
				params.append("id",that.banner.id);
				params.append("imgName",that.banner.imgName);
				params.append("onUse",that.banner.onUse);
				params.append("uploadTime",that.banner.uploadTime);
				params.append("bannerImg",that.banner.url);
				params = that.appendImg(params);
				return params;
			},
			appendImg : function(params){
				var img = $('#imgInput')[0].files[0];
				params.append("bannerImg",img);
				return params;
			}
		}
	});
})