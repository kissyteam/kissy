/**
 * tests for gregorian gregorianCalendar
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, GregorianCalendar) {

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    // var ONE_WEEK = 7 * ONE_DAY;

    describe('GregorianCalendar', function () {


        describe('simple case', function () {
            var gregorianCalendar;

            beforeEach(function () {
                gregorianCalendar = new GregorianCalendar(2013,
                    GregorianCalendar.JUNE, 8, 18, 0, 0, 0);
            });

            it('time works', function () {
                expect(gregorianCalendar.getYear()).toBe(2013);
                expect(gregorianCalendar.getMonth()).toBe(5);
                expect(gregorianCalendar.getDayOfMonth()).toBe(8);
                expect(gregorianCalendar.getHourOfDay()).toBe(18);
                expect(gregorianCalendar.getMinutes()).toBe(0);
                expect(gregorianCalendar.getSeconds()).toBe(0);
                expect(gregorianCalendar.getMilliseconds()).toBe(0);
            });

            describe('WEEK_OF_YEAR works', function () {
                it('works for zh-cn', function () {
                    expect(gregorianCalendar.getWeekOfYear()).toBe(23);
                });

                it('works for start of year', function () {
                    gregorianCalendar.setYear(2012);
                    gregorianCalendar.setMonth( 0);
                    gregorianCalendar.setDayOfMonth(1);
                    expect(gregorianCalendar.getWeekOfYear()).toBe(1);

                });

                it('works for start of year for setFirstDayOfWeek2', function () {
                    gregorianCalendar.setYear(2012);
                    gregorianCalendar.setMonth(0);
                    gregorianCalendar.setDayOfMonth(1);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.THURSDAY);
                    expect(gregorianCalendar.getWeekOfYear()).toBe(1);
                });

                it('works for start of year 2', function () {
                    gregorianCalendar.setYear(2011);
                    gregorianCalendar.setMonth(0);
                    gregorianCalendar.setDayOfMonth(1);
                    expect(gregorianCalendar.getWeekOfYear()).toBe(1);
                });

                it('works for end of year', function () {
                    gregorianCalendar.setYear(2011);
                    gregorianCalendar.setMonth(11);
                    gregorianCalendar.setDayOfMonth(31);
                    expect(gregorianCalendar.getWeekOfYear()).toBe(1);
                });


                it('works for end of year', function () {
                    gregorianCalendar.setYear(2012);
                    gregorianCalendar.setMonth(11);
                    gregorianCalendar.setDayOfMonth(31);
                    expect(gregorianCalendar.getWeekOfYear()).toBe(1);
                    expect(gregorianCalendar.getWeekYear()).toBe(2013);
                });

                it('works for ISO 8601', function () {
                    gregorianCalendar.setYear(2012);
                    gregorianCalendar.setMonth(0);
                    gregorianCalendar.setDayOfMonth(1);
                    gregorianCalendar.setMinimalDaysInFirstWeek(4);
                    expect(gregorianCalendar.getWeekOfYear()).toBe(52);
                    expect(gregorianCalendar.getWeekYear()).toBe(2011);
                });

            });

            it('DAY_OF_WEEK works', function () {
                expect(gregorianCalendar.getDayOfWeek()).toBe(GregorianCalendar.SATURDAY);
            });


            describe('WEEK_OF_MONTH', function () {
                it('simply works', function () {
                    expect(gregorianCalendar.getWeekOfMonth()).toBe(2);
                    gregorianCalendar.setDayOfMonth(1);
                    expect(gregorianCalendar.getWeekOfMonth()).toBe(1);
                    gregorianCalendar.setDayOfMonth(3);
                    expect(gregorianCalendar.getWeekOfMonth()).toBe(2);


                    gregorianCalendar.setYear(2011);
                    gregorianCalendar.setMonth(11);
                    gregorianCalendar.setDayOfMonth(31);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.MONDAY);
                    expect(gregorianCalendar.getWeekOfMonth()).toBe(5);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.THURSDAY);
                    expect(gregorianCalendar.getWeekOfMonth()).toBe(5);
                });

                //For example, if getFirstDayOfWeek() is SUNDAY and getMinimalDaysInFirstWeek() is 4,
                // then the first week of January 1998 is Sunday, January 4 through Saturday, January 10.
                // These days have a WEEK_OF_MONTH of 1.
                // Thursday, January 1 through Saturday, January 3 have a WEEK_OF_MONTH of 0.
                // If getMinimalDaysInFirstWeek() is changed to 3,
                // then January 1 through January 3 have a WEEK_OF_MONTH of 1.

                it('getMinimalDaysInFirstWeek 1', function () {
                    gregorianCalendar.set(1998, GregorianCalendar.JANUARY, 1);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.SUNDAY);
                    gregorianCalendar.setMinimalDaysInFirstWeek(4);
                    expect(gregorianCalendar.getWeekOfMonth()).toBe(0);
                });

                it('getMinimalDaysInFirstWeek 1', function () {
                    gregorianCalendar.set(1998, GregorianCalendar.JANUARY, 1);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.SUNDAY);
                    gregorianCalendar.setMinimalDaysInFirstWeek(3);
                    expect(gregorianCalendar.getWeekOfMonth()).toBe(1);
                });
            });

            describe('DAY_OF_WEEK_IN_MONTH', function () {

                it('simply works', function () {
                    expect(gregorianCalendar.getDayOfWeekInMonth()).toBe(2);

                    gregorianCalendar.set(2013, GregorianCalendar.APRIL, 7, 18, 0, 0);

                    expect(gregorianCalendar.getDayOfWeekInMonth()).toBe(1);
                });

                // does not affect DAY_OF_WEEK_IN_MONTH
                it('getMinimalDaysInFirstWeek 1', function () {
                    gregorianCalendar.set(1998, GregorianCalendar.JANUARY, 1);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.SUNDAY);
                    gregorianCalendar.setMinimalDaysInFirstWeek(4);
                    expect(gregorianCalendar.getDayOfWeekInMonth()).toBe(1);
                });

                it('getMinimalDaysInFirstWeek 1', function () {
                    gregorianCalendar.set(1998, GregorianCalendar.JANUARY, 1);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.SUNDAY);
                    gregorianCalendar.setMinimalDaysInFirstWeek(3);
                    expect(gregorianCalendar.getDayOfWeekInMonth()).toBe(1);
                });

            });


            it('getTime works', function () {
                var jsDate = new Date(2013, GregorianCalendar.JUNE, 8, 18, 0, 0, 0);
                expect(jsDate.getTime() === gregorianCalendar.getTime());
            });

            it('DAY_OF_YEAR works', function () {
                var jan1Date = new Date(2013, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0);
                var jsDate = new Date(gregorianCalendar.getTime());
                var expected = parseInt((jsDate.getTime() - jan1Date.getTime()) / ONE_DAY) + 1;
                expect(gregorianCalendar.getDayOfYear()).toBe(expected);
            });

            it('WEEK_OF_YEAR works', function () {
                var gregorianCalendar = new GregorianCalendar();
                gregorianCalendar.setYear(1);
                gregorianCalendar.setDayOfWeek(GregorianCalendar.TUESDAY);
                gregorianCalendar.setWeekOfYear(1);
                expect(gregorianCalendar.getYear()).toBe(1);
                expect(gregorianCalendar.getDayOfWeek()).toBe(GregorianCalendar.TUESDAY);
                expect(gregorianCalendar.getDayOfMonth()).toBe(2);
            });
        });

        describe('add works', function () {

            it('can adjust DAY_OF_MONTH', function () {
                var d = new GregorianCalendar();
                d.set(2012, GregorianCalendar.JANUARY, 31);
                d.addMonth(1);
                expect(d.getYear()).toBe(2012);
                expect(d.getMonth()).toBe(GregorianCalendar.FEBRUARY);
                expect(d.getDayOfMonth()).toBe(29);
                // 2012-2-28
            });

            it('can adjust YEAR', function () {
                var d = new GregorianCalendar();
                d.set(2012, GregorianCalendar.JANUARY, 31);
                d.addMonth(13);
                expect(d.getYear()).toBe(2013);
                expect(d.getMonth()).toBe(GregorianCalendar.FEBRUARY);
                expect(d.getDayOfMonth()).toBe(28);
                // 2012-2-28
            });

        });

        describe("roll works", function () {

            it('can adjust DAY_OF_MONTH', function () {
                var d = new GregorianCalendar();
                d.set(1999, GregorianCalendar.AUGUST, 31);
                d.rollMonth( 8);
                expect(d.getYear()).toBe(1999);
                expect(d.getMonth()).toBe(GregorianCalendar.APRIL);
                expect(d.getDayOfMonth()).toBe(30);
                // 2012-2-28
            });

            it('can roll to begin', function () {
                var d = new GregorianCalendar();
                d.set(1999, GregorianCalendar.JUNE, 1);
                d.rollWeekOfMonth(-1);
                expect(d.getYear()).toBe(1999);
                expect(d.getMonth()).toBe(GregorianCalendar.JUNE);
                expect(d.getDayOfMonth()).toBe(29);
                // 2012-2-28
            });

        });


    });

},{
        requires:['date/gregorian']
    });