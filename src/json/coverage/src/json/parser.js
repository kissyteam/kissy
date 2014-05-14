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
if (! _$jscoverage['/json/parser.js']) {
  _$jscoverage['/json/parser.js'] = {};
  _$jscoverage['/json/parser.js'].lineData = [];
  _$jscoverage['/json/parser.js'].lineData[3] = 0;
  _$jscoverage['/json/parser.js'].lineData[6] = 0;
  _$jscoverage['/json/parser.js'].lineData[16] = 0;
  _$jscoverage['/json/parser.js'].lineData[17] = 0;
  _$jscoverage['/json/parser.js'].lineData[18] = 0;
  _$jscoverage['/json/parser.js'].lineData[22] = 0;
  _$jscoverage['/json/parser.js'].lineData[23] = 0;
  _$jscoverage['/json/parser.js'].lineData[26] = 0;
  _$jscoverage['/json/parser.js'].lineData[27] = 0;
  _$jscoverage['/json/parser.js'].lineData[28] = 0;
  _$jscoverage['/json/parser.js'].lineData[33] = 0;
  _$jscoverage['/json/parser.js'].lineData[35] = 0;
  _$jscoverage['/json/parser.js'].lineData[36] = 0;
  _$jscoverage['/json/parser.js'].lineData[38] = 0;
  _$jscoverage['/json/parser.js'].lineData[39] = 0;
  _$jscoverage['/json/parser.js'].lineData[43] = 0;
  _$jscoverage['/json/parser.js'].lineData[44] = 0;
  _$jscoverage['/json/parser.js'].lineData[45] = 0;
  _$jscoverage['/json/parser.js'].lineData[46] = 0;
  _$jscoverage['/json/parser.js'].lineData[53] = 0;
  _$jscoverage['/json/parser.js'].lineData[54] = 0;
  _$jscoverage['/json/parser.js'].lineData[55] = 0;
  _$jscoverage['/json/parser.js'].lineData[56] = 0;
  _$jscoverage['/json/parser.js'].lineData[59] = 0;
  _$jscoverage['/json/parser.js'].lineData[61] = 0;
  _$jscoverage['/json/parser.js'].lineData[63] = 0;
  _$jscoverage['/json/parser.js'].lineData[79] = 0;
  _$jscoverage['/json/parser.js'].lineData[81] = 0;
  _$jscoverage['/json/parser.js'].lineData[88] = 0;
  _$jscoverage['/json/parser.js'].lineData[90] = 0;
  _$jscoverage['/json/parser.js'].lineData[92] = 0;
  _$jscoverage['/json/parser.js'].lineData[106] = 0;
  _$jscoverage['/json/parser.js'].lineData[110] = 0;
  _$jscoverage['/json/parser.js'].lineData[111] = 0;
  _$jscoverage['/json/parser.js'].lineData[113] = 0;
  _$jscoverage['/json/parser.js'].lineData[114] = 0;
  _$jscoverage['/json/parser.js'].lineData[115] = 0;
  _$jscoverage['/json/parser.js'].lineData[116] = 0;
  _$jscoverage['/json/parser.js'].lineData[117] = 0;
  _$jscoverage['/json/parser.js'].lineData[119] = 0;
  _$jscoverage['/json/parser.js'].lineData[120] = 0;
  _$jscoverage['/json/parser.js'].lineData[123] = 0;
  _$jscoverage['/json/parser.js'].lineData[126] = 0;
  _$jscoverage['/json/parser.js'].lineData[129] = 0;
  _$jscoverage['/json/parser.js'].lineData[130] = 0;
  _$jscoverage['/json/parser.js'].lineData[131] = 0;
  _$jscoverage['/json/parser.js'].lineData[132] = 0;
  _$jscoverage['/json/parser.js'].lineData[134] = 0;
  _$jscoverage['/json/parser.js'].lineData[137] = 0;
  _$jscoverage['/json/parser.js'].lineData[142] = 0;
  _$jscoverage['/json/parser.js'].lineData[144] = 0;
  _$jscoverage['/json/parser.js'].lineData[148] = 0;
  _$jscoverage['/json/parser.js'].lineData[150] = 0;
  _$jscoverage['/json/parser.js'].lineData[153] = 0;
  _$jscoverage['/json/parser.js'].lineData[156] = 0;
  _$jscoverage['/json/parser.js'].lineData[160] = 0;
  _$jscoverage['/json/parser.js'].lineData[161] = 0;
  _$jscoverage['/json/parser.js'].lineData[162] = 0;
  _$jscoverage['/json/parser.js'].lineData[163] = 0;
  _$jscoverage['/json/parser.js'].lineData[167] = 0;
  _$jscoverage['/json/parser.js'].lineData[168] = 0;
  _$jscoverage['/json/parser.js'].lineData[170] = 0;
  _$jscoverage['/json/parser.js'].lineData[174] = 0;
  _$jscoverage['/json/parser.js'].lineData[183] = 0;
  _$jscoverage['/json/parser.js'].lineData[185] = 0;
  _$jscoverage['/json/parser.js'].lineData[186] = 0;
  _$jscoverage['/json/parser.js'].lineData[189] = 0;
  _$jscoverage['/json/parser.js'].lineData[190] = 0;
  _$jscoverage['/json/parser.js'].lineData[192] = 0;
  _$jscoverage['/json/parser.js'].lineData[196] = 0;
  _$jscoverage['/json/parser.js'].lineData[197] = 0;
  _$jscoverage['/json/parser.js'].lineData[198] = 0;
  _$jscoverage['/json/parser.js'].lineData[199] = 0;
  _$jscoverage['/json/parser.js'].lineData[201] = 0;
  _$jscoverage['/json/parser.js'].lineData[208] = 0;
  _$jscoverage['/json/parser.js'].lineData[210] = 0;
  _$jscoverage['/json/parser.js'].lineData[213] = 0;
  _$jscoverage['/json/parser.js'].lineData[215] = 0;
  _$jscoverage['/json/parser.js'].lineData[217] = 0;
  _$jscoverage['/json/parser.js'].lineData[218] = 0;
  _$jscoverage['/json/parser.js'].lineData[219] = 0;
  _$jscoverage['/json/parser.js'].lineData[220] = 0;
  _$jscoverage['/json/parser.js'].lineData[222] = 0;
  _$jscoverage['/json/parser.js'].lineData[224] = 0;
  _$jscoverage['/json/parser.js'].lineData[225] = 0;
  _$jscoverage['/json/parser.js'].lineData[227] = 0;
  _$jscoverage['/json/parser.js'].lineData[228] = 0;
  _$jscoverage['/json/parser.js'].lineData[231] = 0;
  _$jscoverage['/json/parser.js'].lineData[237] = 0;
  _$jscoverage['/json/parser.js'].lineData[242] = 0;
  _$jscoverage['/json/parser.js'].lineData[258] = 0;
  _$jscoverage['/json/parser.js'].lineData[259] = 0;
  _$jscoverage['/json/parser.js'].lineData[281] = 0;
  _$jscoverage['/json/parser.js'].lineData[285] = 0;
  _$jscoverage['/json/parser.js'].lineData[290] = 0;
  _$jscoverage['/json/parser.js'].lineData[295] = 0;
  _$jscoverage['/json/parser.js'].lineData[300] = 0;
  _$jscoverage['/json/parser.js'].lineData[305] = 0;
  _$jscoverage['/json/parser.js'].lineData[310] = 0;
  _$jscoverage['/json/parser.js'].lineData[315] = 0;
  _$jscoverage['/json/parser.js'].lineData[320] = 0;
  _$jscoverage['/json/parser.js'].lineData[325] = 0;
  _$jscoverage['/json/parser.js'].lineData[326] = 0;
  _$jscoverage['/json/parser.js'].lineData[331] = 0;
  _$jscoverage['/json/parser.js'].lineData[336] = 0;
  _$jscoverage['/json/parser.js'].lineData[341] = 0;
  _$jscoverage['/json/parser.js'].lineData[349] = 0;
  _$jscoverage['/json/parser.js'].lineData[350] = 0;
  _$jscoverage['/json/parser.js'].lineData[351] = 0;
  _$jscoverage['/json/parser.js'].lineData[356] = 0;
  _$jscoverage['/json/parser.js'].lineData[357] = 0;
  _$jscoverage['/json/parser.js'].lineData[362] = 0;
  _$jscoverage['/json/parser.js'].lineData[367] = 0;
  _$jscoverage['/json/parser.js'].lineData[371] = 0;
  _$jscoverage['/json/parser.js'].lineData[543] = 0;
  _$jscoverage['/json/parser.js'].lineData[544] = 0;
  _$jscoverage['/json/parser.js'].lineData[558] = 0;
  _$jscoverage['/json/parser.js'].lineData[560] = 0;
  _$jscoverage['/json/parser.js'].lineData[562] = 0;
  _$jscoverage['/json/parser.js'].lineData[564] = 0;
  _$jscoverage['/json/parser.js'].lineData[565] = 0;
  _$jscoverage['/json/parser.js'].lineData[568] = 0;
  _$jscoverage['/json/parser.js'].lineData[570] = 0;
  _$jscoverage['/json/parser.js'].lineData[572] = 0;
  _$jscoverage['/json/parser.js'].lineData[575] = 0;
  _$jscoverage['/json/parser.js'].lineData[576] = 0;
  _$jscoverage['/json/parser.js'].lineData[579] = 0;
  _$jscoverage['/json/parser.js'].lineData[580] = 0;
  _$jscoverage['/json/parser.js'].lineData[581] = 0;
  _$jscoverage['/json/parser.js'].lineData[584] = 0;
  _$jscoverage['/json/parser.js'].lineData[587] = 0;
  _$jscoverage['/json/parser.js'].lineData[590] = 0;
  _$jscoverage['/json/parser.js'].lineData[592] = 0;
  _$jscoverage['/json/parser.js'].lineData[594] = 0;
  _$jscoverage['/json/parser.js'].lineData[597] = 0;
  _$jscoverage['/json/parser.js'].lineData[600] = 0;
  _$jscoverage['/json/parser.js'].lineData[602] = 0;
  _$jscoverage['/json/parser.js'].lineData[605] = 0;
  _$jscoverage['/json/parser.js'].lineData[614] = 0;
  _$jscoverage['/json/parser.js'].lineData[616] = 0;
  _$jscoverage['/json/parser.js'].lineData[618] = 0;
  _$jscoverage['/json/parser.js'].lineData[619] = 0;
  _$jscoverage['/json/parser.js'].lineData[622] = 0;
  _$jscoverage['/json/parser.js'].lineData[623] = 0;
  _$jscoverage['/json/parser.js'].lineData[626] = 0;
  _$jscoverage['/json/parser.js'].lineData[627] = 0;
  _$jscoverage['/json/parser.js'].lineData[629] = 0;
  _$jscoverage['/json/parser.js'].lineData[632] = 0;
  _$jscoverage['/json/parser.js'].lineData[633] = 0;
  _$jscoverage['/json/parser.js'].lineData[635] = 0;
  _$jscoverage['/json/parser.js'].lineData[637] = 0;
  _$jscoverage['/json/parser.js'].lineData[639] = 0;
  _$jscoverage['/json/parser.js'].lineData[641] = 0;
  _$jscoverage['/json/parser.js'].lineData[643] = 0;
  _$jscoverage['/json/parser.js'].lineData[646] = 0;
  _$jscoverage['/json/parser.js'].lineData[650] = 0;
}
if (! _$jscoverage['/json/parser.js'].functionData) {
  _$jscoverage['/json/parser.js'].functionData = [];
  _$jscoverage['/json/parser.js'].functionData[0] = 0;
  _$jscoverage['/json/parser.js'].functionData[1] = 0;
  _$jscoverage['/json/parser.js'].functionData[2] = 0;
  _$jscoverage['/json/parser.js'].functionData[3] = 0;
  _$jscoverage['/json/parser.js'].functionData[4] = 0;
  _$jscoverage['/json/parser.js'].functionData[5] = 0;
  _$jscoverage['/json/parser.js'].functionData[6] = 0;
  _$jscoverage['/json/parser.js'].functionData[7] = 0;
  _$jscoverage['/json/parser.js'].functionData[8] = 0;
  _$jscoverage['/json/parser.js'].functionData[9] = 0;
  _$jscoverage['/json/parser.js'].functionData[10] = 0;
  _$jscoverage['/json/parser.js'].functionData[11] = 0;
  _$jscoverage['/json/parser.js'].functionData[12] = 0;
  _$jscoverage['/json/parser.js'].functionData[13] = 0;
  _$jscoverage['/json/parser.js'].functionData[14] = 0;
  _$jscoverage['/json/parser.js'].functionData[15] = 0;
  _$jscoverage['/json/parser.js'].functionData[16] = 0;
  _$jscoverage['/json/parser.js'].functionData[17] = 0;
  _$jscoverage['/json/parser.js'].functionData[18] = 0;
  _$jscoverage['/json/parser.js'].functionData[19] = 0;
  _$jscoverage['/json/parser.js'].functionData[20] = 0;
  _$jscoverage['/json/parser.js'].functionData[21] = 0;
  _$jscoverage['/json/parser.js'].functionData[22] = 0;
  _$jscoverage['/json/parser.js'].functionData[23] = 0;
  _$jscoverage['/json/parser.js'].functionData[24] = 0;
  _$jscoverage['/json/parser.js'].functionData[25] = 0;
  _$jscoverage['/json/parser.js'].functionData[26] = 0;
  _$jscoverage['/json/parser.js'].functionData[27] = 0;
  _$jscoverage['/json/parser.js'].functionData[28] = 0;
  _$jscoverage['/json/parser.js'].functionData[29] = 0;
  _$jscoverage['/json/parser.js'].functionData[30] = 0;
  _$jscoverage['/json/parser.js'].functionData[31] = 0;
}
if (! _$jscoverage['/json/parser.js'].branchData) {
  _$jscoverage['/json/parser.js'].branchData = {};
  _$jscoverage['/json/parser.js'].branchData['23'] = [];
  _$jscoverage['/json/parser.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['27'] = [];
  _$jscoverage['/json/parser.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['33'] = [];
  _$jscoverage['/json/parser.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['35'] = [];
  _$jscoverage['/json/parser.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['38'] = [];
  _$jscoverage['/json/parser.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['44'] = [];
  _$jscoverage['/json/parser.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['45'] = [];
  _$jscoverage['/json/parser.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['54'] = [];
  _$jscoverage['/json/parser.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['55'] = [];
  _$jscoverage['/json/parser.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['110'] = [];
  _$jscoverage['/json/parser.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['114'] = [];
  _$jscoverage['/json/parser.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['115'] = [];
  _$jscoverage['/json/parser.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['116'] = [];
  _$jscoverage['/json/parser.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['119'] = [];
  _$jscoverage['/json/parser.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['129'] = [];
  _$jscoverage['/json/parser.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['144'] = [];
  _$jscoverage['/json/parser.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['149'] = [];
  _$jscoverage['/json/parser.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['160'] = [];
  _$jscoverage['/json/parser.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['167'] = [];
  _$jscoverage['/json/parser.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['185'] = [];
  _$jscoverage['/json/parser.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['189'] = [];
  _$jscoverage['/json/parser.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['192'] = [];
  _$jscoverage['/json/parser.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['193'] = [];
  _$jscoverage['/json/parser.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['194'] = [];
  _$jscoverage['/json/parser.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['198'] = [];
  _$jscoverage['/json/parser.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['218'] = [];
  _$jscoverage['/json/parser.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['219'] = [];
  _$jscoverage['/json/parser.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['227'] = [];
  _$jscoverage['/json/parser.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['310'] = [];
  _$jscoverage['/json/parser.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['564'] = [];
  _$jscoverage['/json/parser.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['568'] = [];
  _$jscoverage['/json/parser.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['570'] = [];
  _$jscoverage['/json/parser.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['575'] = [];
  _$jscoverage['/json/parser.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['579'] = [];
  _$jscoverage['/json/parser.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['606'] = [];
  _$jscoverage['/json/parser.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['607'] = [];
  _$jscoverage['/json/parser.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['608'] = [];
  _$jscoverage['/json/parser.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['618'] = [];
  _$jscoverage['/json/parser.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['622'] = [];
  _$jscoverage['/json/parser.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['626'] = [];
  _$jscoverage['/json/parser.js'].branchData['626'][1] = new BranchData();
}
_$jscoverage['/json/parser.js'].branchData['626'][1].init(841, 17, 'ret !== undefined');
function visit48_626_1(result) {
  _$jscoverage['/json/parser.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['622'][1].init(733, 13, 'reducedAction');
function visit47_622_1(result) {
  _$jscoverage['/json/parser.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['618'][1].init(595, 7, 'i < len');
function visit46_618_1(result) {
  _$jscoverage['/json/parser.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['608'][1].init(245, 31, 'production.rhs || production[1]');
function visit45_608_1(result) {
  _$jscoverage['/json/parser.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['607'][1].init(176, 34, 'production.action || production[2]');
function visit44_607_1(result) {
  _$jscoverage['/json/parser.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['606'][1].init(104, 34, 'production.symbol || production[0]');
function visit43_606_1(result) {
  _$jscoverage['/json/parser.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['579'][1].init(116, 18, 'tableAction[state]');
function visit42_579_1(result) {
  _$jscoverage['/json/parser.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['575'][1].init(431, 7, '!action');
function visit41_575_1(result) {
  _$jscoverage['/json/parser.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['570'][1].init(91, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit40_570_1(result) {
  _$jscoverage['/json/parser.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['568'][1].init(198, 6, 'symbol');
function visit39_568_1(result) {
  _$jscoverage['/json/parser.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['564'][1].init(118, 7, '!symbol');
function visit38_564_1(result) {
  _$jscoverage['/json/parser.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['310'][1].init(24, 18, 'this.$1 === \'true\'');
function visit37_310_1(result) {
  _$jscoverage['/json/parser.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['227'][1].init(1240, 3, 'ret');
function visit36_227_1(result) {
  _$jscoverage['/json/parser.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['219'][1].init(960, 17, 'ret === undefined');
function visit35_219_1(result) {
  _$jscoverage['/json/parser.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['218'][1].init(907, 27, 'action && action.call(self)');
function visit34_218_1(result) {
  _$jscoverage['/json/parser.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['198'][1].init(74, 5, 'lines');
function visit33_198_1(result) {
  _$jscoverage['/json/parser.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['194'][2].init(131, 20, 'rule[2] || undefined');
function visit32_194_2(result) {
  _$jscoverage['/json/parser.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['194'][1].init(116, 35, 'rule.action || rule[2] || undefined');
function visit31_194_1(result) {
  _$jscoverage['/json/parser.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['193'][1].init(64, 21, 'rule.token || rule[0]');
function visit30_193_1(result) {
  _$jscoverage['/json/parser.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['192'][1].init(98, 22, 'rule.regexp || rule[1]');
function visit29_192_1(result) {
  _$jscoverage['/json/parser.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['189'][1].init(387, 16, 'i < rules.length');
function visit28_189_1(result) {
  _$jscoverage['/json/parser.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['185'][1].init(277, 6, '!input');
function visit27_185_1(result) {
  _$jscoverage['/json/parser.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['167'][1].init(436, 16, 'reverseSymbolMap');
function visit26_167_1(result) {
  _$jscoverage['/json/parser.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['160'][1].init(167, 30, '!reverseSymbolMap && symbolMap');
function visit25_160_1(result) {
  _$jscoverage['/json/parser.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['149'][1].init(53, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit24_149_1(result) {
  _$jscoverage['/json/parser.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['144'][1].init(340, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit23_144_1(result) {
  _$jscoverage['/json/parser.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['129'][1].init(19, 8, 'num || 1');
function visit22_129_1(result) {
  _$jscoverage['/json/parser.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['119'][1].init(230, 28, 'inArray(currentState, state)');
function visit21_119_1(result) {
  _$jscoverage['/json/parser.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['116'][1].init(25, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit20_116_1(result) {
  _$jscoverage['/json/parser.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['115'][1].init(66, 6, '!state');
function visit19_115_1(result) {
  _$jscoverage['/json/parser.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['114'][1].init(29, 15, 'r.state || r[3]');
function visit18_114_1(result) {
  _$jscoverage['/json/parser.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['110'][1].init(179, 13, 'self.mapState');
function visit17_110_1(result) {
  _$jscoverage['/json/parser.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['55'][1].init(17, 15, 'arr[i] === item');
function visit16_55_1(result) {
  _$jscoverage['/json/parser.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['54'][1].init(41, 5, 'i < l');
function visit15_54_1(result) {
  _$jscoverage['/json/parser.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['45'][1].init(25, 42, 'fn.call(context, val, i, object) === false');
function visit14_45_1(result) {
  _$jscoverage['/json/parser.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['44'][1].init(79, 10, 'i < length');
function visit13_44_1(result) {
  _$jscoverage['/json/parser.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['38'][1].init(75, 52, 'fn.call(context, object[key], key, object) === false');
function visit12_38_1(result) {
  _$jscoverage['/json/parser.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['35'][1].init(147, 16, '!isArray(object)');
function visit11_35_1(result) {
  _$jscoverage['/json/parser.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['33'][1].init(113, 15, 'context || null');
function visit10_33_1(result) {
  _$jscoverage['/json/parser.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['27'][1].init(13, 6, 'object');
function visit9_27_1(result) {
  _$jscoverage['/json/parser.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['23'][1].init(16, 56, '\'[object Array]\' === Object.prototype.toString.call(obj)');
function visit8_23_1(result) {
  _$jscoverage['/json/parser.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].lineData[3]++;
KISSY.add(function(_, undefined) {
  _$jscoverage['/json/parser.js'].functionData[0]++;
  _$jscoverage['/json/parser.js'].lineData[6]++;
  var parser = {}, GrammarConst = {
  'SHIFT_TYPE': 1, 
  'REDUCE_TYPE': 2, 
  'ACCEPT_TYPE': 0, 
  'TYPE_INDEX': 0, 
  'PRODUCTION_INDEX': 1, 
  'TO_INDEX': 2};
  _$jscoverage['/json/parser.js'].lineData[16]++;
  function mix(to, from) {
    _$jscoverage['/json/parser.js'].functionData[1]++;
    _$jscoverage['/json/parser.js'].lineData[17]++;
    for (var f in from) {
      _$jscoverage['/json/parser.js'].lineData[18]++;
      to[f] = from[f];
    }
  }
  _$jscoverage['/json/parser.js'].lineData[22]++;
  function isArray(obj) {
    _$jscoverage['/json/parser.js'].functionData[2]++;
    _$jscoverage['/json/parser.js'].lineData[23]++;
    return visit8_23_1('[object Array]' === Object.prototype.toString.call(obj));
  }
  _$jscoverage['/json/parser.js'].lineData[26]++;
  function each(object, fn, context) {
    _$jscoverage['/json/parser.js'].functionData[3]++;
    _$jscoverage['/json/parser.js'].lineData[27]++;
    if (visit9_27_1(object)) {
      _$jscoverage['/json/parser.js'].lineData[28]++;
      var key, val, length, i = 0;
      _$jscoverage['/json/parser.js'].lineData[33]++;
      context = visit10_33_1(context || null);
      _$jscoverage['/json/parser.js'].lineData[35]++;
      if (visit11_35_1(!isArray(object))) {
        _$jscoverage['/json/parser.js'].lineData[36]++;
        for (key in object) {
          _$jscoverage['/json/parser.js'].lineData[38]++;
          if (visit12_38_1(fn.call(context, object[key], key, object) === false)) {
            _$jscoverage['/json/parser.js'].lineData[39]++;
            break;
          }
        }
      } else {
        _$jscoverage['/json/parser.js'].lineData[43]++;
        length = object.length;
        _$jscoverage['/json/parser.js'].lineData[44]++;
        for (val = object[0]; visit13_44_1(i < length); val = object[++i]) {
          _$jscoverage['/json/parser.js'].lineData[45]++;
          if (visit14_45_1(fn.call(context, val, i, object) === false)) {
            _$jscoverage['/json/parser.js'].lineData[46]++;
            break;
          }
        }
      }
    }
  }
  _$jscoverage['/json/parser.js'].lineData[53]++;
  function inArray(item, arr) {
    _$jscoverage['/json/parser.js'].functionData[4]++;
    _$jscoverage['/json/parser.js'].lineData[54]++;
    for (var i = 0, l = arr.length; visit15_54_1(i < l); i++) {
      _$jscoverage['/json/parser.js'].lineData[55]++;
      if (visit16_55_1(arr[i] === item)) {
        _$jscoverage['/json/parser.js'].lineData[56]++;
        return true;
      }
    }
    _$jscoverage['/json/parser.js'].lineData[59]++;
    return false;
  }
  _$jscoverage['/json/parser.js'].lineData[61]++;
  var Lexer = function Lexer(cfg) {
  _$jscoverage['/json/parser.js'].functionData[5]++;
  _$jscoverage['/json/parser.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/json/parser.js'].lineData[79]++;
  self.rules = [];
  _$jscoverage['/json/parser.js'].lineData[81]++;
  mix(self, cfg);
  _$jscoverage['/json/parser.js'].lineData[88]++;
  self.resetInput(self.input);
};
  _$jscoverage['/json/parser.js'].lineData[90]++;
  Lexer.prototype = {
  'resetInput': function(input) {
  _$jscoverage['/json/parser.js'].functionData[6]++;
  _$jscoverage['/json/parser.js'].lineData[92]++;
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
  'getCurrentRules': function() {
  _$jscoverage['/json/parser.js'].functionData[7]++;
  _$jscoverage['/json/parser.js'].lineData[106]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/json/parser.js'].lineData[110]++;
  if (visit17_110_1(self.mapState)) {
    _$jscoverage['/json/parser.js'].lineData[111]++;
    currentState = self.mapState(currentState);
  }
  _$jscoverage['/json/parser.js'].lineData[113]++;
  each(self.rules, function(r) {
  _$jscoverage['/json/parser.js'].functionData[8]++;
  _$jscoverage['/json/parser.js'].lineData[114]++;
  var state = visit18_114_1(r.state || r[3]);
  _$jscoverage['/json/parser.js'].lineData[115]++;
  if (visit19_115_1(!state)) {
    _$jscoverage['/json/parser.js'].lineData[116]++;
    if (visit20_116_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/json/parser.js'].lineData[117]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/json/parser.js'].lineData[119]++;
    if (visit21_119_1(inArray(currentState, state))) {
      _$jscoverage['/json/parser.js'].lineData[120]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/json/parser.js'].lineData[123]++;
  return rules;
}, 
  'pushState': function(state) {
  _$jscoverage['/json/parser.js'].functionData[9]++;
  _$jscoverage['/json/parser.js'].lineData[126]++;
  this.stateStack.push(state);
}, 
  'popState': function(num) {
  _$jscoverage['/json/parser.js'].functionData[10]++;
  _$jscoverage['/json/parser.js'].lineData[129]++;
  num = visit22_129_1(num || 1);
  _$jscoverage['/json/parser.js'].lineData[130]++;
  var ret;
  _$jscoverage['/json/parser.js'].lineData[131]++;
  while (num--) {
    _$jscoverage['/json/parser.js'].lineData[132]++;
    ret = this.stateStack.pop();
  }
  _$jscoverage['/json/parser.js'].lineData[134]++;
  return ret;
}, 
  'showDebugInfo': function() {
  _$jscoverage['/json/parser.js'].functionData[11]++;
  _$jscoverage['/json/parser.js'].lineData[137]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/json/parser.js'].lineData[142]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/json/parser.js'].lineData[144]++;
  var past = (visit23_144_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/json/parser.js'].lineData[148]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit24_149_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/json/parser.js'].lineData[150]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  'mapSymbol': function mapSymbolForCodeGen(t) {
  _$jscoverage['/json/parser.js'].functionData[12]++;
  _$jscoverage['/json/parser.js'].lineData[153]++;
  return this.symbolMap[t];
}, 
  'mapReverseSymbol': function(rs) {
  _$jscoverage['/json/parser.js'].functionData[13]++;
  _$jscoverage['/json/parser.js'].lineData[156]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/json/parser.js'].lineData[160]++;
  if (visit25_160_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/json/parser.js'].lineData[161]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/json/parser.js'].lineData[162]++;
    for (i in symbolMap) {
      _$jscoverage['/json/parser.js'].lineData[163]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/json/parser.js'].lineData[167]++;
  if (visit26_167_1(reverseSymbolMap)) {
    _$jscoverage['/json/parser.js'].lineData[168]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/json/parser.js'].lineData[170]++;
    return rs;
  }
}, 
  'lex': function() {
  _$jscoverage['/json/parser.js'].functionData[14]++;
  _$jscoverage['/json/parser.js'].lineData[174]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/json/parser.js'].lineData[183]++;
  self.match = self.text = '';
  _$jscoverage['/json/parser.js'].lineData[185]++;
  if (visit27_185_1(!input)) {
    _$jscoverage['/json/parser.js'].lineData[186]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/json/parser.js'].lineData[189]++;
  for (i = 0; visit28_189_1(i < rules.length); i++) {
    _$jscoverage['/json/parser.js'].lineData[190]++;
    rule = rules[i];
    _$jscoverage['/json/parser.js'].lineData[192]++;
    var regexp = visit29_192_1(rule.regexp || rule[1]), token = visit30_193_1(rule.token || rule[0]), action = visit31_194_1(rule.action || visit32_194_2(rule[2] || undefined));
    _$jscoverage['/json/parser.js'].lineData[196]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/json/parser.js'].lineData[197]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/json/parser.js'].lineData[198]++;
      if (visit33_198_1(lines)) {
        _$jscoverage['/json/parser.js'].lineData[199]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/json/parser.js'].lineData[201]++;
      mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/json/parser.js'].lineData[208]++;
      var match;
      _$jscoverage['/json/parser.js'].lineData[210]++;
      match = self.match = m[0];
      _$jscoverage['/json/parser.js'].lineData[213]++;
      self.matches = m;
      _$jscoverage['/json/parser.js'].lineData[215]++;
      self.text = match;
      _$jscoverage['/json/parser.js'].lineData[217]++;
      self.matched += match;
      _$jscoverage['/json/parser.js'].lineData[218]++;
      ret = visit34_218_1(action && action.call(self));
      _$jscoverage['/json/parser.js'].lineData[219]++;
      if (visit35_219_1(ret === undefined)) {
        _$jscoverage['/json/parser.js'].lineData[220]++;
        ret = token;
      } else {
        _$jscoverage['/json/parser.js'].lineData[222]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/json/parser.js'].lineData[224]++;
      input = input.slice(match.length);
      _$jscoverage['/json/parser.js'].lineData[225]++;
      self.input = input;
      _$jscoverage['/json/parser.js'].lineData[227]++;
      if (visit36_227_1(ret)) {
        _$jscoverage['/json/parser.js'].lineData[228]++;
        return ret;
      } else {
        _$jscoverage['/json/parser.js'].lineData[231]++;
        return self.lex();
      }
    }
  }
}};
  _$jscoverage['/json/parser.js'].lineData[237]++;
  Lexer.STATIC = {
  'INITIAL': 'I', 
  'DEBUG_CONTEXT_LIMIT': 20, 
  'END_TAG': '$EOF'};
  _$jscoverage['/json/parser.js'].lineData[242]++;
  var lexer = new Lexer({
  'rules': [['b', /^"(\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\u[0-9a-zA-Z]{4}|[^\\"\x00-\x1f])*"/, 0], [0, /^[\t\r\n\x20]/, 0], ['c', /^,/, 0], ['d', /^:/, 0], ['e', /^\[/, 0], ['f', /^\]/, 0], ['g', /^\{/, 0], ['h', /^\}/, 0], ['i', /^-?\d+(?:\.\d+)?(?:e-?\d+)?/i, 0], ['j', /^true|false/, 0], ['k', /^null/, 0], ['l', /^./, 0]]});
  _$jscoverage['/json/parser.js'].lineData[258]++;
  parser.lexer = lexer;
  _$jscoverage['/json/parser.js'].lineData[259]++;
  lexer.symbolMap = {
  '$EOF': 'a', 
  'STRING': 'b', 
  'COMMA': 'c', 
  'COLON': 'd', 
  'LEFT_BRACKET': 'e', 
  'RIGHT_BRACKET': 'f', 
  'LEFT_BRACE': 'g', 
  'RIGHT_BRACE': 'h', 
  'NUMBER': 'i', 
  'BOOLEAN': 'j', 
  'NULL': 'k', 
  'INVALID': 'l', 
  '$START': 'm', 
  'json': 'n', 
  'value': 'o', 
  'object': 'p', 
  'array': 'q', 
  'elementList': 'r', 
  'member': 's', 
  'memberList': 't'};
  _$jscoverage['/json/parser.js'].lineData[281]++;
  parser.productions = [['m', ['n']], ['n', ['o'], function() {
  _$jscoverage['/json/parser.js'].functionData[15]++;
  _$jscoverage['/json/parser.js'].lineData[285]++;
  return this.$1;
}], ['o', ['b'], function() {
  _$jscoverage['/json/parser.js'].functionData[16]++;
  _$jscoverage['/json/parser.js'].lineData[290]++;
  return this.yy.unQuote(this.$1);
}], ['o', ['i'], function() {
  _$jscoverage['/json/parser.js'].functionData[17]++;
  _$jscoverage['/json/parser.js'].lineData[295]++;
  return parseFloat(this.$1);
}], ['o', ['p'], function() {
  _$jscoverage['/json/parser.js'].functionData[18]++;
  _$jscoverage['/json/parser.js'].lineData[300]++;
  return this.$1;
}], ['o', ['q'], function() {
  _$jscoverage['/json/parser.js'].functionData[19]++;
  _$jscoverage['/json/parser.js'].lineData[305]++;
  return this.$1;
}], ['o', ['j'], function() {
  _$jscoverage['/json/parser.js'].functionData[20]++;
  _$jscoverage['/json/parser.js'].lineData[310]++;
  return visit37_310_1(this.$1 === 'true');
}], ['o', ['k'], function() {
  _$jscoverage['/json/parser.js'].functionData[21]++;
  _$jscoverage['/json/parser.js'].lineData[315]++;
  return null;
}], ['r', ['o'], function() {
  _$jscoverage['/json/parser.js'].functionData[22]++;
  _$jscoverage['/json/parser.js'].lineData[320]++;
  return [this.$1];
}], ['r', ['r', 'c', 'o'], function() {
  _$jscoverage['/json/parser.js'].functionData[23]++;
  _$jscoverage['/json/parser.js'].lineData[325]++;
  this.$1[this.$1.length] = this.$3;
  _$jscoverage['/json/parser.js'].lineData[326]++;
  return this.$1;
}], ['q', ['e', 'f'], function() {
  _$jscoverage['/json/parser.js'].functionData[24]++;
  _$jscoverage['/json/parser.js'].lineData[331]++;
  return [];
}], ['q', ['e', 'r', 'f'], function() {
  _$jscoverage['/json/parser.js'].functionData[25]++;
  _$jscoverage['/json/parser.js'].lineData[336]++;
  return this.$2;
}], ['s', ['b', 'd', 'o'], function() {
  _$jscoverage['/json/parser.js'].functionData[26]++;
  _$jscoverage['/json/parser.js'].lineData[341]++;
  return {
  key: this.yy.unQuote(this.$1), 
  value: this.$3};
}], ['t', ['s'], function() {
  _$jscoverage['/json/parser.js'].functionData[27]++;
  _$jscoverage['/json/parser.js'].lineData[349]++;
  var ret = {};
  _$jscoverage['/json/parser.js'].lineData[350]++;
  ret[this.$1.key] = this.$1.value;
  _$jscoverage['/json/parser.js'].lineData[351]++;
  return ret;
}], ['t', ['t', 'c', 's'], function() {
  _$jscoverage['/json/parser.js'].functionData[28]++;
  _$jscoverage['/json/parser.js'].lineData[356]++;
  this.$1[this.$3.key] = this.$3.value;
  _$jscoverage['/json/parser.js'].lineData[357]++;
  return this.$1;
}], ['p', ['g', 'h'], function() {
  _$jscoverage['/json/parser.js'].functionData[29]++;
  _$jscoverage['/json/parser.js'].lineData[362]++;
  return {};
}], ['p', ['g', 't', 'h'], function() {
  _$jscoverage['/json/parser.js'].functionData[30]++;
  _$jscoverage['/json/parser.js'].lineData[367]++;
  return this.$2;
}]];
  _$jscoverage['/json/parser.js'].lineData[371]++;
  parser.table = {
  'gotos': {
  '0': {
  'n': 7, 
  'o': 8, 
  'q': 9, 
  'p': 10}, 
  '2': {
  'o': 12, 
  'r': 13, 
  'q': 9, 
  'p': 10}, 
  '3': {
  's': 16, 
  't': 17}, 
  '18': {
  'o': 23, 
  'q': 9, 
  'p': 10}, 
  '20': {
  'o': 24, 
  'q': 9, 
  'p': 10}, 
  '21': {
  's': 25}}, 
  'action': {
  '0': {
  'b': [1, undefined, 1], 
  'e': [1, undefined, 2], 
  'g': [1, undefined, 3], 
  'i': [1, undefined, 4], 
  'j': [1, undefined, 5], 
  'k': [1, undefined, 6]}, 
  '1': {
  'a': [2, 2], 
  'f': [2, 2], 
  'c': [2, 2], 
  'h': [2, 2]}, 
  '2': {
  'b': [1, undefined, 1], 
  'e': [1, undefined, 2], 
  'f': [1, undefined, 11], 
  'g': [1, undefined, 3], 
  'i': [1, undefined, 4], 
  'j': [1, undefined, 5], 
  'k': [1, undefined, 6]}, 
  '3': {
  'b': [1, undefined, 14], 
  'h': [1, undefined, 15]}, 
  '4': {
  'a': [2, 3], 
  'f': [2, 3], 
  'c': [2, 3], 
  'h': [2, 3]}, 
  '5': {
  'a': [2, 6], 
  'f': [2, 6], 
  'c': [2, 6], 
  'h': [2, 6]}, 
  '6': {
  'a': [2, 7], 
  'f': [2, 7], 
  'c': [2, 7], 
  'h': [2, 7]}, 
  '7': {
  'a': [0]}, 
  '8': {
  'a': [2, 1]}, 
  '9': {
  'a': [2, 5], 
  'f': [2, 5], 
  'c': [2, 5], 
  'h': [2, 5]}, 
  '10': {
  'a': [2, 4], 
  'f': [2, 4], 
  'c': [2, 4], 
  'h': [2, 4]}, 
  '11': {
  'a': [2, 10], 
  'f': [2, 10], 
  'c': [2, 10], 
  'h': [2, 10]}, 
  '12': {
  'f': [2, 8], 
  'c': [2, 8]}, 
  '13': {
  'c': [1, undefined, 18], 
  'f': [1, undefined, 19]}, 
  '14': {
  'd': [1, undefined, 20]}, 
  '15': {
  'a': [2, 15], 
  'f': [2, 15], 
  'c': [2, 15], 
  'h': [2, 15]}, 
  '16': {
  'h': [2, 13], 
  'c': [2, 13]}, 
  '17': {
  'c': [1, undefined, 21], 
  'h': [1, undefined, 22]}, 
  '18': {
  'b': [1, undefined, 1], 
  'e': [1, undefined, 2], 
  'g': [1, undefined, 3], 
  'i': [1, undefined, 4], 
  'j': [1, undefined, 5], 
  'k': [1, undefined, 6]}, 
  '19': {
  'a': [2, 11], 
  'f': [2, 11], 
  'c': [2, 11], 
  'h': [2, 11]}, 
  '20': {
  'b': [1, undefined, 1], 
  'e': [1, undefined, 2], 
  'g': [1, undefined, 3], 
  'i': [1, undefined, 4], 
  'j': [1, undefined, 5], 
  'k': [1, undefined, 6]}, 
  '21': {
  'b': [1, undefined, 14]}, 
  '22': {
  'a': [2, 16], 
  'f': [2, 16], 
  'c': [2, 16], 
  'h': [2, 16]}, 
  '23': {
  'f': [2, 9], 
  'c': [2, 9]}, 
  '24': {
  'h': [2, 12], 
  'c': [2, 12]}, 
  '25': {
  'h': [2, 14], 
  'c': [2, 14]}}};
  _$jscoverage['/json/parser.js'].lineData[543]++;
  parser.parse = function parse(input, filename) {
  _$jscoverage['/json/parser.js'].functionData[31]++;
  _$jscoverage['/json/parser.js'].lineData[544]++;
  var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], prefix = filename ? ('in file: ' + filename + ' ') : '', stack = [0];
  _$jscoverage['/json/parser.js'].lineData[558]++;
  lexer.resetInput(input);
  _$jscoverage['/json/parser.js'].lineData[560]++;
  while (1) {
    _$jscoverage['/json/parser.js'].lineData[562]++;
    state = stack[stack.length - 1];
    _$jscoverage['/json/parser.js'].lineData[564]++;
    if (visit38_564_1(!symbol)) {
      _$jscoverage['/json/parser.js'].lineData[565]++;
      symbol = lexer.lex();
    }
    _$jscoverage['/json/parser.js'].lineData[568]++;
    if (visit39_568_1(symbol)) {
      _$jscoverage['/json/parser.js'].lineData[570]++;
      action = visit40_570_1(tableAction[state] && tableAction[state][symbol]);
    } else {
      _$jscoverage['/json/parser.js'].lineData[572]++;
      action = null;
    }
    _$jscoverage['/json/parser.js'].lineData[575]++;
    if (visit41_575_1(!action)) {
      _$jscoverage['/json/parser.js'].lineData[576]++;
      var expected = [], error;
      _$jscoverage['/json/parser.js'].lineData[579]++;
      if (visit42_579_1(tableAction[state])) {
        _$jscoverage['/json/parser.js'].lineData[580]++;
        for (var symbolForState in tableAction[state]) {
          _$jscoverage['/json/parser.js'].lineData[581]++;
          expected.push(self.lexer.mapReverseSymbol(symbolForState));
        }
      }
      _$jscoverage['/json/parser.js'].lineData[584]++;
      error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
      _$jscoverage['/json/parser.js'].lineData[587]++;
      throw new Error(error);
    }
    _$jscoverage['/json/parser.js'].lineData[590]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/json/parser.js'].lineData[592]++;
        stack.push(symbol);
        _$jscoverage['/json/parser.js'].lineData[594]++;
        valueStack.push(lexer.text);
        _$jscoverage['/json/parser.js'].lineData[597]++;
        stack.push(action[GrammarConst.TO_INDEX]);
        _$jscoverage['/json/parser.js'].lineData[600]++;
        symbol = null;
        _$jscoverage['/json/parser.js'].lineData[602]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/json/parser.js'].lineData[605]++;
        var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit43_606_1(production.symbol || production[0]), reducedAction = visit44_607_1(production.action || production[2]), reducedRhs = visit45_608_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];
        _$jscoverage['/json/parser.js'].lineData[614]++;
        ret = undefined;
        _$jscoverage['/json/parser.js'].lineData[616]++;
        self.$$ = $$;
        _$jscoverage['/json/parser.js'].lineData[618]++;
        for (; visit46_618_1(i < len); i++) {
          _$jscoverage['/json/parser.js'].lineData[619]++;
          self['$' + (len - i)] = valueStack[valueStack.length - 1 - i];
        }
        _$jscoverage['/json/parser.js'].lineData[622]++;
        if (visit47_622_1(reducedAction)) {
          _$jscoverage['/json/parser.js'].lineData[623]++;
          ret = reducedAction.call(self);
        }
        _$jscoverage['/json/parser.js'].lineData[626]++;
        if (visit48_626_1(ret !== undefined)) {
          _$jscoverage['/json/parser.js'].lineData[627]++;
          $$ = ret;
        } else {
          _$jscoverage['/json/parser.js'].lineData[629]++;
          $$ = self.$$;
        }
        _$jscoverage['/json/parser.js'].lineData[632]++;
        stack = stack.slice(0, -1 * len * 2);
        _$jscoverage['/json/parser.js'].lineData[633]++;
        valueStack = valueStack.slice(0, -1 * len);
        _$jscoverage['/json/parser.js'].lineData[635]++;
        stack.push(reducedSymbol);
        _$jscoverage['/json/parser.js'].lineData[637]++;
        valueStack.push($$);
        _$jscoverage['/json/parser.js'].lineData[639]++;
        var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
        _$jscoverage['/json/parser.js'].lineData[641]++;
        stack.push(newState);
        _$jscoverage['/json/parser.js'].lineData[643]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/json/parser.js'].lineData[646]++;
        return $$;
    }
  }
};
  _$jscoverage['/json/parser.js'].lineData[650]++;
  return parser;
});
