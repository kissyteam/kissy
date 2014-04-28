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
if (! _$jscoverage['/xtemplate/compiler.js']) {
  _$jscoverage['/xtemplate/compiler.js'] = {};
  _$jscoverage['/xtemplate/compiler.js'].lineData = [];
  _$jscoverage['/xtemplate/compiler.js'].lineData[6] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[7] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[8] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[9] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[10] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[11] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[12] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[13] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[14] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[15] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[17] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[18] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[21] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[22] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[27] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[29] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[35] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[36] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[39] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[40] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[42] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[43] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[45] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[49] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[50] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[51] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[54] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[57] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[60] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[63] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[64] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[67] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[68] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[76] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[77] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[78] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[79] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[80] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[81] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[82] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[83] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[84] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[85] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[86] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[87] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[89] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[90] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[92] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[99] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[100] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[101] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[103] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[106] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[107] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[108] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[109] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[112] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[113] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[114] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[115] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[116] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[117] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[118] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[119] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[120] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[123] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[126] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[128] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[132] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[133] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[134] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[135] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[136] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[138] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[139] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[142] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[143] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[144] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[149] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[150] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[155] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[156] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[157] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[159] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[160] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[166] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[167] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[172] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[173] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[175] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[176] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[178] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[179] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[180] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[181] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[182] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[183] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[184] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[186] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[189] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[190] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[191] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[192] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[193] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[194] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[195] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[197] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[200] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[206] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[207] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[216] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[217] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[218] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[220] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[221] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[222] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[223] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[224] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[225] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[229] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[231] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[233] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[238] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[239] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[242] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[243] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[244] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[246] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[248] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[249] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[254] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[255] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[256] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[259] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[264] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[265] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[271] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[277] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[291] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[292] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[301] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[308] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[315] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[320] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[321] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[323] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[324] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[326] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[328] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[335] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[339] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[343] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[350] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[352] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[353] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[355] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[357] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[365] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[372] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[373] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[379] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[386] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[402] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[403] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[415] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[416] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[417] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[418] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[427] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[428] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[430] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[431] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[433] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[442] = 0;
}
if (! _$jscoverage['/xtemplate/compiler.js'].functionData) {
  _$jscoverage['/xtemplate/compiler.js'].functionData = [];
  _$jscoverage['/xtemplate/compiler.js'].functionData[0] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[1] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[2] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[3] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[4] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[5] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[6] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[7] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[8] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[9] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[10] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[11] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[12] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[13] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[14] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[15] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[16] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[17] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[18] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[19] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[20] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[21] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[22] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[23] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[24] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[25] = 0;
}
if (! _$jscoverage['/xtemplate/compiler.js'].branchData) {
  _$jscoverage['/xtemplate/compiler.js'].branchData = {};
  _$jscoverage['/xtemplate/compiler.js'].branchData['22'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['42'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['50'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['83'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['84'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['100'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['106'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['107'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['112'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['114'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['117'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['149'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['156'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['178'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['189'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['220'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['223'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['229'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['231'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['231'][3] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['238'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['242'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['243'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['248'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['255'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['264'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['323'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['427'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['427'][1] = new BranchData();
}
_$jscoverage['/xtemplate/compiler.js'].branchData['427'][1].init(18, 5, '!name');
function visit78_427_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['323'][1].init(379, 8, 'newParts');
function visit77_323_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['264'][1].init(2544, 6, 'idName');
function visit76_264_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['255'][1].init(152, 8, 'newParts');
function visit75_255_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['248'][1].init(1694, 5, 'block');
function visit74_248_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['243'][1].init(18, 5, 'block');
function visit73_243_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['242'][1].init(1274, 26, 'idString in nativeCommands');
function visit72_242_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['238'][1].init(1199, 6, '!block');
function visit71_238_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['231'][3].init(91, 21, 'idString === \'extend\'');
function visit70_231_3(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['231'][3].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['231'][2].init(65, 22, 'idString === \'include\'');
function visit69_231_2(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['231'][1].init(65, 47, 'idString === \'include\' || idString === \'extend\'');
function visit68_231_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['229'][1].init(798, 20, 'xtplAstToJs.isModule');
function visit67_229_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['223'][1].init(166, 19, 'programNode.inverse');
function visit66_223_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['220'][1].init(412, 5, 'block');
function visit65_220_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['189'][1].init(781, 4, 'hash');
function visit64_189_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['178'][1].init(295, 6, 'params');
function visit63_178_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['156'][1].init(624, 7, 'i < len');
function visit62_156_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['149'][1].init(216, 20, 'xtplAstToJs.isModule');
function visit61_149_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['135'][1].init(130, 7, 'i < len');
function visit60_135_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['117'][1].init(103, 10, 'idPartType');
function visit59_117_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['114'][1].init(73, 5, 'i < l');
function visit58_114_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['112'][1].init(349, 5, 'check');
function visit57_112_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['107'][1].init(18, 15, 'idParts[i].type');
function visit56_107_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['106'][1].init(208, 5, 'i < l');
function visit55_106_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['100'][1].init(14, 20, 'idParts.length === 1');
function visit54_100_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['84'][1].init(35, 13, 'type === \'&&\'');
function visit53_84_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['83'][3].init(543, 13, 'type === \'||\'');
function visit52_83_3(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['83'][2].init(526, 13, 'type === \'&&\'');
function visit51_83_2(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['83'][1].init(526, 30, 'type === \'&&\' || type === \'||\'');
function visit50_83_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['50'][1].init(14, 6, 'isCode');
function visit49_50_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['42'][1].init(89, 12, 'm.length % 2');
function visit48_42_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['22'][1].init(29, 27, 'S.indexOf(t, keywords) > -1');
function visit47_22_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[0]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[7]++;
  require('util');
  _$jscoverage['/xtemplate/compiler.js'].lineData[8]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/xtemplate/compiler.js'].lineData[9]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/xtemplate/compiler.js'].lineData[10]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/xtemplate/compiler.js'].lineData[11]++;
  var nativeCode = '';
  _$jscoverage['/xtemplate/compiler.js'].lineData[12]++;
  var t;
  _$jscoverage['/xtemplate/compiler.js'].lineData[13]++;
  var keywords = ['if', 'with', 'debugger'];
  _$jscoverage['/xtemplate/compiler.js'].lineData[14]++;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  _$jscoverage['/xtemplate/compiler.js'].lineData[15]++;
  var nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/xtemplate/compiler.js'].lineData[17]++;
  for (t in nativeUtils) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[18]++;
    nativeCode += t + 'Util = utils.' + t + ',';
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[21]++;
  for (t in nativeCommands) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[22]++;
    nativeCode += t + (visit47_22_1(S.indexOf(t, keywords) > -1) ? ('Command = nativeCommands["' + t + '"]') : ('Command = nativeCommands.' + t)) + ',';
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[27]++;
  nativeCode = nativeCode.slice(0, -1);
  _$jscoverage['/xtemplate/compiler.js'].lineData[29]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[35]++;
  function guid(str) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[1]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[36]++;
    return str + (variableId++);
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[39]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[2]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[40]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[3]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[42]++;
  if (visit48_42_1(m.length % 2)) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[43]++;
    m = '\\' + m;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[45]++;
  return m;
});
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[49]++;
  function escapeString(str, isCode) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[4]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[50]++;
    if (visit49_50_1(isCode)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[51]++;
      str = escapeSingleQuoteInCodeString(str, 0);
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[54]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[57]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/xtemplate/compiler.js'].lineData[60]++;
    return str;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[63]++;
  function pushToArray(to, from) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[5]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[64]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[67]++;
  function opExpression(e) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[6]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[68]++;
    var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
    _$jscoverage['/xtemplate/compiler.js'].lineData[76]++;
    exp1 = code1.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[77]++;
    exp2 = code2.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[78]++;
    var exp = guid('exp');
    _$jscoverage['/xtemplate/compiler.js'].lineData[79]++;
    code1Source = code1.source;
    _$jscoverage['/xtemplate/compiler.js'].lineData[80]++;
    code2Source = code2.source;
    _$jscoverage['/xtemplate/compiler.js'].lineData[81]++;
    pushToArray(source, code1Source);
    _$jscoverage['/xtemplate/compiler.js'].lineData[82]++;
    source.push('var ' + exp + ' = ' + exp1 + ';');
    _$jscoverage['/xtemplate/compiler.js'].lineData[83]++;
    if (visit50_83_1(visit51_83_2(type === '&&') || visit52_83_3(type === '||'))) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[84]++;
      source.push('if(' + (visit53_84_1(type === '&&') ? '' : '!') + '(' + exp1 + ')){');
      _$jscoverage['/xtemplate/compiler.js'].lineData[85]++;
      pushToArray(source, code2Source);
      _$jscoverage['/xtemplate/compiler.js'].lineData[86]++;
      source.push(exp + ' = ' + exp2 + ';');
      _$jscoverage['/xtemplate/compiler.js'].lineData[87]++;
      source.push('}');
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[89]++;
      pushToArray(source, code2Source);
      _$jscoverage['/xtemplate/compiler.js'].lineData[90]++;
      source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[92]++;
    return {
  exp: exp, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[99]++;
  function getIdStringFromIdParts(source, idParts) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[7]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[100]++;
    if (visit54_100_1(idParts.length === 1)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[101]++;
      return null;
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[103]++;
    var i, l, idPart, idPartType, check = 0, nextIdNameCode;
    _$jscoverage['/xtemplate/compiler.js'].lineData[106]++;
    for (i = 0 , l = idParts.length; visit55_106_1(i < l); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[107]++;
      if (visit56_107_1(idParts[i].type)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[108]++;
        check = 1;
        _$jscoverage['/xtemplate/compiler.js'].lineData[109]++;
        break;
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[112]++;
    if (visit57_112_1(check)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[113]++;
      var ret = [];
      _$jscoverage['/xtemplate/compiler.js'].lineData[114]++;
      for (i = 0 , l = idParts.length; visit58_114_1(i < l); i++) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[115]++;
        idPart = idParts[i];
        _$jscoverage['/xtemplate/compiler.js'].lineData[116]++;
        idPartType = idPart.type;
        _$jscoverage['/xtemplate/compiler.js'].lineData[117]++;
        if (visit59_117_1(idPartType)) {
          _$jscoverage['/xtemplate/compiler.js'].lineData[118]++;
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          _$jscoverage['/xtemplate/compiler.js'].lineData[119]++;
          pushToArray(source, nextIdNameCode.source);
          _$jscoverage['/xtemplate/compiler.js'].lineData[120]++;
          ret.push(nextIdNameCode.exp);
        } else {
          _$jscoverage['/xtemplate/compiler.js'].lineData[123]++;
          ret.push('"' + idPart + '"');
        }
      }
      _$jscoverage['/xtemplate/compiler.js'].lineData[126]++;
      return ret;
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[128]++;
      return null;
    }
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[132]++;
  function genFunction(statements) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[8]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[133]++;
    var source = [];
    _$jscoverage['/xtemplate/compiler.js'].lineData[134]++;
    source.push('function(scope, buffer) {\n');
    _$jscoverage['/xtemplate/compiler.js'].lineData[135]++;
    for (var i = 0, len = statements.length; visit60_135_1(i < len); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[136]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[138]++;
    source.push('\n return buffer; }');
    _$jscoverage['/xtemplate/compiler.js'].lineData[139]++;
    return source;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[142]++;
  function genTopFunction(xtplAstToJs, statements) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[9]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[143]++;
    var source = [];
    _$jscoverage['/xtemplate/compiler.js'].lineData[144]++;
    source.push('var engine = this,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/xtemplate/compiler.js'].lineData[149]++;
    if (visit61_149_1(xtplAstToJs.isModule)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[150]++;
      source.push('if("' + S.version + '" !== S.version){' + 'throw new Error("current xtemplate file("+engine.name+")(v' + S.version + ') ' + 'need to be recompiled using current kissy(v"+ S.version+")!");' + '}');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[155]++;
    source.push('var ' + nativeCode + ';');
    _$jscoverage['/xtemplate/compiler.js'].lineData[156]++;
    for (var i = 0, len = statements.length; visit62_156_1(i < len); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[157]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[159]++;
    source.push('return buffer;');
    _$jscoverage['/xtemplate/compiler.js'].lineData[160]++;
    return {
  params: ['scope', 'buffer', 'payload', 'undefined'], 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[166]++;
  function genOptionFromFunction(func, escape) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[10]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[167]++;
    var source = [], optionName, params, hash;
    _$jscoverage['/xtemplate/compiler.js'].lineData[172]++;
    params = func.params;
    _$jscoverage['/xtemplate/compiler.js'].lineData[173]++;
    hash = func.hash;
    _$jscoverage['/xtemplate/compiler.js'].lineData[175]++;
    optionName = guid('option');
    _$jscoverage['/xtemplate/compiler.js'].lineData[176]++;
    source.push('var ' + optionName + ' = {' + (escape ? 'escape:1' : '') + '};');
    _$jscoverage['/xtemplate/compiler.js'].lineData[178]++;
    if (visit63_178_1(params)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[179]++;
      var paramsName = guid('params');
      _$jscoverage['/xtemplate/compiler.js'].lineData[180]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/xtemplate/compiler.js'].lineData[181]++;
      S.each(params, function(param) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[11]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[182]++;
  var nextIdNameCode = xtplAstToJs[param.type](param);
  _$jscoverage['/xtemplate/compiler.js'].lineData[183]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[184]++;
  source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
});
      _$jscoverage['/xtemplate/compiler.js'].lineData[186]++;
      source.push(optionName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[189]++;
    if (visit64_189_1(hash)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[190]++;
      var hashName = guid('hash');
      _$jscoverage['/xtemplate/compiler.js'].lineData[191]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/xtemplate/compiler.js'].lineData[192]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[12]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[193]++;
  var nextIdNameCode = xtplAstToJs[v.type](v);
  _$jscoverage['/xtemplate/compiler.js'].lineData[194]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[195]++;
  source.push(hashName + '["' + key + '"] = ' + nextIdNameCode.exp + ';');
});
      _$jscoverage['/xtemplate/compiler.js'].lineData[197]++;
      source.push(optionName + '.hash = ' + hashName + ';');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[200]++;
    return {
  exp: optionName, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[206]++;
  function generateFunction(xtplAstToJs, func, escape, block) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[13]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[207]++;
    var source = [], functionConfigCode, optionName, id = func.id, idName, idString = id.string, idParts = id.parts, inverseFn;
    _$jscoverage['/xtemplate/compiler.js'].lineData[216]++;
    functionConfigCode = genOptionFromFunction(func, escape);
    _$jscoverage['/xtemplate/compiler.js'].lineData[217]++;
    optionName = functionConfigCode.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[218]++;
    pushToArray(source, functionConfigCode.source);
    _$jscoverage['/xtemplate/compiler.js'].lineData[220]++;
    if (visit65_220_1(block)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[221]++;
      var programNode = block.program;
      _$jscoverage['/xtemplate/compiler.js'].lineData[222]++;
      source.push(optionName + '.fn=' + genFunction(programNode.statements).join('\n') + ';');
      _$jscoverage['/xtemplate/compiler.js'].lineData[223]++;
      if (visit66_223_1(programNode.inverse)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[224]++;
        inverseFn = genFunction(programNode.inverse).join('\n');
        _$jscoverage['/xtemplate/compiler.js'].lineData[225]++;
        source.push(optionName + '.inverse=' + inverseFn + ';');
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[229]++;
    if (visit67_229_1(xtplAstToJs.isModule)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[231]++;
      if (visit68_231_1(visit69_231_2(idString === 'include') || visit70_231_3(idString === 'extend'))) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[233]++;
        source.push('re' + 'quire("' + func.params[0].value + '");' + optionName + '.params[0] = module.resolve(' + optionName + '.params[0]);');
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[238]++;
    if (visit71_238_1(!block)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[239]++;
      idName = guid('callRet');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[242]++;
    if (visit72_242_1(idString in nativeCommands)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[243]++;
      if (visit73_243_1(block)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[244]++;
        source.push('buffer = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
      } else {
        _$jscoverage['/xtemplate/compiler.js'].lineData[246]++;
        source.push('var ' + idName + ' = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
      }
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[248]++;
      if (visit74_248_1(block)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[249]++;
        source.push('buffer = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '["' + idParts.join('","') + '"]' + ', ' + id.lineNumber + ');');
      } else {
        _$jscoverage['/xtemplate/compiler.js'].lineData[254]++;
        var newParts = getIdStringFromIdParts(source, idParts);
        _$jscoverage['/xtemplate/compiler.js'].lineData[255]++;
        if (visit75_255_1(newParts)) {
          _$jscoverage['/xtemplate/compiler.js'].lineData[256]++;
          source.push('var ' + idName + ' = callFnUtil(engine, scope, ' + optionName + ', buffer, ' + '[' + newParts.join(',') + ']' + ', ' + id.depth + ',' + id.lineNumber + ');');
        } else {
          _$jscoverage['/xtemplate/compiler.js'].lineData[259]++;
          source.push('var ' + idName + ' = callFnUtil(engine, scope, ' + optionName + ', buffer, ' + '["' + idParts.join('","') + '"],' + id.depth + ',' + id.lineNumber + ');');
        }
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[264]++;
    if (visit76_264_1(idName)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[265]++;
      source.push('if(' + idName + ' && ' + idName + '.isBuffer){' + 'buffer = ' + idName + ';' + idName + ' = undefined;' + '}');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[271]++;
    return {
  exp: idName, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[277]++;
  var xtplAstToJs = {
  conditionalOrExpression: opExpression, 
  conditionalAndExpression: opExpression, 
  relationalExpression: opExpression, 
  equalityExpression: opExpression, 
  additiveExpression: opExpression, 
  multiplicativeExpression: opExpression, 
  unaryExpression: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[14]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[291]++;
  var code = xtplAstToJs[e.value.type](e.value);
  _$jscoverage['/xtemplate/compiler.js'].lineData[292]++;
  return {
  exp: e.unaryType + '(' + code.exp + ')', 
  source: code.source};
}, 
  string: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[15]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[301]++;
  return {
  exp: "'" + escapeString(e.value, true) + "'", 
  source: []};
}, 
  number: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[16]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[308]++;
  return {
  exp: e.value, 
  source: []};
}, 
  id: function(idNode) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[17]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[315]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
  _$jscoverage['/xtemplate/compiler.js'].lineData[320]++;
  var newParts = getIdStringFromIdParts(source, idParts);
  _$jscoverage['/xtemplate/compiler.js'].lineData[321]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/xtemplate/compiler.js'].lineData[323]++;
  if (visit77_323_1(newParts)) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[324]++;
    source.push('var ' + idName + ' = scope.resolve([' + newParts.join(',') + ']' + depthParam + ');');
  } else {
    _$jscoverage['/xtemplate/compiler.js'].lineData[326]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[328]++;
  return {
  exp: idName, 
  source: source};
}, 
  'function': function(func, escape) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[18]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[335]++;
  return generateFunction(this, func, escape);
}, 
  blockStatement: function(block) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[19]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[339]++;
  return generateFunction(this, block.func, block.escape, block);
}, 
  expressionStatement: function(expressionStatement) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[20]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[343]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/xtemplate/compiler.js'].lineData[350]++;
  code = xtplAstToJs[type](expression, escape);
  _$jscoverage['/xtemplate/compiler.js'].lineData[352]++;
  pushToArray(source, code.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[353]++;
  expressionOrVariable = code.exp;
  _$jscoverage['/xtemplate/compiler.js'].lineData[355]++;
  source.push('buffer.write(' + expressionOrVariable + ',' + !!escape + ');');
  _$jscoverage['/xtemplate/compiler.js'].lineData[357]++;
  return {
  exp: '', 
  source: source};
}, 
  contentStatement: function(contentStatement) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[21]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[365]++;
  return {
  exp: '', 
  source: ["buffer.write('" + escapeString(contentStatement.value, 0) + "');"]};
}};
  _$jscoverage['/xtemplate/compiler.js'].lineData[372]++;
  xtplAstToJs['boolean'] = function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[22]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[373]++;
  return {
  exp: e.value, 
  source: []};
};
  _$jscoverage['/xtemplate/compiler.js'].lineData[379]++;
  var compiler;
  _$jscoverage['/xtemplate/compiler.js'].lineData[386]++;
  compiler = {
  parse: S.bind(parser.parse, parser), 
  compileToStr: function(tplContent, name, isModule) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[23]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[402]++;
  var func = compiler.compile(tplContent, name, isModule);
  _$jscoverage['/xtemplate/compiler.js'].lineData[403]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tplContent, name, isModule) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[24]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[415]++;
  var root = compiler.parse(tplContent, name);
  _$jscoverage['/xtemplate/compiler.js'].lineData[416]++;
  variableId = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[417]++;
  xtplAstToJs.isModule = isModule;
  _$jscoverage['/xtemplate/compiler.js'].lineData[418]++;
  return genTopFunction(xtplAstToJs, root.statements);
}, 
  compileToFn: function(tplContent, name) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[25]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[427]++;
  if (visit78_427_1(!name)) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[428]++;
    name = 'xtemplate' + (xtemplateId++);
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[430]++;
  var code = compiler.compile(tplContent, name);
  _$jscoverage['/xtemplate/compiler.js'].lineData[431]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/xtemplate/compiler.js'].lineData[433]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/xtemplate/compiler.js'].lineData[442]++;
  return compiler;
});
