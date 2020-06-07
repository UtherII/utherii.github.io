//*******************************************
// Global variables
//*******************************************
const defaultPage = "std/index.html"

//*******************************************
// Init the environement 
//*******************************************
async function init(){
    // get page to load from parameter
    let docPage = defaultPage;
    let realUrl = location.toString();
    if (realUrl.indexOf("?item=") > 0) {
        docPage = realUrl.replace(/.*?\?item=(.*)/,"$1");
    }

    // load the page
    await loadDocPage(docPage);
    refreshContent();

    // init history handling
    history.replaceState({url: docPage, scroll: 0},"");
    onpopstate = historyMove;

    // init scrolling handling
    handle_scrolling();
}

//*******************************************
// Load the classic documentation web page
//*******************************************
async function goToPage(url){
    let eltContent = document.querySelector(".content");
    let oldState = { url: history.state.url, scroll: eltContent.scrollTop };
    history.replaceState(oldState,"")
    let newState = { url, scroll: 0};
    history.pushState(newState, "", "new2.html?item=" + encodeURI(url));
    await loadDocPage(url);
    eltContent.scrollTop = 0;
    refreshContent();
}

async function loadDocPage(docPage){
    let response = await fetch(docPage);
    let html = await response.text();
    let dom = new DOMParser().parseFromString(html, "text/html");
    content = { docPage };

    // Load informations for a rustdoc page
    if (dom.querySelector("meta[name=generator]").content == "rustdoc") {
        loadRustdocContent(dom, content);
    }
    // Load informations from a mdBook page
    else if (html.indexOf("<!-- Book generated using mdBook -->")>0) {
        loadBookContent(dom, content);
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
        let table=document.querySelector("#method_table");
        table.innerHTML="";
        for (impl of content.impls) {
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
//*******************************************
// Generic functions
//*******************************************
// Remove all <br> and merge multiple &nbsp;
function oneLine(dom){
    let label = dom.innerHTML;
    label = label.replace("<br>","");
    label = label.replace(/(&nbsp;)+/g,"&nbsp;");
    dom.innerHTML = label;
    return dom;
}
// Keep only the first sentence
function firstSentence(text){
    return text.split(".",2)[0] + ".";
}
// Change links to load doc internaly if possible
function internalLinks(dom){
    for (a of dom.querySelector("a")){
        let link = a.href;
        if (link.startsWith("http:")||link.startsWith("https:")){
            return;
        }
        let href = a.href
        a.onclick=function(){goToPage(href); return false;}
    }
}
//*******************************************
// Handle navigator history
//*******************************************
async function historyMove(event){
    url = event.state.url;
    await loadDocPage(url);
    refreshContent();
    document.querySelector(".content").scrollTop = event.state.scroll;
}

//*******************************************
// Scrolling management (stick + menubar color)
//*******************************************
function handle_scrolling(){
    domContent = document.querySelector(".content")
    domContent.addEventListener("scroll",update_on_scrolling);
    update_on_scrolling();
}        
function update_on_scrolling(evt){
    manage_color(document.querySelector("#menu_summary"), document.querySelector("#summary"));
    manage_color(document.querySelector("#menu_description"), document.querySelector("#description"));
    manage_color(document.querySelector("#menu_methods"), document.querySelector("#methods"));
    //manage_stick();    
}
function manage_color(menu_item, item){
    domContent = document.querySelector(".content")
    let view_begin = domContent.scrollTop;
    let view_end = view_begin + domContent.clientHeight;
    let elt_begin = item.offsetTop - domContent.clientTop;
    let elt_end = elt_begin + item.offsetHeight;
    let elt_size = elt_end - elt_begin;
    
    // compute item_displayed_height / viewable_height
    var ratio;
    if (elt_begin<view_begin) {
        if (elt_end<view_begin) {
            ratio=0;
        }
        else if (elt_end<view_end) {
            ratio = Math.max(
                (elt_end-view_begin)/domContent.clientHeight,
                (elt_end-view_begin)/elt_size
            );
        }
        else{
            ratio=1;
        }
    }
    else if (elt_begin<view_end){
        if (elt_end<view_end) {
            ratio=1;
        }
        else {
            ratio = Math.max(
                (view_end-elt_begin)/domContent.clientHeight,
                (view_end-elt_begin)/elt_size
            );
        }
    }else {
        ratio = 0;
    }
    // compute item_displayed_height / item_height
    let opacity = ratio * 0.5 + 0.5;
    menu_item.style.setProperty("opacity", opacity);
}

