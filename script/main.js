//*******************************************
// Global variables
//*******************************************
const defaultPage = "std/index.html"
let content;

//*******************************************
// Init the environement 
//*******************************************
async function init(){
    // get page to load from parameter
    let page = defaultPage;
    let url = location.toString();
    if (url.indexOf("?item=") > 0) {
        page = url.replace(/.*?\?item=(.*)/,"$1");
    }

    // load the page
    await loadDocPage(page);
    refreshContent();

    // init history handling
    history.replaceState({url: page, scroll: 0},"");
    onpopstate = historyMove;
}

//*******************************************
// Load the classic documentation web page
//*******************************************
async function loadDocPage(url){
    let response = await fetch(url);
    let html = await response.text();
    let dom = new DOMParser().parseFromString(html, "text/html");
    content = {};

    // Load informations for a rustdoc page
    if (dom.querySelector("meta[name=generator]").content == "rustdoc") {
        // Get item type
        //let page_type = dom.querySelector(".fqn .in-band").firstChild.textContent.toLowerCase().trim();
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

        // Get sub-items for module
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
                let current_path = url.replace(/(.*)\/.*/,"$1")
                item.href = current_path+item.type.link.replace("$",a.textContent);
                // Get description
                item.domDescription = domItem.children[1].cloneNode(true);
                // push
                content.items.push(item);
            }  
        }

        // Get implementations and methods
        
    } 

    // Load informations from a mdBook page
    else if (html.indexOf("<!-- Book generated using mdBook -->")>0) {
        alert("Book page");
    }
    else {
        alert("Not a valid rustdoc page!");
        console.log("Not a valid rustdoc page");
        return;
    }

    refreshContent();

}

//*******************************************
// Format the main section of the page according to loaded data
//*******************************************
function refreshContent(){
    // Set title
    let title = document.querySelector("#title .name");
    title.innerHTML = "";
    title.appendChild(content.domTitle);

    // Set description
    let desc = document.querySelector("#description");
    desc.innerHTML = "";
    desc.appendChild(content.domDescription);

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
            let href = item.href;
            a.href = href;
            a.onclick=function(){goToPage(href); return false;}
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
    declarationSection.innerHTML = "";
    if (content.domDeclaration) {
        declarationSection.style.display = "block";
        declarationSection.appendChild(content.domDeclaration);
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

function firstSentence(text){
    return text.split(".",2)[0] + ".";
}

async function goToPage(url){
    let oldState = { url: history.state.url, scroll: document.body.scrollTop };
    history.replaceState(oldState,"")
    let newState = { url, scroll: 0};
    history.pushState(newState, "", "new2.html?item=" + encodeURI(url));
    await loadDocPage(url);
    document.body.scrollTop = 0;
    refreshContent();
}

async function historyMove(event){
    url = event.state.url;
    await loadDocPage(url);
    refreshContent();
    document.body.scrollTop = event.state.scroll;
}