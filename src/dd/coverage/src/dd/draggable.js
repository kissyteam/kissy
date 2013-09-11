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
if (! _$jscoverage['/dd/draggable.js']) {
  _$jscoverage['/dd/draggable.js'] = {};
  _$jscoverage['/dd/draggable.js'].lineData = [];
  _$jscoverage['/dd/draggable.js'].lineData[6] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[7] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[21] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[23] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[24] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[193] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[197] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[199] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[200] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[204] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[207] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[211] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[212] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[214] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[224] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[230] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[233] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[235] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[236] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[237] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[238] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[240] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[242] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[246] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[247] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[249] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[251] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[255] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[256] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[259] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[261] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[262] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[273] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[274] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[281] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[282] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[285] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[288] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[293] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[294] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[296] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[297] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[303] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[305] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[308] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[309] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[311] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[317] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[318] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[319] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[320] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[325] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[329] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[330] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[334] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[336] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[337] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[340] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[341] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[345] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[350] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[359] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[361] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[362] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[365] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[366] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[367] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[371] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[374] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[377] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[378] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[381] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[383] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[392] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[396] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[398] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[402] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[403] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[404] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[407] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[409] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[410] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[411] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[416] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[420] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[421] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[430] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[431] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[434] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[441] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[442] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[444] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[448] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[452] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[453] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[454] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[455] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[459] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[460] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[473] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[474] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[475] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[498] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[499] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[501] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[517] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[533] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[576] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[577] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[578] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[580] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[581] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[582] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[585] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[586] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[588] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[589] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[591] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[593] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[594] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[621] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[623] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[833] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[835] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[836] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[840] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[841] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[842] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[851] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[852] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[858] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[859] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[867] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[868] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[870] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[871] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[872] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[874] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[878] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].functionData) {
  _$jscoverage['/dd/draggable.js'].functionData = [];
  _$jscoverage['/dd/draggable.js'].functionData[0] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[1] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[2] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[3] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[4] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[5] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[6] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[7] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[8] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[9] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[10] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[11] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[12] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[13] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[14] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[15] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[16] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[17] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[18] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[19] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[20] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[21] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[22] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[23] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[24] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[25] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[26] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[27] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[28] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[29] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[30] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].branchData) {
  _$jscoverage['/dd/draggable.js'].branchData = {};
  _$jscoverage['/dd/draggable.js'].branchData['235'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['247'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['247'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['247'][3] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['255'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['261'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['273'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['281'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['293'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['308'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['318'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['329'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['334'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['334'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['335'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['340'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['361'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['377'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['381'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['396'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['403'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['407'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['410'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['498'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['577'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['581'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['585'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['588'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['870'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['870'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['871'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['871'][1] = new BranchData();
}
_$jscoverage['/dd/draggable.js'].branchData['871'][1].init(18, 22, '!self._checkHandler(t)');
function visit97_871_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['871'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['870'][1].init(68, 29, 'self._checkDragStartValid(ev)');
function visit96_870_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['870'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['588'][1].init(345, 10, 'v.nodeType');
function visit95_588_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['585'][1].init(207, 20, 'typeof v == \'string\'');
function visit94_585_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['581'][1].init(30, 23, 'typeof v === \'function\'');
function visit93_581_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['577'][1].init(64, 10, '!vs.length');
function visit92_577_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['498'][1].init(26, 20, '!(v instanceof Node)');
function visit91_498_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['410'][1].init(117, 34, 'activeDrop = DDM.get(\'activeDrop\')');
function visit90_410_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['407'][1].init(271, 20, 'self.get(\'dragging\')');
function visit89_407_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['403'][1].init(172, 2, 'ie');
function visit88_403_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['396'][1].init(18, 7, 'e || {}');
function visit87_396_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['381'][1].init(1786, 11, 'def && move');
function visit86_381_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['377'][1].init(1682, 40, 'self.fire(\'drag\', customEvent) === false');
function visit85_377_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['361'][1].init(1147, 4, 'move');
function visit84_361_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['340'][1].init(530, 6, '!start');
function visit83_340_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['335'][1].init(80, 55, 'Math.abs(pageY - startMousePos.top) >= clickPixelThresh');
function visit82_335_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['334'][2].init(223, 56, 'Math.abs(pageX - startMousePos.left) >= clickPixelThresh');
function visit81_334_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['334'][1].init(223, 136, 'Math.abs(pageX - startMousePos.left) >= clickPixelThresh || Math.abs(pageY - startMousePos.top) >= clickPixelThresh');
function visit80_334_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['329'][1].init(120, 21, '!self.get(\'dragging\')');
function visit79_329_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['318'][1].init(48, 17, 'self._bufferTimer');
function visit78_318_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['308'][1].init(1680, 10, 'bufferTime');
function visit77_308_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['293'][1].init(1208, 15, 'self._allowMove');
function visit76_293_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['281'][1].init(897, 33, '!Features.isTouchEventSupported()');
function visit75_281_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['273'][1].init(598, 16, 'self.get(\'halt\')');
function visit74_273_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['261'][1].init(116, 2, 'ie');
function visit73_261_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['255'][1].init(18, 3, '!ev');
function visit72_255_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['247'][3].init(81, 13, 'ev.which != 1');
function visit71_247_3(result) {
  _$jscoverage['/dd/draggable.js'].branchData['247'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['247'][2].init(48, 46, 'self.get(\'primaryButtonOnly\') && ev.which != 1');
function visit70_247_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['247'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['247'][1].init(48, 87, 'self.get(\'primaryButtonOnly\') && ev.which != 1 || self.get(\'disabled\')');
function visit69_247_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['235'][2].init(53, 15, 'handler[0] == t');
function visit68_235_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['235'][1].init(53, 38, 'handler[0] == t || handler.contains(t)');
function visit67_235_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].lineData[6]++;
KISSY.add('dd/draggable', function(S, Node, Base, DDM) {
  _$jscoverage['/dd/draggable.js'].functionData[0]++;
  _$jscoverage['/dd/draggable.js'].lineData[7]++;
  var UA = S.UA, $ = Node.all, each = S.each, Features = S.Features, ie = UA['ie'], NULL = null, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  _$jscoverage['/dd/draggable.js'].lineData[21]++;
  var Draggable = Base.extend({
  initializer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[1]++;
  _$jscoverage['/dd/draggable.js'].lineData[23]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[24]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/draggable.js'].lineData[193]++;
  self._allowMove = self.get('move');
}, 
  '_onSetNode': function(n) {
  _$jscoverage['/dd/draggable.js'].functionData[2]++;
  _$jscoverage['/dd/draggable.js'].lineData[197]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[199]++;
  self.setInternal('dragNode', n);
  _$jscoverage['/dd/draggable.js'].lineData[200]++;
  self.bindDragEvent();
}, 
  bindDragEvent: function() {
  _$jscoverage['/dd/draggable.js'].functionData[3]++;
  _$jscoverage['/dd/draggable.js'].lineData[204]++;
  var self = this, node = self.get('node');
  _$jscoverage['/dd/draggable.js'].lineData[207]++;
  node.on(Node.Gesture.start, handlePreDragStart, self).on('dragstart', self._fixDragStart);
}, 
  detachDragEvent: function(self) {
  _$jscoverage['/dd/draggable.js'].functionData[4]++;
  _$jscoverage['/dd/draggable.js'].lineData[211]++;
  self = this;
  _$jscoverage['/dd/draggable.js'].lineData[212]++;
  var node = self.get('node');
  _$jscoverage['/dd/draggable.js'].lineData[214]++;
  node.detach(Node.Gesture.start, handlePreDragStart, self).detach('dragstart', self._fixDragStart);
}, 
  _bufferTimer: NULL, 
  _onSetDisabledChange: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[5]++;
  _$jscoverage['/dd/draggable.js'].lineData[224]++;
  this.get('dragNode')[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
}, 
  _fixDragStart: fixDragStart, 
  _checkHandler: function(t) {
  _$jscoverage['/dd/draggable.js'].functionData[6]++;
  _$jscoverage['/dd/draggable.js'].lineData[230]++;
  var self = this, handlers = self.get('handlers'), ret = 0;
  _$jscoverage['/dd/draggable.js'].lineData[233]++;
  each(handlers, function(handler) {
  _$jscoverage['/dd/draggable.js'].functionData[7]++;
  _$jscoverage['/dd/draggable.js'].lineData[235]++;
  if (visit67_235_1(visit68_235_2(handler[0] == t) || handler.contains(t))) {
    _$jscoverage['/dd/draggable.js'].lineData[236]++;
    ret = 1;
    _$jscoverage['/dd/draggable.js'].lineData[237]++;
    self.setInternal('activeHandler', handler);
    _$jscoverage['/dd/draggable.js'].lineData[238]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[240]++;
  return undefined;
});
  _$jscoverage['/dd/draggable.js'].lineData[242]++;
  return ret;
}, 
  _checkDragStartValid: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[8]++;
  _$jscoverage['/dd/draggable.js'].lineData[246]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[247]++;
  if (visit69_247_1(visit70_247_2(self.get('primaryButtonOnly') && visit71_247_3(ev.which != 1)) || self.get('disabled'))) {
    _$jscoverage['/dd/draggable.js'].lineData[249]++;
    return 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[251]++;
  return 1;
}, 
  _prepare: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[9]++;
  _$jscoverage['/dd/draggable.js'].lineData[255]++;
  if (visit72_255_1(!ev)) {
    _$jscoverage['/dd/draggable.js'].lineData[256]++;
    return;
  }
  _$jscoverage['/dd/draggable.js'].lineData[259]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[261]++;
  if (visit73_261_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[262]++;
    fixIEMouseDown();
  }
  _$jscoverage['/dd/draggable.js'].lineData[273]++;
  if (visit74_273_1(self.get('halt'))) {
    _$jscoverage['/dd/draggable.js'].lineData[274]++;
    ev.stopPropagation();
  }
  _$jscoverage['/dd/draggable.js'].lineData[281]++;
  if (visit75_281_1(!Features.isTouchEventSupported())) {
    _$jscoverage['/dd/draggable.js'].lineData[282]++;
    ev.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[285]++;
  var mx = ev.pageX, my = ev.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[288]++;
  self.setInternal('startMousePos', self.mousePos = {
  left: mx, 
  top: my});
  _$jscoverage['/dd/draggable.js'].lineData[293]++;
  if (visit76_293_1(self._allowMove)) {
    _$jscoverage['/dd/draggable.js'].lineData[294]++;
    var node = self.get('node'), nxy = node.offset();
    _$jscoverage['/dd/draggable.js'].lineData[296]++;
    self.setInternal('startNodePos', nxy);
    _$jscoverage['/dd/draggable.js'].lineData[297]++;
    self.setInternal('deltaPos', {
  left: mx - nxy.left, 
  top: my - nxy.top});
  }
  _$jscoverage['/dd/draggable.js'].lineData[303]++;
  DDM._regToDrag(self);
  _$jscoverage['/dd/draggable.js'].lineData[305]++;
  var bufferTime = self.get('bufferTime');
  _$jscoverage['/dd/draggable.js'].lineData[308]++;
  if (visit77_308_1(bufferTime)) {
    _$jscoverage['/dd/draggable.js'].lineData[309]++;
    self._bufferTimer = setTimeout(function() {
  _$jscoverage['/dd/draggable.js'].functionData[10]++;
  _$jscoverage['/dd/draggable.js'].lineData[311]++;
  self._start(ev);
}, bufferTime * 1000);
  }
}, 
  _clearBufferTimer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[11]++;
  _$jscoverage['/dd/draggable.js'].lineData[317]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[318]++;
  if (visit78_318_1(self._bufferTimer)) {
    _$jscoverage['/dd/draggable.js'].lineData[319]++;
    clearTimeout(self._bufferTimer);
    _$jscoverage['/dd/draggable.js'].lineData[320]++;
    self._bufferTimer = 0;
  }
}, 
  _move: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[12]++;
  _$jscoverage['/dd/draggable.js'].lineData[325]++;
  var self = this, pageX = ev.pageX, pageY = ev.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[329]++;
  if (visit79_329_1(!self.get('dragging'))) {
    _$jscoverage['/dd/draggable.js'].lineData[330]++;
    var startMousePos = self.get('startMousePos'), start = 0, clickPixelThresh = self.get('clickPixelThresh');
    _$jscoverage['/dd/draggable.js'].lineData[334]++;
    if (visit80_334_1(visit81_334_2(Math.abs(pageX - startMousePos.left) >= clickPixelThresh) || visit82_335_1(Math.abs(pageY - startMousePos.top) >= clickPixelThresh))) {
      _$jscoverage['/dd/draggable.js'].lineData[336]++;
      self._start(ev);
      _$jscoverage['/dd/draggable.js'].lineData[337]++;
      start = 1;
    }
    _$jscoverage['/dd/draggable.js'].lineData[340]++;
    if (visit83_340_1(!start)) {
      _$jscoverage['/dd/draggable.js'].lineData[341]++;
      return;
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[345]++;
  self.mousePos = {
  left: pageX, 
  top: pageY};
  _$jscoverage['/dd/draggable.js'].lineData[350]++;
  var customEvent = {
  drag: self, 
  left: pageX, 
  top: pageY, 
  pageX: pageX, 
  pageY: pageY, 
  domEvent: ev};
  _$jscoverage['/dd/draggable.js'].lineData[359]++;
  var move = self._allowMove;
  _$jscoverage['/dd/draggable.js'].lineData[361]++;
  if (visit84_361_1(move)) {
    _$jscoverage['/dd/draggable.js'].lineData[362]++;
    var diff = self.get('deltaPos'), left = pageX - diff.left, top = pageY - diff.top;
    _$jscoverage['/dd/draggable.js'].lineData[365]++;
    customEvent.left = left;
    _$jscoverage['/dd/draggable.js'].lineData[366]++;
    customEvent.top = top;
    _$jscoverage['/dd/draggable.js'].lineData[367]++;
    self.setInternal('actualPos', {
  left: left, 
  top: top});
    _$jscoverage['/dd/draggable.js'].lineData[371]++;
    self.fire('dragalign', customEvent);
  }
  _$jscoverage['/dd/draggable.js'].lineData[374]++;
  var def = 1;
  _$jscoverage['/dd/draggable.js'].lineData[377]++;
  if (visit85_377_1(self.fire('drag', customEvent) === false)) {
    _$jscoverage['/dd/draggable.js'].lineData[378]++;
    def = 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[381]++;
  if (visit86_381_1(def && move)) {
    _$jscoverage['/dd/draggable.js'].lineData[383]++;
    self.get('node').offset(self.get('actualPos'));
  }
}, 
  'stopDrag': function() {
  _$jscoverage['/dd/draggable.js'].functionData[13]++;
  _$jscoverage['/dd/draggable.js'].lineData[392]++;
  DDM._end();
}, 
  _end: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[14]++;
  _$jscoverage['/dd/draggable.js'].lineData[396]++;
  e = visit87_396_1(e || {});
  _$jscoverage['/dd/draggable.js'].lineData[398]++;
  var self = this, activeDrop;
  _$jscoverage['/dd/draggable.js'].lineData[402]++;
  self._clearBufferTimer();
  _$jscoverage['/dd/draggable.js'].lineData[403]++;
  if (visit88_403_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[404]++;
    fixIEMouseUp();
  }
  _$jscoverage['/dd/draggable.js'].lineData[407]++;
  if (visit89_407_1(self.get('dragging'))) {
    _$jscoverage['/dd/draggable.js'].lineData[409]++;
    self.get('node').removeClass(PREFIX_CLS + 'drag-over');
    _$jscoverage['/dd/draggable.js'].lineData[410]++;
    if (visit90_410_1(activeDrop = DDM.get('activeDrop'))) {
      _$jscoverage['/dd/draggable.js'].lineData[411]++;
      self.fire('dragdrophit', {
  drag: self, 
  drop: activeDrop});
    } else {
      _$jscoverage['/dd/draggable.js'].lineData[416]++;
      self.fire('dragdropmiss', {
  drag: self});
    }
    _$jscoverage['/dd/draggable.js'].lineData[420]++;
    self.setInternal('dragging', 0);
    _$jscoverage['/dd/draggable.js'].lineData[421]++;
    self.fire('dragend', {
  drag: self, 
  pageX: e.pageX, 
  pageY: e.pageY});
  }
}, 
  _handleOut: function() {
  _$jscoverage['/dd/draggable.js'].functionData[15]++;
  _$jscoverage['/dd/draggable.js'].lineData[430]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[431]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[434]++;
  self.fire('dragexit', {
  drag: self, 
  drop: DDM.get('activeDrop')});
}, 
  _handleEnter: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[16]++;
  _$jscoverage['/dd/draggable.js'].lineData[441]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[442]++;
  self.get('node').addClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[444]++;
  self.fire('dragenter', e);
}, 
  _handleOver: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[17]++;
  _$jscoverage['/dd/draggable.js'].lineData[448]++;
  this.fire('dragover', e);
}, 
  _start: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[18]++;
  _$jscoverage['/dd/draggable.js'].lineData[452]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[453]++;
  self._clearBufferTimer();
  _$jscoverage['/dd/draggable.js'].lineData[454]++;
  self.setInternal('dragging', 1);
  _$jscoverage['/dd/draggable.js'].lineData[455]++;
  self.setInternal('dragStartMousePos', {
  left: ev.pageX, 
  top: ev.pageY});
  _$jscoverage['/dd/draggable.js'].lineData[459]++;
  DDM._start();
  _$jscoverage['/dd/draggable.js'].lineData[460]++;
  self.fire('dragstart', {
  drag: self, 
  pageX: ev.pageX, 
  pageY: ev.pageY});
}, 
  destructor: function() {
  _$jscoverage['/dd/draggable.js'].functionData[19]++;
  _$jscoverage['/dd/draggable.js'].lineData[473]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[474]++;
  self.detachDragEvent();
  _$jscoverage['/dd/draggable.js'].lineData[475]++;
  self.detach();
}}, {
  name: 'Draggable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/draggable.js'].functionData[20]++;
  _$jscoverage['/dd/draggable.js'].lineData[498]++;
  if (visit91_498_1(!(v instanceof Node))) {
    _$jscoverage['/dd/draggable.js'].lineData[499]++;
    return $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[501]++;
  return undefined;
}}, 
  clickPixelThresh: {
  valueFn: function() {
  _$jscoverage['/dd/draggable.js'].functionData[21]++;
  _$jscoverage['/dd/draggable.js'].lineData[517]++;
  return DDM.get('clickPixelThresh');
}}, 
  bufferTime: {
  valueFn: function() {
  _$jscoverage['/dd/draggable.js'].functionData[22]++;
  _$jscoverage['/dd/draggable.js'].lineData[533]++;
  return DDM.get('bufferTime');
}}, 
  dragNode: {}, 
  shim: {
  value: false}, 
  handlers: {
  value: [], 
  getter: function(vs) {
  _$jscoverage['/dd/draggable.js'].functionData[23]++;
  _$jscoverage['/dd/draggable.js'].lineData[576]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[577]++;
  if (visit92_577_1(!vs.length)) {
    _$jscoverage['/dd/draggable.js'].lineData[578]++;
    vs[0] = self.get('node');
  }
  _$jscoverage['/dd/draggable.js'].lineData[580]++;
  each(vs, function(v, i) {
  _$jscoverage['/dd/draggable.js'].functionData[24]++;
  _$jscoverage['/dd/draggable.js'].lineData[581]++;
  if (visit93_581_1(typeof v === 'function')) {
    _$jscoverage['/dd/draggable.js'].lineData[582]++;
    v = v.call(self);
  }
  _$jscoverage['/dd/draggable.js'].lineData[585]++;
  if (visit94_585_1(typeof v == 'string')) {
    _$jscoverage['/dd/draggable.js'].lineData[586]++;
    v = self.get('node').one(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[588]++;
  if (visit95_588_1(v.nodeType)) {
    _$jscoverage['/dd/draggable.js'].lineData[589]++;
    v = $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[591]++;
  vs[i] = v;
});
  _$jscoverage['/dd/draggable.js'].lineData[593]++;
  self.setInternal('handlers', vs);
  _$jscoverage['/dd/draggable.js'].lineData[594]++;
  return vs;
}}, 
  activeHandler: {}, 
  dragging: {
  value: false, 
  setter: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[25]++;
  _$jscoverage['/dd/draggable.js'].lineData[621]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[623]++;
  self.get('dragNode')[d ? 'addClass' : 'removeClass'](PREFIX_CLS + 'dragging');
}}, 
  mode: {
  value: 'point'}, 
  disabled: {
  value: false}, 
  move: {
  value: false}, 
  primaryButtonOnly: {
  value: true}, 
  halt: {
  value: true}, 
  groups: {
  value: true}, 
  startMousePos: {}, 
  dragStartMousePos: {}, 
  startNodePos: {}, 
  deltaPos: {}, 
  actualPos: {}, 
  preventDefaultOnMove: {
  value: true}}, 
  inheritedStatics: {
  DropMode: {
  'POINT': 'point', 
  INTERSECT: 'intersect', 
  STRICT: 'strict'}}});
  _$jscoverage['/dd/draggable.js'].lineData[833]++;
  var _ieSelectBack;
  _$jscoverage['/dd/draggable.js'].lineData[835]++;
  function fixIEMouseUp() {
    _$jscoverage['/dd/draggable.js'].functionData[26]++;
    _$jscoverage['/dd/draggable.js'].lineData[836]++;
    doc.body.onselectstart = _ieSelectBack;
  }
  _$jscoverage['/dd/draggable.js'].lineData[840]++;
  function fixIEMouseDown() {
    _$jscoverage['/dd/draggable.js'].functionData[27]++;
    _$jscoverage['/dd/draggable.js'].lineData[841]++;
    _ieSelectBack = doc.body.onselectstart;
    _$jscoverage['/dd/draggable.js'].lineData[842]++;
    doc.body.onselectstart = fixIESelect;
  }
  _$jscoverage['/dd/draggable.js'].lineData[851]++;
  function fixDragStart(e) {
    _$jscoverage['/dd/draggable.js'].functionData[28]++;
    _$jscoverage['/dd/draggable.js'].lineData[852]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[858]++;
  function fixIESelect() {
    _$jscoverage['/dd/draggable.js'].functionData[29]++;
    _$jscoverage['/dd/draggable.js'].lineData[859]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[867]++;
  var handlePreDragStart = function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[30]++;
  _$jscoverage['/dd/draggable.js'].lineData[868]++;
  var self = this, t = ev.target;
  _$jscoverage['/dd/draggable.js'].lineData[870]++;
  if (visit96_870_1(self._checkDragStartValid(ev))) {
    _$jscoverage['/dd/draggable.js'].lineData[871]++;
    if (visit97_871_1(!self._checkHandler(t))) {
      _$jscoverage['/dd/draggable.js'].lineData[872]++;
      return;
    }
    _$jscoverage['/dd/draggable.js'].lineData[874]++;
    self._prepare(ev);
  }
};
  _$jscoverage['/dd/draggable.js'].lineData[878]++;
  return Draggable;
}, {
  requires: ['node', 'base', './ddm']});
