function addMyCommand(XTemplate) {
    XTemplate.addCommand('objToStr', function (scopes, option, buffer) {
        return '';
        return buffer.write(JSON.stringify(option.params[0]));
    });

    XTemplate.addCommand('formatPrice', function (scopes, option, buffer) {
        return buffer.write((parseInt(option.params[0] * 100) / 100).toFixed(2));
    });

    XTemplate.addCommand('ifHas', function (scopes, option, buffer) {
        if (option.params[0].indexOf(option.params[1]) !== -1) {
            return option.fn(scopes, buffer);
        } else {
            return buffer;
        }
    });
}

if (typeof module !== 'undefined') {
    module.exports = {
        addMyCommand: addMyCommand
    };
}
