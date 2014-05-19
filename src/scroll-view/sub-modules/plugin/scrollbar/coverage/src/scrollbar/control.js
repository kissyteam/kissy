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
if (! _$jscoverage['/scrollbar/control.js']) {
  _$jscoverage['/scrollbar/control.js'] = {};
  _$jscoverage['/scrollbar/control.js'].lineData = [];
  _$jscoverage['/scrollbar/control.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[62] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[84] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[101] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[103] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[104] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[105] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[108] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[112] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[113] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[120] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[129] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[130] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[132] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[135] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[139] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[140] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[153] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[154] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[155] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[157] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[158] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[159] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[160] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[161] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[163] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[164] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[165] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[169] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[170] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[171] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[174] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[175] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[176] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[177] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[181] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[182] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[185] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[186] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[187] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[191] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[192] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[194] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[196] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[200] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[201] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[202] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[204] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[206] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[208] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[209] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[210] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[211] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[212] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[213] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[214] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[215] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[217] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[218] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[220] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[221] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[223] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[227] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[231] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[232] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[233] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[234] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[235] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[236] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[237] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[238] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[239] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[243] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[246] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[247] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[253] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[255] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[259] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[263] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[267] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[271] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[275] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[279] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[280] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[284] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[285] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[289] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[290] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[292] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[293] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[298] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[299] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[310] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[345] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[362] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[364] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[365] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[367] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[374] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[375] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[376] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[378] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[395] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[401] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[407] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[413] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].functionData) {
  _$jscoverage['/scrollbar/control.js'].functionData = [];
  _$jscoverage['/scrollbar/control.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[2] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[3] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[4] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[5] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[20] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[21] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[23] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[26] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[29] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[30] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[32] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[33] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[34] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[35] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[36] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[37] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].branchData) {
  _$jscoverage['/scrollbar/control.js'].branchData = {};
  _$jscoverage['/scrollbar/control.js'].branchData['30'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['51'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['54'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['72'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['81'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['86'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['100'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['117'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['153'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['158'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['175'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['187'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['209'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['211'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['212'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['246'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['289'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['364'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['375'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['375'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['375'][1].init(86, 13, 'v < minLength');
function visit21_375_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['364'][1].init(88, 13, 'v < minLength');
function visit20_364_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['289'][1].init(10119, 11, 'supportCss3');
function visit19_289_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['246'][1].init(145, 8, 'autoHide');
function visit18_246_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['212'][1].init(298, 21, 'scrollType === \'left\'');
function visit17_212_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['211'][1].init(215, 21, 'scrollType === \'left\'');
function visit16_211_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['209'][1].init(79, 24, 'self.get(\'axis\') === \'x\'');
function visit15_209_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['187'][1].init(64, 21, '!self.get(\'autoHide\')');
function visit14_187_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['175'][1].init(14, 14, 'self.hideTimer');
function visit13_175_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['158'][1].init(953, 15, 'val < minScroll');
function visit12_158_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['153'][1].init(646, 15, 'val > maxScroll');
function visit11_153_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['117'][2].init(144, 17, 'dragEl === target');
function visit10_117_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['117'][1].init(144, 45, 'dragEl === target || $dragEl.contains(target)');
function visit9_117_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['100'][2].init(276, 23, 'target === self.downBtn');
function visit8_100_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['100'][1].init(276, 57, 'target === self.downBtn || self.$downBtn.contains(target)');
function visit7_100_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['86'][1].init(273, 38, 'self.hideFn && !scrollView.isScrolling');
function visit6_86_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['81'][1].init(117, 40, '!scrollView.allowScroll[self.scrollType]');
function visit5_81_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['72'][1].init(40, 11, 'self.hideFn');
function visit4_72_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['54'][1].init(39, 22, 'whProperty === \'width\'');
function visit3_54_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['51'][1].init(394, 39, 'scrollView.allowScroll[self.scrollType]');
function visit2_51_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['30'][1].init(36, 31, 'self.pageXyProperty === \'pageX\'');
function visit1_30_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var UA = require('ua');
  _$jscoverage['/scrollbar/control.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var Control = require('component/control');
  _$jscoverage['/scrollbar/control.js'].lineData[10]++;
  var BasicGesture = require('event/gesture/basic');
  _$jscoverage['/scrollbar/control.js'].lineData[11]++;
  var DragGesture = require('event/gesture/drag');
  _$jscoverage['/scrollbar/control.js'].lineData[12]++;
  var ScrollBarTpl = require('./scrollbar-xtpl');
  _$jscoverage['/scrollbar/control.js'].lineData[14]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[16]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[18]++;
  function preventDefault(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[1]++;
    _$jscoverage['/scrollbar/control.js'].lineData[19]++;
    e.preventDefault();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[22]++;
  function onDragStartHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[2]++;
    _$jscoverage['/scrollbar/control.js'].lineData[23]++;
    e.halt();
    _$jscoverage['/scrollbar/control.js'].lineData[24]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[25]++;
    self.startScroll = self.scrollView.get(self.scrollProperty);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[28]++;
  function onDragHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[3]++;
    _$jscoverage['/scrollbar/control.js'].lineData[29]++;
    var self = this, diff = visit1_30_1(self.pageXyProperty === 'pageX') ? e.deltaX : e.deltaY, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[34]++;
    scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[35]++;
    scrollView.scrollToWithBounds(scrollCfg);
    _$jscoverage['/scrollbar/control.js'].lineData[36]++;
    e.halt();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[39]++;
  function onScrollViewReflow() {
    _$jscoverage['/scrollbar/control.js'].functionData[4]++;
    _$jscoverage['/scrollbar/control.js'].lineData[40]++;
    var self = this, scrollView = self.scrollView, trackEl = self.trackEl, scrollWHProperty = self.scrollWHProperty, whProperty = self.whProperty, clientWHProperty = self.clientWHProperty, dragWHProperty = self.dragWHProperty, ratio, trackElSize, barSize;
    _$jscoverage['/scrollbar/control.js'].lineData[51]++;
    if (visit2_51_1(scrollView.allowScroll[self.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[52]++;
      self.scrollLength = scrollView[scrollWHProperty];
      _$jscoverage['/scrollbar/control.js'].lineData[53]++;
      trackElSize = self.trackElSize = visit3_54_1(whProperty === 'width') ? trackEl.offsetWidth : trackEl.offsetHeight;
      _$jscoverage['/scrollbar/control.js'].lineData[55]++;
      ratio = scrollView[clientWHProperty] / self.scrollLength;
      _$jscoverage['/scrollbar/control.js'].lineData[56]++;
      barSize = ratio * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[57]++;
      self.set(dragWHProperty, barSize);
      _$jscoverage['/scrollbar/control.js'].lineData[58]++;
      self.barSize = barSize;
      _$jscoverage['/scrollbar/control.js'].lineData[59]++;
      syncOnScroll(self);
      _$jscoverage['/scrollbar/control.js'].lineData[60]++;
      self.set('visible', true);
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[62]++;
      self.set('visible', false);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[66]++;
  function onScrollViewDisabled(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[5]++;
    _$jscoverage['/scrollbar/control.js'].lineData[67]++;
    this.set('disabled', e.newVal);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[70]++;
  function onScrollEnd() {
    _$jscoverage['/scrollbar/control.js'].functionData[6]++;
    _$jscoverage['/scrollbar/control.js'].lineData[71]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[72]++;
    if (visit4_72_1(self.hideFn)) {
      _$jscoverage['/scrollbar/control.js'].lineData[73]++;
      startHideTimer(self);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[77]++;
  function afterScrollChange() {
    _$jscoverage['/scrollbar/control.js'].functionData[7]++;
    _$jscoverage['/scrollbar/control.js'].lineData[79]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[80]++;
    var scrollView = self.scrollView;
    _$jscoverage['/scrollbar/control.js'].lineData[81]++;
    if (visit5_81_1(!scrollView.allowScroll[self.scrollType])) {
      _$jscoverage['/scrollbar/control.js'].lineData[82]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[84]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[85]++;
    self.set('visible', true);
    _$jscoverage['/scrollbar/control.js'].lineData[86]++;
    if (visit6_86_1(self.hideFn && !scrollView.isScrolling)) {
      _$jscoverage['/scrollbar/control.js'].lineData[87]++;
      startHideTimer(self);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[89]++;
    syncOnScroll(self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[92]++;
  function onUpDownBtnMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[8]++;
    _$jscoverage['/scrollbar/control.js'].lineData[93]++;
    e.halt();
    _$jscoverage['/scrollbar/control.js'].lineData[94]++;
    var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit7_100_1(visit8_100_2(target === self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
    _$jscoverage['/scrollbar/control.js'].lineData[101]++;
    clearInterval(self.mouseInterval);
    _$jscoverage['/scrollbar/control.js'].lineData[102]++;
    function doScroll() {
      _$jscoverage['/scrollbar/control.js'].functionData[9]++;
      _$jscoverage['/scrollbar/control.js'].lineData[103]++;
      var scrollCfg = {};
      _$jscoverage['/scrollbar/control.js'].lineData[104]++;
      scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
      _$jscoverage['/scrollbar/control.js'].lineData[105]++;
      scrollView.scrollToWithBounds(scrollCfg);
    }
    _$jscoverage['/scrollbar/control.js'].lineData[108]++;
    self.mouseInterval = setInterval(doScroll, 100);
    _$jscoverage['/scrollbar/control.js'].lineData[109]++;
    doScroll();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[112]++;
  function onTrackElMouseDown(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[10]++;
    _$jscoverage['/scrollbar/control.js'].lineData[113]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[114]++;
    var target = e.target;
    _$jscoverage['/scrollbar/control.js'].lineData[115]++;
    var dragEl = self.dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[116]++;
    var $dragEl = self.$dragEl;
    _$jscoverage['/scrollbar/control.js'].lineData[117]++;
    if (visit9_117_1(visit10_117_2(dragEl === target) || $dragEl.contains(target))) {
      _$jscoverage['/scrollbar/control.js'].lineData[118]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[120]++;
    var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[129]++;
    scrollCfg[scrollType] = per * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[130]++;
    scrollView.scrollToWithBounds(scrollCfg);
    _$jscoverage['/scrollbar/control.js'].lineData[132]++;
    e.halt();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[135]++;
  function onUpDownBtnMouseUp() {
    _$jscoverage['/scrollbar/control.js'].functionData[11]++;
    _$jscoverage['/scrollbar/control.js'].lineData[136]++;
    clearInterval(this.mouseInterval);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[139]++;
  function syncOnScroll(control) {
    _$jscoverage['/scrollbar/control.js'].functionData[12]++;
    _$jscoverage['/scrollbar/control.js'].lineData[140]++;
    var scrollType = control.scrollType, scrollView = control.scrollView, dragLTProperty = control.dragLTProperty, dragWHProperty = control.dragWHProperty, trackElSize = control.trackElSize, barSize = control.barSize, contentSize = control.scrollLength, val = scrollView.get(control.scrollProperty), maxScrollOffset = scrollView.maxScroll, minScrollOffset = scrollView.minScroll, minScroll = minScrollOffset[scrollType], maxScroll = maxScrollOffset[scrollType], dragVal;
    _$jscoverage['/scrollbar/control.js'].lineData[153]++;
    if (visit11_153_1(val > maxScroll)) {
      _$jscoverage['/scrollbar/control.js'].lineData[154]++;
      dragVal = maxScroll / contentSize * trackElSize;
      _$jscoverage['/scrollbar/control.js'].lineData[155]++;
      control.set(dragWHProperty, barSize - (val - maxScroll));
      _$jscoverage['/scrollbar/control.js'].lineData[157]++;
      control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty));
    } else {
      _$jscoverage['/scrollbar/control.js'].lineData[158]++;
      if (visit12_158_1(val < minScroll)) {
        _$jscoverage['/scrollbar/control.js'].lineData[159]++;
        dragVal = minScroll / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[160]++;
        control.set(dragWHProperty, barSize - (minScroll - val));
        _$jscoverage['/scrollbar/control.js'].lineData[161]++;
        control.set(dragLTProperty, dragVal);
      } else {
        _$jscoverage['/scrollbar/control.js'].lineData[163]++;
        dragVal = val / contentSize * trackElSize;
        _$jscoverage['/scrollbar/control.js'].lineData[164]++;
        control.set(dragLTProperty, dragVal);
        _$jscoverage['/scrollbar/control.js'].lineData[165]++;
        control.set(dragWHProperty, barSize);
      }
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[169]++;
  function startHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[13]++;
    _$jscoverage['/scrollbar/control.js'].lineData[170]++;
    clearHideTimer(self);
    _$jscoverage['/scrollbar/control.js'].lineData[171]++;
    self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[174]++;
  function clearHideTimer(self) {
    _$jscoverage['/scrollbar/control.js'].functionData[14]++;
    _$jscoverage['/scrollbar/control.js'].lineData[175]++;
    if (visit13_175_1(self.hideTimer)) {
      _$jscoverage['/scrollbar/control.js'].lineData[176]++;
      clearTimeout(self.hideTimer);
      _$jscoverage['/scrollbar/control.js'].lineData[177]++;
      self.hideTimer = null;
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[181]++;
  function halt(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[15]++;
    _$jscoverage['/scrollbar/control.js'].lineData[182]++;
    e.halt();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[185]++;
  function bindDrag(self, disabled) {
    _$jscoverage['/scrollbar/control.js'].functionData[16]++;
    _$jscoverage['/scrollbar/control.js'].lineData[186]++;
    var action = disabled ? 'detach' : 'on';
    _$jscoverage['/scrollbar/control.js'].lineData[187]++;
    if (visit14_187_1(!self.get('autoHide'))) {
      _$jscoverage['/scrollbar/control.js'].lineData[191]++;
      self.$dragEl[action](['dragstart', 'mousedown'], preventDefault)[action](DragGesture.DRAG_END, halt, self)[action](DragGesture.DRAG_START, onDragStartHandler, self)[action](DragGesture.DRAG, onDragHandler, self);
      _$jscoverage['/scrollbar/control.js'].lineData[192]++;
      util.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[194]++;
  b[action](BasicGesture.START, onUpDownBtnMouseDown, self)[action](BasicGesture.END, onUpDownBtnMouseUp, self);
});
      _$jscoverage['/scrollbar/control.js'].lineData[196]++;
      self.$trackEl[action](BasicGesture.START, onTrackElMouseDown, self);
    }
  }
  _$jscoverage['/scrollbar/control.js'].lineData[200]++;
  var Feature = require('feature');
  _$jscoverage['/scrollbar/control.js'].lineData[201]++;
  var isTransform3dSupported = Feature.isTransform3dSupported();
  _$jscoverage['/scrollbar/control.js'].lineData[202]++;
  var transformVendorInfo = Feature.getCssVendorInfo('transform');
  _$jscoverage['/scrollbar/control.js'].lineData[204]++;
  var supportCss3 = !!transformVendorInfo;
  _$jscoverage['/scrollbar/control.js'].lineData[206]++;
  var methods = {
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[18]++;
  _$jscoverage['/scrollbar/control.js'].lineData[208]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[209]++;
  var scrollType = self.scrollType = visit15_209_1(self.get('axis') === 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[210]++;
  var ucScrollType = util.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[211]++;
  self.pageXyProperty = visit16_211_1(scrollType === 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[212]++;
  var wh = self.whProperty = visit17_212_1(scrollType === 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[213]++;
  var ucWH = util.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[214]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[215]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[217]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[218]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[220]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[221]++;
  self.scrollWHProperty = 'scroll' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[223]++;
  self.scrollView = self.get('scrollView');
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[227]++;
  renderData.elCls.push(renderData.prefixCls + 'scrollbar-' + renderData.axis);
}, 
  createDom: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[231]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[232]++;
  self.$dragEl = self.get('dragEl');
  _$jscoverage['/scrollbar/control.js'].lineData[233]++;
  self.$trackEl = self.get('trackEl');
  _$jscoverage['/scrollbar/control.js'].lineData[234]++;
  self.$downBtn = self.get('downBtn');
  _$jscoverage['/scrollbar/control.js'].lineData[235]++;
  self.$upBtn = self.get('upBtn');
  _$jscoverage['/scrollbar/control.js'].lineData[236]++;
  self.dragEl = self.$dragEl[0];
  _$jscoverage['/scrollbar/control.js'].lineData[237]++;
  self.trackEl = self.$trackEl[0];
  _$jscoverage['/scrollbar/control.js'].lineData[238]++;
  self.downBtn = self.$downBtn[0];
  _$jscoverage['/scrollbar/control.js'].lineData[239]++;
  self.upBtn = self.$upBtn[0];
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[21]++;
  _$jscoverage['/scrollbar/control.js'].lineData[243]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[246]++;
  if (visit18_246_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[247]++;
    self.hideFn = util.bind(self.hide, self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[253]++;
  scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self).on('scrollTouchEnd' + SCROLLBAR_EVENT_NS, onScrollEnd, self).on('afterDisabledChange' + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self).on('reflow' + SCROLLBAR_EVENT_NS, onScrollViewReflow, self);
  _$jscoverage['/scrollbar/control.js'].lineData[255]++;
  bindDrag(self, self.get('disabled'));
}, 
  syncUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[22]++;
  _$jscoverage['/scrollbar/control.js'].lineData[259]++;
  onScrollViewReflow.call(this);
}, 
  _onSetDragHeight: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[23]++;
  _$jscoverage['/scrollbar/control.js'].lineData[263]++;
  this.dragEl.style.height = v + 'px';
}, 
  _onSetDragWidth: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[24]++;
  _$jscoverage['/scrollbar/control.js'].lineData[267]++;
  this.dragEl.style.width = v + 'px';
}, 
  _onSetDragLeft: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[25]++;
  _$jscoverage['/scrollbar/control.js'].lineData[271]++;
  this.dragEl.style.left = v + 'px';
}, 
  _onSetDragTop: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[26]++;
  _$jscoverage['/scrollbar/control.js'].lineData[275]++;
  this.dragEl.style.top = v + 'px';
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[27]++;
  _$jscoverage['/scrollbar/control.js'].lineData[279]++;
  this.callSuper(v);
  _$jscoverage['/scrollbar/control.js'].lineData[280]++;
  bindDrag(this, v);
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[28]++;
  _$jscoverage['/scrollbar/control.js'].lineData[284]++;
  this.scrollView.detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[285]++;
  clearHideTimer(this);
}};
  _$jscoverage['/scrollbar/control.js'].lineData[289]++;
  if (visit19_289_1(supportCss3)) {
    _$jscoverage['/scrollbar/control.js'].lineData[290]++;
    var transformProperty = transformVendorInfo.propertyName;
    _$jscoverage['/scrollbar/control.js'].lineData[292]++;
    methods._onSetDragLeft = function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[29]++;
  _$jscoverage['/scrollbar/control.js'].lineData[293]++;
  this.dragEl.style[transformProperty] = 'translateX(' + v + 'px)' + ' translateY(' + this.get('dragTop') + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
    _$jscoverage['/scrollbar/control.js'].lineData[298]++;
    methods._onSetDragTop = function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[30]++;
  _$jscoverage['/scrollbar/control.js'].lineData[299]++;
  this.dragEl.style[transformProperty] = 'translateX(' + this.get('dragLeft') + 'px)' + ' translateY(' + v + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
  }
  _$jscoverage['/scrollbar/control.js'].lineData[310]++;
  return Control.extend(methods, {
  ATTRS: {
  minLength: {
  value: MIN_BAR_LENGTH}, 
  scrollView: {}, 
  axis: {
  render: 1}, 
  autoHide: {
  value: UA.ios}, 
  visible: {
  valueFn: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[31]++;
  _$jscoverage['/scrollbar/control.js'].lineData[345]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[32]++;
  _$jscoverage['/scrollbar/control.js'].lineData[362]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[364]++;
  if (visit20_364_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[365]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[367]++;
  return v;
}, 
  render: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[33]++;
  _$jscoverage['/scrollbar/control.js'].lineData[374]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[375]++;
  if (visit21_375_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[376]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[378]++;
  return v;
}, 
  render: 1}, 
  dragLeft: {
  render: 1, 
  value: 0}, 
  dragTop: {
  render: 1, 
  value: 0}, 
  dragEl: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[34]++;
  _$jscoverage['/scrollbar/control.js'].lineData[395]++;
  return '.' + this.getBaseCssClass('drag');
}}, 
  downBtn: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[35]++;
  _$jscoverage['/scrollbar/control.js'].lineData[401]++;
  return '.' + this.getBaseCssClass('arrow-down');
}}, 
  upBtn: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[36]++;
  _$jscoverage['/scrollbar/control.js'].lineData[407]++;
  return '.' + this.getBaseCssClass('arrow-up');
}}, 
  trackEl: {
  selector: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[37]++;
  _$jscoverage['/scrollbar/control.js'].lineData[413]++;
  return '.' + this.getBaseCssClass('track');
}}, 
  focusable: {
  value: false}, 
  contentTpl: {
  value: ScrollBarTpl}}, 
  xclass: 'scrollbar'});
});
