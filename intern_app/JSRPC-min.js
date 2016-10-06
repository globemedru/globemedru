(function(){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=b.substr(0,62)+"-_",a=/[^A-Za-z0-9\+\/\=]/g,d=/[^A-Za-z0-9\-\_]/g,f={Encode:function(t,g){var m=0,h=[],j=g?c:b,r,l,k,s,q,p,n;t=e.Encode(t);while(m<t.length){r=t.charCodeAt(m++);l=t.charCodeAt(m++);k=t.charCodeAt(m++);s=r>>2;q=((r&3)<<4)|(l>>4);p=((l&15)<<2)|(k>>6);n=k&63;if(isNaN(l)){p=n=64;}else{if(isNaN(k)){n=64;}}h.push(j.charAt(s),j.charAt(q),j.charAt(p),j.charAt(n));}return h.join("");},Decode:function(t,g){var m=0,h=[],j=g?c:b,s,r,p,n,q,l,k;t=t.replace(g?d:a,"");while(m<t.length){s=j.indexOf(t.charAt(m++));r=j.indexOf(t.charAt(m++));p=j.indexOf(t.charAt(m++))||64;n=j.indexOf(t.charAt(m++))||64;q=String.fromCharCode((s<<2)|(r>>4));l=p!==64?String.fromCharCode(((r&15)<<4)|(p>>2)):"";k=p!==64?String.fromCharCode(((p&3)<<6)|n):"";h.push(q,l,k);}return e.Decode(h.join(""));}},e={Encode:function(k){var g=[],j,h,m;for(j=0,h=k.length;j<h;j++){m=k.charCodeAt(j);if(m<128){g.push(String.fromCharCode(m));}else{if((m>127)&&(m<2048)){g.push(String.fromCharCode((m>>6)|192),String.fromCharCode((m&63)|128));}else{g.push(String.fromCharCode((m>>12)|224),String.fromCharCode(((m>>6)&63)|128),String.fromCharCode((m&63)|128));}}}return g.join("");},Decode:function(g){var n=[],m=0,h=g.length,p,k,j;while(m<h){p=g.charCodeAt(m);if(p<128){n.push(String.fromCharCode(p));m++;}else{if((p>191)&&(p<224)){k=g.charCodeAt(m+1);n.push(String.fromCharCode(((p&31)<<6)|(k&63)));m+=2;}else{k=g.charCodeAt(m+1);j=g.charCodeAt(m+2);n.push(String.fromCharCode(((p&15)<<12)|((k&63)<<6)|(j&63)));m+=3;}}}return n.join("");}};window.Base64=f;window.UTF8=e;}());(function(d,g){var a;if(typeof c=="undefined"){var c=function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0");}catch(h){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0");}catch(k){}try{return new ActiveXObject("Msxml2.XMLHTTP");}catch(j){}try{return new ActiveXObject("Microsoft.XMLHTTP");}catch(i){}throw new Error("This browser does not support XMLHttpRequest.");};}a={_methods:{},_success:function(p){var k,l,i,h,n=p.argument;try{k=p.responseText;if(h=/^\/\*(.+)\*\/$/.exec(k)){k=h[1];}k=JSON.parse(k);}catch(j){n.emit("error","Received an invalid response from the server",p);throw new Error("JSRPC Exception: Method ");}if(k.status&16){n.emit("success",k.result);}else{if(k.status&32){l=k.error;i={exception:l};("\u0000*\u0000code" in l)&&(i.code=l["\u0000*\u0000code"]);("\u0000*\u0000message" in l)&&(i.message=l["\u0000*\u0000message"]);("\u0000*\u0000file" in l)&&(i.file=l["\u0000*\u0000file"]);("\u0000*\u0000line" in l)&&(i.line=l["\u0000*\u0000line"]);n.emit("error",k.error["\u0000*\u0000message"]!=="undefined"?k.error["\u0000*\u0000message"]:k.error,i);}}},_failure:function(j){var i,h=j.argument;if(j.status===-1){i="The server encountered an error or took too long to respond";}h.emit("error",i,j);},_invoke:function(){var h=a._prepareInvoke(this._definition,arguments),i=new e();i._connection=jQuery.ajax({type:h.method,url:h.uri,headers:h.headers,dataType:"text",success:function(k,j,l){l.argument=i;a._success(l);},error:function(l,j,k){o.argument=i;a._failure(o);},timeout:60000,data:h.post_data});return i;},_setHeadersXHR:function(k,j){var h;for(h in j){if(j.hasOwnProperty(h)){k.setRequestHeader(h,j[h]);}}},_prepareInvoke:function(m,l){var h=Array.prototype.slice.call(l),j=JSON.stringify(h),i=((j.length*4/3)+a.Action.length)>(!m.options.cache?2013:1997),p=null,k=a.Action+"?jsrpc=1&s="+m.sig,n={};n["X-JSRPC-Signature"]=m.sig;n["X-JSRPC-Encoding"]="b64";n["X-JSRPC-Checksum"]=a.Checksum;if(i){p="a="+Base64.Encode(j,true);}else{k+="&a="+Base64.Encode(j,true);if(!m.options.cache){k+="&t="+(new Date()).getTime();}}return{headers:n,post_data:p,method:i?"POST":"GET",uri:k};},Method:function(i,l,h){if(i in a._methods||l in a._methods){return a._methods[i]||a._methods[l];}var k={name:i,sig:l,options:h||{}},j=function(){return a._invoke.apply(j,arguments);};a._methods[i]=a._methods[l]=j;j._definition=k;return j;},ExtendStatic:function(k,h){var j;if(!k){k=h;}else{for(j in h){if(h.hasOwnProperty(j)){k[j]=h[j];}}}return k;},ExtendProto:function(k,h){var j;if(typeof k=="undefined"){k=function(){};}for(j in h.prototype){k.prototype[j]=h.prototype[j];}return k;}};var b=function(){this._listeners={newListener:[]};};b.prototype={addListener:function(h,i){if(!this._listeners.hasOwnProperty(h)){this._listeners[h]=[];}this._listeners[h].push(i);this.emit("newListener","cancel",i);return this;},removeListener:function(j,m){if(this._listeners.hasOwnProperty(j)){var h=this._listeners[j],k=0,n=h.length;for(;n>k;++k){if(h[k]===m){h.splice(k,1);--k;}}}},listeners:function(h){if(this._listeners.hasOwnProperty(h)){return this._listeners[h];}},emit:function(k){if(this._listeners.hasOwnProperty(k)){var j=this._listeners[k],m=0,p=j.length,h=[].slice.call(arguments,1);for(;p>m;++m){if(typeof j[m]=="function"){try{j[m].apply(this,h);}catch(n){}}}}}};var f=function(){};f.prototype={addCallback:function(h){}};var e=function(){e.superclass.call(this);this._listeners.success=[];this._listeners.error=[];this._listeners.cancel=[];this._connection;};e.prototype={addCallback:function(h){this.addListener("success",h);return this;},addErrback:function(h){this.addListener("error",h);return this;},addCancelback:function(h){this.addListener("cancel",h);return this;},addAbortback:function(h){this.addListener("abort",h);return this;},emitSuccess:function(){this.emit.apply(this,["success"].concat(arguments));},emitError:function(){this.emit.apply(this,["emit"].concat(arguments));},emitCancel:function(){this.emit.apply(this,["cancel"].concat(arguments));},emitAbort:function(){this.emit.apply(this,["abort"].concat(arguments));},cancel:function(){throw new Error("Promise.cancel not implemented");},abort:function(){this._connection.abort();status&&this.emitAbort(arguments);return status;},timeout:function(h){throw new Error("Promise.timeout not implemented");},wait:function(){throw new Error("Promise.Wait not implemented");}};e.superclass=b;e.prototype=jQuery.extend(false,e.prototype,b.prototype);d.JSRPC=a;}(window));