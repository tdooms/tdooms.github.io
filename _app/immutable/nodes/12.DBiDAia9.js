import{s as ke,f as he,n as ue,h as R}from"../chunks/CRYARyhg.js";import{S as Ee,i as Le,h as v,s as y,j as m,k,f as _,b as T,n as J,l as p,d as q,r as f,w as K,o as O,p as Q,u as ee}from"../chunks/BwxSQcIe.js";import{e as P}from"../chunks/D6YF6ztN.js";function fe(l,s,i){const c=l.slice();return c[12]=s[i],c}function de(l,s,i){const c=l.slice();return c[12]=s[i],c}function _e(l,s,i){const c=l.slice();return c[17]=s[i],c}function ve(l,s,i){const c=l.slice();return c[20]=s[i],c}function me(l){let s,i,c=l[20].label+"",g,a,h,d;function u(){return l[9](l[17],l[20])}return{c(){s=v("li"),i=v("a"),g=O(c),this.h()},l(e){s=m(e,"LI",{});var o=k(s);i=m(o,"A",{class:!0});var n=k(i);g=Q(n,c),n.forEach(_),o.forEach(_),this.h()},h(){p(i,"class",a=R(l[3](l[17],l[20]))+" svelte-9pwizd")},m(e,o){q(e,s,o),f(s,i),f(i,g),h||(d=ee(i,"click",u),h=!0)},p(e,o){l=e,o&8&&a!==(a=R(l[3](l[17],l[20]))+" svelte-9pwizd")&&p(i,"class",a)},d(e){e&&_(s),h=!1,d()}}}function pe(l){let s,i=l[17].label+"",c,g,a,h,d=P(l[5]),u=[];for(let e=0;e<d.length;e+=1)u[e]=me(ve(l,d,e));return{c(){s=v("p"),c=O(i),g=y(),a=v("ul");for(let e=0;e<u.length;e+=1)u[e].c();h=y(),this.h()},l(e){s=m(e,"P",{class:!0});var o=k(s);c=Q(o,i),o.forEach(_),g=T(e),a=m(e,"UL",{class:!0});var n=k(a);for(let L=0;L<u.length;L+=1)u[L].l(n);h=T(n),n.forEach(_),this.h()},h(){p(s,"class","menu-label"),p(a,"class","menu-list")},m(e,o){q(e,s,o),f(s,c),q(e,g,o),q(e,a,o);for(let n=0;n<u.length;n+=1)u[n]&&u[n].m(a,null);f(a,h)},p(e,o){if(o&106){d=P(e[5]);let n;for(n=0;n<d.length;n+=1){const L=ve(e,d,n);u[n]?u[n].p(L,o):(u[n]=me(L),u[n].c(),u[n].m(a,h))}for(;n<u.length;n+=1)u[n].d(1);u.length=d.length}},d(e){e&&(_(s),_(g),_(a)),K(u,e)}}}function ge(l){let s,i,c,g,a,h,d;function u(){return l[10](l[12])}return{c(){s=v("li"),i=v("a"),c=O(l[12]),g=y(),this.h()},l(e){s=m(e,"LI",{class:!0});var o=k(s);i=m(o,"A",{});var n=k(i);c=Q(n,l[12]),n.forEach(_),g=T(o),o.forEach(_),this.h()},h(){p(s,"class",a=R(l[4](l[12]))+" svelte-9pwizd")},m(e,o){q(e,s,o),f(s,i),f(i,c),f(s,g),h||(d=ee(i,"click",u),h=!0)},p(e,o){l=e,o&16&&a!==(a=R(l[4](l[12]))+" svelte-9pwizd")&&p(s,"class",a)},d(e){e&&_(s),h=!1,d()}}}function be(l){let s,i,c,g,a,h,d;function u(){return l[11](l[12])}return{c(){s=v("li"),i=v("a"),c=O(l[12]),g=y(),this.h()},l(e){s=m(e,"LI",{class:!0});var o=k(s);i=m(o,"A",{});var n=k(i);c=Q(n,l[12]),n.forEach(_),g=T(o),o.forEach(_),this.h()},h(){p(s,"class",a=R(l[4](-l[12]))+" svelte-9pwizd")},m(e,o){q(e,s,o),f(s,i),f(i,c),f(s,g),h||(d=ee(i,"click",u),h=!0)},p(e,o){l=e,o&16&&a!==(a=R(l[4](-l[12]))+" svelte-9pwizd")&&p(s,"class",a)},d(e){e&&_(s),h=!1,d()}}}function we(l){let s,i,c,g,a,h,d,u='<h4 class="title is-4 has-text-right mt-2">Positive</h4>',e,o,n,L,B,H,b,I,W,N,te='<h4 class="title is-4 mt-2">Negative</h4>',X,A,F,Y,U,le=`<p class="block">Eigenvectors have a different interpretation that heatmaps. The contribution toward the output is strictly defined by whether it has positive or negative eigenvalue.  
        Strokes of the same color positively interfere while strokes of opposite color negatively interfere.
        Hence, many strokes can be seen as localized edge-detectors.</p> <p class="block">Positive eigenvectors show structure that correspond to important strokes or proto-digits.
        Negative eigenvectors show &#39;inhibitory&#39; strokes that would aversely affect the classification.</p>`,Z,j,se='Any suggestions for other models/settings? <a href="mailto:doomsthomas@gmail.com">Let me know.</a>',G=P(l[6]),E=[];for(let r=0;r<G.length;r+=1)E[r]=pe(_e(l,G,r));let $=P([1,2,3,4,5]),z=[];for(let r=0;r<5;r+=1)z[r]=ge(de(l,$,r));let x=P([5,4,3,2,1]),D=[];for(let r=0;r<5;r+=1)D[r]=be(fe(l,x,r));return{c(){s=v("div"),i=v("div"),c=v("aside");for(let r=0;r<E.length;r+=1)E[r].c();g=y(),a=v("div"),h=v("div"),d=v("div"),d.innerHTML=u,e=y(),o=v("div"),n=v("div"),L=v("ul");for(let r=0;r<5;r+=1)z[r].c();B=y(),H=v("div"),b=v("div"),I=v("ul");for(let r=0;r<5;r+=1)D[r].c();W=y(),N=v("div"),N.innerHTML=te,X=y(),A=v("img"),Y=y(),U=v("div"),U.innerHTML=le,Z=y(),j=v("small"),j.innerHTML=se,this.h()},l(r){s=m(r,"DIV",{class:!0});var w=k(s);i=m(w,"DIV",{class:!0});var t=k(i);c=m(t,"ASIDE",{class:!0});var M=k(c);for(let V=0;V<E.length;V+=1)E[V].l(M);M.forEach(_),t.forEach(_),g=T(w),a=m(w,"DIV",{class:!0});var S=k(a);h=m(S,"DIV",{class:!0});var C=k(h);d=m(C,"DIV",{class:!0,"data-svelte-h":!0}),J(d)!=="svelte-7fopls"&&(d.innerHTML=u),e=T(C),o=m(C,"DIV",{class:!0});var ie=k(o);n=m(ie,"DIV",{class:!0});var ae=k(n);L=m(ae,"UL",{});var oe=k(L);for(let V=0;V<5;V+=1)z[V].l(oe);oe.forEach(_),ae.forEach(_),ie.forEach(_),B=T(C),H=m(C,"DIV",{class:!0});var re=k(H);b=m(re,"DIV",{class:!0});var ne=k(b);I=m(ne,"UL",{});var ce=k(I);for(let V=0;V<5;V+=1)D[V].l(ce);ce.forEach(_),ne.forEach(_),re.forEach(_),W=T(C),N=m(C,"DIV",{class:!0,"data-svelte-h":!0}),J(N)!=="svelte-izf6fj"&&(N.innerHTML=te),C.forEach(_),X=T(S),A=m(S,"IMG",{src:!0,alt:!0}),Y=T(S),U=m(S,"DIV",{class:!0,"data-svelte-h":!0}),J(U)!=="svelte-zzubk3"&&(U.innerHTML=le),Z=T(S),j=m(S,"SMALL",{class:!0,"data-svelte-h":!0}),J(j)!=="svelte-m50wgd"&&(j.innerHTML=se),S.forEach(_),w.forEach(_),this.h()},h(){p(c,"class","menu"),p(i,"class","column is-one-fifth"),p(d,"class","column"),p(n,"class","tabs is-toggle is-left is-custom svelte-9pwizd"),p(o,"class","column"),p(b,"class","tabs is-toggle is-right is-custom svelte-9pwizd"),p(H,"class","column"),p(N,"class","column"),p(h,"class","columns"),he(A.src,F=l[0])||p(A,"src",F),p(A,"alt","eigenvectors"),p(U,"class","notification is-grey-light mb-1 mt-5"),p(j,"class","ml-1"),p(a,"class","column"),p(s,"class","columns")},m(r,w){q(r,s,w),f(s,i),f(i,c);for(let t=0;t<E.length;t+=1)E[t]&&E[t].m(c,null);f(s,g),f(s,a),f(a,h),f(h,d),f(h,e),f(h,o),f(o,n),f(n,L);for(let t=0;t<5;t+=1)z[t]&&z[t].m(L,null);f(h,B),f(h,H),f(H,b),f(b,I);for(let t=0;t<5;t+=1)D[t]&&D[t].m(I,null);f(h,W),f(h,N),f(a,X),f(a,A),f(a,Y),f(a,U),f(a,Z),f(a,j)},p(r,[w]){if(w&106){G=P(r[6]);let t;for(t=0;t<G.length;t+=1){const M=_e(r,G,t);E[t]?E[t].p(M,w):(E[t]=pe(M),E[t].c(),E[t].m(c,null))}for(;t<E.length;t+=1)E[t].d(1);E.length=G.length}if(w&20){$=P([1,2,3,4,5]);let t;for(t=0;t<5;t+=1){const M=de(r,$,t);z[t]?z[t].p(M,w):(z[t]=ge(M),z[t].c(),z[t].m(L,null))}for(;t<5;t+=1)z[t].d(1)}if(w&20){x=P([5,4,3,2,1]);let t;for(t=0;t<5;t+=1){const M=fe(r,x,t);D[t]?D[t].p(M,w):(D[t]=be(M),D[t].c(),D[t].m(I,null))}for(;t<5;t+=1)D[t].d(1)}w&1&&!he(A.src,F=r[0])&&p(A,"src",F)},i:ue,o:ue,d(r){r&&_(s),K(E,r),K(z,r),K(D,r)}}}function Ie(l,s,i){let c,g,a,h,d,u=1,e="noise-strong";const o=[{value:"light",label:"Light"},{value:"medium",label:"Medium"},{value:"strong",label:"Strong"}],n=[{label:"Input Noise",prefix:"noise",clickable:!0},{label:"Translation",prefix:"translate",clickable:!0},{label:"Rotation",prefix:"rotate",clickable:!0}],L=(b,I)=>h(b,I),B=b=>a(b),H=b=>a(-b);return l.$$.update=()=>{l.$$.dirty&128&&i(4,c=b=>u==b?"is-active":""),l.$$.dirty&256&&i(3,g=(b,I)=>e===`${b.prefix}-${I.value}`?"is-active":""),l.$$.dirty&384&&i(0,d=u>0?`/demos/eigenvectors/${e}/pos${u}.svg`:`/demos/eigenvectors/${e}/neg${-u}.svg`)},i(2,a=b=>i(7,u=b)),i(1,h=(b,I)=>i(8,e=`${b.prefix}-${I.value}`)),[d,h,a,g,c,o,n,u,e,L,B,H]}class Ve extends Ee{constructor(s){super(),Le(this,s,Ie,we,ke,{})}}export{Ve as component};
