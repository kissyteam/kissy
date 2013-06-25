/**
 * GregorianCalendar GregorianCalendar class for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian', function (S, defaultLocale, Utils, Const, undefined) {

    var toInt = parseInt;

    /**
     * GregorianCalendar GregorianCalendar class.
     * @class KISSY.GregorianCalendar
     */
    function GregorianCalendar(time, locale) {
        locale = locale || defaultLocale;

        this.locale = locale;

        this.fields = [];

        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        this.time = time || S.now();
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        this.timezoneOffset = locale.timezoneOffset;
        /**
         * The first day of the week
         * @type Number
         * @protected
         */
        this.firstDayOfWeek = locale.firstDayOfWeek;

        /**
         * The number of days required for the first week in a month or year,
         * with possible values from 1 to 7.
         * @@protected
         * @type Number
         */
        this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;

        this.fieldsComputed = false;
    }

    S.mix(GregorianCalendar, Const);

    S.mix(GregorianCalendar, {
        Utils: Utils,
        /**
         * Enum indicating year field of date
         * @type Number
         */
        YEAR: 1,
        /**
         * Enum indicating month field of date
         * @type Number
         */
        MONTH: 2,
        /**
         * Enum indicating the day of the month
         * @type Number
         */
        DAY_OF_MONTH: 3,
        /**
         * Enum indicating the hour (24).
         * @type Number
         */
        HOUR_OF_DAY: 4,
        /**
         * Enum indicating the minute of the day
         * @type Number
         */
        MINUTE: 5,
        /**
         * Enum indicating the second of the day
         * @type Number
         */
        SECOND: 6,
        /**
         * Enum indicating the millisecond of the day
         * @type Number
         */
        MILLISECOND: 7,
        /**
         * Enum indicating the week number within the current year
         * @type Number
         */
        WEEK_OF_YEAR: 8,
        /**
         * Enum indicating the week number within the current month
         * @type Number
         */
        WEEK_OF_MONTH: 9,

        /**
         * Enum indicating the day of the day number within the current year
         * @type Number
         */
        DAY_OF_YEAR: 10,
        /**
         * Enum indicating the day of the week
         * @type Number
         */
        DAY_OF_WEEK: 11,
        /**
         * Enum indicating the day of the ordinal number of the day of the week
         * @type Number
         */
        DAY_OF_WEEK_IN_MONTH: 12,

        /**
         * Enum indicating am
         * @type Number
         */
        AM: 0,
        /**
         * Enum indicating pm
         * @type Number
         */
        PM: 1,
        /**
         * Enum indicating short display name for field
         * @type Number
         */
        SHORT: 0,
        /**
         * Enum indicating long display name for field
         * @type Number
         */
        LONG: 1
    });

    var YEAR=GregorianCalendar.YEAR;
    var MONTH=GregorianCalendar.MONTH;
    var DAY_OF_MONTH=GregorianCalendar.DAY_OF_MONTH;
    var HOUR_OF_DAY=GregorianCalendar.HOUR_OF_DAY;
    var MINUTE=GregorianCalendar.MINUTE;
    var SECOND=GregorianCalendar.SECOND;

    var MILLISECOND=GregorianCalendar.MILLISECOND;
    var DAY_OF_WEEK_IN_MONTH=GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
    var DAY_OF_YEAR=GregorianCalendar.DAY_OF_YEAR;
    var DAY_OF_WEEK=GregorianCalendar.DAY_OF_WEEK;

    var WEEK_OF_MONTH=GregorianCalendar.WEEK_OF_MONTH;
    var WEEK_OF_YEAR=GregorianCalendar.WEEK_OF_YEAR;

    var SHORT=GregorianCalendar.SHORT;
    var LONG=GregorianCalendar.LONG;


    var DISPLAY_MAP = {};
    DISPLAY_MAP[MONTH] = {};
    DISPLAY_MAP[MONTH][SHORT] = 'shortMonths';
    DISPLAY_MAP[MONTH][LONG] = 'months';
    DISPLAY_MAP[DAY_OF_WEEK] = {};
    DISPLAY_MAP[DAY_OF_WEEK][SHORT] = 'shortWeekdays';
    DISPLAY_MAP[DAY_OF_WEEK][LONG] = 'weekdays';

    var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based
    var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    var ONE_WEEK = ONE_DAY * 7;

    var EPOCH_OFFSET = 719163; // Fixed date of January 1, 1970 (Gregorian)

    var mod = Utils.mod,
        isLeapYear = Utils.isLeapYear,
        floorDivide = Utils.floorDivide;

    GregorianCalendar.prototype = {
        constructor: GregorianCalendar,

        isSet: function (field) {
            return this.fields[field] !== undefined;
        },

        computeFields: function () {
            var time = this.time;
            var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
            var fixedDate = toInt(timezoneOffset / ONE_DAY);
            var timeOfDay = timezoneOffset % ONE_DAY;
            fixedDate += toInt(time / ONE_DAY);
            timeOfDay += time % ONE_DAY;
            if (timeOfDay >= ONE_DAY) {
                timeOfDay -= ONE_DAY;
                fixedDate++;
            } else {
                while (timeOfDay < 0) {
                    timeOfDay += ONE_DAY;
                    fixedDate--;
                }
            }

            fixedDate += EPOCH_OFFSET;

            var date = Utils.getGregorianDateFromFixedDate(fixedDate);

            var year = date.year;

            var fields = this.fields;
            fields[YEAR] = year;
            fields[MONTH] = date.month;
            fields[DAY_OF_MONTH] = date.dayOfMonth;
            fields[DAY_OF_WEEK] = date.dayOfWeek;

            if (timeOfDay != 0) {
                fields[HOUR_OF_DAY] =toInt(timeOfDay / ONE_HOUR);
                var r = timeOfDay % ONE_HOUR;
                fields[MINUTE] = toInt(r / ONE_MINUTE);
                r %= ONE_MINUTE;
                fields[SECOND] = toInt(r / ONE_SECOND);
                fields[MILLISECOND] = r % ONE_SECOND;
            } else {
                        fields[HOUR_OF_DAY] =
                                fields[MINUTE] =
                                    fields[SECOND] =
                                        fields[MILLISECOND] = 0;
            }


            var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
            var dayOfYear = fixedDate - fixedDateJan1 + 1;
            var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;

            fields[DAY_OF_YEAR] = dayOfYear;
            fields[DAY_OF_WEEK_IN_MONTH] = toInt(date.dayOfMonth / 7) + 1;

            var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);

            if (weekOfYear > 52) {
                var nextJan1 = fixedDateJan1 + 365;
                if (isLeapYear(year)) {
                    nextJan1++;
                }
                var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
                var nDays = nextJan1st - nextJan1;
                if (nDays > this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)) {
                    weekOfYear = 1;
                }
            }

            fields[WEEK_OF_YEAR] = weekOfYear;
            fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);

            this.fieldsComputed = true;
        },

        'computeTime': function () {
            if (!this.isSet(YEAR)) {
                throw new Error('year must be set for KISSY GregorianCalendar');
            }

            var fields = this.fields;

            var year = fields[YEAR];
            var timeOfDay = 0;
            if (this.isSet(HOUR_OF_DAY)) {
                timeOfDay += fields[HOUR_OF_DAY];
            }
            timeOfDay *= 60;
            timeOfDay += fields[MINUTE] || 0;
            timeOfDay *= 60;
            timeOfDay += fields[SECOND] || 0;
            timeOfDay *= 1000;
            timeOfDay += fields[MILLISECOND] || 0;

            var fixedDate = 0;

            fields[YEAR] = year;

            fixedDate = fixedDate + this.getFixedDate();

            // millis represents local wall-clock time in milliseconds.
            var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;

            millis -= this.timezoneOffset * ONE_MINUTE;

            this.time = millis;

            this.computeFields();
        },

        getFixedDate: function () {

            var self = this;

            var fields = self.fields;

            var firstDayOfWeekCfg = self.firstDayOfWeek;

            var year = fields[YEAR];

            var month = GregorianCalendar.JANUARY;

            if (self.isSet(MONTH)) {
                month = fields[MONTH];
                if (month > GregorianCalendar.DECEMBER) {
                    year += toInt(month / 12);
                    month %= 12;
                } else if (month < GregorianCalendar.JANUARY) {
                    var rem = [];
                    year += floorDivide(month, 12, rem);
                    month = rem[0];
                }
            }

            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            var fixedDate = Utils.getFixedDate(year, month, 1);

            var dayOfWeek = self.firstDayOfWeek;

            if (self.isSet(DAY_OF_WEEK)) {
                dayOfWeek = fields[DAY_OF_WEEK];
            }

            if (self.isSet(MONTH)) {
                if (self.isSet(DAY_OF_MONTH)) {
                    fixedDate += fields[DAY_OF_MONTH] - 1;
                } else {
                    if (self.isSet(WEEK_OF_MONTH)) {
                        var firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);

                        // If we have enough days in the first week, then
                        // move to the previous week.
                        if ((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek) {
                            firstDayOfWeek -= 7;
                        }

                        if (dayOfWeek != firstDayOfWeekCfg) {
                            firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
                        }

                        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
                    } else {
                        var dowim;
                        if (self.isSet(DAY_OF_WEEK_IN_MONTH)) {
                            dowim = fields[DAY_OF_WEEK_IN_MONTH];
                        } else {
                            dowim = 1;
                        }
                        var lastDate = (7 * dowim);
                        if (dowim < 0) {
                            lastDate = getMonthLength(month, year) + (7 * (dowim + 1));
                        }
                        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
                    }
                }
            } else {
                // We are on the first day of the year.
                if (self.isSet(DAY_OF_YEAR)) {
                    fixedDate += fields[DAY_OF_YEAR] - 1;
                } else {
                    firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    if ((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek) {
                        firstDayOfWeek -= 7;
                    }
                    if (dayOfWeek != firstDayOfWeekCfg) {
                        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
                    }
                    fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
                }
            }

            return fixedDate;
        },

        getTime: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            return this.time;
        },

        setTime: function (time) {
            this.time = time;
            this.fieldsComputed = false;
        },

        get: function (field) {
            if (this.time === undefined) {
                this.computeTime();
            }
            if (!this.fieldsComputed) {
                this.computeFields();
            }
            return this.fields[field];
        },

        set: function (field, v) {
            var len = arguments.length;
            if (len == 2) {
                this.fields[field] = v;
            } else if (len < MILLISECOND + 1) {
                for (var i = 0; i < len; i++) {
                    this.fields[YEAR + i] = arguments[i];
                }
            } else {
                throw  new Error('illegal arguments for KISSY GregorianCalendar set');
            }
            this.time = undefined;
            return this;
        },

        /**
         * add for specified field based on two rules:
         * 
         *  - Add rule 1. The value of field after the call minus the value of field before the
         *  call is amount, modulo any overflow that has occurred in field
         *  Overflow occurs when a field value exceeds its range and,
         *  as a result, the next larger field is incremented or 
         *  decremented and the field value is adjusted back into its range.
         *  
         *  - Add rule 2. If a smaller field is expected to be invariant, 
         *  but it is impossible for it to be equal to its
         *  prior value because of changes in its minimum or maximum after
         *  field is changed, then its value is adjusted to be as close
         *  as possible to its expected value. A smaller field represents a
         *  smaller unit of time. HOUR_OF_DAY is a smaller field than
         *  DAY_OF_MONTH. No adjustment is made to smaller fields
         *  that are not expected to be invariant. The calendar system
         *  determines what fields are expected to be invariant.</p>
         *  
         *  
         *
         *  @example
         *
         *      var d=new Gregorian(2012,0,31);
         *      d.add(Gregorian.MONTH,1);
         *      // 2012-2-28
         *      d.add(Gregorian.MONTH,12);
         *      // 2013-2-28
         *
         * @param field date field enum
         * @param {Number} amount  added unit
         */
        add: function (field, amount) {
            if (!amount) {
                return;
            }
            var self = this;
            var fields = self.fields;
            // computer and retrieve original value
            var value = self.get(field);
            if (field === YEAR) {
                value += amount;
                self.set(YEAR, value);
                adjustDayOfMonth(self);
            } else if (field === MONTH) {
                value += amount;
                var yearAmount = floorDivide(value, 12);
                value = mod(value, 12);
                if (yearAmount) {
                    self.set(YEAR, fields[YEAR] + yearAmount);
                }
                self.set(MONTH, value);
                adjustDayOfMonth(self);
            } else {
                switch (field) {
                    case HOUR_OF_DAY:
                        amount *= ONE_HOUR;
                        break;
                    case MINUTE:
                        amount *= ONE_MINUTE;
                        break;
                    case SECOND:
                        amount *= ONE_SECOND;
                        break;
                    case MILLISECOND:
                        break;
                    case WEEK_OF_MONTH:
                    case WEEK_OF_YEAR:
                    case DAY_OF_WEEK_IN_MONTH:
                        amount *= ONE_WEEK;
                        break;
                    case DAY_OF_WEEK:
                    case DAY_OF_YEAR:
                    case DAY_OF_MONTH:
                        amount *= ONE_DAY;
                        break;
                    default:
                        throw new Error('illegal field for add');
                        break;
                }
                self.setTime(self.time+amount);
            }

        },

        getTimezoneOffset: function () {
            return this.timezoneOffset;
        },

        'setTimezoneOffset': function (timezoneOffset) {
            if (this.timezoneOffset != timezoneOffset) {
                this.fieldsComputed = undefined;
                this.timezoneOffset = timezoneOffset;
            }
        },

        'setFirstDayOfWeek': function (firstDayOfWeek) {
            if (this.firstDayOfWeek != firstDayOfWeek) {
                this.firstDayOfWeek = firstDayOfWeek;
                this.fieldsComputed = false;
            }
        },

        'getFirstDayOfWeek': function () {
            return this.firstDayOfWeek;
        },

        'setMinimalDaysInFirstWeek': function (minimalDaysInFirstWeek) {
            if (this.minimalDaysInFirstWeek != minimalDaysInFirstWeek) {
                this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
                this.fieldsComputed = false;
            }
        },

        'getMinimalDaysInFirstWeek': function () {
            return this.minimalDaysInFirstWeek;
        },

        'getDisplayName': function (field, style, locale) {
            var v = this.get(field);
            var strings = getFieldStrings(field, style, locale || this.locale);
            return strings[v];
        },

        equals: function (that) {
            return this.time == that.getTime() &&
                this.firstDayOfWeek == that.firstDayOfWeek &&
                this.timezoneOffset == that.timezoneOffset &&
                this.minimalDaysInFirstWeek == that.minimalDaysInFirstWeek;
        }
    };


    // ------------------- private start

    function adjustDayOfMonth(self) {
        var fields = self.fields;
        var year = fields[YEAR];
        var month = fields[MONTH];
        var monthLen = getMonthLength(year, month);
        var dayOfMonth = fields[DAY_OF_MONTH];
        if (dayOfMonth > monthLen) {
            self.set(DAY_OF_MONTH, monthLen);
        }
    }

    function getMonthLength(month, year) {
        return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
    }

    function getFieldStrings(field, style, locale) {
        var strings, name = DISPLAY_MAP[field];
        if (name) {
            if (typeof name == 'string') {
                strings = locale[name];
            } else {
                name = name[style];
                strings = locale[name];
            }
        }
        return strings;
    }

    function getWeekNumber(self, fixedDay1, fixedDate) {
        var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
        var nDays = (fixedDay1st - fixedDay1);
        if (nDays >= self.minimalDaysInFirstWeek) {
            fixedDay1st -= 7;
        }
        var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
        return floorDivide(normalizedDayOfPeriod, 7) + 1;
    }

    function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
        // 1.1.1 is monday
        // one week has 7 days
        return fixedDate - mod(fixedDate - dayOfWeek, 7);
    }

    // ------------------- private end

    return GregorianCalendar;

}, {
    requires: ['date/i18n/zh-cn', './gregorian/utils', './gregorian/const']
});

/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 */