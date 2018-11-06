
//
$(function(){
    var app = new Vue({
        el : '#vueApp',
        data : {
            username : '',
            password : '',
            loding : false,
        },
        methods : {
            formSubmit : function(){

                var vueInstance = this;
                var params = new FormData();
				vueInstance.loding = true;
                params.append('userCode',vueInstance.username);
                params.append('userPassword',vueInstance.password);

                simpleAxios.post('/login',params).then(function(res){
                    if(res.status == STATUS_OK && res.data.status == SUCCESS){
                        window.location.href = 'index.html';
                        vueInstance.loding = false;
                    }else{                    	
                        vueInstance.loding = false;
						backEndExceptionHanlder(res,'账号密码不匹配');
                    }

                }).catch(function(err){
                    unknownError(err);
                    vueInstance.loding = false;
                })
            },
        }
    });
})