KISSY.add(function (S, SimpleDateFormat, GregorianCalendar) {

    describe('date format', function () {

        it('works simply', function () {
            var gregorianCalendar = new GregorianCalendar(2013,
                GregorianCalendar.JULY,9);
            var df = new SimpleDateFormat('yyyy-MM-dd');
            expect(df.format(gregorianCalendar)).toBe('2013-07-09');
            df = new SimpleDateFormat('yy-MM-dd');
            expect(df.format(gregorianCalendar)).toBe('13-07-09');
        });
    });

}, {
    requires: ['date/format', 'date/gregorian']
});