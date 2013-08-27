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
if (! _$jscoverage['/base/observer.js']) {
  _$jscoverage['/base/observer.js'] = {};
  _$jscoverage['/base/observer.js'].lineData = [];
  _$jscoverage['/base/observer.js'].lineData[6] = 0;
  _$jscoverage['/base/observer.js'].lineData[14] = 0;
  _$jscoverage['/base/observer.js'].lineData[15] = 0;
  _$jscoverage['/base/observer.js'].lineData[35] = 0;
  _$jscoverage['/base/observer.js'].lineData[45] = 0;
  _$jscoverage['/base/observer.js'].lineData[46] = 0;
  _$jscoverage['/base/observer.js'].lineData[47] = 0;
  _$jscoverage['/base/observer.js'].lineData[58] = 0;
  _$jscoverage['/base/observer.js'].lineData[60] = 0;
  _$jscoverage['/base/observer.js'].lineData[61] = 0;
  _$jscoverage['/base/observer.js'].lineData[63] = 0;
  _$jscoverage['/base/observer.js'].lineData[65] = 0;
  _$jscoverage['/base/observer.js'].lineData[75] = 0;
  _$jscoverage['/base/observer.js'].lineData[85] = 0;
  _$jscoverage['/base/observer.js'].lineData[90] = 0;
  _$jscoverage['/base/observer.js'].lineData[91] = 0;
  _$jscoverage['/base/observer.js'].lineData[94] = 0;
  _$jscoverage['/base/observer.js'].lineData[97] = 0;
  _$jscoverage['/base/observer.js'].lineData[98] = 0;
  _$jscoverage['/base/observer.js'].lineData[101] = 0;
  _$jscoverage['/base/observer.js'].lineData[106] = 0;
}
if (! _$jscoverage['/base/observer.js'].functionData) {
  _$jscoverage['/base/observer.js'].functionData = [];
  _$jscoverage['/base/observer.js'].functionData[0] = 0;
  _$jscoverage['/base/observer.js'].functionData[1] = 0;
  _$jscoverage['/base/observer.js'].functionData[2] = 0;
  _$jscoverage['/base/observer.js'].functionData[3] = 0;
  _$jscoverage['/base/observer.js'].functionData[4] = 0;
  _$jscoverage['/base/observer.js'].functionData[5] = 0;
  _$jscoverage['/base/observer.js'].functionData[6] = 0;
}
if (! _$jscoverage['/base/observer.js'].branchData) {
  _$jscoverage['/base/observer.js'].branchData = {};
  _$jscoverage['/base/observer.js'].branchData['47'] = [];
  _$jscoverage['/base/observer.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/observer.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/base/observer.js'].branchData['60'] = [];
  _$jscoverage['/base/observer.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/observer.js'].branchData['61'] = [];
  _$jscoverage['/base/observer.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/observer.js'].branchData['90'] = [];
  _$jscoverage['/base/observer.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/observer.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/base/observer.js'].branchData['97'] = [];
  _$jscoverage['/base/observer.js'].branchData['97'][1] = new BranchData();
}
_$jscoverage['/base/observer.js'].branchData['97'][1].init(456, 13, 'ret === false');
function visit12_97_1(result) {
  _$jscoverage['/base/observer.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observer.js'].branchData['90'][2].init(216, 48, '!self.groups || !(self.groups.match(_ks_groups))');
function visit11_90_2(result) {
  _$jscoverage['/base/observer.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observer.js'].branchData['90'][1].init(201, 64, '_ks_groups && (!self.groups || !(self.groups.match(_ks_groups)))');
function visit10_90_1(result) {
  _$jscoverage['/base/observer.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observer.js'].branchData['61'][1].init(155, 9, 'self.once');
function visit9_61_1(result) {
  _$jscoverage['/base/observer.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observer.js'].branchData['60'][1].init(85, 32, 'self.context || ce.currentTarget');
function visit8_60_1(result) {
  _$jscoverage['/base/observer.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observer.js'].branchData['47'][2].init(31, 15, 's1[k] === s2[k]');
function visit7_47_2(result) {
  _$jscoverage['/base/observer.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observer.js'].branchData['47'][1].init(25, 22, 'v && (s1[k] === s2[k])');
function visit6_47_1(result) {
  _$jscoverage['/base/observer.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observer.js'].lineData[6]++;
KISSY.add('event/base/observer', function(S, undefined) {
  _$jscoverage['/base/observer.js'].functionData[0]++;
  _$jscoverage['/base/observer.js'].lineData[14]++;
  function Observer(cfg) {
    _$jscoverage['/base/observer.js'].functionData[1]++;
    _$jscoverage['/base/observer.js'].lineData[15]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/base/observer.js'].lineData[35]++;
  Observer.prototype = {
  constructor: Observer, 
  equals: function(s2) {
  _$jscoverage['/base/observer.js'].functionData[2]++;
  _$jscoverage['/base/observer.js'].lineData[45]++;
  var s1 = this;
  _$jscoverage['/base/observer.js'].lineData[46]++;
  return !!S.reduce(s1.keys, function(v, k) {
  _$jscoverage['/base/observer.js'].functionData[3]++;
  _$jscoverage['/base/observer.js'].lineData[47]++;
  return visit6_47_1(v && (visit7_47_2(s1[k] === s2[k])));
}, 1);
}, 
  simpleNotify: function(event, ce) {
  _$jscoverage['/base/observer.js'].functionData[4]++;
  _$jscoverage['/base/observer.js'].lineData[58]++;
  var ret, self = this;
  _$jscoverage['/base/observer.js'].lineData[60]++;
  ret = self.fn.call(visit8_60_1(self.context || ce.currentTarget), event, self.data);
  _$jscoverage['/base/observer.js'].lineData[61]++;
  if (visit9_61_1(self.once)) {
    _$jscoverage['/base/observer.js'].lineData[63]++;
    ce.removeObserver(self);
  }
  _$jscoverage['/base/observer.js'].lineData[65]++;
  return ret;
}, 
  notifyInternal: function(event, ce) {
  _$jscoverage['/base/observer.js'].functionData[5]++;
  _$jscoverage['/base/observer.js'].lineData[75]++;
  return this.simpleNotify(event, ce);
}, 
  notify: function(event, ce) {
  _$jscoverage['/base/observer.js'].functionData[6]++;
  _$jscoverage['/base/observer.js'].lineData[85]++;
  var ret, self = this, _ks_groups = event._ks_groups;
  _$jscoverage['/base/observer.js'].lineData[90]++;
  if (visit10_90_1(_ks_groups && (visit11_90_2(!self.groups || !(self.groups.match(_ks_groups)))))) {
    _$jscoverage['/base/observer.js'].lineData[91]++;
    return undefined;
  }
  _$jscoverage['/base/observer.js'].lineData[94]++;
  ret = self.notifyInternal(event, ce);
  _$jscoverage['/base/observer.js'].lineData[97]++;
  if (visit12_97_1(ret === false)) {
    _$jscoverage['/base/observer.js'].lineData[98]++;
    event.halt();
  }
  _$jscoverage['/base/observer.js'].lineData[101]++;
  return ret;
}};
  _$jscoverage['/base/observer.js'].lineData[106]++;
  return Observer;
});
