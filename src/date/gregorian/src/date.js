/**
 * GregorianCalendar Date class for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add('date/base', function (S, defaultLocale) {

    /**
     * GregorianCalendar Date class.
     * @param [time] currently set time for this date.
     * @param [locale] currently locale for this date.
     * @class KISSY.Date
     */
    function Date(time, locale) {
        if (!time) {
            time = S.now()
        }

        locale = locale || defaultLocale;

        this.locale = locale;

        this.fields = [];

        /**
         * The currently set time for this date.
         * @protected
         * @type Number
         */
        this.time = time;
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
    }

    S.mix(Date, {
        /**
         * Enum indicating era field of date
         * @type Number
         */
        ERA: 0,
        /**
         * Enum indicating common era
         * @type Number
         */
        AD: 0,
        /**
         * Enum indicating before common era
         * @type Number
         */
        BC: 1,
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
         * Enum indicating the week number within the current year
         * @type Number
         */
        WEEK_OF_YEAR: 3,
        /**
         * Enum indicating the week number within the current month
         * @type Number
         */
        WEEK_OF_MONTH: 4,
        /**
         * Enum indicating the day of the month
         * @type Number
         */
        DATE: 5,
        /**
         * Enum indicating the day of the month.same as DATE
         * @type Number
         */
        DAY_OF_MONTH: 5,
        /**
         * Enum indicating the day of the day number within the current year
         * @type Number
         */
        DAY_OF_YEAR: 6,
        /**
         * Enum indicating the day of the week
         * @type Number
         */
        DAY_OF_WEEK: 7,
        /**
         * Enum indicating the day of the ordinal number of the day of the week
         * @type Number
         */
        DAY_OF_WEEK_IN_MONTH: 8,
        /**
         * Enum indicating whether the HOUR is before or after noon.
         * @type Number
         */
        AM_PM: 9,
        /**
         * Enum indicating the hour of the morning or afternoon.
         * @type Number
         */
        HOUR: 10,
        /**
         * Enum indicating the hour of the day
         * @type Number
         */
        HOUR_OF_DAY: 11,
        /**
         * Enum indicating the minute of the day
         * @type Number
         */
        MINUTE: 11,
        /**
         * Enum indicating the second of the day
         * @type Number
         */
        SECOND: 11,
        /**
         * Enum indicating the millisecond of the day
         * @type Number
         */
        MILLISECOND: 11,
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
        LONG: 1,


        'isLeapYear': function (year) {
            if ((year & 3) != 0) {
                return false;
            }
            return (year % 100 != 0) || (year % 400 == 0);
        }


    });

    var DISPLAY_MAP = {};

    DISPLAY_MAP[Date.ERA] = 'era';
    DISPLAY_MAP[Date.AM_PM] = 'am_pm';
    DISPLAY_MAP[Date.MONTH] = {};
    DISPLAY_MAP[Date.MONTH][Date.SHORT] = 'shortMonths';
    DISPLAY_MAP[Date.MONTH][Date.LONG] = 'months';
    DISPLAY_MAP[Date.DAY_OF_WEEK] = {};
    DISPLAY_MAP[Date.DAY_OF_WEEK][Date.SHORT] = 'shortWeekdays';
    DISPLAY_MAP[Date.DAY_OF_WEEK][Date.LONG] = 'weekdays';

    var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based
    var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    var ONE_WEEK = 7 * ONE_DAY;
    var BASE_YEAR = 1970;

    var FIXED_DATES = [
        719163, // 1970
        719528, // 1971
        719893, // 1972
        720259, // 1973
        720624, // 1974
        720989, // 1975
        721354, // 1976
        721720, // 1977
        722085, // 1978
        722450, // 1979
        722815, // 1980
        723181, // 1981
        723546, // 1982
        723911, // 1983
        724276, // 1984
        724642, // 1985
        725007, // 1986
        725372, // 1987
        725737, // 1988
        726103, // 1989
        726468, // 1990
        726833, // 1991
        727198, // 1992
        727564, // 1993
        727929, // 1994
        728294, // 1995
        728659, // 1996
        729025, // 1997
        729390, // 1998
        729755, // 1999
        730120, // 2000
        730486, // 2001
        730851, // 2002
        731216, // 2003
        731581, // 2004
        731947, // 2005
        732312, // 2006
        732677, // 2007
        733042, // 2008
        733408, // 2009
        733773, // 2010
        734138, // 2011
        734503, // 2012
        734869, // 2013
        735234, // 2014
        735599, // 2015
        735964, // 2016
        736330, // 2017
        736695, // 2018
        737060, // 2019
        737425, // 2020
        737791, // 2021
        738156, // 2022
        738521, // 2023
        738886, // 2024
        739252, // 2025
        739617, // 2026
        739982, // 2027
        740347, // 2028
        740713, // 2029
        741078, // 2030
        741443, // 2031
        741808, // 2032
        742174, // 2033
        742539, // 2034
        742904, // 2035
        743269, // 2036
        743635, // 2037
        744000, // 2038
        744365 // 2039
    ];

    var ACCUMULATED_DAYS_IN_MONTH
        //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        = [  0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    var ACCUMULATED_DAYS_IN_MONTH_LEAP
        //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1   10/1   11/1   12/1
        = [   0, 31, 59 + 1, 90 + 1, 120 + 1, 151 + 1, 181 + 1, 212 + 1, 243 + 1, 273 + 1, 304 + 1, 334 + 1];


    var EPOCH_OFFSET = 719163; // Fixed date of January 1, 1970 (Gregorian)
    /**
     * @ignore
     * @param n
     * @param d
     * @param [r]
     * @returns {number}
     */
    function floorDivide(n, d, r) {
        if (n >= 0) {
            if (r) {
                r[0] = n % d;
            }

            return n / d;
        }
        var q = ((n + 1) / d) - 1;
        if (r) {
            r[0] = n - (q * d);
        }
        return q;
    }

    function mod(x, y) {
        return (x - y * floorDivide(x, y));
    }

    Date.prototype = {
        constructor: Date,

        isSet: function (field) {
            return this.fields[field] !== undefined;
        },

        computeFields: function () {

        },

        computeTime: function () {
            var year = this.get(Date.YEAR);
            var era = this.get(Date.ERA);
            if (era == Date.BC) {
                year = 1 - year;
            }
            var timeOfDay = 0;
            if (this.isSet(Date.HOUR_OF_DAY)) {
                timeOfDay += this.get(Date.HOUR_OF_DAY);
            } else {
                timeOfDay += this.get(Date.HOUR);
                if (this.isSet(Date.AM_PM)) {
                    timeOfDay += 12 * this.get(Date.AM_PM);
                }
            }
            timeOfDay *= 60;
            timeOfDay += this.get(Date.MINUTE);
            timeOfDay *= 60;
            timeOfDay += this.get(Date.SECOND);
            timeOfDay *= 1000;
            timeOfDay += this.get(Date.MILLISECOND);

            var fixedDate = 0;

            fixedDate = fixedDate + this.getFixedDate(year);

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
            return Date.isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
        },

        getFixedDate: function (year) {
            var month = Date.JANUARY;

            if (this.isSet(Date.MONTH)) {
                month = this.get(Date.MONTH);
                if (month > Date.DECEMBER) {
                    year += month / 12;
                    month %= 12;
                } else if (month < Date.JANUARY) {
                    var rem = [];
                    year += floorDivide(month, 12, rem);
                    month = rem[0];
                }
            }

            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            var fixedDate = this.getFixedDate2(year, month, 1);

            if (this.isSet(Date.MONTH)) {
                if (this.isSet(Date.DAY_OF_MONTH)) {
                    fixedDate += this.get(Date.DAY_OF_MONTH) - 1;
                } else {
                    if (this.isSet(Date.WEEK_OF_MONTH)) {
                        var firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(fixedDate + 6,
                            this.firstDayOfWeek);

                        // If we have enough days in the first week, then
                        // move to the previous week.
                        if ((firstDayOfWeek - fixedDate) >= this.minimalDaysInFirstWeek) {
                            firstDayOfWeek -= 7;
                        }

                        if (this.isSet(Date.DAY_OF_WEEK)) {
                            firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6,
                                this.get(Date.DAY_OF_WEEK));
                        }

                        fixedDate = firstDayOfWeek + 7 * (this.get(Date.WEEK_OF_MONTH) - 1);
                    } else {
                        var dayOfWeek;
                        if (this.isSet(Date.DAY_OF_WEEK)) {
                            dayOfWeek = this.get(Date.DAY_OF_WEEK);
                        } else {
                            dayOfWeek = this.firstDayOfWeek;
                        }
                        var dowim;
                        if (this.isSet(Date.DAY_OF_WEEK_IN_MONTH)) {
                            dowim = this.get(Date.DAY_OF_WEEK_IN_MONTH);
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
                if (this.isSet(Date.DAY_OF_YEAR)) {
                    fixedDate += this.get(Date.DAY_OF_YEAR) - 1;
                } else {
                    firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(fixedDate + 6,
                        this.firstDayOfWeek);
                    // If we have enough days in the first week, then move
                    // to the previous week.
                    if ((firstDayOfWeek - fixedDate) >= this.minimalDaysInFirstWeek) {
                        firstDayOfWeek -= 7;
                    }
                    if (this.isSet(Date.DAY_OF_WEEK)) {
                        dayOfWeek = this.get(Date.DAY_OF_WEEK);
                        if (dayOfWeek != this.firstDayOfWeek) {
                            firstDayOfWeek = this.getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6,
                                dayOfWeek);
                        }
                    }
                    fixedDate = firstDayOfWeek + 7 * (this.get(Date.WEEK_OF_YEAR) - 1);
                }
            }

            return fixedDate;

        },

        getFixedDate2: function (year, month, dayOfMonth) {
            var isJan1 = month == Date.JANUARY && dayOfMonth == 1;
            var n = year - BASE_YEAR;
            if (n >= 0 && n < FIXED_DATES.length) {
                var jan1 = FIXED_DATES[n];
                return isJan1 ? jan1 : jan1 + this.getDayOfYear(year, month, dayOfMonth) - 1;
            }
            var prevYear = year - 1;
            var days = dayOfMonth;

            if (prevYear >= 0) {
                days += 365 * prevYear + prevYear / 4 - prevYear / 100 + prevYear / 400
                    + ((367 * month - 362) / 12);
            } else {
                days += (365 * prevYear)
                    + floorDivide(prevYear, 4)
                    - floorDivide(prevYear, 100)
                    + floorDivide(prevYear, 400)
                    + floorDivide((367 * month - 362), 12);
            }
            if (month > Date.FEBRUARY) {
                days -= Date.isLeapYear(year) ? 1 : 2;
            }
            return days;
        },

        getDayOfYear: function (year, month, dayOfMonth) {
            return dayOfMonth + (Date.isLeapYear(year) ?
                ACCUMULATED_DAYS_IN_MONTH_LEAP[month] :
                ACCUMULATED_DAYS_IN_MONTH[month]);
        },

        getTime: function () {
            return this.time;
        },

        setTime: function (time) {
            this.time = time;
            this.computeFields();
        },

        get: function (field) {
            return this.fields[field];
        },

        set: function (field, v) {
            var len = arguments.length;
            if (len == 2) {
                this.fields[field] = v;
            } else {
                for (var i = 0; i < len; i++) {
                    this.fields[Date.YEAR + i] = arguments[i];
                }
            }
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
        },

        'getFirstDayOfWeek': function () {
            return this.firstDayOfWeek;
        },

        'setMinimalDaysInFirstWeek': function (minimalDaysInFirstWeek) {
            this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
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

    return Date;

}, {
    requires: ['date/i18n/zh-cn']
});

/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 */