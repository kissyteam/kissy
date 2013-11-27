KISSY.add(function (S,require) {
    var Node = require('node');
    var Base = require('base');
    var Event = require('event');
    var Color = require('color');
    var Overlay = require('overlay');

    var $ = Node.all, Gesture = Event.Gesture;

    var methods = {
        initializer: function () {
            var self = this,
                canvas = self.get("canvas"),
                color = self.get("color");

            self.set("ctx", canvas[0].getContext('2d'));
            self.set("colorHex", new Color(color).toHex());

            self.bindEvt();
            self.overlay();
            self.reset();
            self.start();
        },
        overlay: function () {
            var self = this,
                canvas = self.get("canvas"),
                overlay = new Overlay({
                    elCls: "gg-dialog",
                    mask: true,
                    align: {
                        node: canvas,
                        points: ['cc', 'cc'],
                        offset: [0, 0]
                    }
                });

            overlay.render();

            overlay.get('contentEl').delegate(Gesture.tap, ".J_Start", function () {
                overlay.hide();
                self.reset();
            });

            overlay.get('contentEl').delegate(Gesture.tap, ".J_Cancel", function () {
                overlay.hide();
                self.fire("quit");
            });

            self.set("overlay", overlay);
        },
        bindEvt: function () {
            var self = this,
                canvas = self.get("canvas"),
                ctx = self.get("ctx"),
                clientOffset = canvas.offset(),
                w = canvas.width(), h = canvas.height(),
                clientOffsetX = clientOffset.left,
                clientOffsetY = clientOffset.top,
                oldX,
                oldY,
                curX,
                curY,
                color = self.get("color"),
                colorHex = self.get("colorHex"),

                isOver = function () {
                    var data = ctx.getImageData(0, 0, w, h).data;

                    //剩余像素（未被刮开）点数。#CCC ,255
                    for (var i = 0, j = 0, k = 0; i < data.length; i += 4, k++) {
                        if ((data[i] == color.r) && (data[i + 1] == color.g) && (data[i + 2] == color.b) && (data[i + 3] == color.a)) {
                            j++;
                        }
                    }

                    if ((j / (w * h)) < 0.7) {
                        self.getPuzzle();
                    }
                },

                touchMove = function (ev) {
                    ev.preventDefault();

                    var pageX = ev.changedTouches ? ev.changedTouches[0].pageX : ev.pageX,
                        pageY = ev.changedTouches ? ev.changedTouches[0].pageY : ev.pageY;


                    curX = pageX - clientOffsetX;
                    curY = pageY - clientOffsetY;

                    ctx.lineTo(curX, curY);
                    ctx.stroke();

                    oldX = curX;
                    oldY = curY;

                    // force update for some android browsers
                    canvas.css('padding-right', canvas.css('padding-right') == '0px' ? "1px" : '0px');
                },

                touchEnd = function (ev) {
                    ev.preventDefault();
                    canvas.detach(Gesture.move, touchMove);
                    canvas.detach(Gesture.end, touchEnd);
                    ctx.closePath();
                    isOver();
                };

            canvas.on(Gesture.start, function (ev) {
                ev.preventDefault();
                var pageX = ev.changedTouches ? ev.changedTouches[0].pageX : ev.pageX,
                    pageY = ev.changedTouches ? ev.changedTouches[0].pageY : ev.pageY;

                //设置笔触.
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                //ctx.fillStyle = '';    //红米手机无法刷出来的原因之一,必须置空.
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = self.get("eraserWidth");

                oldX = pageX - clientOffsetX;
                oldY = pageY - clientOffsetY;

                ctx.beginPath();
                ctx.moveTo(oldX, oldY);


                canvas.on(Gesture.move, touchMove);
                canvas.on(Gesture.end, touchEnd);
            });
        },
        reset: function () {
            var self = this,
                canvas = self.get("canvas"),
                ctx = self.get("ctx"),
                w = canvas.width(), h = canvas.height(),
                maskColorHex = self.get("colorHex");
            //初始化的操作
            canvas[0].width = w; //强刷.
            ctx.globalCompositeOperation = "source-over"; //解决部分手机白屏.
            ctx.fillStyle = maskColorHex;
            ctx.fillRect(0, 0, w, h);
        },
        start: function () {
            var self = this,
                overlay = self.get("overlay"),
                el = overlay.get('contentEl');

            el.html('<div class="bd">刮一刮图层，可以刮出红包</div><div class="ft"><button class="ok J_Start">开始刮奖</button></div>');
            overlay.show();

        },
        getPuzzle: function () {
            var self = this,
                overlay = self.get("overlay"),
                el = overlay.get('contentEl');

            el.html('<div class="bd"><p>很遗憾，没有刮到红包 :(</p><p>' + self.failTxt() + '</p><p class="fail"></p></div><div class="ft"><button class="cancel J_Cancel">不玩了</button><button class="ok J_Start">刮下一张</button></div>');
            overlay.show();
        },
        failTxt: function () {
            var txt = [
                [
                    '面朝大海，春暖花开！',
                    '面朝厕所，刮奖必中！'
                ],
                [
                    '没中奖，',
                    '换个手指刮刮看！'
                ],
                [
                    'OMG没中奖，换个表情',
                    '试试，跟我念“茄子”！'
                ],
                [
                    '做人呢，最重要的就是',
                    '开心，不如再刮一次吧！'
                ],
                [
                    '什么，没中奖？',
                    '你一定是处女座的吧！'
                ],
                [
                    '据扯，用脚趾刮，',
                    '中奖的概率高于手指！试试？'
                ],
                [
                    '据扯，用舌头刮，',
                    '中奖的概率高于手指！试试？'
                ],
                [
                    '据扯，坐在马桶上，',
                    '会提高中奖概率！试试？'
                ],
                [
                    '据扯，用鼻子刮，',
                    '中奖的概率高于手指！试试？'
                ],
                [
                    '据扯，中午12点，',
                    '中奖概率最高！试试？'
                ],
                [
                    '据扯，用屁股刮，',
                    '中奖的概率高于手指！试试？'
                ],
                [
                    '据扯，用膝盖刮，',
                    '中奖的概率高于手指！试试？'
                ],
                [
                    '抱歉您没中奖，',
                    '要不换你外婆试试？'
                ],
                [
                    '抱歉您没中奖，',
                    '是你家猫刮得吧？'
                ],
                [
                    '刮奖之前，',
                    '请烧三柱高香！'
                ],
                [
                    '诶呀，没中奖，',
                    '你好久没扶老奶奶过马路了吧！'
                ],
                [
                    '据扯，刮奖时穿红衣服，',
                    '中奖率最高！试试？'
                ],
                [
                    '刮奖前，',
                    '不如先翻翻黄历？'
                ],
                [
                    '据扯，原地转3圈，',
                    '会提升中奖概率！试试？'
                ],
                [
                    '一定是你',
                    '刮的节奏不对！'
                ],
                [
                    '据扯，躺平后再刮奖，',
                    '中奖概率翻倍！试试？'
                ],
                [
                    '一定是你刮奖的姿势不对，',
                    '倒立试试？'
                ],
                [
                    '没中奖？',
                    '赶快吃个苹果提高中奖概率吧！'
                ],
                [
                    '一定是你刮奖的心态不够虔诚！'
                ],
                [
                    '下次刮奖前，请先念咒语！'
                ],
                [
                    '做人呢最重要的就是开心，',
                    '不如我下面给你吃。'
                ],
                [
                    '据有关部门统计，',
                    '单膝下跪可提高中奖率！试试？'
                ],
                [
                    '最新科学研究，用香肠，',
                    '也能刮奖，不信你试试！'
                ],
                [
                    '恨爹不成刚，怨爸不双江，',
                    '一天刮到晚，必成高富帅！'
                ],
                [
                    '人生不如意，',
                    '十有八九是因为没！中！奖！'
                ]
            ];
            var getRandom = function (m, n) {
                return Math.ceil(Math.random() * (n - m) + m);
            };
            return txt[getRandom(0, txt.length - 1)].join("");
        }
    };

    var gglAttrs = {
        ATTRS: {
            canvas: {
                setter: function (v) {
                    return  $(v);
                }
            },
            ctx: {
                value: {}
            },
            color: {
                value: {
                    r: 204,
                    g: 204,
                    b: 204,
                    a: 255
                }
            },
            eraserWidth: {
                value: 30
            }
        }
    };

    return Base.extend(methods, gglAttrs);
});