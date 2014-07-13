function isParamNeed(value, defaultVal) {
    // 如果參數存在，且不等於預設值，且型別正確，則回傳需要加上此參數
    return value !== undefined && String(value) !== String(defaultVal);
}

function mergeIfParamNeed(data, key, value, defaultVal) {
    if (isParamNeed(value, defaultVal)) {
        data[key] = value;
    }
}

function addIfParamExists(data, key, value) {
    if (value !== undefined) {
        data[key] = String(value);
    }
}

function createBaseQuery(params) {
    params = params || {};

    var data = {};

    // 從 commands/url-command.js 傳來的參數中，needNav可能會是字串。
    //data.needNav  = params.needNav !== false && params.needNav !== 'false';

    mergeIfParamNeed(data, 'keyword', params.keyword || params.q, '');
    mergeIfParamNeed(data, 'frontCategory', params.frontCategory, -1);
    mergeIfParamNeed(data, 'tagname', params.tagname, '');

    mergeIfParamNeed(data, 'isPromotion', params.isPromotion, false);
    mergeIfParamNeed(data, 'invalid', params.invalid, false);
    mergeIfParamNeed(data, 'orderby', params.orderby, 'timeup');

    addIfParamExists(data, 'startrow', params.startrow);
    addIfParamExists(data, 'chunkNum', params.chunkNum);
    addIfParamExists(data, 'chunkSize', params.chunkSize);

    return data;
}

function merge(to, from) {
    for (var name in from) {
        to[name] = from[name];
    }
    return to;
}

function createQueryObject(originalQuery, updateQuery) {
    var queryParams = merge(merge({}, originalQuery), updateQuery),
        queryData = createBaseQuery(queryParams);

    return queryData;
}

function createPageQuery(originalQuery, startrow) {
    var queryObject = createQueryObject(originalQuery, {
        startrow: startrow
    });
    queryObject.needNav = true;
    return queryObject;
}

function createAsyncPageQuery(originalQuery, startrow, chunkNum, chunkSize) {
    var queryObject = createQueryObject(originalQuery, {
        startrow: startrow,
        chunkNum: chunkNum,
        chunkSize: chunkSize
    });
    queryObject.needNav = false;
    return queryObject;
}

var queryHelper = {
    createQueryObject: createQueryObject,
    createPageQuery: createPageQuery,
    createAsyncPageQuery: createAsyncPageQuery
};


/**
 * 根据优惠Id获取UAC中的优惠枚举类
 * @param promotionId
 */
function getPromotionTypeFlag(promotionType) {

    switch (promotionType) {
        case 101:
            return 'TTTJ';
        case 33:
            return 'TAOJINBI_LIMIT';
        case 32:
            return 'TAOJINBI_EXCHANGE';
        case 12:
            return 'ALIPAY_POINT';
        case 11:
            return 'GROUP_LIFE';
        case 10:
            return 'TMALL_PROM';
        case 1:
            return 'DISCOUNT';
        case 2:
            return 'JHS';
        case 3394:
            return 'JHS_TAG';
        case 4:
            return 'LIMITP';
        case 9:
            return 'TBVIP';
        case 31:
            return 'TAOJINBI_OFFICIAL';
        case 3:
            return 'TAOJINBI';
        case 5:
            return 'DXYH_TTTJ';
        case 6:
            return 'DXYH_JPMS';
        case 7:
            return 'DXYH';
        case 8:
            return 'GROUPINGP';
        case 102:
            return 'QINGCHANG';
        case 103:
            return 'TBWHD';
        case 104:
            return 'TMPPTM';
        case 105:
            return 'TMHD';
        case 106:
            return 'THIRDPROMOTION';
        case 1:
            return 'TAO_CODE';
        case 107:
            return 'TMALL_TJB';
    }
    return '';
}
/**
 * 获取宝贝降价类型对应的css信息
 * 降价有两种情况：原价小于收藏时的价格，PromotionItemDO为null，返回j；宝贝有优惠
 */
function getPriceCssTag(promotionType, promotionPrice) {

    if (!promotionPrice) {
        return 'j';
    }

    var promotionTypeFlag = getPromotionTypeFlag(promotionType);

    switch (promotionTypeFlag) {
        case 'QINGCHANG':
            return 'qc';
        case 'TAOJINBI_OFFICIAL':
            return 'tjb';
        case 'JHS':
            return 'jhs';
        case 'DXYH_TTTJ':
            return 'tt';
        case 'TBVIP':
            return 'vip';
        default:
            return 'c';
    }
}

/**
 * 分转元
 * @param priceLong
 * @returns
 */
function getPriceStr(priceLong) {
    if (isNaN(priceLong)) {
        return '';
    }
    return (Math.round(priceLong / 100)).toFixed(2);
}

/**
 * 获取降价文案
 */
function getPriceLabel(promotionPrice, collectPrice, originalPrice, promotionText) {

    if (promotionPrice <= 0) {
        if (originalPrice >= collectPrice) {
            return '';
        }
        return '本宝贝加入收藏夹时价格' + getPriceStr(collectPrice) + '元';
    }

    if (promotionPrice < originalPrice && originalPrice < collectPrice) {
        return promotionText +
            ';直降:' + getPriceStr(originalPrice - promotionPrice) + '元' +
            (collectPrice > 0 ? ';本宝贝加入收藏夹时价格:' + getPriceStr(collectPrice) : '');
    }

    if (promotionPrice < collectPrice && collectPrice < originalPrice) {
        return promotionText +
            ';直降:' + getPriceStr(originalPrice - promotionPrice) + '元' +
            (collectPrice > 0 ? ';本宝贝加入收藏夹时价格:' + getPriceStr(collectPrice) : '');
    }

    if (promotionPrice < originalPrice && originalPrice === collectPrice) {
        return promotionText +
            ';直降:' + getPriceStr(originalPrice - promotionPrice) + '元' +
            (collectPrice > 0 ? ';本宝贝加入收藏夹时价格:' + getPriceStr(collectPrice) : '');
    }

    if (promotionPrice === originalPrice && originalPrice < collectPrice) {
        return promotionText +
            ';直降:' + getPriceStr(originalPrice - promotionPrice) + '元' +
            (collectPrice > 0 ? ';本宝贝加入收藏夹时价格:' + getPriceStr(collectPrice) : '');
    }

    if (promotionPrice === collectPrice && collectPrice < originalPrice) {
        return promotionText +
            ';直降:' + getPriceStr(originalPrice - promotionPrice) + '元' +
            (collectPrice > 0 ? ';本宝贝加入收藏夹时价格:' + getPriceStr(collectPrice) : '');
    }

    if (collectPrice < promotionPrice && promotionPrice < originalPrice) {
        return promotionText +
            ';直降:' + getPriceStr(originalPrice - promotionPrice) + '元' +
            (collectPrice > 0 ? ';本宝贝加入收藏夹时价格:' + getPriceStr(collectPrice) : '');
    }

    return '';
}

function getPriceName(promotionType) {
    var promotionTypeFlag = getPromotionTypeFlag(promotionType);

    switch (promotionTypeFlag) {
        case 'QINGCHANG':
            return '清仓';
        case 'TAOJINBI_OFFICIAL':
            return '淘金币';
        case 'JHS':
            return '聚划算';
        case 'TTTJ':
            return '特价';
        case 'TBVIP':
            return 'VIP优惠';
        default:
            return '促';
    }
}

function isPricePromotion(promotionPrice, promotionStartTime, originPrice) {
    if (promotionPrice <= 0 || promotionPrice >= originPrice) {
        return false;
    }
    if (promotionStartTime >= Date.now()) {
        return false;
    }
    return true;
}

var priceHelper = {
    getPriceStr: getPriceStr,
    getPriceCssTag: getPriceCssTag,
    getPriceLabel: getPriceLabel,
    getPriceName: getPriceName,
    isPricePromotion: isPricePromotion
};


function queryStringToObj(str) {
    var result = {};
    if (!str || typeof str !== 'string') {
        return result;
    }

    str.split('&').forEach(function (param) {
        if (param) {
            var keyAndValue = param.split('=');
            result[keyAndValue[0]] = keyAndValue[1];
        }
    });

    return result;
}

function objToQueryString(obj) {
    obj = obj || {};
    return Object.keys(obj).filter(function (key) {
        var type = typeof obj[key];
        return type !== 'object' && type !== 'function';
    }).map(function (key) {
        return key + '=' + obj[key];
    }).join('&');
}

function concatUrlAndQueryString(url, queryString) {
    if (url.lastIndexOf('?') > -1) {
        return url + '&' + queryString;
    } else {
        return url + '?' + queryString;
    }
}

/**
 *   以下方法依賴於頁面數據的字段，必須提供queryData，已輔助生成查詢條件
 *   每次在queryHelper中重新建立新的Object，效能較差
 *   因為不想修改原本的Java回傳的queryData字段，因此選擇每次產生url時重新建立，
 *   若有性能需求，可更改成在pageModel中使用queryHelper 立的object取代原本的queryData
 *   並且在這邊直接使用
 */

function getRootData(scope) {
    scope = scope.parent || scope;
    return scope.getData();
}

function addMyCommand(XTemplate) {
    var cdnNum = 1;
    var commands = {
        count: function (scope, options) {
            var list = options.params[0],
                prop = options.params[1],
                count = 0;

            if (Object.prototype.toString.call(list) !== '[object Array]') {
                count = 0;
            } else if (!prop) {
                count = list.length;
            } else {
                var i, len, obj, val;

                count = 0;
                prop = prop.toString();

                for (i = 0, len = list.length; i < len; i += 1) {
                    obj = list[i];
                    if (obj && obj[prop]) {
                        val = obj[prop];
                        if (typeof val !== 'number') {
                            val = parseInt(val, 0);
                        }
                        if (!isNaN(val)) {
                            count += val;
                        }
                    }
                }
            }
            return count;
        },
        range: function (scope, options) {
            var ret = [],
                i;
            for (i = options.params[0]; i < options.params[1] + 1; i += 1) {
                ret.push(i);
            }
            return ret;
        },
        wrap: function (scope, options) {
            var params = options.params;

            var string = params[0] || '',
                keyword = params[1] || '',
                className = params[2] || '',
                tagName = params[3] || 'span';

            var keywords = keyword.split(' ')
                .sort(function (a, b) {
                    return b.length - a.length;
                });

            var regex = new RegExp('(' + keywords.join('|') + ')'),
                replace = '<' + tagName +
                    ' class=\"' + className + '\">$1</' + tagName + '>';

            return string.toString().replace(regex, replace);
        },
        imgUrl: function (scope, options) {
            var rootScope = scope.root || scope,
                rootData = rootScope.getData();
            var imgHost = rootData.config.imgServer;
            var imgServer = 'http://img0' + cdnNum + '.' + imgHost + '/bao/uploaded/';
            if (cdnNum === 4) {
                cdnNum = 1;
            } else {
                cdnNum++;
            }
            return imgServer + options.params[0] + '_' + options.params[1] + '.jpg';
        },

        formatPrice: function (scope, options) {
            var price = options.params[0];
            return priceHelper.getPriceStr(price);
        },
        pricePromotion: function (scope) {
            var data = scope.getData(),
                promotionStartTime = data.promotionStartTime,
                promotionPrice = data.promotionPrice,
                originPrice = data.originPrice;

            return priceHelper.isPricePromotion(
                promotionPrice, promotionStartTime, originPrice
            );
        },
        priceCssTag: function (scope) {
            var data = scope.getData(),
                promotionType = data.promotionType,
                promotionPrice = data.promotionPrice;

            return priceHelper.getPriceCssTag(promotionType, promotionPrice);
        },
        priceLabel: function (scope) {
            var data = scope.getData(),
                promotionText = data.promotionText,
                promotionPrice = data.promotionPrice,
                collectPrice = data.collectPrice,
                originPrice = data.originPrice;

            return priceHelper.getPriceLabel(
                promotionPrice, collectPrice, originPrice, promotionText
            );
        },
        priceName: function (scope) {
            var data = scope.getData(),
                promotionType = data.promotionType;

            return priceHelper.getPriceName(promotionType);
        }, /**
         *   使用目前的查詢條件，產生新的url。
         *   @param options.params[0] url: 新的url path。可為絕對路徑也可為相對路徑。
         *   @param options.params[1] queryString: 新的查詢條件，會merge回當前頁面的查詢條件
         */
        queryUrl: function (scope, options) {
            var data = getRootData(scope);

            var urlPath = options.params[0] || '/',
                queryData = data.queryData,
                externalQuery = queryStringToObj(options.params[1]);

            var queryObject = queryHelper.createQueryObject(queryData, externalQuery),
                queryString = objToQueryString(queryObject),
                queryUrl = concatUrlAndQueryString(urlPath, queryString);

            return queryUrl;
        },
        pageUrl: function (scope, options) {
            var data = getRootData(scope);

            var queryData = data.queryData,
                pageLink = data.pageLink,
                pageSize = data.pageInfo.bigPageSize;

            var pageIndex = options.params[0],
                startrow;

            if (!pageIndex || pageIndex < 1) {
                startrow = 0;
            } else {
                startrow = (pageIndex - 1) * pageSize;
            }

            var queryObject = queryHelper.createQueryObject(queryData, {
                    startrow: startrow
                }),
                queryString = objToQueryString(queryObject),
                queryUrl = concatUrlAndQueryString(pageLink, queryString);

            return queryUrl;
        },

        /**
         *   重置所有查詢條件，產生新的url。
         *   @param options.params[0] url: 新的url path。可為絕對路徑也可為相對路徑。
         *   @param options.params[1] queryString: 新的查詢條件
         */
        resetUrl: function (scope, options) {
            var urlPath = options.params[0] || '/',
                resetQueryData = queryStringToObj(options.params[1]);

            var queryObject = queryHelper.createQueryObject(resetQueryData),
                queryString = objToQueryString(queryObject),
                queryUrl = concatUrlAndQueryString(urlPath, queryString);

            return queryUrl;
        },


        tms: function (scopes, option) {
            return 'tms ' + (option.params[0]);
        },

        vmcommon: function (scopes, option, buffer) {
            return buffer.write('<div>vmcommon</div>', false);
        },

        richText: function (scopes) {
            return scopes.params[0];
        }
    };

    for (var name in commands) {
        XTemplate.addCommand(name, commands[name]);
    }
}

if (typeof module !== 'undefined') {
    module.exports = {
        addMyCommand: addMyCommand
    };
}
