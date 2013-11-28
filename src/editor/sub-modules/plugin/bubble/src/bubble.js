/**
 * @ignore
 * bubble or tip view for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Overlay = require('overlay');
    var Editor = require('editor');
    var logger = S.getLogger('s/editor');

    var BUBBLE_CFG = {
        zIndex: Editor.baseZIndex(Editor.ZIndexManager.BUBBLE_VIEW),
        elCls: '{prefixCls}editor-bubble',
        prefixCls: '{prefixCls}editor-',
        effect: {
            effect: 'fade',
            duration: 0.3
        }
    };

    function inRange(t, b, r) {
        return t <= r && b >= r;
    }


    // 是否两个bubble上下重叠？
    function overlap(b1, b2) {
        var b1Top = b1.get('y'),
            b1Bottom = b1Top + b1.get('el').outerHeight(),
            b2Top = b2.get('y'),
            b2Bottom = b2Top + b2.get('el').outerHeight();

        return inRange(b1Top, b1Bottom, b2Bottom) ||
            inRange(b1Top, b1Bottom, b2Top);
    }


    // 得到依附在同一个节点上的所有 bubble 中的最下面一个
    function getTopPosition(self) {
        var archor = null,
            editor = self.get('editor'),
            myBubbles = editor.getControls();
        S.each(myBubbles, function (bubble) {
            if (bubble.isKeBubble &&
                bubble !== self &&
                bubble.get('visible') &&
                overlap(self, bubble)) {
                if (!archor) {
                    archor = bubble;
                } else if (archor.get('y') < bubble.get('y')) {
                    archor = bubble;
                }
            }
        });
        return archor;
    }

    function getXy(bubble) {

        var el = bubble.get('editorSelectedEl');


        if (!el) {
            return undefined;
        }

        var editor = bubble.get('editor'),
            editorWin = editor.get('window'),
            iframeXY = editor.get('iframe').offset(),
            top = iframeXY.top,
            left = iframeXY.left,
            right = left + editorWin.width(),
            bottom = top + editorWin.height();

        // ie 中途设置 domain 后，不能获取 window 的相关属性
        // 例如 window.frameEl
        // 所以不能直接用 el.offset(undefined,window);
        var elXY = el.offset();

        elXY = Editor.Utils.getXY(elXY, editor);

        var elTop = elXY.top,
            elLeft = elXY.left,
            elRight = elLeft + el.width(),
            elBottom = elTop + el.height(),
            x,
            y;

        // ie 图片缩放框大于编辑区域底部，bubble 点击不了了，干脆不显示
        if (S.UA.ie &&
            el[0].nodeName.toLowerCase() === 'img' &&
            elBottom > bottom) {
            return undefined;
        }

        // 对其下边
        // el 位于编辑区域，下边界超了编辑区域下边界
        if (elBottom > bottom && elTop < bottom) {
            // 别挡着滚动条
            y = bottom - 30;
        }
        // el bottom 在编辑区域内
        else if (elBottom > top && elBottom < bottom) {
            y = elBottom;
        }

        // 同上，对齐左边
        if (elRight > left && elLeft < left) {
            x = left;
        } else if (elLeft > left && elLeft < right) {
            x = elLeft;
        }

        if (x !== undefined && y !== undefined) {
            return [x, y];
        }
        return undefined;
    }

    Editor.prototype.addBubble = function (id, filter, cfg) {
        var editor = this,
            prefixCls = editor.get('prefixCls'),
            bubble;

        cfg = cfg || {};

        cfg.editor = editor;

        S.mix(cfg, BUBBLE_CFG);

        cfg.elCls = S.substitute(cfg.elCls, {
            prefixCls: prefixCls
        });

        cfg.prefixCls = S.substitute(cfg.prefixCls, {
            prefixCls: prefixCls
        });

        bubble = new Overlay(cfg);

        bubble.isKeBubble = 1;

        editor.addControl(id + '/bubble', bubble);

        // 借鉴google doc tip提示显示
        editor.on('selectionChange', function (ev) {
            var elementPath = ev.path,
                elements = elementPath.elements,
                a,
                lastElement;
            if (elementPath && elements) {
                lastElement = elementPath.lastElement;
                if (!lastElement) {
                    return;
                }
                a = filter(lastElement);
                if (a) {
                    bubble.set('editorSelectedEl', a);
                    // 重新触发 bubble show 事件
                    bubble.hide();
                    // 等所有 bubble hide 再show
                    S.later(onShow, 10);
                } else {
                    onHide();
                }
            }
        });

        // 代码模式下就消失
        // !TODO 耦合---
        function onHide() {
            bubble.hide();
            var editorWin = editor.get('window');
            // 刚开始就配置 mode 为 sourcecode
            if (editorWin) {
                editorWin.detach('scroll', onScroll);
                bufferScroll.stop();
            }
        }

        editor.on('sourceMode', onHide);

        function showImmediately() {
            var xy = getXy(bubble);
            if (xy) {
                bubble.move(xy[0], xy[1]);
                var archor = getTopPosition(bubble);
                if (archor) {
                    xy[1] = archor.get('y') + archor.get('el').outerHeight();
                    bubble.move(xy[0], xy[1]);
                }
                if (!bubble.get('visible')) {
                    bubble.show();
                } else {
                    logger.debug('already show by selectionChange');
                }
            }
        }

        var bufferScroll = S.buffer(showImmediately, 350);

        function onScroll() {
            if (!bubble.get('editorSelectedEl')) {
                return;
            }
            bubble.hide();
            bufferScroll();
        }

        function onShow() {
            var editorWin = editor.get('window');
            editorWin.on('scroll', onScroll);
            showImmediately();
        }
    };
});