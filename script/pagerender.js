//*******************************************
// Format the main section of the page according to loaded data
//*******************************************
function refreshContent(){
    // Menubar
    document.querySelector("#menu_details").style.display=content.fns ? "block" :"none";
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

    // Set special impl section
    if (content.impls){
        makeSpecialImpl();
    }

    // Set implementation section
    let otherImplSection = document.querySelector("#other_impl_section");
    if (content.domDeclaration) {
        otherImplSection.style.display = "block";
    }
    else {
        otherImplSection.style.display = "none";
    }

    // Set method summary section
    let methodSummarySection = document.querySelector("#method_summary_section");
    if (content.impls) {
        methodSummarySection.style.display = "block";
        let table=document.querySelector("#method_table");
        table.innerHTML="";
        // Display the method filter buttons
        updateFilterButtons();
        
        // Display grouped by impl
        if (localStorage.getItem("GroupBy")=="impl") {
            for (impl of content.impls) {
                //Fill the impl header
                if (isHiddenImpl(impl)) continue;
                let implRow = document.querySelector("#group_row").content.cloneNode(true);
                implRow.querySelector(".impldecl").appendChild(oneLine(impl.domDeclaration));
                implRow.querySelector(".folder img").onclick=foldImpl;
                table.appendChild(implRow);
                //Fill the methods
                for (fn of impl.fns) {
                    let fnRow = document.querySelector("#fn_row").content.cloneNode(true);
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
        else if (localStorage.getItem("GroupBy")=="name") {
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
                        fnRow.querySelector(".shortimpl").appendChild(fn.impl.domShortDeclaration.cloneNode(true));
                        headerDesc = fnRow.querySelector(".shortdesc")
                        headerDesc.appendChild(document.createTextNode(fn.shortDescription));
                        table.appendChild(fnRow); 
                        header = table.lastElementChild;   
                    }
                    // create a subrow for every function of the group
                    let fnSubRow = document.querySelector("#fn_subrow").content.cloneNode(true);
                    //let a = fnSubRow.querySelector(".shortname a");
                    //a.appendChild(document.createTextNode(fn.name));
                    fnSubRow.querySelector(".fullimpl").appendChild(oneLine(fn.impl.domDeclaration.cloneNode(true)));                    
                    if (headerDesc.textContent != fn.shortDescription) {
                        headerDesc.innerHTML="";
                        headerDesc.appendChild(document.createTextNode("…"));
                    }
                    fnSubRow.firstElementChild.style.display="none";
                    table.appendChild(fnSubRow);                                       
                }
                // make the first row expandable if there is multiple visible implementations
                if (count > 1) {
                    imgFolder = header.querySelector(".folder img");
                    imgFolder.src="img/arrow/fold.png";
                    imgFolder.onclick=foldMethod;
                    imgFolder.setAttribute("data-status","fold");
                    let shortImpl = header.querySelector(".shortimpl");
                    removeChilds(shortImpl);
                    shortImpl.appendChild(document.createTextNode("…"));
                }
                // remove the useless first subrow if there is only one visible implementation
                if (count == 1) {
                    header.nextElementSibling.remove();
                }
            }
        }
        else if (localStorage.getItem("GroupBy")=="self") {
            let groups = {}
            for (impl of content.impls) {
                for (item of impl.fns){
                    item.impl = impl;
                    let groupName = item.selfType ? item.selfType : "No self";
                    if (!groups[groupName]) { 
                        groups[groupName] = []; 
                    }
                    groups[groupName].push(item);
                }
            }            
            let groupArray = objToArray(groups, ["No self", "self", "&self", "&mut self"]);
            for (group of groupArray){
                //Fill the impl header
                let groupRow = document.querySelector("#group_row").content.cloneNode(true);
                groupRow.querySelector(".impldecl").appendChild(document.createTextNode(group.key));
                groupRow.querySelector(".folder img").onclick=foldImpl;
                table.appendChild(groupRow);
                //Fill the methods
                for (fn of group.value) {
                    let fnRow = document.querySelector("#fn_row").content.cloneNode(true);
                    fnRow.querySelector(".icon img").src = DocItems["fn"].icon;
                    let a = fnRow.querySelector(".shortname a");
                    a.appendChild(document.createTextNode(fn.name));
                    fnRow.querySelector(".shortimpl").appendChild(fn.impl.domShortDeclaration.cloneNode(true));
                    fnRow.querySelector(".shortdesc").appendChild(document.createTextNode(fn.shortDescription));
                    table.appendChild(fnRow);
                }
            }    
        }
        else if (localStorage.getItem("GroupBy")=="return") {
            let groups = {}
            for (impl of content.impls) {
                for (item of impl.fns){
                    item.impl = impl;
                    let groupName = item.returnType ? item.returnType : "()";
                    if (!groups[groupName]) { 
                        groups[groupName] = []; 
                    }
                    groups[groupName].push(item);
                }
            }            
            let groupArray = objToArray(groups, ["()", "Self"]);
            for (group of groupArray){
                //Fill the impl header
                let groupRow = document.querySelector("#group_row").content.cloneNode(true);
                groupRow.querySelector(".impldecl").appendChild(document.createTextNode(group.key));
                groupRow.querySelector(".folder img").onclick=foldImpl;
                table.appendChild(groupRow);
                //Fill the methods
                for (fn of group.value) {
                    let fnRow = document.querySelector("#fn_row").content.cloneNode(true);
                    fnRow.querySelector(".icon img").src = DocItems["fn"].icon;
                    let a = fnRow.querySelector(".shortname a");
                    a.appendChild(document.createTextNode(fn.name));
                    fnRow.querySelector(".shortimpl").appendChild(fn.impl.domShortDeclaration.cloneNode(true));
                    fnRow.querySelector(".shortdesc").appendChild(document.createTextNode(fn.shortDescription));
                    table.appendChild(fnRow);
                }
            } 
        }
    }
    else {
        methodSummarySection.style.display = "none";
    }
    
    // Set detail section
    if (content.impls) {
        let methods = document.querySelector("#details");
        for (impl of content.impls) {
            //Fill the impl header
            let groupHeader = document.createElement("div");
            groupHeader.className = "impl"
            groupHeader.appendChild(oneLine(impl.domDeclaration.cloneNode(true)));
            methods.appendChild(groupHeader);
            //Fill the methods
            for (item of impl.fns) {
                let itemHeader = document.createElement("div");
                itemHeader.className = "method";
                let itemCode = document.createElement("code");
                itemHeader.appendChild(itemCode);
                itemCode.appendChild(item.domName.cloneNode(true));
                methods.appendChild(itemHeader);
                methods.appendChild(item.domDescription.cloneNode(true));
            }
        }    
    }
}
function objToArray(obj, priorityList){
    let array = [];
    for (key of priorityList){
        let value = obj[key];
        if (value !== undefined){
            array.push({key: key, value: value});
        }
    }
    for (key in obj) {
        if (!priorityList.includes(key)){
            array.push({key: key, value: obj[key]})
        }
    }
    return array;
}
// fold/unfold function
function foldImpl(evt){
    fold(evt, "fn_row");
}
function foldMethod(evt){
    fold(evt, "fn_subrow");
}
function fold(evt, className){
    let img = evt.target;
    // invert the state
    let fold = img.getAttribute("data-status")!="fold"
    
    // Update the icon and the general status
    if (fold){
        img.setAttribute("data-status","fold");
        img.src="img/arrow/fold.png";
    }else{
        img.setAttribute("data-status","unfold");
        img.src="img/arrow/open.png";
    }
    // Update visibility of the folded lines
    let next=img.parentElement.parentElement.nextElementSibling;
    while(next.classList.contains(className)){
        next.style.display = fold?"none":"table-row";
        next=next.nextElementSibling;
    };
} 

// return if an implementation should be hidden in the summary
function isHiddenImpl(impl){
    let hidden = false;
    for (flt of methodFilters){
        if (localStorage.getItem(flt.storageKey)=="false" && impl[flt.implField]) {
            hidden = true;
        }
    } 
    return hidden; 
}

//
function get_block(str, start, open, close){
    if (str[start]!=open) return -1;
    let count =1;
    var pos;
    for (pos=start+1; count>0; pos++){
        if (pos>=str.length) return -1;
        if (str[pos]==open) count++;
        if (str[pos]==close) count--;
    }
    return pos;
}

function makeSpecialImpl() {
    let specImplList = document.getElementById("special_impl_list");
    specImplList.innerHTML = "";

    // Operator information
    let opImpl = [];
    for (impl of content.impls) {
        if (impl.operators){ 
            for (op of impl.operators){
                opImpl.push({symbol: op.symbol, impl: impl})
            }
        }
    }
    
    let groupFor = opImpl.groupBy(k=>k.impl.shortForClause);
    let groupOps = {};
    for (group in groupFor){
        let g = groupFor[group];
        let opList = g.map(o=>o.symbol)
                      .dedup()
                      .join(",");
        if (!groupOps[opList]){
            groupOps[opList]=[];
        }
        groupOps[opList].push(...g);
    }
    
    for (groupOp in groupOps){
        let subGroupFor = groupOps[groupOp].groupBy(k=>k.impl.shortForClause);

        let li=document.createElement("li");
        li.appendChild(document.createTextNode("Operators "));
        
        let first=true;
        for (op of groupOp.split(",")) {
            if (first) {first=false} else { li.appendChild(document.createTextNode(", ")); }
            let span = document.createElement("span");
            span.classList.add("opInfo");
            span.appendChild(document.createTextNode(op));
            li.appendChild(span);
        }
        
        li.appendChild(document.createTextNode(" for "));
        
        first=true;
        for (sf in subGroupFor) {
            if (first) {first=false} else { li.appendChild(document.createTextNode(", ")); }
            let span = document.createElement("span");
            span.appendChild(document.createTextNode(sf));
            li.appendChild(span);
        }
        specImplList.appendChild(li);
    }
    // Iterator information
    for (impl of content.impls) {
        if (impl.iterator){ 
            let li=document.createElement("li");
            li.appendChild(document.createTextNode("Iterator of "));
            li.appendChild(impl.iterator);
            specImplList.appendChild(li);    
        }
    }
    
    document.getElementById("special_impl_section").style.display = specImplList.childElementCount>0 ? "block" : "none";
}
// convert an array to an object 
Array.prototype.groupBy = function(key) {
    return this.reduce(
        function(acc, item) {
            (acc[key(item)] = acc[key(item)] || []).push(item);
            return acc;
        }
        , {}
    );
}
Array.prototype.dedup = function() {
    return this.reduce(
        function(unique, item) {
            return unique.includes(item) ? unique : [...unique, item];
        }
        , []
    );
}
