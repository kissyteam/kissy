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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[343] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[396] = 0;
  _$jscoverage['/base.js'].lineData[399] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[407] = 0;
  _$jscoverage['/base.js'].lineData[408] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[416] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[431] = 0;
  _$jscoverage['/base.js'].lineData[432] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[444] = 0;
  _$jscoverage['/base.js'].lineData[446] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['17'] = [];
  _$jscoverage['/base.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['18'] = [];
  _$jscoverage['/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['26'] = [];
  _$jscoverage['/base.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['27'] = [];
  _$jscoverage['/base.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['31'] = [];
  _$jscoverage['/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['34'] = [];
  _$jscoverage['/base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['90'] = [];
  _$jscoverage['/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['110'] = [];
  _$jscoverage['/base.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'] = [];
  _$jscoverage['/base.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'] = [];
  _$jscoverage['/base.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'] = [];
  _$jscoverage['/base.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'] = [];
  _$jscoverage['/base.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'] = [];
  _$jscoverage['/base.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['173'] = [];
  _$jscoverage['/base.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'] = [];
  _$jscoverage['/base.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['204'] = [];
  _$jscoverage['/base.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['205'] = [];
  _$jscoverage['/base.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['300'] = [];
  _$jscoverage['/base.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['310'] = [];
  _$jscoverage['/base.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['316'] = [];
  _$jscoverage['/base.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['327'] = [];
  _$jscoverage['/base.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['335'] = [];
  _$jscoverage['/base.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['345'] = [];
  _$jscoverage['/base.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['345'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['358'] = [];
  _$jscoverage['/base.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['362'] = [];
  _$jscoverage['/base.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['365'] = [];
  _$jscoverage['/base.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['399'] = [];
  _$jscoverage['/base.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['408'] = [];
  _$jscoverage['/base.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['420'] = [];
  _$jscoverage['/base.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['421'] = [];
  _$jscoverage['/base.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['430'] = [];
  _$jscoverage['/base.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['431'] = [];
  _$jscoverage['/base.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['432'] = [];
  _$jscoverage['/base.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['437'] = [];
  _$jscoverage['/base.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['438'] = [];
  _$jscoverage['/base.js'].branchData['438'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['438'][1].init(37, 10, 'args || []');
function visit48_438_1(result) {
  _$jscoverage['/base.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['437'][1].init(220, 2, 'fn');
function visit47_437_1(result) {
  _$jscoverage['/base.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['432'][1].init(27, 170, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit46_432_1(result) {
  _$jscoverage['/base.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['431'][1].init(30, 7, 'i < len');
function visit45_431_1(result) {
  _$jscoverage['/base.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['430'][1].init(39, 31, 'extensions && extensions.length');
function visit44_430_1(result) {
  _$jscoverage['/base.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['421'][1].init(22, 18, 'plugins[i][method]');
function visit43_421_1(result) {
  _$jscoverage['/base.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['420'][1].init(30, 7, 'i < len');
function visit42_420_1(result) {
  _$jscoverage['/base.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['408'][1].init(18, 28, 'typeof plugin === \'function\'');
function visit41_408_1(result) {
  _$jscoverage['/base.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['399'][1].init(89, 17, 'e.target === self');
function visit40_399_1(result) {
  _$jscoverage['/base.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['365'][1].init(212, 13, 'px[h] || noop');
function visit39_365_1(result) {
  _$jscoverage['/base.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['362'][1].init(85, 48, 'proto.hasOwnProperty(h) && !px.hasOwnProperty(h)');
function visit38_362_1(result) {
  _$jscoverage['/base.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['358'][1].init(161, 26, 'extensions.length && hooks');
function visit37_358_1(result) {
  _$jscoverage['/base.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['345'][2].init(2011, 15, 'sx && sx.extend');
function visit36_345_2(result) {
  _$jscoverage['/base.js'].branchData['345'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['345'][1].init(2011, 25, 'sx && sx.extend || extend');
function visit35_345_1(result) {
  _$jscoverage['/base.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['335'][1].init(96, 21, 'exp.hasOwnProperty(p)');
function visit34_335_1(result) {
  _$jscoverage['/base.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['327'][1].init(53, 17, 'attrs[name] || {}');
function visit33_327_1(result) {
  _$jscoverage['/base.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['316'][1].init(26, 3, 'ext');
function visit32_316_1(result) {
  _$jscoverage['/base.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['310'][1].init(436, 17, 'extensions.length');
function visit31_310_1(result) {
  _$jscoverage['/base.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['300'][1].init(18, 22, '!S.isArray(extensions)');
function visit30_300_1(result) {
  _$jscoverage['/base.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(48, 22, '!self.get(\'destroyed\')');
function visit29_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['205'][1].init(144, 15, 'pluginId === id');
function visit28_205_1(result) {
  _$jscoverage['/base.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['204'][2].init(81, 26, 'p.get && p.get(\'pluginId\')');
function visit27_204_2(result) {
  _$jscoverage['/base.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['204'][1].init(81, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit26_204_1(result) {
  _$jscoverage['/base.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(660, 5, '!keep');
function visit25_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(30, 12, 'p !== plugin');
function visit24_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][1].init(164, 19, 'pluginId !== plugin');
function visit23_174_1(result) {
  _$jscoverage['/base.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['173'][2].init(93, 26, 'p.get && p.get(\'pluginId\')');
function visit22_173_2(result) {
  _$jscoverage['/base.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['173'][1].init(93, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit21_173_1(result) {
  _$jscoverage['/base.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(26, 8, 'isString');
function visit20_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(63, 6, 'plugin');
function visit19_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(75, 26, 'typeof plugin === \'string\'');
function visit18_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][1].init(273, 24, 'plugin.pluginInitializer');
function visit17_149_1(result) {
  _$jscoverage['/base.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][1].init(48, 28, 'typeof plugin === \'function\'');
function visit16_143_1(result) {
  _$jscoverage['/base.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(64, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit15_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][2].init(435, 31, 'attrs[attributeName].sync !== 0');
function visit14_127_2(result) {
  _$jscoverage['/base.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][1].init(177, 120, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit13_127_1(result) {
  _$jscoverage['/base.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][1].init(255, 298, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit12_124_1(result) {
  _$jscoverage['/base.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(26, 22, 'attributeName in attrs');
function visit11_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][1].init(30, 17, 'cs[i].ATTRS || {}');
function visit10_117_1(result) {
  _$jscoverage['/base.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(394, 13, 'i < cs.length');
function visit9_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['110'][1].init(51, 40, 'c.superclass && c.superclass.constructor');
function visit8_110_1(result) {
  _$jscoverage['/base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['90'][1].init(67, 7, 'self[m]');
function visit7_90_1(result) {
  _$jscoverage['/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['34'][1].init(26, 15, 'origFn !== noop');
function visit6_34_1(result) {
  _$jscoverage['/base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['31'][1].init(657, 7, 'reverse');
function visit5_31_1(result) {
  _$jscoverage['/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['27'][1].init(487, 7, 'reverse');
function visit4_27_1(result) {
  _$jscoverage['/base.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['26'][1].init(417, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit3_26_1(result) {
  _$jscoverage['/base.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['18'][1].init(26, 15, 'origFn !== noop');
function visit2_18_1(result) {
  _$jscoverage['/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['17'][1].init(56, 7, 'reverse');
function visit1_17_1(result) {
  _$jscoverage['/base.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Attribute = require('attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop;
  _$jscoverage['/base.js'].lineData[13]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[14]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[15]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[17]++;
  if (visit1_17_1(reverse)) {
    _$jscoverage['/base.js'].lineData[18]++;
    if (visit2_18_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[19]++;
      origFn.apply(self, arguments);
    }
  } else {
    _$jscoverage['/base.js'].lineData[22]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[26]++;
  var extensions = visit3_26_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[27]++;
  if (visit4_27_1(reverse)) {
    _$jscoverage['/base.js'].lineData[28]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[30]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[31]++;
  if (visit5_31_1(reverse)) {
    _$jscoverage['/base.js'].lineData[32]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[34]++;
    if (visit6_34_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[35]++;
      origFn.apply(self, arguments);
    }
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[53]++;
  var Base = Attribute.extend({
  constructor: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[56]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/base.js'].lineData[58]++;
  var listeners = self.get('listeners');
  _$jscoverage['/base.js'].lineData[59]++;
  for (var n in listeners) {
    _$jscoverage['/base.js'].lineData[60]++;
    self.on(n, listeners[n]);
  }
  _$jscoverage['/base.js'].lineData[63]++;
  self.initializer();
  _$jscoverage['/base.js'].lineData[65]++;
  constructPlugins(self);
  _$jscoverage['/base.js'].lineData[66]++;
  callPluginsMethod.call(self, 'pluginInitializer');
  _$jscoverage['/base.js'].lineData[68]++;
  self.bindInternal();
  _$jscoverage['/base.js'].lineData[70]++;
  self.syncInternal();
}, 
  initializer: noop, 
  __getHook: __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[84]++;
  var self = this, attrs = self.getAttrs(), attr, m;
  _$jscoverage['/base.js'].lineData[88]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[89]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[90]++;
    if (visit7_90_1(self[m])) {
      _$jscoverage['/base.js'].lineData[92]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[102]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[108]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[109]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[110]++;
    c = visit8_110_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[113]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[116]++;
  for (i = 0; visit9_116_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[117]++;
    var ATTRS = visit10_117_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[118]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[119]++;
      if (visit11_119_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[120]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[122]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[124]++;
        if (visit12_124_1((onSetMethod = self[onSetMethodName]) && visit13_127_1(visit14_127_2(attrs[attributeName].sync !== 0) && visit15_128_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[129]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  plug: function(plugin) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[142]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[143]++;
  if (visit16_143_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[144]++;
    var Plugin = plugin;
    _$jscoverage['/base.js'].lineData[145]++;
    plugin = new Plugin();
  }
  _$jscoverage['/base.js'].lineData[149]++;
  if (visit17_149_1(plugin.pluginInitializer)) {
    _$jscoverage['/base.js'].lineData[151]++;
    plugin.pluginInitializer(self);
  }
  _$jscoverage['/base.js'].lineData[153]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[154]++;
  return self;
}, 
  unplug: function(plugin) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[164]++;
  var plugins = [], self = this, isString = visit18_166_1(typeof plugin === 'string');
  _$jscoverage['/base.js'].lineData[168]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[169]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[170]++;
  if (visit19_170_1(plugin)) {
    _$jscoverage['/base.js'].lineData[171]++;
    if (visit20_171_1(isString)) {
      _$jscoverage['/base.js'].lineData[173]++;
      pluginId = visit21_173_1(visit22_173_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[174]++;
      if (visit23_174_1(pluginId !== plugin)) {
        _$jscoverage['/base.js'].lineData[175]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[176]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[179]++;
      if (visit24_179_1(p !== plugin)) {
        _$jscoverage['/base.js'].lineData[180]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[181]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[186]++;
  if (visit25_186_1(!keep)) {
    _$jscoverage['/base.js'].lineData[187]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[191]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[192]++;
  return self;
}, 
  getPlugin: function(id) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[201]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[202]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[204]++;
  var pluginId = visit26_204_1(visit27_204_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[205]++;
  if (visit28_205_1(pluginId === id)) {
    _$jscoverage['/base.js'].lineData[206]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[207]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[209]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[211]++;
  return plugin;
}, 
  destructor: noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[217]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[218]++;
  if (visit29_218_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[219]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[220]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[221]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[222]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[223]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[228]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[300]++;
  if (visit30_300_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[301]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[302]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[303]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[305]++;
  var SubClass = Attribute.extend.call(this, px, sx);
  _$jscoverage['/base.js'].lineData[306]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[308]++;
  baseAddMembers.call(SubClass, {});
  _$jscoverage['/base.js'].lineData[310]++;
  if (visit31_310_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[311]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[315]++;
    S.each(extensions.concat(SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[316]++;
  if (visit32_316_1(ext)) {
    _$jscoverage['/base.js'].lineData[326]++;
    S.each(ext.ATTRS, function(v, name) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[327]++;
  var av = attrs[name] = visit33_327_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[328]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[331]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[333]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[335]++;
      if (visit34_335_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[336]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[341]++;
    SubClass.ATTRS = attrs;
    _$jscoverage['/base.js'].lineData[342]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[343]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[345]++;
  SubClass.extend = visit35_345_1(visit36_345_2(sx && sx.extend) || extend);
  _$jscoverage['/base.js'].lineData[346]++;
  SubClass.addMembers = baseAddMembers;
  _$jscoverage['/base.js'].lineData[347]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[351]++;
  var addMembers = Base.addMembers;
  _$jscoverage['/base.js'].lineData[353]++;
  function baseAddMembers(px) {
    _$jscoverage['/base.js'].functionData[16]++;
    _$jscoverage['/base.js'].lineData[354]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[355]++;
    var extensions = self.__extensions__, hooks = self.__hooks__, proto = self.prototype;
    _$jscoverage['/base.js'].lineData[358]++;
    if (visit37_358_1(extensions.length && hooks)) {
      _$jscoverage['/base.js'].lineData[360]++;
      for (var h in hooks) {
        _$jscoverage['/base.js'].lineData[362]++;
        if (visit38_362_1(proto.hasOwnProperty(h) && !px.hasOwnProperty(h))) {
          _$jscoverage['/base.js'].lineData[363]++;
          continue;
        }
        _$jscoverage['/base.js'].lineData[365]++;
        px[h] = visit39_365_1(px[h] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[368]++;
    return addMembers.call(self, px);
  }
  _$jscoverage['/base.js'].lineData[395]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[17]++;
    _$jscoverage['/base.js'].lineData[396]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[399]++;
    if (visit40_399_1(e.target === self)) {
      _$jscoverage['/base.js'].lineData[400]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[401]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[405]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[18]++;
    _$jscoverage['/base.js'].lineData[406]++;
    var plugins = self.get('plugins'), Plugin;
    _$jscoverage['/base.js'].lineData[407]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[408]++;
  if (visit41_408_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[409]++;
    Plugin = plugin;
    _$jscoverage['/base.js'].lineData[410]++;
    plugins[i] = new Plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[415]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[416]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[419]++;
    if ((len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[420]++;
      for (var i = 0; visit42_420_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[421]++;
        if (visit43_421_1(plugins[i][method])) {
          _$jscoverage['/base.js'].lineData[422]++;
          plugins[i][method](self);
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[428]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[429]++;
    var len;
    _$jscoverage['/base.js'].lineData[430]++;
    if ((len = visit44_430_1(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[431]++;
      for (var i = 0; visit45_431_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[432]++;
        var fn = visit46_432_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[437]++;
        if (visit47_437_1(fn)) {
          _$jscoverage['/base.js'].lineData[438]++;
          fn.apply(self, visit48_438_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[444]++;
  S.Base = Base;
  _$jscoverage['/base.js'].lineData[446]++;
  return Base;
});
