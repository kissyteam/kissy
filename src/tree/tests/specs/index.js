/**
 * @overview test case for button
 * @author shiran<shiran@taobao.com>
 */
KISSY.add(function (S, DOM, Tree, Node) {
    var $ = Node.all;

    var CheckState = Tree.CheckNode.CheckState;

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
                content: 'second',
                tree: tree

            });

            tree.addChild(sec);

            tree.render();

            waits(100);

            runs(function () {

                // 校验节点
                expect(tree.get('children').length).toBe(2);

                var children = tree.get('childrenEl').children();

                expect(children.length).toBe(2);
                expect(S.trim(DOM.text(children[0]))).toBe('first');
                expect(S.trim(DOM.text(children[1]))).toBe('second');

                // 获取子节点位置
                //expect(tree.getChildAt(first)).toBe(0);

                // 校验兄弟节点
                expect(first.next()).toBe(sec);
                expect(sec.prev()).toBe(first);

                // 选中
                first.select();

                expect(first.get('selected')).toBe(true);

                // 删除node
                tree.removeChild(sec);

                expect(tree.get('children').length).toBe(1);

                // 校验 removeChildren
                tree.removeChildren();
                expect(tree.get('children').length).toBe(0);

            });

            runs(function () {
                // clean
                tree.destroy();
                DOM.remove('#t1');
            });

        });

        it('校验折叠展开、选中', function () {

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

                content: 'second',
                tree: tree

            });

            var secsec = new Tree.Node({
                content: 'sec sed'
            });

            sec.addChild(secsec);

            tree.addChild(sec);

            tree.render();

            waits(100);

            runs(function () {

                // 校验是否全部展开
                expect(tree.get('expanded')).toBe(true);
                // 校验ui事件
                var rootIcon = tree.get('expandIconEl')[0];

                // click
                jasmine.simulate(rootIcon, 'click');
                expect(tree.get('expanded')).toBe(false);

                // keyborad
                jasmine.simulate(rootIcon, 'click');
                expect(tree.get('expanded')).toBe(true);

                waits(100);

                // 子节点
                var firstIcon = first.get('expandIconEl')[0];
                jasmine.simulate(firstIcon, 'click');
                expect(first.get('expanded')).toBe(true);

                // 兄弟节点
                var firstEl = first.get('el')[0];
                first.select();

                // 移动到下一个可视节点
                jasmine.simulate(firstEl, 'keydown', { keyCode: 40 });
                expect(firstfirst.get('selected')).toBe(true);

                jasmine.simulate(firstfirst.get('el')[0], 'keydown', { keyCode: 40 });
                expect(sec.get('selected')).toBe(true);

                // 移动到前一个可视节点
                jasmine.simulate(sec.get('el')[0], 'keydown', { keyCode: 38 });
                expect(firstfirst.get('selected')).toBe(true);

                // 移动到父节点
                firstfirst.select();
                jasmine.simulate(firstfirst.get('el')[0], 'keydown', { keyCode: 37 });
                expect(first.get('selected')).toBe(true);

                // 折叠第一个子节点
                jasmine.simulate(firstEl, 'keydown', { keyCode: 37 });
                expect(first.get('expanded')).toBe(false);

                // 移动到下一个可视节点
                first.select();
                jasmine.simulate(firstEl, 'keydown', { keyCode: 40 });
                expect(sec.get('selected')).toBe(true);

                // 折叠第二个子节点
                jasmine.simulate(sec.get('el')[0], 'keydown', { keyCode: 37 });

                // 移动到根节点
                jasmine.simulate(sec.get('el')[0], 'keydown', { keyCode: 36 });
                expect(tree.get('selected')).toBe(true);

                // 移动到最后一个可视节点
                jasmine.simulate(tree.get('el')[0], 'keydown', { keyCode: 35 });
                expect(sec.get('selected')).toBe(true);

                // 展开第二个子节点
                jasmine.simulate(sec.get('el')[0], 'keydown', { keyCode: 39 });
                expect(sec.get('expanded')).toBe(true);


                // check selected
                var secondEl = sec.get('el')[0];

                jasmine.simulate(secondEl, 'click');
                expect(sec.get('selected')).toBe(true);

                // 检测全部展开
                $('<button type="button" id="expand">全部展开</button>').on('click',function () {
                    tree.expandAll();
                }).appendTo('body');

                waits(300);

                jasmine.simulate(DOM.get('#expand'), 'click');
                expect(first.get('expanded')).toBe(true);
                expect(tree.get('expanded')).toBe(true);

                // 检测全部收起
                $('<button type="button" id="collapse">全部展开</button>').on('click',function () {
                    tree.collapseAll();
                }).appendTo('body');

                waits(300);

                jasmine.simulate(DOM.get('#collapse'), 'click');
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

        it('校验 check tree 的选中', function () {
            // setup
            $('<div id="t3"></div>').appendTo('body');

            var tree = new Tree.CheckTree({
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

            runs(function () {
                // check length
                expect(tree.get('children').length).toBe(2);

                // 选中
                jasmine.simulate(first.get('checkIconEl')[0], 'click');
                expect(first.get('checkState')).toBe(CheckState.CHECK);
                expect(tree.get('checkState')).toBe(CheckState.PARTIAL_CHECK);

                // select sec and keydown
                sec.select();
                jasmine.simulate(sec.get('checkIconEl')[0], 'keydown', { keyCode: 13 });
                expect(first.get('checkState')).toBe(CheckState.CHECK);
                expect(tree.get('checkState')).toBe(CheckState.CHECK);

                // 全部取消
                jasmine.simulate(tree.get('checkIconEl')[0], 'click');
                expect(first.get('checkState')).toBe(CheckState.EMPTY);
                expect(sec.get('checkState')).toBe(CheckState.EMPTY);
            });

            runs(function () {
                // clean
                tree.destroy();
                DOM.remove('#t3');
            });
        });
    });
}, {
    requires: ['dom', 'tree', 'node']
});
