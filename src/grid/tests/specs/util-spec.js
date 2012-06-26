KISSY.use('grid/util',function(S,Util){

	describe("测试mask", function(){
		var el = S.one('#J_Mask');
		it('测试mask生成 ',function(){
			Util.maskElement(el);
			expect(el.one('.ks-ext-mask')).not.toBe(null);
		});
		it('测试mask取消',function(){
			Util.unmaskElement(el);
			expect(el.one('.ks-ext-mask')).toBe(null);
		});

		it('测试显示mask信息',function(){
			Util.maskElement(el,'这是Mask');
			expect(el.one('.ks-ext-mask')).not.toBe(null);
			expect(el.one('.ks-ext-mask-msg')).not.toBe(null);
		});
	});

	describe("测试load mask", function(){
		var el = S.one('#J_LoadMask'),
			loadMask = new Util.LoadMask(el);
		it('测试显示loadMask ',function(){
			loadMask.show();
			expect(el.one('.ks-ext-mask')).not.toBe(null);
			expect(el.one('.x-mask-loading')).not.toBe(null);
			
		});
		it('测试隐藏loadMask ',function(){
			loadMask.hide();
			expect(el.one('.ks-ext-mask')).toBe(null);
			expect(el.one('.x-mask-loading')).toBe(null);
			loadMask.show();
		});
	});

	describe("测试renderer", function(){
		var d = 1340595056900;
		it('测试日期',function(){
			var v = Util.Format.dateRenderer(d);
			expect(v).toBe('2012-06-25');
		});
		it('测试日期时间 ',function(){
			var v = Util.Format.datetimeRenderer(d);
			expect(v).toBe('2012-06-25 11:30:56');
		});
		it('测试枚举 ',function(){
			
		});
	});
});