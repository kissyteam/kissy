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
if (! _$jscoverage['/lang/object.js']) {
  _$jscoverage['/lang/object.js'] = {};
  _$jscoverage['/lang/object.js'].lineData = [];
  _$jscoverage['/lang/object.js'].lineData[7] = 0;
  _$jscoverage['/lang/object.js'].lineData[8] = 0;
  _$jscoverage['/lang/object.js'].lineData[9] = 0;
  _$jscoverage['/lang/object.js'].lineData[29] = 0;
  _$jscoverage['/lang/object.js'].lineData[39] = 0;
  _$jscoverage['/lang/object.js'].lineData[40] = 0;
  _$jscoverage['/lang/object.js'].lineData[41] = 0;
  _$jscoverage['/lang/object.js'].lineData[42] = 0;
  _$jscoverage['/lang/object.js'].lineData[43] = 0;
  _$jscoverage['/lang/object.js'].lineData[44] = 0;
  _$jscoverage['/lang/object.js'].lineData[45] = 0;
  _$jscoverage['/lang/object.js'].lineData[48] = 0;
  _$jscoverage['/lang/object.js'].lineData[51] = 0;
  _$jscoverage['/lang/object.js'].lineData[61] = 0;
  _$jscoverage['/lang/object.js'].lineData[63] = 0;
  _$jscoverage['/lang/object.js'].lineData[65] = 0;
  _$jscoverage['/lang/object.js'].lineData[66] = 0;
  _$jscoverage['/lang/object.js'].lineData[70] = 0;
  _$jscoverage['/lang/object.js'].lineData[71] = 0;
  _$jscoverage['/lang/object.js'].lineData[72] = 0;
  _$jscoverage['/lang/object.js'].lineData[73] = 0;
  _$jscoverage['/lang/object.js'].lineData[74] = 0;
  _$jscoverage['/lang/object.js'].lineData[79] = 0;
  _$jscoverage['/lang/object.js'].lineData[104] = 0;
  _$jscoverage['/lang/object.js'].lineData[105] = 0;
  _$jscoverage['/lang/object.js'].lineData[109] = 0;
  _$jscoverage['/lang/object.js'].lineData[110] = 0;
  _$jscoverage['/lang/object.js'].lineData[113] = 0;
  _$jscoverage['/lang/object.js'].lineData[114] = 0;
  _$jscoverage['/lang/object.js'].lineData[115] = 0;
  _$jscoverage['/lang/object.js'].lineData[116] = 0;
  _$jscoverage['/lang/object.js'].lineData[120] = 0;
  _$jscoverage['/lang/object.js'].lineData[121] = 0;
  _$jscoverage['/lang/object.js'].lineData[124] = 0;
  _$jscoverage['/lang/object.js'].lineData[127] = 0;
  _$jscoverage['/lang/object.js'].lineData[128] = 0;
  _$jscoverage['/lang/object.js'].lineData[129] = 0;
  _$jscoverage['/lang/object.js'].lineData[131] = 0;
  _$jscoverage['/lang/object.js'].lineData[144] = 0;
  _$jscoverage['/lang/object.js'].lineData[145] = 0;
  _$jscoverage['/lang/object.js'].lineData[148] = 0;
  _$jscoverage['/lang/object.js'].lineData[149] = 0;
  _$jscoverage['/lang/object.js'].lineData[151] = 0;
  _$jscoverage['/lang/object.js'].lineData[164] = 0;
  _$jscoverage['/lang/object.js'].lineData[172] = 0;
  _$jscoverage['/lang/object.js'].lineData[174] = 0;
  _$jscoverage['/lang/object.js'].lineData[175] = 0;
  _$jscoverage['/lang/object.js'].lineData[176] = 0;
  _$jscoverage['/lang/object.js'].lineData[177] = 0;
  _$jscoverage['/lang/object.js'].lineData[179] = 0;
  _$jscoverage['/lang/object.js'].lineData[180] = 0;
  _$jscoverage['/lang/object.js'].lineData[181] = 0;
  _$jscoverage['/lang/object.js'].lineData[184] = 0;
  _$jscoverage['/lang/object.js'].lineData[185] = 0;
  _$jscoverage['/lang/object.js'].lineData[186] = 0;
  _$jscoverage['/lang/object.js'].lineData[187] = 0;
  _$jscoverage['/lang/object.js'].lineData[189] = 0;
  _$jscoverage['/lang/object.js'].lineData[192] = 0;
  _$jscoverage['/lang/object.js'].lineData[207] = 0;
  _$jscoverage['/lang/object.js'].lineData[208] = 0;
  _$jscoverage['/lang/object.js'].lineData[209] = 0;
  _$jscoverage['/lang/object.js'].lineData[211] = 0;
  _$jscoverage['/lang/object.js'].lineData[212] = 0;
  _$jscoverage['/lang/object.js'].lineData[214] = 0;
  _$jscoverage['/lang/object.js'].lineData[215] = 0;
  _$jscoverage['/lang/object.js'].lineData[219] = 0;
  _$jscoverage['/lang/object.js'].lineData[224] = 0;
  _$jscoverage['/lang/object.js'].lineData[227] = 0;
  _$jscoverage['/lang/object.js'].lineData[228] = 0;
  _$jscoverage['/lang/object.js'].lineData[229] = 0;
  _$jscoverage['/lang/object.js'].lineData[232] = 0;
  _$jscoverage['/lang/object.js'].lineData[233] = 0;
  _$jscoverage['/lang/object.js'].lineData[237] = 0;
  _$jscoverage['/lang/object.js'].lineData[238] = 0;
  _$jscoverage['/lang/object.js'].lineData[241] = 0;
  _$jscoverage['/lang/object.js'].lineData[258] = 0;
  _$jscoverage['/lang/object.js'].lineData[263] = 0;
  _$jscoverage['/lang/object.js'].lineData[264] = 0;
  _$jscoverage['/lang/object.js'].lineData[265] = 0;
  _$jscoverage['/lang/object.js'].lineData[266] = 0;
  _$jscoverage['/lang/object.js'].lineData[267] = 0;
  _$jscoverage['/lang/object.js'].lineData[270] = 0;
  _$jscoverage['/lang/object.js'].lineData[274] = 0;
  _$jscoverage['/lang/object.js'].lineData[277] = 0;
  _$jscoverage['/lang/object.js'].lineData[278] = 0;
  _$jscoverage['/lang/object.js'].lineData[279] = 0;
  _$jscoverage['/lang/object.js'].lineData[280] = 0;
  _$jscoverage['/lang/object.js'].lineData[282] = 0;
  _$jscoverage['/lang/object.js'].lineData[283] = 0;
  _$jscoverage['/lang/object.js'].lineData[285] = 0;
  _$jscoverage['/lang/object.js'].lineData[286] = 0;
  _$jscoverage['/lang/object.js'].lineData[289] = 0;
  _$jscoverage['/lang/object.js'].lineData[290] = 0;
  _$jscoverage['/lang/object.js'].lineData[291] = 0;
  _$jscoverage['/lang/object.js'].lineData[295] = 0;
  _$jscoverage['/lang/object.js'].lineData[296] = 0;
  _$jscoverage['/lang/object.js'].lineData[297] = 0;
  _$jscoverage['/lang/object.js'].lineData[299] = 0;
  _$jscoverage['/lang/object.js'].lineData[302] = 0;
  _$jscoverage['/lang/object.js'].lineData[305] = 0;
  _$jscoverage['/lang/object.js'].lineData[308] = 0;
  _$jscoverage['/lang/object.js'].lineData[309] = 0;
  _$jscoverage['/lang/object.js'].lineData[310] = 0;
  _$jscoverage['/lang/object.js'].lineData[311] = 0;
  _$jscoverage['/lang/object.js'].lineData[312] = 0;
  _$jscoverage['/lang/object.js'].lineData[314] = 0;
  _$jscoverage['/lang/object.js'].lineData[318] = 0;
  _$jscoverage['/lang/object.js'].lineData[321] = 0;
  _$jscoverage['/lang/object.js'].lineData[322] = 0;
  _$jscoverage['/lang/object.js'].lineData[325] = 0;
  _$jscoverage['/lang/object.js'].lineData[329] = 0;
  _$jscoverage['/lang/object.js'].lineData[330] = 0;
  _$jscoverage['/lang/object.js'].lineData[333] = 0;
  _$jscoverage['/lang/object.js'].lineData[335] = 0;
  _$jscoverage['/lang/object.js'].lineData[336] = 0;
  _$jscoverage['/lang/object.js'].lineData[338] = 0;
  _$jscoverage['/lang/object.js'].lineData[340] = 0;
  _$jscoverage['/lang/object.js'].lineData[341] = 0;
  _$jscoverage['/lang/object.js'].lineData[344] = 0;
  _$jscoverage['/lang/object.js'].lineData[345] = 0;
  _$jscoverage['/lang/object.js'].lineData[346] = 0;
  _$jscoverage['/lang/object.js'].lineData[350] = 0;
  _$jscoverage['/lang/object.js'].lineData[353] = 0;
  _$jscoverage['/lang/object.js'].lineData[354] = 0;
  _$jscoverage['/lang/object.js'].lineData[356] = 0;
  _$jscoverage['/lang/object.js'].lineData[357] = 0;
}
if (! _$jscoverage['/lang/object.js'].functionData) {
  _$jscoverage['/lang/object.js'].functionData = [];
  _$jscoverage['/lang/object.js'].functionData[0] = 0;
  _$jscoverage['/lang/object.js'].functionData[1] = 0;
  _$jscoverage['/lang/object.js'].functionData[2] = 0;
  _$jscoverage['/lang/object.js'].functionData[3] = 0;
  _$jscoverage['/lang/object.js'].functionData[4] = 0;
  _$jscoverage['/lang/object.js'].functionData[5] = 0;
  _$jscoverage['/lang/object.js'].functionData[6] = 0;
  _$jscoverage['/lang/object.js'].functionData[7] = 0;
  _$jscoverage['/lang/object.js'].functionData[8] = 0;
  _$jscoverage['/lang/object.js'].functionData[9] = 0;
  _$jscoverage['/lang/object.js'].functionData[10] = 0;
  _$jscoverage['/lang/object.js'].functionData[11] = 0;
  _$jscoverage['/lang/object.js'].functionData[12] = 0;
  _$jscoverage['/lang/object.js'].functionData[13] = 0;
  _$jscoverage['/lang/object.js'].functionData[14] = 0;
}
if (! _$jscoverage['/lang/object.js'].branchData) {
  _$jscoverage['/lang/object.js'].branchData = {};
  _$jscoverage['/lang/object.js'].branchData['39'] = [];
  _$jscoverage['/lang/object.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['41'] = [];
  _$jscoverage['/lang/object.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['43'] = [];
  _$jscoverage['/lang/object.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['60'] = [];
  _$jscoverage['/lang/object.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['65'] = [];
  _$jscoverage['/lang/object.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['70'] = [];
  _$jscoverage['/lang/object.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['71'] = [];
  _$jscoverage['/lang/object.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['73'] = [];
  _$jscoverage['/lang/object.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['104'] = [];
  _$jscoverage['/lang/object.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['113'] = [];
  _$jscoverage['/lang/object.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['120'] = [];
  _$jscoverage['/lang/object.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['148'] = [];
  _$jscoverage['/lang/object.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['174'] = [];
  _$jscoverage['/lang/object.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['179'] = [];
  _$jscoverage['/lang/object.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['184'] = [];
  _$jscoverage['/lang/object.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['207'] = [];
  _$jscoverage['/lang/object.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['208'] = [];
  _$jscoverage['/lang/object.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['211'] = [];
  _$jscoverage['/lang/object.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['214'] = [];
  _$jscoverage['/lang/object.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['232'] = [];
  _$jscoverage['/lang/object.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['237'] = [];
  _$jscoverage['/lang/object.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['261'] = [];
  _$jscoverage['/lang/object.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['263'] = [];
  _$jscoverage['/lang/object.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['266'] = [];
  _$jscoverage['/lang/object.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['266'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['267'] = [];
  _$jscoverage['/lang/object.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['279'] = [];
  _$jscoverage['/lang/object.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['296'] = [];
  _$jscoverage['/lang/object.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['310'] = [];
  _$jscoverage['/lang/object.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['312'] = [];
  _$jscoverage['/lang/object.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['322'] = [];
  _$jscoverage['/lang/object.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['329'] = [];
  _$jscoverage['/lang/object.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['329'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['333'] = [];
  _$jscoverage['/lang/object.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['335'] = [];
  _$jscoverage['/lang/object.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['340'] = [];
  _$jscoverage['/lang/object.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['344'] = [];
  _$jscoverage['/lang/object.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['344'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['344'][3] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['345'] = [];
  _$jscoverage['/lang/object.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['350'] = [];
  _$jscoverage['/lang/object.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['350'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['356'] = [];
  _$jscoverage['/lang/object.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['356'][2] = new BranchData();
  _$jscoverage['/lang/object.js'].branchData['356'][3] = new BranchData();
}
_$jscoverage['/lang/object.js'].branchData['356'][3].init(1062, 15, 'ov || !(p in r)');
function visit272_356_3(result) {
  _$jscoverage['/lang/object.js'].branchData['356'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['356'][2].init(1040, 17, 'src !== undefined');
function visit271_356_2(result) {
  _$jscoverage['/lang/object.js'].branchData['356'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['356'][1].init(1040, 38, 'src !== undefined && (ov || !(p in r))');
function visit270_356_1(result) {
  _$jscoverage['/lang/object.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['350'][2].init(136, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit269_350_2(result) {
  _$jscoverage['/lang/object.js'].branchData['350'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['350'][1].init(125, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit268_350_1(result) {
  _$jscoverage['/lang/object.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['345'][1].init(21, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit267_345_1(result) {
  _$jscoverage['/lang/object.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['344'][3].init(455, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit266_344_3(result) {
  _$jscoverage['/lang/object.js'].branchData['344'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['344'][2].init(447, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit265_344_2(result) {
  _$jscoverage['/lang/object.js'].branchData['344'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['344'][1].init(439, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit264_344_1(result) {
  _$jscoverage['/lang/object.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['340'][1].init(326, 2, 'wl');
function visit263_340_1(result) {
  _$jscoverage['/lang/object.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['335'][1].init(64, 20, 'target === undefined');
function visit262_335_1(result) {
  _$jscoverage['/lang/object.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['333'][1].init(114, 14, 'target === src');
function visit261_333_1(result) {
  _$jscoverage['/lang/object.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['329'][2].init(73, 17, '!(p in r) || deep');
function visit260_329_2(result) {
  _$jscoverage['/lang/object.js'].branchData['329'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['329'][1].init(67, 23, 'ov || !(p in r) || deep');
function visit259_329_1(result) {
  _$jscoverage['/lang/object.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['322'][1].init(16, 19, 'k === \'constructor\'');
function visit258_322_1(result) {
  _$jscoverage['/lang/object.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['312'][1].init(42, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit257_312_1(result) {
  _$jscoverage['/lang/object.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['310'][1].init(297, 7, 'i < len');
function visit256_310_1(result) {
  _$jscoverage['/lang/object.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['296'][1].init(13, 8, '!s || !r');
function visit255_296_1(result) {
  _$jscoverage['/lang/object.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['279'][1].init(35, 12, 'objectCreate');
function visit254_279_1(result) {
  _$jscoverage['/lang/object.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['267'][1].init(35, 13, 'o[p[j]] || {}');
function visit253_267_1(result) {
  _$jscoverage['/lang/object.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['266'][2].init(146, 12, 'j < p.length');
function visit252_266_2(result) {
  _$jscoverage['/lang/object.js'].branchData['266'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['266'][1].init(119, 16, 'self[p[0]] === o');
function visit251_266_1(result) {
  _$jscoverage['/lang/object.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['263'][1].init(197, 5, 'i < l');
function visit250_263_1(result) {
  _$jscoverage['/lang/object.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['261'][2].init(128, 20, 'args[l - 1] === TRUE');
function visit249_261_2(result) {
  _$jscoverage['/lang/object.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['261'][1].init(128, 27, 'args[l - 1] === TRUE && l--');
function visit248_261_1(result) {
  _$jscoverage['/lang/object.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['237'][1].init(818, 2, 'sx');
function visit247_237_1(result) {
  _$jscoverage['/lang/object.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['232'][1].init(714, 2, 'px');
function visit246_232_1(result) {
  _$jscoverage['/lang/object.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['214'][1].init(217, 8, '!s || !r');
function visit245_214_1(result) {
  _$jscoverage['/lang/object.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['211'][1].init(119, 2, '!s');
function visit244_211_1(result) {
  _$jscoverage['/lang/object.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['208'][1].init(21, 2, '!r');
function visit243_208_1(result) {
  _$jscoverage['/lang/object.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['207'][1].init(17, 9, '\'@DEBUG@\'');
function visit242_207_1(result) {
  _$jscoverage['/lang/object.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['184'][1].init(515, 7, 'i < len');
function visit241_184_1(result) {
  _$jscoverage['/lang/object.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['179'][1].init(399, 23, 'typeof ov !== \'boolean\'');
function visit240_179_1(result) {
  _$jscoverage['/lang/object.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['174'][1].init(271, 14, '!S.isArray(wl)');
function visit239_174_1(result) {
  _$jscoverage['/lang/object.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['148'][1].init(150, 5, 'i < l');
function visit238_148_1(result) {
  _$jscoverage['/lang/object.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['120'][1].init(508, 16, 'ov === undefined');
function visit237_120_1(result) {
  _$jscoverage['/lang/object.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['113'][2].init(274, 24, 'typeof wl !== \'function\'');
function visit236_113_2(result) {
  _$jscoverage['/lang/object.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['113'][1].init(267, 32, 'wl && (typeof wl !== \'function\')');
function visit235_113_1(result) {
  _$jscoverage['/lang/object.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['104'][1].init(17, 22, 'typeof ov === \'object\'');
function visit234_104_1(result) {
  _$jscoverage['/lang/object.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['73'][1].init(68, 19, 'o.hasOwnProperty(p)');
function visit233_73_1(result) {
  _$jscoverage['/lang/object.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['71'][1].init(53, 6, 'i >= 0');
function visit232_71_1(result) {
  _$jscoverage['/lang/object.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['70'][1].init(228, 10, 'hasEnumBug');
function visit231_70_1(result) {
  _$jscoverage['/lang/object.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['65'][1].init(57, 19, 'o.hasOwnProperty(p)');
function visit230_65_1(result) {
  _$jscoverage['/lang/object.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['60'][1].init(974, 556, 'Obj.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit229_60_1(result) {
  _$jscoverage['/lang/object.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['43'][1].init(157, 9, '!readOnly');
function visit228_43_1(result) {
  _$jscoverage['/lang/object.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['41'][1].init(96, 4, 'guid');
function visit227_41_1(result) {
  _$jscoverage['/lang/object.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].branchData['39'][1].init(22, 22, 'marker || STAMP_MARKER');
function visit226_39_1(result) {
  _$jscoverage['/lang/object.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/object.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/object.js'].functionData[0]++;
  _$jscoverage['/lang/object.js'].lineData[8]++;
  var logger = S.getLogger('s/lang');
  _$jscoverage['/lang/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', self = this, TRUE = true, EMPTY = '', Obj = Object, objectCreate = Obj.create, hasEnumBug = !({
  toString: 1}.propertyIsEnumerable('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/lang/object.js'].lineData[29]++;
  mix(S, {
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/lang/object.js'].functionData[1]++;
  _$jscoverage['/lang/object.js'].lineData[39]++;
  marker = visit226_39_1(marker || STAMP_MARKER);
  _$jscoverage['/lang/object.js'].lineData[40]++;
  var guid = o[marker];
  _$jscoverage['/lang/object.js'].lineData[41]++;
  if (visit227_41_1(guid)) {
    _$jscoverage['/lang/object.js'].lineData[42]++;
    return guid;
  } else {
    _$jscoverage['/lang/object.js'].lineData[43]++;
    if (visit228_43_1(!readOnly)) {
      _$jscoverage['/lang/object.js'].lineData[44]++;
      try {
        _$jscoverage['/lang/object.js'].lineData[45]++;
        guid = o[marker] = S.guid(marker);
      }      catch (e) {
  _$jscoverage['/lang/object.js'].lineData[48]++;
  guid = undefined;
}
    }
  }
  _$jscoverage['/lang/object.js'].lineData[51]++;
  return guid;
}, 
  keys: visit229_60_1(Obj.keys || function(o) {
  _$jscoverage['/lang/object.js'].functionData[2]++;
  _$jscoverage['/lang/object.js'].lineData[61]++;
  var result = [], p, i;
  _$jscoverage['/lang/object.js'].lineData[63]++;
  for (p in o) {
    _$jscoverage['/lang/object.js'].lineData[65]++;
    if (visit230_65_1(o.hasOwnProperty(p))) {
      _$jscoverage['/lang/object.js'].lineData[66]++;
      result.push(p);
    }
  }
  _$jscoverage['/lang/object.js'].lineData[70]++;
  if (visit231_70_1(hasEnumBug)) {
    _$jscoverage['/lang/object.js'].lineData[71]++;
    for (i = enumProperties.length - 1; visit232_71_1(i >= 0); i--) {
      _$jscoverage['/lang/object.js'].lineData[72]++;
      p = enumProperties[i];
      _$jscoverage['/lang/object.js'].lineData[73]++;
      if (visit233_73_1(o.hasOwnProperty(p))) {
        _$jscoverage['/lang/object.js'].lineData[74]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/lang/object.js'].lineData[79]++;
  return result;
}), 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/lang/object.js'].functionData[3]++;
  _$jscoverage['/lang/object.js'].lineData[104]++;
  if (visit234_104_1(typeof ov === 'object')) {
    _$jscoverage['/lang/object.js'].lineData[105]++;
    wl = ov.whitelist;
    _$jscoverage['/lang/object.js'].lineData[109]++;
    deep = ov.deep;
    _$jscoverage['/lang/object.js'].lineData[110]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/lang/object.js'].lineData[113]++;
  if (visit235_113_1(wl && (visit236_113_2(typeof wl !== 'function')))) {
    _$jscoverage['/lang/object.js'].lineData[114]++;
    var originalWl = wl;
    _$jscoverage['/lang/object.js'].lineData[115]++;
    wl = function(name, val) {
  _$jscoverage['/lang/object.js'].functionData[4]++;
  _$jscoverage['/lang/object.js'].lineData[116]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/lang/object.js'].lineData[120]++;
  if (visit237_120_1(ov === undefined)) {
    _$jscoverage['/lang/object.js'].lineData[121]++;
    ov = TRUE;
  }
  _$jscoverage['/lang/object.js'].lineData[124]++;
  var cache = [], c, i = 0;
  _$jscoverage['/lang/object.js'].lineData[127]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/lang/object.js'].lineData[128]++;
  while ((c = cache[i++])) {
    _$jscoverage['/lang/object.js'].lineData[129]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/lang/object.js'].lineData[131]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/lang/object.js'].functionData[5]++;
  _$jscoverage['/lang/object.js'].lineData[144]++;
  varArgs = S.makeArray(arguments);
  _$jscoverage['/lang/object.js'].lineData[145]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/lang/object.js'].lineData[148]++;
  for (i = 0; visit238_148_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[149]++;
    S.mix(o, varArgs[i]);
  }
  _$jscoverage['/lang/object.js'].lineData[151]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/lang/object.js'].functionData[6]++;
  _$jscoverage['/lang/object.js'].lineData[164]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/lang/object.js'].lineData[172]++;
  args[1] = varArgs;
  _$jscoverage['/lang/object.js'].lineData[174]++;
  if (visit239_174_1(!S.isArray(wl))) {
    _$jscoverage['/lang/object.js'].lineData[175]++;
    ov = wl;
    _$jscoverage['/lang/object.js'].lineData[176]++;
    wl = undefined;
    _$jscoverage['/lang/object.js'].lineData[177]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[179]++;
  if (visit240_179_1(typeof ov !== 'boolean')) {
    _$jscoverage['/lang/object.js'].lineData[180]++;
    ov = undefined;
    _$jscoverage['/lang/object.js'].lineData[181]++;
    len++;
  }
  _$jscoverage['/lang/object.js'].lineData[184]++;
  for (; visit241_184_1(i < len); i++) {
    _$jscoverage['/lang/object.js'].lineData[185]++;
    arg = args[i];
    _$jscoverage['/lang/object.js'].lineData[186]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/lang/object.js'].lineData[187]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/lang/object.js'].lineData[189]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/lang/object.js'].lineData[192]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/lang/object.js'].functionData[7]++;
  _$jscoverage['/lang/object.js'].lineData[207]++;
  if (visit242_207_1('@DEBUG@')) {
    _$jscoverage['/lang/object.js'].lineData[208]++;
    if (visit243_208_1(!r)) {
      _$jscoverage['/lang/object.js'].lineData[209]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/lang/object.js'].lineData[211]++;
    if (visit244_211_1(!s)) {
      _$jscoverage['/lang/object.js'].lineData[212]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/lang/object.js'].lineData[214]++;
    if (visit245_214_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[215]++;
      return r;
    }
  }
  _$jscoverage['/lang/object.js'].lineData[219]++;
  var sp = s.prototype, rp;
  _$jscoverage['/lang/object.js'].lineData[224]++;
  sp.constructor = s;
  _$jscoverage['/lang/object.js'].lineData[227]++;
  rp = createObject(sp, r);
  _$jscoverage['/lang/object.js'].lineData[228]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/lang/object.js'].lineData[229]++;
  r.superclass = sp;
  _$jscoverage['/lang/object.js'].lineData[232]++;
  if (visit246_232_1(px)) {
    _$jscoverage['/lang/object.js'].lineData[233]++;
    S.mix(rp, px);
  }
  _$jscoverage['/lang/object.js'].lineData[237]++;
  if (visit247_237_1(sx)) {
    _$jscoverage['/lang/object.js'].lineData[238]++;
    S.mix(r, sx);
  }
  _$jscoverage['/lang/object.js'].lineData[241]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/lang/object.js'].functionData[8]++;
  _$jscoverage['/lang/object.js'].lineData[258]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit248_261_1(visit249_261_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/lang/object.js'].lineData[263]++;
  for (i = 0; visit250_263_1(i < l); i++) {
    _$jscoverage['/lang/object.js'].lineData[264]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/lang/object.js'].lineData[265]++;
    o = global ? self : this;
    _$jscoverage['/lang/object.js'].lineData[266]++;
    for (j = (visit251_266_1(self[p[0]] === o)) ? 1 : 0; visit252_266_2(j < p.length); ++j) {
      _$jscoverage['/lang/object.js'].lineData[267]++;
      o = o[p[j]] = visit253_267_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/lang/object.js'].lineData[270]++;
  return o;
}});
  _$jscoverage['/lang/object.js'].lineData[274]++;
  function Empty() {
    _$jscoverage['/lang/object.js'].functionData[9]++;
  }
  _$jscoverage['/lang/object.js'].lineData[277]++;
  function createObject(proto, constructor) {
    _$jscoverage['/lang/object.js'].functionData[10]++;
    _$jscoverage['/lang/object.js'].lineData[278]++;
    var newProto;
    _$jscoverage['/lang/object.js'].lineData[279]++;
    if (visit254_279_1(objectCreate)) {
      _$jscoverage['/lang/object.js'].lineData[280]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/lang/object.js'].lineData[282]++;
      Empty.prototype = proto;
      _$jscoverage['/lang/object.js'].lineData[283]++;
      newProto = new Empty();
    }
    _$jscoverage['/lang/object.js'].lineData[285]++;
    newProto.constructor = constructor;
    _$jscoverage['/lang/object.js'].lineData[286]++;
    return newProto;
  }
  _$jscoverage['/lang/object.js'].lineData[289]++;
  function mix(r, s) {
    _$jscoverage['/lang/object.js'].functionData[11]++;
    _$jscoverage['/lang/object.js'].lineData[290]++;
    for (var i in s) {
      _$jscoverage['/lang/object.js'].lineData[291]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/lang/object.js'].lineData[295]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[12]++;
    _$jscoverage['/lang/object.js'].lineData[296]++;
    if (visit255_296_1(!s || !r)) {
      _$jscoverage['/lang/object.js'].lineData[297]++;
      return r;
    }
    _$jscoverage['/lang/object.js'].lineData[299]++;
    var i, p, keys, len;
    _$jscoverage['/lang/object.js'].lineData[302]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/lang/object.js'].lineData[305]++;
    cache.push(s);
    _$jscoverage['/lang/object.js'].lineData[308]++;
    keys = S.keys(s);
    _$jscoverage['/lang/object.js'].lineData[309]++;
    len = keys.length;
    _$jscoverage['/lang/object.js'].lineData[310]++;
    for (i = 0; visit256_310_1(i < len); i++) {
      _$jscoverage['/lang/object.js'].lineData[311]++;
      p = keys[i];
      _$jscoverage['/lang/object.js'].lineData[312]++;
      if (visit257_312_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/lang/object.js'].lineData[314]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/lang/object.js'].lineData[318]++;
    return r;
  }
  _$jscoverage['/lang/object.js'].lineData[321]++;
  function removeConstructor(k, v) {
    _$jscoverage['/lang/object.js'].functionData[13]++;
    _$jscoverage['/lang/object.js'].lineData[322]++;
    return visit258_322_1(k === 'constructor') ? undefined : v;
  }
  _$jscoverage['/lang/object.js'].lineData[325]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/lang/object.js'].functionData[14]++;
    _$jscoverage['/lang/object.js'].lineData[329]++;
    if (visit259_329_1(ov || visit260_329_2(!(p in r) || deep))) {
      _$jscoverage['/lang/object.js'].lineData[330]++;
      var target = r[p], src = s[p];
      _$jscoverage['/lang/object.js'].lineData[333]++;
      if (visit261_333_1(target === src)) {
        _$jscoverage['/lang/object.js'].lineData[335]++;
        if (visit262_335_1(target === undefined)) {
          _$jscoverage['/lang/object.js'].lineData[336]++;
          r[p] = target;
        }
        _$jscoverage['/lang/object.js'].lineData[338]++;
        return;
      }
      _$jscoverage['/lang/object.js'].lineData[340]++;
      if (visit263_340_1(wl)) {
        _$jscoverage['/lang/object.js'].lineData[341]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/lang/object.js'].lineData[344]++;
      if (visit264_344_1(deep && visit265_344_2(src && (visit266_344_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/lang/object.js'].lineData[345]++;
        if (visit267_345_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/lang/object.js'].lineData[346]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/lang/object.js'].lineData[350]++;
          var clone = visit268_350_1(target && (visit269_350_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/lang/object.js'].lineData[353]++;
          r[p] = clone;
          _$jscoverage['/lang/object.js'].lineData[354]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/lang/object.js'].lineData[356]++;
        if (visit270_356_1(visit271_356_2(src !== undefined) && (visit272_356_3(ov || !(p in r))))) {
          _$jscoverage['/lang/object.js'].lineData[357]++;
          r[p] = src;
        }
      }
    }
  }
})(KISSY);
