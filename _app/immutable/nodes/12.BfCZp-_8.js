import{s as z,n as N,b as F}from"../chunks/scheduler.B_1erFai.js";import{S as K,i as Q,h as v,s as V,n as G,j as b,o as x,k as L,b as D,p as T,f as j,l as _,d as R,r as u,v as q,t as C,w as S,e as I,x as X,c as Y,a as Z,m as $,g as ee,y as B}from"../chunks/index.TjX85taC.js";import{e as H}from"../chunks/each.6w4Ej4nR.js";import{g as te,a as ne}from"../chunks/spread.rEx3vLA9.js";function se(h){let e,s,l,f='<span class="icon is-large"><i class="fab fa-2x fa-github"></i></span>',a,m,c,g,E,y,w,k,o,M;return{c(){e=v("a"),s=v("div"),l=v("div"),l.innerHTML=f,a=V(),m=v("div"),c=v("h4"),g=G(h[0]),E=V(),y=v("h6"),w=G(h[1]),k=V(),o=v("p"),M=G(h[2]),this.h()},l(d){e=b(d,"A",{class:!0,href:!0,target:!0});var i=x(e);s=b(i,"DIV",{class:!0});var A=x(s);l=b(A,"DIV",{class:!0,"data-svelte-h":!0}),L(l)!=="svelte-9led48"&&(l.innerHTML=f),a=D(A),m=b(A,"DIV",{class:!0});var n=x(m);c=b(n,"H4",{class:!0});var r=x(c);g=T(r,h[0]),r.forEach(j),E=D(n),y=b(n,"H6",{});var t=x(y);w=T(t,h[1]),t.forEach(j),n.forEach(j),A.forEach(j),k=D(i),o=b(i,"P",{});var p=x(o);M=T(p,h[2]),p.forEach(j),i.forEach(j),this.h()},h(){_(l,"class","media-left"),_(c,"class","title is-4 mb-0"),_(m,"class","media-content"),_(s,"class","media"),_(e,"class","box"),_(e,"href",h[3]),_(e,"target","_blank")},m(d,i){R(d,e,i),u(e,s),u(s,l),u(s,a),u(s,m),u(m,c),u(c,g),u(m,E),u(m,y),u(y,w),u(e,k),u(e,o),u(o,M)},p(d,[i]){i&1&&q(g,d[0]),i&2&&q(w,d[1]),i&4&&q(M,d[2]),i&8&&_(e,"href",d[3])},i:N,o:N,d(d){d&&j(e)}}}function ie(h,e,s){let{name:l}=e,{date:f}=e,{description:a}=e,{link:m}=e;return h.$$set=c=>{"name"in c&&s(0,l=c.name),"date"in c&&s(1,f=c.date),"description"in c&&s(2,a=c.description),"link"in c&&s(3,m=c.link)},[l,f,a,m]}class ae extends K{constructor(e){super(),Q(this,e,ie,se,z,{name:0,date:1,description:2,link:3})}}function O(h,e,s){const l=h.slice();return l[2]=e[s],l}function W(h,e,s){const l=h.slice();return l[2]=e[s],l}function J(h){let e,s;const l=[h[2]];let f={};for(let a=0;a<l.length;a+=1)f=F(f,l[a]);return e=new ae({props:f}),{c(){Y(e.$$.fragment)},l(a){Z(e.$$.fragment,a)},m(a,m){$(e,a,m),s=!0},p(a,m){const c=m&2?te(l,[ne(a[2])]):{};e.$set(c)},i(a){s||(C(e.$$.fragment,a),s=!0)},o(a){I(e.$$.fragment,a),s=!1},d(a){ee(e,a)}}}function U(h){let e,s;const l=[h[2]];let f={};for(let a=0;a<l.length;a+=1)f=F(f,l[a]);return e=new ae({props:f}),{c(){Y(e.$$.fragment)},l(a){Z(e.$$.fragment,a)},m(a,m){$(e,a,m),s=!0},p(a,m){const c=m&1?te(l,[ne(a[2])]):{};e.$set(c)},i(a){s||(C(e.$$.fragment,a),s=!0)},o(a){I(e.$$.fragment,a),s=!1},d(a){ee(e,a)}}}function le(h){let e,s,l,f="Personal Projects",a,m,c,g,E="Academic Projects",y,w,k=H(h[1]),o=[];for(let n=0;n<k.length;n+=1)o[n]=J(W(h,k,n));const M=n=>I(o[n],1,1,()=>{o[n]=null});let d=H(h[0]),i=[];for(let n=0;n<d.length;n+=1)i[n]=U(O(h,d,n));const A=n=>I(i[n],1,1,()=>{i[n]=null});return{c(){e=v("div"),s=v("div"),l=v("h5"),l.textContent=f,a=V();for(let n=0;n<o.length;n+=1)o[n].c();m=V(),c=v("div"),g=v("h5"),g.textContent=E,y=V();for(let n=0;n<i.length;n+=1)i[n].c();this.h()},l(n){e=b(n,"DIV",{class:!0});var r=x(e);s=b(r,"DIV",{class:!0});var t=x(s);l=b(t,"H5",{class:!0,"data-svelte-h":!0}),L(l)!=="svelte-1vh2v85"&&(l.textContent=f),a=D(t);for(let P=0;P<o.length;P+=1)o[P].l(t);t.forEach(j),m=D(r),c=b(r,"DIV",{class:!0});var p=x(c);g=b(p,"H5",{class:!0,"data-svelte-h":!0}),L(g)!=="svelte-28navq"&&(g.textContent=E),y=D(p);for(let P=0;P<i.length;P+=1)i[P].l(p);p.forEach(j),r.forEach(j),this.h()},h(){_(l,"class","title is-5"),_(s,"class","column is-4"),_(g,"class","title is-5"),_(c,"class","column is-4"),_(e,"class","columns is-centered")},m(n,r){R(n,e,r),u(e,s),u(s,l),u(s,a);for(let t=0;t<o.length;t+=1)o[t]&&o[t].m(s,null);u(e,m),u(e,c),u(c,g),u(c,y);for(let t=0;t<i.length;t+=1)i[t]&&i[t].m(c,null);w=!0},p(n,[r]){if(r&2){k=H(n[1]);let t;for(t=0;t<k.length;t+=1){const p=W(n,k,t);o[t]?(o[t].p(p,r),C(o[t],1)):(o[t]=J(p),o[t].c(),C(o[t],1),o[t].m(s,null))}for(B(),t=k.length;t<o.length;t+=1)M(t);S()}if(r&1){d=H(n[0]);let t;for(t=0;t<d.length;t+=1){const p=O(n,d,t);i[t]?(i[t].p(p,r),C(i[t],1)):(i[t]=U(p),i[t].c(),C(i[t],1),i[t].m(c,null))}for(B(),t=d.length;t<i.length;t+=1)A(t);S()}},i(n){if(!w){for(let r=0;r<k.length;r+=1)C(o[r]);for(let r=0;r<d.length;r+=1)C(i[r]);w=!0}},o(n){o=o.filter(Boolean);for(let r=0;r<o.length;r+=1)I(o[r]);i=i.filter(Boolean);for(let r=0;r<i.length;r+=1)I(i[r]);w=!1},d(n){n&&j(e),X(o,n),X(i,n)}}}function oe(h){return[[{name:"meme.ir",link:"https://github.com/tdooms/meme.ir",date:"2022",description:"A group project in which we finetuned a transformer model to predict a meme template given only the text. We achieved 70% top-1 accuracy on 100 templates."},{name:"GNMX",link:"https://github.com/GNMX-UA/GNMX",date:"2021",description:"An interdisciplinary group project about computational biology. We developed a simulation and visualisation to investigate the genetic polymorphism phenomenon."},{name:"O4 Compiler",link:"https://github.com/tdooms/o4-compiler",date:"2020",description:"A fully fledged C to MIPS compiler using antlr4 and LLVM. There are several optimisation techniques which make the output quite optimised."}],[{name:"PixelGuesser",link:"https://github.com/tdooms/pixelguesser",date:"2022",description:"PixelGuesser is a party game where players have to guess the contents of a heavily pixelated image which slowly grows more detailed over time. "},{name:"Paw",link:"https://github.com/tdooms/paw",date:"2021",description:"Easy to use ray marching renderer using JSON for scene description. Many primitives, composables and textures are supported."},{name:"C++ ini parser",link:"https://github.com/tdooms/ini-parser",date:"2019",description:"A Pythonic ini parser written in c++ using template hacking. The main goals are speed and ease of use. The ini file is read using a performant custom parser."}]]}class ue extends K{constructor(e){super(),Q(this,e,oe,le,z,{})}}export{ue as component};