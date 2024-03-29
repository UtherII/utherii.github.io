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
    GroupBy: "last",
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
    initHelp();

    // Init sidebar
    setUnfoldSidebar();

    // get the name of the first page to load from page parameter
    let docPage = defaultPage;
    let realUrl = location.toString();
    if (realUrl.indexOf("?item=") > 0) {
        docPage = realUrl.replace(/.*?\?item=(.*)/,"$1");
    }

    // load the page
    await goToPage(docPage, false);

    // init history handling
    history.replaceState({url: docPage, scroll: 0},"");
    onpopstate = historyMove;

    // init GUI components
    handleScrolling();
    initFilterButtons();
    initInfobox();
    initSlider();
    refreshContent();
}

//*******************************************
// Perform the full operation of opening a documentation page (typicaly when a link is clicked)
//*******************************************
async function goToPage(url, history = true){
    //set page the change in history (unless the history has already been handled)
    if (history) {
        if (url.startsWith("#")) {
            let docPage = location.search.replace("?item=","")
            historyInsert(docPage + url);
        }
        else {
            historyInsert(url);
        }
    }
    //load the page if it is a new one
    if (!url.startsWith("#")){
        await loadDocPage(url);
        refreshContent();
        sidebarCurrent(url);
    }
    //move to the anchor if necessary
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
    label = label.replace(/<br>/g,"");
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
//Merge two path treating ".." on the second argument 
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
    goToPage(url, false);
    document.querySelector(".content").scrollTop = event.state.scroll;
}
function historyInsert(url) {
    let eltContent = document.querySelector(".content");
    let oldState = { url: window.location.href, scroll: eltContent.scrollTop };
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
    menubarItemColor(document.querySelector("#menu_details"), document.querySelector("#details"));
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
    let opacity = ratio * 0.6 + 0.4;
    menu_item.style.setProperty("opacity", opacity);
}

//*******************************************
// Method filter button
//*******************************************
const methodFilters = [
    {storageKey:"DisplayOperator", buttonId:"btn_operator", implField:"operators", default: false},
    {storageKey:"DisplayConvert", buttonId:"btn_convert", implField:"convert", default: false},
    {storageKey:"DisplayIterator", buttonId:"btn_iterator", implField:"iterator", default: false},
    {storageKey:"DisplayBlanket", buttonId:"btn_blanket", implField:"blanket", default: false},
    {storageKey:"DisplayAuto", buttonId:"btn_synthetic", implField:"synthetic", default: true}
];
function initFilterButtons(){
    setFilterSelect("select_groupby", "GroupBy")
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
function setFilterButton(buttonId, stateName, stateDefaut){
    //Get the initial value
    let state;
    if (config[stateName]=="last"){
        let lsValue = localStorage.getItem(stateName);
        state = lsValue == null ? stateDefaut : lsValue == "true";
    }
    else{
        state = config[stateName] == "true";
    }

    //Set the image
    let img = document.getElementById(buttonId);
    function updateIcon(){
        img.style.border = state ? "2px outset var(--table-header-bg)" : "2px inset var(--table-header-bg)";
        img.style.opacity = state ? 1.0 : 0.5;
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
function setFilterSelect(selectId, stateName){
    //Get the initial value
    let state;
    if (config[stateName]=="last"){
        let lsValue = localStorage.getItem(stateName);
        state = lsValue == null ? "impl" : lsValue;  
    }
    else{
        state = config[stateName];
    }

    //Set the list element
    let select = document.getElementById(selectId);
    select.value = state;    
    select.onclick = function(evt){
        state = evt.target.value;
        localStorage.setItem(stateName, state);
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
function setPopupHover(elt, content) {           
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
    setPopupHover(button,panel);   
}

function setTheme(id){
    localStorage.setItem("Theme",id);
    document.documentElement.className=id;
}

//*****************************************
// Help message
//*****************************************
function initHelp(){
    // Set the help panel to pop up
    let panel = document.querySelector("#help_message");
    let button = document.querySelector("#help_btn");
    setPopupHover(button,panel);   
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
