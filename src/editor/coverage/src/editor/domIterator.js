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
if (! _$jscoverage['/editor/domIterator.js']) {
  _$jscoverage['/editor/domIterator.js'] = {};
  _$jscoverage['/editor/domIterator.js'].lineData = [];
  _$jscoverage['/editor/domIterator.js'].lineData[10] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[11] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[12] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[13] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[14] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[15] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[16] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[29] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[30] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[31] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[33] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[34] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[35] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[38] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[39] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[41] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[44] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[46] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[60] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[65] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[68] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[71] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[74] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[75] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[80] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[82] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[85] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[88] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[89] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[91] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[92] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[93] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[94] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[99] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[102] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[103] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[104] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[105] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[106] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[107] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[112] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[113] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[114] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[118] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[121] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[122] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[124] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[125] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[128] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[132] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[137] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[138] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[139] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[142] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[145] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[146] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[147] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[150] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[151] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[152] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[157] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[158] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[162] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[163] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[167] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[170] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[172] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[173] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[174] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[177] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[178] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[180] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[182] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[185] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[186] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[192] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[193] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[194] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[198] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[202] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[203] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[204] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[206] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[207] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[208] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[209] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[212] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[213] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[214] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[215] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[220] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[221] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[224] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[225] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[229] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[230] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[235] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[237] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[238] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[239] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[241] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[242] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[245] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[246] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[248] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[250] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[254] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[255] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[257] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[259] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[260] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[262] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[263] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[264] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[268] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[270] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[273] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[274] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[278] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[280] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[281] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[284] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[286] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[292] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[297] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[298] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[299] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[300] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[301] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[302] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[303] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[308] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[310] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[312] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[313] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[315] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[317] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[325] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[326] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[330] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[339] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[340] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[343] = 0;
}
if (! _$jscoverage['/editor/domIterator.js'].functionData) {
  _$jscoverage['/editor/domIterator.js'].functionData = [];
  _$jscoverage['/editor/domIterator.js'].functionData[0] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[1] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[2] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[3] = 0;
}
if (! _$jscoverage['/editor/domIterator.js'].branchData) {
  _$jscoverage['/editor/domIterator.js'].branchData = {};
  _$jscoverage['/editor/domIterator.js'].branchData['30'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['41'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['74'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['82'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['99'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['100'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['100'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['104'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['106'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['112'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['132'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['137'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['139'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['142'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['145'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['147'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['147'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['157'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['162'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['170'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['172'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['182'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['185'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['192'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['198'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['202'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['203'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['206'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['206'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['208'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['220'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['229'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['235'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['237'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['238'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['250'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['250'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['250'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['251'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['252'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['255'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['255'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['255'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['257'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['264'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['268'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['286'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['297'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['299'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['299'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['300'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['302'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['308'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['313'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['313'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['313'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['313'][4] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['315'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['325'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['326'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['326'][1] = new BranchData();
}
_$jscoverage['/editor/domIterator.js'].branchData['326'][1].init(37, 32, 'isLast || block.equals(lastNode)');
function visit275_326_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['325'][1].init(13057, 16, '!self._.nextNode');
function visit274_325_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['315'][2].init(128, 93, 'lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit273_315_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['315'][1].init(119, 102, 'UA.ie || lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit272_315_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['313'][4].init(275, 29, 'lastChild.nodeName() === \'br\'');
function visit271_313_4(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['313'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['313'][3].init(220, 51, 'lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit270_313_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['313'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['313'][2].init(220, 84, 'lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() === \'br\'');
function visit269_313_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['313'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['313'][1].init(204, 100, 'lastChild[0] && lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() === \'br\'');
function visit268_313_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['308'][1].init(12188, 12, 'removeLastBr');
function visit267_308_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['302'][2].init(184, 51, 'Dom.nodeName(previousSibling[0].lastChild) === \'br\'');
function visit266_302_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['302'][1].init(152, 83, 'previousSibling[0].lastChild && Dom.nodeName(previousSibling[0].lastChild) === \'br\'');
function visit265_302_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['300'][1].init(26, 35, 'previousSibling.nodeName() === \'br\'');
function visit264_300_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['299'][2].init(119, 57, 'previousSibling[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit263_299_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['299'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['299'][1].init(97, 79, 'previousSibling[0] && previousSibling[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit262_299_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['297'][1].init(11606, 16, 'removePreviousBr');
function visit261_297_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['286'][1].init(2628, 7, '!isLast');
function visit260_286_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['268'][1].init(222, 54, '!range.checkStartOfBlock() || !range.checkEndOfBlock()');
function visit259_268_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['264'][1].init(1468, 25, 'block.nodeName() !== \'li\'');
function visit258_264_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['257'][1].init(121, 15, 'blockTag || \'p\'');
function visit257_257_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['255'][3].init(911, 25, 'block.nodeName() === \'li\'');
function visit256_255_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['255'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['255'][2].init(885, 51, 'self.enforceRealBlocks && block.nodeName() === \'li\'');
function visit255_255_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['255'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['255'][1].init(874, 63, '!block || (self.enforceRealBlocks && block.nodeName() === \'li\')');
function visit254_255_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['252'][1].init(65, 73, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit253_252_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['251'][1].init(47, 139, 'checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit252_251_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['250'][3].init(608, 187, '!self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit251_250_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['250'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['250'][2].init(584, 19, '!block || !block[0]');
function visit250_250_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['250'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['250'][1].init(584, 211, '(!block || !block[0]) && !self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit249_250_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['238'][1].init(26, 19, 'self._.docEndMarker');
function visit248_238_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['237'][1].init(87, 6, '!range');
function visit247_237_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['235'][1].init(8431, 6, '!block');
function visit246_235_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['229'][2].init(5157, 19, 'closeRange && range');
function visit245_229_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['229'][1].init(5146, 31, 'isLast || (closeRange && range)');
function visit244_229_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['220'][1].init(4754, 11, 'includeNode');
function visit243_220_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['208'][1].init(87, 37, 'isLast || parentNode.equals(lastNode)');
function visit242_208_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['206'][2].init(126, 28, 'self.forceBrBreak && {\n  br: 1}');
function visit241_206_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['206'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['206'][1].init(96, 59, 'parentNode._4eIsBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit240_206_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['203'][1].init(29, 38, '!currentNode[0].nextSibling && !isLast');
function visit239_203_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['202'][1].init(3984, 20, 'range && !closeRange');
function visit238_202_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['198'][2].init(3737, 26, '!closeRange || includeNode');
function visit237_198_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['198'][1].init(3737, 59, '(!closeRange || includeNode) && currentNode.equals(lastNode)');
function visit236_198_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['192'][1].init(3472, 21, 'includeNode && !range');
function visit235_192_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['185'][1].init(184, 51, 'beginWhitespaceRegex.test(currentNode[0].nodeValue)');
function visit234_185_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['182'][1].init(2927, 50, 'currentNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit233_182_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['172'][1].init(112, 6, '!range');
function visit232_172_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['170'][1].init(100, 25, 'currentNode[0].firstChild');
function visit231_170_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['162'][1].init(255, 17, 'nodeName !== \'br\'');
function visit230_162_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['157'][1].init(874, 5, 'range');
function visit229_157_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['147'][3].init(320, 17, 'nodeName !== \'hr\'');
function visit228_147_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['147'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['147'][2].init(283, 54, '!currentNode[0].childNodes.length && nodeName !== \'hr\'');
function visit227_147_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['147'][1].init(273, 64, '!range && !currentNode[0].childNodes.length && nodeName !== \'hr\'');
function visit226_147_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['145'][1].init(166, 17, 'nodeName === \'br\'');
function visit225_145_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['142'][1].init(204, 44, 'currentNode._4eIsBlockBoundary(forceBrBreak)');
function visit224_142_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['139'][1].init(101, 76, 'self.forceBrBreak && {\n  br: 1}');
function visit223_139_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['137'][1].init(614, 12, '!includeNode');
function visit222_137_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['132'][1].init(375, 53, 'currentNode[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit221_132_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['112'][1].init(2051, 16, '!self._.lastNode');
function visit220_112_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['106'][1].init(119, 29, 'path.block || path.blockLimit');
function visit219_106_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['104'][1].init(180, 27, 'testRange.checkEndOfBlock()');
function visit218_104_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['100'][3].init(57, 107, '!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary()');
function visit217_100_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['100'][2].init(1301, 54, 'self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE');
function visit216_100_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['100'][1].init(39, 165, 'self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary()');
function visit215_100_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['99'][1].init(1259, 205, 'self._.lastNode && self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary()');
function visit214_99_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['82'][1].init(294, 36, 'self.forceBrBreak || !self.enlargeBr');
function visit213_82_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['74'][1].init(526, 16, '!self._.lastNode');
function visit212_74_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['41'][1].init(323, 12, 'self._ || {}');
function visit211_41_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['30'][1].init(14, 20, 'arguments.length < 1');
function visit210_30_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/domIterator.js'].functionData[0]++;
  _$jscoverage['/editor/domIterator.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/domIterator.js'].lineData[12]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/domIterator.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/domIterator.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/domIterator.js'].lineData[15]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/domIterator.js'].lineData[16]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, KER = Editor.RangeType, Dom = S.require('dom');
  _$jscoverage['/editor/domIterator.js'].lineData[29]++;
  function Iterator(range) {
    _$jscoverage['/editor/domIterator.js'].functionData[1]++;
    _$jscoverage['/editor/domIterator.js'].lineData[30]++;
    if (visit210_30_1(arguments.length < 1)) {
      _$jscoverage['/editor/domIterator.js'].lineData[31]++;
      return;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[33]++;
    var self = this;
    _$jscoverage['/editor/domIterator.js'].lineData[34]++;
    self.range = range;
    _$jscoverage['/editor/domIterator.js'].lineData[35]++;
    self.forceBrBreak = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[38]++;
    self.enlargeBr = TRUE;
    _$jscoverage['/editor/domIterator.js'].lineData[39]++;
    self.enforceRealBlocks = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[41]++;
    self._ = visit211_41_1(self._ || {});
  }
  _$jscoverage['/editor/domIterator.js'].lineData[44]++;
  var beginWhitespaceRegex = /^[\r\n\t ]*$/;
  _$jscoverage['/editor/domIterator.js'].lineData[46]++;
  S.augment(Iterator, {
  getNextParagraph: function(blockTag) {
  _$jscoverage['/editor/domIterator.js'].functionData[2]++;
  _$jscoverage['/editor/domIterator.js'].lineData[60]++;
  var block, lastNode, self = this;
  _$jscoverage['/editor/domIterator.js'].lineData[65]++;
  var range;
  _$jscoverage['/editor/domIterator.js'].lineData[68]++;
  var isLast;
  _$jscoverage['/editor/domIterator.js'].lineData[71]++;
  var removePreviousBr, removeLastBr;
  _$jscoverage['/editor/domIterator.js'].lineData[74]++;
  if (visit212_74_1(!self._.lastNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[75]++;
    range = self.range.clone();
    _$jscoverage['/editor/domIterator.js'].lineData[80]++;
    range.shrink(KER.SHRINK_ELEMENT, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[82]++;
    range.enlarge(visit213_82_1(self.forceBrBreak || !self.enlargeBr) ? KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);
    _$jscoverage['/editor/domIterator.js'].lineData[85]++;
    var walker = new Walker(range), ignoreBookmarkTextEvaluator = Walker.bookmark(TRUE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[88]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[89]++;
    self._.nextNode = walker.next();
    _$jscoverage['/editor/domIterator.js'].lineData[91]++;
    walker = new Walker(range);
    _$jscoverage['/editor/domIterator.js'].lineData[92]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[93]++;
    lastNode = walker.previous();
    _$jscoverage['/editor/domIterator.js'].lineData[94]++;
    self._.lastNode = lastNode._4eNextSourceNode(TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[99]++;
    if (visit214_99_1(self._.lastNode && visit215_100_1(visit216_100_2(self._.lastNode[0].nodeType === Dom.NodeType.TEXT_NODE) && visit217_100_3(!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4eIsBlockBoundary())))) {
      _$jscoverage['/editor/domIterator.js'].lineData[102]++;
      var testRange = new KERange(range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[103]++;
      testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/domIterator.js'].lineData[104]++;
      if (visit218_104_1(testRange.checkEndOfBlock())) {
        _$jscoverage['/editor/domIterator.js'].lineData[105]++;
        var path = new ElementPath(testRange.endContainer);
        _$jscoverage['/editor/domIterator.js'].lineData[106]++;
        var lastBlock = visit219_106_1(path.block || path.blockLimit);
        _$jscoverage['/editor/domIterator.js'].lineData[107]++;
        self._.lastNode = lastBlock._4eNextSourceNode(TRUE);
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[112]++;
    if (visit220_112_1(!self._.lastNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[113]++;
      self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
      _$jscoverage['/editor/domIterator.js'].lineData[114]++;
      Dom.insertAfter(self._.lastNode[0], lastNode[0]);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[118]++;
    range = NULL;
  }
  _$jscoverage['/editor/domIterator.js'].lineData[121]++;
  var currentNode = self._.nextNode;
  _$jscoverage['/editor/domIterator.js'].lineData[122]++;
  lastNode = self._.lastNode;
  _$jscoverage['/editor/domIterator.js'].lineData[124]++;
  self._.nextNode = NULL;
  _$jscoverage['/editor/domIterator.js'].lineData[125]++;
  while (currentNode) {
    _$jscoverage['/editor/domIterator.js'].lineData[128]++;
    var closeRange = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[132]++;
    var includeNode = (visit221_132_1(currentNode[0].nodeType !== Dom.NodeType.ELEMENT_NODE)), continueFromSibling = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[137]++;
    if (visit222_137_1(!includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[138]++;
      var nodeName = currentNode.nodeName();
      _$jscoverage['/editor/domIterator.js'].lineData[139]++;
      var forceBrBreak = visit223_139_1(self.forceBrBreak && {
  br: 1});
      _$jscoverage['/editor/domIterator.js'].lineData[142]++;
      if (visit224_142_1(currentNode._4eIsBlockBoundary(forceBrBreak))) {
        _$jscoverage['/editor/domIterator.js'].lineData[145]++;
        if (visit225_145_1(nodeName === 'br')) {
          _$jscoverage['/editor/domIterator.js'].lineData[146]++;
          includeNode = TRUE;
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[147]++;
          if (visit226_147_1(!range && visit227_147_2(!currentNode[0].childNodes.length && visit228_147_3(nodeName !== 'hr')))) {
            _$jscoverage['/editor/domIterator.js'].lineData[150]++;
            block = currentNode;
            _$jscoverage['/editor/domIterator.js'].lineData[151]++;
            isLast = currentNode.equals(lastNode);
            _$jscoverage['/editor/domIterator.js'].lineData[152]++;
            break;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[157]++;
        if (visit229_157_1(range)) {
          _$jscoverage['/editor/domIterator.js'].lineData[158]++;
          range.setEndAt(currentNode, KER.POSITION_BEFORE_START);
          _$jscoverage['/editor/domIterator.js'].lineData[162]++;
          if (visit230_162_1(nodeName !== 'br')) {
            _$jscoverage['/editor/domIterator.js'].lineData[163]++;
            self._.nextNode = currentNode;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[167]++;
        closeRange = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[170]++;
        if (visit231_170_1(currentNode[0].firstChild)) {
          _$jscoverage['/editor/domIterator.js'].lineData[172]++;
          if (visit232_172_1(!range)) {
            _$jscoverage['/editor/domIterator.js'].lineData[173]++;
            range = new KERange(self.range.document);
            _$jscoverage['/editor/domIterator.js'].lineData[174]++;
            range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
          }
          _$jscoverage['/editor/domIterator.js'].lineData[177]++;
          currentNode = new Node(currentNode[0].firstChild);
          _$jscoverage['/editor/domIterator.js'].lineData[178]++;
          continue;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[180]++;
        includeNode = TRUE;
      }
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[182]++;
      if (visit233_182_1(currentNode[0].nodeType === Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/domIterator.js'].lineData[185]++;
        if (visit234_185_1(beginWhitespaceRegex.test(currentNode[0].nodeValue))) {
          _$jscoverage['/editor/domIterator.js'].lineData[186]++;
          includeNode = FALSE;
        }
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[192]++;
    if (visit235_192_1(includeNode && !range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[193]++;
      range = new KERange(self.range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[194]++;
      range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[198]++;
    isLast = visit236_198_1((visit237_198_2(!closeRange || includeNode)) && currentNode.equals(lastNode));
    _$jscoverage['/editor/domIterator.js'].lineData[202]++;
    if (visit238_202_1(range && !closeRange)) {
      _$jscoverage['/editor/domIterator.js'].lineData[203]++;
      while (visit239_203_1(!currentNode[0].nextSibling && !isLast)) {
        _$jscoverage['/editor/domIterator.js'].lineData[204]++;
        var parentNode = currentNode.parent();
        _$jscoverage['/editor/domIterator.js'].lineData[206]++;
        if (visit240_206_1(parentNode._4eIsBlockBoundary(visit241_206_2(self.forceBrBreak && {
  br: 1})))) {
          _$jscoverage['/editor/domIterator.js'].lineData[207]++;
          closeRange = TRUE;
          _$jscoverage['/editor/domIterator.js'].lineData[208]++;
          isLast = visit242_208_1(isLast || parentNode.equals(lastNode));
          _$jscoverage['/editor/domIterator.js'].lineData[209]++;
          break;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[212]++;
        currentNode = parentNode;
        _$jscoverage['/editor/domIterator.js'].lineData[213]++;
        includeNode = TRUE;
        _$jscoverage['/editor/domIterator.js'].lineData[214]++;
        isLast = currentNode.equals(lastNode);
        _$jscoverage['/editor/domIterator.js'].lineData[215]++;
        continueFromSibling = TRUE;
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[220]++;
    if (visit243_220_1(includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[221]++;
      range.setEndAt(currentNode, KER.POSITION_AFTER_END);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[224]++;
    currentNode = currentNode._4eNextSourceNode(continueFromSibling, NULL, lastNode);
    _$jscoverage['/editor/domIterator.js'].lineData[225]++;
    isLast = !currentNode;
    _$jscoverage['/editor/domIterator.js'].lineData[229]++;
    if (visit244_229_1(isLast || (visit245_229_2(closeRange && range)))) {
      _$jscoverage['/editor/domIterator.js'].lineData[230]++;
      break;
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[235]++;
  if (visit246_235_1(!block)) {
    _$jscoverage['/editor/domIterator.js'].lineData[237]++;
    if (visit247_237_1(!range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[238]++;
      if (visit248_238_1(self._.docEndMarker)) {
        _$jscoverage['/editor/domIterator.js'].lineData[239]++;
        self._.docEndMarker._4eRemove();
      }
      _$jscoverage['/editor/domIterator.js'].lineData[241]++;
      self._.nextNode = NULL;
      _$jscoverage['/editor/domIterator.js'].lineData[242]++;
      return NULL;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[245]++;
    var startPath = new ElementPath(range.startContainer);
    _$jscoverage['/editor/domIterator.js'].lineData[246]++;
    var startBlockLimit = startPath.blockLimit, checkLimits = {
  div: 1, 
  th: 1, 
  td: 1};
    _$jscoverage['/editor/domIterator.js'].lineData[248]++;
    block = startPath.block;
    _$jscoverage['/editor/domIterator.js'].lineData[250]++;
    if (visit249_250_1((visit250_250_2(!block || !block[0])) && visit251_250_3(!self.enforceRealBlocks && visit252_251_1(checkLimits[startBlockLimit.nodeName()] && visit253_252_1(range.checkStartOfBlock() && range.checkEndOfBlock()))))) {
      _$jscoverage['/editor/domIterator.js'].lineData[254]++;
      block = startBlockLimit;
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[255]++;
      if (visit254_255_1(!block || (visit255_255_2(self.enforceRealBlocks && visit256_255_3(block.nodeName() === 'li'))))) {
        _$jscoverage['/editor/domIterator.js'].lineData[257]++;
        block = new Node(self.range.document.createElement(visit257_257_1(blockTag || 'p')));
        _$jscoverage['/editor/domIterator.js'].lineData[259]++;
        block[0].appendChild(range.extractContents());
        _$jscoverage['/editor/domIterator.js'].lineData[260]++;
        block._4eTrim();
        _$jscoverage['/editor/domIterator.js'].lineData[262]++;
        range.insertNode(block);
        _$jscoverage['/editor/domIterator.js'].lineData[263]++;
        removePreviousBr = removeLastBr = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[264]++;
        if (visit258_264_1(block.nodeName() !== 'li')) {
          _$jscoverage['/editor/domIterator.js'].lineData[268]++;
          if (visit259_268_1(!range.checkStartOfBlock() || !range.checkEndOfBlock())) {
            _$jscoverage['/editor/domIterator.js'].lineData[270]++;
            block = block.clone(FALSE);
            _$jscoverage['/editor/domIterator.js'].lineData[273]++;
            block[0].appendChild(range.extractContents());
            _$jscoverage['/editor/domIterator.js'].lineData[274]++;
            block._4eTrim();
            _$jscoverage['/editor/domIterator.js'].lineData[278]++;
            var splitInfo = range.splitBlock();
            _$jscoverage['/editor/domIterator.js'].lineData[280]++;
            removePreviousBr = !splitInfo.wasStartOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[281]++;
            removeLastBr = !splitInfo.wasEndOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[284]++;
            range.insertNode(block);
          }
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[286]++;
          if (visit260_286_1(!isLast)) {
            _$jscoverage['/editor/domIterator.js'].lineData[292]++;
            self._.nextNode = (block.equals(lastNode) ? NULL : range.getBoundaryNodes().endNode._4eNextSourceNode(TRUE, NULL, lastNode));
          }
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[297]++;
  if (visit261_297_1(removePreviousBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[298]++;
    var previousSibling = new Node(block[0].previousSibling);
    _$jscoverage['/editor/domIterator.js'].lineData[299]++;
    if (visit262_299_1(previousSibling[0] && visit263_299_2(previousSibling[0].nodeType === Dom.NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/domIterator.js'].lineData[300]++;
      if (visit264_300_1(previousSibling.nodeName() === 'br')) {
        _$jscoverage['/editor/domIterator.js'].lineData[301]++;
        previousSibling._4eRemove();
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[302]++;
        if (visit265_302_1(previousSibling[0].lastChild && visit266_302_2(Dom.nodeName(previousSibling[0].lastChild) === 'br'))) {
          _$jscoverage['/editor/domIterator.js'].lineData[303]++;
          Dom._4eRemove(previousSibling[0].lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[308]++;
  if (visit267_308_1(removeLastBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[310]++;
    var bookmarkGuard = Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[312]++;
    var lastChild = new Node(block[0].lastChild);
    _$jscoverage['/editor/domIterator.js'].lineData[313]++;
    if (visit268_313_1(lastChild[0] && visit269_313_2(visit270_313_3(lastChild[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit271_313_4(lastChild.nodeName() === 'br')))) {
      _$jscoverage['/editor/domIterator.js'].lineData[315]++;
      if (visit272_315_1(UA.ie || visit273_315_2(lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)))) {
        _$jscoverage['/editor/domIterator.js'].lineData[317]++;
        lastChild.remove();
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[325]++;
  if (visit274_325_1(!self._.nextNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[326]++;
    self._.nextNode = (visit275_326_1(isLast || block.equals(lastNode))) ? NULL : block._4eNextSourceNode(TRUE, NULL, lastNode);
  }
  _$jscoverage['/editor/domIterator.js'].lineData[330]++;
  return block;
}});
  _$jscoverage['/editor/domIterator.js'].lineData[339]++;
  KERange.prototype.createIterator = function() {
  _$jscoverage['/editor/domIterator.js'].functionData[3]++;
  _$jscoverage['/editor/domIterator.js'].lineData[340]++;
  return new Iterator(this);
};
  _$jscoverage['/editor/domIterator.js'].lineData[343]++;
  return Iterator;
});
