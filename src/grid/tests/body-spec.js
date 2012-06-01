KISSY.use('grid/gridbody',function(S,Body){
	var body = new Body({
		render:'#J_Body'
	});
	body.render();
	var bodyEl = body.get('el');
	describe("测试 body 生成", function () {
		it('测试Body容器生成',function(){
			expect(bodyEl).toNotBe(null);
			expect(body.get('tbodyEl')).toNotBe(null);
			expect(body.get('tbodyEl')).toNotBe(undefined);
			expect(bodyEl.hasClass('ks-grid-body')).toBeTruthy();
		});

		it('测试Body 显示数据',function(){
			
		});

		it('测试添加数据',function(){
			
		});
		it('测试删除数据',function(){
			
		});
		it('测试更新数据',function(){
			
		});
		it('测试本地排序数据',function(){
			
		});
	});

	describe("测试 body 加载数据", function () {
		it('测试成功加载数据',function(){
			
		});

		it('测试失败加载数据',function(){
			
		});
		
	});
});