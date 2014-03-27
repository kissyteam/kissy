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
  _$jscoverage['/dd/draggable.js'].lineData[13] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[21] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[22] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[23] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[24] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[29] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[30] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[33] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[34] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[37] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[38] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[46] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[48] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[49] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[50] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[214] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[216] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[220] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[223] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[224] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[225] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[227] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[232] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[236] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[238] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[243] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[248] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[250] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[255] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[260] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[262] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[263] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[265] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[271] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[274] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[276] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[277] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[278] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[279] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[281] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[283] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[287] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[288] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[289] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[291] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[295] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[297] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[299] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[300] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[301] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[315] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[316] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[323] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[324] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[327] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[328] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[333] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[334] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[338] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[339] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[348] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[352] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[357] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[358] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[361] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[366] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[376] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[378] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[379] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[380] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[382] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[383] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[384] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[388] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[391] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[394] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[395] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[398] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[402] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[403] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[406] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[408] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[417] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[418] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[423] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[425] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[428] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[431] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[433] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[435] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[436] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[441] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[446] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[448] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[460] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[461] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[464] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[471] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[472] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[474] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[478] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[487] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[510] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[511] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[513] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[556] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[557] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[558] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[560] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[561] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[562] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[565] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[566] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[568] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[569] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[571] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[573] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[574] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[735] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[737] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[738] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[741] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[742] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[747] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[748] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[749] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[752] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[753] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[763] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[764] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[770] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[771] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[774] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[775] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[776] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[779] = 0;
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
  _$jscoverage['/dd/draggable.js'].functionData[31] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[32] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].branchData) {
  _$jscoverage['/dd/draggable.js'].branchData = {};
  _$jscoverage['/dd/draggable.js'].branchData['23'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['223'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['224'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['238'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['250'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['262'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['276'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['276'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['288'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['299'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['315'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['323'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['327'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['357'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['378'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['394'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['402'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['406'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['417'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['423'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['510'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['557'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['561'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['565'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['568'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['741'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['752'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['752'][1] = new BranchData();
}
_$jscoverage['/dd/draggable.js'].branchData['752'][1].init(305, 19, 'doc.body.setCapture');
function visit81_752_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['741'][1].init(259, 23, 'doc.body.releaseCapture');
function visit80_741_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['568'][1].init(338, 10, 'v.nodeType');
function visit79_568_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['565'][1].init(202, 21, 'typeof v === \'string\'');
function visit78_565_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['561'][1].init(29, 23, 'typeof v === \'function\'');
function visit77_561_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['557'][1].init(62, 10, '!vs.length');
function visit76_557_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['510'][1].init(25, 20, '!(v instanceof Node)');
function visit75_510_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['423'][1].init(17, 7, 'e || {}');
function visit74_423_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['417'][1].init(17, 17, 'this._isValidDrag');
function visit73_417_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['406'][1].init(1527, 11, 'def && move');
function visit72_406_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['402'][1].init(1424, 32, 'self.get(\'preventDefaultOnMove\')');
function visit71_402_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['394'][1].init(1230, 40, 'self.fire(\'drag\', customEvent) === false');
function visit70_394_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['378'][1].init(677, 4, 'move');
function visit69_378_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['357'][1].init(149, 25, 'e.gestureType === \'touch\'');
function visit68_357_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['327'][1].init(1065, 15, 'self._allowMove');
function visit67_327_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['323'][1].init(969, 25, 'e.gestureType === \'mouse\'');
function visit66_323_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['315'][1].init(679, 16, 'self.get(\'halt\')');
function visit65_315_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['299'][1].init(83, 2, 'ie');
function visit64_299_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['288'][2].init(79, 13, 'e.which !== 1');
function visit63_288_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['288'][1].init(46, 46, 'self.get(\'primaryButtonOnly\') && e.which !== 1');
function visit62_288_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['276'][2].init(51, 16, 'handler[0] === t');
function visit61_276_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['276'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['276'][1].init(51, 39, 'handler[0] === t || handler.contains(t)');
function visit60_276_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['262'][1].init(91, 4, 'node');
function visit59_262_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['250'][1].init(94, 4, 'node');
function visit58_250_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['238'][1].init(94, 4, 'node');
function visit57_238_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['224'][1].init(21, 22, '!self._checkHandler(t)');
function visit56_224_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['223'][1].init(77, 28, 'self._checkDragStartValid(e)');
function visit55_223_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['23'][1].init(17, 17, 'this._isValidDrag');
function visit54_23_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable.js'].functionData[0]++;
  _$jscoverage['/dd/draggable.js'].lineData[7]++;
  var Node = require('node'), Gesture = Node.Gesture, DDM = require('./ddm'), Base = require('base'), DragType = require('event/gesture/drag');
  _$jscoverage['/dd/draggable.js'].lineData[13]++;
  var UA = require('ua'), $ = Node.all, $doc = $(document), each = S.each, ie = UA.ie, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  _$jscoverage['/dd/draggable.js'].lineData[21]++;
  function checkValid(fn) {
    _$jscoverage['/dd/draggable.js'].functionData[1]++;
    _$jscoverage['/dd/draggable.js'].lineData[22]++;
    return function() {
  _$jscoverage['/dd/draggable.js'].functionData[2]++;
  _$jscoverage['/dd/draggable.js'].lineData[23]++;
  if (visit54_23_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[24]++;
    fn.apply(this, arguments);
  }
};
  }
  _$jscoverage['/dd/draggable.js'].lineData[29]++;
  var onDragStart = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[3]++;
  _$jscoverage['/dd/draggable.js'].lineData[30]++;
  this._start(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[33]++;
  var onDrag = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[4]++;
  _$jscoverage['/dd/draggable.js'].lineData[34]++;
  this._move(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[37]++;
  var onDragEnd = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[5]++;
  _$jscoverage['/dd/draggable.js'].lineData[38]++;
  this._end(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[46]++;
  var Draggable = Base.extend({
  initializer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[6]++;
  _$jscoverage['/dd/draggable.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[49]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/draggable.js'].lineData[50]++;
  self._allowMove = self.get('move');
}, 
  _onSetNode: function(n) {
  _$jscoverage['/dd/draggable.js'].functionData[7]++;
  _$jscoverage['/dd/draggable.js'].lineData[214]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[216]++;
  self.setInternal('dragNode', n);
}, 
  onGestureStart: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[8]++;
  _$jscoverage['/dd/draggable.js'].lineData[220]++;
  var self = this, t = e.target;
  _$jscoverage['/dd/draggable.js'].lineData[223]++;
  if (visit55_223_1(self._checkDragStartValid(e))) {
    _$jscoverage['/dd/draggable.js'].lineData[224]++;
    if (visit56_224_1(!self._checkHandler(t))) {
      _$jscoverage['/dd/draggable.js'].lineData[225]++;
      return;
    }
    _$jscoverage['/dd/draggable.js'].lineData[227]++;
    self._prepare(e);
  }
}, 
  getEventTargetEl: function() {
  _$jscoverage['/dd/draggable.js'].functionData[9]++;
  _$jscoverage['/dd/draggable.js'].lineData[232]++;
  return this.get('node');
}, 
  start: function() {
  _$jscoverage['/dd/draggable.js'].functionData[10]++;
  _$jscoverage['/dd/draggable.js'].lineData[236]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[238]++;
  if (visit57_238_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[243]++;
    node.on(DragType.DRAG_START, onDragStart, self).on(DragType.DRAG, onDrag, self).on(DragType.DRAG_END, onDragEnd, self).on(Gesture.start, onGestureStart, self).on('dragstart', self._fixDragStart);
  }
}, 
  stop: function() {
  _$jscoverage['/dd/draggable.js'].functionData[11]++;
  _$jscoverage['/dd/draggable.js'].lineData[248]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[250]++;
  if (visit58_250_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[255]++;
    node.detach(DragType.DRAG_START, onDragStart, self).detach(DragType.DRAG, onDrag, self).detach(DragType.DRAG_END, onDragEnd, self).detach(Gesture.start, onGestureStart, self).detach('dragstart', self._fixDragStart);
  }
}, 
  _onSetDisabled: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[12]++;
  _$jscoverage['/dd/draggable.js'].lineData[260]++;
  var self = this, node = self.get('dragNode');
  _$jscoverage['/dd/draggable.js'].lineData[262]++;
  if (visit59_262_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[263]++;
    node[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
  }
  _$jscoverage['/dd/draggable.js'].lineData[265]++;
  self[d ? 'stop' : 'start']();
}, 
  _fixDragStart: fixDragStart, 
  _checkHandler: function(t) {
  _$jscoverage['/dd/draggable.js'].functionData[13]++;
  _$jscoverage['/dd/draggable.js'].lineData[271]++;
  var self = this, handlers = self.get('handlers'), ret = 0;
  _$jscoverage['/dd/draggable.js'].lineData[274]++;
  each(handlers, function(handler) {
  _$jscoverage['/dd/draggable.js'].functionData[14]++;
  _$jscoverage['/dd/draggable.js'].lineData[276]++;
  if (visit60_276_1(visit61_276_2(handler[0] === t) || handler.contains(t))) {
    _$jscoverage['/dd/draggable.js'].lineData[277]++;
    ret = 1;
    _$jscoverage['/dd/draggable.js'].lineData[278]++;
    self.setInternal('activeHandler', handler);
    _$jscoverage['/dd/draggable.js'].lineData[279]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[281]++;
  return undefined;
});
  _$jscoverage['/dd/draggable.js'].lineData[283]++;
  return ret;
}, 
  _checkDragStartValid: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[15]++;
  _$jscoverage['/dd/draggable.js'].lineData[287]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[288]++;
  if (visit62_288_1(self.get('primaryButtonOnly') && visit63_288_2(e.which !== 1))) {
    _$jscoverage['/dd/draggable.js'].lineData[289]++;
    return 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[291]++;
  return 1;
}, 
  _prepare: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[16]++;
  _$jscoverage['/dd/draggable.js'].lineData[295]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[297]++;
  self._isValidDrag = 1;
  _$jscoverage['/dd/draggable.js'].lineData[299]++;
  if (visit64_299_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[300]++;
    fixIEMouseDown();
    _$jscoverage['/dd/draggable.js'].lineData[301]++;
    $doc.on(Gesture.end, {
  fn: fixIEMouseUp, 
  once: true});
  }
  _$jscoverage['/dd/draggable.js'].lineData[315]++;
  if (visit65_315_1(self.get('halt'))) {
    _$jscoverage['/dd/draggable.js'].lineData[316]++;
    e.stopPropagation();
  }
  _$jscoverage['/dd/draggable.js'].lineData[323]++;
  if (visit66_323_1(e.gestureType === 'mouse')) {
    _$jscoverage['/dd/draggable.js'].lineData[324]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[327]++;
  if (visit67_327_1(self._allowMove)) {
    _$jscoverage['/dd/draggable.js'].lineData[328]++;
    self.setInternal('startNodePos', self.get('node').offset());
  }
}, 
  _start: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[17]++;
  _$jscoverage['/dd/draggable.js'].lineData[333]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[334]++;
  self.mousePos = {
  left: e.pageX, 
  top: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[338]++;
  DDM.start(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[339]++;
  self.fire('dragstart', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
  _$jscoverage['/dd/draggable.js'].lineData[348]++;
  self.get('dragNode').addClass(PREFIX_CLS + 'dragging');
}, 
  _move: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[18]++;
  _$jscoverage['/dd/draggable.js'].lineData[352]++;
  var self = this, pageX = e.pageX, pageY = e.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[357]++;
  if (visit68_357_1(e.gestureType === 'touch')) {
    _$jscoverage['/dd/draggable.js'].lineData[358]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[361]++;
  self.mousePos = {
  left: pageX, 
  top: pageY};
  _$jscoverage['/dd/draggable.js'].lineData[366]++;
  var customEvent = {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[376]++;
  var move = self._allowMove;
  _$jscoverage['/dd/draggable.js'].lineData[378]++;
  if (visit69_378_1(move)) {
    _$jscoverage['/dd/draggable.js'].lineData[379]++;
    var startNodePos = self.get('startNodePos');
    _$jscoverage['/dd/draggable.js'].lineData[380]++;
    var left = startNodePos.left + e.deltaX, top = startNodePos.top + e.deltaY;
    _$jscoverage['/dd/draggable.js'].lineData[382]++;
    customEvent.left = left;
    _$jscoverage['/dd/draggable.js'].lineData[383]++;
    customEvent.top = top;
    _$jscoverage['/dd/draggable.js'].lineData[384]++;
    self.setInternal('actualPos', {
  left: left, 
  top: top});
    _$jscoverage['/dd/draggable.js'].lineData[388]++;
    self.fire('dragalign', customEvent);
  }
  _$jscoverage['/dd/draggable.js'].lineData[391]++;
  var def = 1;
  _$jscoverage['/dd/draggable.js'].lineData[394]++;
  if (visit70_394_1(self.fire('drag', customEvent) === false)) {
    _$jscoverage['/dd/draggable.js'].lineData[395]++;
    def = 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[398]++;
  DDM.move(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[402]++;
  if (visit71_402_1(self.get('preventDefaultOnMove'))) {
    _$jscoverage['/dd/draggable.js'].lineData[403]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[406]++;
  if (visit72_406_1(def && move)) {
    _$jscoverage['/dd/draggable.js'].lineData[408]++;
    self.get('node').offset(self.get('actualPos'));
  }
}, 
  stopDrag: function() {
  _$jscoverage['/dd/draggable.js'].functionData[19]++;
  _$jscoverage['/dd/draggable.js'].lineData[417]++;
  if (visit73_417_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[418]++;
    this._end();
  }
}, 
  _end: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[20]++;
  _$jscoverage['/dd/draggable.js'].lineData[423]++;
  e = visit74_423_1(e || {});
  _$jscoverage['/dd/draggable.js'].lineData[425]++;
  var self = this, activeDrop;
  _$jscoverage['/dd/draggable.js'].lineData[428]++;
  self._isValidDrag = 0;
  _$jscoverage['/dd/draggable.js'].lineData[431]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[433]++;
  self.get('dragNode').removeClass(PREFIX_CLS + 'dragging');
  _$jscoverage['/dd/draggable.js'].lineData[435]++;
  if ((activeDrop = DDM.get('activeDrop'))) {
    _$jscoverage['/dd/draggable.js'].lineData[436]++;
    self.fire('dragdrophit', {
  drag: self, 
  drop: activeDrop});
  } else {
    _$jscoverage['/dd/draggable.js'].lineData[441]++;
    self.fire('dragdropmiss', {
  drag: self});
  }
  _$jscoverage['/dd/draggable.js'].lineData[446]++;
  DDM.end(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[448]++;
  self.fire('dragend', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
}, 
  _handleOut: function() {
  _$jscoverage['/dd/draggable.js'].functionData[21]++;
  _$jscoverage['/dd/draggable.js'].lineData[460]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[461]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[464]++;
  self.fire('dragexit', {
  drag: self, 
  drop: DDM.get('activeDrop')});
}, 
  _handleEnter: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[22]++;
  _$jscoverage['/dd/draggable.js'].lineData[471]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[472]++;
  self.get('node').addClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[474]++;
  self.fire('dragenter', e);
}, 
  _handleOver: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[23]++;
  _$jscoverage['/dd/draggable.js'].lineData[478]++;
  this.fire('dragover', e);
}, 
  destructor: function() {
  _$jscoverage['/dd/draggable.js'].functionData[24]++;
  _$jscoverage['/dd/draggable.js'].lineData[487]++;
  this.stop();
}}, {
  name: 'Draggable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/draggable.js'].functionData[25]++;
  _$jscoverage['/dd/draggable.js'].lineData[510]++;
  if (visit75_510_1(!(v instanceof Node))) {
    _$jscoverage['/dd/draggable.js'].lineData[511]++;
    return $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[513]++;
  return undefined;
}}, 
  dragNode: {}, 
  shim: {
  value: false}, 
  handlers: {
  value: [], 
  getter: function(vs) {
  _$jscoverage['/dd/draggable.js'].functionData[26]++;
  _$jscoverage['/dd/draggable.js'].lineData[556]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[557]++;
  if (visit76_557_1(!vs.length)) {
    _$jscoverage['/dd/draggable.js'].lineData[558]++;
    vs[0] = self.get('node');
  }
  _$jscoverage['/dd/draggable.js'].lineData[560]++;
  each(vs, function(v, i) {
  _$jscoverage['/dd/draggable.js'].functionData[27]++;
  _$jscoverage['/dd/draggable.js'].lineData[561]++;
  if (visit77_561_1(typeof v === 'function')) {
    _$jscoverage['/dd/draggable.js'].lineData[562]++;
    v = v.call(self);
  }
  _$jscoverage['/dd/draggable.js'].lineData[565]++;
  if (visit78_565_1(typeof v === 'string')) {
    _$jscoverage['/dd/draggable.js'].lineData[566]++;
    v = self.get('node').one(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[568]++;
  if (visit79_568_1(v.nodeType)) {
    _$jscoverage['/dd/draggable.js'].lineData[569]++;
    v = $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[571]++;
  vs[i] = v;
});
  _$jscoverage['/dd/draggable.js'].lineData[573]++;
  self.setInternal('handlers', vs);
  _$jscoverage['/dd/draggable.js'].lineData[574]++;
  return vs;
}}, 
  activeHandler: {}, 
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
  startNodePos: {}, 
  actualPos: {}, 
  preventDefaultOnMove: {
  value: true}}, 
  inheritedStatics: {
  DropMode: {
  POINT: 'point', 
  INTERSECT: 'intersect', 
  STRICT: 'strict'}}});
  _$jscoverage['/dd/draggable.js'].lineData[735]++;
  var _ieSelectBack;
  _$jscoverage['/dd/draggable.js'].lineData[737]++;
  function fixIEMouseUp() {
    _$jscoverage['/dd/draggable.js'].functionData[28]++;
    _$jscoverage['/dd/draggable.js'].lineData[738]++;
    doc.body.onselectstart = _ieSelectBack;
    _$jscoverage['/dd/draggable.js'].lineData[741]++;
    if (visit80_741_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[742]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[747]++;
  function fixIEMouseDown() {
    _$jscoverage['/dd/draggable.js'].functionData[29]++;
    _$jscoverage['/dd/draggable.js'].lineData[748]++;
    _ieSelectBack = doc.body.onselectstart;
    _$jscoverage['/dd/draggable.js'].lineData[749]++;
    doc.body.onselectstart = fixIESelect;
    _$jscoverage['/dd/draggable.js'].lineData[752]++;
    if (visit81_752_1(doc.body.setCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[753]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[763]++;
  function fixDragStart(e) {
    _$jscoverage['/dd/draggable.js'].functionData[30]++;
    _$jscoverage['/dd/draggable.js'].lineData[764]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[770]++;
  function fixIESelect() {
    _$jscoverage['/dd/draggable.js'].functionData[31]++;
    _$jscoverage['/dd/draggable.js'].lineData[771]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[774]++;
  function onGestureStart(e) {
    _$jscoverage['/dd/draggable.js'].functionData[32]++;
    _$jscoverage['/dd/draggable.js'].lineData[775]++;
    this._isValidDrag = 0;
    _$jscoverage['/dd/draggable.js'].lineData[776]++;
    this.onGestureStart(e);
  }
  _$jscoverage['/dd/draggable.js'].lineData[779]++;
  return Draggable;
});
