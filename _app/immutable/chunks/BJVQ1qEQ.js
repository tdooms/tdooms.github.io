var _t=Object.defineProperty;var bt=(e,t,n)=>t in e?_t(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var x=(e,t,n)=>bt(e,typeof t!="symbol"?t+"":t,n);import{n as he,s as vt,o as $e,t as At}from"./CRYARyhg.js";new URL("sveltekit-internal://");function St(e,t){return e==="/"||t==="ignore"?e:t==="never"?e.endsWith("/")?e.slice(0,-1):e:t==="always"&&!e.endsWith("/")?e+"/":e}function kt(e){return e.split("%25").map(decodeURI).join("%25")}function Et(e){for(const t in e)e[t]=decodeURIComponent(e[t]);return e}function pe({href:e}){return e.split("#")[0]}function Rt(e,t,n,r=!1){const a=new URL(e);Object.defineProperty(a,"searchParams",{value:new Proxy(a.searchParams,{get(i,o){if(o==="get"||o==="getAll"||o==="has")return l=>(n(l),i[o](l));t();const c=Reflect.get(i,o);return typeof c=="function"?c.bind(i):c}}),enumerable:!0,configurable:!0});const s=["href","pathname","search","toString","toJSON"];r&&s.push("hash");for(const i of s)Object.defineProperty(a,i,{get(){return t(),e[i]},enumerable:!0,configurable:!0});return a}const It="/__data.json",Ut=".html__data.json";function Lt(e){return e.endsWith(".html")?e.replace(/\.html$/,Ut):e.replace(/\/$/,"")+It}function Tt(...e){let t=5381;for(const n of e)if(typeof n=="string"){let r=n.length;for(;r;)t=t*33^n.charCodeAt(--r)}else if(ArrayBuffer.isView(n)){const r=new Uint8Array(n.buffer,n.byteOffset,n.byteLength);let a=r.length;for(;a;)t=t*33^r[--a]}else throw new TypeError("value must be a string or TypedArray");return(t>>>0).toString(36)}function xt(e){const t=atob(e),n=new Uint8Array(t.length);for(let r=0;r<t.length;r++)n[r]=t.charCodeAt(r);return n.buffer}const Pt=window.fetch;window.fetch=(e,t)=>((e instanceof Request?e.method:(t==null?void 0:t.method)||"GET")!=="GET"&&G.delete(ve(e)),Pt(e,t));const G=new Map;function Ct(e,t){const n=ve(e,t),r=document.querySelector(n);if(r!=null&&r.textContent){let{body:a,...s}=JSON.parse(r.textContent);const i=r.getAttribute("data-ttl");return i&&G.set(n,{body:a,init:s,ttl:1e3*Number(i)}),r.getAttribute("data-b64")!==null&&(a=xt(a)),Promise.resolve(new Response(a,s))}return window.fetch(e,t)}function Ot(e,t,n){if(G.size>0){const r=ve(e,n),a=G.get(r);if(a){if(performance.now()<a.ttl&&["default","force-cache","only-if-cached",void 0].includes(n==null?void 0:n.cache))return new Response(a.body,a.init);G.delete(r)}}return window.fetch(t,n)}function ve(e,t){let r=`script[data-sveltekit-fetched][data-url=${JSON.stringify(e instanceof Request?e.url:e)}]`;if(t!=null&&t.headers||t!=null&&t.body){const a=[];t.headers&&a.push([...new Headers(t.headers)].join(",")),t.body&&(typeof t.body=="string"||ArrayBuffer.isView(t.body))&&a.push(t.body),r+=`[data-hash="${Tt(...a)}"]`}return r}const Nt=/^(\[)?(\.\.\.)?(\w+)(?:=(\w+))?(\])?$/;function $t(e){const t=[];return{pattern:e==="/"?/^\/$/:new RegExp(`^${Dt(e).map(r=>{const a=/^\[\.\.\.(\w+)(?:=(\w+))?\]$/.exec(r);if(a)return t.push({name:a[1],matcher:a[2],optional:!1,rest:!0,chained:!0}),"(?:/(.*))?";const s=/^\[\[(\w+)(?:=(\w+))?\]\]$/.exec(r);if(s)return t.push({name:s[1],matcher:s[2],optional:!0,rest:!1,chained:!0}),"(?:/([^/]+))?";if(!r)return;const i=r.split(/\[(.+?)\](?!\])/);return"/"+i.map((c,l)=>{if(l%2){if(c.startsWith("x+"))return ge(String.fromCharCode(parseInt(c.slice(2),16)));if(c.startsWith("u+"))return ge(String.fromCharCode(...c.slice(2).split("-").map(f=>parseInt(f,16))));const h=Nt.exec(c),[,u,w,d,m]=h;return t.push({name:d,matcher:m,optional:!!u,rest:!!w,chained:w?l===1&&i[0]==="":!1}),w?"(.*?)":u?"([^/]*)?":"([^/]+?)"}return ge(c)}).join("")}).join("")}/?$`),params:t}}function jt(e){return!/^\([^)]+\)$/.test(e)}function Dt(e){return e.slice(1).split("/").filter(jt)}function Ft(e,t,n){const r={},a=e.slice(1),s=a.filter(o=>o!==void 0);let i=0;for(let o=0;o<t.length;o+=1){const c=t[o];let l=a[o-i];if(c.chained&&c.rest&&i&&(l=a.slice(o-i,o+1).filter(h=>h).join("/"),i=0),l===void 0){c.rest&&(r[c.name]="");continue}if(!c.matcher||n[c.matcher](l)){r[c.name]=l;const h=t[o+1],u=a[o+1];h&&!h.rest&&h.optional&&u&&c.chained&&(i=0),!h&&!u&&Object.keys(r).length===s.length&&(i=0);continue}if(c.optional&&c.chained){i++;continue}return}if(!i)return r}function ge(e){return e.normalize().replace(/[[\]]/g,"\\$&").replace(/%/g,"%25").replace(/\//g,"%2[Ff]").replace(/\?/g,"%3[Ff]").replace(/#/g,"%23").replace(/[.*+?^${}()|\\]/g,"\\$&")}function Vt({nodes:e,server_loads:t,dictionary:n,matchers:r}){const a=new Set(t);return Object.entries(n).map(([o,[c,l,h]])=>{const{pattern:u,params:w}=$t(o),d={id:o,exec:m=>{const f=u.exec(m);if(f)return Ft(f,w,r)},errors:[1,...h||[]].map(m=>e[m]),layouts:[0,...l||[]].map(i),leaf:s(c)};return d.errors.length=d.layouts.length=Math.max(d.errors.length,d.layouts.length),d});function s(o){const c=o<0;return c&&(o=~o),[c,e[o]]}function i(o){return o===void 0?o:[a.has(o),e[o]]}}function Ye(e,t=JSON.parse){try{return t(sessionStorage[e])}catch{}}function je(e,t,n=JSON.stringify){const r=n(t);try{sessionStorage[e]=r}catch{}}const $=[];function Ae(e,t=he){let n;const r=new Set;function a(o){if(vt(e,o)&&(e=o,n)){const c=!$.length;for(const l of r)l[1](),$.push(l,e);if(c){for(let l=0;l<$.length;l+=2)$[l][0]($[l+1]);$.length=0}}}function s(o){a(o(e))}function i(o,c=he){const l=[o,c];return r.add(l),r.size===1&&(n=t(a,s)||he),o(e),()=>{r.delete(l),r.size===0&&n&&(n(),n=null)}}return{set:a,update:s,subscribe:i}}var Ke;const T=((Ke=globalThis.__sveltekit_bdmg4c)==null?void 0:Ke.base)??"";var We;const Bt=((We=globalThis.__sveltekit_bdmg4c)==null?void 0:We.assets)??T,qt="1739209830041",ze="sveltekit:snapshot",Je="sveltekit:scroll",Xe="sveltekit:states",Gt="sveltekit:pageurl",D="sveltekit:history",K="sveltekit:navigation",X={tap:1,hover:2,viewport:3,eager:4,off:-1,false:-1},J=location.origin;function Ze(e){if(e instanceof URL)return e;let t=document.baseURI;if(!t){const n=document.getElementsByTagName("base");t=n.length?n[0].href:document.URL}return new URL(e,t)}function Se(){return{x:pageXOffset,y:pageYOffset}}function j(e,t){return e.getAttribute(`data-sveltekit-${t}`)}const De={...X,"":X.hover};function Qe(e){let t=e.assignedSlot??e.parentNode;return(t==null?void 0:t.nodeType)===11&&(t=t.host),t}function et(e,t){for(;e&&e!==t;){if(e.nodeName.toUpperCase()==="A"&&e.hasAttribute("href"))return e;e=Qe(e)}}function ye(e,t,n){let r;try{if(r=new URL(e instanceof SVGAElement?e.href.baseVal:e.href,document.baseURI),n&&r.hash.match(/^#[^/]/)){const o=location.hash.split("#")[1]||"/";r.hash=`#${o}${r.hash}`}}catch{}const a=e instanceof SVGAElement?e.target.baseVal:e.target,s=!r||!!a||ie(r,t,n)||(e.getAttribute("rel")||"").split(/\s+/).includes("external"),i=(r==null?void 0:r.origin)===J&&e.hasAttribute("download");return{url:r,external:s,target:a,download:i}}function Z(e){let t=null,n=null,r=null,a=null,s=null,i=null,o=e;for(;o&&o!==document.documentElement;)r===null&&(r=j(o,"preload-code")),a===null&&(a=j(o,"preload-data")),t===null&&(t=j(o,"keepfocus")),n===null&&(n=j(o,"noscroll")),s===null&&(s=j(o,"reload")),i===null&&(i=j(o,"replacestate")),o=Qe(o);function c(l){switch(l){case"":case"true":return!0;case"off":case"false":return!1;default:return}}return{preload_code:De[r??"off"],preload_data:De[a??"off"],keepfocus:c(t),noscroll:c(n),reload:c(s),replace_state:c(i)}}function Fe(e){const t=Ae(e);let n=!0;function r(){n=!0,t.update(i=>i)}function a(i){n=!1,t.set(i)}function s(i){let o;return t.subscribe(c=>{(o===void 0||n&&c!==o)&&i(o=c)})}return{notify:r,set:a,subscribe:s}}const tt={v:()=>{}};function Mt(){const{set:e,subscribe:t}=Ae(!1);let n;async function r(){clearTimeout(n);try{const a=await fetch(`${Bt}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(!a.ok)return!1;const i=(await a.json()).version!==qt;return i&&(e(!0),tt.v(),clearTimeout(n)),i}catch{return!1}}return{subscribe:t,check:r}}function ie(e,t,n){return e.origin!==J||!e.pathname.startsWith(t)?!0:n?!(e.pathname===t+"/"||e.pathname===t+"/index.html"||e.protocol==="file:"&&e.pathname.replace(/\/[^/]+\.html?$/,"")===t):!1}function Ve(e){const t=Kt(e),n=new ArrayBuffer(t.length),r=new DataView(n);for(let a=0;a<n.byteLength;a++)r.setUint8(a,t.charCodeAt(a));return n}const Ht="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function Kt(e){e.length%4===0&&(e=e.replace(/==?$/,""));let t="",n=0,r=0;for(let a=0;a<e.length;a++)n<<=6,n|=Ht.indexOf(e[a]),r+=6,r===24&&(t+=String.fromCharCode((n&16711680)>>16),t+=String.fromCharCode((n&65280)>>8),t+=String.fromCharCode(n&255),n=r=0);return r===12?(n>>=4,t+=String.fromCharCode(n)):r===18&&(n>>=2,t+=String.fromCharCode((n&65280)>>8),t+=String.fromCharCode(n&255)),t}const Wt=-1,Yt=-2,zt=-3,Jt=-4,Xt=-5,Zt=-6;function Qt(e,t){if(typeof e=="number")return a(e,!0);if(!Array.isArray(e)||e.length===0)throw new Error("Invalid input");const n=e,r=Array(n.length);function a(s,i=!1){if(s===Wt)return;if(s===zt)return NaN;if(s===Jt)return 1/0;if(s===Xt)return-1/0;if(s===Zt)return-0;if(i)throw new Error("Invalid input");if(s in r)return r[s];const o=n[s];if(!o||typeof o!="object")r[s]=o;else if(Array.isArray(o))if(typeof o[0]=="string"){const c=o[0],l=t==null?void 0:t[c];if(l)return r[s]=l(a(o[1]));switch(c){case"Date":r[s]=new Date(o[1]);break;case"Set":const h=new Set;r[s]=h;for(let d=1;d<o.length;d+=1)h.add(a(o[d]));break;case"Map":const u=new Map;r[s]=u;for(let d=1;d<o.length;d+=2)u.set(a(o[d]),a(o[d+1]));break;case"RegExp":r[s]=new RegExp(o[1],o[2]);break;case"Object":r[s]=Object(o[1]);break;case"BigInt":r[s]=BigInt(o[1]);break;case"null":const w=Object.create(null);r[s]=w;for(let d=1;d<o.length;d+=2)w[o[d]]=a(o[d+1]);break;case"Int8Array":case"Uint8Array":case"Uint8ClampedArray":case"Int16Array":case"Uint16Array":case"Int32Array":case"Uint32Array":case"Float32Array":case"Float64Array":case"BigInt64Array":case"BigUint64Array":{const d=globalThis[c],m=o[1],f=Ve(m),g=new d(f);r[s]=g;break}case"ArrayBuffer":{const d=o[1],m=Ve(d);r[s]=m;break}default:throw new Error(`Unknown type ${c}`)}}else{const c=new Array(o.length);r[s]=c;for(let l=0;l<o.length;l+=1){const h=o[l];h!==Yt&&(c[l]=a(h))}}else{const c={};r[s]=c;for(const l in o){const h=o[l];c[l]=a(h)}}return r[s]}return a(0)}const nt=new Set(["load","prerender","csr","ssr","trailingSlash","config"]);[...nt];const en=new Set([...nt]);[...en];function tn(e){return e.filter(t=>t!=null)}class ce{constructor(t,n){this.status=t,typeof n=="string"?this.body={message:n}:n?this.body=n:this.body={message:`Error: ${t}`}}toString(){return JSON.stringify(this.body)}}class ke{constructor(t,n){this.status=t,this.location=n}}class Ee extends Error{constructor(t,n,r){super(r),this.status=t,this.text=n}}const nn="x-sveltekit-invalidated",rn="x-sveltekit-trailing-slash";function Q(e){return e instanceof ce||e instanceof Ee?e.status:500}function an(e){return e instanceof Ee?e.text:"Internal Error"}let I,W,me;const on=$e.toString().includes("$$")||/function \w+\(\) \{\}/.test($e.toString());on?(I={data:{},form:null,error:null,params:{},route:{id:null},state:{},status:-1,url:new URL("https://example.com")},W={current:null},me={current:!1}):(I=new class{constructor(){x(this,"data",$state.raw({}));x(this,"form",$state.raw(null));x(this,"error",$state.raw(null));x(this,"params",$state.raw({}));x(this,"route",$state.raw({id:null}));x(this,"state",$state.raw({}));x(this,"status",$state.raw(-1));x(this,"url",$state.raw(new URL("https://example.com")))}},W=new class{constructor(){x(this,"current",$state.raw(null))}},me=new class{constructor(){x(this,"current",$state.raw(!1))}},tt.v=()=>me.current=!0);function sn(e){Object.assign(I,e)}const cn=new Set(["icon","shortcut icon","apple-touch-icon"]),N=Ye(Je)??{},Y=Ye(ze)??{},C={url:Fe({}),page:Fe({}),navigating:Ae(null),updated:Mt()};function Re(e){N[e]=Se()}function ln(e,t){let n=e+1;for(;N[n];)delete N[n],n+=1;for(n=t+1;Y[n];)delete Y[n],n+=1}function V(e){return location.href=e.href,new Promise(()=>{})}async function rt(){if("serviceWorker"in navigator){const e=await navigator.serviceWorker.getRegistration(T||"/");e&&await e.update()}}function Be(){}let le,_e,ee,P,be,A;const te=[],ne=[];let U=null;const at=new Set,fn=new Set,M=new Set;let _={branch:[],error:null,url:null},Ie=!1,re=!1,qe=!0,z=!1,B=!1,ot=!1,Ue=!1,st,R,L,ae;const H=new Set;async function Rn(e,t,n){var a,s,i,o;document.URL!==location.href&&(location.href=location.href),A=e,await((s=(a=e.hooks).init)==null?void 0:s.call(a)),le=Vt(e),P=document.documentElement,be=t,_e=e.nodes[0],ee=e.nodes[1],_e(),ee(),R=(i=history.state)==null?void 0:i[D],L=(o=history.state)==null?void 0:o[K],R||(R=L=Date.now(),history.replaceState({...history.state,[D]:R,[K]:L},""));const r=N[R];r&&(history.scrollRestoration="manual",scrollTo(r.x,r.y)),n?await _n(be,n):mn(A.hash?yt(new URL(location.href)):location.href,{replaceState:!0}),yn()}function un(){te.length=0,Ue=!1}function it(e){ne.some(t=>t==null?void 0:t.snapshot)&&(Y[e]=ne.map(t=>{var n;return(n=t==null?void 0:t.snapshot)==null?void 0:n.capture()}))}function ct(e){var t;(t=Y[e])==null||t.forEach((n,r)=>{var a,s;(s=(a=ne[r])==null?void 0:a.snapshot)==null||s.restore(n)})}function Ge(){Re(R),je(Je,N),it(L),je(ze,Y)}async function Le(e,t,n,r){return q({type:"goto",url:Ze(e),keepfocus:t.keepFocus,noscroll:t.noScroll,replace_state:t.replaceState,state:t.state,redirect_count:n,nav_token:r,accept:()=>{t.invalidateAll&&(Ue=!0),t.invalidate&&t.invalidate.forEach(wn)}})}async function dn(e){if(e.id!==(U==null?void 0:U.id)){const t={};H.add(t),U={id:e.id,token:t,promise:ft({...e,preload:t}).then(n=>(H.delete(t),n.type==="loaded"&&n.state.error&&(U=null),n))}}return U.promise}async function we(e){const t=ut(e);if(!t)return;const n=le.find(r=>r.exec(dt(t)));n&&await Promise.all([...n.layouts,n.leaf].map(r=>r==null?void 0:r[1]()))}function lt(e,t,n){var s;_=e.state;const r=document.querySelector("style[data-sveltekit]");r&&r.remove(),Object.assign(I,e.props.page),st=new A.root({target:t,props:{...e.props,stores:C,components:ne},hydrate:n,sync:!1}),ct(L);const a={from:null,to:{params:_.params,route:{id:((s=_.route)==null?void 0:s.id)??null},url:new URL(location.href)},willUnload:!1,type:"enter",complete:Promise.resolve()};M.forEach(i=>i(a)),re=!0}function oe({url:e,params:t,branch:n,status:r,error:a,route:s,form:i}){let o="never";if(T&&(e.pathname===T||e.pathname===T+"/"))o="always";else for(const d of n)(d==null?void 0:d.slash)!==void 0&&(o=d.slash);e.pathname=St(e.pathname,o),e.search=e.search;const c={type:"loaded",state:{url:e,params:t,branch:n,error:a,route:s},props:{constructors:tn(n).map(d=>d.node.component),page:Ce(I)}};i!==void 0&&(c.props.form=i);let l={},h=!I,u=0;for(let d=0;d<Math.max(n.length,_.branch.length);d+=1){const m=n[d],f=_.branch[d];(m==null?void 0:m.data)!==(f==null?void 0:f.data)&&(h=!0),m&&(l={...l,...m.data},h&&(c.props[`data_${u}`]=l),u+=1)}return(!_.url||e.href!==_.url.href||_.error!==a||i!==void 0&&i!==I.form||h)&&(c.props.page={error:a,params:t,route:{id:(s==null?void 0:s.id)??null},state:{},status:r,url:new URL(e),form:i??null,data:h?l:I.data}),c}async function Te({loader:e,parent:t,url:n,params:r,route:a,server_data_node:s}){var h,u,w;let i=null,o=!0;const c={dependencies:new Set,params:new Set,parent:!1,route:!1,url:!1,search_params:new Set},l=await e();if((h=l.universal)!=null&&h.load){let d=function(...f){for(const g of f){const{href:y}=new URL(g,n);c.dependencies.add(y)}};const m={route:new Proxy(a,{get:(f,g)=>(o&&(c.route=!0),f[g])}),params:new Proxy(r,{get:(f,g)=>(o&&c.params.add(g),f[g])}),data:(s==null?void 0:s.data)??null,url:Rt(n,()=>{o&&(c.url=!0)},f=>{o&&c.search_params.add(f)},A.hash),async fetch(f,g){let y;f instanceof Request?(y=f.url,g={body:f.method==="GET"||f.method==="HEAD"?void 0:await f.blob(),cache:f.cache,credentials:f.credentials,headers:[...f.headers].length?f.headers:void 0,integrity:f.integrity,keepalive:f.keepalive,method:f.method,mode:f.mode,redirect:f.redirect,referrer:f.referrer,referrerPolicy:f.referrerPolicy,signal:f.signal,...g}):y=f;const E=new URL(y,n);return o&&d(E.href),E.origin===n.origin&&(y=E.href.slice(n.origin.length)),re?Ot(y,E.href,g):Ct(y,g)},setHeaders:()=>{},depends:d,parent(){return o&&(c.parent=!0),t()},untrack(f){o=!1;try{return f()}finally{o=!0}}};i=await l.universal.load.call(null,m)??null}return{node:l,loader:e,server:s,universal:(u=l.universal)!=null&&u.load?{type:"data",data:i,uses:c}:null,data:i??(s==null?void 0:s.data)??null,slash:((w=l.universal)==null?void 0:w.trailingSlash)??(s==null?void 0:s.slash)}}function Me(e,t,n,r,a,s){if(Ue)return!0;if(!a)return!1;if(a.parent&&e||a.route&&t||a.url&&n)return!0;for(const i of a.search_params)if(r.has(i))return!0;for(const i of a.params)if(s[i]!==_.params[i])return!0;for(const i of a.dependencies)if(te.some(o=>o(new URL(i))))return!0;return!1}function xe(e,t){return(e==null?void 0:e.type)==="data"?e:(e==null?void 0:e.type)==="skip"?t??null:null}function hn(e,t){if(!e)return new Set(t.searchParams.keys());const n=new Set([...e.searchParams.keys(),...t.searchParams.keys()]);for(const r of n){const a=e.searchParams.getAll(r),s=t.searchParams.getAll(r);a.every(i=>s.includes(i))&&s.every(i=>a.includes(i))&&n.delete(r)}return n}function He({error:e,url:t,route:n,params:r}){return{type:"loaded",state:{error:e,url:t,route:n,params:r,branch:[]},props:{page:Ce(I),constructors:[]}}}async function ft({id:e,invalidating:t,url:n,params:r,route:a,preload:s}){if((U==null?void 0:U.id)===e)return H.delete(U.token),U.promise;const{errors:i,layouts:o,leaf:c}=a,l=[...o,c];i.forEach(p=>p==null?void 0:p().catch(()=>{})),l.forEach(p=>p==null?void 0:p[1]().catch(()=>{}));let h=null;const u=_.url?e!==se(_.url):!1,w=_.route?a.id!==_.route.id:!1,d=hn(_.url,n);let m=!1;const f=l.map((p,b)=>{var O;const S=_.branch[b],k=!!(p!=null&&p[0])&&((S==null?void 0:S.loader)!==p[1]||Me(m,w,u,d,(O=S.server)==null?void 0:O.uses,r));return k&&(m=!0),k});if(f.some(Boolean)){try{h=await gt(n,f)}catch(p){const b=await F(p,{url:n,params:r,route:{id:e}});return H.has(s)?He({error:b,url:n,params:r,route:a}):fe({status:Q(p),error:b,url:n,route:a})}if(h.type==="redirect")return h}const g=h==null?void 0:h.nodes;let y=!1;const E=l.map(async(p,b)=>{var ue;if(!p)return;const S=_.branch[b],k=g==null?void 0:g[b];if((!k||k.type==="skip")&&p[1]===(S==null?void 0:S.loader)&&!Me(y,w,u,d,(ue=S.universal)==null?void 0:ue.uses,r))return S;if(y=!0,(k==null?void 0:k.type)==="error")throw k;return Te({loader:p[1],url:n,params:r,route:a,parent:async()=>{var Ne;const Oe={};for(let de=0;de<b;de+=1)Object.assign(Oe,(Ne=await E[de])==null?void 0:Ne.data);return Oe},server_data_node:xe(k===void 0&&p[0]?{type:"skip"}:k??null,p[0]?S==null?void 0:S.server:void 0)})});for(const p of E)p.catch(()=>{});const v=[];for(let p=0;p<l.length;p+=1)if(l[p])try{v.push(await E[p])}catch(b){if(b instanceof ke)return{type:"redirect",location:b.location};if(H.has(s))return He({error:await F(b,{params:r,url:n,route:{id:a.id}}),url:n,params:r,route:a});let S=Q(b),k;if(g!=null&&g.includes(b))S=b.status??S,k=b.error;else if(b instanceof ce)k=b.body;else{if(await C.updated.check())return await rt(),await V(n);k=await F(b,{params:r,url:n,route:{id:a.id}})}const O=await pn(p,v,i);return O?oe({url:n,params:r,branch:v.slice(0,O.idx).concat(O.node),status:S,error:k,route:a}):await pt(n,{id:a.id},k,S)}else v.push(void 0);return oe({url:n,params:r,branch:v,status:200,error:null,route:a,form:t?void 0:null})}async function pn(e,t,n){for(;e--;)if(n[e]){let r=e;for(;!t[r];)r-=1;try{return{idx:r+1,node:{node:await n[e](),loader:n[e],data:{},server:null,universal:null}}}catch{continue}}}async function fe({status:e,error:t,url:n,route:r}){const a={};let s=null;if(A.server_loads[0]===0)try{const o=await gt(n,[!0]);if(o.type!=="data"||o.nodes[0]&&o.nodes[0].type!=="data")throw 0;s=o.nodes[0]??null}catch{(n.origin!==J||n.pathname!==location.pathname||Ie)&&await V(n)}try{const o=await Te({loader:_e,url:n,params:a,route:r,parent:()=>Promise.resolve({}),server_data_node:xe(s)}),c={node:await ee(),loader:ee,universal:null,server:null,data:null};return oe({url:n,params:a,branch:[o,c],status:e,error:t,route:null})}catch(o){if(o instanceof ke)return Le(new URL(o.location,location.href),{},0);throw o}}function ut(e){let t;try{if(t=A.hooks.reroute({url:new URL(e)})??e,typeof t=="string"){const n=new URL(e);A.hash?n.hash=t:n.pathname=t,t=n}}catch{return}return t}function Pe(e,t){if(!e||ie(e,T,A.hash))return;const n=ut(e);if(!n)return;const r=dt(n);for(const a of le){const s=a.exec(r);if(s)return{id:se(e),invalidating:t,route:a,params:Et(s),url:e}}}function dt(e){return kt(A.hash?e.hash.replace(/^#/,"").replace(/[?#].+/,""):e.pathname.slice(T.length))||"/"}function se(e){return(A.hash?e.hash.replace(/^#/,""):e.pathname)+e.search}function ht({url:e,type:t,intent:n,delta:r}){let a=!1;const s=wt(_,n,e,t);r!==void 0&&(s.navigation.delta=r);const i={...s.navigation,cancel:()=>{a=!0,s.reject(new Error("navigation cancelled"))}};return z||at.forEach(o=>o(i)),a?null:s}async function q({type:e,url:t,popped:n,keepfocus:r,noscroll:a,replace_state:s,state:i={},redirect_count:o=0,nav_token:c={},accept:l=Be,block:h=Be}){const u=Pe(t,!1),w=ht({url:t,type:e,delta:n==null?void 0:n.delta,intent:u});if(!w){h();return}const d=R,m=L;l(),z=!0,re&&C.navigating.set(W.current=w.navigation),ae=c;let f=u&&await ft(u);if(!f){if(ie(t,T,A.hash))return await V(t);f=await pt(t,{id:null},await F(new Ee(404,"Not Found",`Not found: ${t.pathname}`),{url:t,params:{},route:{id:null}}),404)}if(t=(u==null?void 0:u.url)||t,ae!==c)return w.reject(new Error("navigation aborted")),!1;if(f.type==="redirect")if(o>=20)f=await fe({status:500,error:await F(new Error("Redirect loop"),{url:t,params:{},route:{id:null}}),url:t,route:{id:null}});else return Le(new URL(f.location,t).href,{},o+1,c),!1;else f.props.page.status>=400&&await C.updated.check()&&(await rt(),await V(t));if(un(),Re(d),it(m),f.props.page.url.pathname!==t.pathname&&(t.pathname=f.props.page.url.pathname),i=n?n.state:i,!n){const v=s?0:1,p={[D]:R+=v,[K]:L+=v,[Xe]:i};(s?history.replaceState:history.pushState).call(history,p,"",t),s||ln(R,L)}if(U=null,f.props.page.state=i,re){_=f.state,f.props.page&&(f.props.page.url=t);const v=(await Promise.all(Array.from(fn,p=>p(w.navigation)))).filter(p=>typeof p=="function");if(v.length>0){let p=function(){v.forEach(b=>{M.delete(b)})};v.push(p),v.forEach(b=>{M.add(b)})}st.$set(f.props),sn(f.props.page),ot=!0}else lt(f,be,!1);const{activeElement:g}=document;await At();const y=n?n.scroll:a?Se():null;if(qe){const v=t.hash&&document.getElementById(decodeURIComponent(A.hash?t.hash.split("#")[2]??"":t.hash.slice(1)));y?scrollTo(y.x,y.y):v?v.scrollIntoView():scrollTo(0,0)}const E=document.activeElement!==g&&document.activeElement!==document.body;!r&&!E&&bn(),qe=!0,f.props.page&&Object.assign(I,f.props.page),z=!1,e==="popstate"&&ct(L),w.fulfil(void 0),M.forEach(v=>v(w.navigation)),C.navigating.set(W.current=null)}async function pt(e,t,n,r){return e.origin===J&&e.pathname===location.pathname&&!Ie?await fe({status:r,error:n,url:e,route:t}):await V(e)}function gn(){let e;P.addEventListener("mousemove",s=>{const i=s.target;clearTimeout(e),e=setTimeout(()=>{r(i,2)},20)});function t(s){s.defaultPrevented||r(s.composedPath()[0],1)}P.addEventListener("mousedown",t),P.addEventListener("touchstart",t,{passive:!0});const n=new IntersectionObserver(s=>{for(const i of s)i.isIntersecting&&(we(new URL(i.target.href)),n.unobserve(i.target))},{threshold:0});function r(s,i){const o=et(s,P);if(!o)return;const{url:c,external:l,download:h}=ye(o,T,A.hash);if(l||h)return;const u=Z(o),w=c&&se(_.url)===se(c);if(!u.reload&&!w)if(i<=u.preload_data){const d=Pe(c,!1);d&&dn(d)}else i<=u.preload_code&&we(c)}function a(){n.disconnect();for(const s of P.querySelectorAll("a")){const{url:i,external:o,download:c}=ye(s,T,A.hash);if(o||c)continue;const l=Z(s);l.reload||(l.preload_code===X.viewport&&n.observe(s),l.preload_code===X.eager&&we(i))}}M.add(a),a()}function F(e,t){if(e instanceof ce)return e.body;const n=Q(e),r=an(e);return A.hooks.handleError({error:e,event:t,status:n,message:r})??{message:r}}function mn(e,t={}){return e=new URL(Ze(e)),e.origin!==J?Promise.reject(new Error("goto: invalid URL")):Le(e,t,0)}function wn(e){if(typeof e=="function")te.push(e);else{const{href:t}=new URL(e,location.href);te.push(n=>n.href===t)}}function yn(){var t;history.scrollRestoration="manual",addEventListener("beforeunload",n=>{let r=!1;if(Ge(),!z){const a=wt(_,void 0,null,"leave"),s={...a.navigation,cancel:()=>{r=!0,a.reject(new Error("navigation cancelled"))}};at.forEach(i=>i(s))}r?(n.preventDefault(),n.returnValue=""):history.scrollRestoration="auto"}),addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&Ge()}),(t=navigator.connection)!=null&&t.saveData||gn(),P.addEventListener("click",async n=>{if(n.button||n.which!==1||n.metaKey||n.ctrlKey||n.shiftKey||n.altKey||n.defaultPrevented)return;const r=et(n.composedPath()[0],P);if(!r)return;const{url:a,external:s,target:i,download:o}=ye(r,T,A.hash);if(!a)return;if(i==="_parent"||i==="_top"){if(window.parent!==window)return}else if(i&&i!=="_self")return;const c=Z(r);if(!(r instanceof SVGAElement)&&a.protocol!==location.protocol&&!(a.protocol==="https:"||a.protocol==="http:")||o)return;const[h,u]=(A.hash?a.hash.replace(/^#/,""):a.href).split("#"),w=h===pe(location);if(s||c.reload&&(!w||!u)){ht({url:a,type:"link"})?z=!0:n.preventDefault();return}if(u!==void 0&&w){const[,d]=_.url.href.split("#");if(d===u){if(n.preventDefault(),u===""||u==="top"&&r.ownerDocument.getElementById("top")===null)window.scrollTo({top:0});else{const m=r.ownerDocument.getElementById(decodeURIComponent(u));m&&(m.scrollIntoView(),m.focus())}return}if(B=!0,Re(R),e(a),!c.replace_state)return;B=!1}n.preventDefault(),await new Promise(d=>{requestAnimationFrame(()=>{setTimeout(d,0)}),setTimeout(d,100)}),q({type:"link",url:a,keepfocus:c.keepfocus,noscroll:c.noscroll,replace_state:c.replace_state??a.href===location.href})}),P.addEventListener("submit",n=>{if(n.defaultPrevented)return;const r=HTMLFormElement.prototype.cloneNode.call(n.target),a=n.submitter;if(((a==null?void 0:a.formTarget)||r.target)==="_blank"||((a==null?void 0:a.formMethod)||r.method)!=="get")return;const o=new URL((a==null?void 0:a.hasAttribute("formaction"))&&(a==null?void 0:a.formAction)||r.action);if(ie(o,T,!1))return;const c=n.target,l=Z(c);if(l.reload)return;n.preventDefault(),n.stopPropagation();const h=new FormData(c),u=a==null?void 0:a.getAttribute("name");u&&h.append(u,(a==null?void 0:a.getAttribute("value"))??""),o.search=new URLSearchParams(h).toString(),q({type:"form",url:o,keepfocus:l.keepfocus,noscroll:l.noscroll,replace_state:l.replace_state??o.href===location.href})}),addEventListener("popstate",async n=>{var r;if((r=n.state)!=null&&r[D]){const a=n.state[D];if(ae={},a===R)return;const s=N[a],i=n.state[Xe]??{},o=new URL(n.state[Gt]??location.href),c=n.state[K],l=_.url?pe(location)===pe(_.url):!1;if(c===L&&(ot||l)){i!==I.state&&(I.state=i),e(o),N[R]=Se(),s&&scrollTo(s.x,s.y),R=a;return}const u=a-R;await q({type:"popstate",url:o,popped:{state:i,scroll:s,delta:u},accept:()=>{R=a,L=c},block:()=>{history.go(-u)},nav_token:ae})}else if(!B){const a=new URL(location.href);e(a)}}),addEventListener("hashchange",()=>{B?(B=!1,history.replaceState({...history.state,[D]:++R,[K]:L},"",location.href)):A.hash&&_.url.hash===location.hash&&q({type:"goto",url:yt(_.url)})});for(const n of document.querySelectorAll("link"))cn.has(n.rel)&&(n.href=n.href);addEventListener("pageshow",n=>{n.persisted&&C.navigating.set(W.current=null)});function e(n){_.url=I.url=n,C.page.set(Ce(I)),C.page.notify()}}async function _n(e,{status:t=200,error:n,node_ids:r,params:a,route:s,data:i,form:o}){Ie=!0;const c=new URL(location.href);({params:a={},route:s={id:null}}=Pe(c,!1)||{});let l,h=!0;try{const u=r.map(async(m,f)=>{const g=i[f];return g!=null&&g.uses&&(g.uses=mt(g.uses)),Te({loader:A.nodes[m],url:c,params:a,route:s,parent:async()=>{const y={};for(let E=0;E<f;E+=1)Object.assign(y,(await u[E]).data);return y},server_data_node:xe(g)})}),w=await Promise.all(u),d=le.find(({id:m})=>m===s.id);if(d){const m=d.layouts;for(let f=0;f<m.length;f++)m[f]||w.splice(f,0,void 0)}l=oe({url:c,params:a,branch:w,status:t,error:n,form:o,route:d??null})}catch(u){if(u instanceof ke){await V(new URL(u.location,location.href));return}l=await fe({status:Q(u),error:await F(u,{url:c,params:a,route:s}),url:c,route:s}),e.textContent="",h=!1}l.props.page&&(l.props.page.state={}),lt(l,e,h)}async function gt(e,t){var s;const n=new URL(e);n.pathname=Lt(e.pathname),e.pathname.endsWith("/")&&n.searchParams.append(rn,"1"),n.searchParams.append(nn,t.map(i=>i?"1":"0").join(""));const r=window.fetch,a=await r(n.href,{});if(!a.ok){let i;throw(s=a.headers.get("content-type"))!=null&&s.includes("application/json")?i=await a.json():a.status===404?i="Not Found":a.status===500&&(i="Internal Error"),new ce(a.status,i)}return new Promise(async i=>{var w;const o=new Map,c=a.body.getReader(),l=new TextDecoder;function h(d){return Qt(d,{...A.decoders,Promise:m=>new Promise((f,g)=>{o.set(m,{fulfil:f,reject:g})})})}let u="";for(;;){const{done:d,value:m}=await c.read();if(d&&!u)break;for(u+=!m&&u?`
`:l.decode(m,{stream:!0});;){const f=u.indexOf(`
`);if(f===-1)break;const g=JSON.parse(u.slice(0,f));if(u=u.slice(f+1),g.type==="redirect")return i(g);if(g.type==="data")(w=g.nodes)==null||w.forEach(y=>{(y==null?void 0:y.type)==="data"&&(y.uses=mt(y.uses),y.data=h(y.data))}),i(g);else if(g.type==="chunk"){const{id:y,data:E,error:v}=g,p=o.get(y);o.delete(y),v?p.reject(h(v)):p.fulfil(h(E))}}}})}function mt(e){return{dependencies:new Set((e==null?void 0:e.dependencies)??[]),params:new Set((e==null?void 0:e.params)??[]),parent:!!(e!=null&&e.parent),route:!!(e!=null&&e.route),url:!!(e!=null&&e.url),search_params:new Set((e==null?void 0:e.search_params)??[])}}function bn(){const e=document.querySelector("[autofocus]");if(e)e.focus();else{const t=document.body,n=t.getAttribute("tabindex");t.tabIndex=-1,t.focus({preventScroll:!0,focusVisible:!1}),n!==null?t.setAttribute("tabindex",n):t.removeAttribute("tabindex");const r=getSelection();if(r&&r.type!=="None"){const a=[];for(let s=0;s<r.rangeCount;s+=1)a.push(r.getRangeAt(s));setTimeout(()=>{if(r.rangeCount===a.length){for(let s=0;s<r.rangeCount;s+=1){const i=a[s],o=r.getRangeAt(s);if(i.commonAncestorContainer!==o.commonAncestorContainer||i.startContainer!==o.startContainer||i.endContainer!==o.endContainer||i.startOffset!==o.startOffset||i.endOffset!==o.endOffset)return}r.removeAllRanges()}})}}}function wt(e,t,n,r){var c,l;let a,s;const i=new Promise((h,u)=>{a=h,s=u});return i.catch(()=>{}),{navigation:{from:{params:e.params,route:{id:((c=e.route)==null?void 0:c.id)??null},url:e.url},to:n&&{params:(t==null?void 0:t.params)??null,route:{id:((l=t==null?void 0:t.route)==null?void 0:l.id)??null},url:n},willUnload:!t,type:r,complete:i},fulfil:a,reject:s}}function Ce(e){return{data:e.data,error:e.error,form:e.form,params:e.params,route:e.route,state:e.state,status:e.status,url:e.url}}function yt(e){const t=new URL(e);return t.hash=decodeURIComponent(e.hash),t}export{Rn as a,C as s};
