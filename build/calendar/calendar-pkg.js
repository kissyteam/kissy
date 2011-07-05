/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * KISSY Calendar
 * @creator  ??ï¿½ï¿½<lijing00333@163.com>
 */
KISSY.add('calendar/base', function(S, Node, Event, undefined) {
    var EventTarget = Event.Target,$ = Node.all;

    function Calendar(trigger, config) {
        this._init(trigger, config);
    }

    S.augment(Calendar, {

        /**
         * ?ï¿½ï¿½?????ï¿½ï¿½?
         * @method     _init
         * @param { string }    selector
         * @param { string }    config
         * @private
         */
        _init: function(selector, config) {
            var self = this,con = Node.one(selector);
            self.id = self.C_Id = self._stamp(con);
            self._buildParam(config);

            /*
             self.con  ?ï¿½ï¿½??????             self.id   ï¿???ï¿½ï¿½?id
             self.C_Id æ°¸ï¿½?ä»£è¡¨?ï¿½ï¿½?å®¹ï¿½???D
             */
            if (!self.popup) {
                self.con = con;
            } else {
                self.trigger = con;
                self.con = new Node('<div>');
                Node.one('body').append(self.con);
                self.C_Id = self._stamp(self.con);
                self.con.css({
                    'top':'0px',
                    'position':'absolute',
                    'background':'white',
                    'visibility':'hidden'
                });
            }

            //??ï¿½ï¿½ï¿?ï¿½ï¿½ï¿??
            //ï¿?ï¿½ï¿½ï¿??å·²ï¿½???alendar??ï¿½ï¿½
            var EventFactory = function() {
            };
            S.augment(EventFactory, EventTarget);
            var eventCenter = new EventFactory();
            S.mix(self, eventCenter);

            self.render();
            self._buildEvent();
            return this;
        },

        render: function(o) {
            var self = this,
                i = 0,
                _prev,_next,_oym;

            o = o || {};
            self._parseParam(o);
            self.ca = [];

            self.con.addClass('ks-cal-call ks-clearfix multi-' + self.pages);
            self.con.html('');

            for (i = 0,_oym = [self.year,self.month]; i < self.pages; i++) {
                if (i === 0) {
                    _prev = true;
                } else {
                    _prev = false;
                    _oym = self._computeNextMonth(_oym);
                }
                _next = i == (self.pages - 1);
                self.ca.push(new self.Page({
                    year:_oym[0],
                    month:_oym[1],
                    prevArrow:_prev,
                    nextArrow:_next,
                    showTime:self.showTime
                }, self));


                self.ca[i].render();
            }
            return this;

        },

        /**
         * ?ï¿½ä»¥ï¿???ï¿½ï¿½?ï¿?d???ï¿?å®¹ï¿½???d?????         * @method _stamp
         * @param el
         * @return {string}
         * @private
         */
        _stamp: function(el) {
            if (!el.attr('id')) {
                el.attr('id', S.guid('K_Calendar'));
            }
            return el.attr('id');
        },

        /**
         * è®¡ï¿½?då¤©ï¿½????å¤©ï¿½??????ï¿½ï¿½ï¿????ate
         * @method _showdate
         * @private
         */
        _showdate: function(n, d) {
            var uom = new Date(d - 0 + n * 86400000);
            uom = uom.getFullYear() + "/" + (uom.getMonth() + 1) + "/" + uom.getDate();
            return new Date(uom);
        },

        /**
         * ??ï¿½ï¿½?ï¿½ï¿½?ï¿?????ï¿?         * @method _buildEvent
         * @private
         */
        _buildEvent: function() {
            var self = this;
            if (!self.popup) {
                return this;
            }
            //?ï¿½ï¿½?ç©ºï¿½?
            //flush event
            for (var i = 0; i < self.EV.length; i++) {
                if (self.EV[i] !== undefined) {
                    self.EV[i].detach();
                }
            }
            self.EV[0] = Node.one('body').on('click', function(e) {
                var target = $(e.target);
                //?ï¿½ï¿½??ï¿½ï¿½????
                if (target.attr('id') === self.C_Id) {
                    return;
                }
                if ((target.hasClass('ks-next') || target.hasClass('ks-prev')) &&
                    target[0].tagName === 'A') {
                    return;
                }
                //?ï¿½ï¿½???riggerï¿?                if (target.attr('id') == self.id) {
                    return;
                }

                if (self.con.css('visibility') == 'hidden') return;
                var inRegion = function(dot, r) {
                    return dot[0] > r[0].x
                        && dot[0] < r[1].x
                        && dot[1] > r[0].y
                        && dot[1] < r[1].y;
                };

                /*
                 if (!S.DOM.contains(Node.one('#' + self.C_Id), e.target)) {
                 */
                if (!inRegion([e.pageX,e.pageY], [
                    {
                        x:self.con.offset().left,
                        y:self.con.offset().top
                    },
                    {
                        x:self.con.offset().left + self.con.width(),
                        y:self.con.offset().top + self.con.height()
                    }
                ])) {
                    self.hide();
                }
            });
            //?ï¿½ï¿½?ï¿??
            for (i = 0; i < self.triggerType.length; i++) {

                self.EV[1] = Node.one('#' + self.id).on(self.triggerType[i], function(e) {
                    e.target = $(e.target);
                    e.preventDefault();
                    //ï¿??focus??lick???ï¿????ack

                    var a = self.triggerType;
                    if (S.inArray('click', a) && S.inArray('focus', a)) {//??????
                        if (e.type == 'focus') {
                            self.toggle();
                        }
                    } else if (S.inArray('click', a) && !S.inArray('focus', a)) {//???click
                        if (e.type == 'click') {
                            self.toggle();
                        }
                    } else if (!S.inArray('click', a) && S.inArray('focus', a)) {//???focus
                        setTimeout(function() {//ä¸ºï¿½?è·³ï¿½?document.onclickï¿?ï¿½ï¿½
                            self.toggle();
                        }, 170);
                    } else {
                        self.toggle();
                    }

                });

            }
            return this;
        },

        /**
         * ?ï¿½ï¿½??ï¿½ï¿½?????ï¿½ç¤º?????         * @mathod toggle
         */
        toggle: function() {
            var self = this;
            if (self.con.css('visibility') == 'hidden') {
                self.show();
            } else {
                self.hide();
            }
        },

        /**
         * ?ï¿½ç¤º?ï¿½ï¿½?
         * @method show
         */
        show: function() {
            var self = this;
            self.con.css('visibility', '');
            var _x = self.trigger.offset().left,
                //KISSYï¿??DOM??idth??nnerWidthï¿??????????utterWidth
                height = self.trigger[0].offsetHeight || self.trigger.height(),
                _y = self.trigger.offset().top + height;
            self.con.css('left', _x.toString() + 'px');
            self.con.css('top', _y.toString() + 'px');
            return this;
        },

        /**
         * ????ï¿½ï¿½?
         * @method hide
         */
        hide: function() {
            var self = this;
            self.con.css('visibility', 'hidden');
            return this;
        },

        /**
         * ??ï¿½ï¿½?????ï¿½ï¿½
         * @method _buildParam
         * @private
         */
        _buildParam: function(o) {
            var self = this;
            if (o === undefined || o === null) {
                o = { };
            }

            function setParam(def, key) {
                var v = o[key];
                // null?ï¿½ï¿½???????ï¿??????ï¿½ï¿½?ï¿????????ï¿????                self[key] = (v === undefined || v === null) ? def : v;
            }

            //ï¿??ï¿???ï¿½ï¿½?ï¿??
            S.each({
                date:        new Date(),
                startDay:    0,
                pages:       1,
                closable:    false,
                rangeSelect: false,
                minDate:     false,
                maxDate:     false,
                multiSelect: false,
                navigator:   true,
                popup:       false,
                showTime:    false,
                triggerType: ['click']
            }, setParam);

            // ????ï¿½ï¿½?ï¿???ï¿½ï¿½?ï¿?tring
            if (typeof o.triggerType === 'string') {
                o.triggerType = [o.triggerType];
            }

            setParam(self.date, 'selected');
            if (o.startDay) {
                self.startDay = (7 - o.startDay) % 7;
            }

            if (o.range !== undefined && o.range !== null) {
                var s = self._showdate(1, new Date(o.range.start.getFullYear() + '/' + (o.range.start.getMonth() + 1) + '/' + (o.range.start.getDate())));
                var e = self._showdate(1, new Date(o.range.end.getFullYear() + '/' + (o.range.end.getMonth() + 1) + '/' + (o.range.end.getDate())));
                self.range = {
                    start:s,
                    end:e
                };
            } else {
                self.range = {
                    start:null,
                    end:null
                };
            }
            self.EV = [];
            return this;
        },

        /**
         * ï¿?ï¿½ï¿½?????ï¿½ï¿½
         * @method _parseParam
         * @private
         */
        _parseParam: function(o) {
            var self = this,i;
            if (o === undefined || o === null) {
                o = {};
            }
            for (i in o) {
                self[i] = o[i];
            }
            self._handleDate();
            return this;
        },

        /**
         * æ¨¡ï¿½??ï¿½ï¿½?
         * @method _templetShow
         * @private
         */
        _templetShow: function(templet, data) {
            var str_in,value_s,i,m,value,par;
            if (data instanceof Array) {
                str_in = '';
                for (i = 0; i < data.length; i++) {
                    str_in += arguments.callee(templet, data[i]);
                }
                templet = str_in;
            } else {
                value_s = templet.match(/{\$(.*?)}/g);
                if (data !== undefined && value_s !== null) {
                    for (i = 0,m = value_s.length; i < m; i++) {
                        par = value_s[i].replace(/({\$)|}/g, '');
                        value = (data[par] !== undefined) ? data[par] : '';
                        templet = templet.replace(value_s[i], value);
                    }
                }
            }
            return templet;
        },

        /**
         * ï¿???ï¿½ï¿½?
         * @method _handleDate
         * @private
         */
        _handleDate: function() {
            var self = this,
                date = self.date;
            self.weekday = date.getDay() + 1;//?????//????ï¿½ï¿½???????
            self.day = date.getDate();//???
            self.month = date.getMonth();//??ï¿½ï¿½
            self.year = date.getFullYear();//å¹´ä»½
            return this;
        },

        //get???
        _getHeadStr: function(year, month) {
            return year.toString() + 'ï¿? + (Number(month) + 1).toString() + '??;
        },

        //???
        _monthAdd: function() {
            var self = this;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            } else {
                self.month++;
            }
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //???
        _monthMinus: function() {
            var self = this;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            } else {
                self.month--;
            }
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //è£¸ï¿½?ï¿??ï¿????ï¿½ï¿½??[2009,11],ï¿?fullYearï¿??:ï¿?ï¿??è®¡ï¿½?
        _computeNextMonth: function(a) {
            var _year = a[0],
                _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            } else {
                _month++;
            }
            return [_year,_month];
        },

        //ï¿???ï¿½ï¿½????ç§»ï¿½?
        _handleOffset: function() {
            var self = this,
                data = ['??,'ï¿?,'ï¿?,'ï¿?,'??,'ï¿?,'??],
                temp = '<span>{$day}</span>',
                offset = self.startDay,
                day_html = '',
                a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day:data[(i - offset + 7) % 7]
                };
            }
            day_html = self._templetShow(temp, a);

            return {
                day_html:day_html
            };
        },

        //ï¿??èµ·ï¿½??ï¿½ï¿½?,d:Dateç±»ï¿½?
        _handleRange: function(d) {
            var self = this,t;
            if ((self.range.start === null && self.range.end === null ) || (self.range.start !== null && self.range.end !== null)) {
                self.range.start = d;
                self.range.end = null;
                self.render();
            } else if (self.range.start !== null && self.range.end === null) {
                self.range.end = d;
                if (self.range.start.getTime() > self.range.end.getTime()) {
                    t = self.range.start;
                    self.range.start = self.range.end;
                    self.range.end = t;
                }
                self.fire('rangeSelect', self.range);
                self.render();
            }
            return this;
        }
    });

    return Calendar;
}, { requires: ['node',"event"] });

/**
 * 2010-09-09 by lijing00333@163.com - ??ï¿½ï¿½
 *     - ï¿??ï¿?UI2/3??alendar?ï¿½ä¸º?ï¿½ï¿½?KISSY
 *     - ï¿??èµ·ï¿½??ï¿½ï¿½?ï¿????ï¿?????ï¿? *      - å¸¸ï¿½?ï¿????ugfix
 *
 * TODO:
 *   - ?ï¿½ï¿½??ï¿½ï¿½?????ï¿½ï¿½?ï¿??ï¿??
 *   - ï¿???ï¿½ï¿½???????äº¤ï¿½?è®¾ï¿½?
 */
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 *
 * Last modified by jayli ??ï¿½ï¿½ 2010-09-09
 * - ï¿??ï¿??????? * - ï¿??????ï¿½ï¿½?ï¿??wï¿????ï¿?????
 */
KISSY.add('calendar/date', function(S) {

    function dateParse(data) {

        var date = null;

        //Convert to date
        if (!(date instanceof Date)) {
            date = new Date(data);
        }
        else {
            return date;
        }

        // Validate
        if (date instanceof Date && (date != "Invalid Date") && !isNaN(date)) {
            return date;
        }
        else {
            return null;
        }

    }


    var dateFormat = function () {
        var token = /w{1}|d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = "0" + val;
                }
                return val;
            },
            // Some common format strings
            masks = {
                "default":      "ddd mmm dd yyyy HH:MM:ss",
                shortDate:      "m/d/yy",
                //mediumDate:     "mmm d, yyyy",
                longDate:       "mmmm d, yyyy",
                fullDate:       "dddd, mmmm d, yyyy",
                shortTime:      "h:MM TT",
                //mediumTime:     "h:MM:ss TT",
                longTime:       "h:MM:ss TT Z",
                isoDate:        "yyyy-mm-dd",
                isoTime:        "HH:MM:ss",
                isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
                isoUTCDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",

                //added by jayli
                localShortDate:    "yyï¿?m??d??,
                localShortDateTime:"yyï¿?m??d??hh:MM:ss TT",
                localLongDate:    "yyyyï¿?m??d??,
                localLongDateTime:"yyyyï¿?m??d??hh:MM:ss TT",
                localFullDate:    "yyyyï¿?m??d??w",
                localFullDateTime:"yyyyï¿?m??d??w hh:MM:ss TT"

            },

            // Internationalization strings
            i18n = {
                dayNames: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                    "?????,"???ï¿?,"???ï¿?,"???ï¿?,"?????,"???ï¿?,"?????
                ],
                monthNames: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ]
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) {
                throw SyntaxError("invalid date");
            }

            mask = String(masks[mask] || mask || masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d, undefined),
                    ddd:  i18n.dayNames[D],
                    dddd: i18n.dayNames[D + 7],
                    w:     i18n.dayNames[D + 14],
                    m:    m + 1,
                    mm:   pad(m + 1, undefined),
                    mmm:  i18n.monthNames[m],
                    mmmm: i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12, undefined),
                    H:    H,
                    HH:   pad(H, undefined),
                    M:    M,
                    MM:   pad(M, undefined),
                    s:    s,
                    ss:   pad(s, undefined),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L, undefined),
                    t:    H < 12 ? "a" : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A" : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    return {
        format: function(date, mask, utc) {
            return dateFormat(date, mask, utc);
        },
        parse: function(date) {
            return dateParse(date);
        }
    };
});

/**
 * 2010-09-14 ??ï¿½ï¿½
 *        - ï¿????.Date.format??.Date.parseï¿?ormatï¿??å¸¸ï¿½??ï¿½ï¿½?ï¿?????ï¿??ï¿??10ï¿??ï¿????ï¿½ï¿½???ï¿? *        - kissy-langï¿?????ï¿????ang.type(o)????isDate(d)?
 *        - æ¨¡ï¿½???ï¿½ï¿½??ï¿½ï¿½datetypeï¿???ï¿½ï¿½???ate? ????ï¿½ï¿½?ï¿??date
 *        - YUI??atetype?ï¿½ï¿½?å¤§ï¿½?ç²¾ï¿½?å¯¹ï¿½????ï¿??ï¿?ackï¿?ï¿½ï¿½ï¿?ISSY???ï¿?????KISSY???ï¿????ack?ï¿½ï¿½?
 */
/**
 * @module     ?ï¿½ï¿½?
 * @creator  ??ï¿½ï¿½<lijing00333@163.com>
 */
KISSY.add('calendar/page', function(S, UA, Node, Calendar) {

    S.augment(Calendar, {

        Page: function(config, father) {
            /**
             * ï¿????????
             * @constructor S.Calendar.Page
             * @param {object} config ,?????ï¿½ï¿½ï¿??ï¿??ï¿???ï¿½ï¿½??????ï¿½ï¿½??             * @param {object} father,???Y.Calendarï¿????????????ï¿½äº«?ï¿½ï¿½??????             * @return ï¿?????ï¿??
             */

            //ï¿??
            this.father = father;
            this.month = Number(config.month);
            this.year = Number(config.year);
            this.prevArrow = config.prevArrow;
            this.nextArrow = config.nextArrow;
            this.node = null;
            this.timmer = null;//?ï¿½ï¿½???????ï¿?            this.id = '';
            this.EV = [];
            this.html = [
                '<div class="ks-cal-box" id="{$id}">',
                '<div class="ks-cal-hd">',
                '<a href="javascript:void(0);" class="ks-prev {$prev}"><</a>',
                '<a href="javascript:void(0);" class="ks-title">{$title}</a>',
                '<a href="javascript:void(0);" class="ks-next {$next}">></a>',
                '</div>',
                '<div class="ks-cal-bd">',
                '<div class="ks-whd">',
                /*
                 '<span>??/span>',
                 '<span>ï¿?/span>',
                 '<span>ï¿?/span>',
                 '<span>ï¿?/span>',
                 '<span>??/span>',
                 '<span>ï¿?/span>',
                 '<span>??/span>',
                 */
                father._handleOffset().day_html,
                '</div>',
                '<div class="ks-dbd ks-clearfix">',
                '{$ds}',
                /*
                 <a href="" class="ks-null">1</a>
                 <a href="" class="ks-disabled">3</a>
                 <a href="" class="ks-selected">1</a>
                 <a href="" class="ks-today">1</a>
                 <a href="">1</a>
                 */
                '</div>',
                '</div>',
                '<div class="ks-setime hidden">',
                '</div>',
                '<div class="ks-cal-ft {$showtime}">',
                '<div class="ks-cal-time">',
                '?ï¿½ï¿½?ï¿?0:00 &hearts;',
                '</div>',
                '</div>',
                '<div class="ks-selectime hidden">',//<!--?ï¿½ä»¥ï¿???ï¿½ï¿½??ï¿½ï¿½????ï¿?????-->',
                '</div>',
                '</div><!--#ks-cal-box-->'
            ].join("");
            this.nav_html = [
                '<p>',
                '??,
                '<select' +
                    ' value="{$the_month}">',
                '<option class="m1" value="1">01</option>',
                '<option class="m2" value="2">02</option>',
                '<option class="m3" value="3">03</option>',
                '<option class="m4" value="4">04</option>',
                '<option class="m5" value="5">05</option>',
                '<option class="m6" value="6">06</option>',
                '<option class="m7" value="7">07</option>',
                '<option class="m8" value="8">08</option>',
                '<option class="m9" value="9">09</option>',
                '<option class="m10" value="10">10</option>',
                '<option class="m11" value="11">11</option>',
                '<option class="m12" value="12">12</option>',
                '</select>',
                '</p>',
                '<p>',
                'ï¿?,
                '<input type="text" value="{$the_year}" onfocus="this.select()"/>',
                '</p>',
                '<p>',
                '<button class="ok">ï¿??</button><button class="cancel">???</button>',
                '</p>'
            ].join("");


            //?ï¿½ï¿½?
            //å¸¸ï¿½???????ï¿??ï¿??
            this.Verify = function() {

                var isDay = function(n) {
                    if (!/^\d+$/i.test(n)) {
                        return false;
                    }
                    n = Number(n);
                    return !(n < 1 || n > 31);

                },
                    isYear = function(n) {
                        if (!/^\d+$/i.test(n)) {
                            return false;
                        }
                        n = Number(n);
                        return !(n < 100 || n > 10000);

                    },
                    isMonth = function(n) {
                        if (!/^\d+$/i.test(n)) {
                            return false;
                        }
                        n = Number(n);
                        return !(n < 1 || n > 12);


                    };

                return {
                    isDay:isDay,
                    isYear:isYear,
                    isMonth:isMonth

                };


            };

            /**
             * æ¸²ï¿½?ï¿?????UI
             */
            this._renderUI = function() {
                var cc = this,_o = {},ft;
                cc.HTML = '';
                _o.prev = '';
                _o.next = '';
                _o.title = '';
                _o.ds = '';
                if (!cc.prevArrow) {
                    _o.prev = 'hidden';
                }
                if (!cc.nextArrow) {
                    _o.next = 'hidden';
                }
                if (!cc.father.showtime) {
                    _o.showtime = 'hidden';
                }
                _o.id = cc.id = 'ks-cal-' + Math.random().toString().replace(/.\./i, '');
                _o.title = cc.father._getHeadStr(cc.year, cc.month);
                cc.createDS();
                _o.ds = cc.ds;
                cc.father.con.append(cc.father._templetShow(cc.html, _o));
                cc.node = Node.one('#' + cc.id);
                if (cc.father.showTime) {
                    ft = cc.node.one('.ks-cal-ft');
                    ft.removeClass('hidden');
                    cc.timmer = new cc.father.TimeSelector(ft, cc.father);
                }
                return this;
            };
            /**
             * ??ï¿½ï¿½ï¿?????ï¿?ï¿½ï¿½
             */
            this._buildEvent = function() {
                var cc = this,i,
                    con = Node.one('#' + cc.id);
                //flush event
                for (i = 0; i < cc.EV.length; i++) {
                    if (typeof cc.EV[i] != 'undefined') {
                        cc.EV[i].detach();
                    }
                }

                cc.EV[0] = con.one('div.ks-dbd').on('click', function(e) {
                    //e.preventDefault();
                    e.target = Node(e.target);
                    if (e.target.hasClass('ks-null')) {
                        return;
                    }
                    if (e.target.hasClass('ks-disabled')) {
                        return;
                    }
                    var selectedd = Number(e.target.html());
                    //ï¿??ï¿?ï¿½ï¿½??0?ï¿½ï¿½???1?ï¿½ï¿½?è®¾ç½®2??ï¿½ï¿½å°±ï¿½??ï¿½ï¿½?ï¿?                    var d = new Date('2010/01/01');
                    d.setYear(cc.year);
                    d.setMonth(cc.month);
                     d.setDate(selectedd);
                    //self.callback(d);
                    //datetime??ate
                    cc.father.dt_date = d;
                    cc.father.fire('select', {
                        date:d
                    });
                    if (cc.father.popup && cc.father.closable) {
                        cc.father.hide();
                    }
                    if (cc.father.rangeSelect) {
                        cc.father._handleRange(d);
                    }
                    cc.father.render({selected:d});
                });
                //???
                cc.EV[1] = con.one('a.ks-prev').on('click', function(e) {
                    e.preventDefault();
                    cc.father._monthMinus().render();
                    cc.father.fire('monthChange', {
                        date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                    });

                });
                //???
                cc.EV[2] = con.one('a.ks-next').on('click', function(e) {
                    e.preventDefault();
                    cc.father._monthAdd().render();
                    cc.father.fire('monthChange', {
                        date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                    });
                });
                if (cc.father.navigator) {
                    cc.EV[3] = con.one('a.ks-title').on('click', function(e) {
                        try {
                            cc.timmer.hidePopup();
                            e.preventDefault();
                        } catch(exp) {
                        }
                        e.target = Node(e.target);
                        var setime_node = con.one('.ks-setime');
                        setime_node.html('');
                        var in_str = cc.father._templetShow(cc.nav_html, {
                            the_month:cc.month + 1,
                            the_year:cc.year
                        });
                        setime_node.html(in_str);
                        setime_node.removeClass('hidden');
                        con.one('input').on('keydown', function(e) {
                            e.target = Node(e.target);
                            if (e.keyCode == 38) {//up
                                e.target.val(Number(e.target.val()) + 1);
                                e.target[0].select();
                            }
                            if (e.keyCode == 40) {//down
                                e.target.val(Number(e.target.val()) - 1);
                                e.target[0].select();
                            }
                            if (e.keyCode == 13) {//enter
                                var _month = con.one('.ks-setime').one('select').val();
                                var _year = con.one('.ks-setime').one('input').val();
                                con.one('.ks-setime').addClass('hidden');
                                if (!cc.Verify().isYear(_year)) {
                                    return;
                                }
                                if (!cc.Verify().isMonth(_month)) {
                                    return;
                                }
                                cc.father.render({
                                    date:new Date(_year + '/' + _month + '/01')
                                });
                                cc.father.fire('monthChange', {
                                    date:new Date(_year + '/' + _month + '/01')
                                });
                            }
                        });
                    });
                    cc.EV[4] = con.one('.ks-setime').on('click', function(e) {
                        e.preventDefault();
                        e.target = Node(e.target);
                        if (e.target.hasClass('ok')) {
                            var _month = con.one('.ks-setime').one('select').val(),
                                _year = con.one('.ks-setime').one('input').val();
                            con.one('.ks-setime').addClass('hidden');
                            if (!cc.Verify().isYear(_year)) {
                                return;
                            }
                            if (!cc.Verify().isMonth(_month)) {
                                return;
                            }
                            cc.father.render({
                                date:new Date(_year + '/' + _month + '/01')
                            });
                            cc.father.fire('monthChange', {
                                date:new Date(_year + '/' + _month + '/01')
                            });
                        } else if (e.target.hasClass('cancel')) {
                            con.one('.ks-setime').addClass('hidden');
                        }
                    });
                }
                return this;

            };
            /**
             * ï¿??ï¿??ï¿?????nodeï¿??
             */
            this._getNode = function() {
                var cc = this;
                return cc.node;
            };
            /**
             * ï¿????????ï¿?ï¿½ï¿½,???ï¿??å¹´ï¿½??ï¿½ï¿½??ï¿½å¹´
             */
            this._getNumOfDays = function(year, month) {
                return 32 - new Date(year, month - 1, 32).getDate();
            };
            /**
             * ????ï¿½ï¿½???tml
             */
            this.createDS = function() {
                var cc = this,
                    s = '',
                    startweekday = (new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay() + cc.father.startDay + 7) % 7,//ï¿??ï¿??å¤©ï¿½??????                    k = cc._getNumOfDays(cc.year, cc.month + 1) + startweekday,
                    i, _td_s;

                for (i = 0; i < k; i++) {
                    //prepare data {{
                    if (/532/.test(UA['webkit'])) {//hack for chrome
                        _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                    } else {
                        _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 2 - startweekday).toString());
                    }
                    var _td_e = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                    //prepare data }}
                    if (i < startweekday) {//null
                        s += '<a href="javascript:void(0);" class="ks-null">0</a>';
                    } else if (cc.father.minDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 2 - startweekday)).getTime() < (cc.father.minDate.getTime() + 1)) {//disabled
                        s += '<a href="javascript:void(0);" class="ks-disabled">' + (i - startweekday + 1) + '</a>';

                    } else if (cc.father.maxDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() > cc.father.maxDate.getTime()) {//disabled
                        s += '<a href="javascript:void(0);" class="ks-disabled">' + (i - startweekday + 1) + '</a>';


                    } else if ((cc.father.range.start !== null && cc.father.range.end !== null) && //?ï¿½ï¿½???????
                       (  _td_s.getTime() >= cc.father._showdate(1,cc.father.range.start).getTime() && _td_e.getTime() < cc.father._showdate(1,cc.father.range.end).getTime())) {

                        if (i == (startweekday + (new Date()).getDate() - 1) &&
                            (new Date()).getFullYear() == cc.year &&
                            (new Date()).getMonth() == cc.month) {//ï¿?ï¿½ï¿½å¹¶ï¿½????
                            s += '<a href="javascript:void(0);" class="ks-range ks-today">' + (i - startweekday + 1) + '</a>';
                        } else {
                            s += '<a href="javascript:void(0);" class="ks-range">' + (i - startweekday + 1) + '</a>';
                        }

                    } else if (i == (startweekday + (new Date()).getDate() - 1) &&
                        (new Date()).getFullYear() == cc.year &&
                        (new Date()).getMonth() == cc.month) {//today
                        s += '<a href="javascript:void(0);" class="ks-today">' + (i - startweekday + 1) + '</a>';

                    } else if (i == (startweekday + cc.father.selected.getDate() - 1) &&
                        cc.month == cc.father.selected.getMonth() &&
                        cc.year == cc.father.selected.getFullYear()) {//selected
                        s += '<a href="javascript:void(0);" class="ks-selected">' + (i - startweekday + 1) + '</a>';
                    } else {//other
                        s += '<a href="javascript:void(0);">' + (i - startweekday + 1) + '</a>';
                    }
                }
                if (k % 7 !== 0) {
                    for (i = 0; i < (7 - k % 7); i++) {
                        s += '<a href="javascript:void(0);" class="ks-null">0</a>';
                    }
                }
                cc.ds = s;
                return this;
            };
            /**
             * æ¸²ï¿½?
             */
            this.render = function() {
                var cc = this;
                cc._renderUI();
                cc._buildEvent();
                return this;
            };


        }//Page constructor over
    });
    return Calendar;
}, { requires:["ua","node","calendar/base"] });
/**
 * @module     ?ï¿½ï¿½?
 * @creator  ??ï¿½ï¿½<lijing00333@163.com>
 */
KISSY.add('calendar/time', function(S, Node,Calendar) {

    S.augment(Calendar, {

        /**
         * ?ï¿½ï¿½?????????         * @constructor S.Calendar.TimerSelector
         * @param {object} ft ,timer????????         * @param {object} father ???S.Calendarï¿????????????ï¿½äº«?ï¿½ï¿½??????         */
        TimeSelector:function(ft, father) {
            //ï¿??
            this.father = father;
            this.fcon = ft.parent('.ks-cal-box');
            this.popupannel = this.fcon.one('.ks-selectime');//?ï¿½ï¿½??ï¿½ï¿½???ï¿½ï¿½?ï¿½ï¿½?
            if (typeof father._time == 'undefined') {//ï¿??????ï¿½ï¿½?ï¿???ï¿½ï¿½?ï¿??
                father._time = new Date();
            }
            this.time = father._time;
            this.status = 's';//ï¿???????????'h','m','s'ï¿???ï¿½ï¿½??ï¿½ï¿½???ï¿½ï¿½??            this.ctime = Node('<div class="ks-cal-time">?ï¿½ï¿½?ï¿?span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u"></button><button class="d"></button></div><!--arrow}}--></div>');
            this.button = Node('<button class="ct-ok">ï¿??</button>');
            //ï¿??
            this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
            //???
            this.m_a = ['00','10','20','30','40','50'];
            //ï¿?            this.s_a = ['00','10','20','30','40','50'];


            //?ï¿½ï¿½?
            /**
             * ??ï¿½ï¿½?ï¿½ï¿½??????tmlï¿????????aï¿?             * ???ï¿???ï¿½ï¿½????ï¿?             * ï¿??ï¿??å¥½ï¿½?innerHTML,ï¿?ï¿½ï¿½ï¿??ï¿??ï¿?????a
             *
             */
            this.parseSubHtml = function(a) {
                var in_str = '';
                for (var i = 0; i < a.length; i++) {
                    in_str += '<a href="javascript:void(0);" class="item">' + a[i] + '</a>';
                }
                in_str += '<a href="javascript:void(0);" class="x">x</a>';
                return in_str;
            };
            /**
             * ?ï¿½ç¤ºks-selectimeå®¹ï¿½?
             * ???ï¿????ï¿½ï¿½??nnerHTML
             */
            this.showPopup = function(instr) {
                var self = this;
                this.popupannel.html(instr);
                this.popupannel.removeClass('hidden');
                var status = self.status;
                self.ctime.all('span').removeClass('on');
                switch (status) {
                    case 'h':
                        self.ctime.all('.h').addClass('on');
                        break;
                    case 'm':
                        self.ctime.all('.m').addClass('on');
                        break;
                    case 's':
                        self.ctime.all('.s').addClass('on');
                        break;
                }
            };
            /**
             * ???ks-selectimeå®¹ï¿½?
             */
            this.hidePopup = function() {
                this.popupannel.addClass('hidden');
            };
            /**
             * ï¿???ï¿½ï¿½??ï¿½ï¿½????ï¿?????ï¿??ï¿????ime?ï¿½ç¤º?ï¿½ï¿½?
             */
            this.render = function() {
                var self = this;
                var h = self.get('h');
                var m = self.get('m');
                var s = self.get('s');
                self.father._time = self.time;
                self.ctime.all('.h').html(h);
                self.ctime.all('.m').html(m);
                self.ctime.all('.s').html(s);
                return self;
            };
            //ï¿????et??et?ï¿½ï¿½????time???ï¿??å¹¶ï¿½?å¯¹ï¿½?ï¿?????ï¿??ï¿?            /**
             * set(status,v)
             * h:2,'2'
             */
            this.set = function(status, v) {
                var self = this;
                v = Number(v);
                switch (status) {
                    case 'h':
                        self.time.setHours(v);
                        break;
                    case 'm':
                        self.time.setMinutes(v);
                        break;
                    case 's':
                        self.time.setSeconds(v);
                        break;
                }
                self.render();
            };
            /**
             * get(status)
             */
            this.get = function(status) {
                var self = this;
                var time = self.time;
                switch (status) {
                    case 'h':
                        return time.getHours();
                    case 'm':
                        return time.getMinutes();
                    case 's':
                        return time.getSeconds();
                }
            };

            /**
             * add()
             * ?ï¿½ï¿½??ï¿½ä»£è¡?¿½????ï¿?
             */
            this.add = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v++;
                self.set(status, v);
            };
            /**
             * minus()
             * ?ï¿½ï¿½??ï¿½ä»£è¡?¿½????ï¿?
             */
            this.minus = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v--;
                self.set(status, v);
            };


            //???
            this._init = function() {
                var self = this;
                ft.html('').append(self.ctime);
                ft.append(self.button);
                self.render();
                self.popupannel.on('click', function(e) {
                    var el = Node(e.target);
                    if (el.hasClass('x')) {//?ï¿½ï¿½?
                        self.hidePopup();
                    } else if (el.hasClass('item')) {//?ï¿½ï¿½?ï¿?ï¿½ï¿½??                        var v = Number(el.html());
                        self.set(self.status, v);
                        self.hidePopup();
                    }
                });
                //ï¿?????ï¿?                self.button.on('click', function() {
                    //?????????ï¿??date
                    var d = typeof self.father.dt_date == 'undefined' ? self.father.date : self.father.dt_date;
                    d.setHours(self.get('h'));
                    d.setMinutes(self.get('m'));
                    d.setSeconds(self.get('s'));
                    self.father.fire('timeSelect', {
                        date:d
                    });
                    if (self.father.popup && self.father.closable) {
                        self.father.hide();
                    }
                });
                //ctimeï¿?????ï¿?ï¿½ï¿½ï¿??ï¿??ï¿?ï¿½ï¿½?ï¿½ï¿½??????                //TODO ???????ï¿½ï¿½?
                self.ctime.on('keyup', function(e) {
                    if (e.keyCode == 38 || e.keyCode == 37) {//up or left
                        //e.stopPropagation();
                        e.preventDefault();
                        self.add();
                    }
                    if (e.keyCode == 40 || e.keyCode == 39) {//down or right
                        //e.stopPropagation();
                        e.preventDefault();
                        self.minus();
                    }
                });
                //ï¿??ï¿?ï¿½ï¿½?ï¿½ï¿½?
                self.ctime.one('.u').on('click', function() {
                    self.hidePopup();
                    self.add();
                });
                //ï¿??ï¿?ï¿½ï¿½?ï¿½ï¿½?
                self.ctime.one('.d').on('click', function() {
                    self.hidePopup();
                    self.minus();
                });
                //å¼¹ï¿½????ï¿??
                self.ctime.one('.h').on('click', function() {
                    var in_str = self.parseSubHtml(self.h_a);
                    self.status = 'h';
                    self.showPopup(in_str);
                });
                //å¼¹ï¿½???????
                self.ctime.one('.m').on('click', function() {
                    var in_str = self.parseSubHtml(self.m_a);
                    self.status = 'm';
                    self.showPopup(in_str);
                });
                //å¼¹ï¿½????ï¿?                self.ctime.one('.s').on('click', function() {
                    var in_str = self.parseSubHtml(self.s_a);
                    self.status = 's';
                    self.showPopup(in_str);
                });


            };
            this._init();


        }

    });

    return Calendar;

}, { requires:["node","calendar/base"] });
KISSY.add("calendar", function(S, C, Page, Time, Date) {
    S.Calendar = C;
    S.Date = Date;
    return C;
}, {
    requires:["calendar/base","calendar/page","calendar/time","calendar/date","calendar/assets/base.css"]
});
