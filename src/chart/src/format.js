/**
 * Formats the number according to the ‘format’ string;
 * adherses to the american number standard where a comma
 * is inserted after every 3 digits.
 *  note: there should be only 1 contiguous number in the format,
 * where a number consists of digits, period, and commas
 *        any other characters can be wrapped around this number, including ‘$’, ‘%’, or text
 *        examples (123456.789):
 *          ‘0 - (123456) show only digits, no precision
 *          ‘0.00 - (123456.78) show only digits, 2 precision
 *          ‘0.0000 - (123456.7890) show only digits, 4 precision
 *          ‘0,000 - (123,456) show comma and digits, no precision
 *          ‘0,000.00 - (123,456.78) show comma and digits, 2 precision
 *          ‘0,0.00 - (123,456.78) shortcut method, show comma and digits, 2 precision
 *
 * @method format
 * @param format {string} the way you would like to format this text
 * @return {string} the formatted number
 * @public
 */
KISSY.add("chart/format", function(S) {
    var format = function(that,format) {
        if (typeof format !== "string") {
            return;
        } // sanity check

        var hasComma = -1 < format.indexOf(","),
            psplit = format.split('.');

        // compute precision
        if (1 < psplit.length) {
            // fix number precision
            that = that.toFixed(psplit[1].length);
        }
        // error: too many periods
        else if (2 < psplit.length) {
            throw('NumberFormatException: invalid format, formats should have no more than 1 period:' + format);
        }
        // remove precision
        else {
            that = that.toFixed(0);
        }

        // get the string now that precision is correct
        var fnum = that.toString();

        // format has comma, then compute commas
        if (hasComma) {
            // remove precision for computation
            psplit = fnum.split('.');

            var cnum = psplit[0],
                parr = [],
                j = cnum.length,
                m = Math.floor(j / 3),
                n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop

            // break the number into chunks of 3 digits; first chunk may be less than 3
            for (var i = 0; i < j; i += n) {
                if (i != 0) {
                    n = 3;
                }
                parr[parr.length] = cnum.substr(i, n);
                m -= 1;
            }

            // put chunks back together, separated by comma
            fnum = parr.join(',');

            // add the precision back in
            if (psplit[1]) {
                fnum += '.' + psplit[1];
            }
        }

        // replace the number portion of the format with fnum
        return format.replace(/[\d,?\.?]+/, fnum);
    };

    var chart=S.namespace("Chart");
    chart.format=format;

    return format;

});
