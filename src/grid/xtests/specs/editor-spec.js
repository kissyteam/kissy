KISSY.use('grid/editor',function(S,Editor){
	var CLS_EDITOR = 'ks-grid-editor';
	
	describe("测试简单编辑器", function () {
		var editor = new Editor({render : '#edit'});
		editor.render();
		
		editor.on('changed',function(e){
			S.one('#log').text(e.text);
		});
		var el = editor.get('el'),
			control = el.one('.'+CLS_EDITOR + '-control');
		it('测试初始化DOM',function(){
			expect(el).not.toBe(undefined);
			expect(el.hasClass(CLS_EDITOR)).toBeTruthy();
			expect(control).not.toBe(null);
		});
		
		it('测试设置值,获取值',function(){
			var val = '100';
			editor.set('value',val);
			expect(editor.get('value')).toBe(val);
			expect(control.val()).toBe(val);
		});
		
		it('测试事件',function(){
			var callback = jasmine.createSpy();
			editor.on('changed',callback);
			jasmine.simulate(control[0],'change');
			waits(100);
			runs(function(){
				 expect(callback).toHaveBeenCalled();
			});
		});
		
		it('测试验证',function(){
			editor.set('validator',function(v){
				if(!v){
					return '不能为空';
				}
			});
			
			editor.set('value','');
			waits(100);
			runs(function(){
				expect(editor.hasError()).toBe(true);
				editor.set('value',100);
				waits(100);
				runs(function(){
					expect(editor.hasError()).toBe(false);
				});
			});
		});
	});
	
	/*describe("测试自定义初始化", function () {
		it('测试自定义模版',function(){
			
		});
		it('测试自定义事件',function(){
			
		});
	});
	
	describe("测试各类编辑器", function () {
		it('测试文本框',function(){
			
		});
		
		it('测试数字输入',function(){
			
		});
		
		it('测试日期编辑器',function(){
			
		});
		
		it('测试单选编辑器',function(){
			
		});
		
		it('测试多选编辑器',function(){
			
		});
		
	});*/
});