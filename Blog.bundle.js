(self.webpackChunk=self.webpackChunk||[]).push([[397],{475:(e,t,i)=>{"use strict";i.d(t,{i:()=>n});var n={ME:{link:"./me.html",title:"About me",isIndex:!0},BLOG:{link:"./blog.html",title:"Blogs"}}},341:(e,t,i)=>{"use strict";i.d(t,{U:()=>o});var n=i(788),o=function(e){var t=document.body,i=document.createElement("div");i.id="root",t.appendChild(i);var o=e();n.render(o,i)}},443:(e,t,i)=>{"use strict";i.d(t,{N:()=>m});var n=i(792),o=i(735),a=(i(601),i(947),i(820)),r=i(630),l=i(177),s=i(777),c=i(275),d=i(299),b=i(49),g=i(709),f=i(475),m=function(e){var t=(0,o.useState)(!1),i=(0,n.Z)(t,2),m=i[0],h=i[1],p=Object.values(f.i).map((function(t){return o.createElement(a.Z,{key:t.title,href:"".concat(t.link),isCurrentPage:e.currentPage.title===t.title},t.title)}));return o.createElement(r.Z,{"aria-label":"Xuanyu's Corner",id:"ui-shell-header"},o.createElement(l.Z,{"aria-label":"Open menu",onClick:function(){h(!m)},isActive:m}),o.createElement(s.Z,{href:"#",prefix:""},"Xuanyu's Corner"),o.createElement(c.Z,{"aria-label":"navigation"},p),o.createElement(d.Z,{"aria-label":"side navigation",expanded:m,isPersistent:!1},o.createElement(b.Z,{expanded:m},o.createElement(g.Z,null,p))))}},356:(e,t,i)=>{"use strict";var n=i(735),o=i(999),a=[{name:"The structure of a web project",link:"https://www.notion.so/Web-Project-28adcdb3b74344d8b87764e00991e6db"},{name:"Drag & drop: mouse events, vanilla JavaScript, and only one object",link:"https://www.notion.so/Drag-drop-mouse-events-vanilla-JavaScript-and-only-one-object-0bdcf3d0799e44cfa399fbc6d56839bf"},{name:"Drag & drop: mouse events, vanilla JavaScript, only one object, and a container",link:"https://www.notion.so/Drag-drop-mouse-events-vanilla-JavaScript-only-one-object-and-a-container-cc37a71421614cd1a46d475caeab4669"},{name:"Drag & drop: mouse events, vanilla JavaScript, MULTIPLE objects, and a container",link:"https://www.notion.so/Drag-drop-mouse-events-vanilla-JavaScript-MULTIPLE-objects-and-a-container-49dc2a706bab40d9b6f37c06e24be092"}],r=i(475),l=i(443),s=i(341),c=i(487),d=i.n(c),b=i(509);d()(b.Z,{insert:"head",singleton:!1}),b.Z.locals;var g=i(8);d()(g.Z,{insert:"head",singleton:!1}),g.Z.locals;var f="page-blog",m=function(){var e=a.map((function(e){var t=e.name,i=e.link;return n.createElement("div",{key:t,className:"".concat(f,"-list-item")},n.createElement(o.Z,{href:i},t))}));return n.createElement("div",{id:"".concat(f,"-main")},n.createElement("div",{id:"".concat(f,"-list-container")},e))};(0,s.U)((function(){return n.createElement(n.Fragment,null,n.createElement(l.N,{currentPage:r.i.BLOG}),n.createElement("div",{id:f,className:"page"},n.createElement(m,null)),";")}))},8:(e,t,i)=>{"use strict";i.d(t,{Z:()=>a});var n=i(361),o=i.n(n)()((function(e){return e[1]}));o.push([e.id,"html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;font:inherit;font-size:100%;vertical-align:baseline;border:0}button,select,input,textarea{font-family:inherit;border-radius:0}input[type=text]::-ms-clear{display:none}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section{display:block}body{line-height:1}sup{vertical-align:super}sub{vertical-align:sub}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote::before,blockquote::after,q::before,q::after{content:\"\"}table{border-collapse:collapse;border-spacing:0}*{box-sizing:border-box}button{margin:0}html{font-size:100%}body{font-weight:400;font-family:'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}code{font-family:'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace}strong{font-weight:600}@media screen and (-ms-high-contrast: active){svg{fill:ButtonText}}h1{font-size:2.625rem;font-weight:300;line-height:1.199;letter-spacing:0}h2{font-size:2rem;font-weight:400;line-height:1.25;letter-spacing:0}h3{font-size:1.75rem;font-weight:400;line-height:1.29;letter-spacing:0}h4{font-size:1.25rem;font-weight:400;line-height:1.4;letter-spacing:0}h5{font-size:1rem;font-weight:600;line-height:1.375;letter-spacing:0}h6{font-size:.875rem;font-weight:600;line-height:1.29;letter-spacing:.16px}p{font-size:1rem;font-weight:400;line-height:1.5;letter-spacing:0}a{color:#0f62fe}em{font-style:italic}@keyframes skeleton{0%{transform:scaleX(0);transform-origin:left;opacity:.3}20%{transform:scaleX(1);transform-origin:left;opacity:1}28%{transform:scaleX(1);transform-origin:right}51%{transform:scaleX(0);transform-origin:right}58%{transform:scaleX(0);transform-origin:right}82%{transform:scaleX(1);transform-origin:right}83%{transform:scaleX(1);transform-origin:left}96%{transform:scaleX(0);transform-origin:left}100%{transform:scaleX(0);transform-origin:left;opacity:.3}}.bx--link{box-sizing:border-box;margin:0;padding:0;font-size:100%;font-family:inherit;vertical-align:baseline;border:0;font-size:.875rem;font-weight:400;line-height:1.29;letter-spacing:.16px;display:inline-flex;color:#0f62fe;text-decoration:none;outline:none;transition:color 70ms cubic-bezier(0.2, 0, 0.38, 0.9)}.bx--link *,.bx--link *::before,.bx--link *::after{box-sizing:inherit}.bx--link:hover{color:#0043ce;text-decoration:underline}.bx--link:active,.bx--link:active:visited,.bx--link:active:visited:hover{color:#161616;text-decoration:underline}.bx--link:focus{outline:1px solid #0f62fe}@media screen and (prefers-contrast){.bx--link:focus{outline-style:dotted}}.bx--link:visited{color:#0f62fe}.bx--link:visited:hover{color:#0043ce}.bx--link--disabled,.bx--link--disabled:hover{box-sizing:border-box;margin:0;padding:0;font-size:100%;font-family:inherit;vertical-align:baseline;border:0;font-size:.875rem;font-weight:400;line-height:1.29;letter-spacing:.16px;color:#c6c6c6;font-weight:400;text-decoration:none;cursor:not-allowed}.bx--link--disabled *,.bx--link--disabled *::before,.bx--link--disabled *::after,.bx--link--disabled:hover *,.bx--link--disabled:hover *::before,.bx--link--disabled:hover *::after{box-sizing:inherit}.bx--link.bx--link--visited:visited{color:#8a3ffc}.bx--link.bx--link--visited:visited:hover{color:#0043ce}.bx--link.bx--link--inline{text-decoration:underline}.bx--link.bx--link--inline:focus,.bx--link.bx--link--inline:visited{text-decoration:none}.bx--link--disabled.bx--link--inline{text-decoration:underline}.bx--link--sm{font-size:.75rem;line-height:1.34;letter-spacing:.32px}.bx--link--lg{font-size:1rem;font-weight:400;line-height:1.375;letter-spacing:0}.bx--link__icon{display:inline-flex;align-self:center;margin-left:.5rem}",""]);const a=o},509:(e,t,i)=>{"use strict";i.d(t,{Z:()=>a});var n=i(361),o=i.n(n)()((function(e){return e[1]}));o.push([e.id,".page{padding-top:3rem}#page-blog{display:grid;grid-template-columns:repeat(16, 1fr)}#page-blog #page-blog-main{grid-column-start:3;grid-column-end:14;background-color:#f4f4f4;height:100vh;padding-left:2rem;padding-right:2rem}#page-blog #page-blog-main #page-blog-list-container{margin-top:2rem}#page-blog #page-blog-main #page-blog-list-container .page-blog-list-item{height:max-content;padding-top:.5rem;padding-bottom:.5rem;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#e0e0e0}",""]);const a=o}},e=>{"use strict";e.O(0,[548],(()=>(356,e(e.s=356)))),e.O()}]);