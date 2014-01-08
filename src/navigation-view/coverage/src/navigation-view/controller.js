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
if (! _$jscoverage['/navigation-view/controller.js']) {
  _$jscoverage['/navigation-view/controller.js'] = {};
  _$jscoverage['/navigation-view/controller.js'].lineData = [];
  _$jscoverage['/navigation-view/controller.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[10] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[11] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[12] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[13] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[14] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[15] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[16] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[20] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[21] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[22] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[23] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[26] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[28] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[32] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[33] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[36] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[43] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[44] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[50] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[61] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[65] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[66] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[73] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[74] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[75] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[76] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[84] = 0;
  _$jscoverage['/navigation-view/controller.js'].lineData[88] = 0;
}
if (! _$jscoverage['/navigation-view/controller.js'].functionData) {
  _$jscoverage['/navigation-view/controller.js'].functionData = [];
  _$jscoverage['/navigation-view/controller.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view/controller.js'].functionData[10] = 0;
}
if (! _$jscoverage['/navigation-view/controller.js'].branchData) {
  _$jscoverage['/navigation-view/controller.js'].branchData = {};
  _$jscoverage['/navigation-view/controller.js'].branchData['15'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['21'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['22'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['25'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['64'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['65'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/navigation-view/controller.js'].branchData['88'] = [];
  _$jscoverage['/navigation-view/controller.js'].branchData['88'][1] = new BranchData();
}
_$jscoverage['/navigation-view/controller.js'].branchData['88'][1].init(21, 66, 'this.get(\'navigationView\').get(\'activeView\') === this.getSubView()');
function visit19_88_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['65'][1].init(22, 35, 'children[i].constructor === SubView');
function visit18_65_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['64'][1].init(248, 6, 'i >= 0');
function visit17_64_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['25'][1].init(112, 26, 'navigationView.waitingView');
function visit16_25_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['22'][1].init(18, 10, 'activeView');
function visit15_22_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['21'][2].init(457, 22, 'activeView !== subView');
function visit14_21_2(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['21'][1].init(457, 54, 'activeView !== subView || self.needNavigation(request)');
function visit13_21_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].branchData['15'][1].init(200, 8, '!subView');
function visit12_15_1(result) {
  _$jscoverage['/navigation-view/controller.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view/controller.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view/controller.js'].functionData[0]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[6]++;
  var Base = require('base');
  _$jscoverage['/navigation-view/controller.js'].lineData[7]++;
  var router = require('router');
  _$jscoverage['/navigation-view/controller.js'].lineData[8]++;
  var Promise = require('promise');
  _$jscoverage['/navigation-view/controller.js'].lineData[10]++;
  function doRoute(request) {
    _$jscoverage['/navigation-view/controller.js'].functionData[1]++;
    _$jscoverage['/navigation-view/controller.js'].lineData[11]++;
    var self = this;
    _$jscoverage['/navigation-view/controller.js'].lineData[12]++;
    var subView = self.getSubView();
    _$jscoverage['/navigation-view/controller.js'].lineData[13]++;
    var navigationView = self.get('navigationView');
    _$jscoverage['/navigation-view/controller.js'].lineData[14]++;
    var activeView = navigationView.get('activeView');
    _$jscoverage['/navigation-view/controller.js'].lineData[15]++;
    if (visit12_15_1(!subView)) {
      _$jscoverage['/navigation-view/controller.js'].lineData[16]++;
      subView = new (self.get('SubView'))();
      _$jscoverage['/navigation-view/controller.js'].lineData[17]++;
      navigationView.addChild(subView);
      _$jscoverage['/navigation-view/controller.js'].lineData[18]++;
      subView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
    }
    _$jscoverage['/navigation-view/controller.js'].lineData[20]++;
    subView.controller = self;
    _$jscoverage['/navigation-view/controller.js'].lineData[21]++;
    if (visit13_21_1(visit14_21_2(activeView !== subView) || self.needNavigation(request))) {
      _$jscoverage['/navigation-view/controller.js'].lineData[22]++;
      if (visit15_22_1(activeView)) {
        _$jscoverage['/navigation-view/controller.js'].lineData[23]++;
        activeView.controller.leave();
      }
      _$jscoverage['/navigation-view/controller.js'].lineData[25]++;
      if (visit16_25_1(navigationView.waitingView)) {
        _$jscoverage['/navigation-view/controller.js'].lineData[26]++;
        navigationView.waitingView.controller.leave();
      }
      _$jscoverage['/navigation-view/controller.js'].lineData[28]++;
      self.reload();
      _$jscoverage['/navigation-view/controller.js'].lineData[29]++;
      self.go(request);
    }
    _$jscoverage['/navigation-view/controller.js'].lineData[31]++;
    var route = request.route;
    _$jscoverage['/navigation-view/controller.js'].lineData[32]++;
    var routes = self.get('routes');
    _$jscoverage['/navigation-view/controller.js'].lineData[33]++;
    self[routes[route.path]].apply(self, arguments);
  }
  _$jscoverage['/navigation-view/controller.js'].lineData[36]++;
  return Base.extend({
  router: router, 
  initializer: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[2]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[40]++;
  var self = this;
  _$jscoverage['/navigation-view/controller.js'].lineData[41]++;
  var path;
  _$jscoverage['/navigation-view/controller.js'].lineData[42]++;
  self.doRoute = S.bind(doRoute, self);
  _$jscoverage['/navigation-view/controller.js'].lineData[43]++;
  var routes = self.get('routes');
  _$jscoverage['/navigation-view/controller.js'].lineData[44]++;
  for (path in routes) {
    _$jscoverage['/navigation-view/controller.js'].lineData[45]++;
    router.get(path, self.doRoute);
  }
}, 
  needNavigation: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[3]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[50]++;
  return true;
}, 
  leave: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[4]++;
}, 
  enter: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[5]++;
}, 
  getSubView: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[6]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[60]++;
  var self = this;
  _$jscoverage['/navigation-view/controller.js'].lineData[61]++;
  var navigationView = self.get('navigationView');
  _$jscoverage['/navigation-view/controller.js'].lineData[62]++;
  var SubView = self.get('SubView');
  _$jscoverage['/navigation-view/controller.js'].lineData[63]++;
  var children = navigationView.get('children');
  _$jscoverage['/navigation-view/controller.js'].lineData[64]++;
  for (var i = children.length - 1; visit17_64_1(i >= 0); i--) {
    _$jscoverage['/navigation-view/controller.js'].lineData[65]++;
    if (visit18_65_1(children[i].constructor === SubView)) {
      _$jscoverage['/navigation-view/controller.js'].lineData[66]++;
      return children[i];
    }
  }
  _$jscoverage['/navigation-view/controller.js'].lineData[69]++;
  return undefined;
}, 
  reload: function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[7]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[73]++;
  this.getSubView().reset('title');
  _$jscoverage['/navigation-view/controller.js'].lineData[74]++;
  this.defer = new Promise.Defer();
  _$jscoverage['/navigation-view/controller.js'].lineData[75]++;
  this.promise = this.defer.promise;
  _$jscoverage['/navigation-view/controller.js'].lineData[76]++;
  this.enter();
}, 
  navigate: function(url, options) {
  _$jscoverage['/navigation-view/controller.js'].functionData[8]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[80]++;
  router.navigate(url, options);
}, 
  go: function(request) {
  _$jscoverage['/navigation-view/controller.js'].functionData[9]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[84]++;
  this.get('navigationView')[request.backward ? 'pop' : 'push'](this.getSubView());
}, 
  'isSubViewActive': function() {
  _$jscoverage['/navigation-view/controller.js'].functionData[10]++;
  _$jscoverage['/navigation-view/controller.js'].lineData[88]++;
  return visit19_88_1(this.get('navigationView').get('activeView') === this.getSubView());
}}, {
  ATTRS: {
  routes: {}, 
  SubView: {}}});
});
