KISSY.use('grid/editor,grid/editorpanel',function(S,Editor,EditorPanel){
	var CLS_EDITOR = 'ks-grid-editor',
		containerEl = S.one('#editPanel'),
		//editor = new Editor({field : 'a'}),
		panel = new EditorPanel({
			width : 50,
			align : {
				node: containerEl[0],
				points: ['tl','tl'],
				offset:[0,0]
			},
			children : [
				{
					xclass: 'grid-editor',
					field : 'a'
				}
			]
		});
		
		panel.render();
		panel.show();
		var editor = panel.get('children')[0],
			panelEl = panel.get('el'),
			editorEl = editor.get('el');
	describe("测试初始化", function () {
		it('测试Dom生成',function(){
			expect(panelEl).not.toBe(undefined);
			expect(editorEl).not.toBe(undefined);
			expect(panelEl.one('.'+CLS_EDITOR+'-container')).not.toBe(null);
			expect(panelEl.contains(editorEl)).toBeTruthy();
		});
		it('测试对齐',function(){
			expect(panelEl.offset().left).toBe(containerEl.offset().left);
			expect(panelEl.offset().top).toBe(containerEl.offset().top);
		});
	});
	
	describe("测试操作", function () {
		var obj ={a:'10'},
			obj1 = {a:''};
		it('测试设置数据',function(){
			
			panel.set('record',obj);
			expect(editor.getValue()).toBe(obj.a);
			panel.set('record',obj1);
			expect(editor.getValue()).toBe(obj1.a);
			obj.a = null;
			panel.set('record',obj);
			expect(editor.getValue()).toBe('');
			
		});
		
		it('测试更改对齐',function(){
			var val = '100';
			panel.on('changed',function(e){
				var field = e.target.get('field');
				obj[field] = e.value;
			});
			editor.set('value',val);
			editor.getEditControl().fire('change');
			waits(100);
			runs(function(){
				expect(obj.a).toBe(val);
			});
		});
	});
});