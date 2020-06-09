//*******************************************
// Global variables
//*******************************************
const defaultPage = "std/index.html";
const realPageUrl = location.toString().replace(/(.*?)[?#].*/,"$1");
const realPagePath = pathParent(realPageUrl);
const realPageName = pathItem(realPageUrl);
const DocItems = {
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

//*******************************************
// Init the environement 
//*******************************************
async function init(){
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

    // init scrolling handling
    handle_scrolling();
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
    label = label.replace("<br>","");
    label = label.replace(/(&nbsp;)+/g,"&nbsp;");
    dom.innerHTML = label;
    return dom;
}
// Keep only the first sentence
function firstSentence(text){
    return text.split(".",2)[0] + ".";
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

