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
if (! _$jscoverage['/kison/lexer.js']) {
  _$jscoverage['/kison/lexer.js'] = {};
  _$jscoverage['/kison/lexer.js'].lineData = [];
  _$jscoverage['/kison/lexer.js'].lineData[6] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[7] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[8] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[10] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[11] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[12] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[16] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[17] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[20] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[21] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[22] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[23] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[26] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[29] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[30] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[31] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[36] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[38] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[39] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[41] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[42] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[46] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[47] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[49] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[50] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[57] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[58] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[61] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[68] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[84] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[86] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[93] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[96] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[102] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[106] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[121] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[124] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[125] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[126] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[127] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[129] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[130] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[131] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[132] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[134] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[136] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[140] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[153] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[154] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[155] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[157] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[160] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[161] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[162] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[163] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[166] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[167] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[170] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[172] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[174] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[176] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[178] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[179] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[180] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[183] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[184] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[186] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[187] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[188] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[189] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[192] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[193] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[196] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[199] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[201] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[204] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[205] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[206] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[210] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[214] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[218] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[219] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[221] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[222] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[223] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[224] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[225] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[227] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[228] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[231] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[235] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[239] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[240] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[241] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[242] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[244] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[248] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[253] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[255] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[259] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[261] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[265] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[267] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[268] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[271] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[275] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[279] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[280] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[281] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[282] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[286] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[287] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[289] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[294] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[296] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[297] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[299] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[303] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[312] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[314] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[315] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[318] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[319] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[321] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[325] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[326] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[327] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[328] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[330] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[338] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[340] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[343] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[345] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[347] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[348] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[349] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[350] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[352] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[354] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[355] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[357] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[358] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[361] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[368] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].functionData) {
  _$jscoverage['/kison/lexer.js'].functionData = [];
  _$jscoverage['/kison/lexer.js'].functionData[0] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[1] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[2] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[3] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[4] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[5] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[6] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[7] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[8] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[9] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[10] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[11] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[12] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[13] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[14] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[15] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[16] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[17] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[18] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[19] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[20] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[21] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['17'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['21'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['22'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['30'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['36'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['38'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['41'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['48'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['49'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['126'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['135'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['154'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['160'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['166'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['177'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['179'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['182'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['183'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['186'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['187'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['192'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['201'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['205'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['218'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['222'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['223'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['224'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['227'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['239'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['255'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['260'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['267'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['271'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['279'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['286'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['296'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['299'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['314'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['318'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['321'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['322'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['323'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['323'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['327'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['348'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['349'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['357'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['357'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['357'][1].init(1300, 3, 'ret');
function visit136_357_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['349'][1].init(1012, 17, 'ret === undefined');
function visit135_349_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['348'][1].init(958, 27, 'action && action.call(self)');
function visit134_348_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['327'][1].init(76, 5, 'lines');
function visit133_327_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['323'][2].init(133, 20, 'rule[2] || undefined');
function visit132_323_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['323'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['323'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit131_323_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['322'][1].init(65, 21, 'rule.token || rule[0]');
function visit130_322_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['321'][1].init(101, 22, 'rule.regexp || rule[1]');
function visit129_321_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['318'][1].init(403, 16, 'i < rules.length');
function visit128_318_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['314'][1].init(289, 6, '!input');
function visit127_314_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['299'][1].init(166, 55, 'stateMap[s] || (stateMap[s] = self.genShortId(\'state\'))');
function visit126_299_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['296'][1].init(91, 9, '!stateMap');
function visit125_296_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['286'][1].init(448, 16, 'reverseSymbolMap');
function visit124_286_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['279'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit123_279_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['271'][1].init(232, 58, 'symbolMap[t] || (symbolMap[t] = self.genShortId(\'symbol\'))');
function visit122_271_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['267'][1].init(93, 10, '!symbolMap');
function visit121_267_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['260'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit120_260_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['255'][1].init(348, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit119_255_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['239'][1].init(20, 8, 'num || 1');
function visit118_239_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['227'][1].init(236, 28, 'inArray(currentState, state)');
function visit117_227_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['224'][1].init(26, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit116_224_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['223'][1].init(68, 6, '!state');
function visit115_223_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['222'][1].init(30, 15, 'r.state || r[3]');
function visit114_222_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['218'][1].init(184, 13, 'self.mapState');
function visit113_218_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['205'][1].init(155, 13, 'compressState');
function visit112_205_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['201'][1].init(2330, 31, 'compressState || compressSymbol');
function visit111_201_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['192'][1].init(604, 5, 'state');
function visit110_192_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['187'][1].init(363, 22, 'compressState && state');
function visit109_187_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['186'][1].init(320, 11, 'action || 0');
function visit108_186_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['183'][1].init(175, 5, 'token');
function visit107_183_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['182'][1].init(105, 12, 'v.token || 0');
function visit106_182_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['179'][1].init(56, 13, 'v && v.regexp');
function visit105_179_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['177'][1].init(54, 31, 'compressState || compressSymbol');
function visit104_177_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['166'][1].init(964, 13, 'compressState');
function visit103_166_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['160'][1].init(762, 14, 'compressSymbol');
function visit102_160_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['154'][1].init(22, 59, 'name.match(/^(?:genCode|constructor|mapState|genShortId)$/)');
function visit101_154_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['135'][1].init(192, 10, 'index >= 0');
function visit100_135_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['126'][1].init(191, 16, '!(field in self)');
function visit99_126_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['49'][1].init(26, 42, 'fn.call(context, val, i, object) === false');
function visit98_49_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['48'][1].init(43, 10, 'i < length');
function visit97_48_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['41'][1].init(77, 52, 'fn.call(context, object[key], key, object) === false');
function visit96_41_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['38'][1].init(155, 16, '!isArray(object)');
function visit95_38_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['36'][1].init(119, 15, 'context || null');
function visit94_36_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['30'][1].init(14, 6, 'object');
function visit93_30_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['22'][1].init(18, 15, 'arr[i] === item');
function visit92_22_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['21'][1].init(42, 5, 'i < l');
function visit91_21_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['17'][1].init(17, 56, '\'[object Array]\' === Object.prototype.toString.call(obj)');
function visit90_17_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/lexer.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/kison/lexer.js'].lineData[10]++;
  function mix(to, from) {
    _$jscoverage['/kison/lexer.js'].functionData[1]++;
    _$jscoverage['/kison/lexer.js'].lineData[11]++;
    for (var f in from) {
      _$jscoverage['/kison/lexer.js'].lineData[12]++;
      to[f] = from[f];
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[16]++;
  function isArray(obj) {
    _$jscoverage['/kison/lexer.js'].functionData[2]++;
    _$jscoverage['/kison/lexer.js'].lineData[17]++;
    return visit90_17_1('[object Array]' === Object.prototype.toString.call(obj));
  }
  _$jscoverage['/kison/lexer.js'].lineData[20]++;
  function inArray(item, arr) {
    _$jscoverage['/kison/lexer.js'].functionData[3]++;
    _$jscoverage['/kison/lexer.js'].lineData[21]++;
    for (var i = 0, l = arr.length; visit91_21_1(i < l); i++) {
      _$jscoverage['/kison/lexer.js'].lineData[22]++;
      if (visit92_22_1(arr[i] === item)) {
        _$jscoverage['/kison/lexer.js'].lineData[23]++;
        return true;
      }
    }
    _$jscoverage['/kison/lexer.js'].lineData[26]++;
    return false;
  }
  _$jscoverage['/kison/lexer.js'].lineData[29]++;
  function each(object, fn, context) {
    _$jscoverage['/kison/lexer.js'].functionData[4]++;
    _$jscoverage['/kison/lexer.js'].lineData[30]++;
    if (visit93_30_1(object)) {
      _$jscoverage['/kison/lexer.js'].lineData[31]++;
      var key, val, length, i = 0;
      _$jscoverage['/kison/lexer.js'].lineData[36]++;
      context = visit94_36_1(context || null);
      _$jscoverage['/kison/lexer.js'].lineData[38]++;
      if (visit95_38_1(!isArray(object))) {
        _$jscoverage['/kison/lexer.js'].lineData[39]++;
        for (key in object) {
          _$jscoverage['/kison/lexer.js'].lineData[41]++;
          if (visit96_41_1(fn.call(context, object[key], key, object) === false)) {
            _$jscoverage['/kison/lexer.js'].lineData[42]++;
            break;
          }
        }
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[46]++;
        length = object.length;
        _$jscoverage['/kison/lexer.js'].lineData[47]++;
        for (val = object[0]; visit97_48_1(i < length); val = object[++i]) {
          _$jscoverage['/kison/lexer.js'].lineData[49]++;
          if (visit98_49_1(fn.call(context, val, i, object) === false)) {
            _$jscoverage['/kison/lexer.js'].lineData[50]++;
            break;
          }
        }
      }
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[57]++;
  function mapSymbolForCodeGen(t) {
    _$jscoverage['/kison/lexer.js'].functionData[5]++;
    _$jscoverage['/kison/lexer.js'].lineData[58]++;
    return this.symbolMap[t];
  }
  _$jscoverage['/kison/lexer.js'].lineData[61]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[68]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[84]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[86]++;
  mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[93]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[96]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[102]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[106]++;
  mix(this, {
  input: input, 
  matched: '', 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: '', 
  text: '', 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genShortId: function(field) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[121]++;
  var base = 97, max = 122, interval = max - base + 1;
  _$jscoverage['/kison/lexer.js'].lineData[124]++;
  field += '__gen';
  _$jscoverage['/kison/lexer.js'].lineData[125]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[126]++;
  if (visit99_126_1(!(field in self))) {
    _$jscoverage['/kison/lexer.js'].lineData[127]++;
    self[field] = -1;
  }
  _$jscoverage['/kison/lexer.js'].lineData[129]++;
  var index = self[field] = self[field] + 1;
  _$jscoverage['/kison/lexer.js'].lineData[130]++;
  var ret = '';
  _$jscoverage['/kison/lexer.js'].lineData[131]++;
  do {
    _$jscoverage['/kison/lexer.js'].lineData[132]++;
    ret = String.fromCharCode(base + index % interval) + ret;
    _$jscoverage['/kison/lexer.js'].lineData[134]++;
    index = Math.floor(index / interval) - 1;
  } while (visit100_135_1(index >= 0));
  _$jscoverage['/kison/lexer.js'].lineData[136]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[140]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = ['/*jslint quotmark: false*/', mix.toString(), isArray.toString(), each.toString(), inArray.toString()], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[153]++;
  var genPrototype = util.mix({}, Lexer.prototype, true, function(name, val) {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[154]++;
  if (visit101_154_1(name.match(/^(?:genCode|constructor|mapState|genShortId)$/))) {
    _$jscoverage['/kison/lexer.js'].lineData[155]++;
    return undefined;
  }
  _$jscoverage['/kison/lexer.js'].lineData[157]++;
  return val;
});
  _$jscoverage['/kison/lexer.js'].lineData[160]++;
  if (visit102_160_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[161]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[162]++;
    self.mapSymbol(STATIC.END_TAG);
    _$jscoverage['/kison/lexer.js'].lineData[163]++;
    genPrototype.mapSymbol = mapSymbolForCodeGen;
  }
  _$jscoverage['/kison/lexer.js'].lineData[166]++;
  if (visit103_166_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[167]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[170]++;
  code.push('var Lexer = ' + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[172]++;
  code.push('Lexer.prototype= ' + serializeObject(genPrototype) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[174]++;
  code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[176]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit104_177_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[178]++;
  var ret;
  _$jscoverage['/kison/lexer.js'].lineData[179]++;
  if (visit105_179_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[180]++;
    var state = v.state, action = v.action, token = visit106_182_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[183]++;
    if (visit107_183_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[184]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[186]++;
    ret = [token, v.regexp, visit108_186_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[187]++;
    if (visit109_187_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[188]++;
      state = util.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[189]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[192]++;
    if (visit110_192_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[193]++;
      ret.push(state);
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[196]++;
  return ret;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[199]++;
  code.push('var lexer = new Lexer(' + newCfg + ');');
  _$jscoverage['/kison/lexer.js'].lineData[201]++;
  if (visit111_201_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[204]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[205]++;
    if (visit112_205_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[206]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[210]++;
  return code.join('\n');
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[214]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[218]++;
  if (visit113_218_1(self.mapState)) {
    _$jscoverage['/kison/lexer.js'].lineData[219]++;
    currentState = self.mapState(currentState);
  }
  _$jscoverage['/kison/lexer.js'].lineData[221]++;
  each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[222]++;
  var state = visit114_222_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[223]++;
  if (visit115_223_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[224]++;
    if (visit116_224_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[225]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[227]++;
    if (visit117_227_1(inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[228]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[231]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[235]++;
  this.stateStack.push(state);
}, 
  popState: function(num) {
  _$jscoverage['/kison/lexer.js'].functionData[16]++;
  _$jscoverage['/kison/lexer.js'].lineData[239]++;
  num = visit118_239_1(num || 1);
  _$jscoverage['/kison/lexer.js'].lineData[240]++;
  var ret;
  _$jscoverage['/kison/lexer.js'].lineData[241]++;
  while (num--) {
    _$jscoverage['/kison/lexer.js'].lineData[242]++;
    ret = this.stateStack.pop();
  }
  _$jscoverage['/kison/lexer.js'].lineData[244]++;
  return ret;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[17]++;
  _$jscoverage['/kison/lexer.js'].lineData[248]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[253]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[255]++;
  var past = (visit119_255_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[259]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit120_260_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/kison/lexer.js'].lineData[261]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[18]++;
  _$jscoverage['/kison/lexer.js'].lineData[265]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[267]++;
  if (visit121_267_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[268]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[271]++;
  return visit122_271_1(symbolMap[t] || (symbolMap[t] = self.genShortId('symbol')));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[19]++;
  _$jscoverage['/kison/lexer.js'].lineData[275]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[279]++;
  if (visit123_279_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[280]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[281]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[282]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[286]++;
  if (visit124_286_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[287]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[289]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[20]++;
  _$jscoverage['/kison/lexer.js'].lineData[294]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[296]++;
  if (visit125_296_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[297]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[299]++;
  return visit126_299_1(stateMap[s] || (stateMap[s] = self.genShortId('state')));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[21]++;
  _$jscoverage['/kison/lexer.js'].lineData[303]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[312]++;
  self.match = self.text = '';
  _$jscoverage['/kison/lexer.js'].lineData[314]++;
  if (visit127_314_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[315]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[318]++;
  for (i = 0; visit128_318_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[319]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[321]++;
    var regexp = visit129_321_1(rule.regexp || rule[1]), token = visit130_322_1(rule.token || rule[0]), action = visit131_323_1(rule.action || visit132_323_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[325]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[326]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[327]++;
      if (visit133_327_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[328]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[330]++;
      mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[338]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[340]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[343]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[345]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[347]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[348]++;
      ret = visit134_348_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[349]++;
      if (visit135_349_1(ret === undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[350]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[352]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[354]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[355]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[357]++;
      if (visit136_357_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[358]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[361]++;
        return self.lex();
      }
    }
  }
}};
  _$jscoverage['/kison/lexer.js'].lineData[368]++;
  return Lexer;
});
