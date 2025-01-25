import{s as O,c as we,h as he,u as Se,g as Ce,a as ke,n as J,b as oe}from"../chunks/CSLc78ll.js";import{S as q,i as U,h as m,s as D,n as P,j as g,o as p,f,b as M,p as B,l as _,d as k,r as u,v as Q,t as w,e as V,c as T,A as ae,a as N,m as j,z as se,x as re,g as G,y as ie,k as F,u as Ee}from"../chunks/44WAvM-d.js";import{e as z}from"../chunks/D6YF6ztN.js";import{g as ce,a as ue}from"../chunks/CgU5AtxT.js";function Ie(o){let e,r,s,n,a,t,i,l,c,$,d,h,v,I,b;const L=o[4].default,S=we(L,o,o[3],null);return{c(){e=m("div"),r=m("div"),s=m("div"),n=m("figure"),a=m("img"),i=D(),l=m("div"),c=m("h5"),$=P(o[1]),d=D(),h=m("h6"),v=P(o[2]),I=D(),S&&S.c(),this.h()},l(E){e=g(E,"DIV",{class:!0});var C=p(e);r=g(C,"DIV",{class:!0});var R=p(r);s=g(R,"DIV",{class:!0});var H=p(s);n=g(H,"FIGURE",{class:!0});var y=p(n);a=g(y,"IMG",{src:!0,alt:!0}),y.forEach(f),H.forEach(f),i=M(R),l=g(R,"DIV",{class:!0});var K=p(l);c=g(K,"H5",{class:!0});var X=p(c);$=B(X,o[1]),X.forEach(f),d=M(K),h=g(K,"H6",{});var A=p(h);v=B(A,o[2]),A.forEach(f),K.forEach(f),R.forEach(f),I=M(C),S&&S.l(C),C.forEach(f),this.h()},h(){he(a.src,t=o[0])||_(a,"src",t),_(a,"alt","icon"),_(n,"class","image is-48x48"),_(s,"class","media-left"),_(c,"class","title is-5 mb-0"),_(l,"class","media-content"),_(r,"class","media"),_(e,"class","box")},m(E,C){k(E,e,C),u(e,r),u(r,s),u(s,n),u(n,a),u(r,i),u(r,l),u(l,c),u(c,$),u(l,d),u(l,h),u(h,v),u(e,I),S&&S.m(e,null),b=!0},p(E,[C]){(!b||C&1&&!he(a.src,t=E[0]))&&_(a,"src",t),(!b||C&2)&&Q($,E[1]),(!b||C&4)&&Q(v,E[2]),S&&S.p&&(!b||C&8)&&Se(S,L,E,E[3],b?ke(L,E[3],C,null):Ce(E[3]),null)},i(E){b||(w(S,E),b=!0)},o(E){V(S,E),b=!1},d(E){E&&f(e),S&&S.d(E)}}}function xe(o,e,r){let{$$slots:s={},$$scope:n}=e,{icon:a}=e,{title:t}=e,{date:i}=e;return o.$$set=l=>{"icon"in l&&r(0,a=l.icon),"title"in l&&r(1,t=l.title),"date"in l&&r(2,i=l.date),"$$scope"in l&&r(3,n=l.$$scope)},[a,t,i,n,s]}class fe extends q{constructor(e){super(),U(this,e,xe,Ie,O,{icon:0,title:1,date:2})}}function de(o,e,r){const s=o.slice();return s[1]=e[r],s}function De(o){let e,r="<b>Subject: </b>Weight-based interpretability",s,n,a="<b>Advisor:</b> Jose M. Oramas";return{c(){e=m("p"),e.innerHTML=r,s=D(),n=m("p"),n.innerHTML=a,this.h()},l(t){e=g(t,"P",{class:!0,"data-svelte-h":!0}),F(e)!=="svelte-1puhobh"&&(e.innerHTML=r),s=M(t),n=g(t,"P",{"data-svelte-h":!0}),F(n)!=="svelte-17f9n1s"&&(n.innerHTML=a),this.h()},h(){_(e,"class","mt-2")},m(t,i){k(t,e,i),k(t,s,i),k(t,n,i)},p:J,d(t){t&&(f(e),f(s),f(n))}}}function Me(o){let e,r,s="Grade:",n,a=o[1].grade+"",t,i;return{c(){e=m("p"),r=m("b"),r.textContent=s,n=D(),t=P(a),i=D(),this.h()},l(l){e=g(l,"P",{class:!0});var c=p(e);r=g(c,"B",{"data-svelte-h":!0}),F(r)!=="svelte-bt28nn"&&(r.textContent=s),n=M(c),t=B(c,a),c.forEach(f),i=M(l),this.h()},h(){_(e,"class","mt-2")},m(l,c){k(l,e,c),u(e,r),u(e,n),u(e,t),k(l,i,c)},p:J,d(l){l&&(f(e),f(i))}}}function me(o){let e,r;return e=new fe({props:{icon:"icons/ua.png",date:o[1].date,title:o[1].title,$$slots:{default:[Me]},$$scope:{ctx:o}}}),{c(){T(e.$$.fragment)},l(s){N(e.$$.fragment,s)},m(s,n){j(e,s,n),r=!0},p(s,n){const a={};n&16&&(a.$$scope={dirty:n,ctx:s}),e.$set(a)},i(s){r||(w(e.$$.fragment,s),r=!0)},o(s){V(e.$$.fragment,s),r=!1},d(s){G(e,s)}}}function Ve(o){let e,r,s,n;e=new fe({props:{icon:"icons/ua.png",date:"Nov 2023 - TBD",title:"PhD in Machine Learning",$$slots:{default:[De]},$$scope:{ctx:o}}});let a=z(o[0]),t=[];for(let l=0;l<a.length;l+=1)t[l]=me(de(o,a,l));const i=l=>V(t[l],1,1,()=>{t[l]=null});return{c(){T(e.$$.fragment),r=D();for(let l=0;l<t.length;l+=1)t[l].c();s=ae()},l(l){N(e.$$.fragment,l),r=M(l);for(let c=0;c<t.length;c+=1)t[c].l(l);s=ae()},m(l,c){j(e,l,c),k(l,r,c);for(let $=0;$<t.length;$+=1)t[$]&&t[$].m(l,c);k(l,s,c),n=!0},p(l,[c]){const $={};if(c&16&&($.$$scope={dirty:c,ctx:l}),e.$set($),c&1){a=z(l[0]);let d;for(d=0;d<a.length;d+=1){const h=de(l,a,d);t[d]?(t[d].p(h,c),w(t[d],1)):(t[d]=me(h),t[d].c(),w(t[d],1),t[d].m(s.parentNode,s))}for(se(),d=a.length;d<t.length;d+=1)i(d);re()}},i(l){if(!n){w(e.$$.fragment,l);for(let c=0;c<a.length;c+=1)w(t[c]);n=!0}},o(l){V(e.$$.fragment,l),t=t.filter(Boolean);for(let c=0;c<t.length;c+=1)V(t[c]);n=!1},d(l){l&&(f(r),f(s)),G(e,l),ie(t,l)}}}function Le(o){return[[{date:"Sep 2021 - Jun 2023",title:"Master in AI",grade:"Summa cum laude (87%)"},{date:"Sep 2019 - Aug 2021",title:"Honours Programme",grade:"Summa cum laude (85%)"},{date:"Sep 2018 - Jun 2021",title:"Bachelor in CS",grade:"Magna cum laude (83%)"}]]}class He extends q{constructor(e){super(),U(this,e,Le,Ve,O,{})}}function ye(o){let e,r,s,n,a,t,i,l,c,$,d;return{c(){e=m("div"),r=m("div"),s=m("strong"),n=P(o[0]),a=D(),t=m("div"),i=P(o[1]),l=D(),c=m("progress"),$=P(o[2]),d=P(" %"),this.h()},l(h){e=g(h,"DIV",{class:!0});var v=p(e);r=g(v,"DIV",{class:!0});var I=p(r);s=g(I,"STRONG",{});var b=p(s);n=B(b,o[0]),b.forEach(f),I.forEach(f),a=M(v),t=g(v,"DIV",{class:!0});var L=p(t);i=B(L,o[1]),L.forEach(f),v.forEach(f),l=M(h),c=g(h,"PROGRESS",{class:!0,style:!0,max:!0});var S=p(c);$=B(S,o[2]),d=B(S," %"),S.forEach(f),this.h()},h(){_(r,"class","column is-narrow has-text-left py-0"),_(t,"class","column has-text-right py-0"),_(e,"class","columns"),_(c,"class","progress is-danger"),Ee(c,"height","0.5rem"),_(c,"max","100"),c.value=o[2]},m(h,v){k(h,e,v),u(e,r),u(r,s),u(s,n),u(e,a),u(e,t),u(t,i),k(h,l,v),k(h,c,v),u(c,$),u(c,d)},p(h,[v]){v&1&&Q(n,h[0]),v&2&&Q(i,h[1]),v&4&&Q($,h[2]),v&4&&(c.value=h[2])},i:J,o:J,d(h){h&&(f(e),f(l),f(c))}}}function Ae(o,e,r){let{name:s}=e,{level:n}=e,{percent:a}=e;return o.$$set=t=>{"name"in t&&r(0,s=t.name),"level"in t&&r(1,n=t.level),"percent"in t&&r(2,a=t.percent)},[s,n,a]}class Pe extends q{constructor(e){super(),U(this,e,Ae,ye,O,{name:0,level:1,percent:2})}}function ge(o,e,r){const s=o.slice();return s[1]=e[r],s}function _e(o){let e,r;const s=[o[1]];let n={};for(let a=0;a<s.length;a+=1)n=oe(n,s[a]);return e=new Pe({props:n}),{c(){T(e.$$.fragment)},l(a){N(e.$$.fragment,a)},m(a,t){j(e,a,t),r=!0},p(a,t){const i=t&1?ce(s,[ue(a[1])]):{};e.$set(i)},i(a){r||(w(e.$$.fragment,a),r=!0)},o(a){V(e.$$.fragment,a),r=!1},d(a){G(e,a)}}}function Be(o){let e,r,s=z(o[0]),n=[];for(let t=0;t<s.length;t+=1)n[t]=_e(ge(o,s,t));const a=t=>V(n[t],1,1,()=>{n[t]=null});return{c(){e=m("div");for(let t=0;t<n.length;t+=1)n[t].c();this.h()},l(t){e=g(t,"DIV",{class:!0,style:!0});var i=p(e);for(let l=0;l<n.length;l+=1)n[l].l(i);i.forEach(f),this.h()},h(){_(e,"class","box"),Ee(e,"height","294px")},m(t,i){k(t,e,i);for(let l=0;l<n.length;l+=1)n[l]&&n[l].m(e,null);r=!0},p(t,[i]){if(i&1){s=z(t[0]);let l;for(l=0;l<s.length;l+=1){const c=ge(t,s,l);n[l]?(n[l].p(c,i),w(n[l],1)):(n[l]=_e(c),n[l].c(),w(n[l],1),n[l].m(e,null))}for(se(),l=s.length;l<n.length;l+=1)a(l);re()}},i(t){if(!r){for(let i=0;i<s.length;i+=1)w(n[i]);r=!0}},o(t){n=n.filter(Boolean);for(let i=0;i<n.length;i+=1)V(n[i]);r=!1},d(t){t&&f(e),ie(n,t)}}}function Te(o){return[[{name:"Dutch",level:"Native",percent:100},{name:"English",level:"Strong Proficiency",percent:90},{name:"French",level:"Bilingual",percent:80},{name:"Spanish",level:"Basic",percent:40},{name:"German",level:"Basic",percent:30}]]}class Ne extends q{constructor(e){super(),U(this,e,Te,Be,O,{})}}function ve(o,e,r){const s=o.slice();return s[1]=e[r],s}function je(o){let e,r=o[1].text+"",s,n;return{c(){e=m("p"),s=P(r),n=D(),this.h()},l(a){e=g(a,"P",{class:!0});var t=p(e);s=B(t,r),t.forEach(f),n=M(a),this.h()},h(){_(e,"class","mt-2")},m(a,t){k(a,e,t),u(e,s),k(a,n,t)},p:J,d(a){a&&(f(e),f(n))}}}function pe(o){let e,r;const s=[o[1]];let n={$$slots:{default:[je]},$$scope:{ctx:o}};for(let a=0;a<s.length;a+=1)n=oe(n,s[a]);return e=new fe({props:n}),{c(){T(e.$$.fragment)},l(a){N(e.$$.fragment,a)},m(a,t){j(e,a,t),r=!0},p(a,t){const i=t&1?ce(s,[ue(a[1])]):{};t&16&&(i.$$scope={dirty:t,ctx:a}),e.$set(i)},i(a){r||(w(e.$$.fragment,a),r=!0)},o(a){V(e.$$.fragment,a),r=!1},d(a){G(e,a)}}}function Ge(o){let e,r,s=z(o[0]),n=[];for(let t=0;t<s.length;t+=1)n[t]=pe(ve(o,s,t));const a=t=>V(n[t],1,1,()=>{n[t]=null});return{c(){for(let t=0;t<n.length;t+=1)n[t].c();e=ae()},l(t){for(let i=0;i<n.length;i+=1)n[i].l(t);e=ae()},m(t,i){for(let l=0;l<n.length;l+=1)n[l]&&n[l].m(t,i);k(t,e,i),r=!0},p(t,[i]){if(i&1){s=z(t[0]);let l;for(l=0;l<s.length;l+=1){const c=ve(t,s,l);n[l]?(n[l].p(c,i),w(n[l],1)):(n[l]=pe(c),n[l].c(),w(n[l],1),n[l].m(e.parentNode,e))}for(se(),l=s.length;l<n.length;l+=1)a(l);re()}},i(t){if(!r){for(let i=0;i<s.length;i+=1)w(n[i]);r=!0}},o(t){n=n.filter(Boolean);for(let i=0;i<n.length;i+=1)V(n[i]);r=!1},d(t){t&&f(e),ie(n,t)}}}function Re(o){return[[{icon:"icons/mats.jpg",date:"May 2024 - Sep 2024",title:"MATS Program",text:"Mechanistic interpretability stream with Neel Nanda and Lee Sharkey. Wrote an ICLR paper and two ICML workshop papers."},{icon:"icons/cuberdon.jpeg",date:"Jul 2022 - Sep 2022",title:"Cuberdon Software Solutions",text:"Full-stack development with Vue and ASP.NET for a customer portal."},{icon:"icons/keysight.png",date:"Sep 2021 - Jun 2022",title:"Keysight Technologies",text:"Research to predict the power consumption of embedded devices."},{date:"Mar 2021 - Sep 2021",icon:"icons/uza.png",title:"Antwerp University Hospital",text:"Data analysis of food temperature for premature babies."}]]}class We extends q{constructor(e){super(),U(this,e,Re,Ge,O,{})}}function Fe(o){let e,r,s='<i class="fas fa-lg fa-award"></i>',n,a,t,i,l,c,$;return{c(){e=m("div"),r=m("span"),r.innerHTML=s,n=D(),a=m("span"),t=P(o[0]),i=D(),l=m("small"),c=m("i"),$=P(o[1]),this.h()},l(d){e=g(d,"DIV",{class:!0});var h=p(e);r=g(h,"SPAN",{class:!0,"data-svelte-h":!0}),F(r)!=="svelte-1sauycg"&&(r.innerHTML=s),n=M(h),a=g(h,"SPAN",{});var v=p(a);t=B(v,o[0]),i=M(v),l=g(v,"SMALL",{});var I=p(l);c=g(I,"I",{});var b=p(c);$=B(b,o[1]),b.forEach(f),I.forEach(f),v.forEach(f),h.forEach(f),this.h()},h(){_(r,"class","icon is-medium"),_(e,"class","icon-text")},m(d,h){k(d,e,h),u(e,r),u(e,n),u(e,a),u(a,t),u(a,i),u(a,l),u(l,c),u(c,$)},p(d,[h]){h&1&&Q(t,d[0]),h&2&&Q($,d[1])},i:J,o:J,d(d){d&&f(e)}}}function Je(o,e,r){let{title:s}=e,{date:n}=e;return o.$$set=a=>{"title"in a&&r(0,s=a.title),"date"in a&&r(1,n=a.date)},[s,n]}class ze extends q{constructor(e){super(),U(this,e,Je,Fe,O,{title:0,date:1})}}function $e(o,e,r){const s=o.slice();return s[1]=e[r],s}function be(o){let e,r;const s=[o[1]];let n={};for(let a=0;a<s.length;a+=1)n=oe(n,s[a]);return e=new ze({props:n}),{c(){T(e.$$.fragment)},l(a){N(e.$$.fragment,a)},m(a,t){j(e,a,t),r=!0},p(a,t){const i=t&1?ce(s,[ue(a[1])]):{};e.$set(i)},i(a){r||(w(e.$$.fragment,a),r=!0)},o(a){V(e.$$.fragment,a),r=!1},d(a){G(e,a)}}}function Oe(o){let e,r,s=z(o[0]),n=[];for(let t=0;t<s.length;t+=1)n[t]=be($e(o,s,t));const a=t=>V(n[t],1,1,()=>{n[t]=null});return{c(){e=m("div");for(let t=0;t<n.length;t+=1)n[t].c();this.h()},l(t){e=g(t,"DIV",{class:!0});var i=p(e);for(let l=0;l<n.length;l+=1)n[l].l(i);i.forEach(f),this.h()},h(){_(e,"class","box")},m(t,i){k(t,e,i);for(let l=0;l<n.length;l+=1)n[l]&&n[l].m(e,null);r=!0},p(t,[i]){if(i&1){s=z(t[0]);let l;for(l=0;l<s.length;l+=1){const c=$e(t,s,l);n[l]?(n[l].p(c,i),w(n[l],1)):(n[l]=be(c),n[l].c(),w(n[l],1),n[l].m(e,null))}for(se(),l=s.length;l<n.length;l+=1)a(l);re()}},i(t){if(!r){for(let i=0;i<s.length;i+=1)w(n[i]);r=!0}},o(t){n=n.filter(Boolean);for(let i=0;i<n.length;i+=1)V(n[i]);r=!1},d(t){t&&f(e),ie(n,t)}}}function qe(o){return[[{title:"3rd place in the Belgian cyber security challenge",date:"(2023)"},{title:"2nd place on collaborative math olympiad: Wiskunnend Wiske",date:"(2018)"},{title:"4-time semi-finalist in Flemish science olympiads",date:"(2016 - 2018)"},{title:"6-time top 100 in Flemish Math Olympiad",date:"(2010 - 2018)"}]]}class Ue extends q{constructor(e){super(),U(this,e,qe,Oe,O,{})}}function Ke(o){let e,r,s,n="Education",a,t,i,l,c,$="Work Experience",d,h,v,I,b,L,S="Languages",E,C,R,H,y,K="Awards",X,A,Y;return t=new He({}),h=new We({}),C=new Ne({}),A=new Ue({}),{c(){e=m("div"),r=m("div"),s=m("h5"),s.textContent=n,a=D(),T(t.$$.fragment),i=D(),l=m("div"),c=m("h5"),c.textContent=$,d=D(),T(h.$$.fragment),v=D(),I=m("div"),b=m("div"),L=m("h5"),L.textContent=S,E=D(),T(C.$$.fragment),R=D(),H=m("div"),y=m("h5"),y.textContent=K,X=D(),T(A.$$.fragment),this.h()},l(x){e=g(x,"DIV",{class:!0});var W=p(e);r=g(W,"DIV",{class:!0});var Z=p(r);s=g(Z,"H5",{class:!0,"data-svelte-h":!0}),F(s)!=="svelte-1ye3yd"&&(s.textContent=n),a=M(Z),N(t.$$.fragment,Z),Z.forEach(f),i=M(W),l=g(W,"DIV",{class:!0});var ee=p(l);c=g(ee,"H5",{class:!0,"data-svelte-h":!0}),F(c)!=="svelte-jmer1s"&&(c.textContent=$),d=M(ee),N(h.$$.fragment,ee),ee.forEach(f),W.forEach(f),v=M(x),I=g(x,"DIV",{class:!0});var te=p(I);b=g(te,"DIV",{class:!0});var le=p(b);L=g(le,"H5",{class:!0,"data-svelte-h":!0}),F(L)!=="svelte-17e3z78"&&(L.textContent=S),E=M(le),N(C.$$.fragment,le),le.forEach(f),R=M(te),H=g(te,"DIV",{class:!0});var ne=p(H);y=g(ne,"H5",{class:!0,"data-svelte-h":!0}),F(y)!=="svelte-9th1z3"&&(y.textContent=K),X=M(ne),N(A.$$.fragment,ne),ne.forEach(f),te.forEach(f),this.h()},h(){_(s,"class","title ml-2 is-5"),_(r,"class","column is-5"),_(c,"class","title ml-2 is-5"),_(l,"class","column is-7"),_(e,"class","columns"),_(L,"class","title ml-2 is-5"),_(b,"class","column is-4"),_(y,"class","title ml-2 is-5"),_(H,"class","column is-8"),_(I,"class","columns")},m(x,W){k(x,e,W),u(e,r),u(r,s),u(r,a),j(t,r,null),u(e,i),u(e,l),u(l,c),u(l,d),j(h,l,null),k(x,v,W),k(x,I,W),u(I,b),u(b,L),u(b,E),j(C,b,null),u(I,R),u(I,H),u(H,y),u(H,X),j(A,H,null),Y=!0},p:J,i(x){Y||(w(t.$$.fragment,x),w(h.$$.fragment,x),w(C.$$.fragment,x),w(A.$$.fragment,x),Y=!0)},o(x){V(t.$$.fragment,x),V(h.$$.fragment,x),V(C.$$.fragment,x),V(A.$$.fragment,x),Y=!1},d(x){x&&(f(e),f(v),f(I)),G(t),G(h),G(C),G(A)}}}class et extends q{constructor(e){super(),U(this,e,null,Ke,O,{})}}export{et as component};
