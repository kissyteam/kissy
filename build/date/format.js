/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 9 22:45
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 date/format
*/

/**
 * SimpleDateFormat for KISSY.
 * Inspired by SimpleDateFormat from JDK.
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
     */patternChars.join('') + 'ahkKZ';

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

    function SimpleDateFormat(pattern, locale) {
        this.locale = locale || defaultLocale;
        this.pattern = compile(pattern);
    }

    function formatField(field, count, locale, gregorianCalendar) {
        var current,
            value;
        switch (field) {
            case 'G':
                value = gregorianCalendar.get(GregorianCalendar.YEAR) > 0 ? 1 : 0;
                current = locale.eras[value];
                break;
            case 'y':
                value = gregorianCalendar.get(GregorianCalendar.YEAR);
                if (value <= 0) {
                    value = 1 - value;
                }
                current = (zeroPaddingNumber(value, 2, count != 2 ? MAX_VALUE : 2));
                break;
            case 'M':
                value = gregorianCalendar.get(GregorianCalendar.MONTH);
                if (count >= 4) {
                    current = locale.months[value];
                } else if (count == 3) {
                    current = locale.shortMonths[value];
                } else {
                    current = zeroPaddingNumber(value + 1, 2);
                }
                break;
            case 'k':
                current = zeroPaddingNumber(gregorianCalendar.get(GregorianCalendar.HOUR_OF_DAY) || 24,
                    count);
                break;
            case 'E':
                value = gregorianCalendar.get(GregorianCalendar.DAY_OF_WEEK);
                current = count >= 4 ?
                    locale.weekdays[value] :
                    locale.shortWeekdays[value];
                break;
            case 'a':
                current =
                    locale.ampms(gregorianCalendar.get(GregorianCalendar.HOUR_OF_DAY) >= 12 ? 1 : 0);
                break;
            case 'h':
                current = zeroPaddingNumber((gregorianCalendar.
                    get(GregorianCalendar.HOUR_OF_DAY) + 1) % 12 || 12, count);
                break;
            case 'K':
                current = zeroPaddingNumber(gregorianCalendar.
                    get(GregorianCalendar.HOUR_OF_DAY) % 12, count);
                break;
            case 'Z':
                var offset = gregorianCalendar.getTimezoneOffset();
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
                value = gregorianCalendar.get(index);
                current = zeroPaddingNumber(value, count);
        }
        return current;
    }

    SimpleDateFormat.prototype = {
        format: function (gregorianCalendar) {
            var time = gregorianCalendar.getTimeInMillis();
            gregorianCalendar = new GregorianCalendar(this.locale);
            gregorianCalendar.setTimeInMillis(time);
            var i,
                ret = [],
                pattern = this.pattern,
                len = pattern.length;
            for (i = 0; i < len; i++) {
                var comp = pattern[i];
                if (comp.text) {
                    ret.push(comp.text);
                } else if ('field' in comp) {
                    ret.push(formatField(comp.field, comp.count, this.locale, gregorianCalendar));
                }
            }
            return ret.join('');
        }
    };

    return SimpleDateFormat;
}, {
    requires: [
        'date/gregorian',
        'date/i18n/zh-cn'
    ]
});

