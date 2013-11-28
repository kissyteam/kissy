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
if (! _$jscoverage['/web.js']) {
  _$jscoverage['/web.js'] = {};
  _$jscoverage['/web.js'].lineData = [];
  _$jscoverage['/web.js'].lineData[6] = 0;
  _$jscoverage['/web.js'].lineData[7] = 0;
  _$jscoverage['/web.js'].lineData[8] = 0;
  _$jscoverage['/web.js'].lineData[30] = 0;
  _$jscoverage['/web.js'].lineData[32] = 0;
  _$jscoverage['/web.js'].lineData[35] = 0;
  _$jscoverage['/web.js'].lineData[37] = 0;
  _$jscoverage['/web.js'].lineData[40] = 0;
  _$jscoverage['/web.js'].lineData[46] = 0;
  _$jscoverage['/web.js'].lineData[56] = 0;
  _$jscoverage['/web.js'].lineData[57] = 0;
  _$jscoverage['/web.js'].lineData[59] = 0;
  _$jscoverage['/web.js'].lineData[60] = 0;
  _$jscoverage['/web.js'].lineData[62] = 0;
  _$jscoverage['/web.js'].lineData[63] = 0;
  _$jscoverage['/web.js'].lineData[66] = 0;
  _$jscoverage['/web.js'].lineData[67] = 0;
  _$jscoverage['/web.js'].lineData[68] = 0;
  _$jscoverage['/web.js'].lineData[71] = 0;
  _$jscoverage['/web.js'].lineData[72] = 0;
  _$jscoverage['/web.js'].lineData[73] = 0;
  _$jscoverage['/web.js'].lineData[75] = 0;
  _$jscoverage['/web.js'].lineData[76] = 0;
  _$jscoverage['/web.js'].lineData[78] = 0;
  _$jscoverage['/web.js'].lineData[86] = 0;
  _$jscoverage['/web.js'].lineData[89] = 0;
  _$jscoverage['/web.js'].lineData[91] = 0;
  _$jscoverage['/web.js'].lineData[93] = 0;
  _$jscoverage['/web.js'].lineData[94] = 0;
  _$jscoverage['/web.js'].lineData[107] = 0;
  _$jscoverage['/web.js'].lineData[108] = 0;
  _$jscoverage['/web.js'].lineData[109] = 0;
  _$jscoverage['/web.js'].lineData[111] = 0;
  _$jscoverage['/web.js'].lineData[112] = 0;
  _$jscoverage['/web.js'].lineData[113] = 0;
  _$jscoverage['/web.js'].lineData[117] = 0;
  _$jscoverage['/web.js'].lineData[119] = 0;
  _$jscoverage['/web.js'].lineData[129] = 0;
  _$jscoverage['/web.js'].lineData[130] = 0;
  _$jscoverage['/web.js'].lineData[131] = 0;
  _$jscoverage['/web.js'].lineData[132] = 0;
  _$jscoverage['/web.js'].lineData[133] = 0;
  _$jscoverage['/web.js'].lineData[134] = 0;
  _$jscoverage['/web.js'].lineData[136] = 0;
  _$jscoverage['/web.js'].lineData[137] = 0;
  _$jscoverage['/web.js'].lineData[138] = 0;
  _$jscoverage['/web.js'].lineData[139] = 0;
  _$jscoverage['/web.js'].lineData[145] = 0;
  _$jscoverage['/web.js'].lineData[146] = 0;
  _$jscoverage['/web.js'].lineData[147] = 0;
  _$jscoverage['/web.js'].lineData[150] = 0;
  _$jscoverage['/web.js'].lineData[151] = 0;
  _$jscoverage['/web.js'].lineData[153] = 0;
  _$jscoverage['/web.js'].lineData[154] = 0;
  _$jscoverage['/web.js'].lineData[155] = 0;
  _$jscoverage['/web.js'].lineData[156] = 0;
  _$jscoverage['/web.js'].lineData[158] = 0;
  _$jscoverage['/web.js'].lineData[160] = 0;
  _$jscoverage['/web.js'].lineData[161] = 0;
  _$jscoverage['/web.js'].lineData[168] = 0;
  _$jscoverage['/web.js'].lineData[171] = 0;
  _$jscoverage['/web.js'].lineData[172] = 0;
  _$jscoverage['/web.js'].lineData[173] = 0;
  _$jscoverage['/web.js'].lineData[177] = 0;
  _$jscoverage['/web.js'].lineData[180] = 0;
  _$jscoverage['/web.js'].lineData[181] = 0;
  _$jscoverage['/web.js'].lineData[182] = 0;
  _$jscoverage['/web.js'].lineData[183] = 0;
  _$jscoverage['/web.js'].lineData[186] = 0;
  _$jscoverage['/web.js'].lineData[190] = 0;
  _$jscoverage['/web.js'].lineData[191] = 0;
  _$jscoverage['/web.js'].lineData[192] = 0;
  _$jscoverage['/web.js'].lineData[193] = 0;
  _$jscoverage['/web.js'].lineData[199] = 0;
  _$jscoverage['/web.js'].lineData[203] = 0;
  _$jscoverage['/web.js'].lineData[206] = 0;
  _$jscoverage['/web.js'].lineData[207] = 0;
  _$jscoverage['/web.js'].lineData[209] = 0;
  _$jscoverage['/web.js'].lineData[213] = 0;
  _$jscoverage['/web.js'].lineData[214] = 0;
  _$jscoverage['/web.js'].lineData[215] = 0;
  _$jscoverage['/web.js'].lineData[217] = 0;
  _$jscoverage['/web.js'].lineData[218] = 0;
  _$jscoverage['/web.js'].lineData[220] = 0;
  _$jscoverage['/web.js'].lineData[223] = 0;
  _$jscoverage['/web.js'].lineData[229] = 0;
  _$jscoverage['/web.js'].lineData[230] = 0;
  _$jscoverage['/web.js'].lineData[237] = 0;
  _$jscoverage['/web.js'].lineData[239] = 0;
  _$jscoverage['/web.js'].lineData[240] = 0;
  _$jscoverage['/web.js'].lineData[241] = 0;
}
if (! _$jscoverage['/web.js'].functionData) {
  _$jscoverage['/web.js'].functionData = [];
  _$jscoverage['/web.js'].functionData[0] = 0;
  _$jscoverage['/web.js'].functionData[1] = 0;
  _$jscoverage['/web.js'].functionData[2] = 0;
  _$jscoverage['/web.js'].functionData[3] = 0;
  _$jscoverage['/web.js'].functionData[4] = 0;
  _$jscoverage['/web.js'].functionData[5] = 0;
  _$jscoverage['/web.js'].functionData[6] = 0;
  _$jscoverage['/web.js'].functionData[7] = 0;
  _$jscoverage['/web.js'].functionData[8] = 0;
  _$jscoverage['/web.js'].functionData[9] = 0;
  _$jscoverage['/web.js'].functionData[10] = 0;
  _$jscoverage['/web.js'].functionData[11] = 0;
  _$jscoverage['/web.js'].functionData[12] = 0;
  _$jscoverage['/web.js'].functionData[13] = 0;
  _$jscoverage['/web.js'].functionData[14] = 0;
  _$jscoverage['/web.js'].functionData[15] = 0;
  _$jscoverage['/web.js'].functionData[16] = 0;
  _$jscoverage['/web.js'].functionData[17] = 0;
  _$jscoverage['/web.js'].functionData[18] = 0;
}
if (! _$jscoverage['/web.js'].branchData) {
  _$jscoverage['/web.js'].branchData = {};
  _$jscoverage['/web.js'].branchData['12'] = [];
  _$jscoverage['/web.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['24'] = [];
  _$jscoverage['/web.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['46'] = [];
  _$jscoverage['/web.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['46'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['56'] = [];
  _$jscoverage['/web.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['62'] = [];
  _$jscoverage['/web.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['75'] = [];
  _$jscoverage['/web.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['86'] = [];
  _$jscoverage['/web.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['89'] = [];
  _$jscoverage['/web.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['107'] = [];
  _$jscoverage['/web.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['111'] = [];
  _$jscoverage['/web.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['132'] = [];
  _$jscoverage['/web.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['137'] = [];
  _$jscoverage['/web.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['146'] = [];
  _$jscoverage['/web.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['150'] = [];
  _$jscoverage['/web.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['154'] = [];
  _$jscoverage['/web.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['158'] = [];
  _$jscoverage['/web.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['171'] = [];
  _$jscoverage['/web.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['180'] = [];
  _$jscoverage['/web.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['191'] = [];
  _$jscoverage['/web.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['204'] = [];
  _$jscoverage['/web.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['207'] = [];
  _$jscoverage['/web.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['213'] = [];
  _$jscoverage['/web.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['229'] = [];
  _$jscoverage['/web.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['229'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['239'] = [];
  _$jscoverage['/web.js'].branchData['239'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['239'][1].init(7598, 5, 'UA.ie');
function visit649_239_1(result) {
  _$jscoverage['/web.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['229'][3].init(7317, 24, 'location.search || EMPTY');
function visit648_229_3(result) {
  _$jscoverage['/web.js'].branchData['229'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['229'][2].init(7317, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit647_229_2(result) {
  _$jscoverage['/web.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['229'][1].init(7304, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit646_229_1(result) {
  _$jscoverage['/web.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['213'][1].init(907, 20, 'doScroll && notframe');
function visit645_213_1(result) {
  _$jscoverage['/web.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['207'][1].init(29, 25, 'win.frameElement === null');
function visit644_207_1(result) {
  _$jscoverage['/web.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['204'][1].init(40, 27, 'docElem && docElem.doScroll');
function visit643_204_1(result) {
  _$jscoverage['/web.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['191'][1].init(21, 27, 'doc.readyState === COMPLETE');
function visit642_191_1(result) {
  _$jscoverage['/web.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['180'][1].init(361, 18, 'standardEventModel');
function visit641_180_1(result) {
  _$jscoverage['/web.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['171'][2].init(125, 27, 'doc.readyState === COMPLETE');
function visit640_171_2(result) {
  _$jscoverage['/web.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['171'][1].init(117, 35, '!doc || doc.readyState === COMPLETE');
function visit639_171_1(result) {
  _$jscoverage['/web.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['158'][1].init(23, 12, 'e.stack || e');
function visit638_158_1(result) {
  _$jscoverage['/web.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['154'][1].init(223, 20, 'i < callbacks.length');
function visit637_154_1(result) {
  _$jscoverage['/web.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['150'][1].init(85, 17, 'doc && !UA.nodejs');
function visit636_150_1(result) {
  _$jscoverage['/web.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['146'][1].init(13, 8, 'domReady');
function visit635_146_1(result) {
  _$jscoverage['/web.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['137'][1].init(205, 4, 'node');
function visit634_137_1(result) {
  _$jscoverage['/web.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['132'][1].init(21, 27, '++retryCount > POLL_RETIRES');
function visit633_132_1(result) {
  _$jscoverage['/web.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['111'][1].init(27, 12, 'e.stack || e');
function visit632_111_1(result) {
  _$jscoverage['/web.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['107'][1].init(17, 8, 'domReady');
function visit631_107_1(result) {
  _$jscoverage['/web.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['89'][1].init(232, 13, 'win.exeScript');
function visit630_89_1(result) {
  _$jscoverage['/web.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['86'][1].init(17, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit629_86_1(result) {
  _$jscoverage['/web.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['75'][2].init(711, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit628_75_2(result) {
  _$jscoverage['/web.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['75'][1].init(703, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit627_75_1(result) {
  _$jscoverage['/web.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['62'][1].init(49, 13, 'win.DOMParser');
function visit626_62_1(result) {
  _$jscoverage['/web.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['56'][1].init(46, 20, 'data.documentElement');
function visit625_56_1(result) {
  _$jscoverage['/web.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][3].init(35, 18, 'obj === obj.window');
function visit624_46_3(result) {
  _$jscoverage['/web.js'].branchData['46'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][2].init(20, 11, 'obj != null');
function visit623_46_2(result) {
  _$jscoverage['/web.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][1].init(20, 33, 'obj != null && obj === obj.window');
function visit622_46_1(result) {
  _$jscoverage['/web.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['24'][1].init(464, 27, 'doc && doc.addEventListener');
function visit621_24_1(result) {
  _$jscoverage['/web.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['12'][1].init(87, 26, 'doc && doc.documentElement');
function visit620_12_1(result) {
  _$jscoverage['/web.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[7]++;
  var logger = S.getLogger('s/web');
  _$jscoverage['/web.js'].lineData[8]++;
  var win = S.Env.host, UA = S.UA, doc = win.document, docElem = visit620_12_1(doc && doc.documentElement), location = win.location, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit621_24_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[1]++;
  _$jscoverage['/web.js'].lineData[30]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[2]++;
  _$jscoverage['/web.js'].lineData[32]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[3]++;
  _$jscoverage['/web.js'].lineData[35]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[4]++;
  _$jscoverage['/web.js'].lineData[37]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/web.js'].lineData[40]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/web.js'].functionData[5]++;
  _$jscoverage['/web.js'].lineData[46]++;
  return visit622_46_1(visit623_46_2(obj != null) && visit624_46_3(obj === obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[56]++;
  if (visit625_56_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[57]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[59]++;
  var xml;
  _$jscoverage['/web.js'].lineData[60]++;
  try {
    _$jscoverage['/web.js'].lineData[62]++;
    if (visit626_62_1(win.DOMParser)) {
      _$jscoverage['/web.js'].lineData[63]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[66]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[67]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[68]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[71]++;
  logger.error('parseXML error :');
  _$jscoverage['/web.js'].lineData[72]++;
  logger.error(e);
  _$jscoverage['/web.js'].lineData[73]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[75]++;
  if (visit627_75_1(!xml || visit628_75_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[76]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[78]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[86]++;
  if (visit629_86_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[89]++;
    if (visit630_89_1(win.exeScript)) {
      _$jscoverage['/web.js'].lineData[91]++;
      win.execScript(data);
    } else {
      _$jscoverage['/web.js'].lineData[93]++;
      (function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[94]++;
  win.eval.call(win, data);
})(data);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[107]++;
  if (visit631_107_1(domReady)) {
    _$jscoverage['/web.js'].lineData[108]++;
    try {
      _$jscoverage['/web.js'].lineData[109]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/web.js'].lineData[111]++;
  S.log(visit632_111_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[112]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[113]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/web.js'].lineData[117]++;
    callbacks.push(fn);
  }
  _$jscoverage['/web.js'].lineData[119]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[129]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[130]++;
  var retryCount = 1;
  _$jscoverage['/web.js'].lineData[131]++;
  var timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[12]++;
  _$jscoverage['/web.js'].lineData[132]++;
  if (visit633_132_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/web.js'].lineData[133]++;
    timer.cancel();
    _$jscoverage['/web.js'].lineData[134]++;
    return;
  }
  _$jscoverage['/web.js'].lineData[136]++;
  var node = doc.getElementById(id);
  _$jscoverage['/web.js'].lineData[137]++;
  if (visit634_137_1(node)) {
    _$jscoverage['/web.js'].lineData[138]++;
    fn(node);
    _$jscoverage['/web.js'].lineData[139]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[145]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[146]++;
    if (visit635_146_1(domReady)) {
      _$jscoverage['/web.js'].lineData[147]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[150]++;
    if (visit636_150_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[151]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[153]++;
    domReady = 1;
    _$jscoverage['/web.js'].lineData[154]++;
    for (var i = 0; visit637_154_1(i < callbacks.length); i++) {
      _$jscoverage['/web.js'].lineData[155]++;
      try {
        _$jscoverage['/web.js'].lineData[156]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[158]++;
  S.log(visit638_158_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[160]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[161]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/web.js'].lineData[168]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[15]++;
    _$jscoverage['/web.js'].lineData[171]++;
    if (visit639_171_1(!doc || visit640_171_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[172]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[173]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[177]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[180]++;
    if (visit641_180_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[181]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[182]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[183]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[186]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[190]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[17]++;
  _$jscoverage['/web.js'].lineData[191]++;
  if (visit642_191_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[192]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[193]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[199]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[203]++;
      var notframe, doScroll = visit643_204_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[206]++;
      try {
        _$jscoverage['/web.js'].lineData[207]++;
        notframe = (visit644_207_1(win.frameElement === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[209]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[213]++;
      if (visit645_213_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[214]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[18]++;
  _$jscoverage['/web.js'].lineData[215]++;
  try {
    _$jscoverage['/web.js'].lineData[217]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[218]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[220]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[223]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[229]++;
  if (visit646_229_1(location && visit647_229_2((visit648_229_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[230]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[237]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[239]++;
  if (visit649_239_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[240]++;
    try {
      _$jscoverage['/web.js'].lineData[241]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
