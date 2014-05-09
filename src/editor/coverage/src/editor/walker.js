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
if (! _$jscoverage['/editor/walker.js']) {
  _$jscoverage['/editor/walker.js'] = {};
  _$jscoverage['/editor/walker.js'].lineData = [];
  _$jscoverage['/editor/walker.js'].lineData[11] = 0;
  _$jscoverage['/editor/walker.js'].lineData[12] = 0;
  _$jscoverage['/editor/walker.js'].lineData[14] = 0;
  _$jscoverage['/editor/walker.js'].lineData[22] = 0;
  _$jscoverage['/editor/walker.js'].lineData[23] = 0;
  _$jscoverage['/editor/walker.js'].lineData[25] = 0;
  _$jscoverage['/editor/walker.js'].lineData[26] = 0;
  _$jscoverage['/editor/walker.js'].lineData[28] = 0;
  _$jscoverage['/editor/walker.js'].lineData[37] = 0;
  _$jscoverage['/editor/walker.js'].lineData[38] = 0;
  _$jscoverage['/editor/walker.js'].lineData[42] = 0;
  _$jscoverage['/editor/walker.js'].lineData[45] = 0;
  _$jscoverage['/editor/walker.js'].lineData[46] = 0;
  _$jscoverage['/editor/walker.js'].lineData[47] = 0;
  _$jscoverage['/editor/walker.js'].lineData[52] = 0;
  _$jscoverage['/editor/walker.js'].lineData[54] = 0;
  _$jscoverage['/editor/walker.js'].lineData[57] = 0;
  _$jscoverage['/editor/walker.js'].lineData[59] = 0;
  _$jscoverage['/editor/walker.js'].lineData[60] = 0;
  _$jscoverage['/editor/walker.js'].lineData[64] = 0;
  _$jscoverage['/editor/walker.js'].lineData[70] = 0;
  _$jscoverage['/editor/walker.js'].lineData[72] = 0;
  _$jscoverage['/editor/walker.js'].lineData[76] = 0;
  _$jscoverage['/editor/walker.js'].lineData[78] = 0;
  _$jscoverage['/editor/walker.js'].lineData[79] = 0;
  _$jscoverage['/editor/walker.js'].lineData[83] = 0;
  _$jscoverage['/editor/walker.js'].lineData[88] = 0;
  _$jscoverage['/editor/walker.js'].lineData[92] = 0;
  _$jscoverage['/editor/walker.js'].lineData[93] = 0;
  _$jscoverage['/editor/walker.js'].lineData[94] = 0;
  _$jscoverage['/editor/walker.js'].lineData[95] = 0;
  _$jscoverage['/editor/walker.js'].lineData[97] = 0;
  _$jscoverage['/editor/walker.js'].lineData[100] = 0;
  _$jscoverage['/editor/walker.js'].lineData[103] = 0;
  _$jscoverage['/editor/walker.js'].lineData[104] = 0;
  _$jscoverage['/editor/walker.js'].lineData[108] = 0;
  _$jscoverage['/editor/walker.js'].lineData[109] = 0;
  _$jscoverage['/editor/walker.js'].lineData[110] = 0;
  _$jscoverage['/editor/walker.js'].lineData[111] = 0;
  _$jscoverage['/editor/walker.js'].lineData[112] = 0;
  _$jscoverage['/editor/walker.js'].lineData[113] = 0;
  _$jscoverage['/editor/walker.js'].lineData[116] = 0;
  _$jscoverage['/editor/walker.js'].lineData[120] = 0;
  _$jscoverage['/editor/walker.js'].lineData[121] = 0;
  _$jscoverage['/editor/walker.js'].lineData[123] = 0;
  _$jscoverage['/editor/walker.js'].lineData[124] = 0;
  _$jscoverage['/editor/walker.js'].lineData[125] = 0;
  _$jscoverage['/editor/walker.js'].lineData[128] = 0;
  _$jscoverage['/editor/walker.js'].lineData[134] = 0;
  _$jscoverage['/editor/walker.js'].lineData[135] = 0;
  _$jscoverage['/editor/walker.js'].lineData[136] = 0;
  _$jscoverage['/editor/walker.js'].lineData[137] = 0;
  _$jscoverage['/editor/walker.js'].lineData[138] = 0;
  _$jscoverage['/editor/walker.js'].lineData[140] = 0;
  _$jscoverage['/editor/walker.js'].lineData[141] = 0;
  _$jscoverage['/editor/walker.js'].lineData[143] = 0;
  _$jscoverage['/editor/walker.js'].lineData[146] = 0;
  _$jscoverage['/editor/walker.js'].lineData[147] = 0;
  _$jscoverage['/editor/walker.js'].lineData[148] = 0;
  _$jscoverage['/editor/walker.js'].lineData[151] = 0;
  _$jscoverage['/editor/walker.js'].lineData[152] = 0;
  _$jscoverage['/editor/walker.js'].lineData[154] = 0;
  _$jscoverage['/editor/walker.js'].lineData[155] = 0;
  _$jscoverage['/editor/walker.js'].lineData[157] = 0;
  _$jscoverage['/editor/walker.js'].lineData[165] = 0;
  _$jscoverage['/editor/walker.js'].lineData[166] = 0;
  _$jscoverage['/editor/walker.js'].lineData[176] = 0;
  _$jscoverage['/editor/walker.js'].lineData[187] = 0;
  _$jscoverage['/editor/walker.js'].lineData[190] = 0;
  _$jscoverage['/editor/walker.js'].lineData[193] = 0;
  _$jscoverage['/editor/walker.js'].lineData[199] = 0;
  _$jscoverage['/editor/walker.js'].lineData[208] = 0;
  _$jscoverage['/editor/walker.js'].lineData[217] = 0;
  _$jscoverage['/editor/walker.js'].lineData[226] = 0;
  _$jscoverage['/editor/walker.js'].lineData[237] = 0;
  _$jscoverage['/editor/walker.js'].lineData[247] = 0;
  _$jscoverage['/editor/walker.js'].lineData[257] = 0;
  _$jscoverage['/editor/walker.js'].lineData[261] = 0;
  _$jscoverage['/editor/walker.js'].lineData[262] = 0;
  _$jscoverage['/editor/walker.js'].lineData[270] = 0;
  _$jscoverage['/editor/walker.js'].lineData[277] = 0;
  _$jscoverage['/editor/walker.js'].lineData[278] = 0;
  _$jscoverage['/editor/walker.js'].lineData[293] = 0;
  _$jscoverage['/editor/walker.js'].lineData[294] = 0;
  _$jscoverage['/editor/walker.js'].lineData[298] = 0;
  _$jscoverage['/editor/walker.js'].lineData[299] = 0;
  _$jscoverage['/editor/walker.js'].lineData[301] = 0;
  _$jscoverage['/editor/walker.js'].lineData[305] = 0;
  _$jscoverage['/editor/walker.js'].lineData[308] = 0;
  _$jscoverage['/editor/walker.js'].lineData[317] = 0;
  _$jscoverage['/editor/walker.js'].lineData[318] = 0;
  _$jscoverage['/editor/walker.js'].lineData[319] = 0;
  _$jscoverage['/editor/walker.js'].lineData[327] = 0;
  _$jscoverage['/editor/walker.js'].lineData[328] = 0;
  _$jscoverage['/editor/walker.js'].lineData[334] = 0;
  _$jscoverage['/editor/walker.js'].lineData[336] = 0;
  _$jscoverage['/editor/walker.js'].lineData[341] = 0;
  _$jscoverage['/editor/walker.js'].lineData[345] = 0;
  _$jscoverage['/editor/walker.js'].lineData[346] = 0;
  _$jscoverage['/editor/walker.js'].lineData[353] = 0;
  _$jscoverage['/editor/walker.js'].lineData[355] = 0;
  _$jscoverage['/editor/walker.js'].lineData[356] = 0;
  _$jscoverage['/editor/walker.js'].lineData[359] = 0;
  _$jscoverage['/editor/walker.js'].lineData[360] = 0;
  _$jscoverage['/editor/walker.js'].lineData[362] = 0;
  _$jscoverage['/editor/walker.js'].lineData[365] = 0;
  _$jscoverage['/editor/walker.js'].lineData[367] = 0;
  _$jscoverage['/editor/walker.js'].lineData[371] = 0;
  _$jscoverage['/editor/walker.js'].lineData[373] = 0;
}
if (! _$jscoverage['/editor/walker.js'].functionData) {
  _$jscoverage['/editor/walker.js'].functionData = [];
  _$jscoverage['/editor/walker.js'].functionData[0] = 0;
  _$jscoverage['/editor/walker.js'].functionData[1] = 0;
  _$jscoverage['/editor/walker.js'].functionData[2] = 0;
  _$jscoverage['/editor/walker.js'].functionData[3] = 0;
  _$jscoverage['/editor/walker.js'].functionData[4] = 0;
  _$jscoverage['/editor/walker.js'].functionData[5] = 0;
  _$jscoverage['/editor/walker.js'].functionData[6] = 0;
  _$jscoverage['/editor/walker.js'].functionData[7] = 0;
  _$jscoverage['/editor/walker.js'].functionData[8] = 0;
  _$jscoverage['/editor/walker.js'].functionData[9] = 0;
  _$jscoverage['/editor/walker.js'].functionData[10] = 0;
  _$jscoverage['/editor/walker.js'].functionData[11] = 0;
  _$jscoverage['/editor/walker.js'].functionData[12] = 0;
  _$jscoverage['/editor/walker.js'].functionData[13] = 0;
  _$jscoverage['/editor/walker.js'].functionData[14] = 0;
  _$jscoverage['/editor/walker.js'].functionData[15] = 0;
  _$jscoverage['/editor/walker.js'].functionData[16] = 0;
  _$jscoverage['/editor/walker.js'].functionData[17] = 0;
  _$jscoverage['/editor/walker.js'].functionData[18] = 0;
  _$jscoverage['/editor/walker.js'].functionData[19] = 0;
  _$jscoverage['/editor/walker.js'].functionData[20] = 0;
  _$jscoverage['/editor/walker.js'].functionData[21] = 0;
  _$jscoverage['/editor/walker.js'].functionData[22] = 0;
  _$jscoverage['/editor/walker.js'].functionData[23] = 0;
  _$jscoverage['/editor/walker.js'].functionData[24] = 0;
  _$jscoverage['/editor/walker.js'].functionData[25] = 0;
  _$jscoverage['/editor/walker.js'].functionData[26] = 0;
}
if (! _$jscoverage['/editor/walker.js'].branchData) {
  _$jscoverage['/editor/walker.js'].branchData = {};
  _$jscoverage['/editor/walker.js'].branchData['25'] = [];
  _$jscoverage['/editor/walker.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['37'] = [];
  _$jscoverage['/editor/walker.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['45'] = [];
  _$jscoverage['/editor/walker.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['52'] = [];
  _$jscoverage['/editor/walker.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'] = [];
  _$jscoverage['/editor/walker.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['64'] = [];
  _$jscoverage['/editor/walker.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['70'] = [];
  _$jscoverage['/editor/walker.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['73'] = [];
  _$jscoverage['/editor/walker.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['73'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'] = [];
  _$jscoverage['/editor/walker.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['83'] = [];
  _$jscoverage['/editor/walker.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['92'] = [];
  _$jscoverage['/editor/walker.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['94'] = [];
  _$jscoverage['/editor/walker.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['103'] = [];
  _$jscoverage['/editor/walker.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['108'] = [];
  _$jscoverage['/editor/walker.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['110'] = [];
  _$jscoverage['/editor/walker.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['112'] = [];
  _$jscoverage['/editor/walker.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['116'] = [];
  _$jscoverage['/editor/walker.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['123'] = [];
  _$jscoverage['/editor/walker.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['124'] = [];
  _$jscoverage['/editor/walker.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['128'] = [];
  _$jscoverage['/editor/walker.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['134'] = [];
  _$jscoverage['/editor/walker.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['136'] = [];
  _$jscoverage['/editor/walker.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['137'] = [];
  _$jscoverage['/editor/walker.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['140'] = [];
  _$jscoverage['/editor/walker.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['226'] = [];
  _$jscoverage['/editor/walker.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['237'] = [];
  _$jscoverage['/editor/walker.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['278'] = [];
  _$jscoverage['/editor/walker.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['278'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['294'] = [];
  _$jscoverage['/editor/walker.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['294'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['301'] = [];
  _$jscoverage['/editor/walker.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['301'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['302'] = [];
  _$jscoverage['/editor/walker.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['305'] = [];
  _$jscoverage['/editor/walker.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['318'] = [];
  _$jscoverage['/editor/walker.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['318'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['334'] = [];
  _$jscoverage['/editor/walker.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['335'] = [];
  _$jscoverage['/editor/walker.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['335'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['346'] = [];
  _$jscoverage['/editor/walker.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['347'] = [];
  _$jscoverage['/editor/walker.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['348'] = [];
  _$jscoverage['/editor/walker.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['348'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['349'] = [];
  _$jscoverage['/editor/walker.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['357'] = [];
  _$jscoverage['/editor/walker.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['359'] = [];
  _$jscoverage['/editor/walker.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['359'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['359'][4] = new BranchData();
}
_$jscoverage['/editor/walker.js'].branchData['359'][4].init(244, 22, 'tail[0].nodeType === 3');
function visit1147_359_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['359'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['359'][3].init(244, 57, 'tail[0].nodeType === 3 && tailNbspRegex.test(tail.text())');
function visit1146_359_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['359'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['359'][2].init(217, 24, 'tail.nodeName() === \'br\'');
function visit1145_359_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['359'][1].init(199, 103, 'tail && (!UA.ie ? tail.nodeName() === \'br\' : tail[0].nodeType === 3 && tailNbspRegex.test(tail.text()))');
function visit1144_359_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['357'][1].init(72, 23, 'tail && toSkip(tail[0])');
function visit1143_357_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['349'][1].init(43, 44, 'name in dtd.$inline && !(name in dtd.$empty)');
function visit1142_349_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['348'][2].init(145, 19, 'node.nodeType === 1');
function visit1141_348_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['348'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['348'][1].init(39, 88, 'node.nodeType === 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1140_348_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['347'][1].init(36, 128, 'isWhitespaces(node) || node.nodeType === 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1139_347_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['346'][1].init(65, 165, 'isBookmark(node) || isWhitespaces(node) || node.nodeType === 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1138_346_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['335'][2].init(60, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1137_335_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['335'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['335'][1].init(40, 65, 'node.nodeType === Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1136_335_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['334'][1].init(379, 106, 'whitespace(node) || node.nodeType === Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1135_334_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['318'][2].init(37, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit1134_318_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['318'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['318'][1].init(37, 67, 'node.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit1133_318_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['305'][1].init(358, 34, 'isBookmark || isBookmarkNode(node)');
function visit1132_305_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['302'][1].init(65, 72, '(parent = node.parentNode) && isBookmarkNode(parent)');
function visit1131_302_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['301'][2].init(122, 40, 'node.nodeType === Dom.NodeType.TEXT_NODE');
function visit1130_301_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['301'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['301'][1].init(122, 138, 'node.nodeType === Dom.NodeType.TEXT_NODE && (parent = node.parentNode) && isBookmarkNode(parent)');
function visit1129_301_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['294'][2].init(26, 29, 'Dom.nodeName(node) === \'span\'');
function visit1128_294_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['294'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['294'][1].init(26, 84, 'Dom.nodeName(node) === \'span\' && Dom.attr(node, \'_ke_bookmark\')');
function visit1127_294_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['278'][2].init(27, 43, 'node.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit1126_278_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['278'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['278'][1].init(27, 113, 'node.nodeType === Dom.NodeType.ELEMENT_NODE && Dom._4eIsBlockBoundary(node, customNodeNames)');
function visit1125_278_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['237'][1].init(78, 40, 'iterate.call(this, TRUE, TRUE) !== FALSE');
function visit1124_237_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['226'][1].init(21, 41, 'iterate.call(this, FALSE, TRUE) !== FALSE');
function visit1123_226_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['140'][1].init(232, 38, 'breakOnFalseRetFalse && self.evaluator');
function visit1122_140_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['137'][1].init(22, 21, '!breakOnFalseRetFalse');
function visit1121_137_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['136'][2].init(71, 33, 'self.evaluator(node[0]) !== FALSE');
function visit1120_136_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['136'][1].init(52, 52, '!self.evaluator || self.evaluator(node[0]) !== FALSE');
function visit1119_136_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['134'][1].init(4138, 19, 'node && !self._.end');
function visit1118_134_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['128'][1].init(30, 43, 'guard(range.startContainer, TRUE) === FALSE');
function visit1117_128_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['124'][1].init(26, 24, 'guard(node[0]) === FALSE');
function visit1116_124_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['123'][1].init(143, 11, 'node.length');
function visit1115_123_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['116'][1].init(30, 27, 'guard(node, TRUE) === FALSE');
function visit1114_116_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['112'][1].init(105, 24, 'guard(node[0]) === FALSE');
function visit1113_112_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['110'][1].init(66, 19, 'range.endOffset > 0');
function visit1112_110_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['108'][1].init(71, 3, 'rtl');
function visit1111_108_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['103'][1].init(2918, 12, 'self.current');
function visit1110_103_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['94'][1].init(22, 36, 'stopGuard(node, movingOut) === FALSE');
function visit1109_94_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['92'][1].init(2596, 9, 'userGuard');
function visit1108_92_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['83'][1].init(295, 19, 'node !== blockerRTL');
function visit1107_83_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][4].init(104, 29, 'Dom.nodeName(node) === \'body\'');
function visit1106_78_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][3].init(83, 17, 'limitRTL === node');
function visit1105_78_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][2].init(83, 50, 'limitRTL === node || Dom.nodeName(node) === \'body\'');
function visit1104_78_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][1].init(69, 65, 'movingOut && (limitRTL === node || Dom.nodeName(node) === \'body\')');
function visit1103_78_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['73'][3].init(70, 21, 'range.startOffset > 0');
function visit1102_73_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['73'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['73'][2].init(70, 89, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1]');
function visit1101_73_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['73'][1].init(70, 97, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1] || null');
function visit1100_73_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['70'][1].init(1653, 23, 'rtl && !self._.guardRTL');
function visit1099_70_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['64'][1].init(295, 19, 'node !== blockerLTR');
function visit1098_64_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][4].init(104, 29, 'Dom.nodeName(node) === \'body\'');
function visit1097_59_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][3].init(83, 17, 'limitLTR === node');
function visit1096_59_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][2].init(83, 50, 'limitLTR === node || Dom.nodeName(node) === \'body\'');
function visit1095_59_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][1].init(69, 65, 'movingOut && (limitLTR === node || Dom.nodeName(node) === \'body\')');
function visit1094_59_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['52'][1].init(911, 24, '!rtl && !self._.guardLTR');
function visit1093_52_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['45'][1].init(267, 15, 'range.collapsed');
function visit1092_45_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['37'][1].init(452, 13, '!self._.start');
function visit1091_37_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['25'][1].init(92, 10, 'self._.end');
function visit1090_25_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].lineData[11]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/walker.js'].functionData[0]++;
  _$jscoverage['/editor/walker.js'].lineData[12]++;
  var Editor = require('./base');
  _$jscoverage['/editor/walker.js'].lineData[14]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = require('dom'), dtd = Editor.XHTML_DTD, Node = require('node');
  _$jscoverage['/editor/walker.js'].lineData[22]++;
  function iterate(rtl, breakOnFalseRetFalse) {
    _$jscoverage['/editor/walker.js'].functionData[1]++;
    _$jscoverage['/editor/walker.js'].lineData[23]++;
    var self = this;
    _$jscoverage['/editor/walker.js'].lineData[25]++;
    if (visit1090_25_1(self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[26]++;
      return NULL;
    }
    _$jscoverage['/editor/walker.js'].lineData[28]++;
    var node, range = self.range, guard, userGuard = self.guard, type = self.type, getSourceNodeFn = (rtl ? '_4ePreviousSourceNode' : '_4eNextSourceNode');
    _$jscoverage['/editor/walker.js'].lineData[37]++;
    if (visit1091_37_1(!self._.start)) {
      _$jscoverage['/editor/walker.js'].lineData[38]++;
      self._.start = 1;
      _$jscoverage['/editor/walker.js'].lineData[42]++;
      range.trim();
      _$jscoverage['/editor/walker.js'].lineData[45]++;
      if (visit1092_45_1(range.collapsed)) {
        _$jscoverage['/editor/walker.js'].lineData[46]++;
        self.end();
        _$jscoverage['/editor/walker.js'].lineData[47]++;
        return NULL;
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[52]++;
    if (visit1093_52_1(!rtl && !self._.guardLTR)) {
      _$jscoverage['/editor/walker.js'].lineData[54]++;
      var limitLTR = range.endContainer[0], blockerLTR = limitLTR.childNodes[range.endOffset];
      _$jscoverage['/editor/walker.js'].lineData[57]++;
      this._.guardLTR = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[2]++;
  _$jscoverage['/editor/walker.js'].lineData[59]++;
  if (visit1094_59_1(movingOut && (visit1095_59_2(visit1096_59_3(limitLTR === node) || visit1097_59_4(Dom.nodeName(node) === 'body'))))) {
    _$jscoverage['/editor/walker.js'].lineData[60]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[64]++;
  return visit1098_64_1(node !== blockerLTR);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[70]++;
    if (visit1099_70_1(rtl && !self._.guardRTL)) {
      _$jscoverage['/editor/walker.js'].lineData[72]++;
      var limitRTL = range.startContainer[0], blockerRTL = visit1100_73_1(visit1101_73_2((visit1102_73_3(range.startOffset > 0)) && limitRTL.childNodes[range.startOffset - 1]) || null);
      _$jscoverage['/editor/walker.js'].lineData[76]++;
      self._.guardRTL = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[3]++;
  _$jscoverage['/editor/walker.js'].lineData[78]++;
  if (visit1103_78_1(movingOut && (visit1104_78_2(visit1105_78_3(limitRTL === node) || visit1106_78_4(Dom.nodeName(node) === 'body'))))) {
    _$jscoverage['/editor/walker.js'].lineData[79]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[83]++;
  return visit1107_83_1(node !== blockerRTL);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[88]++;
    var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;
    _$jscoverage['/editor/walker.js'].lineData[92]++;
    if (visit1108_92_1(userGuard)) {
      _$jscoverage['/editor/walker.js'].lineData[93]++;
      guard = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[4]++;
  _$jscoverage['/editor/walker.js'].lineData[94]++;
  if (visit1109_94_1(stopGuard(node, movingOut) === FALSE)) {
    _$jscoverage['/editor/walker.js'].lineData[95]++;
    return FALSE;
  }
  _$jscoverage['/editor/walker.js'].lineData[97]++;
  return userGuard(node, movingOut);
};
    } else {
      _$jscoverage['/editor/walker.js'].lineData[100]++;
      guard = stopGuard;
    }
    _$jscoverage['/editor/walker.js'].lineData[103]++;
    if (visit1110_103_1(self.current)) {
      _$jscoverage['/editor/walker.js'].lineData[104]++;
      node = this.current[getSourceNodeFn](FALSE, type, guard);
    } else {
      _$jscoverage['/editor/walker.js'].lineData[108]++;
      if (visit1111_108_1(rtl)) {
        _$jscoverage['/editor/walker.js'].lineData[109]++;
        node = range.endContainer;
        _$jscoverage['/editor/walker.js'].lineData[110]++;
        if (visit1112_110_1(range.endOffset > 0)) {
          _$jscoverage['/editor/walker.js'].lineData[111]++;
          node = new Node(node[0].childNodes[range.endOffset - 1]);
          _$jscoverage['/editor/walker.js'].lineData[112]++;
          if (visit1113_112_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[113]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[116]++;
          node = (visit1114_116_1(guard(node, TRUE) === FALSE)) ? NULL : node._4ePreviousSourceNode(TRUE, type, guard, undefined);
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[120]++;
        node = range.startContainer;
        _$jscoverage['/editor/walker.js'].lineData[121]++;
        node = new Node(node[0].childNodes[range.startOffset]);
        _$jscoverage['/editor/walker.js'].lineData[123]++;
        if (visit1115_123_1(node.length)) {
          _$jscoverage['/editor/walker.js'].lineData[124]++;
          if (visit1116_124_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[125]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[128]++;
          node = (visit1117_128_1(guard(range.startContainer, TRUE) === FALSE)) ? NULL : range.startContainer._4eNextSourceNode(TRUE, type, guard, undefined);
        }
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[134]++;
    while (visit1118_134_1(node && !self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[135]++;
      self.current = node;
      _$jscoverage['/editor/walker.js'].lineData[136]++;
      if (visit1119_136_1(!self.evaluator || visit1120_136_2(self.evaluator(node[0]) !== FALSE))) {
        _$jscoverage['/editor/walker.js'].lineData[137]++;
        if (visit1121_137_1(!breakOnFalseRetFalse)) {
          _$jscoverage['/editor/walker.js'].lineData[138]++;
          return node;
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[140]++;
        if (visit1122_140_1(breakOnFalseRetFalse && self.evaluator)) {
          _$jscoverage['/editor/walker.js'].lineData[141]++;
          return FALSE;
        }
      }
      _$jscoverage['/editor/walker.js'].lineData[143]++;
      node = node[getSourceNodeFn](FALSE, type, guard);
    }
    _$jscoverage['/editor/walker.js'].lineData[146]++;
    self.end();
    _$jscoverage['/editor/walker.js'].lineData[147]++;
    self.current = NULL;
    _$jscoverage['/editor/walker.js'].lineData[148]++;
    return NULL;
  }
  _$jscoverage['/editor/walker.js'].lineData[151]++;
  function iterateToLast(rtl) {
    _$jscoverage['/editor/walker.js'].functionData[5]++;
    _$jscoverage['/editor/walker.js'].lineData[152]++;
    var node, last = NULL;
    _$jscoverage['/editor/walker.js'].lineData[154]++;
    while ((node = iterate.call(this, rtl))) {
      _$jscoverage['/editor/walker.js'].lineData[155]++;
      last = node;
    }
    _$jscoverage['/editor/walker.js'].lineData[157]++;
    return last;
  }
  _$jscoverage['/editor/walker.js'].lineData[165]++;
  function Walker(range) {
    _$jscoverage['/editor/walker.js'].functionData[6]++;
    _$jscoverage['/editor/walker.js'].lineData[166]++;
    this.range = range;
    _$jscoverage['/editor/walker.js'].lineData[176]++;
    this.evaluator = NULL;
    _$jscoverage['/editor/walker.js'].lineData[187]++;
    this.guard = NULL;
    _$jscoverage['/editor/walker.js'].lineData[190]++;
    this._ = {};
  }
  _$jscoverage['/editor/walker.js'].lineData[193]++;
  S.augment(Walker, {
  end: function() {
  _$jscoverage['/editor/walker.js'].functionData[7]++;
  _$jscoverage['/editor/walker.js'].lineData[199]++;
  this._.end = 1;
}, 
  next: function() {
  _$jscoverage['/editor/walker.js'].functionData[8]++;
  _$jscoverage['/editor/walker.js'].lineData[208]++;
  return iterate.call(this);
}, 
  previous: function() {
  _$jscoverage['/editor/walker.js'].functionData[9]++;
  _$jscoverage['/editor/walker.js'].lineData[217]++;
  return iterate.call(this, TRUE);
}, 
  checkForward: function() {
  _$jscoverage['/editor/walker.js'].functionData[10]++;
  _$jscoverage['/editor/walker.js'].lineData[226]++;
  return visit1123_226_1(iterate.call(this, FALSE, TRUE) !== FALSE);
}, 
  checkBackward: function() {
  _$jscoverage['/editor/walker.js'].functionData[11]++;
  _$jscoverage['/editor/walker.js'].lineData[237]++;
  return visit1124_237_1(iterate.call(this, TRUE, TRUE) !== FALSE);
}, 
  lastForward: function() {
  _$jscoverage['/editor/walker.js'].functionData[12]++;
  _$jscoverage['/editor/walker.js'].lineData[247]++;
  return iterateToLast.call(this);
}, 
  lastBackward: function() {
  _$jscoverage['/editor/walker.js'].functionData[13]++;
  _$jscoverage['/editor/walker.js'].lineData[257]++;
  return iterateToLast.call(this, TRUE);
}, 
  reset: function() {
  _$jscoverage['/editor/walker.js'].functionData[14]++;
  _$jscoverage['/editor/walker.js'].lineData[261]++;
  delete this.current;
  _$jscoverage['/editor/walker.js'].lineData[262]++;
  this._ = {};
}, 
  _iterator: iterate});
  _$jscoverage['/editor/walker.js'].lineData[270]++;
  S.mix(Walker, {
  blockBoundary: function(customNodeNames) {
  _$jscoverage['/editor/walker.js'].functionData[15]++;
  _$jscoverage['/editor/walker.js'].lineData[277]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[16]++;
  _$jscoverage['/editor/walker.js'].lineData[278]++;
  return !(visit1125_278_1(visit1126_278_2(node.nodeType === Dom.NodeType.ELEMENT_NODE) && Dom._4eIsBlockBoundary(node, customNodeNames)));
};
}, 
  bookmark: function(contentOnly, isReject) {
  _$jscoverage['/editor/walker.js'].functionData[17]++;
  _$jscoverage['/editor/walker.js'].lineData[293]++;
  function isBookmarkNode(node) {
    _$jscoverage['/editor/walker.js'].functionData[18]++;
    _$jscoverage['/editor/walker.js'].lineData[294]++;
    return visit1127_294_1(visit1128_294_2(Dom.nodeName(node) === 'span') && Dom.attr(node, '_ke_bookmark'));
  }
  _$jscoverage['/editor/walker.js'].lineData[298]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[19]++;
  _$jscoverage['/editor/walker.js'].lineData[299]++;
  var isBookmark, parent;
  _$jscoverage['/editor/walker.js'].lineData[301]++;
  isBookmark = (visit1129_301_1(visit1130_301_2(node.nodeType === Dom.NodeType.TEXT_NODE) && visit1131_302_1((parent = node.parentNode) && isBookmarkNode(parent))));
  _$jscoverage['/editor/walker.js'].lineData[305]++;
  isBookmark = contentOnly ? isBookmark : visit1132_305_1(isBookmark || isBookmarkNode(node));
  _$jscoverage['/editor/walker.js'].lineData[308]++;
  return !!(isReject ^ isBookmark);
};
}, 
  whitespaces: function(isReject) {
  _$jscoverage['/editor/walker.js'].functionData[20]++;
  _$jscoverage['/editor/walker.js'].lineData[317]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[21]++;
  _$jscoverage['/editor/walker.js'].lineData[318]++;
  var isWhitespace = visit1133_318_1(visit1134_318_2(node.nodeType === Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue));
  _$jscoverage['/editor/walker.js'].lineData[319]++;
  return !!(isReject ^ isWhitespace);
};
}, 
  invisible: function(isReject) {
  _$jscoverage['/editor/walker.js'].functionData[22]++;
  _$jscoverage['/editor/walker.js'].lineData[327]++;
  var whitespace = Walker.whitespaces();
  _$jscoverage['/editor/walker.js'].lineData[328]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[23]++;
  _$jscoverage['/editor/walker.js'].lineData[334]++;
  var isInvisible = visit1135_334_1(whitespace(node) || visit1136_335_1(visit1137_335_2(node.nodeType === Dom.NodeType.ELEMENT_NODE) && !node.offsetHeight));
  _$jscoverage['/editor/walker.js'].lineData[336]++;
  return !!(isReject ^ isInvisible);
};
}});
  _$jscoverage['/editor/walker.js'].lineData[341]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/, isWhitespaces = Walker.whitespaces(), isBookmark = Walker.bookmark(), toSkip = function(node) {
  _$jscoverage['/editor/walker.js'].functionData[24]++;
  _$jscoverage['/editor/walker.js'].lineData[345]++;
  var name = Dom.nodeName(node);
  _$jscoverage['/editor/walker.js'].lineData[346]++;
  return visit1138_346_1(isBookmark(node) || visit1139_347_1(isWhitespaces(node) || visit1140_348_1(visit1141_348_2(node.nodeType === 1) && visit1142_349_1(name in dtd.$inline && !(name in dtd.$empty)))));
};
  _$jscoverage['/editor/walker.js'].lineData[353]++;
  function getBogus(tail) {
    _$jscoverage['/editor/walker.js'].functionData[25]++;
    _$jscoverage['/editor/walker.js'].lineData[355]++;
    do {
      _$jscoverage['/editor/walker.js'].lineData[356]++;
      tail = tail._4ePreviousSourceNode();
    } while (visit1143_357_1(tail && toSkip(tail[0])));
    _$jscoverage['/editor/walker.js'].lineData[359]++;
    if (visit1144_359_1(tail && (!UA.ie ? visit1145_359_2(tail.nodeName() === 'br') : visit1146_359_3(visit1147_359_4(tail[0].nodeType === 3) && tailNbspRegex.test(tail.text()))))) {
      _$jscoverage['/editor/walker.js'].lineData[360]++;
      return tail[0];
    }
    _$jscoverage['/editor/walker.js'].lineData[362]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[365]++;
  Editor.Utils.injectDom({
  _4eGetBogus: function(el) {
  _$jscoverage['/editor/walker.js'].functionData[26]++;
  _$jscoverage['/editor/walker.js'].lineData[367]++;
  return getBogus(new Node(el));
}});
  _$jscoverage['/editor/walker.js'].lineData[371]++;
  Editor.Walker = Walker;
  _$jscoverage['/editor/walker.js'].lineData[373]++;
  return Walker;
});
