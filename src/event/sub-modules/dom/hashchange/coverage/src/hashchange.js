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
  _$jscoverage['/hashchange.js'].lineData[10] = 0;
  _$jscoverage['/hashchange.js'].lineData[20] = 0;
  _$jscoverage['/hashchange.js'].lineData[25] = 0;
  _$jscoverage['/hashchange.js'].lineData[26] = 0;
  _$jscoverage['/hashchange.js'].lineData[29] = 0;
  _$jscoverage['/hashchange.js'].lineData[43] = 0;
  _$jscoverage['/hashchange.js'].lineData[44] = 0;
  _$jscoverage['/hashchange.js'].lineData[53] = 0;
  _$jscoverage['/hashchange.js'].lineData[56] = 0;
  _$jscoverage['/hashchange.js'].lineData[57] = 0;
  _$jscoverage['/hashchange.js'].lineData[58] = 0;
  _$jscoverage['/hashchange.js'].lineData[60] = 0;
  _$jscoverage['/hashchange.js'].lineData[62] = 0;
  _$jscoverage['/hashchange.js'].lineData[66] = 0;
  _$jscoverage['/hashchange.js'].lineData[68] = 0;
  _$jscoverage['/hashchange.js'].lineData[73] = 0;
  _$jscoverage['/hashchange.js'].lineData[84] = 0;
  _$jscoverage['/hashchange.js'].lineData[86] = 0;
  _$jscoverage['/hashchange.js'].lineData[87] = 0;
  _$jscoverage['/hashchange.js'].lineData[90] = 0;
  _$jscoverage['/hashchange.js'].lineData[94] = 0;
  _$jscoverage['/hashchange.js'].lineData[95] = 0;
  _$jscoverage['/hashchange.js'].lineData[102] = 0;
  _$jscoverage['/hashchange.js'].lineData[108] = 0;
  _$jscoverage['/hashchange.js'].lineData[112] = 0;
  _$jscoverage['/hashchange.js'].lineData[115] = 0;
  _$jscoverage['/hashchange.js'].lineData[116] = 0;
  _$jscoverage['/hashchange.js'].lineData[120] = 0;
  _$jscoverage['/hashchange.js'].lineData[121] = 0;
  _$jscoverage['/hashchange.js'].lineData[123] = 0;
  _$jscoverage['/hashchange.js'].lineData[128] = 0;
  _$jscoverage['/hashchange.js'].lineData[135] = 0;
  _$jscoverage['/hashchange.js'].lineData[136] = 0;
  _$jscoverage['/hashchange.js'].lineData[137] = 0;
  _$jscoverage['/hashchange.js'].lineData[139] = 0;
  _$jscoverage['/hashchange.js'].lineData[149] = 0;
  _$jscoverage['/hashchange.js'].lineData[152] = 0;
  _$jscoverage['/hashchange.js'].lineData[153] = 0;
  _$jscoverage['/hashchange.js'].lineData[157] = 0;
  _$jscoverage['/hashchange.js'].lineData[158] = 0;
  _$jscoverage['/hashchange.js'].lineData[159] = 0;
  _$jscoverage['/hashchange.js'].lineData[166] = 0;
  _$jscoverage['/hashchange.js'].lineData[167] = 0;
  _$jscoverage['/hashchange.js'].lineData[168] = 0;
  _$jscoverage['/hashchange.js'].lineData[169] = 0;
  _$jscoverage['/hashchange.js'].lineData[170] = 0;
  _$jscoverage['/hashchange.js'].lineData[183] = 0;
  _$jscoverage['/hashchange.js'].lineData[193] = 0;
  _$jscoverage['/hashchange.js'].lineData[200] = 0;
  _$jscoverage['/hashchange.js'].lineData[205] = 0;
  _$jscoverage['/hashchange.js'].lineData[206] = 0;
  _$jscoverage['/hashchange.js'].lineData[207] = 0;
  _$jscoverage['/hashchange.js'].lineData[209] = 0;
  _$jscoverage['/hashchange.js'].lineData[210] = 0;
  _$jscoverage['/hashchange.js'].lineData[211] = 0;
  _$jscoverage['/hashchange.js'].lineData[212] = 0;
  _$jscoverage['/hashchange.js'].lineData[216] = 0;
  _$jscoverage['/hashchange.js'].lineData[218] = 0;
  _$jscoverage['/hashchange.js'].lineData[219] = 0;
  _$jscoverage['/hashchange.js'].lineData[223] = 0;
  _$jscoverage['/hashchange.js'].lineData[224] = 0;
  _$jscoverage['/hashchange.js'].lineData[226] = 0;
  _$jscoverage['/hashchange.js'].lineData[229] = 0;
  _$jscoverage['/hashchange.js'].lineData[230] = 0;
  _$jscoverage['/hashchange.js'].lineData[232] = 0;
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
  _$jscoverage['/hashchange.js'].branchData['17'] = [];
  _$jscoverage['/hashchange.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['30'] = [];
  _$jscoverage['/hashchange.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['30'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['56'] = [];
  _$jscoverage['/hashchange.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['62'] = [];
  _$jscoverage['/hashchange.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['71'] = [];
  _$jscoverage['/hashchange.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['86'] = [];
  _$jscoverage['/hashchange.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['115'] = [];
  _$jscoverage['/hashchange.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['120'] = [];
  _$jscoverage['/hashchange.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['128'] = [];
  _$jscoverage['/hashchange.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['136'] = [];
  _$jscoverage['/hashchange.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['167'] = [];
  _$jscoverage['/hashchange.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['169'] = [];
  _$jscoverage['/hashchange.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['206'] = [];
  _$jscoverage['/hashchange.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['218'] = [];
  _$jscoverage['/hashchange.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/hashchange.js'].branchData['229'] = [];
  _$jscoverage['/hashchange.js'].branchData['229'][1] = new BranchData();
}
_$jscoverage['/hashchange.js'].branchData['229'][1].init(17, 12, 'this !== win');
function visit18_229_1(result) {
  _$jscoverage['/hashchange.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['218'][1].init(17, 12, 'this !== win');
function visit17_218_1(result) {
  _$jscoverage['/hashchange.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['206'][1].init(17, 5, 'timer');
function visit16_206_1(result) {
  _$jscoverage['/hashchange.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['169'][1].init(29, 26, 'e.propertyName === \'title\'');
function visit15_169_1(result) {
  _$jscoverage['/hashchange.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['167'][1].init(25, 17, 'e || window.event');
function visit14_167_1(result) {
  _$jscoverage['/hashchange.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['136'][1].init(17, 7, '!iframe');
function visit13_136_1(result) {
  _$jscoverage['/hashchange.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['128'][2].init(4017, 6, 'ie < 8');
function visit12_128_2(result) {
  _$jscoverage['/hashchange.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['128'][1].init(4011, 12, 'ie && ie < 8');
function visit11_128_1(result) {
  _$jscoverage['/hashchange.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['120'][1].init(17, 5, 'timer');
function visit10_120_1(result) {
  _$jscoverage['/hashchange.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['115'][1].init(17, 6, '!timer');
function visit9_115_1(result) {
  _$jscoverage['/hashchange.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['86'][1].init(52, 14, 'replaceHistory');
function visit8_86_1(result) {
  _$jscoverage['/hashchange.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['71'][2].init(1432, 6, 'ie < 8');
function visit7_71_2(result) {
  _$jscoverage['/hashchange.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['71'][1].init(1426, 12, 'ie && ie < 8');
function visit6_71_1(result) {
  _$jscoverage['/hashchange.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['62'][1].init(325, 17, 'hash !== lastHash');
function visit5_62_1(result) {
  _$jscoverage['/hashchange.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['56'][1].init(88, 36, 'hash.indexOf(REPLACE_HISTORY) !== -1');
function visit4_56_1(result) {
  _$jscoverage['/hashchange.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['30'][2].init(74, 16, 'doc && doc.title');
function visit3_30_2(result) {
  _$jscoverage['/hashchange.js'].branchData['30'][2].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['30'][1].init(74, 22, 'doc && doc.title || \'\'');
function visit2_30_1(result) {
  _$jscoverage['/hashchange.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].branchData['17'][1].init(231, 16, 'docMode || UA.ie');
function visit1_17_1(result) {
  _$jscoverage['/hashchange.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/hashchange.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/hashchange.js'].functionData[0]++;
  _$jscoverage['/hashchange.js'].lineData[7]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/hashchange.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/hashchange.js'].lineData[9]++;
  var Uri = require('uri');
  _$jscoverage['/hashchange.js'].lineData[10]++;
  var UA = require('ua'), urlWithoutHash, Special = DomEvent.Special, win = S.Env.host, doc = win.document, docMode = UA.ieMode, REPLACE_HISTORY = '__ks_replace_history__', ie = visit1_17_1(docMode || UA.ie), HASH_CHANGE = 'hashchange';
  _$jscoverage['/hashchange.js'].lineData[20]++;
  DomEvent.REPLACE_HISTORY = REPLACE_HISTORY;
  _$jscoverage['/hashchange.js'].lineData[25]++;
  function getIframeDoc(iframe) {
    _$jscoverage['/hashchange.js'].functionData[1]++;
    _$jscoverage['/hashchange.js'].lineData[26]++;
    return iframe.contentWindow.document;
  }
  _$jscoverage['/hashchange.js'].lineData[29]++;
  var POLL_INTERVAL = 50, IFRAME_TEMPLATE = '<html><head><title>' + (visit2_30_1(visit3_30_2(doc && doc.title) || '')) + ' - {hash}</title>{head}</head><body>{hash}</body></html>', getHash = function() {
  _$jscoverage['/hashchange.js'].functionData[2]++;
  _$jscoverage['/hashchange.js'].lineData[43]++;
  var uri = new Uri(location.href);
  _$jscoverage['/hashchange.js'].lineData[44]++;
  return '#' + uri.getFragment();
}, timer, lastHash, poll = function() {
  _$jscoverage['/hashchange.js'].functionData[3]++;
  _$jscoverage['/hashchange.js'].lineData[53]++;
  var hash = getHash(), replaceHistory = 0;
  _$jscoverage['/hashchange.js'].lineData[56]++;
  if (visit4_56_1(hash.indexOf(REPLACE_HISTORY) !== -1)) {
    _$jscoverage['/hashchange.js'].lineData[57]++;
    replaceHistory = 1;
    _$jscoverage['/hashchange.js'].lineData[58]++;
    hash = hash.replace(REPLACE_HISTORY, '');
    _$jscoverage['/hashchange.js'].lineData[60]++;
    location.hash = hash;
  }
  _$jscoverage['/hashchange.js'].lineData[62]++;
  if (visit5_62_1(hash !== lastHash)) {
    _$jscoverage['/hashchange.js'].lineData[66]++;
    hashChange(hash, replaceHistory);
  }
  _$jscoverage['/hashchange.js'].lineData[68]++;
  timer = setTimeout(poll, POLL_INTERVAL);
}, hashChange = visit6_71_1(ie && visit7_71_2(ie < 8)) ? function(hash, replaceHistory) {
  _$jscoverage['/hashchange.js'].functionData[4]++;
  _$jscoverage['/hashchange.js'].lineData[73]++;
  var html = S.substitute(IFRAME_TEMPLATE, {
  hash: S.escapeHtml(hash), 
  head: Dom.isCustomDomain() ? ('<script>' + 'document.' + 'domain = "' + doc.domain + '";</script>') : ''}), iframeDoc = getIframeDoc(iframe);
  _$jscoverage['/hashchange.js'].lineData[84]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[86]++;
    if (visit8_86_1(replaceHistory)) {
      _$jscoverage['/hashchange.js'].lineData[87]++;
      iframeDoc.open('text/html', 'replace');
    } else {
      _$jscoverage['/hashchange.js'].lineData[90]++;
      iframeDoc.open();
    }
    _$jscoverage['/hashchange.js'].lineData[94]++;
    iframeDoc.write(html);
    _$jscoverage['/hashchange.js'].lineData[95]++;
    iframeDoc.close();
  }  catch (e) {
}
} : function() {
  _$jscoverage['/hashchange.js'].functionData[5]++;
  _$jscoverage['/hashchange.js'].lineData[102]++;
  notifyHashChange();
}, notifyHashChange = function() {
  _$jscoverage['/hashchange.js'].functionData[6]++;
  _$jscoverage['/hashchange.js'].lineData[108]++;
  DomEvent.fireHandler(win, HASH_CHANGE, {
  newURL: location.href, 
  oldURL: urlWithoutHash + lastHash});
  _$jscoverage['/hashchange.js'].lineData[112]++;
  lastHash = getHash();
}, setup = function() {
  _$jscoverage['/hashchange.js'].functionData[7]++;
  _$jscoverage['/hashchange.js'].lineData[115]++;
  if (visit9_115_1(!timer)) {
    _$jscoverage['/hashchange.js'].lineData[116]++;
    poll();
  }
}, tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[8]++;
  _$jscoverage['/hashchange.js'].lineData[120]++;
  if (visit10_120_1(timer)) {
    _$jscoverage['/hashchange.js'].lineData[121]++;
    clearTimeout(timer);
  }
  _$jscoverage['/hashchange.js'].lineData[123]++;
  timer = 0;
}, iframe;
  _$jscoverage['/hashchange.js'].lineData[128]++;
  if (visit11_128_1(ie && visit12_128_2(ie < 8))) {
    _$jscoverage['/hashchange.js'].lineData[135]++;
    setup = function() {
  _$jscoverage['/hashchange.js'].functionData[9]++;
  _$jscoverage['/hashchange.js'].lineData[136]++;
  if (visit13_136_1(!iframe)) {
    _$jscoverage['/hashchange.js'].lineData[137]++;
    var iframeSrc = Dom.getEmptyIframeSrc();
    _$jscoverage['/hashchange.js'].lineData[139]++;
    iframe = Dom.create('<iframe ' + (iframeSrc ? 'src="' + iframeSrc + '"' : '') + ' style="display: none" ' + 'height="0" ' + 'width="0" ' + 'tabindex="-1" ' + 'title="empty"/>');
    _$jscoverage['/hashchange.js'].lineData[149]++;
    Dom.prepend(iframe, doc.documentElement);
    _$jscoverage['/hashchange.js'].lineData[152]++;
    DomEvent.add(iframe, 'load', function() {
  _$jscoverage['/hashchange.js'].functionData[10]++;
  _$jscoverage['/hashchange.js'].lineData[153]++;
  DomEvent.remove(iframe, 'load');
  _$jscoverage['/hashchange.js'].lineData[157]++;
  hashChange(getHash());
  _$jscoverage['/hashchange.js'].lineData[158]++;
  DomEvent.add(iframe, 'load', onIframeLoad);
  _$jscoverage['/hashchange.js'].lineData[159]++;
  poll();
});
    _$jscoverage['/hashchange.js'].lineData[166]++;
    doc.attachEvent('propertychange', function(e) {
  _$jscoverage['/hashchange.js'].functionData[11]++;
  _$jscoverage['/hashchange.js'].lineData[167]++;
  e = visit14_167_1(e || window.event);
  _$jscoverage['/hashchange.js'].lineData[168]++;
  try {
    _$jscoverage['/hashchange.js'].lineData[169]++;
    if (visit15_169_1(e.propertyName === 'title')) {
      _$jscoverage['/hashchange.js'].lineData[170]++;
      getIframeDoc(iframe).title = doc.title + ' - ' + getHash();
    }
  }  catch (e) {
}
});
    _$jscoverage['/hashchange.js'].lineData[183]++;
    var onIframeLoad = function() {
  _$jscoverage['/hashchange.js'].functionData[12]++;
  _$jscoverage['/hashchange.js'].lineData[193]++;
  location.hash = S.trim(getIframeDoc(iframe).body.innerText);
  _$jscoverage['/hashchange.js'].lineData[200]++;
  notifyHashChange();
};
  }
};
    _$jscoverage['/hashchange.js'].lineData[205]++;
    tearDown = function() {
  _$jscoverage['/hashchange.js'].functionData[13]++;
  _$jscoverage['/hashchange.js'].lineData[206]++;
  if (visit16_206_1(timer)) {
    _$jscoverage['/hashchange.js'].lineData[207]++;
    clearTimeout(timer);
  }
  _$jscoverage['/hashchange.js'].lineData[209]++;
  timer = 0;
  _$jscoverage['/hashchange.js'].lineData[210]++;
  DomEvent.detach(iframe);
  _$jscoverage['/hashchange.js'].lineData[211]++;
  Dom.remove(iframe);
  _$jscoverage['/hashchange.js'].lineData[212]++;
  iframe = 0;
};
  }
  _$jscoverage['/hashchange.js'].lineData[216]++;
  Special[HASH_CHANGE] = {
  setup: function() {
  _$jscoverage['/hashchange.js'].functionData[14]++;
  _$jscoverage['/hashchange.js'].lineData[218]++;
  if (visit17_218_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[219]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[223]++;
  lastHash = getHash();
  _$jscoverage['/hashchange.js'].lineData[224]++;
  urlWithoutHash = location.href.replace(/#.+/, '');
  _$jscoverage['/hashchange.js'].lineData[226]++;
  setup();
}, 
  tearDown: function() {
  _$jscoverage['/hashchange.js'].functionData[15]++;
  _$jscoverage['/hashchange.js'].lineData[229]++;
  if (visit18_229_1(this !== win)) {
    _$jscoverage['/hashchange.js'].lineData[230]++;
    return;
  }
  _$jscoverage['/hashchange.js'].lineData[232]++;
  tearDown();
}};
});
