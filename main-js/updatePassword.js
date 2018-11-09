//获取bannerId


$(function(){
	
	var banner = new Vue({
		el : '#banner',
		data : {
			account:'',
			oldPassword:'',
			newPassword:'',
			confirmPassword:'',
			tip:'',
			tips:'',
			pwd:false,
			
		},
		
		created : function(){
		
		},
		
		methods : {
			
//			initBannerId : function(){
//				try{
//					var search = window.location.search;
//					search = search.substr(1,search.length-1);
//					var id = search.split('=')[1];
//				}catch(e){
//					id = -1;
//					alert('未检测到id,请重试');
//				}
//				this.bannerId = id;
//			},
			//获取信息
			submit:function(){
				var that = this 
				var params = new FormData();
				params.append('userPassword',that.newPassword);
//				if(this.confirmPassword !== this.newPassword || that.newPassword == ''){
//					return false
//				}
				if(!that.pwd){
					if(that.newPassword == ''){
						that.tip="密码不能为空"
					}else{
						console.log(that.newPassword)
						var pwd = that.newPassword
						simpleAxios.get('back/updatepwd?userPassword=' + pwd).then(function(res){
							
							if(res.status == STATUS_OK){
								alert('密码修改成功')
								that.newPassword=''
								that.confirmPassword=''
							}else
								backEndExceptionHanlder(res);
						}).catch(function(res){
							unknownError(res);
						});
					}
				}else{
					alert('两次密码不一致')
				}
				
				
				
			},
			cofirmPass:function(e){
				if(this.confirmPassword !== this.newPassword){
					this.tips = '两次密码不一致'
					this.pwd = true 
				}else{
					this.tips = ''
					this.pwd = false 
				}
			}
		}
	});
})