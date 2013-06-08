/**
 * GregorianCalendar GregorianDate class for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian', function (S, defaultLocale, Utils, undefined) {

    var toInt = parseInt;

    /**
     * GregorianCalendar GregorianDate class.
     * @class KISSY.GregorianDate
     */
    function GregorianDate(time, locale) {
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
         * The timezoneOffset used by this date.
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

    S.mix(GregorianDate, {
        Utils: Utils,
        /**
         * Enum indicating era field of date
         * @type Number
         */
        ERA: 0,
        /**
         * Enum indicating common era
         * @type Number
         */
        AD: 1,
        /**
         * Enum indicating before common era
         * @type Number
         */
        BC: 0,
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
        DATE: 3,
        /**
         * Enum indicating the day of the month.same as DATE
         * @type Number
         */
        DAY_OF_MONTH: 3,
        /**
         * Enum indicating the hour of the day
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
         * Enum indicating whether the HOUR is before or after noon.
         * @type Number
         */
        AM_PM: 13,
        /**
         * Enum indicating the hour of the morning or afternoon.
         * @type Number
         */
        HOUR: 14,

        /**
         * Enum indicating sunday
         * @type Number
         */
        SUNDAY: 1,
        /**
         * Enum indicating monday
         * @type Number
         */
        MONDAY: 2,
        /**
         * Enum indicating tuesday
         * @type Number
         */
        TUESDAY: 3,
        /**
         * Enum indicating wednesday
         * @type Number
         */
        WEDNESDAY: 4,
        /**
         * Enum indicating thursday
         * @type Number
         */
        THURSDAY: 5,
        /**
         * Enum indicating friday
         * @type Number
         */
        FRIDAY: 6,
        /**
         * Enum indicating saturday
         * @type Number
         */
        SATURDAY: 7,
        /**
         * Enum indicating january
         * @type Number
         */
        JANUARY: 0,
        /**
         * Enum indicating february
         * @type Number
         */
        FEBRUARY: 1,
        /**
         * Enum indicating march
         * @type Number
         */
        MARCH: 2,
        /**
         * Enum indicating april
         * @type Number
         */
        APRIL: 3,
        /**
         * Enum indicating may
         * @type Number
         */
        MAY: 4,
        /**
         * Enum indicating june
         * @type Number
         */
        JUNE: 5,
        /**
         * Enum indicating july
         * @type Number
         */
        JULY: 6,
        /**
         * Enum indicating august
         * @type Number
         */
        AUGUST: 7,
        /**
         * Enum indicating september
         * @type Number
         */
        SEPTEMBER: 8,
        /**
         * Enum indicating october
         * @type Number
         */
        OCTOBER: 9,
        /**
         * Enum indicating november
         * @type Number
         */
        NOVEMBER: 10,
        /**
         * Enum indicating december
         * @type Number
         */
        DECEMBER: 11,
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

    var DISPLAY_MAP = {};

    DISPLAY_MAP[GregorianDate.ERA] = 'era';
    DISPLAY_MAP[GregorianDate.AM_PM] = 'am_pm';
    DISPLAY_MAP[GregorianDate.MONTH] = {};
    DISPLAY_MAP[GregorianDate.MONTH][GregorianDate.SHORT] = 'shortMonths';
    DISPLAY_MAP[GregorianDate.MONTH][GregorianDate.LONG] = 'months';
    DISPLAY_MAP[GregorianDate.DAY_OF_WEEK] = {};
    DISPLAY_MAP[GregorianDate.DAY_OF_WEEK][GregorianDate.SHORT] = 'shortWeekdays';
    DISPLAY_MAP[GregorianDate.DAY_OF_WEEK][GregorianDate.LONG] = 'weekdays';

    var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based
    var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    // var ONE_WEEK = 7 * ONE_DAY;

    var EPOCH_OFFSET = 719163; // Fixed date of January 1, 1970 (Gregorian)
    // var EPOCH_YEAR = 1970;

    var mod = Utils.mod,
        isLeapYear = Utils.isLeapYear,
        floorDivide = Utils.floorDivide;

    GregorianDate.prototype = {
        constructor: GregorianDate,

        isSet: function (field) {
            return this.fields[field] !== undefined;
        },

        computeFields: function () {
            var time = this.time;
            var timezoneOffset = this.timezoneOffset;
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

            var era = GregorianDate.AD;

            var date = Utils.getGregorianDateFromFixedDate(fixedDate);

            var year = date.year;

            if (year <= 0) {
                year = 1 - year;
                era = GregorianDate.BC;
            }

            var fields = this.fields;
            fields[GregorianDate.ERA] = era;
            fields[GregorianDate.YEAR] = year;
            fields[GregorianDate.MONTH] = date.month;
            fields[GregorianDate.DAY_OF_MONTH] = date.dayOfMonth;
            fields[GregorianDate.DAY_OF_WEEK] = date.dayOfWeek;

            if (timeOfDay != 0) {
                var hours = toInt(timeOfDay / ONE_HOUR);
                fields[GregorianDate.HOUR_OF_DAY] = hours;
                fields[GregorianDate.AM_PM] = toInt(hours / 12);
                fields[GregorianDate.HOUR] = toInt(hours % 12);
                var r = timeOfDay % ONE_HOUR;
                fields[GregorianDate.MINUTE] = toInt(r / ONE_MINUTE);
                r %= ONE_MINUTE;
                fields[GregorianDate.SECOND] = toInt(r / ONE_SECOND);
                fields[GregorianDate.MILLISECOND] = r % ONE_SECOND;
            } else {
                fields[GregorianDate.HOUR_OF_DAY] =
                    fields[GregorianDate.AM_PM] =
                        fields[GregorianDate.HOUR] =
                            fields[GregorianDate.MINUTE] =
                                fields[GregorianDate.SECOND] =
                                    fields[GregorianDate.MILLISECOND] = 0;
            }


            var fixedDateJan1 = Utils.getFixedDate(year, GregorianDate.JANUARY, 1);
            var dayOfYear = fixedDate - fixedDateJan1 + 1;
            var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;

            fields[GregorianDate.DAY_OF_YEAR] = dayOfYear;
            fields[GregorianDate.DAY_OF_WEEK_IN_MONTH] = toInt(date.dayOfMonth / 7) + 1;

            var weekOfYear = this.getWeekNumber(fixedDateJan1, fixedDate);

            if (weekOfYear == 0) {
                var fixedDec31 = fixedDateJan1 - 1;
                var prevJan1 = fixedDateJan1 - 365;
                if (isLeapYear(year - 1)) {
                    prevJan1--;
                }
                weekOfYear = this.getWeekNumber(prevJan1, fixedDec31);
            } else {
                if (weekOfYear > 52) {
                    var nextJan1 = fixedDateJan1 + 365;
                    if (isLeapYear(year)) {
                        nextJan1++;
                    }
                    var nextJan1st = this.getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
                    var nDays = nextJan1st - nextJan1;
                    if (nDays > this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)) {
                        weekOfYear = 1;
                    }
                }
            }

            fields[GregorianDate.WEEK_OF_YEAR] = weekOfYear;
            fields[GregorianDate.WEEK_OF_MONTH] = this.getWeekNumber(fixDateMonth1, fixedDate);

            this.fieldsComputed = true;
        },

        getWeekNumber: function (fixedDay1, fixedDate) {
            var fixedDay1st = this.getDayOfWeekDateOnOrBefore(fixedDay1 + 6,
                this.firstDayOfWeek);
            var nDays = (fixedDay1st - fixedDay1);
            if (nDays >= this.minimalDaysInFirstWeek) {
                fixedDay1st -= 7;
            }
            var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
            if (normalizedDayOfPeriod >= 0) {
                return toInt(normalizedDayOfPeriod / 7) + 1;
            }
            return floorDivide(normalizedDayOfPeriod, 7) + 1;
        },

        'computeTime': function () {
            if (!this.isSet(GregorianDate.YEAR)) {
                throw new Error('year must be set for KISSY GregorianDate');
            }

            var fields = this.fields;

            var year = fields[GregorianDate.YEAR];
            var era = fields[GregorianDate.ERA];
            if (era == GregorianDate.BC) {
                year = 1 - year;
            }
            var timeOfDay = 0;
            if (this.isSet(GregorianDate.HOUR_OF_DAY)) {
                timeOfDay += fields[GregorianDate.HOUR_OF_DAY];
            } else {
                timeOfDay += fields[GregorianDate.HOUR];
                if (this.isSet(GregorianDate.AM_PM)) {
                    timeOfDay += 12 * fields[GregorianDate.AM_PM];
                }
            }
            timeOfDay *= 60;
            timeOfDay += fields[GregorianDate.MINUTE];
            timeOfDay *= 60;
            timeOfDay += fields[GregorianDate.SECOND];
            timeOfDay *= 1000;
            timeOfDay += fields[GregorianDate.MILLISECOND];

            var fixedDate = 0;

            fields[GregorianDate.YEAR] = year;

            fixedDate = fixedDate + this.getFixedDate();

            // millis represents local wall-clock time in milliseconds.
            var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;

            millis -= this.timezoneOffset;

            this.time = millis;

            this.computeFields();
        },

        getDayOfWeekDateOnOrBefore: function (fixedDate, dayOfWeek) {
            var fd = fixedDate - (dayOfWeek - 1);
            if (fd >= 0) {
                return fixedDate - (fd % 7);
            }
            return fixedDate - mod(fd, 7);
        },

        monthLength: function (month, year) {
            return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
        },

        getFixedDate: function () {

            var fields = this.fields;

            var year = fields[GregorianDate.YEAR];

            var month = GregorianDate.JANUARY;

            if (this.isSet(GregorianDate.MONTH)) {
                month = fields[GregorianDate.MONTH];
                if (month > GregorianDate.DECEMBER) {
                    year += toInt(month / 12);
                    month %= 12;
                } else if (month < GregorianDate.JANUARY) {
                    var rem = [];
                    year += floorDivide(month, 12, rem);
                    month = rem[0];
                }
            }

            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            var fixedDate = Utils.getFixedDate(year, month, 1);

            if (this.isSet(GregorianDate.MONTH)) {
                if (this.isSet(GregorianDate.DAY_OF_MONTH)) {
                    fixedDate += fields[GregorianDate.DAY_OF_MONTH] - 1;
                } else {
                    if (this.isSet(GregorianDate.WEEK_OF_MONTH)) {
                        var firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(fixedDate + 6,
                            this.firstDayOfWeek);

                        // If we have enough days in the first week, then
                        // move to the previous week.
                        if ((firstDayOfWeek - fixedDate) >= this.minimalDaysInFirstWeek) {
                            firstDayOfWeek -= 7;
                        }

                        if (this.isSet(GregorianDate.DAY_OF_WEEK)) {
                            firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6,
                                fields[GregorianDate.DAY_OF_WEEK]);
                        }

                        fixedDate = firstDayOfWeek + 7 * (fields[GregorianDate.WEEK_OF_MONTH] - 1);
                    } else {
                        var dayOfWeek;
                        if (this.isSet(GregorianDate.DAY_OF_WEEK)) {
                            dayOfWeek = fields[GregorianDate.DAY_OF_WEEK];
                        } else {
                            dayOfWeek = this.firstDayOfWeek;
                        }
                        var dowim;
                        if (this.isSet(GregorianDate.DAY_OF_WEEK_IN_MONTH)) {
                            dowim = fields[GregorianDate.DAY_OF_WEEK_IN_MONTH];
                        } else {
                            dowim = 1;
                        }

                        if (dowim >= 0) {
                            fixedDate = this.getDayOfWeekDateOnOrBefore(fixedDate + (7 * dowim) - 1,
                                dayOfWeek);
                        } else {
                            // Go to the first day of the next week of
                            // the specified week boundary.
                            var lastDate = this.monthLength(month, year) + (7 * (dowim + 1));
                            // Then, get the day of week date on or before the last date.
                            fixedDate = this.getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1,
                                dayOfWeek);
                        }
                    }
                }
            } else {
                // We are on the first day of the year.
                if (this.isSet(GregorianDate.DAY_OF_YEAR)) {
                    fixedDate += fields[GregorianDate.DAY_OF_YEAR] - 1;
                } else {
                    firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(fixedDate + 6,
                        this.firstDayOfWeek);
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    if ((firstDayOfWeek - fixedDate) >= this.minimalDaysInFirstWeek) {
                        firstDayOfWeek -= 7;
                    }
                    if (this.isSet(GregorianDate.DAY_OF_WEEK)) {
                        dayOfWeek = fields[GregorianDate.DAY_OF_WEEK];
                        if (dayOfWeek != this.firstDayOfWeek) {
                            firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6,
                                dayOfWeek);
                        }
                    }
                    fixedDate = firstDayOfWeek + 7 * (fields[GregorianDate.WEEK_OF_YEAR] - 1);
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
            } else if (len < GregorianDate.MILLISECOND + 1) {
                for (var i = 0; i < len; i++) {
                    this.fields[GregorianDate.YEAR + i] = arguments[i];
                }
            } else {
                throw  new Error('illegal arguments for KISSY GregorianDate set');
            }
            this.time = undefined;
            return this;
        },

        getTimezoneOffset: function () {
            return this.timezoneOffset;
        },

        'setTimezoneOffset': function (timezoneOffset) {
            this.timezoneOffset = timezoneOffset;
        },

        'setFirstDayOfWeek': function (firstDayOfWeek) {
            this.firstDayOfWeek = firstDayOfWeek;
            this.fieldsComputed = false;
        },

        'getFirstDayOfWeek': function () {
            return this.firstDayOfWeek;
        },

        'setMinimalDaysInFirstWeek': function (minimalDaysInFirstWeek) {
            this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
            this.fieldsComputed = false;
        },

        'getMinimalDaysInFirstWeek': function () {
            return this.minimalDaysInFirstWeek;
        },

        getFieldStrings: function (field, style, locale) {
            locale = locale || this.locale;
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
        },

        'getDisplayName': function (field, style, locale) {
            var v = this.get(field);
            var strings = this.getFieldStrings(field, style, locale);
            return strings[v];
        },

        'compareTo': function (that) {
            return this.time - that.time;
        },

        before: function (that) {
            return this.time < that.time;
        },

        after: function (that) {
            return this.time > that.time;
        },

        equals: function (that) {
            return this.time == that.getTime() &&
                this.firstDayOfWeek == that.firstDayOfWeek &&
                this.timezoneOffset == that.timezoneOffset &&
                this.minimalDaysInFirstWeek == that.minimalDaysInFirstWeek;
        }
    };

    return GregorianDate;

}, {
    requires: ['date/i18n/zh-cn', './gregorian/utils']
});

/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 */