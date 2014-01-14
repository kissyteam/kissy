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
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[22] = 0;
  _$jscoverage['/control.js'].lineData[42] = 0;
  _$jscoverage['/control.js'].lineData[49] = 0;
  _$jscoverage['/control.js'].lineData[50] = 0;
  _$jscoverage['/control.js'].lineData[52] = 0;
  _$jscoverage['/control.js'].lineData[56] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[59] = 0;
  _$jscoverage['/control.js'].lineData[62] = 0;
  _$jscoverage['/control.js'].lineData[71] = 0;
  _$jscoverage['/control.js'].lineData[75] = 0;
  _$jscoverage['/control.js'].lineData[78] = 0;
  _$jscoverage['/control.js'].lineData[83] = 0;
  _$jscoverage['/control.js'].lineData[86] = 0;
  _$jscoverage['/control.js'].lineData[87] = 0;
  _$jscoverage['/control.js'].lineData[89] = 0;
  _$jscoverage['/control.js'].lineData[92] = 0;
  _$jscoverage['/control.js'].lineData[98] = 0;
  _$jscoverage['/control.js'].lineData[99] = 0;
  _$jscoverage['/control.js'].lineData[100] = 0;
  _$jscoverage['/control.js'].lineData[105] = 0;
  _$jscoverage['/control.js'].lineData[106] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[115] = 0;
  _$jscoverage['/control.js'].lineData[116] = 0;
  _$jscoverage['/control.js'].lineData[117] = 0;
  _$jscoverage['/control.js'].lineData[121] = 0;
  _$jscoverage['/control.js'].lineData[125] = 0;
  _$jscoverage['/control.js'].lineData[126] = 0;
  _$jscoverage['/control.js'].lineData[127] = 0;
  _$jscoverage['/control.js'].lineData[131] = 0;
  _$jscoverage['/control.js'].lineData[132] = 0;
  _$jscoverage['/control.js'].lineData[138] = 0;
  _$jscoverage['/control.js'].lineData[144] = 0;
  _$jscoverage['/control.js'].lineData[151] = 0;
  _$jscoverage['/control.js'].lineData[159] = 0;
  _$jscoverage['/control.js'].lineData[160] = 0;
  _$jscoverage['/control.js'].lineData[161] = 0;
  _$jscoverage['/control.js'].lineData[162] = 0;
  _$jscoverage['/control.js'].lineData[170] = 0;
  _$jscoverage['/control.js'].lineData[171] = 0;
  _$jscoverage['/control.js'].lineData[172] = 0;
  _$jscoverage['/control.js'].lineData[176] = 0;
  _$jscoverage['/control.js'].lineData[177] = 0;
  _$jscoverage['/control.js'].lineData[182] = 0;
  _$jscoverage['/control.js'].lineData[183] = 0;
  _$jscoverage['/control.js'].lineData[188] = 0;
  _$jscoverage['/control.js'].lineData[195] = 0;
  _$jscoverage['/control.js'].lineData[196] = 0;
  _$jscoverage['/control.js'].lineData[208] = 0;
  _$jscoverage['/control.js'].lineData[212] = 0;
  _$jscoverage['/control.js'].lineData[213] = 0;
  _$jscoverage['/control.js'].lineData[223] = 0;
  _$jscoverage['/control.js'].lineData[227] = 0;
  _$jscoverage['/control.js'].lineData[228] = 0;
  _$jscoverage['/control.js'].lineData[238] = 0;
  _$jscoverage['/control.js'].lineData[239] = 0;
  _$jscoverage['/control.js'].lineData[240] = 0;
  _$jscoverage['/control.js'].lineData[244] = 0;
  _$jscoverage['/control.js'].lineData[245] = 0;
  _$jscoverage['/control.js'].lineData[258] = 0;
  _$jscoverage['/control.js'].lineData[261] = 0;
  _$jscoverage['/control.js'].lineData[262] = 0;
  _$jscoverage['/control.js'].lineData[263] = 0;
  _$jscoverage['/control.js'].lineData[265] = 0;
  _$jscoverage['/control.js'].lineData[266] = 0;
  _$jscoverage['/control.js'].lineData[268] = 0;
  _$jscoverage['/control.js'].lineData[271] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[274] = 0;
  _$jscoverage['/control.js'].lineData[275] = 0;
  _$jscoverage['/control.js'].lineData[282] = 0;
  _$jscoverage['/control.js'].lineData[283] = 0;
  _$jscoverage['/control.js'].lineData[295] = 0;
  _$jscoverage['/control.js'].lineData[297] = 0;
  _$jscoverage['/control.js'].lineData[298] = 0;
  _$jscoverage['/control.js'].lineData[303] = 0;
  _$jscoverage['/control.js'].lineData[304] = 0;
  _$jscoverage['/control.js'].lineData[316] = 0;
  _$jscoverage['/control.js'].lineData[317] = 0;
  _$jscoverage['/control.js'].lineData[326] = 0;
  _$jscoverage['/control.js'].lineData[327] = 0;
  _$jscoverage['/control.js'].lineData[331] = 0;
  _$jscoverage['/control.js'].lineData[332] = 0;
  _$jscoverage['/control.js'].lineData[341] = 0;
  _$jscoverage['/control.js'].lineData[342] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[347] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[349] = 0;
  _$jscoverage['/control.js'].lineData[351] = 0;
  _$jscoverage['/control.js'].lineData[360] = 0;
  _$jscoverage['/control.js'].lineData[361] = 0;
  _$jscoverage['/control.js'].lineData[363] = 0;
  _$jscoverage['/control.js'].lineData[367] = 0;
  _$jscoverage['/control.js'].lineData[368] = 0;
  _$jscoverage['/control.js'].lineData[378] = 0;
  _$jscoverage['/control.js'].lineData[379] = 0;
  _$jscoverage['/control.js'].lineData[380] = 0;
  _$jscoverage['/control.js'].lineData[388] = 0;
  _$jscoverage['/control.js'].lineData[390] = 0;
  _$jscoverage['/control.js'].lineData[391] = 0;
  _$jscoverage['/control.js'].lineData[392] = 0;
  _$jscoverage['/control.js'].lineData[393] = 0;
  _$jscoverage['/control.js'].lineData[394] = 0;
  _$jscoverage['/control.js'].lineData[405] = 0;
  _$jscoverage['/control.js'].lineData[469] = 0;
  _$jscoverage['/control.js'].lineData[470] = 0;
  _$jscoverage['/control.js'].lineData[472] = 0;
  _$jscoverage['/control.js'].lineData[522] = 0;
  _$jscoverage['/control.js'].lineData[523] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[570] = 0;
  _$jscoverage['/control.js'].lineData[571] = 0;
  _$jscoverage['/control.js'].lineData[572] = 0;
  _$jscoverage['/control.js'].lineData[574] = 0;
  _$jscoverage['/control.js'].lineData[575] = 0;
  _$jscoverage['/control.js'].lineData[578] = 0;
  _$jscoverage['/control.js'].lineData[581] = 0;
  _$jscoverage['/control.js'].lineData[648] = 0;
  _$jscoverage['/control.js'].lineData[797] = 0;
  _$jscoverage['/control.js'].lineData[798] = 0;
  _$jscoverage['/control.js'].lineData[800] = 0;
  _$jscoverage['/control.js'].lineData[801] = 0;
  _$jscoverage['/control.js'].lineData[837] = 0;
  _$jscoverage['/control.js'].lineData[843] = 0;
  _$jscoverage['/control.js'].lineData[844] = 0;
  _$jscoverage['/control.js'].lineData[846] = 0;
  _$jscoverage['/control.js'].lineData[847] = 0;
  _$jscoverage['/control.js'].lineData[848] = 0;
  _$jscoverage['/control.js'].lineData[850] = 0;
  _$jscoverage['/control.js'].lineData[853] = 0;
  _$jscoverage['/control.js'].lineData[874] = 0;
  _$jscoverage['/control.js'].lineData[876] = 0;
  _$jscoverage['/control.js'].lineData[883] = 0;
  _$jscoverage['/control.js'].lineData[884] = 0;
  _$jscoverage['/control.js'].lineData[887] = 0;
  _$jscoverage['/control.js'].lineData[889] = 0;
  _$jscoverage['/control.js'].lineData[890] = 0;
  _$jscoverage['/control.js'].lineData[893] = 0;
  _$jscoverage['/control.js'].lineData[894] = 0;
  _$jscoverage['/control.js'].lineData[896] = 0;
  _$jscoverage['/control.js'].lineData[899] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['49'] = [];
  _$jscoverage['/control.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['58'] = [];
  _$jscoverage['/control.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['78'] = [];
  _$jscoverage['/control.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['86'] = [];
  _$jscoverage['/control.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['89'] = [];
  _$jscoverage['/control.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['99'] = [];
  _$jscoverage['/control.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['105'] = [];
  _$jscoverage['/control.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['121'] = [];
  _$jscoverage['/control.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['126'] = [];
  _$jscoverage['/control.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['131'] = [];
  _$jscoverage['/control.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['176'] = [];
  _$jscoverage['/control.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['182'] = [];
  _$jscoverage['/control.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['195'] = [];
  _$jscoverage['/control.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['212'] = [];
  _$jscoverage['/control.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['227'] = [];
  _$jscoverage['/control.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['244'] = [];
  _$jscoverage['/control.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['260'] = [];
  _$jscoverage['/control.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['261'] = [];
  _$jscoverage['/control.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['262'] = [];
  _$jscoverage['/control.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['265'] = [];
  _$jscoverage['/control.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['268'] = [];
  _$jscoverage['/control.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['272'] = [];
  _$jscoverage['/control.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'] = [];
  _$jscoverage['/control.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['274'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['282'] = [];
  _$jscoverage['/control.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['297'] = [];
  _$jscoverage['/control.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['297'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['297'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['303'] = [];
  _$jscoverage['/control.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['316'] = [];
  _$jscoverage['/control.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['331'] = [];
  _$jscoverage['/control.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['347'] = [];
  _$jscoverage['/control.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['360'] = [];
  _$jscoverage['/control.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['367'] = [];
  _$jscoverage['/control.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['379'] = [];
  _$jscoverage['/control.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['391'] = [];
  _$jscoverage['/control.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['393'] = [];
  _$jscoverage['/control.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['469'] = [];
  _$jscoverage['/control.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['472'] = [];
  _$jscoverage['/control.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['570'] = [];
  _$jscoverage['/control.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['571'] = [];
  _$jscoverage['/control.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['574'] = [];
  _$jscoverage['/control.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['769'] = [];
  _$jscoverage['/control.js'].branchData['769'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['800'] = [];
  _$jscoverage['/control.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['849'] = [];
  _$jscoverage['/control.js'].branchData['849'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['889'] = [];
  _$jscoverage['/control.js'].branchData['889'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['889'][1].init(384, 6, 'xclass');
function visit102_889_1(result) {
  _$jscoverage['/control.js'].branchData['889'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['849'][1].init(110, 24, '!attrs || !attrs.xrender');
function visit101_849_1(result) {
  _$jscoverage['/control.js'].branchData['849'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['800'][1].init(167, 1, 'p');
function visit100_800_1(result) {
  _$jscoverage['/control.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['769'][1].init(57, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit99_769_1(result) {
  _$jscoverage['/control.js'].branchData['769'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['574'][1].init(172, 19, 'xy[1] !== undefined');
function visit98_574_1(result) {
  _$jscoverage['/control.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['571'][1].init(33, 19, 'xy[0] !== undefined');
function visit97_571_1(result) {
  _$jscoverage['/control.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['570'][1].init(119, 9, 'xy.length');
function visit96_570_1(result) {
  _$jscoverage['/control.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['472'][1].init(159, 7, 'v || []');
function visit95_472_1(result) {
  _$jscoverage['/control.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['469'][1].init(29, 21, 'typeof v === \'string\'');
function visit94_469_1(result) {
  _$jscoverage['/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['393'][1].init(241, 19, 'self.get(\'srcNode\')');
function visit93_393_1(result) {
  _$jscoverage['/control.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['391'][1].init(159, 9, 'self.view');
function visit92_391_1(result) {
  _$jscoverage['/control.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['379'][1].init(99, 21, 'self.get(\'focusable\')');
function visit91_379_1(result) {
  _$jscoverage['/control.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['367'][1].init(21, 21, '!this.get(\'disabled\')');
function visit90_367_1(result) {
  _$jscoverage['/control.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['360'][1].init(21, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit89_360_1(result) {
  _$jscoverage['/control.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['347'][1].init(54, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit88_347_1(result) {
  _$jscoverage['/control.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['331'][1].init(21, 21, '!this.get(\'disabled\')');
function visit87_331_1(result) {
  _$jscoverage['/control.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['316'][1].init(21, 21, '!this.get(\'disabled\')');
function visit86_316_1(result) {
  _$jscoverage['/control.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['303'][1].init(21, 21, '!this.get(\'disabled\')');
function visit85_303_1(result) {
  _$jscoverage['/control.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['297'][3].init(99, 14, 'ev.which === 1');
function visit84_297_3(result) {
  _$jscoverage['/control.js'].branchData['297'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['297'][2].init(99, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit83_297_2(result) {
  _$jscoverage['/control.js'].branchData['297'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['297'][1].init(76, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit82_297_1(result) {
  _$jscoverage['/control.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['282'][1].init(21, 21, '!this.get(\'disabled\')');
function visit81_282_1(result) {
  _$jscoverage['/control.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][5].init(354, 14, 'n !== \'button\'');
function visit80_274_5(result) {
  _$jscoverage['/control.js'].branchData['274'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][4].init(334, 16, 'n !== \'textarea\'');
function visit79_274_4(result) {
  _$jscoverage['/control.js'].branchData['274'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][3].init(334, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit78_274_3(result) {
  _$jscoverage['/control.js'].branchData['274'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][2].init(317, 13, 'n !== \'input\'');
function visit77_274_2(result) {
  _$jscoverage['/control.js'].branchData['274'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['274'][1].init(317, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit76_274_1(result) {
  _$jscoverage['/control.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['272'][1].init(188, 20, 'n && n.toLowerCase()');
function visit75_272_1(result) {
  _$jscoverage['/control.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['268'][1].init(256, 31, '!self.get(\'allowTextSelection\')');
function visit74_268_1(result) {
  _$jscoverage['/control.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['265'][1].init(147, 21, 'self.get(\'focusable\')');
function visit73_265_1(result) {
  _$jscoverage['/control.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['262'][1].init(25, 22, 'self.get(\'activeable\')');
function visit72_262_1(result) {
  _$jscoverage['/control.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['261'][1].init(135, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit71_261_1(result) {
  _$jscoverage['/control.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['260'][1].init(81, 14, 'ev.which === 1');
function visit70_260_1(result) {
  _$jscoverage['/control.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['244'][1].init(21, 21, '!this.get(\'disabled\')');
function visit69_244_1(result) {
  _$jscoverage['/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['227'][1].init(21, 21, '!this.get(\'disabled\')');
function visit68_227_1(result) {
  _$jscoverage['/control.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['212'][1].init(21, 21, '!this.get(\'disabled\')');
function visit67_212_1(result) {
  _$jscoverage['/control.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['195'][1].init(21, 21, '!this.get(\'disabled\')');
function visit66_195_1(result) {
  _$jscoverage['/control.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['182'][1].init(21, 21, 'this.get(\'focusable\')');
function visit65_182_1(result) {
  _$jscoverage['/control.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['176'][1].init(21, 21, 'this.get(\'focusable\')');
function visit64_176_1(result) {
  _$jscoverage['/control.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['131'][1].init(183, 45, 'target.ownerDocument.activeElement === target');
function visit63_131_1(result) {
  _$jscoverage['/control.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['126'][1].init(84, 1, 'v');
function visit62_126_1(result) {
  _$jscoverage['/control.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['121'][1].init(53, 14, 'parent || this');
function visit61_121_1(result) {
  _$jscoverage['/control.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['105'][1].init(882, 6, 'ie < 9');
function visit60_105_1(result) {
  _$jscoverage['/control.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['99'][1].init(616, 14, 'Gesture.cancel');
function visit59_99_1(result) {
  _$jscoverage['/control.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['89'][1].init(61, 22, '!isTouchEventSupported');
function visit58_89_1(result) {
  _$jscoverage['/control.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['86'][1].init(480, 29, 'self.get(\'handleMouseEvents\')');
function visit57_86_1(result) {
  _$jscoverage['/control.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['78'][1].init(111, 21, 'self.get(\'focusable\')');
function visit56_78_1(result) {
  _$jscoverage['/control.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['58'][1].init(623, 31, '!self.get(\'allowTextSelection\')');
function visit55_58_1(result) {
  _$jscoverage['/control.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['49'][1].init(295, 4, 'view');
function visit54_49_1(result) {
  _$jscoverage['/control.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var ComponentProcess = require('./control/process');
  _$jscoverage['/control.js'].lineData[9]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[10]++;
  var Render = require('./control/render');
  _$jscoverage['/control.js'].lineData[11]++;
  var ie = S.UA.ieMode, Features = S.Features, Gesture = Node.Gesture, isTouchGestureSupported = Features.isTouchGestureSupported(), isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/control.js'].lineData[22]++;
  var Control = ComponentProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[42]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get('id'), el;
  _$jscoverage['/control.js'].lineData[49]++;
  if (visit54_49_1(view)) {
    _$jscoverage['/control.js'].lineData[50]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[52]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[56]++;
  view.create();
  _$jscoverage['/control.js'].lineData[57]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[58]++;
  if (visit55_58_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[59]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[62]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[71]++;
  this.view.render();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[75]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[78]++;
  if (visit56_78_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[83]++;
    el.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[86]++;
  if (visit57_86_1(self.get('handleMouseEvents'))) {
    _$jscoverage['/control.js'].lineData[87]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[89]++;
    if (visit58_89_1(!isTouchEventSupported)) {
      _$jscoverage['/control.js'].lineData[92]++;
      el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self);
    }
    _$jscoverage['/control.js'].lineData[98]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[99]++;
    if (visit59_99_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[100]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[105]++;
    if (visit60_105_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[106]++;
      el.on('dblclick', self.handleDblClick, self);
    }
  }
}, 
  sync: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[113]++;
  self.fire('beforeSyncUI');
  _$jscoverage['/control.js'].lineData[114]++;
  self.syncUI();
  _$jscoverage['/control.js'].lineData[115]++;
  self.view.sync();
  _$jscoverage['/control.js'].lineData[116]++;
  self.__callPluginsMethod('pluginSyncUI');
  _$jscoverage['/control.js'].lineData[117]++;
  self.fire('afterSyncUI');
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[121]++;
  return Manager.createComponent(cfg, visit61_121_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[125]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[126]++;
  if (visit62_126_1(v)) {
    _$jscoverage['/control.js'].lineData[127]++;
    target.focus();
  } else {
    _$jscoverage['/control.js'].lineData[131]++;
    if (visit63_131_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[132]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[138]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[144]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[151]++;
  this.fire(v ? 'show' : 'hide');
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[159]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[160]++;
  self.render();
  _$jscoverage['/control.js'].lineData[161]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[162]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[170]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[171]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[172]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[176]++;
  if (visit64_176_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[177]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[182]++;
  if (visit65_182_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[183]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[188]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[195]++;
  if (visit66_195_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[196]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[208]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[212]++;
  if (visit67_212_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[213]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[223]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[227]++;
  if (visit68_227_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[228]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[238]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[239]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[240]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[244]++;
  if (visit69_244_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[245]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[258]++;
  var self = this, n, isMouseActionButton = visit70_260_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[261]++;
  if (visit71_261_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[262]++;
    if (visit72_262_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[263]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[265]++;
    if (visit73_265_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[266]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[268]++;
    if (visit74_268_1(!self.get('allowTextSelection'))) {
      _$jscoverage['/control.js'].lineData[271]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[272]++;
      n = visit75_272_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[274]++;
      if (visit76_274_1(visit77_274_2(n !== 'input') && visit78_274_3(visit79_274_4(n !== 'textarea') && visit80_274_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[275]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[282]++;
  if (visit81_282_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[283]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[295]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[297]++;
  if (visit82_297_1(self.get('active') && (visit83_297_2(visit84_297_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[298]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[303]++;
  if (visit85_303_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[304]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[316]++;
  if (visit86_316_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[317]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[326]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[327]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[331]++;
  if (visit87_331_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[332]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[341]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[342]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[346]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[347]++;
  if (visit88_347_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[348]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[349]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[351]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[360]++;
  if (visit89_360_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[361]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[363]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[367]++;
  if (visit90_367_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[368]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[378]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[379]++;
  if (visit91_379_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[380]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[388]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[390]++;
  Manager.removeComponent(self.get('id'));
  _$jscoverage['/control.js'].lineData[391]++;
  if (visit92_391_1(self.view)) {
    _$jscoverage['/control.js'].lineData[392]++;
    self.view.destroy();
  } else {
    _$jscoverage['/control.js'].lineData[393]++;
    if (visit93_393_1(self.get('srcNode'))) {
      _$jscoverage['/control.js'].lineData[394]++;
      self.get('srcNode').remove();
    }
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[405]++;
  return S.guid('ks-component');
}}, 
  content: {
  view: 1, 
  value: ''}, 
  width: {
  view: 1}, 
  height: {
  view: 1}, 
  elCls: {
  view: 1, 
  value: [], 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[469]++;
  if (visit94_469_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[470]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[472]++;
  return visit95_472_1(v || []);
}}, 
  elStyle: {
  view: 1, 
  value: {}}, 
  elAttrs: {
  view: 1, 
  value: {}}, 
  elBefore: {}, 
  el: {
  setter: function(el) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[522]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[523]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[568]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[570]++;
  if (visit96_570_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[571]++;
    if (visit97_571_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[572]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[574]++;
    if (visit98_574_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[575]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[578]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[581]++;
  return [this.get('x'), this.get('y')];
}}, 
  zIndex: {
  view: 1}, 
  render: {}, 
  visible: {
  sync: 0, 
  value: true, 
  view: 1}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[648]++;
  return Node.all(v);
}}, 
  handleMouseEvents: {
  value: true}, 
  focusable: {
  value: true, 
  view: 1}, 
  allowTextSelection: {
  value: false}, 
  activeable: {
  value: true}, 
  focused: {
  view: 1}, 
  active: {
  view: 1, 
  value: false}, 
  highlighted: {
  view: 1, 
  value: false}, 
  prefixCls: {
  view: 1, 
  value: visit99_769_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[797]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[798]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[800]++;
  if (visit100_800_1(p)) {
    _$jscoverage['/control.js'].lineData[801]++;
    this.addTarget(p);
  }
}}, 
  disabled: {
  view: 1, 
  value: false}, 
  xrender: {
  value: Render}, 
  view: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[837]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[843]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[844]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[846]++;
    do {
      _$jscoverage['/control.js'].lineData[847]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[848]++;
      constructor = constructor.superclass;
    } while (visit101_849_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[850]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[853]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[874]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[876]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[883]++;
  if ((xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[884]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[887]++;
  newClass = ComponentProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[889]++;
  if (visit102_889_1(xclass)) {
    _$jscoverage['/control.js'].lineData[890]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[893]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[894]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[896]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[899]++;
  return Control;
});
