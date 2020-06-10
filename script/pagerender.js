//*******************************************
// Format the main section of the page according to loaded data
//*******************************************
function refreshContent(){
    // Menubar
    document.querySelector("#menu_methods").style.display=content.methods ? "block" :"none";
    document.querySelector("#menu_summary").style.display=(content.items||content.impls) ? "block" :"none";

    // Set title
    let title = document.querySelector("#title .name");
    title.innerHTML = "";
    title.appendChild(content.domTitle);

    // Set description
    let desc = document.querySelector("#description");
    desc.innerHTML = "";
    desc.appendChild(content.domDescription);
    internalLinks(content.domDescription);

    // List module item
    let itemTable = document.querySelector("#item_table");
    let itemSection = document.querySelector("#item_section");
    itemTable.innerHTML = "";
    if (content.items) {
        itemSection.style.display = "block";
        itemTable.innerHTML = "";
        for (item of content.items) {
            //icon
            let itemRow = document.querySelector("#item_row").content.cloneNode(true);
            itemRow.querySelector(".icon img").src = item.type.icon;
            //name and link
            let a = itemRow.querySelector(".shortname a")
            a.textContent = item.name;
            a.href = item.href;
            //description
            let desc = itemRow.querySelector(".shortdesc");
            desc.textContent = firstSentence(item.domDescription.textContent); 
            //push
            itemTable.appendChild(itemRow);
        }
    }
    else {
        itemSection.style.display = "none";
    }

    // Set declaration section
    let declarationSection = document.querySelector("#declaration_section");
    if (content.domDeclaration) {
        let declaration = document.querySelector("#declaration");
        declaration.innerHTML = "";
        declaration.appendChild(content.domDeclaration);
        declarationSection.style.display = "block";
    }
    else {
        declarationSection.style.display = "none";
    }

    // Set implementation section
    let implementationSection = document.querySelector("#implementation_section");
    if (content.domDeclaration) {
        implementationSection.style.display = "block";
    }
    else {
        implementationSection.style.display = "none";
    }

    // Set method summary section
    let methodSummarySection = document.querySelector("#method_summary_section");
    if (content.impls) {
        methodSummarySection.style.display = "block";
        let table=document.querySelector("#method_table");
        table.innerHTML="";
        // Display grouped by impl
        if (localStorage.getItem("GroupByImpl")=="true"){
            for (impl of content.impls) {
                if (isHiddenImpl(impl)) continue;
                let implRow = document.querySelector("#impl_row").content.cloneNode(true);
                implRow.querySelector(".impldecl").appendChild(oneLine(impl.domDeclaration));
                table.appendChild(implRow);
                for (fn of impl.fns) {
                    let fnRow = document.querySelector("#fn_row").content.cloneNode(true);
                    //TODO:arrow
                    fnRow.querySelector(".icon img").src = DocItems["fn"].icon;
                    let a = fnRow.querySelector(".shortname a");
                    a.appendChild(document.createTextNode(fn.name));
                    fnRow.querySelector(".shortimpl").style.display="none";
                    fnRow.querySelector(".shortdesc").appendChild(document.createTextNode(fn.shortDescription));
                    table.appendChild(fnRow);
                }
                table.appendChild(implRow);
            }    
        }
        // Display grouped by function name
        else {
            for (fnName in content.fns) {
                let fnList = content.fns[fnName];
                let count = 0;
                let header;
                let headerDesc;
                for (fn of fnList){
                    if (isHiddenImpl(fn.impl)) continue;
                    count++;
                    // create a normal row for the first function of the group 
                    if (count==1){
                        let fnRow = document.querySelector("#fn_row").content.cloneNode(true);
                        let a = fnRow.querySelector(".shortname a");
                        a.appendChild(document.createTextNode(fn.name));
                        fnRow.querySelector(".shortimpl").appendChild(makeSortImpl(fn.impl));
                        headerDesc = fnRow.querySelector(".shortdesc")
                        headerDesc.appendChild(document.createTextNode(fn.shortDescription));
                        table.appendChild(fnRow); 
                        header = table.lastElementChild;   
                    }
                    // create a subrow for every function of the group
                    let fnSubRow = document.querySelector("#fn_subrow").content.cloneNode(true);
                    let a = fnSubRow.querySelector(".shortname a");
                    a.appendChild(document.createTextNode(fn.name));
                    fnSubRow.querySelector(".fullimpl").appendChild(oneLine(fn.impl.domDeclaration));                    
                    if (headerDesc.textContent != fn.shortDescription) {
                        headerDesc.innerHTML="";
                        headerDesc.appendChild(document.createTextNode("…"));
                    }
                    table.appendChild(fnSubRow);                                       
                }
                // make the first row expandable if there is multiple visible implementations
                if (count > 1) {
                    let shortImpl = header.querySelector(".shortimpl");
                    removeChilds(shortImpl);
                    shortImpl.appendChild(document.createTextNode("…"));
                }
                // remove useless first subrow if there is only one visible implementation
                else {
                    header.nextElementSibling.remove();
                }
            }
        }       
    }
    else {
        methodSummarySection.style.display = "none";
    }
    
    // Set method section
    let methods = document.querySelector("#methods");
    if (content.methods) {
        methods.style.display = "block";
    }
    else {
        methods.style.display = "none";
    }
    internalLinks(document.body);
}

// return if an implementation should be hidden in the summary
function isHiddenImpl(impl){
    return false; //TODO
}

function makeSortImpl(impl){
    return document.createTextNode("Todo<…>🛈")
}
//*******************************************
// Change links to load doc internaly if possible
//*******************************************
function internalLinks(dom){
    let currentItemPath = pathParent(content.docPage);
    for (a of dom.querySelectorAll("a")){
        let originalLink = a.getAttribute("href");
        let href;
        // if it is an empty or an absolute link keep it unchanged
        if (originalLink==null
            ||originalLink.startsWith("http:")
            ||originalLink.startsWith("https:")
            ||originalLink.startsWith("javascript:"))
        {
            continue;
        }
        // if there is only a tag, we stay on the same page 
        else if (originalLink.startsWith("#")) {
            let rawPage = content.docPage.replace(/#.*/,"");
            href = rawPage + originalLink;
        }
        // set the new sub-page relative to the current one
        else {
            href = pathMerge(currentItemPath, originalLink);
        }
        a.href = realPageUrl + "?item=" + href;
        a.onclick = function(){ goToPage(href); return false; }
    }
}

