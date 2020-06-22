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
        if (localStorage.getItem("GroupByImpl")=="true"){
            for (impl of content.impls) {
                //Fill the impl header
                if (isHiddenImpl(impl)) continue;
                let implRow = document.querySelector("#impl_row").content.cloneNode(true);
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

// Produce a short version of a method declaration notably 
// by eliding generics and where clause
function makeShortDeclaration(impl) {
    let out = document.createElement("span");
    let prefix = "";
    let text = "";
    let info = false;

    //methods from deref ("...Deref<Target=Type>" => "from Type") 
    if (impl.deref) {
        prefix = "from";
        //extract type between "=" and ">"
        text = impl.domDeclaration.textContent.trim();
        text = text.replace(/.*?=(.*).*>/,"$1");
    }
    //method from implementation
    else{
        let elt = impl.domDeclaration;
        let a = content.domTitle.querySelectorAll("a")
        let main_type=a[a.length-1].textContent;

        //normalize whitespace
        text = elt.textContent.trim();
        text = text.replace(/\s/g," ");

        //strip "impl<...>""
        let pos = 4;
        var impl_args="";
        if (text.startsWith("impl<")){
            pos = get_block(text,4,"<",">");
            impl_args = text.substring(4,pos);
            //if the elided arguments carry a bound, send a notice
            if (impl_args.includes(":")) info=true;
        }
        text=text.substring(pos).trim();
        
        //strip where clause 
        var pos_where = text.indexOf(" where ");
        var where_clause
        if (pos_where > 0){
            where_clause = text.substring(pos_where+7);
            text = text.substring(0,pos_where);
            //send a notice if where clause present
            info=true;
        } 

        //strip for clause and prepare a shortened one
        let pos_for = text.indexOf(" for ");
        var for_clause;
        var short_for_clause;
        if (pos_for > 0) {
            for_clause = text.substring(pos_for+5).trim();
            text = text.substring(0,pos_for);
            //if the clause is not exactly on the current type send a notice 
            if (for_clause!=main_type+impl_args) info=true;
            short_for_clause = for_clause.replace(/<.*/,"<…>");
        }

        //read the implemented trait and prepared shortened one
        var impl_trait=text.trim();
        var short_impl_trait=impl_trait.replace(/<.*/,"<…>");
        if (impl_trait.startsWith(main_type) && impl_trait!=main_type+impl_args){
            info=true
        }

        //select the final case
        if (impl_trait.startsWith(main_type)){
            //case "impl DocumentedTye for Type" => "for Type"
            if (for_clause && !for_clause.includes(main_type)){
                prefix="for";
                text=short_for_clause;
            }
            //case "impl DocumentedType" => ""
            else {
                text="";
            }
        }
        //case "impl Type for DocumentedType" => "Type"
        else {
            text=short_impl_trait;
            out.setAttribute("data-trait",short_impl_trait.replace(/<.*/,""));
        }
    }
    
    // construct the final result : prefix + text + infoTag
    if (prefix!="") {
        let elt_prefix = document.createElement("span");
        elt_prefix.className="prefix";
        elt_prefix.appendChild(document.createTextNode(prefix+" "));
        out.appendChild(elt_prefix);
    }
    
    out.appendChild(document.createTextNode(text));
    if (info) {
        out.appendChild(document.createTextNode("\xA0"))
        let sup = document.createElement("sup");
        sup.appendChild(document.createTextNode("🛈"));
        out.appendChild(sup);
    }
    return out;
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
