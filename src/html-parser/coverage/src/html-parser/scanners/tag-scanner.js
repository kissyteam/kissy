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
if (! _$jscoverage['/html-parser/scanners/tag-scanner.js']) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'] = {};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[194] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[199] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[219] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[232] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[235] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[246] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[251] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[301] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[304] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[314] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[323] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[325] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[327] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[330] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[337] = 0;
}
if (! _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[9] = 0;
}
if (! _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData = {};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['43'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['57'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['71'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['84'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['87'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['92'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['99'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['104'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['107'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['107'][2] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['111'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['126'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['155'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['180'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['198'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['214'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['219'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['228'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['240'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['243'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['257'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['270'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['276'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['293'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['301'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'][1] = new BranchData();
}
_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'][1].init(130, 30, '!SpecialScanners[node.tagName]');
function visit313_323_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1].init(26, 16, 'stack.length > 0');
function visit312_320_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'][1].init(4255, 12, 'node == null');
function visit311_319_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['301'][1].init(1485, 11, 'index != -1');
function visit310_301_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'][1].init(89, 26, 'c.tagName === node.tagName');
function visit309_295_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['293'][1].init(1159, 6, 'i >= 0');
function visit308_293_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['276'][1].init(1899, 15, 'node.isEndTag()');
function visit307_276_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['270'][1].init(808, 26, 'processImpliedEndTag(node)');
function visit306_270_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['257'][1].init(105, 17, 'node.isSelfClosed');
function visit305_257_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'][1].init(36, 29, 'SpecialScanners[node.tagName]');
function visit304_251_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'][1].init(231, 16, '!node.isEndTag()');
function visit303_249_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'][1].init(47, 27, 'node.tagName == tag.tagName');
function visit302_247_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'][1].init(73, 75, 'node.isEndTag() && node.tagName == tag.tagName');
function visit301_246_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'][1].init(26, 19, 'node.nodeType === 1');
function visit300_244_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['243'][1].init(64, 4, 'node');
function visit299_243_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['240'][1].init(1765, 16, 'opts.stack || []');
function visit298_240_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['228'][1].init(622, 7, 'needFix');
function visit297_228_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'][1].init(89, 30, 'parent.tagName == node.tagName');
function visit296_221_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['219'][1].init(216, 47, 'parent && !(parent.tagName in endParentTagName)');
function visit295_219_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['214'][1].init(144, 46, 'endParentTagName = impliedEndTag[node.tagName]');
function visit294_214_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['198'][1].init(32, 8, 'i > from');
function visit293_198_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'][1].init(309, 29, 'node.tagName || node.nodeName');
function visit292_189_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'][1].init(229, 18, 'node.nodeType == 8');
function visit291_186_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'][1].init(120, 17, '!dtd[tag.tagName]');
function visit290_183_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['180'][1].init(52, 17, 'tag.nodeType == 9');
function visit289_180_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['155'][1].init(4279, 24, 'holder.childNodes.length');
function visit288_155_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'][1].init(83, 28, 'canHasNodeAsChild(c, holder)');
function visit287_128_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['126'][1].init(1537, 17, '!c.equals(holder)');
function visit286_126_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['111'][1].init(397, 27, 'childNodes[i].nodeType == 3');
function visit285_111_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['107'][2].init(174, 27, 'childNodes[i].nodeType == 3');
function visit284_107_2(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['107'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['107'][1].init(174, 91, 'childNodes[i].nodeType == 3 && !S.trim(childNodes[i].toHtml())');
function visit283_107_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'][1].init(30, 41, 'childNodes[i].tagName == currentChildName');
function visit282_105_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['104'][1].init(233, 21, 'i < childNodes.length');
function visit281_104_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['99'][1].init(270, 31, 'dtd.$listItem[currentChildName]');
function visit280_99_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['92'][1].init(96, 15, 'c.nodeType != 1');
function visit279_92_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['87'][1].init(56, 28, 'canHasNodeAsChild(holder, c)');
function visit278_87_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['84'][1].init(1452, 21, 'i < childNodes.length');
function visit277_84_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['71'][1].init(18, 24, 'holder.childNodes.length');
function visit276_71_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['57'][1].init(372, 5, 'valid');
function visit275_57_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['51'][1].init(18, 26, '!canHasNodeAsChild(tag, c)');
function visit274_51_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['43'][1].init(44, 17, '!opts[\'fixByDtd\']');
function visit273_43_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[5]++;
KISSY.add("html-parser/scanners/tag-scanner", function(S, dtd, Tag, SpecialScanners) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[0]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[7]++;
  var wrapper = {
  li: 'ul', 
  dt: 'dl', 
  dd: 'dl'};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[24]++;
  var impliedEndTag = {
  'dd': {
  'dl': 1}, 
  'dt': {
  'dl': 1}, 
  'li': {
  'ul': 1, 
  'ol': 1}, 
  'option': {
  'select': 1}, 
  'optgroup': {
  'select': 1}};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[40]++;
  function fixCloseTagByDtd(tag, opts) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[1]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[41]++;
    tag['closed'] = 1;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[43]++;
    if (visit273_43_1(!opts['fixByDtd'])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[44]++;
      return 0;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[47]++;
    var valid = 1, childNodes = [].concat(tag.childNodes);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[50]++;
    S.each(childNodes, function(c) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[2]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[51]++;
  if (visit274_51_1(!canHasNodeAsChild(tag, c))) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[52]++;
    valid = 0;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[53]++;
    return false;
  }
});
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[57]++;
    if (visit275_57_1(valid)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[58]++;
      return 0;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[61]++;
    var holder = tag.clone(), prev = tag, recursives = [];
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[70]++;
    function closeCurrentHolder() {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[3]++;
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[71]++;
      if (visit276_71_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[73]++;
        holder.insertAfter(prev);
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[77]++;
        prev = holder;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[80]++;
        holder = tag.clone();
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[84]++;
    for (var i = 0; visit277_84_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[85]++;
      var c = childNodes[i];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[87]++;
      if (visit278_87_1(canHasNodeAsChild(holder, c))) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[88]++;
        holder.appendChild(c);
      } else {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[92]++;
        if (visit279_92_1(c.nodeType != 1)) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[93]++;
          continue;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[96]++;
        var currentChildName = c.tagName;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[99]++;
        if (visit280_99_1(dtd.$listItem[currentChildName])) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[100]++;
          closeCurrentHolder();
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[101]++;
          var pTagName = wrapper[c.tagName], pTag = new Tag();
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[103]++;
          pTag.nodeName = pTag.tagName = pTagName;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[104]++;
          while (visit281_104_1(i < childNodes.length)) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[105]++;
            if (visit282_105_1(childNodes[i].tagName == currentChildName)) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[106]++;
              pTag.appendChild(childNodes[i]);
            } else {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[107]++;
              if (visit283_107_1(visit284_107_2(childNodes[i].nodeType == 3) && !S.trim(childNodes[i].toHtml()))) {
              } else {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[111]++;
                if (visit285_111_1(childNodes[i].nodeType == 3)) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[112]++;
                  break;
                }
              }
            }
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[114]++;
            i++;
          }
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[116]++;
          pTag.insertAfter(prev);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[117]++;
          prev = pTag;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[118]++;
          i--;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[119]++;
          continue;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[125]++;
        closeCurrentHolder();
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[126]++;
        if (visit286_126_1(!c.equals(holder))) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[128]++;
          if (visit287_128_1(canHasNodeAsChild(c, holder))) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[129]++;
            holder = tag.clone();
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[130]++;
            S.each(c.childNodes, function(cc) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[4]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[131]++;
  holder.appendChild(cc);
});
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[133]++;
            c.empty();
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[134]++;
            c.insertAfter(prev);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[135]++;
            prev = c;
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[136]++;
            c.appendChild(holder);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[138]++;
            recursives.push(holder);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[139]++;
            holder = tag.clone();
          } else {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[142]++;
            c.insertAfter(prev);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[143]++;
            prev = c;
          }
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[146]++;
          c.insertAfter(prev);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[147]++;
          prev = c;
        }
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[155]++;
    if (visit288_155_1(holder.childNodes.length)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[156]++;
      holder.insertAfter(prev);
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[160]++;
    tag.parentNode.removeChild(tag);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[167]++;
    S.each(recursives, function(r) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[5]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[168]++;
  fixCloseTagByDtd(r, opts);
});
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[171]++;
    return 1;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[178]++;
  function canHasNodeAsChild(tag, node) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[6]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[180]++;
    if (visit289_180_1(tag.nodeType == 9)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[181]++;
      return 1;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[183]++;
    if (visit290_183_1(!dtd[tag.tagName])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[184]++;
      S.error("dtd[" + tag.tagName + "] === undefined!");
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[186]++;
    if (visit291_186_1(node.nodeType == 8)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[187]++;
      return 1;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[189]++;
    var nodeName = visit292_189_1(node.tagName || node.nodeName);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[190]++;
    return !!dtd[tag.tagName][nodeName];
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[194]++;
  return {
  scan: function(tag, lexer, opts) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[7]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[197]++;
  function closeStackOpenTag(end, from) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[8]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[198]++;
    for (i = end; visit293_198_1(i > from); i--) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[199]++;
      var currentStackItem = stack[i], preStackItem = stack[i - 1];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[201]++;
      preStackItem.appendChild(currentStackItem);
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[202]++;
      fixCloseTagByDtd(currentStackItem, opts);
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[204]++;
    tag = stack[from];
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[205]++;
    stack.length = from;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[210]++;
  function processImpliedEndTag(node) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[9]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[211]++;
    var needFix = 0, endParentTagName;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[214]++;
    if (visit294_214_1(endParentTagName = impliedEndTag[node.tagName])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[215]++;
      var from = stack.length - 1, parent = stack[from];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[219]++;
      while (visit295_219_1(parent && !(parent.tagName in endParentTagName))) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[221]++;
        if (visit296_221_1(parent.tagName == node.tagName)) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[222]++;
          needFix = 1;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[223]++;
          break;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[225]++;
        from--;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[226]++;
        parent = stack[from];
      }
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[228]++;
      if (visit297_228_1(needFix)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[229]++;
        closeStackOpenTag(stack.length - 1, from - 1);
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[232]++;
    return needFix;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[235]++;
  var node, i, stack;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[240]++;
  stack = opts.stack = visit298_240_1(opts.stack || []);
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[241]++;
  do {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[242]++;
    node = lexer.nextNode();
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[243]++;
    if (visit299_243_1(node)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[244]++;
      if (visit300_244_1(node.nodeType === 1)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[246]++;
        if (visit301_246_1(node.isEndTag() && visit302_247_1(node.tagName == tag.tagName))) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[248]++;
          node = null;
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[249]++;
          if (visit303_249_1(!node.isEndTag())) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[251]++;
            if (visit304_251_1(SpecialScanners[node.tagName])) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[253]++;
              SpecialScanners[node.tagName].scan(node, lexer, opts);
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[254]++;
              tag.appendChild(node);
            } else {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[257]++;
              if (visit305_257_1(node.isSelfClosed)) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[258]++;
                tag.appendChild(node);
              } else {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[266]++;
                stack.push(tag);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[270]++;
                if (visit306_270_1(processImpliedEndTag(node))) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[271]++;
                  stack.push(tag);
                }
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[273]++;
                tag = node;
              }
            }
          } else {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[276]++;
            if (visit307_276_1(node.isEndTag())) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[292]++;
              var index = -1;
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[293]++;
              for (i = stack.length - 1; visit308_293_1(i >= 0); i--) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[294]++;
                var c = stack[i];
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[295]++;
                if (visit309_295_1(c.tagName === node.tagName)) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[296]++;
                  index = i;
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[297]++;
                  break;
                }
              }
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[301]++;
              if (visit310_301_1(index != -1)) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[304]++;
                stack[stack.length - 1].appendChild(tag);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[305]++;
                fixCloseTagByDtd(tag, opts);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[306]++;
                closeStackOpenTag(stack.length - 1, index);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[307]++;
                node = null;
              } else {
              }
            }
          }
        }
      } else {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[314]++;
        tag.appendChild(node);
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[319]++;
    if (visit311_319_1(node == null)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[320]++;
      if (visit312_320_1(stack.length > 0)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[321]++;
        node = stack[stack.length - 1];
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[323]++;
        if (visit313_323_1(!SpecialScanners[node.tagName])) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[324]++;
          stack.length = stack.length - 1;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[325]++;
          node.appendChild(tag);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[327]++;
          fixCloseTagByDtd(tag, opts);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[328]++;
          tag = node;
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[330]++;
          node = null;
        }
      }
    }
  } while (node);
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[337]++;
  fixCloseTagByDtd(tag, opts);
}};
}, {
  requires: ["../dtd", "../nodes/tag", "./special-scanners"]});
