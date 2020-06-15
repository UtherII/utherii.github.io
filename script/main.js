//*******************************************
// Global variables
//*******************************************
const defaultPage = "std/index.html";
const realPageUrl = location.toString().replace(/(.*?)[?#].*/,"$1");
const realPagePath = pathParent(realPageUrl);
const realPageName = pathItem(realPageUrl);
const DocItems = {
    bookshelf:{
        order:0,
        icon:"img/bookshelf.png",
        expand:true,
        link:"/$/index.html",
        to:"book_root"
    },
    book:{
        order:0, 
        icon:"img/book.png", 
        expand:true, 
        link:"/$/index.html", 
        to:"book_root"
    },
    chapter:{
        order:1, 
        icon:"img/book.png", 
        expand:true, 
        link:"/$/index.html", 
        to:"book_root"
    },
    page:{
        order:1, 
        icon:"img/book.png", 
        expand:true, 
        link:"/$/index.html", 
        to:"book_root"
    },
    keyword:{
        order:5, 
        icon:"img/item/page.png", 
        expand:false, 
        link:"/keyword.$.html", 
        to:"keywords_root"
    },
    primitive:{
        order:6, 
        icon:"img/item/block.png", 
        expand:false, 
        link:"/primitive.$.html", 
        to:"primitives_root"
    },
    crate:{
        order:10,
        icon:"img/item/crate.png",
        expand:true,
        link:"/$/index.html"
    },
    mod:{
        order:11, 
        icon:"img/item/mod.png", 
        expand:true, 
        link:"/$/index.html"
    },
    type:{
        order:12, 
        icon:"img/item/type.png", 
        link:"/type.$.html", 
        expand:false
    },
    struct:{
        order:13,
        icon:"img/item/struct.png", 
        link:"/struct.$.html", 
        expand:false
    },
    constant:{
        order:13,
        icon:"img/item/const.png", 
        link:"/constant.$.html", 
        expand:false
    },
    enum:{
        order:14, 
        icon:"img/item/enum.png", 
        link:"/enum.$.html", 
        expand:false
    },
    union:{
        order:15, 
        icon:"img/item/union.png", 
        link:"/union.$.html", 
        expand:false
    },
    trait:{
        order:16, 
        icon:"img/item/trait.png", 
        link:"/trait.$.html", 
        expand:false
    },
    fn:{
        order:17, 
        icon:"img/item/fn.png", 
        link:"/fn.$.html", 
        expand:false
    },
    macro:{
        order:18, 
        icon:"img/item/macro.png", 
        link:"/macro.$.html", 
        expand:false
    }
};
let content;
let config = {
    GroupByImpl: "last",
    DisplayOperator: "last",
    DisplayIterator: "last",
    DisplayBlanket: "last",
    DisplayAuto: "last",
    PopupDisplayDelay: 600,
    PopupCloseDelay: 200
}

//*******************************************
// Initialize the environement 
//*******************************************
async function init(){
    // Init theme first to avoid visual glitch
    initTheme();

    // Init sidebar
    setUnfoldSidebar();

    // get the name of the first page to load from page parameter
    let docPage = defaultPage;
    let realUrl = location.toString();
    if (realUrl.indexOf("?item=") > 0) {
        docPage = realUrl.replace(/.*?\?item=(.*)/,"$1");
    }

    // load the page
    goToPage(docPage, false);

    // init history handling
    history.replaceState({url: docPage, scroll: 0},"");
    onpopstate = historyMove;

    // init GUI components
    handleScrolling();
    initFilterButtons();
    initInfobox();
    initSlider();
}

//*******************************************
// Perform the full operation of opening a documentation page (typicaly when a link is clicked)
//*******************************************
async function goToPage(url, history = true){
    //set page change in history (except for first page, since it is already there)
    if (history) {
        historyInsert(url);
    }
    //load the page
    await loadDocPage(url);
    refreshContent();
    //update sidebar
    sidebarCurrent(url.replace(/#.*/,""));
    //déplacement à l'ancre si necessaire
    let domContent =  document.querySelector(".content")
    if (url.indexOf("#") > 0){
        let anchor = url.replace(/.*?#(.*)/,"$1");
        domAnchor = document.getElementById(anchor);
        if (domAnchor) { 
            let diff = globalOffsetTop(domAnchor) - globalOffsetTop(domContent);
            domContent.scrollTop=diff
        }
    }
    else{
        domContent.scrollTop = 0;
    }
}
// get the offsetTop until the root of the document
function globalOffsetTop(item){
    let top=0;    
    while (item){
        top += item.offsetTop;
        item = item.offsetParent;
    }    
    return top;
}

//*******************************************
// Formating functions
//*******************************************
// Remove all <br> and merge multiple &nbsp;
function oneLine(dom){
    let label = dom.innerHTML;
    if (!label) return dom;
    label = label.replace("<br>","");
    label = label.replace(/(&nbsp;)+/g,"&nbsp;");
    dom.innerHTML = label;
    return dom;
}

// Keep only the first sentence
function firstSentence(text){
    return text.split(".",2)[0] + ".";
}
// Remove all the childs of a node
function removeChilds(node){
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
}
//*******************************************
// path handling functions
//*******************************************
//Get the final item from a path 
function pathItem(path){
    return path.substring(path.lastIndexOf("/")+1);
}
//Remove the final item from a path 
function pathParent(path){
    //remove trailing slash
    if (path.endsWith("/")){
        path = path.slice(0,-1)
    }
    //remove after the last slash
    return path.substring(0,path.lastIndexOf("/")+1);
}
//Merge  
function pathMerge(a, b){
    while (b.startsWith("../")){
        a = pathParent(a);
        b = b.substring(3);        
    }
    return a+b;
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
function historyInsert(url) {
    let eltContent = document.querySelector(".content");
    let oldState = { url: history.state.url, scroll: eltContent.scrollTop };
    history.replaceState(oldState,"")
    let newState = { url, scroll: 0};
    history.pushState(newState, "", realPageName + "?item=" + encodeURI(url));
}
//*******************************************
// Scrolling management (stick + menubar color)
//*******************************************
function handleScrolling(){
    domContent = document.querySelector(".content")
    domContent.addEventListener("scroll",updateOnScrolling);
    updateOnScrolling();
}        
function updateOnScrolling(evt){
    menubarItemColor(document.querySelector("#menu_summary"), document.querySelector("#summary"));
    menubarItemColor(document.querySelector("#menu_description"), document.querySelector("#description"));
    menubarItemColor(document.querySelector("#menu_methods"), document.querySelector("#methods"));
    //manage_stick();    
}
// Set the opacity of the mebu
function menubarItemColor(menu_item, item){
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

//*******************************************
// Method filter button
//*******************************************
const methodFilters = [
    {storageKey:"DisplayOperator", buttonId:"btn_operator", implField:"operators", default: false},
    {storageKey:"DisplayIterator", buttonId:"btn_iterator", implField:"iterator", default: false},
    {storageKey:"DisplayBlanket", buttonId:"btn_blanket", implField:"blanket", default: false},
    {storageKey:"DisplayAuto", buttonId:"btn_synthetic", implField:"synthetic", default: true}
];
function initFilterButtons(){
    setFilterButton ("btn_group_mode", "GroupByImpl", true, ["img/arrow/tree.png","img/arrow/flat.png"]);
    for (filter of methodFilters) {
        setFilterButton (filter.buttonId, filter.storageKey, filter.default);
    }
}
function updateFilterButtons(){
    for (filter of methodFilters) {
        let button = document.getElementById(filter.buttonId);
        let count = content.impls.filter(impl=>impl[filter.implField]).length;
        button.style.display = count ? "inline-block" : "none";        
    }
}
function setFilterButton(buttonId, stateName, stateDefaut, iconSet){
    //Get the initial value
    let state;
    if (config[stateName]=="last"){
        let lsValue = localStorage.getItem(stateName);
        if (lsValue == null) {
            state = stateDefaut;
        }
        state = lsValue == "true" 
    }
    else{
        state = config[stateName] == "true";
    }

    //Set the image
    let img = document.getElementById(buttonId);
    function updateIcon(){
        if (iconSet){
            img.style.border = "2px outset var(--table-header-bg)";
            img.src = state ? iconSet[0] : iconSet[1];
        }
        else {
            img.style.border = state ? "2px outset var(--table-header-bg)" : "2px inset var(--table-header-bg)";
            img.style.opacity = state ? 1.0 : 0.5;
        }  
    }
    updateIcon();

    //Action on button clic
    img.onclick = function(){
        state = !state;
        localStorage.setItem(stateName, state);
        updateIcon();
        refreshContent();
    }

}

//*******************************************
// Popup info box management
//*******************************************
// Description popup        
let display_popup_timeout;
let hide_popup_timeout;
let infobox;
function setPopup(elt, content) {           
    elt.addEventListener("mouseenter", function (evt) {
        display_popup_timeout = setTimeout(function(){
            let x = window.scrollX + evt.target.getBoundingClientRect().left
            let y = window.scrollY + evt.target.getBoundingClientRect().top // Y

            infobox.innerHTML=content.innerHTML;
            infobox.style.display="block";
            if (x + infobox.offsetWidth < document.body.clientWidth){
                infobox.style.left="calc("+x+"px + 2.5em)";
                infobox.style.top="calc("+y+"px + 1.25em)";    
            }
            else {
                infobox.style.left="calc("+(x-infobox.offsetWidth) +"px - 0.5em)";
                infobox.style.top="calc("+y+"px + 1.25em)";    

            }
        },config.PopupDisplayDelay);
    }, false);
    
    elt.addEventListener("mouseleave", function (evt) {
        clearTimeout(display_popup_timeout);
        hide_popup_timeout = setTimeout(function(){
            infobox.style.display="none";
        },config.PopupCloseDelay);                
    }, false);
}
function initInfobox(){
    infobox = document.getElementById("infobox");

    infobox.addEventListener("mouseenter", function (evt) {
        clearTimeout(hide_popup_timeout);
        }, false);

    infobox.addEventListener("mouseleave", function (evt) {
        infobox.style.display="none";
    }, false);

    window.addEventListener("keydown", function (evt) {
        if (evt.code=="BracketRight"){
            infobox.style.display="block";
            infobox.remo
        }
        if (evt.code=="Backslash"){
            infobox.style.display="none"
        }
    })
}

//*****************************************
// Theme management
//*****************************************
// get the theme from the localStorage before loading the body
let theme = localStorage.getItem("Theme");
if (theme == null) { theme = "rust2" }
setTheme(theme);

function initTheme(){
    // Set links to switch between themes
    let panel = document.querySelector("#theme_selector");
    for (li of panel.querySelectorAll("li")){
        li.onclick = function(){setTheme(li.id.substring(6));}
    }

    // Set the theme panel to pop up
    let button = document.querySelector("#theme_btn");
    setPopup(button,panel);   
}

function setTheme(id){
    localStorage.setItem("Theme",id);
    document.documentElement.className=id;
}

//***************************************
// Sidebar resize
//***************************************
var dragging = false;
var cratetree;
function initSlider(){
    document.body.addEventListener("mousemove", dragPending);
    document.body.addEventListener("mouseup", dragEnd);
    document.getElementById("slider").addEventListener("mousedown", dragStart);
    cratetree = document.getElementById("cratetree")
}
function dragStart(evt) {
    document.body.style.setProperty("user-select", "none");
    dragging = true;
}
function dragEnd(evt) {
    if (dragging) {
        dragging = false;
        localStorage.setItem("slider", evt.pageX);
        dragPending(evt);
        document.body.style.setProperty("user-select", "auto");
    }
}
function dragPending(evt) {
    if (dragging) {
        document.body.style.setProperty("--sidebar-width", evt.pageX + "px");
        cratetree.scrollTo({ left: 0 });
    }
}
