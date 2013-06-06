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
        DAY_OF_WEAK: 7,
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
    DISPLAY_MAP[Date.DAY_OF_WEAK] = {};
    DISPLAY_MAP[Date.DAY_OF_WEAK][Date.SHORT] = 'shortWeekdays';
    DISPLAY_MAP[Date.DAY_OF_WEAK][Date.LONG] = 'weekdays';

    var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based
    var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    var ONE_WEEK = 7 * ONE_DAY;

    Date.prototype = {
        constructor: Date,

        computeFields: function () {

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