!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t():"function"==typeof define&&define.amd?define(t):t()}(0,function(){function e(e){var t=this.constructor;return this.then(function(n){return t.resolve(e()).then(function(){return n})},function(n){return t.resolve(e()).then(function(){return t.reject(n)})})}function t(e){return new this(function(t,n){function r(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var f=n.then;if("function"==typeof f)return void f.call(n,function(t){r(e,t)},function(n){o[e]={status:"rejected",reason:n},0==--i&&t(o)})}o[e]={status:"fulfilled",value:n},0==--i&&t(o)}if(!e||"undefined"==typeof e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var o=Array.prototype.slice.call(e);if(0===o.length)return t([]);for(var i=o.length,f=0;o.length>f;f++)r(f,o[f])})}function n(e,t){this.name="AggregateError",this.errors=e,this.message=t||""}function r(e){var t=this;return new t(function(r,o){if(!e||"undefined"==typeof e.length)return o(new TypeError("Promise.any accepts an array"));var i=Array.prototype.slice.call(e);if(0===i.length)return o();for(var f=[],u=0;i.length>u;u++)try{t.resolve(i[u]).then(r)["catch"](function(e){f.push(e),f.length===i.length&&o(new n(f,"All promises were rejected"))})}catch(c){o(c)}})}function o(e){return!(!e||"undefined"==typeof e.length)}function i(){}function f(e){if(!(this instanceof f))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=undefined,this._deferreds=[],s(e,this)}function u(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,f._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value)}catch(o){return void a(t.promise,o)}c(t.promise,r)}else(1===e._state?c:a)(t.promise,e._value)})):e._deferreds.push(t)}function c(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof f)return e._state=3,e._value=t,void l(e);if("function"==typeof n)return void s(function(e,t){return function(){e.apply(t,arguments)}}(n,t),e)}e._state=1,e._value=t,l(e)}catch(r){a(e,r)}}function a(e,t){e._state=2,e._value=t,l(e)}function l(e){2===e._state&&0===e._deferreds.length&&f._immediateFn(function(){e._handled||f._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;n>t;t++)u(e,e._deferreds[t]);e._deferreds=null}function s(e,t){var n=!1;try{e(function(e){n||(n=!0,c(t,e))},function(e){n||(n=!0,a(t,e))})}catch(r){if(n)return;n=!0,a(t,r)}}n.prototype=Error.prototype;var d=setTimeout;f.prototype["catch"]=function(e){return this.then(null,e)},f.prototype.then=function(e,t){var n=new this.constructor(i);return u(this,new function(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}(e,t,n)),n},f.prototype["finally"]=e,f.all=function(e){return new f(function(t,n){function r(e,o){try{if(o&&("object"==typeof o||"function"==typeof o)){var u=o.then;if("function"==typeof u)return void u.call(o,function(t){r(e,t)},n)}i[e]=o,0==--f&&t(i)}catch(c){n(c)}}if(!o(e))return n(new TypeError("Promise.all accepts an array"));var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);for(var f=i.length,u=0;i.length>u;u++)r(u,i[u])})},f.any=r,f.allSettled=t,f.resolve=function(e){return e&&"object"==typeof e&&e.constructor===f?e:new f(function(t){t(e)})},f.reject=function(e){return new f(function(t,n){n(e)})},f.race=function(e){return new f(function(t,n){if(!o(e))return n(new TypeError("Promise.race accepts an array"));for(var r=0,i=e.length;i>r;r++)f.resolve(e[r]).then(t,n)})},f._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){d(e,0)},f._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var p=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw Error("unable to locate global object")}();"function"!=typeof p.Promise?p.Promise=f:(p.Promise.prototype["finally"]||(p.Promise.prototype["finally"]=e),p.Promise.allSettled||(p.Promise.allSettled=t),p.Promise.any||(p.Promise.any=r))});var WConverwsClient=function(t){function e(){return"undefined"!=typeof window&&void 0!==window.document}function r(t){let e=Object.prototype.toString.call(t);return"[object Function]"===e||"[object AsyncFunction]"===e}function n(n){let o=null;n.url||(n.url="ws://localhost:8080"),n.token||(n.token="*");let i,u=function(){let t=e(),r="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope;return t=t||r,{isBrowser:t,isWebWorker:r,isNode:"undefined"!=typeof process&&null!=process.versions&&null!=process.versions.node}}().isBrowser;i=u?("undefined"!=typeof self?self:e()?window:"undefined"!=typeof global?global:null).WebSocket:t;try{o=new i(n.url+"/?token="+n.token)}catch(t){o=null}if(null===o)return{error:"can not new MixWS"};function a(){r(n.open)&&n.open()}function c(){r(n.close)&&n.close()}function f(t){r(n.message)&&n.message(t)}function s(t){r(n.error)&&n.error(t),o.close()}return u?(o.onopen=a,o.onmessage=function(t){f(t.data)},o.onclose=c,o.onerror=s):(o.on("open",a),o.on("message",f),o.on("close",c),o.on("error",s)),o}var o="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function i(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function u(t){if(t.__esModule)return t;var e=t.default;if("function"==typeof e){var r=function t(){if(this instanceof t){var r=[null];return r.push.apply(r,arguments),new(Function.bind.apply(e,r))}return e.apply(this,arguments)};r.prototype=e.prototype}else r={};return Object.defineProperty(r,"__esModule",{value:!0}),Object.keys(t).forEach((function(e){var n=Object.getOwnPropertyDescriptor(t,e);Object.defineProperty(r,e,n.get?n:{enumerable:!0,get:function(){return t[e]}})})),r}var a=Array.isArray,c="object"==typeof o&&o&&o.Object===Object&&o,f=c,s="object"==typeof self&&self&&self.Object===Object&&self,l=f||s||Function("return this")(),p=l.Symbol,v=p,h=Object.prototype,y=h.hasOwnProperty,d=h.toString,g=v?v.toStringTag:void 0;var b=function(t){var e=y.call(t,g),r=t[g];try{t[g]=void 0;var n=!0}catch(t){}var o=d.call(t);return n&&(e?t[g]=r:delete t[g]),o},_=Object.prototype.toString;var w=b,j=function(t){return _.call(t)},m=p?p.toStringTag:void 0;var A=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":m&&m in Object(t)?w(t):j(t)};var x=function(t){return null!=t&&"object"==typeof t},O=A,S=x;var U=function(t){return"symbol"==typeof t||S(t)&&"[object Symbol]"==O(t)},B=a,k=U,C=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,P=/^\w*$/;var E=function(t,e){if(B(t))return!1;var r=typeof t;return!("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!k(t))||(P.test(t)||!C.test(t)||null!=e&&t in Object(e))};var z=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)},M=A,T=z;var L,F=function(t){if(!T(t))return!1;var e=M(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e},I=l["__core-js_shared__"],$=(L=/[^.]+$/.exec(I&&I.keys&&I.keys.IE_PROTO||""))?"Symbol(src)_1."+L:"";var N=function(t){return!!$&&$ in t},W=Function.prototype.toString;var R=F,D=N,H=z,G=function(t){if(null!=t){try{return W.call(t)}catch(t){}try{return t+""}catch(t){}}return""},V=/^\[object .+?Constructor\]$/,q=Function.prototype,J=Object.prototype,K=q.toString,Q=J.hasOwnProperty,X=RegExp("^"+K.call(Q).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Y=function(t){return!(!H(t)||D(t))&&(R(t)?X:V).test(G(t))},Z=function(t,e){return null==t?void 0:t[e]};var tt=function(t,e){var r=Z(t,e);return Y(r)?r:void 0},et=tt(Object,"create"),rt=et;var nt=function(){this.__data__=rt?rt(null):{},this.size=0};var ot=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},it=et,ut=Object.prototype.hasOwnProperty;var at=function(t){var e=this.__data__;if(it){var r=e[t];return"__lodash_hash_undefined__"===r?void 0:r}return ut.call(e,t)?e[t]:void 0},ct=et,ft=Object.prototype.hasOwnProperty;var st=et;var lt=nt,pt=ot,vt=at,ht=function(t){var e=this.__data__;return ct?void 0!==e[t]:ft.call(e,t)},yt=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=st&&void 0===e?"__lodash_hash_undefined__":e,this};function dt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}dt.prototype.clear=lt,dt.prototype.delete=pt,dt.prototype.get=vt,dt.prototype.has=ht,dt.prototype.set=yt;var gt=dt;var bt=function(){this.__data__=[],this.size=0};var _t=function(t,e){return t===e||t!=t&&e!=e},wt=_t;var jt=function(t,e){for(var r=t.length;r--;)if(wt(t[r][0],e))return r;return-1},mt=jt,At=Array.prototype.splice;var xt=jt;var Ot=jt;var St=jt;var Ut=bt,Bt=function(t){var e=this.__data__,r=mt(e,t);return!(r<0)&&(r==e.length-1?e.pop():At.call(e,r,1),--this.size,!0)},kt=function(t){var e=this.__data__,r=xt(e,t);return r<0?void 0:e[r][1]},Ct=function(t){return Ot(this.__data__,t)>-1},Pt=function(t,e){var r=this.__data__,n=St(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this};function Et(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}Et.prototype.clear=Ut,Et.prototype.delete=Bt,Et.prototype.get=kt,Et.prototype.has=Ct,Et.prototype.set=Pt;var zt=Et,Mt=tt(l,"Map"),Tt=gt,Lt=zt,Ft=Mt;var It=function(t){var e=typeof t;return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t};var $t=function(t,e){var r=t.__data__;return It(e)?r["string"==typeof e?"string":"hash"]:r.map},Nt=$t;var Wt=$t;var Rt=$t;var Dt=$t;var Ht=function(){this.size=0,this.__data__={hash:new Tt,map:new(Ft||Lt),string:new Tt}},Gt=function(t){var e=Nt(this,t).delete(t);return this.size-=e?1:0,e},Vt=function(t){return Wt(this,t).get(t)},qt=function(t){return Rt(this,t).has(t)},Jt=function(t,e){var r=Dt(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this};function Kt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}Kt.prototype.clear=Ht,Kt.prototype.delete=Gt,Kt.prototype.get=Vt,Kt.prototype.has=qt,Kt.prototype.set=Jt;var Qt=Kt;function Xt(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError("Expected a function");var r=function(){var n=arguments,o=e?e.apply(this,n):n[0],i=r.cache;if(i.has(o))return i.get(o);var u=t.apply(this,n);return r.cache=i.set(o,u)||i,u};return r.cache=new(Xt.Cache||Qt),r}Xt.Cache=Qt;var Yt=Xt;var Zt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,te=/\\(\\)?/g,ee=function(t){var e=Yt(t,(function(t){return 500===r.size&&r.clear(),t})),r=e.cache;return e}((function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(Zt,(function(t,r,n,o){e.push(n?o.replace(te,"$1"):r||t)})),e}));var re=function(t,e){for(var r=-1,n=null==t?0:t.length,o=Array(n);++r<n;)o[r]=e(t[r],r,t);return o},ne=a,oe=U,ie=p?p.prototype:void 0,ue=ie?ie.toString:void 0;var ae=function t(e){if("string"==typeof e)return e;if(ne(e))return re(e,t)+"";if(oe(e))return ue?ue.call(e):"";var r=e+"";return"0"==r&&1/e==-Infinity?"-0":r},ce=ae;var fe=function(t){return null==t?"":ce(t)},se=a,le=E,pe=ee,ve=fe;var he=U;var ye=function(t,e){return se(t)?t:le(t,e)?[t]:pe(ve(t))},de=function(t){if("string"==typeof t||he(t))return t;var e=t+"";return"0"==e&&1/t==-Infinity?"-0":e};var ge=function(t,e){for(var r=0,n=(e=ye(e,t)).length;null!=t&&r<n;)t=t[de(e[r++])];return r&&r==n?t:void 0};var be=function(t,e,r){var n=null==t?void 0:ge(t,e);return void 0===n?r:n};var _e=/\s/;var we=function(t){for(var e=t.length;e--&&_e.test(t.charAt(e)););return e},je=/^\s+/;var me=function(t){return t?t.slice(0,we(t)+1).replace(je,""):t},Ae=z,xe=U,Oe=/^[-+]0x[0-9a-f]+$/i,Se=/^0b[01]+$/i,Ue=/^0o[0-7]+$/i,Be=parseInt;var ke=function(t){if("number"==typeof t)return t;if(xe(t))return NaN;if(Ae(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=Ae(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=me(t);var r=Se.test(t);return r||Ue.test(t)?Be(t.slice(2),r?2:8):Oe.test(t)?NaN:+t},Ce=ke,Pe=1/0;var Ee=function(t){return t?(t=Ce(t))===Pe||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0},ze=Ee;var Me=function(t){var e=ze(t),r=e%1;return e==e?r?e-r:e:0},Te=Me;var Le=function(t){return"number"==typeof t&&t==Te(t)};function Fe(t){return"[object String]"===Object.prototype.toString.call(t)}function Ie(t){return!(!Fe(t)||""===t)}function $e(t){let e=!1;return Ie(t)?e=!isNaN(Number(t)):function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)&&(e=!0),e}function Ne(t){if(!$e(t))return 0;return Ee(t)}function We(t){return!!$e(t)&&(t=Ne(t),Le(t))}var Re=Me,De=ke,He=fe,Ge=l.isFinite,Ve=Math.min;var qe=function(t){var e=Math[t];return function(t,r){if(t=De(t),(r=null==r?0:Ve(Re(r),292))&&Ge(t)){var n=(He(t)+"e").split("e"),o=e(n[0]+"e"+(+n[1]+r));return+((n=(He(o)+"e").split("e"))[0]+"e"+(+n[1]-r))}return e(t)}}("round");function Je(t){if(!$e(t))return 0;t=Ne(t);let e=qe(t);return"0"===String(e)?0:e}let Ke="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),Qe=Ke.length;function Xe(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,e=[];var r;t=We(r=t)&&Je(r)>0?Je(t):32;for(let r=0;r<t;r++)e[r]=Ke[0|Math.random()*Qe];return e.join("")}var Ye={};!function(t){var e=Object.prototype.hasOwnProperty,r="~";function n(){}function o(t,e,r){this.fn=t,this.context=e,this.once=r||!1}function i(t,e,n,i,u){if("function"!=typeof n)throw new TypeError("The listener must be a function");var a=new o(n,i||t,u),c=r?r+e:e;return t._events[c]?t._events[c].fn?t._events[c]=[t._events[c],a]:t._events[c].push(a):(t._events[c]=a,t._eventsCount++),t}function u(t,e){0==--t._eventsCount?t._events=new n:delete t._events[e]}function a(){this._events=new n,this._eventsCount=0}Object.create&&(n.prototype=Object.create(null),(new n).__proto__||(r=!1)),a.prototype.eventNames=function(){var t,n,o=[];if(0===this._eventsCount)return o;for(n in t=this._events)e.call(t,n)&&o.push(r?n.slice(1):n);return Object.getOwnPropertySymbols?o.concat(Object.getOwnPropertySymbols(t)):o},a.prototype.listeners=function(t){var e=r?r+t:t,n=this._events[e];if(!n)return[];if(n.fn)return[n.fn];for(var o=0,i=n.length,u=new Array(i);o<i;o++)u[o]=n[o].fn;return u},a.prototype.listenerCount=function(t){var e=r?r+t:t,n=this._events[e];return n?n.fn?1:n.length:0},a.prototype.emit=function(t,e,n,o,i,u){var a=r?r+t:t;if(!this._events[a])return!1;var c,f,s=this._events[a],l=arguments.length;if(s.fn){switch(s.once&&this.removeListener(t,s.fn,void 0,!0),l){case 1:return s.fn.call(s.context),!0;case 2:return s.fn.call(s.context,e),!0;case 3:return s.fn.call(s.context,e,n),!0;case 4:return s.fn.call(s.context,e,n,o),!0;case 5:return s.fn.call(s.context,e,n,o,i),!0;case 6:return s.fn.call(s.context,e,n,o,i,u),!0}for(f=1,c=new Array(l-1);f<l;f++)c[f-1]=arguments[f];s.fn.apply(s.context,c)}else{var p,v=s.length;for(f=0;f<v;f++)switch(s[f].once&&this.removeListener(t,s[f].fn,void 0,!0),l){case 1:s[f].fn.call(s[f].context);break;case 2:s[f].fn.call(s[f].context,e);break;case 3:s[f].fn.call(s[f].context,e,n);break;case 4:s[f].fn.call(s[f].context,e,n,o);break;default:if(!c)for(p=1,c=new Array(l-1);p<l;p++)c[p-1]=arguments[p];s[f].fn.apply(s[f].context,c)}}return!0},a.prototype.on=function(t,e,r){return i(this,t,e,r,!1)},a.prototype.once=function(t,e,r){return i(this,t,e,r,!0)},a.prototype.removeListener=function(t,e,n,o){var i=r?r+t:t;if(!this._events[i])return this;if(!e)return u(this,i),this;var a=this._events[i];if(a.fn)a.fn!==e||o&&!a.once||n&&a.context!==n||u(this,i);else{for(var c=0,f=[],s=a.length;c<s;c++)(a[c].fn!==e||o&&!a[c].once||n&&a[c].context!==n)&&f.push(a[c]);f.length?this._events[i]=1===f.length?f[0]:f:u(this,i)}return this},a.prototype.removeAllListeners=function(t){var e;return t?(e=r?r+t:t,this._events[e]&&u(this,e)):(this._events=new n,this._eventsCount=0),this},a.prototype.off=a.prototype.removeListener,a.prototype.addListener=a.prototype.on,a.prefixed=r,a.EventEmitter=a,t.exports=a}({get exports(){return Ye},set exports(t){Ye=t}});var Ze=Ye;function tr(){return new Ze}var er=function(t,e,r){var n=-1,o=t.length;e<0&&(e=-e>o?0:o+e),(r=r>o?o:r)<0&&(r+=o),o=e>r?0:r-e>>>0,e>>>=0;for(var i=Array(o);++n<o;)i[n]=t[n+e];return i};var rr=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991},nr=F,or=rr;var ir=function(t){return null!=t&&or(t.length)&&!nr(t)},ur=/^(?:0|[1-9]\d*)$/;var ar=function(t,e){var r=typeof t;return!!(e=null==e?9007199254740991:e)&&("number"==r||"symbol"!=r&&ur.test(t))&&t>-1&&t%1==0&&t<e},cr=_t,fr=ir,sr=ar,lr=z;var pr=function(t,e,r){if(!lr(r))return!1;var n=typeof e;return!!("number"==n?fr(r)&&sr(e,r.length):"string"==n&&e in r)&&cr(r[e],t)},vr=er,hr=pr,yr=Me,dr=Math.ceil,gr=Math.max;var br=function(t,e,r){e=(r?hr(t,e,r):void 0===e)?1:gr(yr(e),0);var n=null==t?0:t.length;if(!n||e<1)return[];for(var o=0,i=0,u=Array(dr(n/e));o<n;)u[i++]=vr(t,o,o+=e);return u},_r=Array.prototype.join;var wr=function(t,e){return null==t?"":_r.call(t,e)},jr={},mr={get exports(){return jr},set exports(t){jr=t}};var Ar=function(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r,t););return t};var xr=function(t){return function(e,r,n){for(var o=-1,i=Object(e),u=n(e),a=u.length;a--;){var c=u[t?a:++o];if(!1===r(i[c],c,i))break}return e}}();var Or=function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n},Sr=A,Ur=x;var Br=function(t){return Ur(t)&&"[object Arguments]"==Sr(t)},kr=x,Cr=Object.prototype,Pr=Cr.hasOwnProperty,Er=Cr.propertyIsEnumerable,zr=Br(function(){return arguments}())?Br:function(t){return kr(t)&&Pr.call(t,"callee")&&!Er.call(t,"callee")},Mr=zr,Tr={};var Lr=function(){return!1};!function(t,e){var r=l,n=Lr,o=e&&!e.nodeType&&e,i=o&&t&&!t.nodeType&&t,u=i&&i.exports===o?r.Buffer:void 0,a=(u?u.isBuffer:void 0)||n;t.exports=a}({get exports(){return Tr},set exports(t){Tr=t}},Tr);var Fr=A,Ir=rr,$r=x,Nr={};Nr["[object Float32Array]"]=Nr["[object Float64Array]"]=Nr["[object Int8Array]"]=Nr["[object Int16Array]"]=Nr["[object Int32Array]"]=Nr["[object Uint8Array]"]=Nr["[object Uint8ClampedArray]"]=Nr["[object Uint16Array]"]=Nr["[object Uint32Array]"]=!0,Nr["[object Arguments]"]=Nr["[object Array]"]=Nr["[object ArrayBuffer]"]=Nr["[object Boolean]"]=Nr["[object DataView]"]=Nr["[object Date]"]=Nr["[object Error]"]=Nr["[object Function]"]=Nr["[object Map]"]=Nr["[object Number]"]=Nr["[object Object]"]=Nr["[object RegExp]"]=Nr["[object Set]"]=Nr["[object String]"]=Nr["[object WeakMap]"]=!1;var Wr=function(t){return $r(t)&&Ir(t.length)&&!!Nr[Fr(t)]};var Rr=function(t){return function(e){return t(e)}},Dr={};!function(t,e){var r=c,n=e&&!e.nodeType&&e,o=n&&t&&!t.nodeType&&t,i=o&&o.exports===n&&r.process,u=function(){try{var t=o&&o.require&&o.require("util").types;return t||i&&i.binding&&i.binding("util")}catch(t){}}();t.exports=u}({get exports(){return Dr},set exports(t){Dr=t}},Dr);var Hr=Wr,Gr=Rr,Vr=Dr&&Dr.isTypedArray,qr=Vr?Gr(Vr):Hr,Jr=Or,Kr=Mr,Qr=a,Xr=Tr,Yr=ar,Zr=qr,tn=Object.prototype.hasOwnProperty;var en=function(t,e){var r=Qr(t),n=!r&&Kr(t),o=!r&&!n&&Xr(t),i=!r&&!n&&!o&&Zr(t),u=r||n||o||i,a=u?Jr(t.length,String):[],c=a.length;for(var f in t)!e&&!tn.call(t,f)||u&&("length"==f||o&&("offset"==f||"parent"==f)||i&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||Yr(f,c))||a.push(f);return a},rn=Object.prototype;var nn=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||rn)};var on=function(t,e){return function(r){return t(e(r))}}(Object.keys,Object),un=nn,an=on,cn=Object.prototype.hasOwnProperty;var fn=en,sn=function(t){if(!un(t))return an(t);var e=[];for(var r in Object(t))cn.call(t,r)&&"constructor"!=r&&e.push(r);return e},ln=ir;var pn=xr,vn=function(t){return ln(t)?fn(t):sn(t)};var hn=ir;var yn=function(t,e){return function(r,n){if(null==r)return r;if(!hn(r))return t(r,n);for(var o=r.length,i=e?o:-1,u=Object(r);(e?i--:++i<o)&&!1!==n(u[i],i,u););return r}}((function(t,e){return t&&pn(t,e,vn)}));var dn=function(t){return t};var gn=Ar,bn=yn,_n=function(t){return"function"==typeof t?t:dn},wn=a;var jn=function(t,e){return(wn(t)?gn:bn)(t,_n(e))};mr.exports=jn;var mn=i(jr);function An(t){return"[object Uint8Array]"===Object.prototype.toString.call(t)}function xn(t){return"[object Uint16Array]"===Object.prototype.toString.call(t)}function On(t){if(!We(t))return!1;return Je(t)>=0}function Sn(t,e){return Ie(t)&&On(e)?0===(e=Je(e))?"":t.substring(0,e):""}function Un(t,e){return Ie(t)&&On(e)?0===(e=Je(e))?t:function(t,e){if(!Ie(t))return"";if(!On(e))return"";if(0===(e=Je(e)))return"";let r=t.length-e;return r<0&&(r=0),t.substr(r,e)}(t,t.length-e):""}var Bn={},kn={get exports(){return Bn},set exports(t){Bn=t}};var Cn,Pn={},En={get exports(){return Pn},set exports(t){Pn=t}},zn=u(Object.freeze({__proto__:null,default:{}}));function Mn(){return Cn||(Cn=1,function(t,e){var r;t.exports=(r=r||function(t,e){var r;if("undefined"!=typeof window&&window.crypto&&(r=window.crypto),"undefined"!=typeof self&&self.crypto&&(r=self.crypto),"undefined"!=typeof globalThis&&globalThis.crypto&&(r=globalThis.crypto),!r&&"undefined"!=typeof window&&window.msCrypto&&(r=window.msCrypto),!r&&void 0!==o&&o.crypto&&(r=o.crypto),!r)try{r=zn}catch(t){}var n=function(){if(r){if("function"==typeof r.getRandomValues)try{return r.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof r.randomBytes)try{return r.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")},i=Object.create||function(){function t(){}return function(e){var r;return t.prototype=e,r=new t,t.prototype=null,r}}(),u={},a=u.lib={},c=a.Base={extend:function(t){var e=i(this);return t&&e.mixIn(t),e.hasOwnProperty("init")&&this.init!==e.init||(e.init=function(){e.$super.init.apply(this,arguments)}),e.init.prototype=e,e.$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},f=a.WordArray=c.extend({init:function(t,r){t=this.words=t||[],this.sigBytes=r!=e?r:4*t.length},toString:function(t){return(t||l).stringify(this)},concat:function(t){var e=this.words,r=t.words,n=this.sigBytes,o=t.sigBytes;if(this.clamp(),n%4)for(var i=0;i<o;i++){var u=r[i>>>2]>>>24-i%4*8&255;e[n+i>>>2]|=u<<24-(n+i)%4*8}else for(var a=0;a<o;a+=4)e[n+a>>>2]=r[a>>>2];return this.sigBytes+=o,this},clamp:function(){var e=this.words,r=this.sigBytes;e[r>>>2]&=4294967295<<32-r%4*8,e.length=t.ceil(r/4)},clone:function(){var t=c.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var e=[],r=0;r<t;r+=4)e.push(n());return new f.init(e,t)}}),s=u.enc={},l=s.Hex={stringify:function(t){for(var e=t.words,r=t.sigBytes,n=[],o=0;o<r;o++){var i=e[o>>>2]>>>24-o%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(t){for(var e=t.length,r=[],n=0;n<e;n+=2)r[n>>>3]|=parseInt(t.substr(n,2),16)<<24-n%8*4;return new f.init(r,e/2)}},p=s.Latin1={stringify:function(t){for(var e=t.words,r=t.sigBytes,n=[],o=0;o<r;o++){var i=e[o>>>2]>>>24-o%4*8&255;n.push(String.fromCharCode(i))}return n.join("")},parse:function(t){for(var e=t.length,r=[],n=0;n<e;n++)r[n>>>2]|=(255&t.charCodeAt(n))<<24-n%4*8;return new f.init(r,e)}},v=s.Utf8={stringify:function(t){try{return decodeURIComponent(escape(p.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return p.parse(unescape(encodeURIComponent(t)))}},h=a.BufferedBlockAlgorithm=c.extend({reset:function(){this._data=new f.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=v.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(e){var r,n=this._data,o=n.words,i=n.sigBytes,u=this.blockSize,a=i/(4*u),c=(a=e?t.ceil(a):t.max((0|a)-this._minBufferSize,0))*u,s=t.min(4*c,i);if(c){for(var l=0;l<c;l+=u)this._doProcessBlock(o,l);r=o.splice(0,c),n.sigBytes-=s}return new f.init(r,s)},clone:function(){var t=c.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0});a.Hasher=h.extend({cfg:c.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(e,r){return new t.init(r).finalize(e)}},_createHmacHelper:function(t){return function(e,r){return new y.HMAC.init(t,r).finalize(e)}}});var y=u.algo={};return u}(Math),r)}(En)),Pn}!function(t,e){var r;t.exports=(r=Mn(),function(){var t=r,e=t.lib.WordArray;function n(t,r,n){for(var o=[],i=0,u=0;u<r;u++)if(u%4){var a=n[t.charCodeAt(u-1)]<<u%4*2|n[t.charCodeAt(u)]>>>6-u%4*2;o[i>>>2]|=a<<24-i%4*8,i++}return e.create(o,i)}t.enc.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,n=this._map;t.clamp();for(var o=[],i=0;i<r;i+=3)for(var u=(e[i>>>2]>>>24-i%4*8&255)<<16|(e[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|e[i+2>>>2]>>>24-(i+2)%4*8&255,a=0;a<4&&i+.75*a<r;a++)o.push(n.charAt(u>>>6*(3-a)&63));var c=n.charAt(64);if(c)for(;o.length%4;)o.push(c);return o.join("")},parse:function(t){var e=t.length,r=this._map,o=this._reverseMap;if(!o){o=this._reverseMap=[];for(var i=0;i<r.length;i++)o[r.charCodeAt(i)]=i}var u=r.charAt(64);if(u){var a=t.indexOf(u);-1!==a&&(e=a)}return n(t,e,o)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),r.enc.Base64)}(kn);var Tn=Bn,Ln={};!function(t,e){var r;t.exports=(r=Mn(),function(){if("function"==typeof ArrayBuffer){var t=r.lib.WordArray,e=t.init,n=t.init=function(t){if(t instanceof ArrayBuffer&&(t=new Uint8Array(t)),(t instanceof Int8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array)&&(t=new Uint8Array(t.buffer,t.byteOffset,t.byteLength)),t instanceof Uint8Array){for(var r=t.byteLength,n=[],o=0;o<r;o++)n[o>>>2]|=t[o]<<24-o%4*8;e.call(this,n,r)}else e.apply(this,arguments)};n.prototype=t}}(),r.lib.WordArray)}({get exports(){return Ln},set exports(t){Ln=t}});var Fn=Ln;function In(t){if(!An(t))return"";return Fn.create(t).toString(Tn)}function $n(t){if(!Fe(t))return new Uint8Array;let e=Tn.parse(t),r=e.words,n=e.sigBytes,o=new Uint8Array(n);for(let t=0;t<n;t++){let e=r[t>>>2]>>>24-t%4*8&255;o[t]=e}return o}function Nn(t){return xn(t)?In(function(t){return xn(t)?new Uint8Array(t):new Uint8Array}(t)):""}function Wn(t){if(!Fe(t))return new Uint16Array;let e=function(t){return An(t)?new Uint16Array(t):new Uint16Array}($n(t));return e}let Rn="[Uint8Array]::";let Dn="[Uint16Array]::";let Hn={tagU8A:Rn,u8arr2b64:function(t){return An(t)?Rn+In(t):t},b642u8arr:function(t){return Fe(t)&&Sn(t,Rn.length)===Rn?$n(t=Un(t,Rn.length)):t},tagU16A:Dn,u16arr2b64:function(t){return xn(t)?Dn+Nn(t):t},b642u16arr:function(t){return Fe(t)&&Sn(t,Dn.length)===Dn?Wn(t=Un(t,Dn.length)):t}};function Gn(t){return"[object Array]"===Object.prototype.toString.call(t)}function Vn(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Uint8Array";if(r=t,"[object Undefined]"===Object.prototype.toString.call(r))return"";var r;if(Fe(e))e=[e];else if(!Gn(e))return"";let n="";try{n=JSON.stringify(t,(function(t,r){return e.indexOf("Uint8Array")>=0&&(r=Hn.u8arr2b64(r)),e.indexOf("Uint16Array")>=0&&(r=Hn.u16arr2b64(r)),r}))}catch(t){n=""}return n}var qn=er;var Jn=function(t,e,r){var n=t.length;return r=void 0===r?n:r,!e&&r>=n?t:qn(t,e,r)},Kn=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");var Qn=function(t){return Kn.test(t)},Xn=A,Yn=x;var Zn=function(t){return Yn(t)&&"[object RegExp]"==Xn(t)},to=Rr,eo=Dr&&Dr.isRegExp,ro=eo?to(eo):Zn;var no=function(t){return t.split("")},oo="\\ud800-\\udfff",io="["+oo+"]",uo="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",ao="\\ud83c[\\udffb-\\udfff]",co="[^"+oo+"]",fo="(?:\\ud83c[\\udde6-\\uddff]){2}",so="[\\ud800-\\udbff][\\udc00-\\udfff]",lo="(?:"+uo+"|"+ao+")"+"?",po="[\\ufe0e\\ufe0f]?",vo=po+lo+("(?:\\u200d(?:"+[co,fo,so].join("|")+")"+po+lo+")*"),ho="(?:"+[co+uo+"?",uo,fo,so,io].join("|")+")",yo=RegExp(ao+"(?="+ao+")|"+ho+vo,"g");var go=no,bo=Qn,_o=function(t){return t.match(yo)||[]};var wo=ae,jo=Jn,mo=Qn,Ao=pr,xo=ro,Oo=function(t){return bo(t)?_o(t):go(t)},So=fe;var Uo=function(t,e,r){return r&&"number"!=typeof r&&Ao(t,e,r)&&(e=r=void 0),(r=void 0===r?4294967295:r>>>0)?(t=So(t))&&("string"==typeof e||null!=e&&!xo(e))&&!(e=wo(e))&&mo(t)?jo(Oo(t),0,r):t.split(e,r):[]},Bo=er,ko=Me;var Co=function(t,e,r){var n=null==t?0:t.length;return n?(e=r||void 0===e?1:ko(e),Bo(t,e<0?0:e,n)):[]},Po=Math.ceil,Eo=Math.max;var zo=function(t,e,r,n){for(var o=-1,i=Eo(Po((e-t)/(r||1)),0),u=Array(i);i--;)u[n?i:++o]=t,t+=r;return u},Mo=pr,To=Ee;var Lo=function(t){return function(e,r,n){return n&&"number"!=typeof n&&Mo(e,r,n)&&(r=n=void 0),e=To(e),void 0===r?(r=e,e=0):r=To(r),n=void 0===n?e<r?1:-1:To(n),zo(e,r,n,t)}}();function Fo(t,e){return r=t,"[object Object]"===Object.prototype.toString.call(r)&&(!(!Ie(e)&&!$e(e))&&e in t);var r}let Io={};function $o(t,e){let r=Uo(t,"|"),n=r[0],o=ke(r[1]),i=ke(r[2]),u=wr(Co(r,3),"|");if(Fo(Io,n)||(Io[n]={}),Io[n]["_"+o]=u,o===i-1){let t="";mn(Lo(i),(function(e){t+=Io[n]["_"+e]})),delete Io[n];let r=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Uint8Array";if(Fe(e))e=[e];else if(!Gn(e))return{};let r={};try{r=JSON.parse(t,(function(t,r){return e.indexOf("Uint8Array")>=0&&(r=Hn.b642u8arr(r)),e.indexOf("Uint16Array")>=0&&(r=Hn.b642u16arr(r)),r}))}catch(t){r={}}return r}(t);e(r)}}return function(t){let e=!1,r=null,o=new tr,i=new tr;function u(t){for(var e=arguments.length,r=new Array(e>1?e-1:0),n=1;n<e;n++)r[n-1]=arguments[n];setTimeout((()=>{o.emit(t,...r)}),1)}function a(){t.url||(t.url="ws://localhost:8080"),t.token||(t.token="*"),t.strSplitLength||(t.strSplitLength=1e6);let a={url:t.url,token:t.token,open:function(){u("open"),e||(u("openOnce"),e=!0)},close:function(){u("close"),c()},message:function(t){!function(t){$o(t,s)}(t)},error:function(t){f(t)}};try{r=new n(a)}catch(t){return u("error",{msg:"can not create websocket",err:t}),void c()}if(be(r,"error"))return u("error",{msg:"can not create websocket",err:"can not new MixWS in WWebsocketClient"}),void c();function f(t){u("error",{msg:"websocket error",err:t}),r.close()}function s(t){let e=be(t,"_mode","");if("execute"===e)if(be(t,"_id")&&be(t,"output")){let e=be(t,"_id"),r=be(t,"output");i.emit(e,r)}else u("error",{msg:"can not find _id and output in data",err:t});else"broadcast"===e?u("broadcast",be(t,"data")):"deliver"===e?u("deliver",be(t,"data")):f({msg:"can not find _mode in data",err:t})}function l(e,n){r.readyState===r.OPEN&&function(t,e,r,n,o){let i=Vn(r),u=br(i,e),a=Xe(),c=u.length;mn(u,(function(e,r){e=wr(e,"");let i=`${a}|${r}|${c}|${e}`;t.send(i,(function(t){t&&F(o)&&o(t)})),F(n)&&n((r+1)/c*100)}))}(r,t.strSplitLength,e,n,(function(t){u("error",{msg:"can not send message",err:t})}))}o.removeAllListeners("triggerExecute"),o.on("triggerExecute",(function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2?arguments[2]:void 0,n=arguments.length>3?arguments[3]:void 0,o=Xe();l({_mode:"execute",_id:o,func:t,input:e},n),i.on(o,(function(t){r(t),i.removeAllListeners(o)}))})),o.removeAllListeners("triggerBroadcast"),o.on("triggerBroadcast",(function(t,e){l({_mode:"broadcast",data:t},e)})),o.removeAllListeners("triggerDeliver"),o.on("triggerDeliver",(function(t,e){l({_mode:"deliver",data:t},e)}))}function c(){setTimeout((function(){u("reconn"),a()}),1e3)}return o.execute=function(t,e){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){},n=function(){let t,e,r=new Promise((function(){t=arguments[0],e=arguments[1]}));return r.resolve=t,r.reject=e,r}();return u("triggerExecute",t,e,(function(t){n.resolve(t)}),r),n},o.broadcast=function(t){u("triggerBroadcast",t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){})},o.deliver=function(t){u("triggerDeliver",t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){})},a(),o}}();var wo=null,bInit=!1;function init(a){bInit||(wo=new WConverwsClient(a),wo.on("open",function(){sendSystemMessage("open")}),wo.on("openOnce",function(){sendSystemMessage("openOnce"),bInit=!0}),wo.on("close",function(){sendSystemMessage("close")}),wo.on("error",function(a){sendSystemMessage("error",a)}),wo.on("reconn",function(){sendSystemMessage("reconn")}),wo.on("broadcast",function(a){sendSystemMessage("broadcast",a)}),wo.on("deliver",function(a){sendSystemMessage("deliver",a)}))}function sendMessage(a){self.postMessage(a)}function sendSystemMessage(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:null;sendMessage({_id:"system",func:a,data:b})}self.onmessage=function(a){var b=a.data,c=b.type;if("init"===c){var d=b._id,e=b.input;init(e);var f=setInterval(function(){if(bInit){sendMessage({_id:d,output:null}),clearInterval(f)}},10)}else if("execute"===c){var g=b._id,h=b.func,i=b.input;wo.execute(h,i,function(a){sendMessage({_id:g,prog:a})}).then(function(a){sendMessage({_id:g,output:a})})}else if("broadcast"===c||"deliver"===c){var j=b._id,k=b.input;wo[c](k,function(a){sendMessage({_id:j,prog:a})})}else sendSystemMessage("error","type error: ".concat(c))};