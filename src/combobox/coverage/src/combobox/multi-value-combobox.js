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
if (! _$jscoverage['/combobox/multi-value-combobox.js']) {
  _$jscoverage['/combobox/multi-value-combobox.js'] = {};
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[6] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[7] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[10] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[11] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[13] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[14] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[17] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[18] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[19] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[28] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[31] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[33] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[34] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[35] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[36] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[42] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[51] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[52] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[53] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[56] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[60] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[61] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[64] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[69] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[81] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[82] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[83] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[85] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[88] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[89] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[91] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[92] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[93] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[95] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[99] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[101] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[103] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[104] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[108] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[111] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[114] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[115] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[174] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[175] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[190] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[191] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[192] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[193] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[194] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[197] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[198] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[199] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[201] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[203] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[208] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[209] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[210] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[212] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[213] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[214] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[215] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[216] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[217] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[218] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[220] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[222] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[223] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[225] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[226] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[229] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[233] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[234] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[238] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[239] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[242] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[245] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[246] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[248] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[250] = 0;
}
if (! _$jscoverage['/combobox/multi-value-combobox.js'].functionData) {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[0] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[1] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[2] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[3] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[4] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[5] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[6] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[7] = 0;
}
if (! _$jscoverage['/combobox/multi-value-combobox.js'].branchData) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData = {};
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['14'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['18'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['33'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['51'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['60'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['60'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['78'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['83'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['91'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['184'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['190'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['193'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['197'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['201'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['209'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['215'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['222'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['233'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['238'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['242'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['245'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['245'][2] = new BranchData();
}
_$jscoverage['/combobox/multi-value-combobox.js'].branchData['245'][2].init(55, 24, 'separatorType === SUFFIX');
function visit106_245_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['245'][1].init(55, 57, 'separatorType === SUFFIX && strContainsChar(separator, c)');
function visit105_245_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['242'][1].init(2073, 17, 'tokenIndex === -1');
function visit104_242_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['238'][1].init(2003, 14, '!tokens.length');
function visit103_238_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['233'][1].init(1906, 12, 'cache.length');
function visit102_233_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['222'][1].init(25, 12, 'cache.length');
function visit101_222_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'][1].init(60, 12, 'cache.length');
function visit100_217_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['215'][1].init(21, 24, 'separatorType === SUFFIX');
function visit99_215_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'][1].init(758, 29, 'strContainsChar(separator, c)');
function visit98_214_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['209'][1].init(21, 12, 'cache.length');
function visit97_209_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'][1].init(513, 55, 'allowWhitespaceAsStandaloneToken && rWhitespace.test(c)');
function visit96_208_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['201'][1].init(293, 20, 'i === cursorPosition');
function visit95_201_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['197'][1].init(193, 9, 'inLiteral');
function visit94_197_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['193'][1].init(21, 13, 'c === literal');
function visit93_193_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1].init(53, 7, 'literal');
function visit92_192_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['190'][1].init(545, 19, 'i < inputVal.length');
function visit91_190_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['184'][1].init(370, 24, 'separatorType !== SUFFIX');
function visit90_184_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'][1].init(287, 22, 'separator.length === 1');
function visit89_93_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['91'][1].init(145, 43, 'strContainsChar(separator, token.charAt(l))');
function visit88_91_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['83'][2].init(102, 50, 'nextToken && rWhitespace.test(nextToken.charAt(0))');
function visit87_83_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['83'][1].init(91, 62, 'value && !(nextToken && rWhitespace.test(nextToken.charAt(0)))');
function visit86_83_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'][1].init(556, 24, 'separatorType !== SUFFIX');
function visit85_81_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['78'][1].init(439, 28, 'tokens[tokenIndex + 1] || \'\'');
function visit84_78_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['60'][2].init(743, 24, 'separatorType === SUFFIX');
function visit83_60_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['60'][1].init(743, 71, 'separatorType === SUFFIX && strContainsChar(separator, token.charAt(l))');
function visit82_60_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'][1].init(25, 43, 'strContainsChar(separator, token.charAt(0))');
function visit81_52_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['51'][1].init(418, 24, 'separatorType !== SUFFIX');
function visit80_51_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['33'][1].init(80, 27, 'self.get(\'alignWithCursor\')');
function visit79_33_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['18'][2].init(25, 29, 'e.target === this.get(\'menu\')');
function visit78_18_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['18'][1].init(13, 41, 'e.newVal && e.target === this.get(\'menu\')');
function visit77_18_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['14'][2].init(21, 21, 'str.indexOf(c) !== -1');
function visit76_14_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['14'][1].init(16, 26, 'c && str.indexOf(c) !== -1');
function visit75_14_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[0]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[7]++;
  var SUFFIX = 'suffix', rWhitespace = /\s|\xa0/;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[10]++;
  var getCursor = require('./cursor');
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[11]++;
  var ComboBox = require('./control');
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[13]++;
  function strContainsChar(str, c) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[1]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[14]++;
    return visit75_14_1(c && visit76_14_2(str.indexOf(c) !== -1));
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[17]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[2]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[18]++;
    if (visit77_18_1(e.newVal && visit78_18_2(e.target === this.get('menu')))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[19]++;
      this.alignWithCursor();
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[28]++;
  return ComboBox.extend({
  syncUI: function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[3]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[31]++;
  var self = this, menu;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[33]++;
  if (visit79_33_1(self.get('alignWithCursor'))) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[34]++;
    menu = self.get('menu');
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[35]++;
    menu.setInternal('align', null);
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[36]++;
    menu.on('beforeVisibleChange', beforeVisibleChange, this);
  }
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[4]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[42]++;
  var self = this, inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex, separator = self.get('separator'), separatorType = self.get('separatorType'), token = tokens[tokenIndex], l = token.length - 1;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[51]++;
  if (visit80_51_1(separatorType !== SUFFIX)) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[52]++;
    if (visit81_52_1(strContainsChar(separator, token.charAt(0)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[53]++;
      token = token.slice(1);
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[56]++;
      return undefined;
    }
  } else {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[60]++;
    if (visit82_60_1(visit83_60_2(separatorType === SUFFIX) && strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[61]++;
      token = token.slice(0, l);
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[64]++;
  return token;
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[5]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[69]++;
  var self = this, input = self.get('input'), inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = Math.max(0, inputDesc.tokenIndex), separator = self.get('separator'), cursorPosition, l, separatorType = self.get('separatorType'), nextToken = visit84_78_1(tokens[tokenIndex + 1] || ''), token = tokens[tokenIndex];
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[81]++;
  if (visit85_81_1(separatorType !== SUFFIX)) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[82]++;
    tokens[tokenIndex] = token.charAt(0) + value;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[83]++;
    if (visit86_83_1(value && !(visit87_83_2(nextToken && rWhitespace.test(nextToken.charAt(0)))))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[85]++;
      tokens[tokenIndex] += ' ';
    }
  } else {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[88]++;
    tokens[tokenIndex] = value;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[89]++;
    l = token.length - 1;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[91]++;
    if (visit88_91_1(strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[92]++;
      tokens[tokenIndex] += token.charAt(l);
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[93]++;
      if (visit89_93_1(separator.length === 1)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[95]++;
        tokens[tokenIndex] += separator;
      }
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[99]++;
  cursorPosition = tokens.slice(0, tokenIndex + 1).join('').length;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[101]++;
  self.set('value', tokens.join(''), setCfg);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[103]++;
  input.prop('selectionStart', cursorPosition);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[104]++;
  input.prop('selectionEnd', cursorPosition);
}, 
  'alignWithCursor': function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[6]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[108]++;
  var self = this;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[111]++;
  var menu = self.get('menu'), cursorOffset, input = self.get('input');
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[114]++;
  cursorOffset = getCursor(input);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[115]++;
  menu.move(cursorOffset.left, cursorOffset.top);
}}, {
  ATTRS: {
  separator: {
  value: ',;'}, 
  separatorType: {
  value: SUFFIX}, 
  literal: {
  value: '"'}, 
  alignWithCursor: {}}, 
  xclass: 'multi-value-combobox'});
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[174]++;
  function getInputDesc(self) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[7]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[175]++;
    var input = self.get('input'), inputVal = self.get('value'), tokens = [], cache = [], literal = self.get('literal'), separator = self.get('separator'), separatorType = self.get('separatorType'), inLiteral = false, allowWhitespaceAsStandaloneToken = visit90_184_1(separatorType !== SUFFIX), cursorPosition = input.prop('selectionStart'), i, c, tokenIndex = -1;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[190]++;
    for (i = 0; visit91_190_1(i < inputVal.length); i++) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[191]++;
      c = inputVal.charAt(i);
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[192]++;
      if (visit92_192_1(literal)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[193]++;
        if (visit93_193_1(c === literal)) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[194]++;
          inLiteral = !inLiteral;
        }
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[197]++;
      if (visit94_197_1(inLiteral)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[198]++;
        cache.push(c);
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[199]++;
        continue;
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[201]++;
      if (visit95_201_1(i === cursorPosition)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[203]++;
        tokenIndex = tokens.length;
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[208]++;
      if (visit96_208_1(allowWhitespaceAsStandaloneToken && rWhitespace.test(c))) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[209]++;
        if (visit97_209_1(cache.length)) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[210]++;
          tokens.push(cache.join(''));
        }
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[212]++;
        cache = [];
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[213]++;
        cache.push(c);
      } else {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[214]++;
        if (visit98_214_1(strContainsChar(separator, c))) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[215]++;
          if (visit99_215_1(separatorType === SUFFIX)) {
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[216]++;
            cache.push(c);
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[217]++;
            if (visit100_217_1(cache.length)) {
              _$jscoverage['/combobox/multi-value-combobox.js'].lineData[218]++;
              tokens.push(cache.join(''));
            }
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[220]++;
            cache = [];
          } else {
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[222]++;
            if (visit101_222_1(cache.length)) {
              _$jscoverage['/combobox/multi-value-combobox.js'].lineData[223]++;
              tokens.push(cache.join(''));
            }
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[225]++;
            cache = [];
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[226]++;
            cache.push(c);
          }
        } else {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[229]++;
          cache.push(c);
        }
      }
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[233]++;
    if (visit102_233_1(cache.length)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[234]++;
      tokens.push(cache.join(''));
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[238]++;
    if (visit103_238_1(!tokens.length)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[239]++;
      tokens.push('');
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[242]++;
    if (visit104_242_1(tokenIndex === -1)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[245]++;
      if (visit105_245_1(visit106_245_2(separatorType === SUFFIX) && strContainsChar(separator, c))) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[246]++;
        tokens.push('');
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[248]++;
      tokenIndex = tokens.length - 1;
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[250]++;
    return {
  tokens: tokens, 
  cursorPosition: cursorPosition, 
  tokenIndex: tokenIndex};
  }
});
