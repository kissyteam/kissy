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
  _$jscoverage['/hashchange.js'].lineData[10] = 0;
  _$jscoverage['/hashchange.js'].lineData[19] = 0;
  _$jscoverage['/hashchange.js'].lineData[24] = 0;
  _$jscoverage['/hashchange.js'].lineData[25] = 0;
  _$jscoverage['/hashchange.js'].lineData[28] = 0;
  _$jscoverage['/hashchange.js'].lineData[42] = 0;
  _$jscoverage['/hashchange.js'].lineData[43] = 0;
  _$jscoverage['/hashchange.js'].lineData[52] = 0;
  _$jscoverage['/hashchange.js'].lineData[54] = 0;
  _$jscoverage['/hashchange.js'].lineData[55] = 0;
  _$jscoverage['/hashchange.js'].lineData[57] = 0;
  _$jscoverage['/hashchange.js'].lineData[59] = 0;
  _$jscoverage['/hashchange.js'].lineData[62] = 0;
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
  _$jscoverage['/hashchange.js'].lineData[109] = 0;
  _$jscoverage['/hashchange.js'].lineData[110] = 0;
  _$jscoverage['/hashchange.js'].lineData[114] = 0;
  _$jscoverage['/hashchange.js'].lineData[115] = 0;
  _$jscoverage['/hashchange.js'].lineData[117] = 0;
  _$jscoverage['/hashchange.js'].lineData[122] = 0;
  _$jscoverage['/hashchange.js'].lineData[129] = 0;
  _$jscoverage['/hashchange.js'].lineData[130] = 0;
  _$jscoverage['/hashchange.js'].lineData[131] = 0;
  _$jscoverage['/hashchange.js'].lineData[133] = 0;
  _$jscoverage['/hashchange.js'].lineData[143] = 0;
  _$jscoverage['/hashchange.js'].lineData[146] = 0;
  _$jscoverage['/hashchange.js'].lineData[147] = 0;
  _$jscoverage['/hashchange.js'].lineData[151] = 0;
  _$jscoverage['/hashchange.js'].lineData[152] = 0;
  _$jscoverage['/hashchange.js'].lineData[153] = 0;
  _$jscoverage['/hashchange.js'].lineData[160] = 0;
  _$jscoverage['/hashchange.js'].lineData[161] = 0;
  _$jscoverage['/hashchange.js'].lineData[162] = 0;
  _$jscoverage['/hashchange.js'].lineData[163] = 0;
  _$jscoverage['/hashchange.js'].lineData[176] = 0;
  _$jscoverage['/hashchange.js'].lineData[181] = 0;
  _$jscoverage['/hashchange.js'].lineData[186] = 0;
  _$jscoverage['/hashchange.js'].lineData[188] = 0;
  _$jscoverage['/hashchange.js'].lineData[194] = 0;
  _$jscoverage['/hashchange.js'].lineData[196] = 0;
  _$jscoverage['/hashchange.js'].lineData[201] = 0;
  _$jscoverage['/hashchange.js'].lineData[202] = 0;
  _$jscoverage['/hashchange.js'].lineData[203] = 0;
  _$jscoverage['/hashchange.js'].lineData[205] = 0;
  _$jscoverage['/hashchange.js'].lineData[206] = 0;
  _$jscoverage['/hashchange.js'].lineData[207] = 0;
  _$jscoverage['/hashchange.js'].lineData[208] = 0;
  _$jscoverage['/hashchange.js'].lineData[212] = 0;
  _$jscoverage['/hashchange.js'].lineData[214] = 0;
  _$jscoverage['/hashchange.js'].lineData[215] = 0;
  _$jscoverage['/hashchange.js'].lineData[219] = 0;
  _$jscoverage['/hashchange.js'].lineData[221] = 0;
  _$jscoverage['/hashchange.js'].lineData[224] = 0;
  _$jscoverage['/hashchange.js'].lineData[225] = 0;
  _$jscoverage['/hashchange.js'].lineData[227] = 0;
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
  _$jscoverage['/hashchange.js'].branchData['16'] = [];
  _$jscoverage['/hashchange.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['29'] = [];
  _$jscoverage['/hashchange.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['59'] = [];
  _$jscoverage['/hashchange.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['69'] = [];
  _$jscoverage['/hashchange.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['84'] = [];
  _$jscoverage['/hashchange.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['109'] = [];
  _$jscoverage['/hashchange.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['114'] = [];
  _$jscoverage['/hashchange.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['122'] = [];
  _$jscoverage['/hashchange.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['130'] = [];
  _$jscoverage['/hashchange.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['162'] = [];
  _$jscoverage['/hashchange.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['186'] = [];
  _$jscoverage['/hashchange.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['202'] = [];
  _$jscoverage['/hashchange.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['214'] = [];
  _$jscoverage['/hashchange.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['224'] = [];
  _$jscoverage['/hashchange.js'].branchData['224'][1] = new BranchData();
}
_$jscoverage['/hashchange.js'].branchData['224'][1].init(17, 12, 'this !== win');
function visit17_224_1(result) {
  _$jscoverage['/hashchange.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['214'][1].init(17, 12, 'this !== win');
function visit16_214_1(result) {
  _$jscoverage['/hashchange.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['202'][1].init(16, 5, 'timer');
function visit15_202_1(result) {
  _$jscoverage['/hashchange.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['186'][1].init(416, 8, 'c !== ch');
function visit14_186_1(result) {
  _$jscoverage['/hashchange.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['162'][1].init(29, 30, 'event.propertyName === \'title\'');
function visit13_162_1(result) {
  _$jscoverage['/hashchange.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['130'][1].init(17, 7, '!iframe');
function visit12_130_1(result) {
  _$jscoverage['/hashchange.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['122'][2].init(3821, 6, 'ie < 8');
function visit11_122_2(result) {
  _$jscoverage['/hashchange.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['122'][1].init(3815, 12, 'ie && ie < 8');
function visit10_122_1(result) {
  _$jscoverage['/hashchange.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['114'][1].init(17, 5, 'timer');
function visit9_114_1(result) {
  _$jscoverage['/hashchange.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['109'][1].init(17, 6, '!timer');
function visit8_109_1(result) {
  _$jscoverage['/hashchange.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['84'][1].init(52, 14, 'replaceHistory');
function visit7_84_1(result) {
  _$jscoverage['/hashchange.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['69'][2].init(1432, 6, 'ie < 8');
function visit6_69_2(result) {
  _$jscoverage['/hashchange.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['69'][1].init(1426, 12, 'ie && ie < 8');
function visit5_69_1(result) {
  _$jscoverage['/hashchange.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['59'][1].init(290, 17, 'hash !== lastHash');
function visit4_59_1(result) {
  _$jscoverage['/hashchange.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['29'][2].init(74, 16, 'doc && doc.title');
function visit3_29_2(result) {
  _$jscoverage['/hashchange.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['29'][1].init(74, 22, 'doc && doc.title || \'\'');
function visit2_29_1(result) {
  _$jscoverage['/hashchange.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['16'][1].init(204, 16, 'docMode || UA.ie');
function visit1_16_1(result) {
  _$jscoverage['/hashchange.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/hashchange.js'].functionData[0]++;
  _$jscoverage['/hashchange.js'].lineData[7]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/hashchange.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/hashchange.js'].lineData[10]++;
  var UA = S.UA, Special = DomEvent.Special, win = S.Env.host, doc = win.document, docMode = UA.ieMode, REPLACE_HISTORY = '__replace_history_' + S.now(), ie = visit1_16_1(docMode || UA.ie), HASH_CHANGE = 'hashchange';
  _$jscoverage['/hashchange.js'].lineData[19]++;
  DomEvent.REPLACE_HISTORY = REPLACE_HISTORY;
  _$jscoverage['/hashchange.js'].lineData[24]++;
  function getIframeDoc(iframe) {
    _$jscoverage['/hashchange.js'].functionData[1]++;
    _$jscoverage['/hashchange.js'].lineData[25]++;
    return iframe.contentWindow.document;
  }
  _$jscoverage['/hashchange.js'].lineData[28]++;
  var POLL_INTERVAL = 50, IFRAME_TEMPLATE = '<html><head><title>' + (visit2_29_1(visit3_29_2(doc && doc.title) || '')) + ' - {hash}</title>{head}</head><body>{hash}</body></html>', getHash = function() {
  _$jscoverage['/hashchange.js'].functionData[2]++;
  _$jscoverage['/hashchange.js'].lineData[42]++;
  var uri = new S.Uri(location.href);
  _$jscoverage['/hashchange.js'].lineData[43]++;
  return '#' + uri.getFragment();
}, timer, lastHash, poll = function() {
  _$jscoverage['/hashchange.js'].functionData[3]++;
  _$jscoverage['/hashchange.js'].lineData[52]++;
  var hash = getHash(), replaceHistory;
  _$jscoverage['/hashchange.js'].lineData[54]++;
  if ((replaceHistory = S.endsWith(hash, REPLACE_HISTORY))) {
    _$jscoverage['/hashchange.js'].lineData[55]++;
    hash = hash.slice(0, -REPLACE_HISTORY.length);
    _$jscoverage['/hashchange.js'].lineData[57]++;
    location.hash = hash;
  }
  _$jscoverage['/hashchange.js'].lineData[59]++;
  if (visit4_59_1(hash !== lastHash)) {
    _$jscoverage['/hashchange.js'].lineData[62]++;
    lastHash = hash;
    _$jscoverage['/hashchange.js'].lineData[64]++;
    hashChange(hash, replaceHistory);
  }
  _$jscoverage['/hashchange.js'].lineData[66]++;
  timer = setTimeout(poll, POLL_INTERVAL);
}, hashChange = visit5_69_1(ie && visit6_69_2(ie < 8)) ? function(hash, replaceHistory) {
  _$jscoverage['/hashchange.js'].functionData[4]++;
  _$jscoverage['/hashchange.js'].lineData[71]++;
  var html = S.substitute(IFRAME_TEMPLATE, {
  hash: S.escapeHtml(hash), 
  head: Dom.isCustomDomain() ? ('<script>' + 'document.' + 'domain = "' + doc.domain + '";</script>') : ''}), iframeDoc = getIframeDoc(iframe);
  _$jscoverage['/hashchange.js'].lineData[82]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[84]++;
    if (visit7_84_1(replaceHistory)) {
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
  DomEvent.fireHandler(win, HASH_CHANGE);
}, setup = function() {
  _$jscoverage['/hashchange.js'].functionData[7]++;
  _$jscoverage['/hashchange.js'].lineData[109]++;
  if (visit8_109_1(!timer)) {
    _$jscoverage['/hashchange.js'].lineData[110]++;
    poll();
  }
}, tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[8]++;
  _$jscoverage['/hashchange.js'].lineData[114]++;
  if (visit9_114_1(timer)) {
    _$jscoverage['/hashchange.js'].lineData[115]++;
    clearTimeout(timer);
  }
  _$jscoverage['/hashchange.js'].lineData[117]++;
  timer = 0;
}, iframe;
  _$jscoverage['/hashchange.js'].lineData[122]++;
  if (visit10_122_1(ie && visit11_122_2(ie < 8))) {
    _$jscoverage['/hashchange.js'].lineData[129]++;
    setup = function() {
  _$jscoverage['/hashchange.js'].functionData[9]++;
  _$jscoverage['/hashchange.js'].lineData[130]++;
  if (visit12_130_1(!iframe)) {
    _$jscoverage['/hashchange.js'].lineData[131]++;
    var iframeSrc = Dom.getEmptyIframeSrc();
    _$jscoverage['/hashchange.js'].lineData[133]++;
    iframe = Dom.create('<iframe ' + (iframeSrc ? 'src="' + iframeSrc + '"' : '') + ' style="display: none" ' + 'height="0" ' + 'width="0" ' + 'tabindex="-1" ' + 'title="empty"/>');
    _$jscoverage['/hashchange.js'].lineData[143]++;
    Dom.prepend(iframe, doc.documentElement);
    _$jscoverage['/hashchange.js'].lineData[146]++;
    DomEvent.add(iframe, 'load', function() {
  _$jscoverage['/hashchange.js'].functionData[10]++;
  _$jscoverage['/hashchange.js'].lineData[147]++;
  DomEvent.remove(iframe, 'load');
  _$jscoverage['/hashchange.js'].lineData[151]++;
  hashChange(getHash());
  _$jscoverage['/hashchange.js'].lineData[152]++;
  DomEvent.add(iframe, 'load', onIframeLoad);
  _$jscoverage['/hashchange.js'].lineData[153]++;
  poll();
});
    _$jscoverage['/hashchange.js'].lineData[160]++;
    doc.onpropertychange = function() {
  _$jscoverage['/hashchange.js'].functionData[11]++;
  _$jscoverage['/hashchange.js'].lineData[161]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[162]++;
    if (visit13_162_1(event.propertyName === 'title')) {
      _$jscoverage['/hashchange.js'].lineData[163]++;
      getIframeDoc(iframe).title = doc.title + ' - ' + getHash();
    }
  }  catch (e) {
}
};
    _$jscoverage['/hashchange.js'].lineData[176]++;
    var onIframeLoad = function() {
  _$jscoverage['/hashchange.js'].functionData[12]++;
  _$jscoverage['/hashchange.js'].lineData[181]++;
  var c = S.trim(getIframeDoc(iframe).body.innerText), ch = getHash();
  _$jscoverage['/hashchange.js'].lineData[186]++;
  if (visit14_186_1(c !== ch)) {
    _$jscoverage['/hashchange.js'].lineData[188]++;
    location.hash = c;
    _$jscoverage['/hashchange.js'].lineData[194]++;
    lastHash = c;
  }
  _$jscoverage['/hashchange.js'].lineData[196]++;
  notifyHashChange();
};
  }
};
    _$jscoverage['/hashchange.js'].lineData[201]++;
    tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[13]++;
  _$jscoverage['/hashchange.js'].lineData[202]++;
  if (visit15_202_1(timer)) {
    _$jscoverage['/hashchange.js'].lineData[203]++;
    clearTimeout(timer);
  }
  _$jscoverage['/hashchange.js'].lineData[205]++;
  timer = 0;
  _$jscoverage['/hashchange.js'].lineData[206]++;
  DomEvent.detach(iframe);
  _$jscoverage['/hashchange.js'].lineData[207]++;
  Dom.remove(iframe);
  _$jscoverage['/hashchange.js'].lineData[208]++;
  iframe = 0;
};
  }
  _$jscoverage['/hashchange.js'].lineData[212]++;
  Special[HASH_CHANGE] = {
  setup: function() {
  _$jscoverage['/hashchange.js'].functionData[14]++;
  _$jscoverage['/hashchange.js'].lineData[214]++;
  if (visit16_214_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[215]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[219]++;
  lastHash = getHash();
  _$jscoverage['/hashchange.js'].lineData[221]++;
  setup();
}, 
  tearDown: function() {
  _$jscoverage['/hashchange.js'].functionData[15]++;
  _$jscoverage['/hashchange.js'].lineData[224]++;
  if (visit17_224_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[225]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[227]++;
  tearDown();
}};
});
