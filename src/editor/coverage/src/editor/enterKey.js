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
if (! _$jscoverage['/editor/enterKey.js']) {
  _$jscoverage['/editor/enterKey.js'] = {};
  _$jscoverage['/editor/enterKey.js'].lineData = [];
  _$jscoverage['/editor/enterKey.js'].lineData[5] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[6] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[13] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[15] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[17] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[18] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[21] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[24] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[26] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[27] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[29] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[30] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[33] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[37] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[38] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[39] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[40] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[41] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[43] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[49] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[52] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[54] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[55] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[58] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[61] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[64] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[67] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[68] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[69] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[70] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[71] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[74] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[75] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[76] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[77] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[83] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[87] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[90] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[94] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[95] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[98] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[100] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[104] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[106] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[109] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[110] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[112] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[113] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[118] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[119] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[120] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[121] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[123] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[124] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[126] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[127] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[128] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[129] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[134] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[135] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[137] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[144] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[146] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[147] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[151] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[154] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[155] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[158] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[161] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[163] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[164] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[169] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[174] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[181] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[182] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[185] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[186] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[187] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[188] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[189] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[190] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[192] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[193] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[194] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[195] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[196] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[203] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[205] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[208] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[209] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].functionData) {
  _$jscoverage['/editor/enterKey.js'].functionData = [];
  _$jscoverage['/editor/enterKey.js'].functionData[0] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[1] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[2] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[3] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[4] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[5] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[6] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].branchData) {
  _$jscoverage['/editor/enterKey.js'].branchData = {};
  _$jscoverage['/editor/enterKey.js'].branchData['17'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['29'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['33'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['34'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['34'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['37'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['54'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['67'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['69'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['74'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['74'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['83'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['87'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['88'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['94'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['100'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['104'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['109'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['112'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['119'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['120'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['123'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['126'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['134'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['144'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['144'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['151'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['154'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['155'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['189'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['190'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['190'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['195'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['195'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['195'][1].init(188, 12, 're !== false');
function visit332_195_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['190'][2].init(37, 24, 'ev.ctrlKey || ev.metaKey');
function visit331_190_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['190'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['190'][1].init(22, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit330_190_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['189'][1].init(57, 14, 'keyCode === 13');
function visit329_189_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['155'][1].init(18, 9, 'nextBlock');
function visit328_155_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['154'][1].init(5432, 9, '!UA[\'ie\']');
function visit327_154_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['151'][1].init(2422, 31, 'isStartOfBlock && !isEndOfBlock');
function visit326_151_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['144'][3].init(2060, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit325_144_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['144'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['144'][2].init(2040, 74, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit324_144_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['144'][1].init(2028, 86, 'UA[\'ie\'] && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit323_144_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['134'][1].init(1610, 9, '!UA[\'ie\']');
function visit322_134_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['126'][1].init(275, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit321_126_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['123'][1].init(90, 75, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit320_123_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['120'][1].init(69, 7, 'i < len');
function visit319_120_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['119'][1].init(955, 11, 'elementPath');
function visit318_119_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['112'][1].init(620, 9, '!newBlock');
function visit317_112_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['109'][1].init(544, 9, 'nextBlock');
function visit316_109_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['104'][2].init(218, 32, 'previousBlock.nodeName() == \'li\'');
function visit315_104_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['104'][1].init(218, 82, 'previousBlock.nodeName() == \'li\' || !headerTagRegex.test(previousBlock.nodeName())');
function visit314_104_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['100'][1].init(47, 13, 'previousBlock');
function visit313_100_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['94'][1].init(605, 9, 'nextBlock');
function visit312_94_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['88'][1].init(50, 109, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit311_88_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['87'][2].init(227, 28, 'nextBlock.nodeName() == \'li\'');
function visit310_87_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['87'][1].init(227, 160, 'nextBlock.nodeName() == \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit309_87_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['83'][1].init(2185, 32, '!isStartOfBlock && !isEndOfBlock');
function visit308_83_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['74'][3].init(1760, 23, 'node.nodeName() == \'li\'');
function visit307_74_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['74'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['74'][2].init(1725, 58, '(node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit306_74_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['74'][1].init(1706, 77, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit305_74_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['69'][1].init(58, 23, 'node.nodeName() == \'li\'');
function visit304_69_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['67'][1].init(1453, 9, 'nextBlock');
function visit303_67_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['54'][1].init(1053, 10, '!splitInfo');
function visit302_54_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['37'][1].init(22, 28, 'editor.hasCommand(\'outdent\')');
function visit301_37_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['34'][3].init(55, 33, 'block.parent().nodeName() == \'li\'');
function visit300_34_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['34'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['34'][2].init(27, 24, 'block.nodeName() == \'li\'');
function visit299_34_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['34'][1].init(27, 61, 'block.nodeName() == \'li\' || block.parent().nodeName() == \'li\'');
function visit298_34_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['33'][1].init(139, 91, 'block && (block.nodeName() == \'li\' || block.parent().nodeName() == \'li\')');
function visit297_33_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['29'][1].init(219, 52, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit296_29_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['17'][1].init(205, 5, 'i > 0');
function visit295_17_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].lineData[5]++;
KISSY.add("editor/enterKey", function(S, Editor, Walker, ElementPath) {
  _$jscoverage['/editor/enterKey.js'].functionData[0]++;
  _$jscoverage['/editor/enterKey.js'].lineData[6]++;
  var UA = S.UA, headerTagRegex = /^h[1-6]$/, dtd = Editor.XHTML_DTD, Node = S.Node, Event = S.Event;
  _$jscoverage['/editor/enterKey.js'].lineData[13]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[15]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[17]++;
    for (var i = ranges.length - 1; visit295_17_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[18]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[21]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[24]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[26]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[27]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[29]++;
    if (visit296_29_1(range.checkStartOfBlock() && range.checkEndOfBlock())) {
      _$jscoverage['/editor/enterKey.js'].lineData[30]++;
      var path = new ElementPath(range.startContainer), block = path.block;
      _$jscoverage['/editor/enterKey.js'].lineData[33]++;
      if (visit297_33_1(block && (visit298_34_1(visit299_34_2(block.nodeName() == 'li') || visit300_34_3(block.parent().nodeName() == 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[37]++;
        if (visit301_37_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[38]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[39]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[40]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[41]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[43]++;
          return false;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[49]++;
    var blockTag = "p";
    _$jscoverage['/editor/enterKey.js'].lineData[52]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[54]++;
    if (visit302_54_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[55]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[58]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[61]++;
    var isStartOfBlock = splitInfo.wasStartOfBlock, isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[64]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[67]++;
    if (visit303_67_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[68]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[69]++;
      if (visit304_69_1(node.nodeName() == 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[70]++;
        nextBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[71]++;
        nextBlock._4e_move(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[74]++;
      if (visit305_74_1(previousBlock && visit306_74_2((node = previousBlock.parent()) && visit307_74_3(node.nodeName() == 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[75]++;
        previousBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[76]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[77]++;
        previousBlock._4e_move(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[83]++;
    if (visit308_83_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[87]++;
      if (visit309_87_1(visit310_87_2(nextBlock.nodeName() == 'li') && visit311_88_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[90]++;
        (UA['ie'] ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[94]++;
      if (visit312_94_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[95]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[98]++;
      var newBlock;
      _$jscoverage['/editor/enterKey.js'].lineData[100]++;
      if (visit313_100_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[104]++;
        if (visit314_104_1(visit315_104_2(previousBlock.nodeName() == 'li') || !headerTagRegex.test(previousBlock.nodeName()))) {
          _$jscoverage['/editor/enterKey.js'].lineData[106]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[109]++;
        if (visit316_109_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[110]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[112]++;
      if (visit317_112_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[113]++;
        newBlock = new Node("<" + blockTag + ">", null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[118]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[119]++;
      if (visit318_119_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[120]++;
        for (var i = 0, len = elementPath.elements.length; visit319_120_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[121]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[123]++;
          if (visit320_123_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[124]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[126]++;
          if (visit321_126_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[127]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[128]++;
            newBlock._4e_moveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[129]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[134]++;
      if (visit322_134_1(!UA['ie'])) {
        _$jscoverage['/editor/enterKey.js'].lineData[135]++;
        newBlock._4e_appendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[137]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[144]++;
      if (visit323_144_1(UA['ie'] && visit324_144_2(isStartOfBlock && (visit325_144_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[146]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[147]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[151]++;
      range.moveToElementEditablePosition(visit326_151_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[154]++;
    if (visit327_154_1(!UA['ie'])) {
      _$jscoverage['/editor/enterKey.js'].lineData[155]++;
      if (visit328_155_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[158]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[161]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[163]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[164]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[169]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[174]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[181]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[182]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[185]++;
  function EnterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[186]++;
    var doc = editor.get("document")[0];
    _$jscoverage['/editor/enterKey.js'].lineData[187]++;
    Event.on(doc, "keydown", function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[188]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[189]++;
  if (visit329_189_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[190]++;
    if (visit330_190_1(ev.shiftKey || visit331_190_2(ev.ctrlKey || ev.metaKey))) {
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[192]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[193]++;
      var re = editor.execCommand("enterBlock");
      _$jscoverage['/editor/enterKey.js'].lineData[194]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[195]++;
      if (visit332_195_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[196]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[203]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[205]++;
  editor.addCommand("enterBlock", {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[208]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[209]++;
  EnterKey(editor);
});
}};
}, {
  requires: ['./base', './walker', './elementPath', 'node']});
