


$(function(){
	
	var banner = new Vue({
		el : '#banner',
		data : {
			banner : {
				imgName : null,
				onUse : true
			}
		},
		
		created : function(){
		},
		
		methods : {
			
			displayImg : function(){
                var imgList = $('#imgInput')[0].files;

				for(var img of imgList){
					var reads = new FileReader();
					reads.readAsDataURL(img);
					reads.onload = function(e){
						var imgDom = "<img src='"+this.result+"' alt='"+"请确保上传的是图片!"+"'></img>";
						$('#imgArea').append(imgDom);
					}
				}
            },
			
			imgChanged : function(){
				$('#imgArea').empty();//先清空 div内的图片
				this.displayImg();
			},
			
			//点击提交按钮
			submit : function(){
				var that = this;

				var params = that.prepareParams();
				fileAxios.post("banner/back/savebanner",params).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
//						//TODO 
//						console.log(res);
						alert('您已新增成功');
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
			
			prepareParams : function(){
				var that = this;
				var params = new FormData();
				params.append("imgName",that.banner.imgName);
				params.append("onUse",that.banner.onUse);
				params = that.appendImgs(params);
				return params;
			},
			appendImgs : function(params){
				var imgList = $('#imgInput')[0].files;
				for(var img of imgList){
					params.append("file",img);
				}
				return params;
			}
		}
	});
})