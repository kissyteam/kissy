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
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[86] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[102] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[199] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[220] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[227] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[245] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[247] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[255] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[272] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[274] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[277] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[325] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[326] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[329] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[331] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[338] = 0;
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
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['44'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['52'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['72'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['85'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['93'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['100'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['106'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['112'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['127'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['129'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['156'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['181'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['184'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['187'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['190'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['199'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['215'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['220'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['222'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['229'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['241'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['250'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['252'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['258'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['271'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['277'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['294'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['296'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['302'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['321'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['324'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['324'][1] = new BranchData();
}
_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['324'][1].init(130, 30, '!SpecialScanners[node.tagName]');
function visit323_324_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['321'][1].init(26, 16, 'stack.length > 0');
function visit322_321_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1].init(4256, 12, 'node == null');
function visit321_320_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['302'][1].init(1485, 12, 'index !== -1');
function visit320_302_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['296'][1].init(89, 26, 'c.tagName === node.tagName');
function visit319_296_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['294'][1].init(1159, 6, 'i >= 0');
function visit318_294_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['277'][1].init(1899, 15, 'node.isEndTag()');
function visit317_277_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['271'][1].init(808, 26, 'processImpliedEndTag(node)');
function visit316_271_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['258'][1].init(105, 17, 'node.isSelfClosed');
function visit315_258_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['252'][1].init(36, 29, 'SpecialScanners[node.tagName]');
function visit314_252_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['250'][1].init(231, 16, '!node.isEndTag()');
function visit313_250_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'][1].init(47, 27, 'node.tagName == tag.tagName');
function visit312_248_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'][1].init(73, 75, 'node.isEndTag() && node.tagName == tag.tagName');
function visit311_247_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'][1].init(26, 19, 'node.nodeType === 1');
function visit310_245_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'][1].init(64, 4, 'node');
function visit309_244_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['241'][1].init(1765, 16, 'opts.stack || []');
function visit308_241_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['229'][1].init(622, 7, 'needFix');
function visit307_229_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['222'][1].init(89, 30, 'parent.tagName == node.tagName');
function visit306_222_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['220'][1].init(216, 47, 'parent && !(parent.tagName in endParentTagName)');
function visit305_220_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['215'][1].init(144, 46, 'endParentTagName = impliedEndTag[node.tagName]');
function visit304_215_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['199'][1].init(32, 8, 'i > from');
function visit303_199_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['190'][1].init(309, 29, 'node.tagName || node.nodeName');
function visit302_190_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['187'][1].init(229, 18, 'node.nodeType == 8');
function visit301_187_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['184'][1].init(120, 17, '!dtd[tag.tagName]');
function visit300_184_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['181'][1].init(52, 17, 'tag.nodeType == 9');
function visit299_181_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['156'][1].init(4280, 24, 'holder.childNodes.length');
function visit298_156_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['129'][1].init(83, 28, 'canHasNodeAsChild(c, holder)');
function visit297_129_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['127'][1].init(1538, 17, '!c.equals(holder)');
function visit296_127_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['112'][1].init(397, 27, 'childNodes[i].nodeType == 3');
function visit295_112_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][2].init(174, 27, 'childNodes[i].nodeType == 3');
function visit294_108_2(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][1].init(174, 91, 'childNodes[i].nodeType == 3 && !S.trim(childNodes[i].toHtml())');
function visit293_108_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['106'][1].init(30, 41, 'childNodes[i].tagName == currentChildName');
function visit292_106_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'][1].init(233, 21, 'i < childNodes.length');
function visit291_105_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['100'][1].init(271, 31, 'dtd.$listItem[currentChildName]');
function visit290_100_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['93'][1].init(96, 16, 'c.nodeType !== 1');
function visit289_93_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'][1].init(56, 28, 'canHasNodeAsChild(holder, c)');
function visit288_88_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['85'][1].init(1452, 21, 'i < childNodes.length');
function visit287_85_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['72'][1].init(18, 24, 'holder.childNodes.length');
function visit286_72_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['58'][1].init(372, 5, 'valid');
function visit285_58_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['52'][1].init(18, 26, '!canHasNodeAsChild(tag, c)');
function visit284_52_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['44'][1].init(44, 17, '!opts[\'fixByDtd\']');
function visit283_44_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[6]++;
KISSY.add("html-parser/scanners/tag-scanner", function(S, dtd, Tag, SpecialScanners) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[0]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[8]++;
  var wrapper = {
  li: 'ul', 
  dt: 'dl', 
  dd: 'dl'};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[25]++;
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
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[41]++;
  function fixCloseTagByDtd(tag, opts) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[1]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[42]++;
    tag['closed'] = 1;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[44]++;
    if (visit283_44_1(!opts['fixByDtd'])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[45]++;
      return 0;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[48]++;
    var valid = 1, childNodes = [].concat(tag.childNodes);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[51]++;
    S.each(childNodes, function(c) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[2]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[52]++;
  if (visit284_52_1(!canHasNodeAsChild(tag, c))) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[53]++;
    valid = 0;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[54]++;
    return false;
  }
});
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[58]++;
    if (visit285_58_1(valid)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[59]++;
      return 0;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[62]++;
    var holder = tag.clone(), prev = tag, recursives = [];
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[71]++;
    function closeCurrentHolder() {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[3]++;
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[72]++;
      if (visit286_72_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[74]++;
        holder.insertAfter(prev);
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[78]++;
        prev = holder;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[81]++;
        holder = tag.clone();
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[85]++;
    for (var i = 0; visit287_85_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[86]++;
      var c = childNodes[i];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[88]++;
      if (visit288_88_1(canHasNodeAsChild(holder, c))) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[89]++;
        holder.appendChild(c);
      } else {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[93]++;
        if (visit289_93_1(c.nodeType !== 1)) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[94]++;
          continue;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[97]++;
        var currentChildName = c.tagName;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[100]++;
        if (visit290_100_1(dtd.$listItem[currentChildName])) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[101]++;
          closeCurrentHolder();
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[102]++;
          var pTagName = wrapper[c.tagName], pTag = new Tag();
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[104]++;
          pTag.nodeName = pTag.tagName = pTagName;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[105]++;
          while (visit291_105_1(i < childNodes.length)) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[106]++;
            if (visit292_106_1(childNodes[i].tagName == currentChildName)) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[107]++;
              pTag.appendChild(childNodes[i]);
            } else {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[108]++;
              if (visit293_108_1(visit294_108_2(childNodes[i].nodeType == 3) && !S.trim(childNodes[i].toHtml()))) {
              } else {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[112]++;
                if (visit295_112_1(childNodes[i].nodeType == 3)) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[113]++;
                  break;
                }
              }
            }
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[115]++;
            i++;
          }
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[117]++;
          pTag.insertAfter(prev);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[118]++;
          prev = pTag;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[119]++;
          i--;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[120]++;
          continue;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[126]++;
        closeCurrentHolder();
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[127]++;
        if (visit296_127_1(!c.equals(holder))) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[129]++;
          if (visit297_129_1(canHasNodeAsChild(c, holder))) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[130]++;
            holder = tag.clone();
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[131]++;
            S.each(c.childNodes, function(cc) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[4]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[132]++;
  holder.appendChild(cc);
});
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[134]++;
            c.empty();
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[135]++;
            c.insertAfter(prev);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[136]++;
            prev = c;
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[137]++;
            c.appendChild(holder);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[139]++;
            recursives.push(holder);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[140]++;
            holder = tag.clone();
          } else {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[143]++;
            c.insertAfter(prev);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[144]++;
            prev = c;
          }
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[147]++;
          c.insertAfter(prev);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[148]++;
          prev = c;
        }
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[156]++;
    if (visit298_156_1(holder.childNodes.length)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[157]++;
      holder.insertAfter(prev);
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[161]++;
    tag.parentNode.removeChild(tag);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[168]++;
    S.each(recursives, function(r) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[5]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[169]++;
  fixCloseTagByDtd(r, opts);
});
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[172]++;
    return 1;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[179]++;
  function canHasNodeAsChild(tag, node) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[6]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[181]++;
    if (visit299_181_1(tag.nodeType == 9)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[182]++;
      return 1;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[184]++;
    if (visit300_184_1(!dtd[tag.tagName])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[185]++;
      S.error("dtd[" + tag.tagName + "] === undefined!");
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[187]++;
    if (visit301_187_1(node.nodeType == 8)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[188]++;
      return 1;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[190]++;
    var nodeName = visit302_190_1(node.tagName || node.nodeName);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[191]++;
    return !!dtd[tag.tagName][nodeName];
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[195]++;
  return {
  scan: function(tag, lexer, opts) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[7]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[198]++;
  function closeStackOpenTag(end, from) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[8]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[199]++;
    for (i = end; visit303_199_1(i > from); i--) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[200]++;
      var currentStackItem = stack[i], preStackItem = stack[i - 1];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[202]++;
      preStackItem.appendChild(currentStackItem);
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[203]++;
      fixCloseTagByDtd(currentStackItem, opts);
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[205]++;
    tag = stack[from];
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[206]++;
    stack.length = from;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[211]++;
  function processImpliedEndTag(node) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[9]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[212]++;
    var needFix = 0, endParentTagName;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[215]++;
    if (visit304_215_1(endParentTagName = impliedEndTag[node.tagName])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[216]++;
      var from = stack.length - 1, parent = stack[from];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[220]++;
      while (visit305_220_1(parent && !(parent.tagName in endParentTagName))) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[222]++;
        if (visit306_222_1(parent.tagName == node.tagName)) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[223]++;
          needFix = 1;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[224]++;
          break;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[226]++;
        from--;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[227]++;
        parent = stack[from];
      }
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[229]++;
      if (visit307_229_1(needFix)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[230]++;
        closeStackOpenTag(stack.length - 1, from - 1);
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[233]++;
    return needFix;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[236]++;
  var node, i, stack;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[241]++;
  stack = opts.stack = visit308_241_1(opts.stack || []);
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[242]++;
  do {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[243]++;
    node = lexer.nextNode();
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[244]++;
    if (visit309_244_1(node)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[245]++;
      if (visit310_245_1(node.nodeType === 1)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[247]++;
        if (visit311_247_1(node.isEndTag() && visit312_248_1(node.tagName == tag.tagName))) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[249]++;
          node = null;
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[250]++;
          if (visit313_250_1(!node.isEndTag())) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[252]++;
            if (visit314_252_1(SpecialScanners[node.tagName])) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[254]++;
              SpecialScanners[node.tagName].scan(node, lexer, opts);
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[255]++;
              tag.appendChild(node);
            } else {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[258]++;
              if (visit315_258_1(node.isSelfClosed)) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[259]++;
                tag.appendChild(node);
              } else {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[267]++;
                stack.push(tag);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[271]++;
                if (visit316_271_1(processImpliedEndTag(node))) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[272]++;
                  stack.push(tag);
                }
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[274]++;
                tag = node;
              }
            }
          } else {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[277]++;
            if (visit317_277_1(node.isEndTag())) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[293]++;
              var index = -1;
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[294]++;
              for (i = stack.length - 1; visit318_294_1(i >= 0); i--) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[295]++;
                var c = stack[i];
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[296]++;
                if (visit319_296_1(c.tagName === node.tagName)) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[297]++;
                  index = i;
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[298]++;
                  break;
                }
              }
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[302]++;
              if (visit320_302_1(index !== -1)) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[305]++;
                stack[stack.length - 1].appendChild(tag);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[306]++;
                fixCloseTagByDtd(tag, opts);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[307]++;
                closeStackOpenTag(stack.length - 1, index);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[308]++;
                node = null;
              } else {
              }
            }
          }
        }
      } else {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[315]++;
        tag.appendChild(node);
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[320]++;
    if (visit321_320_1(node == null)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[321]++;
      if (visit322_321_1(stack.length > 0)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[322]++;
        node = stack[stack.length - 1];
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[324]++;
        if (visit323_324_1(!SpecialScanners[node.tagName])) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[325]++;
          stack.length = stack.length - 1;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[326]++;
          node.appendChild(tag);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[328]++;
          fixCloseTagByDtd(tag, opts);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[329]++;
          tag = node;
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[331]++;
          node = null;
        }
      }
    }
  } while (node);
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[338]++;
  fixCloseTagByDtd(tag, opts);
}};
}, {
  requires: ["../dtd", "../nodes/tag", "./special-scanners"]});
