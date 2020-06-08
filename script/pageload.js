function loadRustdocContent(dom, content) {
    // Get item type
    let sidebarScript = dom.querySelector(".sidebar-elems script").textContent;
    let typeText = sidebarScript.replace(/.*ty: '(.*?)'.*/,"$1");
    content.type = DocItems[typeText];

    // Get item title as HTML
    content.domTitle = dom.querySelector(".fqn .in-band").cloneNode(true);
    
    // Get item description
    content.domDescription = dom.querySelector(".docblock:not(.type-decl):not(.attributes)").cloneNode(true);

    // Get item declaration
    let decl_src=dom.querySelector(".type-decl");
    if (decl_src){
        content.domDeclaration=decl_src.cloneNode(true);
    }

    // For module, get sub-items
    let module_items = dom.querySelectorAll(".module-item");
    if (module_items.length>0){
        content.items=[];
        for (domItem of module_items){
            let item = {};
            // Get item type
            let a = domItem.firstChild.firstChild;
            item.type = DocItems[a.className];
            // Ignore special items
            if (item.type.to) {continue;}
            // Get name
            item.name = a.textContent;
            // Get href
            item.href = a.getAttribute("href");
            // Get description
            item.domDescription = domItem.children[1].cloneNode(true);
            // push
            content.items.push(item);
        }  
    }

    // Get implementations and methods
    let impls = [];
    let fns = [];
    let cur_impl = null;
    for (item of dom.querySelectorAll("h3.impl, h4.method, h2#deref-methods")){
        //implementation
        if (item.tagName!="H4"){
            let impl = {};
            impl.text = item.firstChild.textContent;
            impl.domDeclaration = item.firstChild; 
            if (item.parentNode && item.parentNode.id=="blanket-implementations-list"){
                impl.blanket=true;
            }
            if (item.tagName=="H2") {
                impl.deref=true;
            }
            let domSince = item.querySelector("span.since");
            if (domSince) {
                impl.since = domSince.textContent;
            }
            let domSrc = item.querySelector("a.srclink")
            if (domSrc) {
                impl.src = domSrc.getAttribute("href");
            }
            impl.fns = [];
            cur_impl = impl;
            impls.push(impl);
        }
        //method
        else {
            let fn = {};
            let nameItem = item.querySelector(".fnname");
            fn.name = nameItem.firstChild.textContent;
            fn.domName= nameItem.cloneNode(true);
            let descItem = item.nextElementSibling;
            var next = item.nextElementSibling;
            if (next.querySelector(".stability .unstable")){
                fn.unstable=true;
                next=next.nextElementSibling;
            }
            if (next.querySelector(".stability .deprecated")){
                fn.deprecated=true;
                next=next.nextElementSibling;
            }
            let domSince = item.querySelector("span.since");
            if (domSince) {
                fn.since = domSince.textContent;
            }
            let domSrc = item.querySelector("a.srclink")
            if (domSrc) {
                fn.src = domSrc.getAttribute("href");
            }
            fn.shortDescription = next.textContent.split(".",2)[0] + ".";
            fn.domDescription = next.cloneNode(true); 
            cur_impl.fns.push(fn);
            fn.impl = cur_impl;
            fns.push(fn);
        }            
    }
    if (impls.length>0) { content.impls=impls; }
    if (fns.length>0) { content.fns=fns; }
} 


function loadBookContent(dom, content){
    alert("Book page not implemented yet");
}