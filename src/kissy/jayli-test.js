KISSY.add('test',function(S){
	
	if(typeof $ != 'undefined'){
		S.log('加载成功jquery');
	}else {
		S.log('没有加载jquery');
	}
	S.jay = 'ok';
	
});
