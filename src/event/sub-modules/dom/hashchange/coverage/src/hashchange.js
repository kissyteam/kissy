function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/hashchange.js']) {
  _$jscoverage['/hashchange.js'] = {};
  _$jscoverage['/hashchange.js'].lineData = [];
  _$jscoverage['/hashchange.js'].lineData[6] = 0;
  _$jscoverage['/hashchange.js'].lineData[7] = 0;
  _$jscoverage['/hashchange.js'].lineData[8] = 0;
  _$jscoverage['/hashchange.js'].lineData[9] = 0;
  _$jscoverage['/hashchange.js'].lineData[18] = 0;
  _$jscoverage['/hashchange.js'].lineData[23] = 0;
  _$jscoverage['/hashchange.js'].lineData[24] = 0;
  _$jscoverage['/hashchange.js'].lineData[27] = 0;
  _$jscoverage['/hashchange.js'].lineData[41] = 0;
  _$jscoverage['/hashchange.js'].lineData[42] = 0;
  _$jscoverage['/hashchange.js'].lineData[51] = 0;
  _$jscoverage['/hashchange.js'].lineData[54] = 0;
  _$jscoverage['/hashchange.js'].lineData[55] = 0;
  _$jscoverage['/hashchange.js'].lineData[56] = 0;
  _$jscoverage['/hashchange.js'].lineData[58] = 0;
  _$jscoverage['/hashchange.js'].lineData[60] = 0;
  _$jscoverage['/hashchange.js'].lineData[64] = 0;
  _$jscoverage['/hashchange.js'].lineData[66] = 0;
  _$jscoverage['/hashchange.js'].lineData[71] = 0;
  _$jscoverage['/hashchange.js'].lineData[82] = 0;
  _$jscoverage['/hashchange.js'].lineData[84] = 0;
  _$jscoverage['/hashchange.js'].lineData[85] = 0;
  _$jscoverage['/hashchange.js'].lineData[88] = 0;
  _$jscoverage['/hashchange.js'].lineData[92] = 0;
  _$jscoverage['/hashchange.js'].lineData[93] = 0;
  _$jscoverage['/hashchange.js'].lineData[100] = 0;
  _$jscoverage['/hashchange.js'].lineData[106] = 0;
  _$jscoverage['/hashchange.js'].lineData[110] = 0;
  _$jscoverage['/hashchange.js'].lineData[113] = 0;
  _$jscoverage['/hashchange.js'].lineData[114] = 0;
  _$jscoverage['/hashchange.js'].lineData[118] = 0;
  _$jscoverage['/hashchange.js'].lineData[119] = 0;
  _$jscoverage['/hashchange.js'].lineData[121] = 0;
  _$jscoverage['/hashchange.js'].lineData[126] = 0;
  _$jscoverage['/hashchange.js'].lineData[133] = 0;
  _$jscoverage['/hashchange.js'].lineData[134] = 0;
  _$jscoverage['/hashchange.js'].lineData[135] = 0;
  _$jscoverage['/hashchange.js'].lineData[137] = 0;
  _$jscoverage['/hashchange.js'].lineData[147] = 0;
  _$jscoverage['/hashchange.js'].lineData[150] = 0;
  _$jscoverage['/hashchange.js'].lineData[151] = 0;
  _$jscoverage['/hashchange.js'].lineData[155] = 0;
  _$jscoverage['/hashchange.js'].lineData[156] = 0;
  _$jscoverage['/hashchange.js'].lineData[157] = 0;
  _$jscoverage['/hashchange.js'].lineData[164] = 0;
  _$jscoverage['/hashchange.js'].lineData[165] = 0;
  _$jscoverage['/hashchange.js'].lineData[166] = 0;
  _$jscoverage['/hashchange.js'].lineData[167] = 0;
  _$jscoverage['/hashchange.js'].lineData[168] = 0;
  _$jscoverage['/hashchange.js'].lineData[181] = 0;
  _$jscoverage['/hashchange.js'].lineData[191] = 0;
  _$jscoverage['/hashchange.js'].lineData[198] = 0;
  _$jscoverage['/hashchange.js'].lineData[203] = 0;
  _$jscoverage['/hashchange.js'].lineData[204] = 0;
  _$jscoverage['/hashchange.js'].lineData[205] = 0;
  _$jscoverage['/hashchange.js'].lineData[207] = 0;
  _$jscoverage['/hashchange.js'].lineData[208] = 0;
  _$jscoverage['/hashchange.js'].lineData[209] = 0;
  _$jscoverage['/hashchange.js'].lineData[210] = 0;
  _$jscoverage['/hashchange.js'].lineData[214] = 0;
  _$jscoverage['/hashchange.js'].lineData[216] = 0;
  _$jscoverage['/hashchange.js'].lineData[217] = 0;
  _$jscoverage['/hashchange.js'].lineData[221] = 0;
  _$jscoverage['/hashchange.js'].lineData[222] = 0;
  _$jscoverage['/hashchange.js'].lineData[224] = 0;
  _$jscoverage['/hashchange.js'].lineData[227] = 0;
  _$jscoverage['/hashchange.js'].lineData[228] = 0;
  _$jscoverage['/hashchange.js'].lineData[230] = 0;
}
if (! _$jscoverage['/hashchange.js'].functionData) {
  _$jscoverage['/hashchange.js'].functionData = [];
  _$jscoverage['/hashchange.js'].functionData[0] = 0;
  _$jscoverage['/hashchange.js'].functionData[1] = 0;
  _$jscoverage['/hashchange.js'].functionData[2] = 0;
  _$jscoverage['/hashchange.js'].functionData[3] = 0;
  _$jscoverage['/hashchange.js'].functionData[4] = 0;
  _$jscoverage['/hashchange.js'].functionData[5] = 0;
  _$jscoverage['/hashchange.js'].functionData[6] = 0;
  _$jscoverage['/hashchange.js'].functionData[7] = 0;
  _$jscoverage['/hashchange.js'].functionData[8] = 0;
  _$jscoverage['/hashchange.js'].functionData[9] = 0;
  _$jscoverage['/hashchange.js'].functionData[10] = 0;
  _$jscoverage['/hashchange.js'].functionData[11] = 0;
  _$jscoverage['/hashchange.js'].functionData[12] = 0;
  _$jscoverage['/hashchange.js'].functionData[13] = 0;
  _$jscoverage['/hashchange.js'].functionData[14] = 0;
  _$jscoverage['/hashchange.js'].functionData[15] = 0;
}
if (! _$jscoverage['/hashchange.js'].branchData) {
  _$jscoverage['/hashchange.js'].branchData = {};
  _$jscoverage['/hashchange.js'].branchData['28'] = [];
  _$jscoverage['/hashchange.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['42'] = [];
  _$jscoverage['/hashchange.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['54'] = [];
  _$jscoverage['/hashchange.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['60'] = [];
  _$jscoverage['/hashchange.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['69'] = [];
  _$jscoverage['/hashchange.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['84'] = [];
  _$jscoverage['/hashchange.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['113'] = [];
  _$jscoverage['/hashchange.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['118'] = [];
  _$jscoverage['/hashchange.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['126'] = [];
  _$jscoverage['/hashchange.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['134'] = [];
  _$jscoverage['/hashchange.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['165'] = [];
  _$jscoverage['/hashchange.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['167'] = [];
  _$jscoverage['/hashchange.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['204'] = [];
  _$jscoverage['/hashchange.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['216'] = [];
  _$jscoverage['/hashchange.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['227'] = [];
  _$jscoverage['/hashchange.js'].branchData['227'][1] = new BranchData();
}
_$jscoverage['/hashchange.js'].branchData['227'][1].init(18, 12, 'this !== win');
function visit19_227_1(result) {
  _$jscoverage['/hashchange.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['216'][1].init(18, 12, 'this !== win');
function visit18_216_1(result) {
  _$jscoverage['/hashchange.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['204'][1].init(18, 5, 'timer');
function visit17_204_1(result) {
  _$jscoverage['/hashchange.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['167'][1].init(30, 26, 'e.propertyName === \'title\'');
function visit16_167_1(result) {
  _$jscoverage['/hashchange.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['165'][1].init(26, 17, 'e || window.event');
function visit15_165_1(result) {
  _$jscoverage['/hashchange.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['134'][1].init(18, 7, '!iframe');
function visit14_134_1(result) {
  _$jscoverage['/hashchange.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['126'][2].init(4067, 6, 'ie < 8');
function visit13_126_2(result) {
  _$jscoverage['/hashchange.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['126'][1].init(4061, 12, 'ie && ie < 8');
function visit12_126_1(result) {
  _$jscoverage['/hashchange.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['118'][1].init(18, 5, 'timer');
function visit11_118_1(result) {
  _$jscoverage['/hashchange.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['113'][1].init(18, 6, '!timer');
function visit10_113_1(result) {
  _$jscoverage['/hashchange.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['84'][1].init(54, 14, 'replaceHistory');
function visit9_84_1(result) {
  _$jscoverage['/hashchange.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['69'][2].init(1470, 6, 'ie < 8');
function visit8_69_2(result) {
  _$jscoverage['/hashchange.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['69'][1].init(1464, 12, 'ie && ie < 8');
function visit7_69_1(result) {
  _$jscoverage['/hashchange.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['60'][1].init(335, 17, 'hash !== lastHash');
function visit6_60_1(result) {
  _$jscoverage['/hashchange.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['54'][1].init(92, 36, 'hash.indexOf(REPLACE_HISTORY) !== -1');
function visit5_54_1(result) {
  _$jscoverage['/hashchange.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['42'][2].init(432, 9, 'm && m[0]');
function visit4_42_2(result) {
  _$jscoverage['/hashchange.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['42'][1].init(432, 16, 'm && m[0] || \'#\'');
function visit3_42_1(result) {
  _$jscoverage['/hashchange.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['28'][2].init(75, 16, 'doc && doc.title');
function visit2_28_2(result) {
  _$jscoverage['/hashchange.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['28'][1].init(75, 22, 'doc && doc.title || \'\'');
function visit1_28_1(result) {
  _$jscoverage['/hashchange.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/hashchange.js'].functionData[0]++;
  _$jscoverage['/hashchange.js'].lineData[7]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/hashchange.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/hashchange.js'].lineData[9]++;
  var UA = require('ua'), urlWithoutHash, Special = DomEvent.Special, win = S.Env.host, doc = win.document, REPLACE_HISTORY = '__ks_replace_history__', ie = UA.ieMode, HASH_CHANGE = 'hashchange';
  _$jscoverage['/hashchange.js'].lineData[18]++;
  DomEvent.REPLACE_HISTORY = REPLACE_HISTORY;
  _$jscoverage['/hashchange.js'].lineData[23]++;
  function getIframeDoc(iframe) {
    _$jscoverage['/hashchange.js'].functionData[1]++;
    _$jscoverage['/hashchange.js'].lineData[24]++;
    return iframe.contentWindow.document;
  }
  _$jscoverage['/hashchange.js'].lineData[27]++;
  var POLL_INTERVAL = 50, IFRAME_TEMPLATE = '<html><head><title>' + (visit1_28_1(visit2_28_2(doc && doc.title) || '')) + ' - {hash}</title>{head}</head><body>{hash}</body></html>', getHash = function() {
  _$jscoverage['/hashchange.js'].functionData[2]++;
  _$jscoverage['/hashchange.js'].lineData[41]++;
  var m = location.href.match(/#.+$/);
  _$jscoverage['/hashchange.js'].lineData[42]++;
  return visit3_42_1(visit4_42_2(m && m[0]) || '#');
}, timer, lastHash, poll = function() {
  _$jscoverage['/hashchange.js'].functionData[3]++;
  _$jscoverage['/hashchange.js'].lineData[51]++;
  var hash = getHash(), replaceHistory = 0;
  _$jscoverage['/hashchange.js'].lineData[54]++;
  if (visit5_54_1(hash.indexOf(REPLACE_HISTORY) !== -1)) {
    _$jscoverage['/hashchange.js'].lineData[55]++;
    replaceHistory = 1;
    _$jscoverage['/hashchange.js'].lineData[56]++;
    hash = hash.replace(REPLACE_HISTORY, '');
    _$jscoverage['/hashchange.js'].lineData[58]++;
    location.hash = hash;
  }
  _$jscoverage['/hashchange.js'].lineData[60]++;
  if (visit6_60_1(hash !== lastHash)) {
    _$jscoverage['/hashchange.js'].lineData[64]++;
    hashChange(hash, replaceHistory);
  }
  _$jscoverage['/hashchange.js'].lineData[66]++;
  timer = setTimeout(poll, POLL_INTERVAL);
}, hashChange = visit7_69_1(ie && visit8_69_2(ie < 8)) ? function(hash, replaceHistory) {
  _$jscoverage['/hashchange.js'].functionData[4]++;
  _$jscoverage['/hashchange.js'].lineData[71]++;
  var html = S.substitute(IFRAME_TEMPLATE, {
  hash: S.escapeHtml(hash), 
  head: Dom.isCustomDomain() ? ('<script>' + 'document.' + 'domain = "' + doc.domain + '";</script>') : ''}), iframeDoc = getIframeDoc(iframe);
  _$jscoverage['/hashchange.js'].lineData[82]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[84]++;
    if (visit9_84_1(replaceHistory)) {
      _$jscoverage['/hashchange.js'].lineData[85]++;
      iframeDoc.open('text/html', 'replace');
    } else {
      _$jscoverage['/hashchange.js'].lineData[88]++;
      iframeDoc.open();
    }
    _$jscoverage['/hashchange.js'].lineData[92]++;
    iframeDoc.write(html);
    _$jscoverage['/hashchange.js'].lineData[93]++;
    iframeDoc.close();
  }  catch (e) {
}
} : function() {
  _$jscoverage['/hashchange.js'].functionData[5]++;
  _$jscoverage['/hashchange.js'].lineData[100]++;
  notifyHashChange();
}, notifyHashChange = function() {
  _$jscoverage['/hashchange.js'].functionData[6]++;
  _$jscoverage['/hashchange.js'].lineData[106]++;
  DomEvent.fireHandler(win, HASH_CHANGE, {
  newURL: location.href, 
  oldURL: urlWithoutHash + lastHash});
  _$jscoverage['/hashchange.js'].lineData[110]++;
  lastHash = getHash();
}, setup = function() {
  _$jscoverage['/hashchange.js'].functionData[7]++;
  _$jscoverage['/hashchange.js'].lineData[113]++;
  if (visit10_113_1(!timer)) {
    _$jscoverage['/hashchange.js'].lineData[114]++;
    poll();
  }
}, tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[8]++;
  _$jscoverage['/hashchange.js'].lineData[118]++;
  if (visit11_118_1(timer)) {
    _$jscoverage['/hashchange.js'].lineData[119]++;
    clearTimeout(timer);
  }
  _$jscoverage['/hashchange.js'].lineData[121]++;
  timer = 0;
}, iframe;
  _$jscoverage['/hashchange.js'].lineData[126]++;
  if (visit12_126_1(ie && visit13_126_2(ie < 8))) {
    _$jscoverage['/hashchange.js'].lineData[133]++;
    setup = function() {
  _$jscoverage['/hashchange.js'].functionData[9]++;
  _$jscoverage['/hashchange.js'].lineData[134]++;
  if (visit14_134_1(!iframe)) {
    _$jscoverage['/hashchange.js'].lineData[135]++;
    var iframeSrc = Dom.getEmptyIframeSrc();
    _$jscoverage['/hashchange.js'].lineData[137]++;
    iframe = Dom.create('<iframe ' + (iframeSrc ? 'src="' + iframeSrc + '"' : '') + ' style="display: none" ' + 'height="0" ' + 'width="0" ' + 'tabindex="-1" ' + 'title="empty"/>');
    _$jscoverage['/hashchange.js'].lineData[147]++;
    Dom.prepend(iframe, doc.documentElement);
    _$jscoverage['/hashchange.js'].lineData[150]++;
    DomEvent.add(iframe, 'load', function() {
  _$jscoverage['/hashchange.js'].functionData[10]++;
  _$jscoverage['/hashchange.js'].lineData[151]++;
  DomEvent.remove(iframe, 'load');
  _$jscoverage['/hashchange.js'].lineData[155]++;
  hashChange(getHash());
  _$jscoverage['/hashchange.js'].lineData[156]++;
  DomEvent.add(iframe, 'load', onIframeLoad);
  _$jscoverage['/hashchange.js'].lineData[157]++;
  poll();
});
    _$jscoverage['/hashchange.js'].lineData[164]++;
    doc.attachEvent('propertychange', function(e) {
  _$jscoverage['/hashchange.js'].functionData[11]++;
  _$jscoverage['/hashchange.js'].lineData[165]++;
  e = visit15_165_1(e || window.event);
  _$jscoverage['/hashchange.js'].lineData[166]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[167]++;
    if (visit16_167_1(e.propertyName === 'title')) {
      _$jscoverage['/hashchange.js'].lineData[168]++;
      getIframeDoc(iframe).title = doc.title + ' - ' + getHash();
    }
  }  catch (e) {
}
});
    _$jscoverage['/hashchange.js'].lineData[181]++;
    var onIframeLoad = function() {
  _$jscoverage['/hashchange.js'].functionData[12]++;
  _$jscoverage['/hashchange.js'].lineData[191]++;
  location.hash = S.trim(getIframeDoc(iframe).body.innerText);
  _$jscoverage['/hashchange.js'].lineData[198]++;
  notifyHashChange();
};
  }
};
    _$jscoverage['/hashchange.js'].lineData[203]++;
    tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[13]++;
  _$jscoverage['/hashchange.js'].lineData[204]++;
  if (visit17_204_1(timer)) {
    _$jscoverage['/hashchange.js'].lineData[205]++;
    clearTimeout(timer);
  }
  _$jscoverage['/hashchange.js'].lineData[207]++;
  timer = 0;
  _$jscoverage['/hashchange.js'].lineData[208]++;
  DomEvent.detach(iframe);
  _$jscoverage['/hashchange.js'].lineData[209]++;
  Dom.remove(iframe);
  _$jscoverage['/hashchange.js'].lineData[210]++;
  iframe = 0;
};
  }
  _$jscoverage['/hashchange.js'].lineData[214]++;
  Special[HASH_CHANGE] = {
  setup: function() {
  _$jscoverage['/hashchange.js'].functionData[14]++;
  _$jscoverage['/hashchange.js'].lineData[216]++;
  if (visit18_216_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[217]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[221]++;
  lastHash = getHash();
  _$jscoverage['/hashchange.js'].lineData[222]++;
  urlWithoutHash = location.href.replace(/#.+/, '');
  _$jscoverage['/hashchange.js'].lineData[224]++;
  setup();
}, 
  tearDown: function() {
  _$jscoverage['/hashchange.js'].functionData[15]++;
  _$jscoverage['/hashchange.js'].lineData[227]++;
  if (visit19_227_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[228]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[230]++;
  tearDown();
}};
});
