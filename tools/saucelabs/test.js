/**
 * use saucelabs to test various browsers
 * @author yiminghe@gmail.com
 */
(function () {
    if (!process.env.SAUCE_ACCESS_KEY) {
        console.log('does not have sauce access key!');
        console.log(process.env);
        return;
    }

    var Format = require('../../lib/date/format');
    var now = new Format('yyyy/M/d-hh:mm:ss').format(new Date());
    var runSauceLabs = require('./run/index');
    var buildId = process.env.TRAVIS_JOB_ID || 'local:' + now;

    function getOptionTemplate() {
        return {
            testname: '',
            build: buildId,
            urls: [],
            // https://saucelabs.com/platforms
            browsers: [
                {
                    browserName: 'iphone',
                    platform: 'OS X 10.9',
                    version: '7.1',
                    deviceName: 'iPhone',
                    'device-orientation': 'portrait'
                },
                {
                    browserName: 'ipad',
                    platform: 'OS X 10.9',
                    version: '7.1',
                    deviceName: 'iPad',
                    'device-orientation': 'portrait'
                },
                // unstable
//                {
//                    browserName: 'android',
//                    platform: 'Linux',
//                    version: '4.3',
//                    deviceName: 'Android',
//                    'device-orientation': 'portrait'
//                },
                {
                    browserName: 'chrome',
                    platform: 'Windows 8.1'
                },
                {
                    browserName: 'safari',
                    platform: 'OS X 10.9'
                },
                {
                    browserName: 'firefox',
                    platform: 'Windows 8.1'
                },
                {
                    browserName: 'internet explorer',
                    platform: 'Windows 8.1',
                    version: '11'
                },
                {
                    browserName: 'internet explorer',
                    platform: 'Windows 8',
                    version: '10'
                },
                {
                    browserName: 'internet explorer',
                    platform: 'Windows 7',
                    version: '9'
                },
                {
                    browserName: 'internet explorer',
                    platform: 'Windows 7',
                    version: '8'
                },
                {
                    browserName: 'internet explorer',
                    platform: 'Windows XP',
                    version: '7'
                },
                {
                    browserName: 'internet explorer',
                    platform: 'Windows XP',
                    version: '6'
                }
            ]
        };
    }

    var runners = require('./get-runners')();
    var allConfig = {};
    runners.forEach(function (runner) {
        var optionTemplate = getOptionTemplate();
        optionTemplate.testname = runner.name;
        optionTemplate.urls.push(runner.runner);
        allConfig[runner.name] = optionTemplate;
    });

    runSauceLabs(allConfig);
})();