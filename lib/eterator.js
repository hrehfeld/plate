var clear_stack = function(fn) {
  setTimeout(fn, 0);
};

if(typeof(window) !== 'undefined') {

  var setZeroTimeout = function(fn) {
    window.addEventListener('message', function event_listener(ev) {
      window.removeEventListener('message', event_listener, true);

      if(ev.source === window && ev.data === 'zero-timeout') {
        ev.stopPropagation();
        try{ fn(); } catch(err) {}
      }
    }, true);

    window.postMessage('zero-timeout', '*'); 
  };

  if('postMessage' in window && 'addEventListener' in window)
    clear_stack = setZeroTimeout;
}

exports.eterator = function eterator (list) {
  var _l = list.slice();
  var ret = function(block) {
    block.next = function() {
      if(_l.length) {
        var next = _l.shift();
        exports.eterator.clear_stack(function() {
          block(next);   
        });
      } else {
        block.done();
      }
    };
    block.done = function() {
      ret.finish();
    };

    exports.eterator.clear_stack(block.next);
  };
  ret.on_ready = function(ready) {
    ret.finish = ready;
  };
  return ret;
};

exports.eterator.clear_stack = clear_stack

exports.parallel = function(list, ready) {
  var _l = list.slice(),
      expecting = _l.length,
      accum = [],
      seen = 0;

  var collect = function(idx, err, data) {
    if(err) {
      // quit the second an error occurs
      // prevent error events from recalling `ready`
      ready(err);
      collect = function(){}
    } else {
      ++seen;
      accum[idx] = data;
      if(seen === expecting) {
        ready(null, accum)
      }
    }
  };

  return function(fn) {
    for(var i = 0, len = _l.length; i < len; ++i) {
      (function(node, idx) {
        fn(node, function(err, data) {
          collect(idx, err, data);
        }); 
      })(_l[i], i) 
    }
    if(_l.length === 0)
      ready(null, [])
  };
};
