/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 14 23:52
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 date/format
*/

/**
 * DateTimeFormat for KISSY.
 * Inspired by DateTimeFormat from JDK.
 * @author yiminghe@gmail.com
 */
KISSY.add('date/format', function (S, GregorianCalendar, defaultLocale) {
    var MAX_VALUE = Number.MAX_VALUE;

    /*

     Letter    Date or Time Component    Presentation    Examples
     G    Era designator    Text    AD
     y    Year    Year    1996; 96
     M    Month in year    Month    July; Jul; 07
     w    Week in year    Number    27
     W    Week in month    Number    2
     D    Day in year    Number    189
     d    Day in month    Number    10
     F    Day of week in month    Number    2
     E    Day in week    Text    Tuesday; Tue
     a    Am/pm marker    Text    PM
     H    Hour in day (0-23)    Number    0
     k    Hour in day (1-24)    Number    24
     K    Hour in am/pm (0-11)    Number    0
     h    Hour in am/pm (1-12)    Number    12
     m    Minute in hour    Number    30
     s    Second in minute    Number    55
     S    Millisecond    Number    978
     x z    Time zone    General time zone    Pacific Standard Time; PST; GMT-08:00
     Z    Time zone    RFC 822 time zone    -0800
     */

    var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).
        join('1');

    var ERA = 0;

    var calendarIndexMap = {};

    patternChars = patternChars.split('');
    patternChars[ERA] = 'G';
    patternChars[GregorianCalendar.YEAR] = 'y';
    patternChars[GregorianCalendar.MONTH] = 'M';
    patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
    patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
    patternChars[GregorianCalendar.MINUTE] = 'm';
    patternChars[GregorianCalendar.SECOND] = 's';
    patternChars[GregorianCalendar.MILLISECOND] = 'S';
    patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
    patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
    patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
    patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';

    S.each(patternChars, function (v, index) {
        calendarIndexMap[v] = index;
    });

    patternChars = /**
     @type String
     */patternChars.join('') + 'ahkKZE';

    function encode(lastField, count, compiledPattern) {
        compiledPattern.push({
            field: lastField,
            count: count
        });
    }

    function compile(pattern) {
        var length = pattern.length;
        var inQuote = false;
        var compiledPattern = [];
        var tmpBuffer = null;
        var count = 0;
        var lastField = -1;

        for (var i = 0; i < length; i++) {
            var c = pattern.charAt(i);

            if (c == "'") {
                // '' is treated as a single quote regardless of being
                // in a quoted section.
                if ((i + 1) < length) {
                    c = pattern.charAt(i + 1);
                    if (c == '\'') {
                        i++;
                        if (count != 0) {
                            encode(lastField, count, compiledPattern);
                            lastField = -1;
                            count = 0;
                        }
                        if (inQuote) {
                            tmpBuffer += c;
                        }
                        continue;
                    }
                }
                if (!inQuote) {
                    if (count != 0) {
                        encode(lastField, count, compiledPattern);
                        lastField = -1;
                        count = 0;
                    }
                    tmpBuffer = '';
                    inQuote = true;
                } else {
                    compiledPattern.push({
                        text: tmpBuffer
                    });
                    inQuote = false;
                }
                continue;
            }
            if (inQuote) {
                tmpBuffer += c;
                continue;
            }
            if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z')) {
                if (count != 0) {
                    encode(lastField, count, compiledPattern);
                    lastField = -1;
                    count = 0;
                }
                compiledPattern.push({
                    text: c
                });
                continue;
            }

            if (patternChars.indexOf(c) == -1) {
                throw new Error("Illegal pattern character " +
                    "'" + c + "'");
            }

            if (lastField == -1 || lastField == c) {
                lastField = c;
                count++;
                continue;
            }
            encode(lastField, count, compiledPattern);
            lastField = c;
            count = 1;
        }

        if (inQuote) {
            throw new Error("Unterminated quote");
        }

        if (count != 0) {
            encode(lastField, count, compiledPattern);
        }

        return compiledPattern;
    }

    var zeroDigit = '0';

    // TODO zeroDigit localization??
    function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
        // Optimization for 1, 2 and 4 digit numbers. This should
        // cover most cases of formatting date/time related items.
        // Note: This optimization code assumes that maxDigits is
        // either 2 or Integer.MAX_VALUE (maxIntCount in format()).
        buffer = buffer || [];
        maxDigits = maxDigits || MAX_VALUE;
        if (value >= 0) {
            if (value < 100 && minDigits >= 1 && minDigits <= 2) {
                if (value < 10 && minDigits == 2) {
                    buffer.push(zeroDigit);
                }
                buffer.push(value);
                return buffer.join('');
            } else if (value >= 1000 && value < 10000) {
                if (minDigits == 4) {
                    buffer.push(value);
                    return buffer.join('');
                }
                if (minDigits == 2 && maxDigits == 2) {
                    return zeroPaddingNumber(value % 100, 2, 2, buffer);
                }
            }
        }
        buffer.push(value + '');
        return buffer.join('');
    }

    function DateTimeFormat(pattern, locale, timeZoneOffset) {
        this.locale = locale || defaultLocale;
        this.pattern = compile(pattern);
        this.timezoneOffset = timeZoneOffset;
    }

    function formatField(field, count, locale, calendar) {
        var current,
            value;
        switch (field) {
            case 'G':
                value = calendar.get(GregorianCalendar.YEAR) > 0 ? 1 : 0;
                current = locale.eras[value];
                break;
            case 'y':
                value = calendar.get(GregorianCalendar.YEAR);
                if (value <= 0) {
                    value = 1 - value;
                }
                current = (zeroPaddingNumber(value, 2, count != 2 ? MAX_VALUE : 2));
                break;
            case 'M':
                value = calendar.get(GregorianCalendar.MONTH);
                if (count >= 4) {
                    current = locale.months[value];
                } else if (count == 3) {
                    current = locale.shortMonths[value];
                } else {
                    current = zeroPaddingNumber(value + 1, count);
                }
                break;
            case 'k':
                current = zeroPaddingNumber(calendar.get(GregorianCalendar.HOUR_OF_DAY) || 24,
                    count);
                break;
            case 'E':
                value = calendar.get(GregorianCalendar.DAY_OF_WEEK);
                current = count >= 4 ?
                    locale.weekdays[value] :
                    locale.shortWeekdays[value];
                break;
            case 'a':
                current = locale.ampms[calendar.get(GregorianCalendar.HOUR_OF_DAY) >= 12 ?
                    1 :
                    0];
                break;
            case 'h':
                current = zeroPaddingNumber(calendar.
                    get(GregorianCalendar.HOUR_OF_DAY) % 12 || 12, count);
                break;
            case 'K':
                current = zeroPaddingNumber(calendar.
                    get(GregorianCalendar.HOUR_OF_DAY) % 12, count);
                break;
            case 'Z':
                var offset = calendar.getTimezoneOffset();
                var parts = [offset < 0 ? '-' : '+'];
                offset = Math.abs(offset);
                parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2),
                    zeroPaddingNumber(offset % 60, 2));
                current = parts.join('');
                break;
            default :
                // case 'd':
                // case 'H':
                // case 'm':
                // case 's':
                // case 'S':
                // case 'D':
                // case 'F':
                // case 'w':
                // case 'W':
                var index = calendarIndexMap[field];
                value = calendar.get(index);
                current = zeroPaddingNumber(value, count);
        }
        return current;
    }

    function matchField(dateStr, startIndex, matches) {
        var matchedLen = -1,
            index = -1,
            i,
            len = matches.length;
        for (i = 0; i < len; i++) {
            var m = matches[i];
            var mLen = m.length;
            if (mLen > matchedLen &&
                matchPartString(dateStr, startIndex, m, mLen)) {
                matchedLen = mLen;
                index = i;
            }
        }
        return index >= 0 ? {
            value: index,
            startIndex: startIndex + matchedLen
        } : null;
    }

    function matchPartString(dateStr, startIndex, match, mLen) {
        for (var i = 0; i < mLen; i++) {
            if (dateStr.charAt(startIndex + i) != match.charAt(i)) {
                return false;
            }
        }
        return true;
    }

    function getLeadingNumberLen(str) {
        var i, c,
            len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charAt(i);
            if (c < '0' || c > '9') {
                break;
            }
        }
        return i;
    }

    function matchNumber(dateStr, startIndex, count, obeyCount) {
        var str = dateStr , n;
        if (obeyCount) {
            if (dateStr.length <= startIndex + count) {
                return null;
            }
            str = dateStr.substring(startIndex, count);
            if (!str.match(/^\d+$/)) {
                return null;
            }
        } else {
            str = str.substring(startIndex);
        }
        n = parseInt(str, 10);
        if (isNaN(n)) {
            return null;
        }
        return {
            value: n,
            startIndex: startIndex + getLeadingNumberLen(str)
        };
    }

    function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
        var match, year, hour;
        if (dateStr.length <= startIndex) {
            return startIndex;
        }
        switch (field) {
            case 'G':
                if (match = matchField(dateStr, startIndex, locale.eras)) {
                    if (calendar.isSet(GregorianCalendar.YEAR)) {
                        if (match.value == 0) {
                            year = calendar.get(GregorianCalendar.YEAR);
                            calendar.set(GregorianCalendar.YEAR, 1 - year);
                        }
                    } else {
                        tmp.era = match.value;
                    }
                }
                break;
            case 'y':
                if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                    year = match.value;
                    if ('era' in tmp) {
                        if (tmp.era === 0) {
                            year = 1 - year;
                        }
                    }
                    calendar.set(GregorianCalendar.YEAR, year);
                }
                break;
            case 'M':
                var month;
                if (count >= 3) {
                    if (match = matchField(dateStr, startIndex, locale[count == 3 ?
                        'shortMonths' : 'months'])) {
                        month = match.value;
                    }
                } else {
                    if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                        month = match.value-1;
                    }
                }
                if (match) {
                    calendar.set(GregorianCalendar.MONTH, month);
                }
                break;
            case 'k':
                if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                    calendar.set(GregorianCalendar.HOUR_OF_DAY, match.value % 24);
                }
                break;
            case 'E':
                if (match = matchField(dateStr, startIndex, locale[count > 3 ?
                    'weekdays' :
                    'shortWeekdays'])) {
                    calendar.set(GregorianCalendar.DAY_OF_WEEK, match.value);
                }
                break;
            case 'a':
                if (match = matchField(dateStr, startIndex, locale.ampms)) {
                    if (calendar.isSet(GregorianCalendar.HOUR_OF_DAY)) {
                        if (match.value) {
                            hour = calendar.get(GregorianCalendar.HOUR_OF_DAY);
                            if (hour < 12) {
                                calendar.set(GregorianCalendar.HOUR_OF_DAY, (hour + 12) % 24);
                            }
                        }
                    } else {
                        tmp.ampm = match.value;
                    }
                }
                break;
            case 'h':
                if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                    hour = match.value %= 12;
                    if (tmp.ampm) {
                        hour += 12;
                    }
                    calendar.set(GregorianCalendar.HOUR_OF_DAY, hour);
                }
                break;
            case 'K':
                if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                    hour = match.value;
                    if (tmp.ampm) {
                        hour += 12;
                    }
                    calendar.set(GregorianCalendar.HOUR_OF_DAY, hour);
                }
                break;
            case 'Z':
                if (dateStr)
                    var sign = 1,
                        zoneChar = dateStr.charAt(startIndex);
                if (zoneChar == '-') {
                    sign = -1;
                    startIndex++;
                } else if (zoneChar == '+') {
                    startIndex++;
                } else {
                    break;
                }
                if (match = matchNumber(dateStr, startIndex, 2, true)) {
                    var zoneOffset = match.value * 60;
                    startIndex = match.startIndex;
                    if (match = matchNumber(dateStr, startIndex, 2, true)) {
                        zoneOffset += match.value
                    }
                    calendar.setTimezoneOffset(zoneOffset);
                }
                break;
            default :
                // case 'd':
                // case 'H':
                // case 'm':
                // case 's':
                // case 'S':
                // case 'D':
                // case 'F':
                // case 'w':
                // case 'W'
                if (match = matchNumber(dateStr, startIndex, count, obeyCount)) {
                    var index = calendarIndexMap[field];
                    calendar.set(index, match.value);
                }
        }
        if (match) {
            startIndex = match.startIndex;
        }
        return startIndex;
    }

    DateTimeFormat.prototype = {
        format: function (calendar) {
            var time = calendar.getTimeInMillis();
            calendar = new GregorianCalendar(this.timezoneOffset, this.locale);
            calendar.setTimeInMillis(time);
            var i,
                ret = [],
                pattern = this.pattern,
                len = pattern.length;
            for (i = 0; i < len; i++) {
                var comp = pattern[i];
                if (comp.text) {
                    ret.push(comp.text);
                } else if ('field' in comp) {
                    ret.push(formatField(comp.field, comp.count, this.locale, calendar));
                }
            }
            return ret.join('');
        },
        parse: function (dateStr) {
            var calendar = new GregorianCalendar(this.timezoneOffset, this.locale),
                i,
                j,
                tmp = {},
                obeyCount = false,
                dateStrLen = dateStr.length,
                errorIndex = -1,
                startIndex = 0,
                oldStartIndex = 0,
                pattern = this.pattern,
                len = pattern.length;

            loopPattern: {
                for (i = 0; errorIndex < 0 && i < len; i++) {
                    var comp = pattern[i], text, textLen;
                    oldStartIndex = startIndex;
                    if (text = comp.text) {
                        textLen = text.length;
                        if ((textLen + startIndex) > dateStrLen) {
                            errorIndex = startIndex;
                        } else {
                            for (j = 0; j < textLen; j++) {
                                if (text.charAt(j) != dateStr.charAt(j + startIndex)) {
                                    errorIndex = startIndex;
                                    break loopPattern;
                                }
                            }
                            startIndex += textLen;
                        }
                    } else if ('field' in comp) {
                        obeyCount = false;
                        var nextComp = pattern[i + 1];
                        if (nextComp) {
                            if ('field' in nextComp) {
                                obeyCount = true;
                            } else {
                                var c = nextComp.text.charAt(0);
                                if (c >= '0' && c <= '9') {
                                    obeyCount = true;
                                }
                            }
                        }
                        startIndex = parseField(calendar,
                            dateStr,
                            startIndex,
                            comp.field,
                            comp.count,
                            this.locale,
                            obeyCount,
                            tmp);
                        if (startIndex == oldStartIndex) {
                            errorIndex = startIndex;
                        }
                    }
                }
            }

            if (errorIndex >= 0) {
                S.log(dateStr, 'warn');
                S.log(dateStr.substring(0, errorIndex) + '^', 'warn');
                throw new Error('error when parsing date');
            }
            return calendar;
        }
    };

    var DateTimeStyle = DateTimeFormat.Style = {
        FULL: 0,
        LONG: 1,
        MEDIUM: 2,
        SHORT: 3
    };

    S.mix(DateTimeFormat, {
        getInstance: function (locale, timeZoneOffset) {
            return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
        },
        'getDateInstance': function (dateStyle, locale, timeZoneOffset) {
            return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
        },
        getDateTimeInstance: function (dateStyle, timeStyle, locale, timeZoneOffset) {
            locale = locale || defaultLocale;
            var datePattern = '';
            if (dateStyle !== undefined) {
                datePattern = locale.datePatterns[dateStyle];
            }
            var timePattern = '';
            if (timeStyle !== undefined) {
                timePattern = locale.timePatterns[timeStyle];
            }
            var pattern = datePattern;
            if (timePattern) {
                if (datePattern) {
                    pattern = S.substitute(locale.dateTimePattern, {
                        date: datePattern,
                        time: timePattern
                    });
                } else {
                    pattern = timePattern;
                }
            }
            return new DateTimeFormat(pattern, locale, timeZoneOffset);
        },
        'getTimeInstance': function (timeStyle, locale, timeZoneOffset) {
            return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
        }
    });

    return DateTimeFormat;
}, {
    requires: [
        'date/gregorian',
        'i18n!date'
    ]
});

