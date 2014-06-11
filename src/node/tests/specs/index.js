
    require('io')({
        url: '../specs/node.fragment.html',
        async: false,
        success: function (data) {
            window.$('body').append(data);
        }
    });

    require('./anim');
    require('./event');
    require('./node');