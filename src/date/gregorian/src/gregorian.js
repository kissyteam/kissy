/**
 * GregorianCalendar class for KISSY.
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var toInt = parseInt;
    var Utils = require('./gregorian/utils');
    var defaultLocale = require('i18n!date');
    var Const = require('./gregorian/const');

    /**
     * GregorianCalendar class.
     *
     * - no arguments:
     *   Constructs a default GregorianCalendar using the current time
     *   in the default time zone with the default locale.
     * - one argument timezoneOffset:
     *   Constructs a GregorianCalendar based on the current time
     *   in the given timezoneOffset with the default locale.
     * - one argument locale:
     *   Constructs a GregorianCalendar
     *   based on the current time in the default time zone with the given locale.
     * - two arguments
     *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
     *      - zone - the given time zone.
     *      - aLocale - the given locale.
     *
     * - 3 to 6 arguments:
     *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
     *      - year - the value used to set the YEAR calendar field in the calendar.
     *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
     *        0 for January.
     *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
     *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
     *      - minute - the value used to set the MINUTE calendar field in the calendar.
     *      - second - the value used to set the SECONDS calendar field in the calendar.
     *
     *
     * @class KISSY.Date.Gregorian
     */
    function GregorianCalendar(timezoneOffset, locale) {

        var args = S.makeArray(arguments);

        if (S.isObject(timezoneOffset)) {
            locale = timezoneOffset;
            timezoneOffset = locale.timezoneOffset;
        } else if (args.length >= 3) {
            timezoneOffset = locale = null;
        }

        locale = locale || defaultLocale;

        this.locale = locale;

        this.fields = [];

        /**
         * The currently set time for this date.
         * @protected
         * @type Number|undefined
         */
        this.time = undefined;
        /**
         * The timezoneOffset in minutes used by this date.
         * @type Number
         * @protected
         */
        this.timezoneOffset = timezoneOffset || locale.timezoneOffset;
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

        if (arguments.length >= 3) {
            this.set.apply(this, args);
        }
    }

    S.mix(GregorianCalendar, Const);

    S.mix(GregorianCalendar, {
        Utils: Utils,

        /**
         * Determines if the given year is a leap year.
         * Returns true if the given year is a leap year. To specify BC year numbers,
         * 1 - year number must be given. For example, year BC 4 is specified as -3.
         * @param {Number} year the given year.
         * @returns {Boolean} true if the given year is a leap year; false otherwise.
         * @static
         * @method
         */
        isLeapYear: Utils.isLeapYear,

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
        MINUTES: 5,
        /**
         * Enum indicating the second of the day
         * @type Number
         */
        SECONDS: 6,
        /**
         * Enum indicating the millisecond of the day
         * @type Number
         */
        MILLISECONDS: 7,
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
        PM: 1
    });


    var fields = ['',
        'Year', 'Month', 'DayOfMonth',
        'HourOfDay',
        'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear',
        'WeekOfMonth', 'DayOfYear', 'DayOfWeek',
        'DayOfWeekInMonth'
    ];

    var YEAR = GregorianCalendar.YEAR;
    var MONTH = GregorianCalendar.MONTH;
    var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
    var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
    var MINUTE = GregorianCalendar.MINUTES;
    var SECONDS = GregorianCalendar.SECONDS;

    var MILLISECONDS = GregorianCalendar.MILLISECONDS;
    var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
    var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
    var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;

    var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
    var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;

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
        floorDivide = Math.floor;


    var MIN_VALUES = [
        undefined,
        1,              // YEAR
        GregorianCalendar.JANUARY,        // MONTH
        1,              // DAY_OF_MONTH
        0,              // HOUR_OF_DAY
        0,              // MINUTE
        0,              // SECONDS
        0,              // MILLISECONDS

        1,              // WEEK_OF_YEAR
        undefined,              // WEEK_OF_MONTH

        1,              // DAY_OF_YEAR
        GregorianCalendar.SUNDAY,         // DAY_OF_WEEK
        1             // DAY_OF_WEEK_IN_MONTH
    ];

    var MAX_VALUES = [
        undefined,
        292278994,      // YEAR
        GregorianCalendar.DECEMBER,       // MONTH
        undefined, // DAY_OF_MONTH
        23,             // HOUR_OF_DAY
        59,             // MINUTE
        59,             // SECONDS
        999,            // MILLISECONDS
        undefined,             // WEEK_OF_YEAR
        undefined,              // WEEK_OF_MONTH
        undefined,            // DAY_OF_YEAR
        GregorianCalendar.SATURDAY,       // DAY_OF_WEEK
        undefined              // DAY_OF_WEEK_IN_MONTH
    ];

    GregorianCalendar.prototype = {
        constructor: GregorianCalendar,

        /**
         * Determines if current year is a leap year.
         * Returns true if the given year is a leap year. To specify BC year numbers,
         * 1 - year number must be given. For example, year BC 4 is specified as -3.
         * @returns {Boolean} true if the given year is a leap year; false otherwise.
         * @method
         * @member KISSY.Date.Gregorian
         */
        isLeapYear: function () {
            return isLeapYear(this.getYear());
        },

        /**
         * Return local info for current date instance
         * @returns {Object}
         */
        getLocale: function () {
            return this.locale;
        },

        /**
         * Returns the minimum value for
         * the given calendar field of this GregorianCalendar instance.
         * The minimum value is defined as the smallest value
         * returned by the get method for any possible time value,
         * taking into consideration the current values of the getFirstDayOfWeek,
         * getMinimalDaysInFirstWeek.
         * @param field the calendar field.
         * @returns {Number} the minimum value for the given calendar field.
         */
        getActualMinimum: function (field) {
            if (MIN_VALUES[field] !== undefined) {
                return MIN_VALUES[field];
            }

            var fields = this.fields;
            if (field === WEEK_OF_MONTH) {
                var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
                return cal.get(WEEK_OF_MONTH);
            }

            throw new Error('minimum value not defined!');
        },

        /**
         * Returns the maximum value for the given calendar field
         * of this GregorianCalendar instance.
         * The maximum value is defined as the largest value returned
         * by the get method for any possible time value, taking into consideration
         * the current values of the getFirstDayOfWeek, getMinimalDaysInFirstWeek methods.
         * @param field the calendar field.
         * @returns {Number} the maximum value for the given calendar field.
         */
        getActualMaximum: function (field) {
            if (MAX_VALUES[field] !== undefined) {
                return MAX_VALUES[field];
            }
            var value,
                fields = this.fields;
            switch (field) {
                case DAY_OF_MONTH:
                    value = getMonthLength(fields[YEAR], fields[MONTH]);
                    break;

                case WEEK_OF_YEAR:
                    var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
                    value = endOfYear.get(WEEK_OF_YEAR);
                    if (value === 1) {
                        value = 52;
                    }
                    break;

                case WEEK_OF_MONTH:
                    var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
                    value = endOfMonth.get(WEEK_OF_MONTH);
                    break;

                case DAY_OF_YEAR:
                    value = getYearLength(fields[YEAR]);
                    break;

                case DAY_OF_WEEK_IN_MONTH:
                    value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
                    break;
            }
            if (value === undefined) {
                throw new Error('maximum value not defined!');
            }
            return value;
        },

        /**
         * Determines if the given calendar field has a value set,
         * including cases that the value has been set by internal fields calculations
         * triggered by a get method call.
         * @param field the calendar field to be cleared.
         * @returns {boolean} true if the given calendar field has a value set; false otherwise.
         */
        isSet: function (field) {
            return this.fields[field] !== undefined;
        },

        /**
         * Converts the time value (millisecond offset from the Epoch)
         * to calendar field values.
         * @protected
         */
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

            if (timeOfDay !== 0) {
                fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
                var r = timeOfDay % ONE_HOUR;
                fields[MINUTE] = toInt(r / ONE_MINUTE);
                r %= ONE_MINUTE;
                fields[SECONDS] = toInt(r / ONE_SECOND);
                fields[MILLISECONDS] = r % ONE_SECOND;
            } else {
                fields[HOUR_OF_DAY] =
                    fields[MINUTE] =
                        fields[SECONDS] =
                            fields[MILLISECONDS] = 0;
            }


            var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
            var dayOfYear = fixedDate - fixedDateJan1 + 1;
            var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;

            fields[DAY_OF_YEAR] = dayOfYear;
            fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;

            var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);

            // 本周没有足够的时间在当前年
            if (weekOfYear === 0) {
                // If the date belongs to the last week of the
                // previous year, use the week number of "12/31" of
                // the "previous" year.
                var fixedDec31 = fixedDateJan1 - 1;
                var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
                weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
            } else
            // 本周是年末最后一周，可能有足够的时间在新的一年
            if (weekOfYear >= 52) {
                var nextJan1 = fixedDateJan1 + getYearLength(year);
                var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
                var nDays = nextJan1st - nextJan1;
                // 本周有足够天数在新的一年
                if (nDays >= this.minimalDaysInFirstWeek &&
                    // 当天确实在本周，weekOfYear === 53 时是不需要这个判断
                    fixedDate >= (nextJan1st - 7)
                    ) {
                    weekOfYear = 1;
                }
            }

            fields[WEEK_OF_YEAR] = weekOfYear;
            fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);

            this.fieldsComputed = true;
        },

        /**
         * Converts calendar field values to the time value
         * (millisecond offset from the Epoch).
         * @protected
         */
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
            timeOfDay += fields[SECONDS] || 0;
            timeOfDay *= 1000;
            timeOfDay += fields[MILLISECONDS] || 0;

            var fixedDate = 0;

            fields[YEAR] = year;

            fixedDate = fixedDate + this.getFixedDate();

            // millis represents local wall-clock time in milliseconds.
            var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;

            millis -= this.timezoneOffset * ONE_MINUTE;

            this.time = millis;

            this.computeFields();
        },

        /**
         * Fills in any unset fields in the calendar fields. First,
         * the computeTime() method is called if the time value (millisecond offset from the Epoch)
         * has not been calculated from calendar field values.
         * Then, the computeFields() method is called to calculate all calendar field values.
         * @protected
         */
        complete: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            if (!this.fieldsComputed) {
                this.computeFields();
            }
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
                    year += floorDivide(month / 12);
                    month = mod(month, 12);
                }
            }

            // Get the fixed date since Jan 1, 1 (Gregorian). We are on
            // the first day of either `month' or January in 'year'.
            var fixedDate = Utils.getFixedDate(year, month, 1);
            var firstDayOfWeek;
            var dayOfWeek = self.firstDayOfWeek;

            if (self.isSet(DAY_OF_WEEK)) {
                dayOfWeek = fields[DAY_OF_WEEK];
            }

            if (self.isSet(MONTH)) {
                if (self.isSet(DAY_OF_MONTH)) {
                    fixedDate += fields[DAY_OF_MONTH] - 1;
                } else {
                    if (self.isSet(WEEK_OF_MONTH)) {
                        firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);

                        // If we have enough days in the first week, then
                        // move to the previous week.
                        if ((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek) {
                            firstDayOfWeek -= 7;
                        }

                        if (dayOfWeek !== firstDayOfWeekCfg) {
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
                            lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
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
                    if (dayOfWeek !== firstDayOfWeekCfg) {
                        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
                    }
                    fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
                }
            }

            return fixedDate;
        },

        /**
         * Returns this Calendar's time value in milliseconds
         * @member KISSY.Date.Gregorian
         * @returns {Number} the current time as UTC milliseconds from the epoch.
         */
        getTime: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            return this.time;
        },

        /**
         * Sets this Calendar's current time from the given long value.
         * @param time the new time in UTC milliseconds from the epoch.
         */
        'setTime': function (time) {
            this.time = time;
            this.fieldsComputed = false;
            this.complete();
        },

        /**
         * Returns the value of the given calendar field.
         * @param field the given calendar field.
         * @returns {Number} the value for the given calendar field.
         */
        get: function (field) {
            this.complete();
            return this.fields[field];
        },

        /**
         * Returns the year of the given calendar field.
         * @method getYear
         * @returns {Number} the year for the given calendar field.
         */


        /**
         * Returns the month of the given calendar field.
         * @method getMonth
         * @returns {Number} the month for the given calendar field.
         */


        /**
         * Returns the day of month of the given calendar field.
         * @method getDayOfMonth
         * @returns {Number} the day of month for the given calendar field.
         */


        /**
         * Returns the hour of day of the given calendar field.
         * @method getHourOfDay
         * @returns {Number} the hour of day for the given calendar field.
         */


        /**
         * Returns the minute of the given calendar field.
         * @method getMinute
         * @returns {Number} the minute for the given calendar field.
         */


        /**
         * Returns the second of the given calendar field.
         * @method getSecond
         * @returns {Number} the second for the given calendar field.
         */


        /**
         * Returns the millisecond of the given calendar field.
         * @method getMilliSecond
         * @returns {Number} the millisecond for the given calendar field.
         */


        /**
         * Returns the week of year of the given calendar field.
         * @method getWeekOfYear
         * @returns {Number} the week of year for the given calendar field.
         */


        /**
         * Returns the week of month of the given calendar field.
         * @method getWeekOfMonth
         * @returns {Number} the week of month for the given calendar field.
         */

        /**
         * Returns the day of year of the given calendar field.
         * @method getDayOfYear
         * @returns {Number} the day of year for the given calendar field.
         */

        /**
         * Returns the day of week of the given calendar field.
         * @method getDayOfWeek
         * @returns {Number} the day of week for the given calendar field.
         */

        /**
         * Returns the day of week in month of the given calendar field.
         * @method getDayOfWeekInMonth
         * @returns {Number} the day of week in month for the given calendar field.
         */

        /**
         * Sets the given calendar field to the given value.
         * @param field the given calendar field.
         * @param v the value to be set for the given calendar field.
         */
        set: function (field, v) {
            var len = arguments.length;
            if (len === 2) {
                this.fields[field] = v;
            } else if (len < MILLISECONDS + 1) {
                for (var i = 0; i < len; i++) {
                    this.fields[YEAR + i] = arguments[i];
                }
            } else {
                throw  new Error('illegal arguments for KISSY GregorianCalendar set');
            }
            this.time = undefined;
        },


        /**
         * Set the year of the given calendar field.
         * @method setYear
         */


        /**
         * Set the month of the given calendar field.
         * @method setMonth
         */


        /**
         * Set the day of month of the given calendar field.
         * @method setDayOfMonth
         */


        /**
         * Set the hour of day of the given calendar field.
         * @method setHourOfDay
         */


        /**
         * Set the minute of the given calendar field.
         * @method setMinute
         */


        /**
         * Set the second of the given calendar field.
         * @method setSecond
         */


        /**
         * Set the millisecond of the given calendar field.
         * @method setMilliSecond
         */


        /**
         * Set the week of year of the given calendar field.
         * @method setWeekOfYear
         */


        /**
         * Set the week of month of the given calendar field.
         * @method setWeekOfMonth
         */


        /**
         * Set the day of year of the given calendar field.
         * @method setDayOfYear
         */


        /**
         * Set the day of week of the given calendar field.
         * @method setDayOfWeek
         */


        /**
         * Set the day of week in month of the given calendar field.
         * @method setDayOfWeekInMonth
         */


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
         *  determines what fields are expected to be invariant.
         *
         *
         *      @example
         *      KISSY.use('date/gregorian',function(S, GregorianCalendar){
         *          var d = new GregorianCalendar();
         *          d.set(2012, GregorianCalendar.JANUARY, 31);
         *          d.add(Gregorian.MONTH,1);
         *          // 2012-2-29
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *          d.add(Gregorian.MONTH,12);
         *          // 2013-2-28
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *      });
         *
         * @param field the calendar field.
         * @param {Number} amount he amount of date or time to be added to the field.
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
                var yearAmount = floorDivide(value / 12);
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
                    case SECONDS:
                        amount *= ONE_SECOND;
                        break;
                    case MILLISECONDS:
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
                }
                self.setTime(self.time + amount);
            }

        },


        /**
         * add the year of the given calendar field.
         * @method addYear
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the month of the given calendar field.
         * @method addMonth
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the day of month of the given calendar field.
         * @method addDayOfMonth
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the hour of day of the given calendar field.
         * @method addHourOfDay
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the minute of the given calendar field.
         * @method addMinute
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the second of the given calendar field.
         * @method addSecond
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the millisecond of the given calendar field.
         * @method addMilliSecond
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the week of year of the given calendar field.
         * @method addWeekOfYear
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * add the week of month of the given calendar field.
         * @method addWeekOfMonth
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the day of year of the given calendar field.
         * @method addDayOfYear
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the day of week of the given calendar field.
         * @method addDayOfWeek
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * add the day of week in month of the given calendar field.
         * @method addDayOfWeekInMonth
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * Get rolled value for the field
         * @protected
         */
        getRolledValue: function (value, amount, min, max) {
            var diff = value - min;
            var range = max - min + 1;
            amount %= range;
            return min + (diff + amount + range) % range;
        },

        /**
         * Adds a signed amount to the specified calendar field without changing larger fields.
         * A negative roll amount means to subtract from field without changing
         * larger fields. If the specified amount is 0, this method performs nothing.
         *
         *
         *
         *      @example
         *      var d = new GregorianCalendar();
         *      d.set(1999, GregorianCalendar.AUGUST, 31);
         *      // 1999-4-30
         *      // Tuesday June 1, 1999
         *      d.set(1999, GregorianCalendar.JUNE, 1);
         *      d.add(Gregorian.WEEK_OF_MONTH,-1); // === d.add(Gregorian.WEEK_OF_MONTH,
         *      d.get(Gregorian.WEEK_OF_MONTH));
         *      // 1999-06-29
         *
         *
         * @param field the calendar field.
         * @param {Number} amount the signed amount to add to field.
         */
        roll: function (field, amount) {
            if (!amount) {
                return;
            }
            var self = this;
            // computer and retrieve original value
            var value = self.get(field);
            var min = self.getActualMinimum(field);
            var max = self.getActualMaximum(field);
            value = self.getRolledValue(value, amount, min, max);

            self.set(field, value);

            // consider compute time priority
            switch (field) {
                case MONTH:
                    adjustDayOfMonth(self);
                    break;
                default:
                    // other fields are set already when get
                    self.updateFieldsBySet(field);
                    break;
            }
        },


        /**
         * roll the year of the given calendar field.
         * @method rollYear
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * roll the month of the given calendar field.
         * @param {Number} amount the signed amount to add to field.
         * @method rollMonth
         */

        /**
         * roll the day of month of the given calendar field.
         * @method rollDayOfMonth
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * roll the hour of day of the given calendar field.
         * @method rollHourOfDay
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * roll the minute of the given calendar field.
         * @method rollMinute
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * roll the second of the given calendar field.
         * @method rollSecond
         * @param {Number} amount the signed amount to add to field.
         */

        /**
         * roll the millisecond of the given calendar field.
         * @method rollMilliSecond
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * roll the week of year of the given calendar field.
         * @method rollWeekOfYear
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * roll the week of month of the given calendar field.
         * @method rollWeekOfMonth
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * roll the day of year of the given calendar field.
         * @method rollDayOfYear
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * roll the day of week of the given calendar field.
         * @method rollDayOfWeek
         * @param {Number} amount the signed amount to add to field.
         */


        /**
         * remove other priority fields when call getFixedDate
         * precondition: other fields are all set or computed
         * @protected
         */
        updateFieldsBySet: function (field) {
            var fields = this.fields;
            switch (field) {
                case WEEK_OF_MONTH:
                    fields[DAY_OF_MONTH] = undefined;
                    break;
                case DAY_OF_YEAR:
                    fields[MONTH] = undefined;
                    break;
                case DAY_OF_WEEK:
                    fields[DAY_OF_MONTH] = undefined;
                    break;
                case WEEK_OF_YEAR:
                    fields[DAY_OF_YEAR] = undefined;
                    fields[MONTH] = undefined;
                    break;
            }
        },

        /**
         * get current date instance's timezone offset
         * @returns {Number}
         */
        getTimezoneOffset: function () {
            return this.timezoneOffset;
        },

        /**
         * set current date instance's timezone offset
         */
        'setTimezoneOffset': function (timezoneOffset) {
            if (this.timezoneOffset !== timezoneOffset) {
                this.fieldsComputed = undefined;
                this.timezoneOffset = timezoneOffset;
            }
        },

        /**
         * set first day of week for current date instance
         */
        'setFirstDayOfWeek': function (firstDayOfWeek) {
            if (this.firstDayOfWeek !== firstDayOfWeek) {
                this.firstDayOfWeek = firstDayOfWeek;
                this.fieldsComputed = false;
            }
        },

        /**
         * Gets what the first day of the week is; e.g., SUNDAY in the U.S., MONDAY in France.
         * @returns {Number} the first day of the week.
         */
        'getFirstDayOfWeek': function () {
            return this.firstDayOfWeek;
        },

        /**
         * Sets what the minimal days required in the first week of the year are; For example,
         * if the first week is defined as one that contains the first day of the first month of a year,
         * call this method with value 1.
         * If it must be a full week, use value 7.
         * @param minimalDaysInFirstWeek the given minimal days required in the first week of the year.
         */
        'setMinimalDaysInFirstWeek': function (minimalDaysInFirstWeek) {
            if (this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek) {
                this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
                this.fieldsComputed = false;
            }
        },

        /**
         * Gets what the minimal days required in the first week of the year are; e.g.,
         * if the first week is defined as one that contains the first day of the first month of a year,
         * this method returns 1.
         * If the minimal days required must be a full week, this method returns 7.
         * @returns {Number} the minimal days required in the first week of the year.
         */
        'getMinimalDaysInFirstWeek': function () {
            return this.minimalDaysInFirstWeek;
        },

        /**
         * Returns the number of weeks in the week year
         * represented by this GregorianCalendar.
         *
         * For example, if this GregorianCalendar's date is
         * December 31, 2008 with the ISO
         * 8601 compatible setting, this method will return 53 for the
         * period: December 29, 2008 to January 3, 2010
         * while getActualMaximum(WEEK_OF_YEAR) will return
         * 52 for the period: December 31, 2007 to December 28, 2008.
         *
         * @return {Number} the number of weeks in the week year.
         */
        'getWeeksInWeekYear': function () {
            var weekYear = this.getWeekYear();
            if (weekYear === this.get(YEAR)) {
                return this.getActualMaximum(WEEK_OF_YEAR);
            }
            // Use the 2nd week for calculating the max of WEEK_OF_YEAR
            var gc = this.clone();
            gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
            return gc.getActualMaximum(WEEK_OF_YEAR);
        },

        /**
         * Returns the week year represented by this GregorianCalendar.
         * The dates in the weeks between 1 and the
         * maximum week number of the week year have the same week year value
         * that may be one year before or after the calendar year value.
         *
         * @return {Number} the week year represented by this GregorianCalendar.
         */
        getWeekYear: function () {
            var year = this.get(YEAR); // implicitly  complete
            var weekOfYear = this.get(WEEK_OF_YEAR);
            var month = this.get(MONTH);
            if (month === GregorianCalendar.JANUARY) {
                if (weekOfYear >= 52) {
                    --year;
                }
            } else if (month === GregorianCalendar.DECEMBER) {
                if (weekOfYear === 1) {
                    ++year;
                }
            }
            return year;
        },
        /**
         * Sets this GregorianCalendar to the date given by the date specifiers - weekYear,
         * weekOfYear, and dayOfWeek. weekOfYear follows the WEEK_OF_YEAR numbering.
         * The dayOfWeek value must be one of the DAY_OF_WEEK values: SUNDAY to SATURDAY.
         *
         * @param weekYear    the week year
         * @param weekOfYear  the week number based on weekYear
         * @param dayOfWeek   the day of week value
         */
        'setWeekDate': function (weekYear, weekOfYear, dayOfWeek) {
            if (dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY) {
                throw new Error('invalid dayOfWeek: ' + dayOfWeek);
            }
            var fields = this.fields;
            // To avoid changing the time of day fields by date
            // calculations, use a clone with the GMT time zone.
            var gc = this.clone();
            gc.clear();
            gc.setTimezoneOffset(0);
            gc.set(YEAR, weekYear);
            gc.set(WEEK_OF_YEAR, 1);
            gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
            var days = dayOfWeek - this.getFirstDayOfWeek();
            if (days < 0) {
                days += 7;
            }
            days += 7 * (weekOfYear - 1);
            if (days !== 0) {
                gc.add(DAY_OF_YEAR, days);
            } else {
                gc.complete();
            }
            fields[YEAR] = gc.get(YEAR);
            fields[MONTH] = gc.get(MONTH);
            fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
            this.complete();
        },
        /**
         * Creates and returns a copy of this object.
         * @returns {KISSY.Date.Gregorian}
         */
        clone: function () {
            if (this.time === undefined) {
                this.computeTime();
            }
            var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
            cal.setTime(this.time);
            return cal;
        },

        /**
         * Compares this GregorianCalendar to the specified Object.
         * The result is true if and only if the argument is a GregorianCalendar object
         * that represents the same time value (millisecond offset from the Epoch)
         * under the same Calendar parameters and Gregorian change date as this object.
         * @param {KISSY.Date.Gregorian} obj the object to compare with.
         * @returns {boolean} true if this object is equal to obj; false otherwise.
         */
        equals: function (obj) {
            return this.getTime() === obj.getTime() &&
                this.firstDayOfWeek === obj.firstDayOfWeek &&
                this.timezoneOffset === obj.timezoneOffset &&
                this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek;
        },

        /**
         * Sets all the calendar field values or specified field and the time value
         * (millisecond offset from the Epoch) of this Calendar undefined.
         * This means that isSet() will return false for all the calendar fields,
         * and the date and time calculations will treat the fields as if they had never been set.
         * @param [field] the calendar field to be cleared.
         */
        clear: function (field) {
            if (field === undefined) {
                this.field = [];
            } else {
                this.fields[field] = undefined;
            }
            this.time = undefined;
            this.fieldsComputed = false;
        }
    };

    var GregorianCalendarProto = GregorianCalendar.prototype;

    if ('@DEBUG@') {
        // for idea
        GregorianCalendarProto.getDayOfMonth =
            GregorianCalendarProto.getHourOfDay =
                GregorianCalendarProto.getWeekOfYear =
                    GregorianCalendarProto.getWeekOfMonth =
                        GregorianCalendarProto.getDayOfYear =
                            GregorianCalendarProto.getDayOfWeek =
                                GregorianCalendarProto.getDayOfWeekInMonth = S.noop;

        GregorianCalendarProto.addDayOfMonth =
            GregorianCalendarProto.addMonth =
                GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes =
                    GregorianCalendarProto.addSeconds =
                        GregorianCalendarProto.addMilliSeconds =
                            GregorianCalendarProto.addHourOfDay =
                                GregorianCalendarProto.addWeekOfYear =
                                    GregorianCalendarProto.addWeekOfMonth =
                                        GregorianCalendarProto.addDayOfYear =
                                            GregorianCalendarProto.addDayOfWeek =
                                                GregorianCalendarProto.addDayOfWeekInMonth = S.noop;


        GregorianCalendarProto.isSetDayOfMonth =
            GregorianCalendarProto.isSetMonth =
                GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes =
                    GregorianCalendarProto.isSetSeconds =
                        GregorianCalendarProto.isSetMilliSeconds =
                            GregorianCalendarProto.isSetHourOfDay =
                                GregorianCalendarProto.isSetWeekOfYear =
                                    GregorianCalendarProto.isSetWeekOfMonth =
                                        GregorianCalendarProto.isSetDayOfYear =
                                            GregorianCalendarProto.isSetDayOfWeek =
                                                GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;

        GregorianCalendarProto.setDayOfMonth =
            GregorianCalendarProto.setHourOfDay =
                GregorianCalendarProto.setWeekOfYear =
                    GregorianCalendarProto.setWeekOfMonth =
                        GregorianCalendarProto.setDayOfYear =
                            GregorianCalendarProto.setDayOfWeek =
                                GregorianCalendarProto.setDayOfWeekInMonth = S.noop;

        GregorianCalendarProto.rollDayOfMonth =
            GregorianCalendarProto.rollMonth =
                GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes =
                    GregorianCalendarProto.rollSeconds =
                        GregorianCalendarProto.rollMilliSeconds =
                            GregorianCalendarProto.rollHourOfDay =
                                GregorianCalendarProto.rollWeekOfYear =
                                    GregorianCalendarProto.rollWeekOfMonth =
                                        GregorianCalendarProto.rollDayOfYear =
                                            GregorianCalendarProto.rollDayOfWeek =
                                                GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
    }

    S.each(fields, function (f, index) {
        if (f) {
            GregorianCalendarProto['get' + f] = function () {
                return this.get(index);
            };

            GregorianCalendarProto['isSet' + f] = function () {
                return this.isSet(index);
            };

            GregorianCalendarProto['set' + f] = function (v) {
                return this.set(index, v);
            };

            GregorianCalendarProto['add' + f] = function (v) {
                return this.add(index, v);
            };

            GregorianCalendarProto['roll' + f] = function (v) {
                return this.roll(index, v);
            };
        }
    });


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

    function getMonthLength(year, month) {
        return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
    }

    function getYearLength(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function getWeekNumber(self, fixedDay1, fixedDate) {
        var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
        var nDays = (fixedDay1st - fixedDay1);
        if (nDays >= self.minimalDaysInFirstWeek) {
            fixedDay1st -= 7;
        }
        var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
        return floorDivide(normalizedDayOfPeriod / 7) + 1;
    }

    function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
        // 1.1.1 is monday
        // one week has 7 days
        return fixedDate - mod(fixedDate - dayOfWeek, 7);
    }

    // ------------------- private end

    return GregorianCalendar;
});

/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */