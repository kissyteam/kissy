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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[11] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[45] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['16'] = [];
  _$jscoverage['/base.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['19'] = [];
  _$jscoverage['/base.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['54'] = [];
  _$jscoverage['/base.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['55'] = [];
  _$jscoverage['/base.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['56'] = [];
  _$jscoverage['/base.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['66'] = [];
  _$jscoverage['/base.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['70'] = [];
  _$jscoverage['/base.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'] = [];
  _$jscoverage['/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['78'] = [];
  _$jscoverage['/base.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['81'] = [];
  _$jscoverage['/base.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['86'] = [];
  _$jscoverage['/base.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['89'] = [];
  _$jscoverage['/base.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['92'] = [];
  _$jscoverage['/base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['102'] = [];
  _$jscoverage['/base.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['115'] = [];
  _$jscoverage['/base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'] = [];
  _$jscoverage['/base.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'] = [];
  _$jscoverage['/base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['135'] = [];
  _$jscoverage['/base.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['141'] = [];
  _$jscoverage['/base.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'] = [];
  _$jscoverage['/base.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['148'] = [];
  _$jscoverage['/base.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['156'] = [];
  _$jscoverage['/base.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'] = [];
  _$jscoverage['/base.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['184'] = [];
  _$jscoverage['/base.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['185'] = [];
  _$jscoverage['/base.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['187'] = [];
  _$jscoverage['/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['192'] = [];
  _$jscoverage['/base.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['205'] = [];
  _$jscoverage['/base.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['228'] = [];
  _$jscoverage['/base.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['233'] = [];
  _$jscoverage['/base.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['237'] = [];
  _$jscoverage['/base.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['249'] = [];
  _$jscoverage['/base.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['252'] = [];
  _$jscoverage['/base.js'].branchData['252'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['252'][1].init(135, 17, 'top !== undefined');
function visit60_252_1(result) {
  _$jscoverage['/base.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['249'][1].init(22, 18, 'left !== undefined');
function visit59_249_1(result) {
  _$jscoverage['/base.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['237'][1].init(366, 17, 'top !== undefined');
function visit58_237_1(result) {
  _$jscoverage['/base.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['233'][1].init(198, 18, 'left !== undefined');
function visit57_233_1(result) {
  _$jscoverage['/base.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['228'][1].init(114, 7, 'animCfg');
function visit56_228_1(result) {
  _$jscoverage['/base.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(272, 7, 'cfg.top');
function visit55_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(138, 8, 'cfg.left');
function visit54_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['205'][1].init(78, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit53_205_1(result) {
  _$jscoverage['/base.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(72, 15, 'offset[p2] <= v');
function visit52_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['192'][1].init(51, 6, 'i >= 0');
function visit51_192_1(result) {
  _$jscoverage['/base.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['187'][1].init(72, 15, 'offset[p2] >= v');
function visit50_187_1(result) {
  _$jscoverage['/base.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['185'][1].init(30, 22, 'i < pagesOffset.length');
function visit49_185_1(result) {
  _$jscoverage['/base.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['184'][1].init(261, 13, 'direction > 0');
function visit48_184_1(result) {
  _$jscoverage['/base.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][1].init(48, 23, 'self.scrollAnims.length');
function visit47_161_1(result) {
  _$jscoverage['/base.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['156'][1].init(38, 11, 'axis == \'x\'');
function visit46_156_1(result) {
  _$jscoverage['/base.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['148'][1].init(124, 21, 'isTouchEventSupported');
function visit45_148_1(result) {
  _$jscoverage['/base.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][7].init(214, 10, 'deltaX < 0');
function visit44_145_7(result) {
  _$jscoverage['/base.js'].branchData['145'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][6].init(193, 17, 'scrollLeft >= max');
function visit43_145_6(result) {
  _$jscoverage['/base.js'].branchData['145'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][5].init(193, 31, 'scrollLeft >= max && deltaX < 0');
function visit42_145_5(result) {
  _$jscoverage['/base.js'].branchData['145'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][4].init(179, 10, 'deltaX > 0');
function visit41_145_4(result) {
  _$jscoverage['/base.js'].branchData['145'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][3].init(158, 17, 'scrollLeft <= min');
function visit40_145_3(result) {
  _$jscoverage['/base.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][2].init(158, 31, 'scrollLeft <= min && deltaX > 0');
function visit39_145_2(result) {
  _$jscoverage['/base.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][1].init(158, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit38_145_1(result) {
  _$jscoverage['/base.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['141'][1].init(981, 46, '(deltaX = e.deltaX) && self.allowScroll[\'left\']');
function visit37_141_1(result) {
  _$jscoverage['/base.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['135'][1].init(171, 21, 'isTouchEventSupported');
function visit36_135_1(result) {
  _$jscoverage['/base.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][7].init(208, 10, 'deltaY < 0');
function visit35_131_7(result) {
  _$jscoverage['/base.js'].branchData['131'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][6].init(188, 16, 'scrollTop >= max');
function visit34_131_6(result) {
  _$jscoverage['/base.js'].branchData['131'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][5].init(188, 30, 'scrollTop >= max && deltaY < 0');
function visit33_131_5(result) {
  _$jscoverage['/base.js'].branchData['131'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][4].init(174, 10, 'deltaY > 0');
function visit32_131_4(result) {
  _$jscoverage['/base.js'].branchData['131'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][3].init(154, 16, 'scrollTop <= min');
function visit31_131_3(result) {
  _$jscoverage['/base.js'].branchData['131'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][2].init(154, 30, 'scrollTop <= min && deltaY > 0');
function visit30_131_2(result) {
  _$jscoverage['/base.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][1].init(154, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit29_131_1(result) {
  _$jscoverage['/base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][1].init(368, 45, '(deltaY = e.deltaY) && self.allowScroll[\'top\']');
function visit28_127_1(result) {
  _$jscoverage['/base.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['115'][1].init(18, 20, 'this.get(\'disabled\')');
function visit27_115_1(result) {
  _$jscoverage['/base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['102'][1].init(51, 18, 'control.scrollStep');
function visit26_102_1(result) {
  _$jscoverage['/base.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['92'][1].init(301, 23, 'keyCode == KeyCode.LEFT');
function visit25_92_1(result) {
  _$jscoverage['/base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['89'][1].init(132, 24, 'keyCode == KeyCode.RIGHT');
function visit24_89_1(result) {
  _$jscoverage['/base.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['86'][1].init(1667, 6, 'allowX');
function visit23_86_1(result) {
  _$jscoverage['/base.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['81'][1].init(734, 26, 'keyCode == KeyCode.PAGE_UP');
function visit22_81_1(result) {
  _$jscoverage['/base.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['78'][1].init(562, 28, 'keyCode == KeyCode.PAGE_DOWN');
function visit21_78_1(result) {
  _$jscoverage['/base.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][1].init(398, 21, 'keyCode == KeyCode.UP');
function visit20_75_1(result) {
  _$jscoverage['/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['70'][1].init(184, 23, 'keyCode == KeyCode.DOWN');
function visit19_70_1(result) {
  _$jscoverage['/base.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['66'][1].init(735, 6, 'allowY');
function visit18_66_1(result) {
  _$jscoverage['/base.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['56'][2].init(336, 20, 'nodeName == \'select\'');
function visit17_56_2(result) {
  _$jscoverage['/base.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['56'][1].init(42, 75, 'nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit16_56_1(result) {
  _$jscoverage['/base.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['55'][2].init(292, 22, 'nodeName == \'textarea\'');
function visit15_55_2(result) {
  _$jscoverage['/base.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['55'][1].init(39, 118, 'nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit14_55_1(result) {
  _$jscoverage['/base.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['54'][2].init(250, 19, 'nodeName == \'input\'');
function visit13_54_2(result) {
  _$jscoverage['/base.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['54'][1].init(250, 158, 'nodeName == \'input\' || nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit12_54_1(result) {
  _$jscoverage['/base.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['19'][1].init(255, 10, 'scrollLeft');
function visit11_19_1(result) {
  _$jscoverage['/base.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['16'][1].init(147, 9, 'scrollTop');
function visit10_16_1(result) {
  _$jscoverage['/base.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('scroll-view/base', function(S, Node, Anim, Container, Render, undefined) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var $ = S.all, isTouchEventSupported = S.Features.isTouchEventSupported(), KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[11]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[12]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[16]++;
    if (visit10_16_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[17]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[19]++;
    if (visit11_19_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[20]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[22]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[25]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[26]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[34]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[36]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[40]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[45]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[50]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[54]++;
  if (visit12_54_1(visit13_54_2(nodeName == 'input') || visit14_55_1(visit15_55_2(nodeName == 'textarea') || visit16_56_1(visit17_56_2(nodeName == 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[58]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[60]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok = undefined;
  _$jscoverage['/base.js'].lineData[64]++;
  var allowX = self.allowScroll['left'];
  _$jscoverage['/base.js'].lineData[65]++;
  var allowY = self.allowScroll['top'];
  _$jscoverage['/base.js'].lineData[66]++;
  if (visit18_66_1(allowY)) {
    _$jscoverage['/base.js'].lineData[67]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[70]++;
    if (visit19_70_1(keyCode == KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[71]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[74]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[75]++;
      if (visit20_75_1(keyCode == KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[76]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[77]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[78]++;
        if (visit21_78_1(keyCode == KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[79]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[80]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[81]++;
          if (visit22_81_1(keyCode == KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[82]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[83]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[86]++;
  if (visit23_86_1(allowX)) {
    _$jscoverage['/base.js'].lineData[87]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[88]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[89]++;
    if (visit24_89_1(keyCode == KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[90]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[91]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[92]++;
      if (visit25_92_1(keyCode == KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[93]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[94]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[97]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[101]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[102]++;
  if (visit26_102_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[103]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[105]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[106]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[107]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[108]++;
  return control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[115]++;
  if (visit27_115_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[116]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[118]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[127]++;
  if (visit28_127_1((deltaY = e.deltaY) && self.allowScroll['top'])) {
    _$jscoverage['/base.js'].lineData[128]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[129]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[130]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[131]++;
    if (visit29_131_1(visit30_131_2(visit31_131_3(scrollTop <= min) && visit32_131_4(deltaY > 0)) || visit33_131_5(visit34_131_6(scrollTop >= max) && visit35_131_7(deltaY < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[133]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep['top']});
      _$jscoverage['/base.js'].lineData[135]++;
      if (visit36_135_1(isTouchEventSupported)) {
        _$jscoverage['/base.js'].lineData[136]++;
        e.preventDefault();
      }
    }
  }
  _$jscoverage['/base.js'].lineData[141]++;
  if (visit37_141_1((deltaX = e.deltaX) && self.allowScroll['left'])) {
    _$jscoverage['/base.js'].lineData[142]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[143]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[144]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[145]++;
    if (visit38_145_1(visit39_145_2(visit40_145_3(scrollLeft <= min) && visit41_145_4(deltaX > 0)) || visit42_145_5(visit43_145_6(scrollLeft >= max) && visit44_145_7(deltaX < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[147]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep['left']});
      _$jscoverage['/base.js'].lineData[148]++;
      if (visit45_148_1(isTouchEventSupported)) {
        _$jscoverage['/base.js'].lineData[149]++;
        e.preventDefault();
      }
    }
  }
}, 
  'isAxisEnabled': function(axis) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[156]++;
  return this.allowScroll[visit46_156_1(axis == 'x') ? 'left' : 'top'];
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[161]++;
  if (visit47_161_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[162]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[163]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[165]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[167]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[174]++;
  this.scrollToPage(v);
}, 
  _getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[178]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[179]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[180]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[181]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[182]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[184]++;
  if (visit48_184_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[185]++;
    for (i = 0; visit49_185_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[186]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[187]++;
      if (visit50_187_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[188]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[192]++;
    for (i = pagesOffset.length - 1; visit51_192_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[193]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[194]++;
      if (visit52_194_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[195]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[199]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[203]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[205]++;
  if (visit53_205_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[206]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[207]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[212]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[213]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[214]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[215]++;
  if (visit54_215_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[216]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[218]++;
  if (visit55_218_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[219]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[221]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[225]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[228]++;
  if (visit56_228_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[229]++;
    var scrollLeft = self.get('scrollLeft'), scrollTop = self.get('scrollTop'), node = {}, to = {};
    _$jscoverage['/base.js'].lineData[233]++;
    if (visit57_233_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[234]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[235]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[237]++;
    if (visit58_237_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[238]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[239]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[241]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[242]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[243]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[244]++;
    var anim;
    _$jscoverage['/base.js'].lineData[245]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[246]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[247]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[249]++;
    if (visit59_249_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[250]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[252]++;
    if (visit60_252_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[253]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  focusable: {
  value: !isTouchEventSupported}, 
  allowTextSelection: {
  value: true}, 
  handleMouseEvents: {
  value: false}, 
  snap: {
  value: false}, 
  snapDuration: {
  value: 0.3}, 
  snapEasing: {
  value: 'easeOut'}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
}, {
  requires: ['node', 'anim', 'component/container', './base/render']});
