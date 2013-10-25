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
  _$jscoverage['/editor/enterKey.js'].lineData[10] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[11] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[16] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[18] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[20] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[21] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[24] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[27] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[29] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[30] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[32] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[33] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[36] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[40] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[41] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[42] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[43] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[44] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[46] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[52] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[55] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[57] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[58] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[61] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[64] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[67] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[70] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[71] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[72] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[73] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[74] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[77] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[78] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[79] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[80] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[86] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[90] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[93] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[97] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[98] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[101] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[103] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[107] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[109] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[112] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[113] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[115] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[116] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[121] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[122] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[123] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[124] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[126] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[127] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[129] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[130] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[131] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[132] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[137] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[138] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[140] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[147] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[149] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[150] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[154] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[157] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[158] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[161] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[164] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[166] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[167] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[172] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[177] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[184] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[185] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[188] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[189] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[190] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[191] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[192] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[193] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[195] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[196] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[197] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[198] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[199] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[206] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[208] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[211] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[212] = 0;
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
  _$jscoverage['/editor/enterKey.js'].branchData['20'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['32'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['36'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['37'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['37'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['40'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['57'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['70'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['72'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['77'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['77'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['86'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['90'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['91'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['97'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['103'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['107'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['112'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['115'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['122'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['123'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['126'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['129'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['137'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['147'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['147'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['154'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['157'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['158'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['192'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['193'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['198'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['198'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['198'][1].init(188, 12, 're !== false');
function visit332_198_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['193'][2].init(37, 24, 'ev.ctrlKey || ev.metaKey');
function visit331_193_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['193'][1].init(22, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit330_193_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['192'][1].init(57, 14, 'keyCode === 13');
function visit329_192_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['158'][1].init(18, 9, 'nextBlock');
function visit328_158_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['157'][1].init(5432, 9, '!UA[\'ie\']');
function visit327_157_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['154'][1].init(2422, 31, 'isStartOfBlock && !isEndOfBlock');
function visit326_154_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['147'][3].init(2060, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit325_147_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['147'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['147'][2].init(2040, 74, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit324_147_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['147'][1].init(2028, 86, 'UA[\'ie\'] && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit323_147_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['137'][1].init(1610, 9, '!UA[\'ie\']');
function visit322_137_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['129'][1].init(275, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit321_129_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['126'][1].init(90, 75, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit320_126_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['123'][1].init(69, 7, 'i < len');
function visit319_123_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['122'][1].init(955, 11, 'elementPath');
function visit318_122_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['115'][1].init(620, 9, '!newBlock');
function visit317_115_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['112'][1].init(544, 9, 'nextBlock');
function visit316_112_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['107'][2].init(218, 32, 'previousBlock.nodeName() == \'li\'');
function visit315_107_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['107'][1].init(218, 82, 'previousBlock.nodeName() == \'li\' || !headerTagRegex.test(previousBlock.nodeName())');
function visit314_107_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['103'][1].init(47, 13, 'previousBlock');
function visit313_103_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['97'][1].init(605, 9, 'nextBlock');
function visit312_97_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['91'][1].init(50, 109, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit311_91_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['90'][2].init(227, 28, 'nextBlock.nodeName() == \'li\'');
function visit310_90_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['90'][1].init(227, 160, 'nextBlock.nodeName() == \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit309_90_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['86'][1].init(2185, 32, '!isStartOfBlock && !isEndOfBlock');
function visit308_86_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['77'][3].init(1760, 23, 'node.nodeName() == \'li\'');
function visit307_77_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['77'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['77'][2].init(1725, 58, '(node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit306_77_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['77'][1].init(1706, 77, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit305_77_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['72'][1].init(58, 23, 'node.nodeName() == \'li\'');
function visit304_72_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['70'][1].init(1453, 9, 'nextBlock');
function visit303_70_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['57'][1].init(1053, 10, '!splitInfo');
function visit302_57_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['40'][1].init(22, 28, 'editor.hasCommand(\'outdent\')');
function visit301_40_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['37'][3].init(55, 33, 'block.parent().nodeName() == \'li\'');
function visit300_37_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['37'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['37'][2].init(27, 24, 'block.nodeName() == \'li\'');
function visit299_37_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['37'][1].init(27, 61, 'block.nodeName() == \'li\' || block.parent().nodeName() == \'li\'');
function visit298_37_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['36'][1].init(139, 91, 'block && (block.nodeName() == \'li\' || block.parent().nodeName() == \'li\')');
function visit297_36_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['32'][1].init(219, 52, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit296_32_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['20'][1].init(205, 5, 'i > 0');
function visit295_20_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].lineData[10]++;
KISSY.add("editor/enterKey", function(S, Editor, Walker, ElementPath, Node, Event) {
  _$jscoverage['/editor/enterKey.js'].functionData[0]++;
  _$jscoverage['/editor/enterKey.js'].lineData[11]++;
  var UA = S.UA, headerTagRegex = /^h[1-6]$/, dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/enterKey.js'].lineData[16]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[18]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[20]++;
    for (var i = ranges.length - 1; visit295_20_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[21]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[24]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[27]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[29]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[30]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[32]++;
    if (visit296_32_1(range.checkStartOfBlock() && range.checkEndOfBlock())) {
      _$jscoverage['/editor/enterKey.js'].lineData[33]++;
      var path = new ElementPath(range.startContainer), block = path.block;
      _$jscoverage['/editor/enterKey.js'].lineData[36]++;
      if (visit297_36_1(block && (visit298_37_1(visit299_37_2(block.nodeName() == 'li') || visit300_37_3(block.parent().nodeName() == 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[40]++;
        if (visit301_40_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[41]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[42]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[43]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[44]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[46]++;
          return false;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[52]++;
    var blockTag = "p";
    _$jscoverage['/editor/enterKey.js'].lineData[55]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[57]++;
    if (visit302_57_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[58]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[61]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[64]++;
    var isStartOfBlock = splitInfo.wasStartOfBlock, isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[67]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[70]++;
    if (visit303_70_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[71]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[72]++;
      if (visit304_72_1(node.nodeName() == 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[73]++;
        nextBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[74]++;
        nextBlock._4e_move(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[77]++;
      if (visit305_77_1(previousBlock && visit306_77_2((node = previousBlock.parent()) && visit307_77_3(node.nodeName() == 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[78]++;
        previousBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[79]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[80]++;
        previousBlock._4e_move(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[86]++;
    if (visit308_86_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[90]++;
      if (visit309_90_1(visit310_90_2(nextBlock.nodeName() == 'li') && visit311_91_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[93]++;
        (UA['ie'] ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[97]++;
      if (visit312_97_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[98]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[101]++;
      var newBlock;
      _$jscoverage['/editor/enterKey.js'].lineData[103]++;
      if (visit313_103_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[107]++;
        if (visit314_107_1(visit315_107_2(previousBlock.nodeName() == 'li') || !headerTagRegex.test(previousBlock.nodeName()))) {
          _$jscoverage['/editor/enterKey.js'].lineData[109]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[112]++;
        if (visit316_112_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[113]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[115]++;
      if (visit317_115_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[116]++;
        newBlock = new Node("<" + blockTag + ">", null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[121]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[122]++;
      if (visit318_122_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[123]++;
        for (var i = 0, len = elementPath.elements.length; visit319_123_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[124]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[126]++;
          if (visit320_126_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[127]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[129]++;
          if (visit321_129_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[130]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[131]++;
            newBlock._4e_moveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[132]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[137]++;
      if (visit322_137_1(!UA['ie'])) {
        _$jscoverage['/editor/enterKey.js'].lineData[138]++;
        newBlock._4e_appendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[140]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[147]++;
      if (visit323_147_1(UA['ie'] && visit324_147_2(isStartOfBlock && (visit325_147_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[149]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[150]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[154]++;
      range.moveToElementEditablePosition(visit326_154_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[157]++;
    if (visit327_157_1(!UA['ie'])) {
      _$jscoverage['/editor/enterKey.js'].lineData[158]++;
      if (visit328_158_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[161]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[164]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[166]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[167]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[172]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[177]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[184]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[185]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[188]++;
  function EnterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[189]++;
    var doc = editor.get("document")[0];
    _$jscoverage['/editor/enterKey.js'].lineData[190]++;
    Event.on(doc, "keydown", function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[191]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[192]++;
  if (visit329_192_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[193]++;
    if (visit330_193_1(ev.shiftKey || visit331_193_2(ev.ctrlKey || ev.metaKey))) {
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[195]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[196]++;
      var re = editor.execCommand("enterBlock");
      _$jscoverage['/editor/enterKey.js'].lineData[197]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[198]++;
      if (visit332_198_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[199]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[206]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[208]++;
  editor.addCommand("enterBlock", {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[211]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[212]++;
  EnterKey(editor);
});
}};
}, {
  requires: ['./base', './walker', './elementPath', 'node', 'event']});
