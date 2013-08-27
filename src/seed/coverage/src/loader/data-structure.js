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
if (! _$jscoverage['/loader/data-structure.js']) {
  _$jscoverage['/loader/data-structure.js'] = {};
  _$jscoverage['/loader/data-structure.js'].lineData = [];
  _$jscoverage['/loader/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[8] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[39] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[47] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[55] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[59] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[61] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[69] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[70] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[71] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[73] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[81] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[89] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[97] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[105] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[113] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[121] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[132] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[133] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[134] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[135] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[138] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[140] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[144] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[145] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[148] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[149] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[150] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[152] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[153] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[157] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[165] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[173] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[175] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[177] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[187] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[195] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[213] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[215] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[225] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[227] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[229] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[237] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[255] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[263] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[264] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[274] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[275] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[283] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[284] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[292] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[294] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[295] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[303] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[304] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[306] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[313] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[319] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[320] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[323] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[326] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[332] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[335] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[339] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[341] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[342] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[345] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[348] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[354] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[358] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[361] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[363] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[368] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].functionData) {
  _$jscoverage['/loader/data-structure.js'].functionData = [];
  _$jscoverage['/loader/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[32] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[33] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[34] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['62'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['70'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['147'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['175'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['176'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['194'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['195'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['202'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['208'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['225'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['238'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['264'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['275'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['284'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['303'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['303'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['304'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['305'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['318'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['318'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['319'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['320'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['322'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['341'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['361'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['362'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['368'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['368'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['368'][1].init(319, 32, 'packages[pName] || systemPackage');
function visit366_368_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['362'][1].init(44, 23, 'p.length > pName.length');
function visit365_362_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['361'][1].init(50, 68, 'S.startsWith(modName, p) && p.length > pName.length');
function visit364_361_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['341'][1].init(192, 24, 'm.getPackage().isDebug()');
function visit363_341_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['322'][1].init(114, 34, 'normalizedRequiresStatus == status');
function visit362_322_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['320'][1].init(345, 150, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit361_320_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['319'][1].init(25, 14, 'requires || []');
function visit360_319_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['318'][2].init(255, 20, 'requires.length == 0');
function visit359_318_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['318'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['318'][1].init(242, 33, '!requires || requires.length == 0');
function visit358_318_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['305'][1].init(254, 18, '!requiresWithAlias');
function visit357_305_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['304'][1].init(25, 14, 'requires || []');
function visit356_304_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['303'][2].init(165, 20, 'requires.length == 0');
function visit355_303_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['303'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['303'][1].init(152, 33, '!requires || requires.length == 0');
function visit354_303_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['284'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit353_284_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['275'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit352_275_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['264'][1].init(51, 93, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit351_264_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['238'][1].init(51, 72, 'self.path || (self.path = defaultComponentJsName(self))');
function visit350_238_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['225'][1].init(78, 14, '!self.fullpath');
function visit349_225_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['208'][1].init(578, 17, 't = self.getTag()');
function visit348_208_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['202'][1].init(217, 178, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName())');
function visit347_202_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['195'][1].init(22, 13, 'self.fullpath');
function visit346_195_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['194'][1].init(214, 17, '!self.fullpathUri');
function visit345_194_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['176'][1].init(22, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit344_176_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['175'][1].init(80, 2, '!v');
function visit343_175_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['147'][1].init(118, 7, 'i < len');
function visit342_147_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['70'][1].init(48, 15, 'self.packageUri');
function visit341_70_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['62'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit340_62_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[8]++;
  var Loader = S.Loader, Path = S.Path, IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri', Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[13]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[14]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[24]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[25]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[28]++;
  S.augment(Package, {
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[30]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[39]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[47]++;
  return this.name;
}, 
  'getBase': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[55]++;
  return forwardSystemPackage(this, 'base');
}, 
  getPrefixUriForCombo: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[59]++;
  var self = this, packageName = self.getName();
  _$jscoverage['/loader/data-structure.js'].lineData[61]++;
  return self.getBase() + (visit340_62_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[69]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[70]++;
  if (visit341_70_1(self.packageUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[71]++;
    return self.packageUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[73]++;
  return self.packageUri = new S.Uri(this.getPrefixUriForCombo());
}, 
  getBaseUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[81]++;
  return forwardSystemPackage(this, 'baseUri');
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[89]++;
  return forwardSystemPackage(this, 'debug');
}, 
  isIgnorePackageNameInUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[97]++;
  return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[12]++;
  _$jscoverage['/loader/data-structure.js'].lineData[105]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[113]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[121]++;
  return forwardSystemPackage(this, 'group');
}});
  _$jscoverage['/loader/data-structure.js'].lineData[125]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[132]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[15]++;
    _$jscoverage['/loader/data-structure.js'].lineData[133]++;
    this.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[134]++;
    S.mix(this, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[135]++;
    this.callbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[138]++;
  S.augment(Module, {
  addCallback: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[140]++;
  this.callbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[144]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[145]++;
  var len = this.callbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[147]++;
  for (; visit342_147_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[148]++;
    callback = this.callbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[149]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[150]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[152]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[153]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[157]++;
  this.callbacks = [];
}, 
  setValue: function(v) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[165]++;
  this.value = v;
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[173]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[175]++;
  if (visit343_175_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[176]++;
    if (visit344_176_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[177]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[179]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[181]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[183]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[187]++;
  var self = this, t, fullpathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[194]++;
  if (visit345_194_1(!self.fullpathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[195]++;
    if (visit346_195_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[196]++;
      fullpathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[198]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[199]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[200]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[202]++;
      if (visit347_202_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName()))) {
        _$jscoverage['/loader/data-structure.js'].lineData[205]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[207]++;
      fullpathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[208]++;
      if (visit348_208_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[209]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[210]++;
        fullpathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[213]++;
    self.fullpathUri = fullpathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[215]++;
  return self.fullpathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[223]++;
  var self = this, fullpathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[225]++;
  if (visit349_225_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[226]++;
    fullpathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[227]++;
    self.fullpath = Utils.getMappedPath(self.runtime, fullpathUri.toString());
  }
  _$jscoverage['/loader/data-structure.js'].lineData[229]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[237]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[238]++;
  return visit350_238_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getValue: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[247]++;
  return this.value;
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[255]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[263]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[264]++;
  return visit351_264_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[274]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[275]++;
  return visit352_275_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[283]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[284]++;
  return visit353_284_1(self.charset || self.getPackage().getCharset());
}, 
  'getRequiredMods': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[292]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[294]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[295]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[300]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[303]++;
  if (visit354_303_1(!requires || visit355_303_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[304]++;
    return visit356_304_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[305]++;
    if (visit357_305_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[306]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[309]++;
  return requiresWithAlias;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[313]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[318]++;
  if (visit358_318_1(!requires || visit359_318_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[319]++;
    return visit360_319_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[320]++;
    if (visit361_320_1((normalizedRequires = self.normalizedRequires) && (visit362_322_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[323]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[325]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[326]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}});
  _$jscoverage['/loader/data-structure.js'].lineData[332]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[334]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[33]++;
    _$jscoverage['/loader/data-structure.js'].lineData[335]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[339]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[341]++;
    if (visit363_341_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[342]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[345]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[348]++;
  var systemPackage = new Loader.Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[353]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[34]++;
    _$jscoverage['/loader/data-structure.js'].lineData[354]++;
    var packages = self.config('packages'), pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[358]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[361]++;
      if (visit364_361_1(S.startsWith(modName, p) && visit365_362_1(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[363]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[368]++;
    return visit366_368_1(packages[pName] || systemPackage);
  }
})(KISSY);
