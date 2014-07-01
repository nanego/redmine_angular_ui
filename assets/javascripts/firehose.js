(function() {
  window.Firehose = {};

}).call(this);
(function() {
  Firehose.version = "1.2.12";

  Firehose.codeName = "Benchmarkin' Billy";

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Firehose.Transport = (function() {
    Transport.supported = function() {
      return false;
    };

    function Transport(config) {
      if (config == null) {
        config = {};
      }
      this.getLastMessageSequence = __bind(this.getLastMessageSequence, this);
      this._close = __bind(this._close, this);
      this._open = __bind(this._open, this);
      this._error = __bind(this._error, this);
      this.connect = __bind(this.connect, this);
      this.config = config;
      this._retryDelay = 3000;
      this;
    }

    Transport.prototype.connect = function(delay) {
      if (delay == null) {
        delay = 0;
      }
      setTimeout(this._request, delay);
      return this;
    };

    Transport.prototype.name = function() {
      throw 'not implemented in base Transport';
    };

    Transport.prototype.stop = function() {
      throw 'not implemented in base Transport';
    };

    Transport.prototype._request = function() {
      throw 'not implemented in base Transport';
    };

    Transport.prototype._error = function(event) {
      if (this._succeeded) {
        this.config.disconnected();
        return this.connect(this._retryDelay);
      } else {
        return this.config.failed(this);
      }
    };

    Transport.prototype._open = function(event) {
      this._succeeded = true;
      return this.config.connected(this);
    };

    Transport.prototype._close = function(event) {
      return this.config.disconnected();
    };

    Transport.prototype.getLastMessageSequence = function() {
      return this._lastMessageSequence || 0;
    };

    return Transport;

  })();

}).call(this);
(function() {
  var _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Firehose.LongPoll = (function(_super) {
    __extends(LongPoll, _super);

    LongPoll.prototype.messageSequenceHeader = 'Pragma';

    LongPoll.prototype.name = function() {
      return 'LongPoll';
    };

    LongPoll.ieSupported = function() {
      return (document.documentMode || 10) >= 8;
    };

    LongPoll.supported = function() {
      var xhr;
      if (xhr = $.ajaxSettings.xhr()) {
        return "withCredentials" in xhr || Firehose.LongPoll.ieSupported();
      }
    };

    function LongPoll(args) {
      this._error = __bind(this._error, this);
      this._ping = __bind(this._ping, this);
      this._success = __bind(this._success, this);
      this.stop = __bind(this.stop, this);
      this._request = __bind(this._request, this);
      this._protocol = __bind(this._protocol, this);
      var _base, _base1, _base2, _base3;
      LongPoll.__super__.constructor.call(this, args);
      if ((_base = this.config).ssl == null) {
        _base.ssl = false;
      }
      (_base1 = this.config).longPoll || (_base1.longPoll = {});
      (_base2 = this.config.longPoll).url || (_base2.url = "" + (this._protocol()) + ":" + this.config.uri);
      (_base3 = this.config.longPoll).timeout || (_base3.timeout = 25000);
      this._lagTime = 5000;
      this._timeout = this.config.longPoll.timeout + this._lagTime;
      this._okInterval = this.config.okInterval || 0;
      this._stopRequestLoop = false;
    }

    LongPoll.prototype._protocol = function() {
      if (this.config.ssl) {
        return "https";
      } else {
        return "http";
      }
    };

    LongPoll.prototype._request = function() {
      var data;
      if (this._stopRequestLoop) {
        return;
      }
      data = this.config.params;
      data.last_message_sequence = this._lastMessageSequence;
      return this._lastRequest = $.ajax({
        url: this.config.longPoll.url,
        firehose: true,
        crossDomain: true,
        data: data,
        timeout: this._timeout,
        success: this._success,
        error: this._error,
        cache: false
      });
    };

    LongPoll.prototype.stop = function() {
      var e;
      this._stopRequestLoop = true;
      if (this._lastRequest != null) {
        try {
          this._lastRequest.abort();
        } catch (_error) {
          e = _error;
        }
        delete this._lastRequest;
      }
      if (this._lastPingRequest != null) {
        try {
          this._lastPingRequest.abort();
        } catch (_error) {
          e = _error;
        }
        return delete this._lastPingRequest;
      }
    };

    LongPoll.prototype._success = function(data, status, jqXhr) {
      var e, last_sequence, message, _ref;
      if (this._needToNotifyOfReconnect || !this._succeeded) {
        this._needToNotifyOfReconnect = false;
        this._open(data);
      }
      if (this._stopRequestLoop) {
        return;
      }
      if (jqXhr.status === 200) {
        try {
          _ref = JSON.parse(jqXhr.responseText), message = _ref.message, last_sequence = _ref.last_sequence;
          this._lastMessageSequence = last_sequence;
          this.config.message(this.config.parse(message));
        } catch (_error) {
          e = _error;
        }
      }
      return this.connect(this._okInterval);
    };

    LongPoll.prototype._ping = function() {
      return this._lastPingRequest = $.ajax({
        url: this.config.longPoll.url,
        method: 'HEAD',
        crossDomain: true,
        firehose: true,
        data: this.config.params,
        success: (function(_this) {
          return function() {
            if (_this._needToNotifyOfReconnect) {
              _this._needToNotifyOfReconnect = false;
              return _this.config.connected(_this);
            }
          };
        })(this)
      });
    };

    LongPoll.prototype._error = function(jqXhr, status, error) {
      if (!(this._needToNotifyOfReconnect || this._stopRequestLoop)) {
        this._needToNotifyOfReconnect = true;
        this.config.disconnected();
      }
      if (!this._stopRequestLoop) {
        setTimeout(this._ping, this._retryDelay + this._lagTime);
        return setTimeout(this._request, this._retryDelay);
      }
    };

    return LongPoll;

  })(Firehose.Transport);

  if ((typeof $ !== "undefined" && $ !== null ? (_ref = $.browser) != null ? _ref.msie : void 0 : void 0) && ((_ref1 = parseInt($.browser.version, 10)) === 8 || _ref1 === 9)) {
    jQuery.ajaxTransport(function(s) {
      var xdr;
      if (s.crossDomain && s.async && s.firehose) {
        if (s.timeout) {
          s.xdrTimeout = s.timeout;
          delete s.timeout;
        }
        xdr = void 0;
        return {
          send: function(_, complete) {
            var callback;
            callback = function(status, statusText, responses, responseHeaders) {
              xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
              xdr = void 0;
              return complete(status, statusText, responses, responseHeaders);
            };
            xdr = new XDomainRequest();
            xdr.open(s.type, s.url);
            xdr.onload = function() {
              var headers;
              headers = "Content-Type: " + xdr.contentType;
              return callback(200, "OK", {
                text: xdr.responseText
              }, headers);
            };
            xdr.onerror = function() {
              return callback(404, "Not Found");
            };
            if (s.xdrTimeout != null) {
              xdr.ontimeout = function() {
                return callback(0, "timeout");
              };
              xdr.timeout = s.xdrTimeout;
            }
            return xdr.send((s.hasContent && s.data) || null);
          },
          abort: function() {
            if (xdr != null) {
              xdr.onerror = jQuery.noop();
              return xdr.abort();
            }
          }
        };
      }
    });
  }

}).call(this);
(function() {
  var INITIAL_PING_TIMEOUT, KEEPALIVE_PING_TIMEOUT, isPong, sendPing,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  INITIAL_PING_TIMEOUT = 2000;

  KEEPALIVE_PING_TIMEOUT = 20000;

  Firehose.WebSocket = (function(_super) {
    __extends(WebSocket, _super);

    WebSocket.prototype.name = function() {
      return 'WebSocket';
    };

    WebSocket.ieSupported = function() {
      return (document.documentMode || 10) > 9;
    };

    WebSocket.supported = function() {
      return window.WebSocket != null;
    };

    function WebSocket(args) {
      this._clearKeepalive = __bind(this._clearKeepalive, this);
      this._restartKeepAlive = __bind(this._restartKeepAlive, this);
      this._cleanUp = __bind(this._cleanUp, this);
      this._error = __bind(this._error, this);
      this._close = __bind(this._close, this);
      this._message = __bind(this._message, this);
      this.stop = __bind(this.stop, this);
      this.sendStartingMessageSequence = __bind(this.sendStartingMessageSequence, this);
      this._lookForInitialPong = __bind(this._lookForInitialPong, this);
      this._open = __bind(this._open, this);
      this._protocol = __bind(this._protocol, this);
      this._request = __bind(this._request, this);
      var _base;
      WebSocket.__super__.constructor.call(this, args);
      (_base = this.config).webSocket || (_base.webSocket = {});
      this.config.webSocket.connectionVerified = this.config.connectionVerified;
    }

    WebSocket.prototype._request = function() {
      var err;
      try {
        this.socket = new window.WebSocket("" + (this._protocol()) + ":" + this.config.uri + "?" + ($.param(this.config.params)));
        this.socket.onopen = this._open;
        this.socket.onclose = this._close;
        this.socket.onerror = this._error;
        return this.socket.onmessage = this._lookForInitialPong;
      } catch (_error) {
        err = _error;
        return typeof console !== "undefined" && console !== null ? console.log(err) : void 0;
      }
    };

    WebSocket.prototype._protocol = function() {
      if (this.config.ssl) {
        return "wss";
      } else {
        return "ws";
      }
    };

    WebSocket.prototype._open = function() {
      return sendPing(this.socket);
    };

    WebSocket.prototype._lookForInitialPong = function(event) {
      var e;
      this._restartKeepAlive();
      if (isPong((function() {
        try {
          return JSON.parse(event.data);
        } catch (_error) {
          e = _error;
          return {};
        }
      })())) {
        if (this._lastMessageSequence != null) {
          return this.sendStartingMessageSequence(this._lastMessageSequence);
        } else {
          return this.config.webSocket.connectionVerified(this);
        }
      }
    };

    WebSocket.prototype.sendStartingMessageSequence = function(message_sequence) {
      this._lastMessageSequence = message_sequence;
      this.socket.onmessage = this._message;
      this.socket.send(JSON.stringify({
        message_sequence: message_sequence
      }));
      this._needToNotifyOfDisconnect = true;
      return Firehose.Transport.prototype._open.call(this);
    };

    WebSocket.prototype.stop = function() {
      return this._cleanUp();
    };

    WebSocket.prototype._message = function(event) {
      var e, frame;
      frame = this.config.parse(event.data);
      this._restartKeepAlive();
      if (!isPong(frame)) {
        try {
          this._lastMessageSequence = frame.last_sequence;
          return this.config.message(this.config.parse(frame.message));
        } catch (_error) {
          e = _error;
        }
      }
    };

    WebSocket.prototype._close = function(event) {
      if (event != null ? event.wasClean : void 0) {
        return this._cleanUp();
      } else {
        return this._error(event);
      }
    };

    WebSocket.prototype._error = function(event) {
      this._cleanUp();
      if (this._needToNotifyOfDisconnect) {
        this._needToNotifyOfDisconnect = false;
        this.config.disconnected();
      }
      if (this._succeeded) {
        return this.connect(this._retryDelay);
      } else {
        return this.config.failed(this);
      }
    };

    WebSocket.prototype._cleanUp = function() {
      this._clearKeepalive();
      if (this.socket != null) {
        this.socket.onopen = null;
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.onmessage = null;
        this.socket.close();
        return delete this.socket;
      }
    };

    WebSocket.prototype._restartKeepAlive = function() {
      var doPing, setNextKeepAlive;
      doPing = (function(_this) {
        return function() {
          sendPing(_this.socket);
          return setNextKeepAlive();
        };
      })(this);
      setNextKeepAlive = (function(_this) {
        return function() {
          return _this.keepaliveTimeout = setTimeout(doPing, KEEPALIVE_PING_TIMEOUT);
        };
      })(this);
      this._clearKeepalive();
      return setNextKeepAlive();
    };

    WebSocket.prototype._clearKeepalive = function() {
      if (this.keepaliveTimeout != null) {
        clearTimeout(this.keepaliveTimeout);
        return this.keepaliveTimeout = null;
      }
    };

    return WebSocket;

  })(Firehose.Transport);

  sendPing = function(socket) {
    return socket.send(JSON.stringify({
      ping: 'PING'
    }));
  };

  isPong = function(o) {
    return o.pong === 'PONG';
  };

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Firehose.Consumer = (function() {
    function Consumer(config) {
      var _base, _base1, _base2, _base3, _base4, _base5, _base6;
      this.config = config != null ? config : {};
      this._upgradeTransport = __bind(this._upgradeTransport, this);
      this.stop = __bind(this.stop, this);
      this.connect = __bind(this.connect, this);
      (_base = this.config).message || (_base.message = function() {});
      (_base1 = this.config).error || (_base1.error = function() {});
      (_base2 = this.config).connected || (_base2.connected = function() {});
      (_base3 = this.config).disconnected || (_base3.disconnected = function() {});
      (_base4 = this.config).failed || (_base4.failed = function() {
        throw "Could not connect";
      });
      (_base5 = this.config).params || (_base5.params = {});
      (_base6 = this.config).parse || (_base6.parse = JSON.parse);
      this;
    }

    Consumer.prototype.connect = function(delay) {
      if (delay == null) {
        delay = 0;
      }
      this.config.connectionVerified = this._upgradeTransport;
      if (Firehose.WebSocket.supported()) {
        this.upgradeTimeout = setTimeout((function(_this) {
          return function() {
            var ws;
            ws = new Firehose.WebSocket(_this.config);
            return ws.connect(delay);
          };
        })(this), 500);
      }
      this.transport = new Firehose.LongPoll(this.config);
      this.transport.connect(delay);
    };

    Consumer.prototype.stop = function() {
      if (this.upgradeTimeout != null) {
        clearTimeout(this.upgradeTimeout);
        this.upgradeTimeout = null;
      }
      this.transport.stop();
    };

    Consumer.prototype._upgradeTransport = function(ws) {
      this.transport.stop();
      ws.sendStartingMessageSequence(this.transport.getLastMessageSequence());
      this.transport = ws;
    };

    return Consumer;

  })();

}).call(this);
/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
(function() {


}).call(this);
