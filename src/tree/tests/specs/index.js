/**
 * @overview test case for button
 * @author shiran<shiran@taobao.com>
 */
KISSY.add(function (S, Dom, Tree, Node) {

    var $ = Node.all;

    describe('tree', function () {

        it('校验节点常用的 api', function () {

            // setup
            $('<div id="t1"></div>').appendTo('body');

			var tree = new Tree({
				content: 'test',
				render: '#t1',
				expanded: true
			});

			var first = new Tree.Node({

				content: 'first',
				tree: tree

			});

			tree.addChild(first);

			var sec = new Tree.Node({

				content: 'second'.
				tree: tree

			});

			tree.addChild(sec);

			tree.render();

			waits(100);

            runs(function () {

				// 校验节点
				expect(tree.getChildren().length).toBe(2);

				var children = tree.getChildrenEl();

				expect(children.length).toBe(2);
				expect(DOM.text(children[0])).toBe('first');
				expect(DOM.text(children[1])).toBe('second');

				// 删除node
				tree.removeChild(sec);

				expect(tree.getChildren().length).toBe(1);
				
				// 获取子节点位置
				expect(tree.getChildAt(first)).toBe(0);

				// 校验 removeChildren
				tree.removeChildren();
				expect(tree.getChildren().length).toBe(0);

				// 校验兄弟节点
				expect(first.next()).toBe(sec);
				expect(sec.prev()).toBe(first);

				// 选中
				var firstEl = first.get('el');
				firstEl.select();

				expect(first.get('selected')).toBe(true);

            });

            runs(function () {
                // clean
                tree.destroy();
				DOM.remove('#t1');
            });

        });
	
		it('校验折叠展开、选中', function() {
			
            // setup
            $('<div id="t2"></div>').appendTo('body');

			var tree = new Tree({
				content: 'test',
				render: '#t2',
				expanded: true
			});

			var first = new Tree.Node({

				content: 'first',
				tree: tree

			});

			var firstfirst = new Tree.Node({
				content: 'first first'
			});

			first.addChild(firstfirst);

			tree.addChild(first);

			var sec = new Tree.Node({

				content: 'second'.
				tree: tree

			});

			var secsec = new Tree.Node({
				content: 'sec sed'
			});

			sec.addChild(secsec);

			tree.addChild(sec);

			tree.render();

			waits(100);

            runs(function() {

				// 校验是否全部展开
				expect(tree.get('expanded')).toBe(true);
				// 校验ui事件
				var rootIcon = tree.get('expandIconEl');

				// click
				jasmine.simulate(rootIcon, 'click');
				expect(tree.get('expanded')).toBe(false);

				// keyborad
				jasmine.simulate(rootIcon, 'keydown', { keyCode: 13 });
				expect(tree.get('expanded')).toBe(true);

				// 子节点
				var firstIcon = first.get('expandIconEl');
				jasmine.simulate(firstIcon, 'keydown', { keyCode: 13 });
				expect(first.get('expanded')).toBe(false);

				// 兄弟节点
				var firstEl = first.get('el');
				firstEl.select();

				// 移动到下一个可视节点
				jasmine.simulate(firstEl, 'keydown', { keyCode: 40 });
				expect(firstfirst.get('selected')).toBe(true);

				jasmine.simulate(firstfirst.get('el'), 'keydown', { keyCode: 40 });
				expect(sec.get('selected')).toBe(true);

				// 移动到前一个可视节点
				jasmine.simulate(sec.get('el'), 'keydown', { keyCode: 38 });
				expect(firstfirst.get('selected')).toBe(true);

				// 移动到父节点
				jasmine.simulate(firstfirst.get('el'), 'keydown', { keyCode: 37 });
				expect(first.get('selected')).toBe(true);

				// 折叠第一个子节点
				jasmine.simulate(firstEl, 'keydown', { keyCode: 37 });
				expect(first.get('expanded')).toBe(false);

				// 移动到下一个可视节点
				jasmine.simulate(firstEl, 'keydown', { keyCode: 40 });
				expect(sec.get('selected')).toBe(true);

				// 折叠第二个子节点
				jasmine.simulate(sec.get('el'), 'keydown', { keyCode: 37 });

				// 移动到根节点
				jasmine.simulate(sec.get('el'), 'keydown', { keyCode: 36 });
				expect(tree.get('selected')).toBe(true);

				// 移动到最后一个可视节点
				jasmine.simulate(tree.get('el'), 'keydown', { keyCode: 35 });
				expect(sec.get('selected')).toBe(true);

				// 展开第二个子节点
				jasmine.simulate(sec.get('el'), 'keydown', { keyCode: 39 });
				expect(sec.get('expanded')).toBe(true);


				// check selected
				var secondEl = sec.get('el');

				jasmine.simulate(secondEl, 'click');
				expect(sec.get('selected')).toBe(true);

				// 检测全部展开
				$('<button type="button" id="expand">全部展开</button>').on('click', function() {
					tree.expandAll();	
				})

				waits(300);

				expect(first.get('expanded')).toBe(true);
				expect(tree.get('expanded')).toBe(true);

				// 检测全部收起
				$('<button type="button" id="collapse">全部展开</button>').on('click', function() {
					tree.collapseAll();	
				})

				waits(300);

				expect(first.get('expanded')).toBe(false);
				expect(tree.get('expanded')).toBe(false);

            });

            runs(function () {
                // clean
                tree.destroy();
				DOM.remove('#t2');
				DOM.remove('#expand');
				DOM.remove('#collapse');
            });

		});

		it('校验 check tree 的选中', function() {
			

            // setup
            $('<div id="t3"></div>').appendTo('body');

			var tree = new CheckTree({
				content: 'test',
				render: '#t3',
				expanded: true
			});

			var first = new Tree.CheckNode({

				content: 'first',
				tree: tree

			});

			tree.addChild(first);

			var sec = new Tree.CheckNode({
				content: 'second',
				tree: tree
			});

			tree.addChild(sec);

			tree.render();
		
			waits(100);

			runs(function() {

				// check length
				expect(tree.getChildren().length).toBe(2);

				// 选中
				jasmine.simulate(first.get('checkIconEl'), 'click');
				expect(first.get('checkState')).toBe('checked');
				expect(tree.get('checkState')).toBe('');

				jasmine.simulate(sec.get('checkIconEl'), 'keydown', { keyCode: 13 });
				expect(first.get('checkState')).toBe('checked');
				expect(tree.get('checkState')).toBe('checked');

				// 全部取消
				jasmine.simulate(tree.get('checkIconEl'), 'click');
				expect(first.get('checkState')).toBe('');
				expect(sec.get('checkState')).toBe('');

			});

            runs(function () {
                // clean
                tree.destroy();
				DOM.remove('#t3');
            });
			
		});

    });

},{
    requires:['dom','tree','node']
});
