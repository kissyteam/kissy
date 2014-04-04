KISSY.add(function (S, Node, Control) {
    var $ = Node.all;
    describe('decorate', function () {
        it('html_parser called', function () {
            var node = $('<div></div>').appendTo('body');
            var order = [];
            var MyControl = Control.extend({}, {
                HTML_PARSER: {
                    x: function () {
                        order.push(1);
                    },
                    y: function () {
                        order.push(2);
                    }
                }
            });
            var MyControl2 = MyControl.extend({}, {
                HTML_PARSER: {
                    x: function () {
                        order.push(11);
                    },
                    y2: function () {
                        order.push(33);
                    }
                }
            });

            new MyControl2({
                srcNode: node
            }).render();

            expect(order).toEqual([11, 33,2]);

            node.remove();
        });
    });
}, {
    requires: ['node', 'component/control']
});