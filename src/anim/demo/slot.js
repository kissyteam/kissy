/**
 * @author ada@taobao.com
 */
(function () {
    var S = KISSY, Base = S.Base, D = S.DOM, E = S.Event;

    function Slot(cards) {
        //{{{
        var self = this;
        if (!(self instanceof Slot)) {
            return new S.Slot(cards);
        }
        Slot.superclass.constructor.apply(self, arguments);
        self.cards = [];
        S.each(S.all(cards), function (card, i) {
            var cr = new CardRunner(card, i);
            self.cards.push({runner:cr});

            cr.on('stop', function (e) {
                fireStopEvent.call(self, e);
            });
        });
        //}}}
        return self;
    }

    function fireStopEvent(e) {
        //{{{
        var self = this,
            idx = e.index;
        self.cards[idx].stopped = true;
        var finished = true;
        for (var ii = 0, l = self.cards.length; ii < l; ii++) {
            if (self.cards[ii].stopped !== true) {
                finished = false;
                return;
            }
        }
        if (finished) {
            self.fire('stop');
            self.runing = false;
        }
        //}}}
    }

    Slot.ATTRS = {
        //{{{
        count:{
            value:0
        },
        step:{
            value:null
        },
        fps:{
            value:10
        }
        //}}}
    };

    S.extend(Slot, Base, {
        start:function () {
            // {{{
            var self = this;
            if (self.runing || !self.get('count')) {
                return;
            }
            S.each(self.cards, function (card, i) {
                card.stopped = false;
                card.runner.run(self.get('count'), self.get('fps'), self.get('step'));
            });
            self.runing = true;
            //}}}
        },
        stop:function (index) {
            //{{{
            var self = this;
            if (self.runing) {
                S.each(index, function (i, idx) {
                    var _c = self.cards[idx];
                    if (_c) {
                        _c.runner.stop(i);
                    }
                });
            }
            ///}}}
        }
    });
    KISSY.Slot = Slot;

    //\u5361\u7247\u8fd0\u884c\u7c7b\uff0c\u5904\u7406\u5355\u5f20\u5361\u7247\u7684\u52a8\u4f5c
    function CardRunner(card, i) {
        //{{{
        card = S.get(card);
        if (!card) {
            return;
        }
        if (!(this instanceof CardRunner)) {
            return new CardRunner(card);
        }
        this.card = card;
        this.i = i;
        this.stopIndex = null;
        return this;
        //}}}
    }

    S.augment(CardRunner, S.EventTarget, {
        run:function (count, fps, step) {
            //{{{
            var self = this,
                oneCardHeight = D.height(self.card),
                max = count * oneCardHeight,
                step = step || oneCardHeight / 10,
                stopFps = fps + 30,
                _runner = function (max, _fps, step) {
                    var currPos = D.css(self.card, 'backgroundPosition').split(' ')[1].replace('px', '') * 1;

                    if (self.stopIndex) {//\u5f00\u59cb\u51cf\u901f
                        if (_fps < stopFps) {
                            _fps = _fps + 0.5;//\u6bcf\u6b21\u589e\u52a0\u4e00\u6beb\u79d2\u65f6\u95f4\u5ef6\u8fdf,\u76f4\u81f3\u8fbe\u5230\u9884\u7f6e\u7684\u9891\u7387
                        } else {
                            var si = self.stopIndex - 1,
                                stopPos = si * oneCardHeight; //\u8ba1\u7b97\u51fa\u505c\u6b62\u4f4d\u7f6e
                            if (Math.abs(Math.abs(stopPos) - Math.abs(currPos)) <= step) {
                                D.css(self.card, 'backgroundPosition', '0px -' + stopPos + 'px');
                                self.fire('stop', {index:self.i});
                                self.stopIndex = null;
                                self.running = false;
                                return;
                            }
                        }
                    }

                    if (currPos >= 0) {
                        currPos = -max;
                    }

                    var newPos = (currPos * 10 + step * 10) / 10;

                    D.css(self.card, 'backgroundPosition', '0px ' + newPos + 'px');

                    setTimeout(function () {
                        _runner(max, _fps, step);
                    }, _fps);
                };
            if (self.stopIndex !== null) {
                return
            }
            var initPos = -(Math.floor(Math.random() * (count + 1)));
            D.css(self.card, 'backgroundPosition', '0px ' + initPos * oneCardHeight + 'px');
            _runner(max, fps, step);
            self.running = true;
            //}}}
        },
        stop:function (i) {
            //{{{
            if (this.running) {
                this.stopIndex = i;
            }
            //}}}
        }
    });
})();
