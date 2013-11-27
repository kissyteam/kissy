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
  _$jscoverage['/web.js'].lineData[65] = 0;
  _$jscoverage['/web.js'].lineData[66] = 0;
  _$jscoverage['/web.js'].lineData[67] = 0;
  _$jscoverage['/web.js'].lineData[70] = 0;
  _$jscoverage['/web.js'].lineData[71] = 0;
  _$jscoverage['/web.js'].lineData[72] = 0;
  _$jscoverage['/web.js'].lineData[74] = 0;
  _$jscoverage['/web.js'].lineData[75] = 0;
  _$jscoverage['/web.js'].lineData[77] = 0;
  _$jscoverage['/web.js'].lineData[85] = 0;
  _$jscoverage['/web.js'].lineData[88] = 0;
  _$jscoverage['/web.js'].lineData[89] = 0;
  _$jscoverage['/web.js'].lineData[101] = 0;
  _$jscoverage['/web.js'].lineData[102] = 0;
  _$jscoverage['/web.js'].lineData[103] = 0;
  _$jscoverage['/web.js'].lineData[105] = 0;
  _$jscoverage['/web.js'].lineData[106] = 0;
  _$jscoverage['/web.js'].lineData[107] = 0;
  _$jscoverage['/web.js'].lineData[111] = 0;
  _$jscoverage['/web.js'].lineData[113] = 0;
  _$jscoverage['/web.js'].lineData[123] = 0;
  _$jscoverage['/web.js'].lineData[124] = 0;
  _$jscoverage['/web.js'].lineData[125] = 0;
  _$jscoverage['/web.js'].lineData[126] = 0;
  _$jscoverage['/web.js'].lineData[127] = 0;
  _$jscoverage['/web.js'].lineData[128] = 0;
  _$jscoverage['/web.js'].lineData[130] = 0;
  _$jscoverage['/web.js'].lineData[131] = 0;
  _$jscoverage['/web.js'].lineData[132] = 0;
  _$jscoverage['/web.js'].lineData[133] = 0;
  _$jscoverage['/web.js'].lineData[139] = 0;
  _$jscoverage['/web.js'].lineData[140] = 0;
  _$jscoverage['/web.js'].lineData[141] = 0;
  _$jscoverage['/web.js'].lineData[144] = 0;
  _$jscoverage['/web.js'].lineData[145] = 0;
  _$jscoverage['/web.js'].lineData[147] = 0;
  _$jscoverage['/web.js'].lineData[148] = 0;
  _$jscoverage['/web.js'].lineData[149] = 0;
  _$jscoverage['/web.js'].lineData[150] = 0;
  _$jscoverage['/web.js'].lineData[152] = 0;
  _$jscoverage['/web.js'].lineData[153] = 0;
  _$jscoverage['/web.js'].lineData[154] = 0;
  _$jscoverage['/web.js'].lineData[161] = 0;
  _$jscoverage['/web.js'].lineData[164] = 0;
  _$jscoverage['/web.js'].lineData[165] = 0;
  _$jscoverage['/web.js'].lineData[166] = 0;
  _$jscoverage['/web.js'].lineData[170] = 0;
  _$jscoverage['/web.js'].lineData[173] = 0;
  _$jscoverage['/web.js'].lineData[174] = 0;
  _$jscoverage['/web.js'].lineData[175] = 0;
  _$jscoverage['/web.js'].lineData[176] = 0;
  _$jscoverage['/web.js'].lineData[179] = 0;
  _$jscoverage['/web.js'].lineData[183] = 0;
  _$jscoverage['/web.js'].lineData[184] = 0;
  _$jscoverage['/web.js'].lineData[185] = 0;
  _$jscoverage['/web.js'].lineData[186] = 0;
  _$jscoverage['/web.js'].lineData[192] = 0;
  _$jscoverage['/web.js'].lineData[196] = 0;
  _$jscoverage['/web.js'].lineData[199] = 0;
  _$jscoverage['/web.js'].lineData[200] = 0;
  _$jscoverage['/web.js'].lineData[202] = 0;
  _$jscoverage['/web.js'].lineData[206] = 0;
  _$jscoverage['/web.js'].lineData[207] = 0;
  _$jscoverage['/web.js'].lineData[208] = 0;
  _$jscoverage['/web.js'].lineData[210] = 0;
  _$jscoverage['/web.js'].lineData[211] = 0;
  _$jscoverage['/web.js'].lineData[213] = 0;
  _$jscoverage['/web.js'].lineData[216] = 0;
  _$jscoverage['/web.js'].lineData[222] = 0;
  _$jscoverage['/web.js'].lineData[223] = 0;
  _$jscoverage['/web.js'].lineData[230] = 0;
  _$jscoverage['/web.js'].lineData[232] = 0;
  _$jscoverage['/web.js'].lineData[233] = 0;
  _$jscoverage['/web.js'].lineData[234] = 0;
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
  _$jscoverage['/web.js'].branchData['74'] = [];
  _$jscoverage['/web.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['85'] = [];
  _$jscoverage['/web.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['88'] = [];
  _$jscoverage['/web.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['101'] = [];
  _$jscoverage['/web.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['105'] = [];
  _$jscoverage['/web.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['126'] = [];
  _$jscoverage['/web.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['131'] = [];
  _$jscoverage['/web.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['140'] = [];
  _$jscoverage['/web.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['144'] = [];
  _$jscoverage['/web.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['148'] = [];
  _$jscoverage['/web.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['152'] = [];
  _$jscoverage['/web.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['164'] = [];
  _$jscoverage['/web.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['164'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['173'] = [];
  _$jscoverage['/web.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['184'] = [];
  _$jscoverage['/web.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['197'] = [];
  _$jscoverage['/web.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['200'] = [];
  _$jscoverage['/web.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['206'] = [];
  _$jscoverage['/web.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['222'] = [];
  _$jscoverage['/web.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['222'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['232'] = [];
  _$jscoverage['/web.js'].branchData['232'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['232'][1].init(7371, 5, 'UA.ie');
function visit665_232_1(result) {
  _$jscoverage['/web.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['222'][3].init(7090, 24, 'location.search || EMPTY');
function visit664_222_3(result) {
  _$jscoverage['/web.js'].branchData['222'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['222'][2].init(7090, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit663_222_2(result) {
  _$jscoverage['/web.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['222'][1].init(7077, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit662_222_1(result) {
  _$jscoverage['/web.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['206'][1].init(910, 20, 'doScroll && notframe');
function visit661_206_1(result) {
  _$jscoverage['/web.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['200'][1].init(29, 28, 'win[\'frameElement\'] === null');
function visit660_200_1(result) {
  _$jscoverage['/web.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['197'][1].init(40, 27, 'docElem && docElem.doScroll');
function visit659_197_1(result) {
  _$jscoverage['/web.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['184'][1].init(21, 27, 'doc.readyState === COMPLETE');
function visit658_184_1(result) {
  _$jscoverage['/web.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['173'][1].init(361, 18, 'standardEventModel');
function visit657_173_1(result) {
  _$jscoverage['/web.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['164'][2].init(125, 27, 'doc.readyState === COMPLETE');
function visit656_164_2(result) {
  _$jscoverage['/web.js'].branchData['164'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['164'][1].init(117, 35, '!doc || doc.readyState === COMPLETE');
function visit655_164_1(result) {
  _$jscoverage['/web.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['152'][1].init(23, 12, 'e.stack || e');
function visit654_152_1(result) {
  _$jscoverage['/web.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['148'][1].init(223, 20, 'i < callbacks.length');
function visit653_148_1(result) {
  _$jscoverage['/web.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['144'][1].init(85, 17, 'doc && !UA.nodejs');
function visit652_144_1(result) {
  _$jscoverage['/web.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['140'][1].init(13, 8, 'domReady');
function visit651_140_1(result) {
  _$jscoverage['/web.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['131'][1].init(205, 4, 'node');
function visit650_131_1(result) {
  _$jscoverage['/web.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['126'][1].init(21, 27, '++retryCount > POLL_RETIRES');
function visit649_126_1(result) {
  _$jscoverage['/web.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['105'][1].init(27, 12, 'e.stack || e');
function visit648_105_1(result) {
  _$jscoverage['/web.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['101'][1].init(17, 8, 'domReady');
function visit647_101_1(result) {
  _$jscoverage['/web.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['88'][1].init(-1, 104, 'win.execScript || function(data) {\n  win[\'eval\'].call(win, data);\n}');
function visit646_88_1(result) {
  _$jscoverage['/web.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['85'][1].init(17, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit645_85_1(result) {
  _$jscoverage['/web.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['74'][2].init(669, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit644_74_2(result) {
  _$jscoverage['/web.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['74'][1].init(661, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit643_74_1(result) {
  _$jscoverage['/web.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['62'][1].init(49, 16, 'win[\'DOMParser\']');
function visit642_62_1(result) {
  _$jscoverage['/web.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['56'][1].init(46, 20, 'data.documentElement');
function visit641_56_1(result) {
  _$jscoverage['/web.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][3].init(35, 17, 'obj == obj.window');
function visit640_46_3(result) {
  _$jscoverage['/web.js'].branchData['46'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][2].init(20, 11, 'obj != null');
function visit639_46_2(result) {
  _$jscoverage['/web.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['46'][1].init(20, 32, 'obj != null && obj == obj.window');
function visit638_46_1(result) {
  _$jscoverage['/web.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['24'][1].init(467, 27, 'doc && doc.addEventListener');
function visit637_24_1(result) {
  _$jscoverage['/web.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['12'][1].init(90, 26, 'doc && doc.documentElement');
function visit636_12_1(result) {
  _$jscoverage['/web.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[7]++;
  var logger = S.getLogger('s/web');
  _$jscoverage['/web.js'].lineData[8]++;
  var win = S.Env.host, UA = S.UA, doc = win['document'], docElem = visit636_12_1(doc && doc.documentElement), location = win.location, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit637_24_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
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
  return visit638_46_1(visit639_46_2(obj != null) && visit640_46_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[56]++;
  if (visit641_56_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[57]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[59]++;
  var xml;
  _$jscoverage['/web.js'].lineData[60]++;
  try {
    _$jscoverage['/web.js'].lineData[62]++;
    if (visit642_62_1(win['DOMParser'])) {
      _$jscoverage['/web.js'].lineData[63]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[65]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[66]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[67]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[70]++;
  logger.error('parseXML error :');
  _$jscoverage['/web.js'].lineData[71]++;
  logger.error(e);
  _$jscoverage['/web.js'].lineData[72]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[74]++;
  if (visit643_74_1(!xml || visit644_74_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[75]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[77]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[85]++;
  if (visit645_85_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[88]++;
    (visit646_88_1(win.execScript || function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[89]++;
  win['eval'].call(win, data);
}))(data);
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[101]++;
  if (visit647_101_1(domReady)) {
    _$jscoverage['/web.js'].lineData[102]++;
    try {
      _$jscoverage['/web.js'].lineData[103]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/web.js'].lineData[105]++;
  S.log(visit648_105_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[106]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[107]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/web.js'].lineData[111]++;
    callbacks.push(fn);
  }
  _$jscoverage['/web.js'].lineData[113]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[123]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[124]++;
  var retryCount = 1;
  _$jscoverage['/web.js'].lineData[125]++;
  var timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[12]++;
  _$jscoverage['/web.js'].lineData[126]++;
  if (visit649_126_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/web.js'].lineData[127]++;
    timer.cancel();
    _$jscoverage['/web.js'].lineData[128]++;
    return;
  }
  _$jscoverage['/web.js'].lineData[130]++;
  var node = doc.getElementById(id);
  _$jscoverage['/web.js'].lineData[131]++;
  if (visit650_131_1(node)) {
    _$jscoverage['/web.js'].lineData[132]++;
    fn(node);
    _$jscoverage['/web.js'].lineData[133]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[139]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[140]++;
    if (visit651_140_1(domReady)) {
      _$jscoverage['/web.js'].lineData[141]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[144]++;
    if (visit652_144_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[145]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[147]++;
    domReady = 1;
    _$jscoverage['/web.js'].lineData[148]++;
    for (var i = 0; visit653_148_1(i < callbacks.length); i++) {
      _$jscoverage['/web.js'].lineData[149]++;
      try {
        _$jscoverage['/web.js'].lineData[150]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[152]++;
  S.log(visit654_152_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[153]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[154]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/web.js'].lineData[161]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[15]++;
    _$jscoverage['/web.js'].lineData[164]++;
    if (visit655_164_1(!doc || visit656_164_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[165]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[166]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[170]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[173]++;
    if (visit657_173_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[174]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[175]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[176]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[179]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[183]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[17]++;
  _$jscoverage['/web.js'].lineData[184]++;
  if (visit658_184_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[185]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[186]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[192]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[196]++;
      var notframe, doScroll = visit659_197_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[199]++;
      try {
        _$jscoverage['/web.js'].lineData[200]++;
        notframe = (visit660_200_1(win['frameElement'] === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[202]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[206]++;
      if (visit661_206_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[207]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[18]++;
  _$jscoverage['/web.js'].lineData[208]++;
  try {
    _$jscoverage['/web.js'].lineData[210]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[211]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[213]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[216]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[222]++;
  if (visit662_222_1(location && visit663_222_2((visit664_222_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[223]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[230]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[232]++;
  if (visit665_232_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[233]++;
    try {
      _$jscoverage['/web.js'].lineData[234]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
