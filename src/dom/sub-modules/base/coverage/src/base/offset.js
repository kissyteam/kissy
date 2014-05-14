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
if (! _$jscoverage['/base/offset.js']) {
  _$jscoverage['/base/offset.js'] = {};
  _$jscoverage['/base/offset.js'].lineData = [];
  _$jscoverage['/base/offset.js'].lineData[6] = 0;
  _$jscoverage['/base/offset.js'].lineData[7] = 0;
  _$jscoverage['/base/offset.js'].lineData[8] = 0;
  _$jscoverage['/base/offset.js'].lineData[9] = 0;
  _$jscoverage['/base/offset.js'].lineData[31] = 0;
  _$jscoverage['/base/offset.js'].lineData[54] = 0;
  _$jscoverage['/base/offset.js'].lineData[56] = 0;
  _$jscoverage['/base/offset.js'].lineData[57] = 0;
  _$jscoverage['/base/offset.js'].lineData[58] = 0;
  _$jscoverage['/base/offset.js'].lineData[59] = 0;
  _$jscoverage['/base/offset.js'].lineData[60] = 0;
  _$jscoverage['/base/offset.js'].lineData[62] = 0;
  _$jscoverage['/base/offset.js'].lineData[65] = 0;
  _$jscoverage['/base/offset.js'].lineData[66] = 0;
  _$jscoverage['/base/offset.js'].lineData[67] = 0;
  _$jscoverage['/base/offset.js'].lineData[68] = 0;
  _$jscoverage['/base/offset.js'].lineData[70] = 0;
  _$jscoverage['/base/offset.js'].lineData[88] = 0;
  _$jscoverage['/base/offset.js'].lineData[91] = 0;
  _$jscoverage['/base/offset.js'].lineData[92] = 0;
  _$jscoverage['/base/offset.js'].lineData[95] = 0;
  _$jscoverage['/base/offset.js'].lineData[96] = 0;
  _$jscoverage['/base/offset.js'].lineData[99] = 0;
  _$jscoverage['/base/offset.js'].lineData[100] = 0;
  _$jscoverage['/base/offset.js'].lineData[104] = 0;
  _$jscoverage['/base/offset.js'].lineData[105] = 0;
  _$jscoverage['/base/offset.js'].lineData[108] = 0;
  _$jscoverage['/base/offset.js'].lineData[109] = 0;
  _$jscoverage['/base/offset.js'].lineData[110] = 0;
  _$jscoverage['/base/offset.js'].lineData[111] = 0;
  _$jscoverage['/base/offset.js'].lineData[114] = 0;
  _$jscoverage['/base/offset.js'].lineData[116] = 0;
  _$jscoverage['/base/offset.js'].lineData[131] = 0;
  _$jscoverage['/base/offset.js'].lineData[132] = 0;
  _$jscoverage['/base/offset.js'].lineData[133] = 0;
  _$jscoverage['/base/offset.js'].lineData[134] = 0;
  _$jscoverage['/base/offset.js'].lineData[135] = 0;
  _$jscoverage['/base/offset.js'].lineData[140] = 0;
  _$jscoverage['/base/offset.js'].lineData[144] = 0;
  _$jscoverage['/base/offset.js'].lineData[148] = 0;
  _$jscoverage['/base/offset.js'].lineData[150] = 0;
  _$jscoverage['/base/offset.js'].lineData[151] = 0;
  _$jscoverage['/base/offset.js'].lineData[152] = 0;
  _$jscoverage['/base/offset.js'].lineData[153] = 0;
  _$jscoverage['/base/offset.js'].lineData[159] = 0;
  _$jscoverage['/base/offset.js'].lineData[165] = 0;
  _$jscoverage['/base/offset.js'].lineData[175] = 0;
  _$jscoverage['/base/offset.js'].lineData[176] = 0;
  _$jscoverage['/base/offset.js'].lineData[178] = 0;
  _$jscoverage['/base/offset.js'].lineData[179] = 0;
  _$jscoverage['/base/offset.js'].lineData[180] = 0;
  _$jscoverage['/base/offset.js'].lineData[181] = 0;
  _$jscoverage['/base/offset.js'].lineData[184] = 0;
  _$jscoverage['/base/offset.js'].lineData[185] = 0;
  _$jscoverage['/base/offset.js'].lineData[187] = 0;
  _$jscoverage['/base/offset.js'].lineData[192] = 0;
  _$jscoverage['/base/offset.js'].lineData[193] = 0;
  _$jscoverage['/base/offset.js'].lineData[194] = 0;
  _$jscoverage['/base/offset.js'].lineData[196] = 0;
  _$jscoverage['/base/offset.js'].lineData[200] = 0;
  _$jscoverage['/base/offset.js'].lineData[201] = 0;
  _$jscoverage['/base/offset.js'].lineData[202] = 0;
  _$jscoverage['/base/offset.js'].lineData[204] = 0;
  _$jscoverage['/base/offset.js'].lineData[205] = 0;
  _$jscoverage['/base/offset.js'].lineData[206] = 0;
  _$jscoverage['/base/offset.js'].lineData[207] = 0;
  _$jscoverage['/base/offset.js'].lineData[210] = 0;
  _$jscoverage['/base/offset.js'].lineData[211] = 0;
  _$jscoverage['/base/offset.js'].lineData[213] = 0;
  _$jscoverage['/base/offset.js'].lineData[218] = 0;
  _$jscoverage['/base/offset.js'].lineData[219] = 0;
  _$jscoverage['/base/offset.js'].lineData[220] = 0;
  _$jscoverage['/base/offset.js'].lineData[222] = 0;
  _$jscoverage['/base/offset.js'].lineData[275] = 0;
  _$jscoverage['/base/offset.js'].lineData[276] = 0;
  _$jscoverage['/base/offset.js'].lineData[278] = 0;
  _$jscoverage['/base/offset.js'].lineData[279] = 0;
  _$jscoverage['/base/offset.js'].lineData[281] = 0;
  _$jscoverage['/base/offset.js'].lineData[283] = 0;
  _$jscoverage['/base/offset.js'].lineData[284] = 0;
  _$jscoverage['/base/offset.js'].lineData[289] = 0;
  _$jscoverage['/base/offset.js'].lineData[290] = 0;
  _$jscoverage['/base/offset.js'].lineData[291] = 0;
  _$jscoverage['/base/offset.js'].lineData[293] = 0;
  _$jscoverage['/base/offset.js'].lineData[296] = 0;
  _$jscoverage['/base/offset.js'].lineData[297] = 0;
  _$jscoverage['/base/offset.js'].lineData[298] = 0;
  _$jscoverage['/base/offset.js'].lineData[300] = 0;
  _$jscoverage['/base/offset.js'].lineData[301] = 0;
  _$jscoverage['/base/offset.js'].lineData[302] = 0;
  _$jscoverage['/base/offset.js'].lineData[307] = 0;
  _$jscoverage['/base/offset.js'].lineData[308] = 0;
  _$jscoverage['/base/offset.js'].lineData[309] = 0;
  _$jscoverage['/base/offset.js'].lineData[311] = 0;
  _$jscoverage['/base/offset.js'].lineData[312] = 0;
  _$jscoverage['/base/offset.js'].lineData[314] = 0;
  _$jscoverage['/base/offset.js'].lineData[319] = 0;
  _$jscoverage['/base/offset.js'].lineData[324] = 0;
  _$jscoverage['/base/offset.js'].lineData[325] = 0;
  _$jscoverage['/base/offset.js'].lineData[326] = 0;
  _$jscoverage['/base/offset.js'].lineData[327] = 0;
  _$jscoverage['/base/offset.js'].lineData[328] = 0;
  _$jscoverage['/base/offset.js'].lineData[337] = 0;
  _$jscoverage['/base/offset.js'].lineData[338] = 0;
  _$jscoverage['/base/offset.js'].lineData[339] = 0;
  _$jscoverage['/base/offset.js'].lineData[340] = 0;
  _$jscoverage['/base/offset.js'].lineData[342] = 0;
  _$jscoverage['/base/offset.js'].lineData[343] = 0;
  _$jscoverage['/base/offset.js'].lineData[346] = 0;
  _$jscoverage['/base/offset.js'].lineData[353] = 0;
  _$jscoverage['/base/offset.js'].lineData[358] = 0;
  _$jscoverage['/base/offset.js'].lineData[359] = 0;
  _$jscoverage['/base/offset.js'].lineData[363] = 0;
  _$jscoverage['/base/offset.js'].lineData[364] = 0;
  _$jscoverage['/base/offset.js'].lineData[371] = 0;
  _$jscoverage['/base/offset.js'].lineData[377] = 0;
  _$jscoverage['/base/offset.js'].lineData[378] = 0;
  _$jscoverage['/base/offset.js'].lineData[400] = 0;
  _$jscoverage['/base/offset.js'].lineData[401] = 0;
  _$jscoverage['/base/offset.js'].lineData[403] = 0;
  _$jscoverage['/base/offset.js'].lineData[406] = 0;
  _$jscoverage['/base/offset.js'].lineData[407] = 0;
  _$jscoverage['/base/offset.js'].lineData[409] = 0;
  _$jscoverage['/base/offset.js'].lineData[410] = 0;
  _$jscoverage['/base/offset.js'].lineData[411] = 0;
  _$jscoverage['/base/offset.js'].lineData[415] = 0;
  _$jscoverage['/base/offset.js'].lineData[416] = 0;
  _$jscoverage['/base/offset.js'].lineData[423] = 0;
  _$jscoverage['/base/offset.js'].lineData[425] = 0;
  _$jscoverage['/base/offset.js'].lineData[432] = 0;
  _$jscoverage['/base/offset.js'].lineData[435] = 0;
  _$jscoverage['/base/offset.js'].lineData[436] = 0;
  _$jscoverage['/base/offset.js'].lineData[442] = 0;
  _$jscoverage['/base/offset.js'].lineData[446] = 0;
  _$jscoverage['/base/offset.js'].lineData[448] = 0;
  _$jscoverage['/base/offset.js'].lineData[449] = 0;
  _$jscoverage['/base/offset.js'].lineData[452] = 0;
  _$jscoverage['/base/offset.js'].lineData[456] = 0;
  _$jscoverage['/base/offset.js'].lineData[457] = 0;
  _$jscoverage['/base/offset.js'].lineData[458] = 0;
  _$jscoverage['/base/offset.js'].lineData[460] = 0;
  _$jscoverage['/base/offset.js'].lineData[463] = 0;
}
if (! _$jscoverage['/base/offset.js'].functionData) {
  _$jscoverage['/base/offset.js'].functionData = [];
  _$jscoverage['/base/offset.js'].functionData[0] = 0;
  _$jscoverage['/base/offset.js'].functionData[1] = 0;
  _$jscoverage['/base/offset.js'].functionData[2] = 0;
  _$jscoverage['/base/offset.js'].functionData[3] = 0;
  _$jscoverage['/base/offset.js'].functionData[4] = 0;
  _$jscoverage['/base/offset.js'].functionData[5] = 0;
  _$jscoverage['/base/offset.js'].functionData[6] = 0;
  _$jscoverage['/base/offset.js'].functionData[7] = 0;
  _$jscoverage['/base/offset.js'].functionData[8] = 0;
  _$jscoverage['/base/offset.js'].functionData[9] = 0;
  _$jscoverage['/base/offset.js'].functionData[10] = 0;
  _$jscoverage['/base/offset.js'].functionData[11] = 0;
}
if (! _$jscoverage['/base/offset.js'].branchData) {
  _$jscoverage['/base/offset.js'].branchData = {};
  _$jscoverage['/base/offset.js'].branchData['13'] = [];
  _$jscoverage['/base/offset.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['56'] = [];
  _$jscoverage['/base/offset.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['59'] = [];
  _$jscoverage['/base/offset.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['66'] = [];
  _$jscoverage['/base/offset.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['91'] = [];
  _$jscoverage['/base/offset.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['95'] = [];
  _$jscoverage['/base/offset.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['99'] = [];
  _$jscoverage['/base/offset.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['104'] = [];
  _$jscoverage['/base/offset.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['108'] = [];
  _$jscoverage['/base/offset.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['114'] = [];
  _$jscoverage['/base/offset.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['131'] = [];
  _$jscoverage['/base/offset.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['161'] = [];
  _$jscoverage['/base/offset.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['163'] = [];
  _$jscoverage['/base/offset.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['168'] = [];
  _$jscoverage['/base/offset.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['171'] = [];
  _$jscoverage['/base/offset.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['175'] = [];
  _$jscoverage['/base/offset.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['176'] = [];
  _$jscoverage['/base/offset.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['176'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['176'][3] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['178'] = [];
  _$jscoverage['/base/offset.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['180'] = [];
  _$jscoverage['/base/offset.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['184'] = [];
  _$jscoverage['/base/offset.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['192'] = [];
  _$jscoverage['/base/offset.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['193'] = [];
  _$jscoverage['/base/offset.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['200'] = [];
  _$jscoverage['/base/offset.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['201'] = [];
  _$jscoverage['/base/offset.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['202'] = [];
  _$jscoverage['/base/offset.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['202'][3] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['204'] = [];
  _$jscoverage['/base/offset.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['206'] = [];
  _$jscoverage['/base/offset.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['210'] = [];
  _$jscoverage['/base/offset.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['218'] = [];
  _$jscoverage['/base/offset.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['219'] = [];
  _$jscoverage['/base/offset.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['279'] = [];
  _$jscoverage['/base/offset.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['289'] = [];
  _$jscoverage['/base/offset.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['290'] = [];
  _$jscoverage['/base/offset.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['297'] = [];
  _$jscoverage['/base/offset.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['300'] = [];
  _$jscoverage['/base/offset.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['301'] = [];
  _$jscoverage['/base/offset.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['308'] = [];
  _$jscoverage['/base/offset.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['312'] = [];
  _$jscoverage['/base/offset.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['342'] = [];
  _$jscoverage['/base/offset.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['353'] = [];
  _$jscoverage['/base/offset.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['353'][3] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['354'] = [];
  _$jscoverage['/base/offset.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['354'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['363'] = [];
  _$jscoverage['/base/offset.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['400'] = [];
  _$jscoverage['/base/offset.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['400'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['401'] = [];
  _$jscoverage['/base/offset.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['401'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['423'] = [];
  _$jscoverage['/base/offset.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['432'] = [];
  _$jscoverage['/base/offset.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['437'] = [];
  _$jscoverage['/base/offset.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['438'] = [];
  _$jscoverage['/base/offset.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['438'][2] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['439'] = [];
  _$jscoverage['/base/offset.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['448'] = [];
  _$jscoverage['/base/offset.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/base/offset.js'].branchData['457'] = [];
  _$jscoverage['/base/offset.js'].branchData['457'][1] = new BranchData();
}
_$jscoverage['/base/offset.js'].branchData['457'][1].init(24, 35, 'parseFloat(Dom.css(elem, key)) || 0');
function visit330_457_1(result) {
  _$jscoverage['/base/offset.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['448'][1].init(91, 36, 'Dom.css(elem, POSITION) === \'static\'');
function visit329_448_1(result) {
  _$jscoverage['/base/offset.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['439'][1].init(42, 85, '(currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)');
function visit328_439_1(result) {
  _$jscoverage['/base/offset.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['438'][2].init(961, 25, 'currentWin != relativeWin');
function visit327_438_2(result) {
  _$jscoverage['/base/offset.js'].branchData['438'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['438'][1].init(26, 128, 'currentWin != relativeWin && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)');
function visit326_438_1(result) {
  _$jscoverage['/base/offset.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['437'][1].init(596, 155, 'currentWin && currentWin != relativeWin && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)');
function visit325_437_1(result) {
  _$jscoverage['/base/offset.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['432'][1].init(372, 25, 'currentWin == relativeWin');
function visit324_432_1(result) {
  _$jscoverage['/base/offset.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['423'][1].init(297, 25, 'relativeWin || currentWin');
function visit323_423_1(result) {
  _$jscoverage['/base/offset.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['401'][2].init(1835, 19, 'body.clientTop || 0');
function visit322_401_2(result) {
  _$jscoverage['/base/offset.js'].branchData['401'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['401'][1].init(1814, 40, 'docElem.clientTop || body.clientTop || 0');
function visit321_401_1(result) {
  _$jscoverage['/base/offset.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['400'][2].init(1778, 20, 'body.clientLeft || 0');
function visit320_400_2(result) {
  _$jscoverage['/base/offset.js'].branchData['400'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['400'][1].init(1756, 42, 'docElem.clientLeft || body.clientLeft || 0');
function visit319_400_1(result) {
  _$jscoverage['/base/offset.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['363'][1].init(109, 27, '!elem.getBoundingClientRect');
function visit318_363_1(result) {
  _$jscoverage['/base/offset.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['354'][2].init(733, 20, 'body && body[prop]');
function visit317_354_2(result) {
  _$jscoverage['/base/offset.js'].branchData['354'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['354'][1].init(73, 43, 'body && body[prop] || documentElementProp');
function visit316_354_1(result) {
  _$jscoverage['/base/offset.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['353'][3].init(657, 30, 'doc[compatMode] === CSS1Compat');
function visit315_353_3(result) {
  _$jscoverage['/base/offset.js'].branchData['353'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['353'][2].init(657, 53, 'doc[compatMode] === CSS1Compat && documentElementProp');
function visit314_353_2(result) {
  _$jscoverage['/base/offset.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['353'][1].init(657, 117, 'doc[compatMode] === CSS1Compat && documentElementProp || body && body[prop] || documentElementProp');
function visit313_353_1(result) {
  _$jscoverage['/base/offset.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['342'][1].init(207, 16, 'UA.mobile && ret');
function visit312_342_1(result) {
  _$jscoverage['/base/offset.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['312'][1].init(176, 23, 'typeof ret !== \'number\'');
function visit311_312_1(result) {
  _$jscoverage['/base/offset.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['308'][1].init(234, 23, 'typeof ret !== \'number\'');
function visit310_308_1(result) {
  _$jscoverage['/base/offset.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['301'][1].init(185, 14, 'name === \'Top\'');
function visit309_301_1(result) {
  _$jscoverage['/base/offset.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['300'][1].init(117, 15, 'name === \'Left\'');
function visit308_300_1(result) {
  _$jscoverage['/base/offset.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['297'][1].init(60, 15, 'v !== undefined');
function visit307_297_1(result) {
  _$jscoverage['/base/offset.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['290'][1].init(22, 15, 'v !== undefined');
function visit306_290_1(result) {
  _$jscoverage['/base/offset.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['289'][2].init(322, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit305_289_2(result) {
  _$jscoverage['/base/offset.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['289'][1].init(314, 47, 'elem && elem.nodeType === NodeType.ELEMENT_NODE');
function visit304_289_1(result) {
  _$jscoverage['/base/offset.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['279'][1].init(18, 24, 'typeof elem === \'number\'');
function visit303_279_1(result) {
  _$jscoverage['/base/offset.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['219'][1].init(122, 12, 'alignWithTop');
function visit302_219_1(result) {
  _$jscoverage['/base/offset.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['218'][1].init(41, 26, 'alignWithTop === undefined');
function visit301_218_1(result) {
  _$jscoverage['/base/offset.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['210'][1].init(79, 16, 'diffTop.left < 0');
function visit300_210_1(result) {
  _$jscoverage['/base/offset.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['206'][1].init(234, 22, 'alignWithTop === false');
function visit299_206_1(result) {
  _$jscoverage['/base/offset.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['204'][1].init(71, 21, 'alignWithTop === true');
function visit298_204_1(result) {
  _$jscoverage['/base/offset.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['202'][3].init(50, 19, 'diffBottom.left > 0');
function visit297_202_3(result) {
  _$jscoverage['/base/offset.js'].branchData['202'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['202'][2].init(30, 16, 'diffTop.left < 0');
function visit296_202_2(result) {
  _$jscoverage['/base/offset.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['202'][1].init(30, 39, 'diffTop.left < 0 || diffBottom.left > 0');
function visit295_202_1(result) {
  _$jscoverage['/base/offset.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['201'][1].init(26, 18, 'onlyScrollIfNeeded');
function visit294_201_1(result) {
  _$jscoverage['/base/offset.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['200'][1].init(4932, 21, 'allowHorizontalScroll');
function visit293_200_1(result) {
  _$jscoverage['/base/offset.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['193'][1].init(114, 12, 'alignWithTop');
function visit292_193_1(result) {
  _$jscoverage['/base/offset.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['192'][1].init(37, 26, 'alignWithTop === undefined');
function visit291_192_1(result) {
  _$jscoverage['/base/offset.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['184'][1].init(71, 15, 'diffTop.top < 0');
function visit290_184_1(result) {
  _$jscoverage['/base/offset.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['180'][1].init(215, 22, 'alignWithTop === false');
function visit289_180_1(result) {
  _$jscoverage['/base/offset.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['178'][1].init(63, 21, 'alignWithTop === true');
function visit288_178_1(result) {
  _$jscoverage['/base/offset.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['176'][3].init(45, 18, 'diffBottom.top > 0');
function visit287_176_3(result) {
  _$jscoverage['/base/offset.js'].branchData['176'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['176'][2].init(26, 15, 'diffTop.top < 0');
function visit286_176_2(result) {
  _$jscoverage['/base/offset.js'].branchData['176'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['176'][1].init(26, 37, 'diffTop.top < 0 || diffBottom.top > 0');
function visit285_176_1(result) {
  _$jscoverage['/base/offset.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['175'][1].init(3654, 18, 'onlyScrollIfNeeded');
function visit284_175_1(result) {
  _$jscoverage['/base/offset.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['171'][1].init(61, 56, 'parseFloat(Dom.css(container, \'borderBottomWidth\')) || 0');
function visit283_171_1(result) {
  _$jscoverage['/base/offset.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['168'][1].init(62, 55, 'parseFloat(Dom.css(container, \'borderRightWidth\')) || 0');
function visit282_168_1(result) {
  _$jscoverage['/base/offset.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['163'][1].init(52, 53, 'parseFloat(Dom.css(container, \'borderTopWidth\')) || 0');
function visit281_163_1(result) {
  _$jscoverage['/base/offset.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['161'][1].init(53, 54, 'parseFloat(Dom.css(container, \'borderLeftWidth\')) || 0');
function visit280_161_1(result) {
  _$jscoverage['/base/offset.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['131'][1].init(1509, 5, 'isWin');
function visit279_131_1(result) {
  _$jscoverage['/base/offset.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['114'][1].init(915, 35, 'allowHorizontalScroll === undefined');
function visit278_114_1(result) {
  _$jscoverage['/base/offset.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['108'][1].init(598, 32, 'util.isPlainObject(alignWithTop)');
function visit277_108_1(result) {
  _$jscoverage['/base/offset.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['104'][1].init(452, 45, 'container.nodeType === NodeType.DOCUMENT_NODE');
function visit276_104_1(result) {
  _$jscoverage['/base/offset.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['99'][1].init(302, 10, '!container');
function visit275_99_1(result) {
  _$jscoverage['/base/offset.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['95'][1].init(194, 9, 'container');
function visit274_95_1(result) {
  _$jscoverage['/base/offset.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['91'][1].init(92, 27, '!(elem = Dom.get(selector))');
function visit273_91_1(result) {
  _$jscoverage['/base/offset.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['66'][1].init(471, 6, 'i >= 0');
function visit272_66_1(result) {
  _$jscoverage['/base/offset.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['59'][1].init(103, 4, 'elem');
function visit271_59_1(result) {
  _$jscoverage['/base/offset.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['56'][1].init(76, 25, 'coordinates === undefined');
function visit270_56_1(result) {
  _$jscoverage['/base/offset.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].branchData['13'][1].init(132, 26, 'doc && doc.documentElement');
function visit269_13_1(result) {
  _$jscoverage['/base/offset.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/offset.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/offset.js'].functionData[0]++;
  _$jscoverage['/base/offset.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/base/offset.js'].lineData[8]++;
  var Dom = require('./api');
  _$jscoverage['/base/offset.js'].lineData[9]++;
  var win = S.Env.host, UA = require('ua'), doc = win.document, NodeType = Dom.NodeType, docElem = visit269_13_1(doc && doc.documentElement), getWindow = Dom.getWindow, CSS1Compat = 'CSS1Compat', compatMode = 'compatMode', MAX = Math.max, POSITION = 'position', RELATIVE = 'relative', DOCUMENT = 'document', BODY = 'body', DOC_ELEMENT = 'documentElement', VIEWPORT = 'viewport', SCROLL = 'scroll', CLIENT = 'client', LEFT = 'left', TOP = 'top', SCROLL_LEFT = SCROLL + 'Left', SCROLL_TOP = SCROLL + 'Top';
  _$jscoverage['/base/offset.js'].lineData[31]++;
  util.mix(Dom, {
  offset: function(selector, coordinates, relativeWin) {
  _$jscoverage['/base/offset.js'].functionData[1]++;
  _$jscoverage['/base/offset.js'].lineData[54]++;
  var elem;
  _$jscoverage['/base/offset.js'].lineData[56]++;
  if (visit270_56_1(coordinates === undefined)) {
    _$jscoverage['/base/offset.js'].lineData[57]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/offset.js'].lineData[58]++;
    var ret;
    _$jscoverage['/base/offset.js'].lineData[59]++;
    if (visit271_59_1(elem)) {
      _$jscoverage['/base/offset.js'].lineData[60]++;
      ret = getOffset(elem, relativeWin);
    }
    _$jscoverage['/base/offset.js'].lineData[62]++;
    return ret;
  }
  _$jscoverage['/base/offset.js'].lineData[65]++;
  var els = Dom.query(selector), i;
  _$jscoverage['/base/offset.js'].lineData[66]++;
  for (i = els.length - 1; visit272_66_1(i >= 0); i--) {
    _$jscoverage['/base/offset.js'].lineData[67]++;
    elem = els[i];
    _$jscoverage['/base/offset.js'].lineData[68]++;
    setOffset(elem, coordinates);
  }
  _$jscoverage['/base/offset.js'].lineData[70]++;
  return undefined;
}, 
  scrollIntoView: function(selector, container, alignWithTop, allowHorizontalScroll) {
  _$jscoverage['/base/offset.js'].functionData[2]++;
  _$jscoverage['/base/offset.js'].lineData[88]++;
  var elem, onlyScrollIfNeeded;
  _$jscoverage['/base/offset.js'].lineData[91]++;
  if (visit273_91_1(!(elem = Dom.get(selector)))) {
    _$jscoverage['/base/offset.js'].lineData[92]++;
    return;
  }
  _$jscoverage['/base/offset.js'].lineData[95]++;
  if (visit274_95_1(container)) {
    _$jscoverage['/base/offset.js'].lineData[96]++;
    container = Dom.get(container);
  }
  _$jscoverage['/base/offset.js'].lineData[99]++;
  if (visit275_99_1(!container)) {
    _$jscoverage['/base/offset.js'].lineData[100]++;
    container = elem.ownerDocument;
  }
  _$jscoverage['/base/offset.js'].lineData[104]++;
  if (visit276_104_1(container.nodeType === NodeType.DOCUMENT_NODE)) {
    _$jscoverage['/base/offset.js'].lineData[105]++;
    container = getWindow(container);
  }
  _$jscoverage['/base/offset.js'].lineData[108]++;
  if (visit277_108_1(util.isPlainObject(alignWithTop))) {
    _$jscoverage['/base/offset.js'].lineData[109]++;
    allowHorizontalScroll = alignWithTop.allowHorizontalScroll;
    _$jscoverage['/base/offset.js'].lineData[110]++;
    onlyScrollIfNeeded = alignWithTop.onlyScrollIfNeeded;
    _$jscoverage['/base/offset.js'].lineData[111]++;
    alignWithTop = alignWithTop.alignWithTop;
  }
  _$jscoverage['/base/offset.js'].lineData[114]++;
  allowHorizontalScroll = visit278_114_1(allowHorizontalScroll === undefined) ? true : allowHorizontalScroll;
  _$jscoverage['/base/offset.js'].lineData[116]++;
  var isWin = util.isWindow(container), elemOffset = Dom.offset(elem), eh = Dom.outerHeight(elem), ew = Dom.outerWidth(elem), containerOffset, ch, cw, containerScroll, diffTop, diffBottom, win, winScroll, ww, wh;
  _$jscoverage['/base/offset.js'].lineData[131]++;
  if (visit279_131_1(isWin)) {
    _$jscoverage['/base/offset.js'].lineData[132]++;
    win = container;
    _$jscoverage['/base/offset.js'].lineData[133]++;
    wh = Dom.height(win);
    _$jscoverage['/base/offset.js'].lineData[134]++;
    ww = Dom.width(win);
    _$jscoverage['/base/offset.js'].lineData[135]++;
    winScroll = {
  left: Dom.scrollLeft(win), 
  top: Dom.scrollTop(win)};
    _$jscoverage['/base/offset.js'].lineData[140]++;
    diffTop = {
  left: elemOffset[LEFT] - winScroll[LEFT], 
  top: elemOffset[TOP] - winScroll[TOP]};
    _$jscoverage['/base/offset.js'].lineData[144]++;
    diffBottom = {
  left: elemOffset[LEFT] + ew - (winScroll[LEFT] + ww), 
  top: elemOffset[TOP] + eh - (winScroll[TOP] + wh)};
    _$jscoverage['/base/offset.js'].lineData[148]++;
    containerScroll = winScroll;
  } else {
    _$jscoverage['/base/offset.js'].lineData[150]++;
    containerOffset = Dom.offset(container);
    _$jscoverage['/base/offset.js'].lineData[151]++;
    ch = container.clientHeight;
    _$jscoverage['/base/offset.js'].lineData[152]++;
    cw = container.clientWidth;
    _$jscoverage['/base/offset.js'].lineData[153]++;
    containerScroll = {
  left: Dom.scrollLeft(container), 
  top: Dom.scrollTop(container)};
    _$jscoverage['/base/offset.js'].lineData[159]++;
    diffTop = {
  left: elemOffset[LEFT] - (containerOffset[LEFT] + (visit280_161_1(parseFloat(Dom.css(container, 'borderLeftWidth')) || 0))), 
  top: elemOffset[TOP] - (containerOffset[TOP] + (visit281_163_1(parseFloat(Dom.css(container, 'borderTopWidth')) || 0)))};
    _$jscoverage['/base/offset.js'].lineData[165]++;
    diffBottom = {
  left: elemOffset[LEFT] + ew - (containerOffset[LEFT] + cw + (visit282_168_1(parseFloat(Dom.css(container, 'borderRightWidth')) || 0))), 
  top: elemOffset[TOP] + eh - (containerOffset[TOP] + ch + (visit283_171_1(parseFloat(Dom.css(container, 'borderBottomWidth')) || 0)))};
  }
  _$jscoverage['/base/offset.js'].lineData[175]++;
  if (visit284_175_1(onlyScrollIfNeeded)) {
    _$jscoverage['/base/offset.js'].lineData[176]++;
    if (visit285_176_1(visit286_176_2(diffTop.top < 0) || visit287_176_3(diffBottom.top > 0))) {
      _$jscoverage['/base/offset.js'].lineData[178]++;
      if (visit288_178_1(alignWithTop === true)) {
        _$jscoverage['/base/offset.js'].lineData[179]++;
        Dom.scrollTop(container, containerScroll.top + diffTop.top);
      } else {
        _$jscoverage['/base/offset.js'].lineData[180]++;
        if (visit289_180_1(alignWithTop === false)) {
          _$jscoverage['/base/offset.js'].lineData[181]++;
          Dom.scrollTop(container, containerScroll.top + diffBottom.top);
        } else {
          _$jscoverage['/base/offset.js'].lineData[184]++;
          if (visit290_184_1(diffTop.top < 0)) {
            _$jscoverage['/base/offset.js'].lineData[185]++;
            Dom.scrollTop(container, containerScroll.top + diffTop.top);
          } else {
            _$jscoverage['/base/offset.js'].lineData[187]++;
            Dom.scrollTop(container, containerScroll.top + diffBottom.top);
          }
        }
      }
    }
  } else {
    _$jscoverage['/base/offset.js'].lineData[192]++;
    alignWithTop = visit291_192_1(alignWithTop === undefined) ? true : !!alignWithTop;
    _$jscoverage['/base/offset.js'].lineData[193]++;
    if (visit292_193_1(alignWithTop)) {
      _$jscoverage['/base/offset.js'].lineData[194]++;
      Dom.scrollTop(container, containerScroll.top + diffTop.top);
    } else {
      _$jscoverage['/base/offset.js'].lineData[196]++;
      Dom.scrollTop(container, containerScroll.top + diffBottom.top);
    }
  }
  _$jscoverage['/base/offset.js'].lineData[200]++;
  if (visit293_200_1(allowHorizontalScroll)) {
    _$jscoverage['/base/offset.js'].lineData[201]++;
    if (visit294_201_1(onlyScrollIfNeeded)) {
      _$jscoverage['/base/offset.js'].lineData[202]++;
      if (visit295_202_1(visit296_202_2(diffTop.left < 0) || visit297_202_3(diffBottom.left > 0))) {
        _$jscoverage['/base/offset.js'].lineData[204]++;
        if (visit298_204_1(alignWithTop === true)) {
          _$jscoverage['/base/offset.js'].lineData[205]++;
          Dom.scrollLeft(container, containerScroll.left + diffTop.left);
        } else {
          _$jscoverage['/base/offset.js'].lineData[206]++;
          if (visit299_206_1(alignWithTop === false)) {
            _$jscoverage['/base/offset.js'].lineData[207]++;
            Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
          } else {
            _$jscoverage['/base/offset.js'].lineData[210]++;
            if (visit300_210_1(diffTop.left < 0)) {
              _$jscoverage['/base/offset.js'].lineData[211]++;
              Dom.scrollLeft(container, containerScroll.left + diffTop.left);
            } else {
              _$jscoverage['/base/offset.js'].lineData[213]++;
              Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
            }
          }
        }
      }
    } else {
      _$jscoverage['/base/offset.js'].lineData[218]++;
      alignWithTop = visit301_218_1(alignWithTop === undefined) ? true : !!alignWithTop;
      _$jscoverage['/base/offset.js'].lineData[219]++;
      if (visit302_219_1(alignWithTop)) {
        _$jscoverage['/base/offset.js'].lineData[220]++;
        Dom.scrollLeft(container, containerScroll.left + diffTop.left);
      } else {
        _$jscoverage['/base/offset.js'].lineData[222]++;
        Dom.scrollLeft(container, containerScroll.left + diffBottom.left);
      }
    }
  }
}, 
  docWidth: 0, 
  docHeight: 0, 
  viewportHeight: 0, 
  viewportWidth: 0, 
  scrollTop: 0, 
  scrollLeft: 0});
  _$jscoverage['/base/offset.js'].lineData[275]++;
  util.each(['Left', 'Top'], function(name, i) {
  _$jscoverage['/base/offset.js'].functionData[3]++;
  _$jscoverage['/base/offset.js'].lineData[276]++;
  var method = SCROLL + name;
  _$jscoverage['/base/offset.js'].lineData[278]++;
  Dom[method] = function(elem, v) {
  _$jscoverage['/base/offset.js'].functionData[4]++;
  _$jscoverage['/base/offset.js'].lineData[279]++;
  if (visit303_279_1(typeof elem === 'number')) {
    _$jscoverage['/base/offset.js'].lineData[281]++;
    return arguments.callee(win, elem);
  }
  _$jscoverage['/base/offset.js'].lineData[283]++;
  elem = Dom.get(elem);
  _$jscoverage['/base/offset.js'].lineData[284]++;
  var ret, left, top, w, d;
  _$jscoverage['/base/offset.js'].lineData[289]++;
  if (visit304_289_1(elem && visit305_289_2(elem.nodeType === NodeType.ELEMENT_NODE))) {
    _$jscoverage['/base/offset.js'].lineData[290]++;
    if (visit306_290_1(v !== undefined)) {
      _$jscoverage['/base/offset.js'].lineData[291]++;
      elem[method] = parseFloat(v);
    } else {
      _$jscoverage['/base/offset.js'].lineData[293]++;
      ret = elem[method];
    }
  } else {
    _$jscoverage['/base/offset.js'].lineData[296]++;
    w = getWindow(elem);
    _$jscoverage['/base/offset.js'].lineData[297]++;
    if (visit307_297_1(v !== undefined)) {
      _$jscoverage['/base/offset.js'].lineData[298]++;
      v = parseFloat(v);
      _$jscoverage['/base/offset.js'].lineData[300]++;
      left = visit308_300_1(name === 'Left') ? v : Dom.scrollLeft(w);
      _$jscoverage['/base/offset.js'].lineData[301]++;
      top = visit309_301_1(name === 'Top') ? v : Dom.scrollTop(w);
      _$jscoverage['/base/offset.js'].lineData[302]++;
      w.scrollTo(left, top);
    } else {
      _$jscoverage['/base/offset.js'].lineData[307]++;
      ret = w['page' + (i ? 'Y' : 'X') + 'Offset'];
      _$jscoverage['/base/offset.js'].lineData[308]++;
      if (visit310_308_1(typeof ret !== 'number')) {
        _$jscoverage['/base/offset.js'].lineData[309]++;
        d = w[DOCUMENT];
        _$jscoverage['/base/offset.js'].lineData[311]++;
        ret = d[DOC_ELEMENT][method];
        _$jscoverage['/base/offset.js'].lineData[312]++;
        if (visit311_312_1(typeof ret !== 'number')) {
          _$jscoverage['/base/offset.js'].lineData[314]++;
          ret = d[BODY][method];
        }
      }
    }
  }
  _$jscoverage['/base/offset.js'].lineData[319]++;
  return ret;
};
});
  _$jscoverage['/base/offset.js'].lineData[324]++;
  util.each(['Width', 'Height'], function(name) {
  _$jscoverage['/base/offset.js'].functionData[5]++;
  _$jscoverage['/base/offset.js'].lineData[325]++;
  Dom['doc' + name] = function(refWin) {
  _$jscoverage['/base/offset.js'].functionData[6]++;
  _$jscoverage['/base/offset.js'].lineData[326]++;
  refWin = Dom.get(refWin);
  _$jscoverage['/base/offset.js'].lineData[327]++;
  var d = Dom.getDocument(refWin);
  _$jscoverage['/base/offset.js'].lineData[328]++;
  return MAX(d[DOC_ELEMENT][SCROLL + name], d[BODY][SCROLL + name], Dom[VIEWPORT + name](d));
};
  _$jscoverage['/base/offset.js'].lineData[337]++;
  Dom[VIEWPORT + name] = function(refWin) {
  _$jscoverage['/base/offset.js'].functionData[7]++;
  _$jscoverage['/base/offset.js'].lineData[338]++;
  refWin = Dom.get(refWin);
  _$jscoverage['/base/offset.js'].lineData[339]++;
  var win = getWindow(refWin);
  _$jscoverage['/base/offset.js'].lineData[340]++;
  var ret = win['inner' + name];
  _$jscoverage['/base/offset.js'].lineData[342]++;
  if (visit312_342_1(UA.mobile && ret)) {
    _$jscoverage['/base/offset.js'].lineData[343]++;
    return ret;
  }
  _$jscoverage['/base/offset.js'].lineData[346]++;
  var prop = CLIENT + name, doc = win[DOCUMENT], body = doc[BODY], documentElement = doc[DOC_ELEMENT], documentElementProp = documentElement[prop];
  _$jscoverage['/base/offset.js'].lineData[353]++;
  return visit313_353_1(visit314_353_2(visit315_353_3(doc[compatMode] === CSS1Compat) && documentElementProp) || visit316_354_1(visit317_354_2(body && body[prop]) || documentElementProp));
};
});
  _$jscoverage['/base/offset.js'].lineData[358]++;
  function getClientPosition(elem) {
    _$jscoverage['/base/offset.js'].functionData[8]++;
    _$jscoverage['/base/offset.js'].lineData[359]++;
    var box, x, y, doc = elem.ownerDocument, body = doc.body;
    _$jscoverage['/base/offset.js'].lineData[363]++;
    if (visit318_363_1(!elem.getBoundingClientRect)) {
      _$jscoverage['/base/offset.js'].lineData[364]++;
      return {
  left: 0, 
  top: 0};
    }
    _$jscoverage['/base/offset.js'].lineData[371]++;
    box = elem.getBoundingClientRect();
    _$jscoverage['/base/offset.js'].lineData[377]++;
    x = box[LEFT];
    _$jscoverage['/base/offset.js'].lineData[378]++;
    y = box[TOP];
    _$jscoverage['/base/offset.js'].lineData[400]++;
    x -= visit319_400_1(docElem.clientLeft || visit320_400_2(body.clientLeft || 0));
    _$jscoverage['/base/offset.js'].lineData[401]++;
    y -= visit321_401_1(docElem.clientTop || visit322_401_2(body.clientTop || 0));
    _$jscoverage['/base/offset.js'].lineData[403]++;
    return {
  left: x, 
  top: y};
  }
  _$jscoverage['/base/offset.js'].lineData[406]++;
  function getPageOffset(el) {
    _$jscoverage['/base/offset.js'].functionData[9]++;
    _$jscoverage['/base/offset.js'].lineData[407]++;
    var pos = getClientPosition(el), w = getWindow(el);
    _$jscoverage['/base/offset.js'].lineData[409]++;
    pos.left += Dom[SCROLL_LEFT](w);
    _$jscoverage['/base/offset.js'].lineData[410]++;
    pos.top += Dom[SCROLL_TOP](w);
    _$jscoverage['/base/offset.js'].lineData[411]++;
    return pos;
  }
  _$jscoverage['/base/offset.js'].lineData[415]++;
  function getOffset(el, relativeWin) {
    _$jscoverage['/base/offset.js'].functionData[10]++;
    _$jscoverage['/base/offset.js'].lineData[416]++;
    var position = {
  left: 0, 
  top: 0}, currentWin = getWindow(el), offset, currentEl = el;
    _$jscoverage['/base/offset.js'].lineData[423]++;
    relativeWin = visit323_423_1(relativeWin || currentWin);
    _$jscoverage['/base/offset.js'].lineData[425]++;
    do {
      _$jscoverage['/base/offset.js'].lineData[432]++;
      offset = visit324_432_1(currentWin == relativeWin) ? getPageOffset(currentEl) : getClientPosition(currentEl);
      _$jscoverage['/base/offset.js'].lineData[435]++;
      position.left += offset.left;
      _$jscoverage['/base/offset.js'].lineData[436]++;
      position.top += offset.top;
    } while (visit325_437_1(currentWin && visit326_438_1(visit327_438_2(currentWin != relativeWin) && visit328_439_1((currentEl = currentWin.frameElement) && (currentWin = currentWin.parent)))));
    _$jscoverage['/base/offset.js'].lineData[442]++;
    return position;
  }
  _$jscoverage['/base/offset.js'].lineData[446]++;
  function setOffset(elem, offset) {
    _$jscoverage['/base/offset.js'].functionData[11]++;
    _$jscoverage['/base/offset.js'].lineData[448]++;
    if (visit329_448_1(Dom.css(elem, POSITION) === 'static')) {
      _$jscoverage['/base/offset.js'].lineData[449]++;
      elem.style[POSITION] = RELATIVE;
    }
    _$jscoverage['/base/offset.js'].lineData[452]++;
    var old = getOffset(elem), ret = {}, current, key;
    _$jscoverage['/base/offset.js'].lineData[456]++;
    for (key in offset) {
      _$jscoverage['/base/offset.js'].lineData[457]++;
      current = visit330_457_1(parseFloat(Dom.css(elem, key)) || 0);
      _$jscoverage['/base/offset.js'].lineData[458]++;
      ret[key] = current + offset[key] - old[key];
    }
    _$jscoverage['/base/offset.js'].lineData[460]++;
    Dom.css(elem, ret);
  }
  _$jscoverage['/base/offset.js'].lineData[463]++;
  return Dom;
});
