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
if (! _$jscoverage['/dd/ddm.js']) {
  _$jscoverage['/dd/ddm.js'] = {};
  _$jscoverage['/dd/ddm.js'].lineData = [];
  _$jscoverage['/dd/ddm.js'].lineData[6] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[7] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[8] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[10] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[33] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[38] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[45] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[48] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[49] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[60] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[61] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[63] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[64] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[67] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[68] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[69] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[70] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[71] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[72] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[81] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[85] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[86] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[94] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[95] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[96] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[99] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[106] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[110] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[113] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[115] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[116] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[117] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[118] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[119] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[122] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[123] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[124] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[128] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[130] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[131] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[132] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[133] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[136] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[138] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[139] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[141] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[144] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[147] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[148] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[149] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[150] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[152] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[153] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[154] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[155] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[158] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[165] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[168] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[169] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[178] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[180] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[181] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[183] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[184] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[185] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[187] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[188] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[260] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[262] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[280] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[282] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[286] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[289] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[292] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[293] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[295] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[296] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[303] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[305] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[307] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[308] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[310] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[311] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[313] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[317] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[318] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[322] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[323] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[324] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[325] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[326] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[327] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[332] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[333] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[334] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[335] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[336] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[337] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[342] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[343] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[344] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[345] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[346] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[348] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[356] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[357] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[363] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[364] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[365] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[367] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[370] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[371] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[375] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[383] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[384] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[387] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[388] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[389] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[390] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[394] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[395] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[396] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[397] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[398] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[399] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[401] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].functionData) {
  _$jscoverage['/dd/ddm.js'].functionData = [];
  _$jscoverage['/dd/ddm.js'].functionData[0] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[1] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[2] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[3] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[4] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[5] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[6] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[7] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[8] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[9] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[10] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[11] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[12] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[13] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[14] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[15] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[16] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[17] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[18] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[19] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[20] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[21] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].branchData) {
  _$jscoverage['/dd/ddm.js'].branchData = {};
  _$jscoverage['/dd/ddm.js'].branchData['16'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['48'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['63'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['68'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['70'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['95'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['106'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['113'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['115'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['117'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['122'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['128'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['131'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['136'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['139'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['148'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['153'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['154'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['168'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['180'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['184'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['276'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['282'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['295'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['307'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['310'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['317'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['325'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['335'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['344'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['350'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['352'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['357'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['358'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['359'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['360'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['364'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['364'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['388'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['388'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['388'][1].init(14, 4, 'node');
function visit44_388_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['364'][3].init(45, 27, 'region.left >= region.right');
function visit43_364_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['364'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['364'][2].init(14, 27, 'region.top >= region.bottom');
function visit42_364_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['364'][1].init(14, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit41_364_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['360'][1].init(41, 28, 'region.bottom >= pointer.top');
function visit40_360_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['359'][2].init(109, 25, 'region.top <= pointer.top');
function visit39_359_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['359'][1].init(44, 70, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit38_359_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['358'][2].init(63, 28, 'region.right >= pointer.left');
function visit37_358_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['358'][1].init(43, 115, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit36_358_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['357'][2].init(17, 27, 'region.left <= pointer.left');
function visit35_357_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['357'][1].init(17, 159, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit34_357_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['352'][1].init(177, 43, 'node.__ddCachedHeight || node.outerHeight()');
function visit33_352_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['350'][1].init(68, 41, 'node.__ddCachedWidth || node.outerWidth()');
function visit32_350_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['344'][1].init(51, 21, '!node.__ddCachedWidth');
function visit31_344_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['335'][1].init(99, 12, 'drops.length');
function visit30_335_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['325'][1].init(99, 12, 'drops.length');
function visit29_325_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['317'][1].init(422, 3, 'ie6');
function visit28_317_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['310'][1].init(242, 14, 'cur === \'auto\'');
function visit27_310_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['307'][1].init(175, 2, 'ah');
function visit26_307_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['295'][1].init(66, 62, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit25_295_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['282'][1].init(702, 3, 'ie6');
function visit24_282_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['276'][1].init(474, 31, 'doc.body || doc.documentElement');
function visit23_276_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['184'][1].init(219, 10, 'activeDrop');
function visit22_184_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['180'][1].init(102, 10, 'self._shim');
function visit21_180_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['168'][1].init(184, 20, 'self.__needDropCheck');
function visit20_168_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['154'][1].init(22, 22, 'oldDrop !== activeDrop');
function visit19_154_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['153'][1].init(2550, 10, 'activeDrop');
function visit18_153_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['148'][2].init(2350, 22, 'oldDrop !== activeDrop');
function visit17_148_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['148'][1].init(2339, 33, 'oldDrop && oldDrop !== activeDrop');
function visit16_148_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['139'][1].init(134, 14, 'a === dragArea');
function visit15_139_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['136'][1].init(1557, 17, 'mode === \'strict\'');
function visit14_136_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['131'][1].init(143, 9, 'a > vArea');
function visit13_131_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['128'][1].init(1244, 20, 'mode === \'intersect\'');
function visit12_128_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['122'][1].init(89, 9, 'a < vArea');
function visit11_122_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['117'][1].init(79, 11, '!activeDrop');
function visit10_117_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['115'][1].init(64, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit9_115_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['113'][1].init(593, 16, 'mode === \'point\'');
function visit8_113_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['106'][1].init(389, 5, '!node');
function visit7_106_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['95'][1].init(22, 20, 'drop.get(\'disabled\')');
function visit6_95_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['70'][1].init(59, 29, 'self.get(\'validDrops\').length');
function visit5_70_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['68'][1].init(299, 18, 'drag.get(\'groups\')');
function visit4_68_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['63'][1].init(128, 16, 'drag.get(\'shim\')');
function visit3_63_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['48'][1].init(138, 12, 'index !== -1');
function visit2_48_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['16'][1].init(165, 11, 'UA.ie === 6');
function visit1_16_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[7]++;
  var logger = S.getLogger('dd/ddm');
  _$jscoverage['/dd/ddm.js'].lineData[8]++;
  var Node = require('node'), Base = require('base');
  _$jscoverage['/dd/ddm.js'].lineData[10]++;
  var UA = require('ua'), $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_16_1(UA.ie === 6), MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[33]++;
  var DDManger = Base.extend({
  addDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[38]++;
  this.get('drops').push(d);
}, 
  removeDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[45]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[48]++;
  if (visit2_48_1(index !== -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[49]++;
    drops.splice(index, 1);
  }
}, 
  start: function(e, drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[60]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[61]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[63]++;
  if (visit3_63_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[64]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[67]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[68]++;
  if (visit4_68_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[69]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[70]++;
    if (visit5_70_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[71]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[72]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[81]++;
  this.get('validDrops').push(drop);
}, 
  _notifyDropsMove: function(ev, activeDrag) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[85]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[86]++;
  var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
  _$jscoverage['/dd/ddm.js'].lineData[94]++;
  S.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[95]++;
  if (visit6_95_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[96]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[99]++;
  var a, node = drop.getNodeFromTarget(ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[106]++;
  if (visit7_106_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[110]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[113]++;
  if (visit8_113_1(mode === 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[115]++;
    if (visit9_115_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[116]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[117]++;
      if (visit10_117_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[118]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[119]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[122]++;
        if (visit11_122_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[123]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[124]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[128]++;
    if (visit12_128_1(mode === 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[130]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[131]++;
      if (visit13_131_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[132]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[133]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[136]++;
      if (visit14_136_1(mode === 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[138]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[139]++;
        if (visit15_139_1(a === dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[140]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[141]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[144]++;
  return undefined;
});
  _$jscoverage['/dd/ddm.js'].lineData[147]++;
  oldDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[148]++;
  if (visit16_148_1(oldDrop && visit17_148_2(oldDrop !== activeDrop))) {
    _$jscoverage['/dd/ddm.js'].lineData[149]++;
    oldDrop._handleOut(ev);
    _$jscoverage['/dd/ddm.js'].lineData[150]++;
    activeDrag._handleOut(ev);
  }
  _$jscoverage['/dd/ddm.js'].lineData[152]++;
  self.setInternal('activeDrop', activeDrop);
  _$jscoverage['/dd/ddm.js'].lineData[153]++;
  if (visit18_153_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[154]++;
    if (visit19_154_1(oldDrop !== activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[155]++;
      activeDrop._handleEnter(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[158]++;
      activeDrop._handleOver(ev);
    }
  }
}, 
  move: function(ev, activeDrag) {
  _$jscoverage['/dd/ddm.js'].functionData[7]++;
  _$jscoverage['/dd/ddm.js'].lineData[165]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[168]++;
  if (visit20_168_1(self.__needDropCheck)) {
    _$jscoverage['/dd/ddm.js'].lineData[169]++;
    self._notifyDropsMove(ev, activeDrag);
  }
}, 
  end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[8]++;
  _$jscoverage['/dd/ddm.js'].lineData[178]++;
  var self = this, activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[180]++;
  if (visit21_180_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[181]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[183]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[184]++;
  if (visit22_184_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[185]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[187]++;
  self.setInternal('activeDrop', null);
  _$jscoverage['/dd/ddm.js'].lineData[188]++;
  self.setInternal('activeDrag', null);
}}, {
  ATTRS: {
  dragCursor: {
  value: 'move'}, 
  activeDrag: {}, 
  activeDrop: {}, 
  drops: {
  value: []}, 
  validDrops: {
  value: []}}});
  _$jscoverage['/dd/ddm.js'].lineData[260]++;
  var activeShim = function(self) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[262]++;
  self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + self.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit23_276_1(doc.body || doc.documentElement)).css('opacity', 0);
  _$jscoverage['/dd/ddm.js'].lineData[280]++;
  activeShim = showShim;
  _$jscoverage['/dd/ddm.js'].lineData[282]++;
  if (visit24_282_1(ie6)) {
    _$jscoverage['/dd/ddm.js'].lineData[286]++;
    $win.on('resize scroll', adjustShimSize, self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[289]++;
  showShim(self);
};
  _$jscoverage['/dd/ddm.js'].lineData[292]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[10]++;
  _$jscoverage['/dd/ddm.js'].lineData[293]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[295]++;
  if (visit25_295_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[296]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[303]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[11]++;
    _$jscoverage['/dd/ddm.js'].lineData[305]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[307]++;
    if (visit26_307_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[308]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[310]++;
    if (visit27_310_1(cur === 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[311]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[313]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[317]++;
    if (visit28_317_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[318]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[322]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[323]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[324]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[325]++;
    if (visit29_325_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[326]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[13]++;
  _$jscoverage['/dd/ddm.js'].lineData[327]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[332]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[333]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[334]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[335]++;
    if (visit30_335_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[336]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[15]++;
  _$jscoverage['/dd/ddm.js'].lineData[337]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[342]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[16]++;
    _$jscoverage['/dd/ddm.js'].lineData[343]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[344]++;
    if (visit31_344_1(!node.__ddCachedWidth)) {
      _$jscoverage['/dd/ddm.js'].lineData[345]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[346]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[348]++;
    return {
  left: offset.left, 
  right: offset.left + (visit32_350_1(node.__ddCachedWidth || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit33_352_1(node.__ddCachedHeight || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[356]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[357]++;
    return visit34_357_1(visit35_357_2(region.left <= pointer.left) && visit36_358_1(visit37_358_2(region.right >= pointer.left) && visit38_359_1(visit39_359_2(region.top <= pointer.top) && visit40_360_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[363]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[18]++;
    _$jscoverage['/dd/ddm.js'].lineData[364]++;
    if (visit41_364_1(visit42_364_2(region.top >= region.bottom) || visit43_364_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[365]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[367]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[370]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[371]++;
    var t = Math.max(r1.top, r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1.bottom, r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[375]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[383]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[384]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[387]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[388]++;
    if (visit44_388_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[389]++;
      node.__ddCachedWidth = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[390]++;
      node.__ddCachedHeight = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[394]++;
  var DDM = new DDManger();
  _$jscoverage['/dd/ddm.js'].lineData[395]++;
  DDM.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[396]++;
  DDM.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[397]++;
  DDM.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[398]++;
  DDM.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[399]++;
  DDM.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[401]++;
  return DDM;
});
