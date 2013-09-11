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
  _$jscoverage['/hashchange.js'].lineData[8] = 0;
  _$jscoverage['/hashchange.js'].lineData[17] = 0;
  _$jscoverage['/hashchange.js'].lineData[22] = 0;
  _$jscoverage['/hashchange.js'].lineData[23] = 0;
  _$jscoverage['/hashchange.js'].lineData[26] = 0;
  _$jscoverage['/hashchange.js'].lineData[40] = 0;
  _$jscoverage['/hashchange.js'].lineData[41] = 0;
  _$jscoverage['/hashchange.js'].lineData[50] = 0;
  _$jscoverage['/hashchange.js'].lineData[52] = 0;
  _$jscoverage['/hashchange.js'].lineData[53] = 0;
  _$jscoverage['/hashchange.js'].lineData[55] = 0;
  _$jscoverage['/hashchange.js'].lineData[57] = 0;
  _$jscoverage['/hashchange.js'].lineData[60] = 0;
  _$jscoverage['/hashchange.js'].lineData[62] = 0;
  _$jscoverage['/hashchange.js'].lineData[64] = 0;
  _$jscoverage['/hashchange.js'].lineData[69] = 0;
  _$jscoverage['/hashchange.js'].lineData[81] = 0;
  _$jscoverage['/hashchange.js'].lineData[83] = 0;
  _$jscoverage['/hashchange.js'].lineData[84] = 0;
  _$jscoverage['/hashchange.js'].lineData[87] = 0;
  _$jscoverage['/hashchange.js'].lineData[91] = 0;
  _$jscoverage['/hashchange.js'].lineData[92] = 0;
  _$jscoverage['/hashchange.js'].lineData[99] = 0;
  _$jscoverage['/hashchange.js'].lineData[105] = 0;
  _$jscoverage['/hashchange.js'].lineData[108] = 0;
  _$jscoverage['/hashchange.js'].lineData[109] = 0;
  _$jscoverage['/hashchange.js'].lineData[113] = 0;
  _$jscoverage['/hashchange.js'].lineData[114] = 0;
  _$jscoverage['/hashchange.js'].lineData[119] = 0;
  _$jscoverage['/hashchange.js'].lineData[126] = 0;
  _$jscoverage['/hashchange.js'].lineData[127] = 0;
  _$jscoverage['/hashchange.js'].lineData[128] = 0;
  _$jscoverage['/hashchange.js'].lineData[130] = 0;
  _$jscoverage['/hashchange.js'].lineData[140] = 0;
  _$jscoverage['/hashchange.js'].lineData[143] = 0;
  _$jscoverage['/hashchange.js'].lineData[144] = 0;
  _$jscoverage['/hashchange.js'].lineData[148] = 0;
  _$jscoverage['/hashchange.js'].lineData[149] = 0;
  _$jscoverage['/hashchange.js'].lineData[150] = 0;
  _$jscoverage['/hashchange.js'].lineData[157] = 0;
  _$jscoverage['/hashchange.js'].lineData[158] = 0;
  _$jscoverage['/hashchange.js'].lineData[159] = 0;
  _$jscoverage['/hashchange.js'].lineData[160] = 0;
  _$jscoverage['/hashchange.js'].lineData[173] = 0;
  _$jscoverage['/hashchange.js'].lineData[178] = 0;
  _$jscoverage['/hashchange.js'].lineData[183] = 0;
  _$jscoverage['/hashchange.js'].lineData[185] = 0;
  _$jscoverage['/hashchange.js'].lineData[191] = 0;
  _$jscoverage['/hashchange.js'].lineData[193] = 0;
  _$jscoverage['/hashchange.js'].lineData[198] = 0;
  _$jscoverage['/hashchange.js'].lineData[199] = 0;
  _$jscoverage['/hashchange.js'].lineData[200] = 0;
  _$jscoverage['/hashchange.js'].lineData[201] = 0;
  _$jscoverage['/hashchange.js'].lineData[202] = 0;
  _$jscoverage['/hashchange.js'].lineData[203] = 0;
  _$jscoverage['/hashchange.js'].lineData[207] = 0;
  _$jscoverage['/hashchange.js'].lineData[209] = 0;
  _$jscoverage['/hashchange.js'].lineData[210] = 0;
  _$jscoverage['/hashchange.js'].lineData[214] = 0;
  _$jscoverage['/hashchange.js'].lineData[216] = 0;
  _$jscoverage['/hashchange.js'].lineData[219] = 0;
  _$jscoverage['/hashchange.js'].lineData[220] = 0;
  _$jscoverage['/hashchange.js'].lineData[222] = 0;
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
  _$jscoverage['/hashchange.js'].branchData['12'] = [];
  _$jscoverage['/hashchange.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['14'] = [];
  _$jscoverage['/hashchange.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['27'] = [];
  _$jscoverage['/hashchange.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['52'] = [];
  _$jscoverage['/hashchange.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['57'] = [];
  _$jscoverage['/hashchange.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['67'] = [];
  _$jscoverage['/hashchange.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['83'] = [];
  _$jscoverage['/hashchange.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['108'] = [];
  _$jscoverage['/hashchange.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['113'] = [];
  _$jscoverage['/hashchange.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['119'] = [];
  _$jscoverage['/hashchange.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['127'] = [];
  _$jscoverage['/hashchange.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['159'] = [];
  _$jscoverage['/hashchange.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['183'] = [];
  _$jscoverage['/hashchange.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['199'] = [];
  _$jscoverage['/hashchange.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['209'] = [];
  _$jscoverage['/hashchange.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['219'] = [];
  _$jscoverage['/hashchange.js'].branchData['219'][1] = new BranchData();
}
_$jscoverage['/hashchange.js'].branchData['219'][1].init(18, 12, 'this !== win');
function visit19_219_1(result) {
  _$jscoverage['/hashchange.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['209'][1].init(18, 12, 'this !== win');
function visit18_209_1(result) {
  _$jscoverage['/hashchange.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['199'][1].init(14, 28, 'timer && clearTimeout(timer)');
function visit17_199_1(result) {
  _$jscoverage['/hashchange.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['183'][1].init(426, 7, 'c != ch');
function visit16_183_1(result) {
  _$jscoverage['/hashchange.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['159'][1].init(30, 30, 'event.propertyName === \'title\'');
function visit15_159_1(result) {
  _$jscoverage['/hashchange.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['127'][1].init(18, 7, '!iframe');
function visit14_127_1(result) {
  _$jscoverage['/hashchange.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['119'][2].init(3866, 6, 'ie < 8');
function visit13_119_2(result) {
  _$jscoverage['/hashchange.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['119'][1].init(3860, 12, 'ie && ie < 8');
function visit12_119_1(result) {
  _$jscoverage['/hashchange.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['113'][1].init(14, 28, 'timer && clearTimeout(timer)');
function visit11_113_1(result) {
  _$jscoverage['/hashchange.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['108'][1].init(18, 6, '!timer');
function visit10_108_1(result) {
  _$jscoverage['/hashchange.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['83'][1].init(54, 14, 'replaceHistory');
function visit9_83_1(result) {
  _$jscoverage['/hashchange.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['67'][2].init(1471, 6, 'ie < 8');
function visit8_67_2(result) {
  _$jscoverage['/hashchange.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['67'][1].init(1465, 12, 'ie && ie < 8');
function visit7_67_1(result) {
  _$jscoverage['/hashchange.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['57'][1].init(296, 17, 'hash !== lastHash');
function visit6_57_1(result) {
  _$jscoverage['/hashchange.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['52'][1].init(71, 50, 'replaceHistory = S.endsWith(hash, REPLACE_HISTORY)');
function visit5_52_1(result) {
  _$jscoverage['/hashchange.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['27'][2].init(75, 16, 'doc && doc.title');
function visit4_27_2(result) {
  _$jscoverage['/hashchange.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['27'][1].init(75, 22, 'doc && doc.title || \'\'');
function visit3_27_1(result) {
  _$jscoverage['/hashchange.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['14'][1].init(227, 19, 'docMode || UA[\'ie\']');
function visit2_14_1(result) {
  _$jscoverage['/hashchange.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['12'][1].init(126, 26, 'doc && doc[\'documentMode\']');
function visit1_12_1(result) {
  _$jscoverage['/hashchange.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].lineData[6]++;
KISSY.add('event/dom/hashchange', function(S, DomEvent, Dom) {
  _$jscoverage['/hashchange.js'].functionData[0]++;
  _$jscoverage['/hashchange.js'].lineData[8]++;
  var UA = S.UA, Special = DomEvent.Special, win = S.Env.host, doc = win.document, docMode = visit1_12_1(doc && doc['documentMode']), REPLACE_HISTORY = '__replace_history_' + S.now(), ie = visit2_14_1(docMode || UA['ie']), HASH_CHANGE = 'hashchange';
  _$jscoverage['/hashchange.js'].lineData[17]++;
  DomEvent.REPLACE_HISTORY = REPLACE_HISTORY;
  _$jscoverage['/hashchange.js'].lineData[22]++;
  function getIframeDoc(iframe) {
    _$jscoverage['/hashchange.js'].functionData[1]++;
    _$jscoverage['/hashchange.js'].lineData[23]++;
    return iframe.contentWindow.document;
  }
  _$jscoverage['/hashchange.js'].lineData[26]++;
  var POLL_INTERVAL = 50, IFRAME_TEMPLATE = '<html><head><title>' + (visit3_27_1(visit4_27_2(doc && doc.title) || '')) + ' - {hash}</title>{head}</head><body>{hash}</body></html>', getHash = function() {
  _$jscoverage['/hashchange.js'].functionData[2]++;
  _$jscoverage['/hashchange.js'].lineData[40]++;
  var uri = new S.Uri(location.href);
  _$jscoverage['/hashchange.js'].lineData[41]++;
  return '#' + uri.getFragment();
}, timer, lastHash, poll = function() {
  _$jscoverage['/hashchange.js'].functionData[3]++;
  _$jscoverage['/hashchange.js'].lineData[50]++;
  var hash = getHash(), replaceHistory;
  _$jscoverage['/hashchange.js'].lineData[52]++;
  if (visit5_52_1(replaceHistory = S.endsWith(hash, REPLACE_HISTORY))) {
    _$jscoverage['/hashchange.js'].lineData[53]++;
    hash = hash.slice(0, -REPLACE_HISTORY.length);
    _$jscoverage['/hashchange.js'].lineData[55]++;
    location.hash = hash;
  }
  _$jscoverage['/hashchange.js'].lineData[57]++;
  if (visit6_57_1(hash !== lastHash)) {
    _$jscoverage['/hashchange.js'].lineData[60]++;
    lastHash = hash;
    _$jscoverage['/hashchange.js'].lineData[62]++;
    hashChange(hash, replaceHistory);
  }
  _$jscoverage['/hashchange.js'].lineData[64]++;
  timer = setTimeout(poll, POLL_INTERVAL);
}, hashChange = visit7_67_1(ie && visit8_67_2(ie < 8)) ? function(hash, replaceHistory) {
  _$jscoverage['/hashchange.js'].functionData[4]++;
  _$jscoverage['/hashchange.js'].lineData[69]++;
  var html = S.substitute(IFRAME_TEMPLATE, {
  hash: S.escapeHtml(hash), 
  head: Dom.isCustomDomain() ? ("<script>" + "document." + "domain = '" + doc.domain + "';</script>") : ''}), iframeDoc = getIframeDoc(iframe);
  _$jscoverage['/hashchange.js'].lineData[81]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[83]++;
    if (visit9_83_1(replaceHistory)) {
      _$jscoverage['/hashchange.js'].lineData[84]++;
      iframeDoc.open("text/html", "replace");
    } else {
      _$jscoverage['/hashchange.js'].lineData[87]++;
      iframeDoc.open();
    }
    _$jscoverage['/hashchange.js'].lineData[91]++;
    iframeDoc.write(html);
    _$jscoverage['/hashchange.js'].lineData[92]++;
    iframeDoc.close();
  }  catch (e) {
}
} : function() {
  _$jscoverage['/hashchange.js'].functionData[5]++;
  _$jscoverage['/hashchange.js'].lineData[99]++;
  notifyHashChange();
}, notifyHashChange = function() {
  _$jscoverage['/hashchange.js'].functionData[6]++;
  _$jscoverage['/hashchange.js'].lineData[105]++;
  DomEvent.fireHandler(win, HASH_CHANGE);
}, setup = function() {
  _$jscoverage['/hashchange.js'].functionData[7]++;
  _$jscoverage['/hashchange.js'].lineData[108]++;
  if (visit10_108_1(!timer)) {
    _$jscoverage['/hashchange.js'].lineData[109]++;
    poll();
  }
}, tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[8]++;
  _$jscoverage['/hashchange.js'].lineData[113]++;
  visit11_113_1(timer && clearTimeout(timer));
  _$jscoverage['/hashchange.js'].lineData[114]++;
  timer = 0;
}, iframe;
  _$jscoverage['/hashchange.js'].lineData[119]++;
  if (visit12_119_1(ie && visit13_119_2(ie < 8))) {
    _$jscoverage['/hashchange.js'].lineData[126]++;
    setup = function() {
  _$jscoverage['/hashchange.js'].functionData[9]++;
  _$jscoverage['/hashchange.js'].lineData[127]++;
  if (visit14_127_1(!iframe)) {
    _$jscoverage['/hashchange.js'].lineData[128]++;
    var iframeSrc = Dom.getEmptyIframeSrc();
    _$jscoverage['/hashchange.js'].lineData[130]++;
    iframe = Dom.create('<iframe ' + (iframeSrc ? 'src="' + iframeSrc + '"' : '') + ' style="display: none" ' + 'height="0" ' + 'width="0" ' + 'tabindex="-1" ' + 'title="empty"/>');
    _$jscoverage['/hashchange.js'].lineData[140]++;
    Dom.prepend(iframe, doc.documentElement);
    _$jscoverage['/hashchange.js'].lineData[143]++;
    DomEvent.add(iframe, 'load', function() {
  _$jscoverage['/hashchange.js'].functionData[10]++;
  _$jscoverage['/hashchange.js'].lineData[144]++;
  DomEvent.remove(iframe, 'load');
  _$jscoverage['/hashchange.js'].lineData[148]++;
  hashChange(getHash());
  _$jscoverage['/hashchange.js'].lineData[149]++;
  DomEvent.add(iframe, 'load', onIframeLoad);
  _$jscoverage['/hashchange.js'].lineData[150]++;
  poll();
});
    _$jscoverage['/hashchange.js'].lineData[157]++;
    doc.onpropertychange = function() {
  _$jscoverage['/hashchange.js'].functionData[11]++;
  _$jscoverage['/hashchange.js'].lineData[158]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[159]++;
    if (visit15_159_1(event.propertyName === 'title')) {
      _$jscoverage['/hashchange.js'].lineData[160]++;
      getIframeDoc(iframe).title = doc.title + ' - ' + getHash();
    }
  }  catch (e) {
}
};
    _$jscoverage['/hashchange.js'].lineData[173]++;
    function onIframeLoad() {
      _$jscoverage['/hashchange.js'].functionData[12]++;
      _$jscoverage['/hashchange.js'].lineData[178]++;
      var c = S.trim(getIframeDoc(iframe).body.innerText), ch = getHash();
      _$jscoverage['/hashchange.js'].lineData[183]++;
      if (visit16_183_1(c != ch)) {
        _$jscoverage['/hashchange.js'].lineData[185]++;
        location.hash = c;
        _$jscoverage['/hashchange.js'].lineData[191]++;
        lastHash = c;
      }
      _$jscoverage['/hashchange.js'].lineData[193]++;
      notifyHashChange();
    }  }
};
    _$jscoverage['/hashchange.js'].lineData[198]++;
    tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[13]++;
  _$jscoverage['/hashchange.js'].lineData[199]++;
  visit17_199_1(timer && clearTimeout(timer));
  _$jscoverage['/hashchange.js'].lineData[200]++;
  timer = 0;
  _$jscoverage['/hashchange.js'].lineData[201]++;
  DomEvent.detach(iframe);
  _$jscoverage['/hashchange.js'].lineData[202]++;
  Dom.remove(iframe);
  _$jscoverage['/hashchange.js'].lineData[203]++;
  iframe = 0;
};
  }
  _$jscoverage['/hashchange.js'].lineData[207]++;
  Special[HASH_CHANGE] = {
  setup: function() {
  _$jscoverage['/hashchange.js'].functionData[14]++;
  _$jscoverage['/hashchange.js'].lineData[209]++;
  if (visit18_209_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[210]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[214]++;
  lastHash = getHash();
  _$jscoverage['/hashchange.js'].lineData[216]++;
  setup();
}, 
  tearDown: function() {
  _$jscoverage['/hashchange.js'].functionData[15]++;
  _$jscoverage['/hashchange.js'].lineData[219]++;
  if (visit19_219_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[220]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[222]++;
  tearDown();
}};
}, {
  requires: ['event/dom/base', 'dom']});
