
//
$(function(){
    var app = new Vue({
        el : '#vueApp',
        data : {
            username : '',
            password : '',
			loadingComplete : true,
        },
        methods : {
            formSubmit : function(){

                var vueInstance = this;
                var params = {
					userCode : vueInstance.username,
					userPassword : vueInstance.password
				};
				vueInstance.loadingComplete = false;
                jsonAxios.post('/login',params).then(function(res){
                    if(res.status == STATUS_OK && res.data.status == SUCCESS){
						console.log(res);
						console.log(res.headers);
                        window.location.href = 'index.html';
                    }else{       
						backEndExceptionHanlder(res,'账号密码不匹配');
                    }

                }).catch(function(err){
                    unknownError(err);
                }).finally(function(){
					vueInstance.loadingComplete = true;
				})
            },
        }
    });
})