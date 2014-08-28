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
if (! _$jscoverage['/base/traversal.js']) {
  _$jscoverage['/base/traversal.js'] = {};
  _$jscoverage['/base/traversal.js'].lineData = [];
  _$jscoverage['/base/traversal.js'].lineData[6] = 0;
  _$jscoverage['/base/traversal.js'].lineData[7] = 0;
  _$jscoverage['/base/traversal.js'].lineData[8] = 0;
  _$jscoverage['/base/traversal.js'].lineData[11] = 0;
  _$jscoverage['/base/traversal.js'].lineData[20] = 0;
  _$jscoverage['/base/traversal.js'].lineData[34] = 0;
  _$jscoverage['/base/traversal.js'].lineData[35] = 0;
  _$jscoverage['/base/traversal.js'].lineData[49] = 0;
  _$jscoverage['/base/traversal.js'].lineData[50] = 0;
  _$jscoverage['/base/traversal.js'].lineData[62] = 0;
  _$jscoverage['/base/traversal.js'].lineData[63] = 0;
  _$jscoverage['/base/traversal.js'].lineData[75] = 0;
  _$jscoverage['/base/traversal.js'].lineData[76] = 0;
  _$jscoverage['/base/traversal.js'].lineData[88] = 0;
  _$jscoverage['/base/traversal.js'].lineData[100] = 0;
  _$jscoverage['/base/traversal.js'].lineData[111] = 0;
  _$jscoverage['/base/traversal.js'].lineData[121] = 0;
  _$jscoverage['/base/traversal.js'].lineData[132] = 0;
  _$jscoverage['/base/traversal.js'].lineData[142] = 0;
  _$jscoverage['/base/traversal.js'].lineData[143] = 0;
  _$jscoverage['/base/traversal.js'].lineData[144] = 0;
  _$jscoverage['/base/traversal.js'].lineData[145] = 0;
  _$jscoverage['/base/traversal.js'].lineData[147] = 0;
  _$jscoverage['/base/traversal.js'].lineData[155] = 0;
  _$jscoverage['/base/traversal.js'].lineData[162] = 0;
  _$jscoverage['/base/traversal.js'].lineData[163] = 0;
  _$jscoverage['/base/traversal.js'].lineData[164] = 0;
  _$jscoverage['/base/traversal.js'].lineData[165] = 0;
  _$jscoverage['/base/traversal.js'].lineData[167] = 0;
  _$jscoverage['/base/traversal.js'].lineData[168] = 0;
  _$jscoverage['/base/traversal.js'].lineData[169] = 0;
  _$jscoverage['/base/traversal.js'].lineData[170] = 0;
  _$jscoverage['/base/traversal.js'].lineData[173] = 0;
  _$jscoverage['/base/traversal.js'].lineData[176] = 0;
  _$jscoverage['/base/traversal.js'].lineData[178] = 0;
  _$jscoverage['/base/traversal.js'].lineData[179] = 0;
  _$jscoverage['/base/traversal.js'].lineData[182] = 0;
  _$jscoverage['/base/traversal.js'].lineData[193] = 0;
  _$jscoverage['/base/traversal.js'].lineData[194] = 0;
  _$jscoverage['/base/traversal.js'].lineData[195] = 0;
  _$jscoverage['/base/traversal.js'].lineData[196] = 0;
  _$jscoverage['/base/traversal.js'].lineData[198] = 0;
  _$jscoverage['/base/traversal.js'].lineData[199] = 0;
  _$jscoverage['/base/traversal.js'].lineData[200] = 0;
  _$jscoverage['/base/traversal.js'].lineData[203] = 0;
  _$jscoverage['/base/traversal.js'].lineData[211] = 0;
  _$jscoverage['/base/traversal.js'].lineData[212] = 0;
  _$jscoverage['/base/traversal.js'].lineData[213] = 0;
  _$jscoverage['/base/traversal.js'].lineData[215] = 0;
  _$jscoverage['/base/traversal.js'].lineData[216] = 0;
  _$jscoverage['/base/traversal.js'].lineData[218] = 0;
  _$jscoverage['/base/traversal.js'].lineData[219] = 0;
  _$jscoverage['/base/traversal.js'].lineData[221] = 0;
  _$jscoverage['/base/traversal.js'].lineData[222] = 0;
  _$jscoverage['/base/traversal.js'].lineData[224] = 0;
  _$jscoverage['/base/traversal.js'].lineData[226] = 0;
  _$jscoverage['/base/traversal.js'].lineData[228] = 0;
  _$jscoverage['/base/traversal.js'].lineData[230] = 0;
  _$jscoverage['/base/traversal.js'].lineData[235] = 0;
  _$jscoverage['/base/traversal.js'].lineData[236] = 0;
  _$jscoverage['/base/traversal.js'].lineData[237] = 0;
  _$jscoverage['/base/traversal.js'].lineData[238] = 0;
  _$jscoverage['/base/traversal.js'].lineData[239] = 0;
  _$jscoverage['/base/traversal.js'].lineData[244] = 0;
  _$jscoverage['/base/traversal.js'].lineData[245] = 0;
  _$jscoverage['/base/traversal.js'].lineData[251] = 0;
  _$jscoverage['/base/traversal.js'].lineData[252] = 0;
  _$jscoverage['/base/traversal.js'].lineData[253] = 0;
  _$jscoverage['/base/traversal.js'].lineData[256] = 0;
  _$jscoverage['/base/traversal.js'].lineData[259] = 0;
  _$jscoverage['/base/traversal.js'].lineData[262] = 0;
  _$jscoverage['/base/traversal.js'].lineData[263] = 0;
  _$jscoverage['/base/traversal.js'].lineData[264] = 0;
  _$jscoverage['/base/traversal.js'].lineData[266] = 0;
  _$jscoverage['/base/traversal.js'].lineData[267] = 0;
  _$jscoverage['/base/traversal.js'].lineData[268] = 0;
  _$jscoverage['/base/traversal.js'].lineData[269] = 0;
  _$jscoverage['/base/traversal.js'].lineData[271] = 0;
  _$jscoverage['/base/traversal.js'].lineData[272] = 0;
  _$jscoverage['/base/traversal.js'].lineData[273] = 0;
  _$jscoverage['/base/traversal.js'].lineData[276] = 0;
  _$jscoverage['/base/traversal.js'].lineData[277] = 0;
  _$jscoverage['/base/traversal.js'].lineData[279] = 0;
  _$jscoverage['/base/traversal.js'].lineData[283] = 0;
  _$jscoverage['/base/traversal.js'].lineData[284] = 0;
  _$jscoverage['/base/traversal.js'].lineData[291] = 0;
  _$jscoverage['/base/traversal.js'].lineData[292] = 0;
  _$jscoverage['/base/traversal.js'].lineData[295] = 0;
  _$jscoverage['/base/traversal.js'].lineData[296] = 0;
  _$jscoverage['/base/traversal.js'].lineData[297] = 0;
  _$jscoverage['/base/traversal.js'].lineData[298] = 0;
  _$jscoverage['/base/traversal.js'].lineData[299] = 0;
  _$jscoverage['/base/traversal.js'].lineData[300] = 0;
  _$jscoverage['/base/traversal.js'].lineData[302] = 0;
  _$jscoverage['/base/traversal.js'].lineData[303] = 0;
  _$jscoverage['/base/traversal.js'].lineData[305] = 0;
  _$jscoverage['/base/traversal.js'].lineData[307] = 0;
  _$jscoverage['/base/traversal.js'].lineData[308] = 0;
  _$jscoverage['/base/traversal.js'].lineData[312] = 0;
  _$jscoverage['/base/traversal.js'].lineData[315] = 0;
}
if (! _$jscoverage['/base/traversal.js'].functionData) {
  _$jscoverage['/base/traversal.js'].functionData = [];
  _$jscoverage['/base/traversal.js'].functionData[0] = 0;
  _$jscoverage['/base/traversal.js'].functionData[1] = 0;
  _$jscoverage['/base/traversal.js'].functionData[2] = 0;
  _$jscoverage['/base/traversal.js'].functionData[3] = 0;
  _$jscoverage['/base/traversal.js'].functionData[4] = 0;
  _$jscoverage['/base/traversal.js'].functionData[5] = 0;
  _$jscoverage['/base/traversal.js'].functionData[6] = 0;
  _$jscoverage['/base/traversal.js'].functionData[7] = 0;
  _$jscoverage['/base/traversal.js'].functionData[8] = 0;
  _$jscoverage['/base/traversal.js'].functionData[9] = 0;
  _$jscoverage['/base/traversal.js'].functionData[10] = 0;
  _$jscoverage['/base/traversal.js'].functionData[11] = 0;
  _$jscoverage['/base/traversal.js'].functionData[12] = 0;
  _$jscoverage['/base/traversal.js'].functionData[13] = 0;
  _$jscoverage['/base/traversal.js'].functionData[14] = 0;
  _$jscoverage['/base/traversal.js'].functionData[15] = 0;
  _$jscoverage['/base/traversal.js'].functionData[16] = 0;
  _$jscoverage['/base/traversal.js'].functionData[17] = 0;
  _$jscoverage['/base/traversal.js'].functionData[18] = 0;
  _$jscoverage['/base/traversal.js'].functionData[19] = 0;
}
if (! _$jscoverage['/base/traversal.js'].branchData) {
  _$jscoverage['/base/traversal.js'].branchData = {};
  _$jscoverage['/base/traversal.js'].branchData['35'] = [];
  _$jscoverage['/base/traversal.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['50'] = [];
  _$jscoverage['/base/traversal.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['63'] = [];
  _$jscoverage['/base/traversal.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['76'] = [];
  _$jscoverage['/base/traversal.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['144'] = [];
  _$jscoverage['/base/traversal.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['162'] = [];
  _$jscoverage['/base/traversal.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['163'] = [];
  _$jscoverage['/base/traversal.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['164'] = [];
  _$jscoverage['/base/traversal.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['169'] = [];
  _$jscoverage['/base/traversal.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['178'] = [];
  _$jscoverage['/base/traversal.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['195'] = [];
  _$jscoverage['/base/traversal.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['198'] = [];
  _$jscoverage['/base/traversal.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['199'] = [];
  _$jscoverage['/base/traversal.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['212'] = [];
  _$jscoverage['/base/traversal.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['215'] = [];
  _$jscoverage['/base/traversal.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['218'] = [];
  _$jscoverage['/base/traversal.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['221'] = [];
  _$jscoverage['/base/traversal.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['224'] = [];
  _$jscoverage['/base/traversal.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['226'] = [];
  _$jscoverage['/base/traversal.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['235'] = [];
  _$jscoverage['/base/traversal.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['239'] = [];
  _$jscoverage['/base/traversal.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['244'] = [];
  _$jscoverage['/base/traversal.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['245'] = [];
  _$jscoverage['/base/traversal.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['246'] = [];
  _$jscoverage['/base/traversal.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['247'] = [];
  _$jscoverage['/base/traversal.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['247'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['249'] = [];
  _$jscoverage['/base/traversal.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['250'] = [];
  _$jscoverage['/base/traversal.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['252'] = [];
  _$jscoverage['/base/traversal.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['259'] = [];
  _$jscoverage['/base/traversal.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['263'] = [];
  _$jscoverage['/base/traversal.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['266'] = [];
  _$jscoverage['/base/traversal.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['268'] = [];
  _$jscoverage['/base/traversal.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['271'] = [];
  _$jscoverage['/base/traversal.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['272'] = [];
  _$jscoverage['/base/traversal.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['276'] = [];
  _$jscoverage['/base/traversal.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['291'] = [];
  _$jscoverage['/base/traversal.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['295'] = [];
  _$jscoverage['/base/traversal.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['297'] = [];
  _$jscoverage['/base/traversal.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['299'] = [];
  _$jscoverage['/base/traversal.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['299'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['302'] = [];
  _$jscoverage['/base/traversal.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['307'] = [];
  _$jscoverage['/base/traversal.js'].branchData['307'][1] = new BranchData();
}
_$jscoverage['/base/traversal.js'].branchData['307'][1].init(397, 6, 'filter');
function visit571_307_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['302'][1].init(173, 11, 'el === elem');
function visit570_302_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['299'][2].init(64, 37, 'el.nodeType !== NodeType.ELEMENT_NODE');
function visit569_299_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['299'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['299'][1].init(50, 51, '!allowText && el.nodeType !== NodeType.ELEMENT_NODE');
function visit568_299_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['297'][1].init(79, 14, 'i < tmp.length');
function visit567_297_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['295'][1].init(236, 10, 'parentNode');
function visit566_295_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['291'][1].init(153, 14, 'elem && parent');
function visit565_291_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['276'][1].init(367, 22, 'Dom.test(elem, filter)');
function visit564_276_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['272'][1].init(21, 25, 'Dom.test(elem, filter[i])');
function visit563_272_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['271'][1].init(128, 5, 'i < l');
function visit562_271_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['268'][1].init(55, 2, '!l');
function visit561_268_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['266'][1].init(71, 17, 'S.isArray(filter)');
function visit560_266_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['263'][1].init(13, 7, '!filter');
function visit559_263_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['259'][1].init(1283, 14, 'ret[0] || null');
function visit558_259_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['252'][1].init(53, 8, '!isArray');
function visit557_252_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['250'][1].init(44, 33, '!extraFilter || extraFilter(elem)');
function visit556_250_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['249'][1].init(153, 79, 'testFilter(elem, filter) && (!extraFilter || extraFilter(elem))');
function visit555_249_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['247'][2].init(64, 36, 'elem.nodeType === NodeType.TEXT_NODE');
function visit554_247_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['247'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['247'][1].init(62, 53, 'elem.nodeType === NodeType.TEXT_NODE && allowTextNode');
function visit553_247_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['246'][2].init(0, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit552_246_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['246'][1].init(-1, 116, 'elem.nodeType === NodeType.ELEMENT_NODE || elem.nodeType === NodeType.TEXT_NODE && allowTextNode');
function visit551_246_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['245'][1].init(35, 233, '(elem.nodeType === NodeType.ELEMENT_NODE || elem.nodeType === NodeType.TEXT_NODE && allowTextNode) && testFilter(elem, filter) && (!extraFilter || extraFilter(elem))');
function visit550_245_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['244'][2].init(791, 16, 'elem !== context');
function visit549_244_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['244'][1].init(783, 24, 'elem && elem !== context');
function visit548_244_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['239'][1].init(24, 21, '++fi === filterLength');
function visit547_239_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['235'][1].init(534, 24, 'typeof filter === \'number\'');
function visit546_235_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['226'][1].init(337, 20, 'filter === undefined');
function visit545_226_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['224'][2].init(286, 27, 'context && Dom.get(context)');
function visit544_224_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['224'][1].init(286, 36, '(context && Dom.get(context)) || null');
function visit543_224_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['221'][1].init(223, 5, '!elem');
function visit542_221_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['218'][1].init(150, 11, '!includeSef');
function visit541_218_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['215'][1].init(87, 12, 'filter === 0');
function visit540_215_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['212'][1].init(13, 23, '!(elem = Dom.get(elem))');
function visit539_212_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['199'][1].init(25, 15, 'n1[i] !== n2[i]');
function visit538_199_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['198'][1].init(212, 6, 'i >= 0');
function visit537_198_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['195'][1].init(93, 23, 'n1.length !== n2.length');
function visit536_195_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['178'][1].init(679, 22, 'typeof s2 === \'string\'');
function visit535_178_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['169'][1].init(29, 36, 'c.nodeType === NodeType.ELEMENT_NODE');
function visit534_169_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['164'][1].init(70, 2, '!p');
function visit533_164_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['163'][1].init(25, 19, 'el && el.parentNode');
function visit532_163_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['162'][1].init(201, 3, '!s2');
function visit531_162_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['144'][1].init(117, 22, 'container && contained');
function visit530_144_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['76'][1].init(74, 22, 'elem && elem.lastChild');
function visit529_76_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['63'][1].init(74, 23, 'elem && elem.firstChild');
function visit528_63_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['50'][1].init(28, 49, 'elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE');
function visit527_50_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['35'][1].init(28, 49, 'elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE');
function visit526_35_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/traversal.js'].functionData[0]++;
  _$jscoverage['/base/traversal.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/traversal.js'].lineData[8]++;
  var NodeType = Dom.NodeType, CONTAIN_MASK = 16;
  _$jscoverage['/base/traversal.js'].lineData[11]++;
  S.mix(Dom, {
  _contains: function(a, b) {
  _$jscoverage['/base/traversal.js'].functionData[1]++;
  _$jscoverage['/base/traversal.js'].lineData[20]++;
  return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
}, 
  closest: function(selector, filter, context, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[2]++;
  _$jscoverage['/base/traversal.js'].lineData[34]++;
  return nth(selector, filter, 'parentNode', function(elem) {
  _$jscoverage['/base/traversal.js'].functionData[3]++;
  _$jscoverage['/base/traversal.js'].lineData[35]++;
  return visit526_35_1(elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE);
}, context, true, allowTextNode);
}, 
  parent: function(selector, filter, context) {
  _$jscoverage['/base/traversal.js'].functionData[4]++;
  _$jscoverage['/base/traversal.js'].lineData[49]++;
  return nth(selector, filter, 'parentNode', function(elem) {
  _$jscoverage['/base/traversal.js'].functionData[5]++;
  _$jscoverage['/base/traversal.js'].lineData[50]++;
  return visit527_50_1(elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE);
}, context, undefined);
}, 
  first: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[6]++;
  _$jscoverage['/base/traversal.js'].lineData[62]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/traversal.js'].lineData[63]++;
  return nth(visit528_63_1(elem && elem.firstChild), filter, 'nextSibling', undefined, undefined, true, allowTextNode);
}, 
  last: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[7]++;
  _$jscoverage['/base/traversal.js'].lineData[75]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/traversal.js'].lineData[76]++;
  return nth(visit529_76_1(elem && elem.lastChild), filter, 'previousSibling', undefined, undefined, true, allowTextNode);
}, 
  next: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[8]++;
  _$jscoverage['/base/traversal.js'].lineData[88]++;
  return nth(selector, filter, 'nextSibling', undefined, undefined, undefined, allowTextNode);
}, 
  prev: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[9]++;
  _$jscoverage['/base/traversal.js'].lineData[100]++;
  return nth(selector, filter, 'previousSibling', undefined, undefined, undefined, allowTextNode);
}, 
  siblings: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[10]++;
  _$jscoverage['/base/traversal.js'].lineData[111]++;
  return getSiblings(selector, filter, true, allowTextNode);
}, 
  children: function(selector, filter) {
  _$jscoverage['/base/traversal.js'].functionData[11]++;
  _$jscoverage['/base/traversal.js'].lineData[121]++;
  return getSiblings(selector, filter, undefined);
}, 
  contents: function(selector, filter) {
  _$jscoverage['/base/traversal.js'].functionData[12]++;
  _$jscoverage['/base/traversal.js'].lineData[132]++;
  return getSiblings(selector, filter, undefined, 1);
}, 
  contains: function(container, contained) {
  _$jscoverage['/base/traversal.js'].functionData[13]++;
  _$jscoverage['/base/traversal.js'].lineData[142]++;
  container = Dom.get(container);
  _$jscoverage['/base/traversal.js'].lineData[143]++;
  contained = Dom.get(contained);
  _$jscoverage['/base/traversal.js'].lineData[144]++;
  if (visit530_144_1(container && contained)) {
    _$jscoverage['/base/traversal.js'].lineData[145]++;
    return Dom._contains(container, contained);
  }
  _$jscoverage['/base/traversal.js'].lineData[147]++;
  return false;
}, 
  index: function(selector, s2) {
  _$jscoverage['/base/traversal.js'].functionData[14]++;
  _$jscoverage['/base/traversal.js'].lineData[155]++;
  var els = Dom.query(selector), c, n = 0, p, els2, el = els[0];
  _$jscoverage['/base/traversal.js'].lineData[162]++;
  if (visit531_162_1(!s2)) {
    _$jscoverage['/base/traversal.js'].lineData[163]++;
    p = visit532_163_1(el && el.parentNode);
    _$jscoverage['/base/traversal.js'].lineData[164]++;
    if (visit533_164_1(!p)) {
      _$jscoverage['/base/traversal.js'].lineData[165]++;
      return -1;
    }
    _$jscoverage['/base/traversal.js'].lineData[167]++;
    c = el;
    _$jscoverage['/base/traversal.js'].lineData[168]++;
    while ((c = c.previousSibling)) {
      _$jscoverage['/base/traversal.js'].lineData[169]++;
      if (visit534_169_1(c.nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/traversal.js'].lineData[170]++;
        n++;
      }
    }
    _$jscoverage['/base/traversal.js'].lineData[173]++;
    return n;
  }
  _$jscoverage['/base/traversal.js'].lineData[176]++;
  els2 = Dom.query(s2);
  _$jscoverage['/base/traversal.js'].lineData[178]++;
  if (visit535_178_1(typeof s2 === 'string')) {
    _$jscoverage['/base/traversal.js'].lineData[179]++;
    return S.indexOf(el, els2);
  }
  _$jscoverage['/base/traversal.js'].lineData[182]++;
  return S.indexOf(els2[0], els);
}, 
  equals: function(n1, n2) {
  _$jscoverage['/base/traversal.js'].functionData[15]++;
  _$jscoverage['/base/traversal.js'].lineData[193]++;
  n1 = Dom.query(n1);
  _$jscoverage['/base/traversal.js'].lineData[194]++;
  n2 = Dom.query(n2);
  _$jscoverage['/base/traversal.js'].lineData[195]++;
  if (visit536_195_1(n1.length !== n2.length)) {
    _$jscoverage['/base/traversal.js'].lineData[196]++;
    return false;
  }
  _$jscoverage['/base/traversal.js'].lineData[198]++;
  for (var i = n1.length; visit537_198_1(i >= 0); i--) {
    _$jscoverage['/base/traversal.js'].lineData[199]++;
    if (visit538_199_1(n1[i] !== n2[i])) {
      _$jscoverage['/base/traversal.js'].lineData[200]++;
      return false;
    }
  }
  _$jscoverage['/base/traversal.js'].lineData[203]++;
  return true;
}});
  _$jscoverage['/base/traversal.js'].lineData[211]++;
  function nth(elem, filter, direction, extraFilter, context, includeSef, allowTextNode) {
    _$jscoverage['/base/traversal.js'].functionData[16]++;
    _$jscoverage['/base/traversal.js'].lineData[212]++;
    if (visit539_212_1(!(elem = Dom.get(elem)))) {
      _$jscoverage['/base/traversal.js'].lineData[213]++;
      return null;
    }
    _$jscoverage['/base/traversal.js'].lineData[215]++;
    if (visit540_215_1(filter === 0)) {
      _$jscoverage['/base/traversal.js'].lineData[216]++;
      return elem;
    }
    _$jscoverage['/base/traversal.js'].lineData[218]++;
    if (visit541_218_1(!includeSef)) {
      _$jscoverage['/base/traversal.js'].lineData[219]++;
      elem = elem[direction];
    }
    _$jscoverage['/base/traversal.js'].lineData[221]++;
    if (visit542_221_1(!elem)) {
      _$jscoverage['/base/traversal.js'].lineData[222]++;
      return null;
    }
    _$jscoverage['/base/traversal.js'].lineData[224]++;
    context = visit543_224_1((visit544_224_2(context && Dom.get(context))) || null);
    _$jscoverage['/base/traversal.js'].lineData[226]++;
    if (visit545_226_1(filter === undefined)) {
      _$jscoverage['/base/traversal.js'].lineData[228]++;
      filter = 1;
    }
    _$jscoverage['/base/traversal.js'].lineData[230]++;
    var ret = [], isArray = S.isArray(filter), fi, filterLength;
    _$jscoverage['/base/traversal.js'].lineData[235]++;
    if (visit546_235_1(typeof filter === 'number')) {
      _$jscoverage['/base/traversal.js'].lineData[236]++;
      fi = 0;
      _$jscoverage['/base/traversal.js'].lineData[237]++;
      filterLength = filter;
      _$jscoverage['/base/traversal.js'].lineData[238]++;
      filter = function() {
  _$jscoverage['/base/traversal.js'].functionData[17]++;
  _$jscoverage['/base/traversal.js'].lineData[239]++;
  return visit547_239_1(++fi === filterLength);
};
    }
    _$jscoverage['/base/traversal.js'].lineData[244]++;
    while (visit548_244_1(elem && visit549_244_2(elem !== context))) {
      _$jscoverage['/base/traversal.js'].lineData[245]++;
      if (visit550_245_1((visit551_246_1(visit552_246_2(elem.nodeType === NodeType.ELEMENT_NODE) || visit553_247_1(visit554_247_2(elem.nodeType === NodeType.TEXT_NODE) && allowTextNode))) && visit555_249_1(testFilter(elem, filter) && (visit556_250_1(!extraFilter || extraFilter(elem)))))) {
        _$jscoverage['/base/traversal.js'].lineData[251]++;
        ret.push(elem);
        _$jscoverage['/base/traversal.js'].lineData[252]++;
        if (visit557_252_1(!isArray)) {
          _$jscoverage['/base/traversal.js'].lineData[253]++;
          break;
        }
      }
      _$jscoverage['/base/traversal.js'].lineData[256]++;
      elem = elem[direction];
    }
    _$jscoverage['/base/traversal.js'].lineData[259]++;
    return isArray ? ret : visit558_259_1(ret[0] || null);
  }
  _$jscoverage['/base/traversal.js'].lineData[262]++;
  function testFilter(elem, filter) {
    _$jscoverage['/base/traversal.js'].functionData[18]++;
    _$jscoverage['/base/traversal.js'].lineData[263]++;
    if (visit559_263_1(!filter)) {
      _$jscoverage['/base/traversal.js'].lineData[264]++;
      return true;
    }
    _$jscoverage['/base/traversal.js'].lineData[266]++;
    if (visit560_266_1(S.isArray(filter))) {
      _$jscoverage['/base/traversal.js'].lineData[267]++;
      var i, l = filter.length;
      _$jscoverage['/base/traversal.js'].lineData[268]++;
      if (visit561_268_1(!l)) {
        _$jscoverage['/base/traversal.js'].lineData[269]++;
        return true;
      }
      _$jscoverage['/base/traversal.js'].lineData[271]++;
      for (i = 0; visit562_271_1(i < l); i++) {
        _$jscoverage['/base/traversal.js'].lineData[272]++;
        if (visit563_272_1(Dom.test(elem, filter[i]))) {
          _$jscoverage['/base/traversal.js'].lineData[273]++;
          return true;
        }
      }
    } else {
      _$jscoverage['/base/traversal.js'].lineData[276]++;
      if (visit564_276_1(Dom.test(elem, filter))) {
        _$jscoverage['/base/traversal.js'].lineData[277]++;
        return true;
      }
    }
    _$jscoverage['/base/traversal.js'].lineData[279]++;
    return false;
  }
  _$jscoverage['/base/traversal.js'].lineData[283]++;
  function getSiblings(selector, filter, parent, allowText) {
    _$jscoverage['/base/traversal.js'].functionData[19]++;
    _$jscoverage['/base/traversal.js'].lineData[284]++;
    var ret = [], tmp, i, el, elem = Dom.get(selector), parentNode = elem;
    _$jscoverage['/base/traversal.js'].lineData[291]++;
    if (visit565_291_1(elem && parent)) {
      _$jscoverage['/base/traversal.js'].lineData[292]++;
      parentNode = elem.parentNode;
    }
    _$jscoverage['/base/traversal.js'].lineData[295]++;
    if (visit566_295_1(parentNode)) {
      _$jscoverage['/base/traversal.js'].lineData[296]++;
      tmp = S.makeArray(parentNode.childNodes);
      _$jscoverage['/base/traversal.js'].lineData[297]++;
      for (i = 0; visit567_297_1(i < tmp.length); i++) {
        _$jscoverage['/base/traversal.js'].lineData[298]++;
        el = tmp[i];
        _$jscoverage['/base/traversal.js'].lineData[299]++;
        if (visit568_299_1(!allowText && visit569_299_2(el.nodeType !== NodeType.ELEMENT_NODE))) {
          _$jscoverage['/base/traversal.js'].lineData[300]++;
          continue;
        }
        _$jscoverage['/base/traversal.js'].lineData[302]++;
        if (visit570_302_1(el === elem)) {
          _$jscoverage['/base/traversal.js'].lineData[303]++;
          continue;
        }
        _$jscoverage['/base/traversal.js'].lineData[305]++;
        ret.push(el);
      }
      _$jscoverage['/base/traversal.js'].lineData[307]++;
      if (visit571_307_1(filter)) {
        _$jscoverage['/base/traversal.js'].lineData[308]++;
        ret = Dom.filter(ret, filter);
      }
    }
    _$jscoverage['/base/traversal.js'].lineData[312]++;
    return ret;
  }
  _$jscoverage['/base/traversal.js'].lineData[315]++;
  return Dom;
});
