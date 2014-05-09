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
if (! _$jscoverage['/combobox/combobox-xtpl.js']) {
  _$jscoverage['/combobox/combobox-xtpl.js'] = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[182] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[183] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[184] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[186] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[187] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[188] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[191] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[192] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[193] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[194] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[195] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[196] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[197] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[199] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[200] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[201] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[204] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[205] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[206] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[207] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[208] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[209] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[210] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[211] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[213] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[214] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[215] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[217] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[218] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[219] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].functionData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[6] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].branchData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['29'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['80'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['98'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['165'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['182'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['209'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['209'][1] = new BranchData();
}
_$jscoverage['/combobox/combobox-xtpl.js'].branchData['209'][1].init(8669, 31, 'callRet42 && callRet42.isBuffer');
function visit9_209_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['182'][1].init(7521, 31, 'callRet36 && callRet36.isBuffer');
function visit8_182_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['165'][1].init(6827, 31, 'callRet32 && callRet32.isBuffer');
function visit7_165_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'][1].init(5319, 31, 'callRet24 && callRet24.isBuffer');
function visit6_128_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['98'][1].init(3911, 31, 'callRet17 && callRet17.isBuffer');
function visit5_98_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['80'][1].init(1003, 31, 'callRet14 && callRet14.isBuffer');
function visit4_80_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'][1].init(403, 31, 'callRet11 && callRet11.isBuffer');
function visit3_66_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'][1].init(1674, 29, 'callRet5 && callRet5.isBuffer');
function visit2_43_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['29'][1].init(1143, 29, 'callRet2 && callRet2.isBuffer');
function visit1_29_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4]++;
  var combobox = function(scope, buffer, undefined) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[20]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25]++;
  params1.push('invalid-el');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26]++;
  option0.params = params1;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27]++;
  var callRet2;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28]++;
  callRet2 = callFnUtil(tpl, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29]++;
  if (visit1_29_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[30]++;
    buffer = callRet2;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[31]++;
    callRet2 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33]++;
  buffer.write(callRet2, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34]++;
  buffer.write('">\r\n    <div class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38]++;
  var params4 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[39]++;
  params4.push('invalid-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40]++;
  option3.params = params4;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41]++;
  var callRet5;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42]++;
  callRet5 = callFnUtil(tpl, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[43]++;
  if (visit2_43_1(callRet5 && callRet5.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[44]++;
    buffer = callRet5;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45]++;
    callRet5 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47]++;
  buffer.write(callRet5, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48]++;
  buffer.write('"></div>\r\n</div>\r\n\r\n', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49]++;
  var option6 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[52]++;
  var params7 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53]++;
  var id8 = scope.resolve(["hasTrigger"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54]++;
  params7.push(id8);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55]++;
  option6.params = params7;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[56]++;
  option6.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[57]++;
  buffer.write('\r\n<div class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58]++;
  var option9 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61]++;
  var params10 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62]++;
  params10.push('trigger');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[63]++;
  option9.params = params10;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64]++;
  var callRet11;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65]++;
  callRet11 = callFnUtil(tpl, scope, option9, buffer, ["getBaseCssClasses"], 0, 6);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66]++;
  if (visit3_66_1(callRet11 && callRet11.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67]++;
    buffer = callRet11;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68]++;
    callRet11 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[70]++;
  buffer.write(callRet11, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71]++;
  buffer.write('">\r\n    <div class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72]++;
  var option12 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75]++;
  var params13 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76]++;
  params13.push('trigger-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77]++;
  option12.params = params13;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[78]++;
  var callRet14;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79]++;
  callRet14 = callFnUtil(tpl, scope, option12, buffer, ["getBaseCssClasses"], 0, 7);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80]++;
  if (visit4_80_1(callRet14 && callRet14.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81]++;
    buffer = callRet14;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[82]++;
    callRet14 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84]++;
  buffer.write(callRet14, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85]++;
  buffer.write('">&#x25BC;</div>\r\n</div>\r\n', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88]++;
  buffer = ifCommand.call(tpl, scope, option6, buffer, 5);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89]++;
  buffer.write('\r\n\r\n<div class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90]++;
  var option15 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93]++;
  var params16 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[94]++;
  params16.push('input-wrap');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95]++;
  option15.params = params16;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[96]++;
  var callRet17;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97]++;
  callRet17 = callFnUtil(tpl, scope, option15, buffer, ["getBaseCssClasses"], 0, 11);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98]++;
  if (visit5_98_1(callRet17 && callRet17.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99]++;
    buffer = callRet17;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[100]++;
    callRet17 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102]++;
  buffer.write(callRet17, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103]++;
  buffer.write('">\r\n\r\n    <input id="ks-combobox-input-', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104]++;
  var id18 = scope.resolve(["id"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105]++;
  buffer.write(id18, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106]++;
  buffer.write('"\r\n           aria-haspopup="true"\r\n           aria-autocomplete="list"\r\n           aria-haspopup="true"\r\n           role="autocomplete"\r\n           aria-expanded="false"\r\n\r\n    ', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110]++;
  var params20 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111]++;
  var id21 = scope.resolve(["disabled"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112]++;
  params20.push(id21);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113]++;
  option19.params = params20;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114]++;
  option19.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115]++;
  buffer.write('\r\n    disabled\r\n    ', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[116]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118]++;
  buffer = ifCommand.call(tpl, scope, option19, buffer, 20);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119]++;
  buffer.write('\r\n\r\n    autocomplete="off"\r\n    class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[123]++;
  var params23 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124]++;
  params23.push('input');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[125]++;
  option22.params = params23;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126]++;
  var callRet24;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[127]++;
  callRet24 = callFnUtil(tpl, scope, option22, buffer, ["getBaseCssClasses"], 0, 25);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128]++;
  if (visit6_128_1(callRet24 && callRet24.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129]++;
    buffer = callRet24;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130]++;
    callRet24 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[132]++;
  buffer.write(callRet24, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133]++;
  buffer.write('"\r\n\r\n    value="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134]++;
  var id25 = scope.resolve(["value"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135]++;
  buffer.write(id25, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[136]++;
  buffer.write('"\r\n    />\r\n\r\n\r\n    <label for="ks-combobox-input-', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137]++;
  var id26 = scope.resolve(["id"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138]++;
  buffer.write(id26, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[139]++;
  buffer.write('"\r\n            style=\'display:', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[140]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[143]++;
  var params28 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[144]++;
  var id29 = scope.resolve(["value"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[145]++;
  params28.push(id29);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[146]++;
  option27.params = params28;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[147]++;
  option27.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[148]++;
  buffer.write('none', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[149]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[151]++;
  option27.inverse = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[152]++;
  buffer.write('block', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[153]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[155]++;
  buffer = ifCommand.call(tpl, scope, option27, buffer, 32);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[156]++;
  buffer.write(';\'\r\n    class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[157]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[160]++;
  var params31 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[161]++;
  params31.push('placeholder');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[162]++;
  option30.params = params31;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[163]++;
  var callRet32;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[164]++;
  callRet32 = callFnUtil(tpl, scope, option30, buffer, ["getBaseCssClasses"], 0, 33);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[165]++;
  if (visit7_165_1(callRet32 && callRet32.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[166]++;
    buffer = callRet32;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[167]++;
    callRet32 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[169]++;
  buffer.write(callRet32, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[170]++;
  buffer.write('">\r\n    ', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[171]++;
  var id33 = scope.resolve(["placeholder"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[172]++;
  buffer.write(id33, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[173]++;
  buffer.write('\r\n    </label>\r\n\r\n    <div class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[174]++;
  var option34 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[177]++;
  var params35 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[178]++;
  params35.push('clear');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[179]++;
  option34.params = params35;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[180]++;
  var callRet36;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[181]++;
  callRet36 = callFnUtil(tpl, scope, option34, buffer, ["getBaseCssClasses"], 0, 37);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[182]++;
  if (visit8_182_1(callRet36 && callRet36.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[183]++;
    buffer = callRet36;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[184]++;
    callRet36 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[186]++;
  buffer.write(callRet36, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[187]++;
  buffer.write('"\r\n         unselectable="on"\r\n         ', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[188]++;
  var option37 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[191]++;
  var params38 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[192]++;
  var id39 = scope.resolve(["value"], 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[193]++;
  params38.push(!(id39));
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[194]++;
  option37.params = params38;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[195]++;
  option37.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[6]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[196]++;
  buffer.write('\r\n         style="display:none"\r\n         ', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[197]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[199]++;
  buffer = ifCommand.call(tpl, scope, option37, buffer, 39);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[200]++;
  buffer.write('\r\n         onmousedown="return false;"><div\r\n            class="', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[201]++;
  var option40 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[204]++;
  var params41 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[205]++;
  params41.push('clear-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[206]++;
  option40.params = params41;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[207]++;
  var callRet42;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[208]++;
  callRet42 = callFnUtil(tpl, scope, option40, buffer, ["getBaseCssClasses"], 0, 43);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[209]++;
  if (visit9_209_1(callRet42 && callRet42.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[210]++;
    buffer = callRet42;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[211]++;
    callRet42 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[213]++;
  buffer.write(callRet42, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[214]++;
  buffer.write('">clear</div></div>\r\n</div>\r\n', 0);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[215]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[217]++;
  combobox.TPL_NAME = module.name;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[218]++;
  combobox.version = "5.0.0";
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[219]++;
  return combobox;
});
