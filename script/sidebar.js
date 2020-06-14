const img_fold = "img/arrow/fold.png";
const img_open = "img/arrow/open.png";
const img_empty = "img/arrow/empty.png";

// Set the sidebar ready for the current page
async function sidebarCurrent(url){
    let path_elt = url.split("/");
    let path = ""
    var elt;
    for (var i=0; i+1<path_elt.length; i++){
        let dir = path_elt[i];
        path += dir;
        if (i==0 && path=="std") {
            if (url.includes("/keyword.")){
                elt = document.getElementById("keywords_root")
            }
            else if (url.includes("/primitives.")){
                elt = document.getElementById("keywords_root")
            }
            else  {
                elt = document.getElementById("std_root");
            }
        }
        else {
            elt = document.querySelector("li[data-path='"+path+"']")
        }
        if (elt.classList.contains("can_fold")){
            elt.classList.add("open");
            elt.firstElementChild.src=img_open;
        }
        let next = elt.nextElementSibling
        if (next && next.tagName!="UL"){
            await loadNode(elt);
        }
        path += "/";
    }
    let last=path_elt[path_elt.length-1];
    if (last!="index.html"){
        path += last.replace(/.*\.(.+?)\.html/,"$1");
        elt = document.querySelector("li[data-path='"+path+"']")
    }
    old_elt = document.querySelector(".selected");
    if (old_elt) {old_elt.classList.remove("selected")}
    elt.classList.add("selected");
}

async function loadNode(elt){
    let path = elt.getAttribute("data-path");
    if (path){
        let response = await fetch(path+"/sidebar-items.js");
        let text = await response.text();
        
        text= text.replace(/^.*?\(/,"");
        text= text.replace(/\);$/,"");
        let items = JSON.parse(text);              
        let ul = document.createElement("ul");

        var level=1;
        for (cls of elt.classList){
            if(cls.startsWith("l")){
                level=parseInt(cls.substring(1),10)+1;
            }
        }

        var types =[];
        for (item_type in items) types.push(item_type);
        sort(types, a=>DocItems[a].order);

        for (item_type of types){
            let map = DocItems[item_type];
            if (map.to && map.to!=elt.id) continue;

            for (item of items[item_type]){
                let li = document.createElement("li");
                li.className="stick l"+ level;
                li.setAttribute("data-path",path+"/"+item[0])
                let img1 = document.createElement("img");
                if (map.expand){
                    li.classList.add("can_fold");
                    img1.src=img_fold;
                    img1.onclick=function(){ liFolding(img1,true)};
                }
                else {
                    img1.src=img_empty;
                }
                li.appendChild(img1);
                let img2 = document.createElement("img");
                img2.src=map.icon;
                li.appendChild(img2);
                let a = document.createElement("a");
                let href=path+map.link.replace("$",item[0]);
                a.href=href;
                a.onclick=function(){goToPage(href); return false;}
                a.textContent=" "+item[0];
                li.appendChild(a);
                ul.appendChild(li);
            }
            if (map.to && map.to==elt.id) break;
        }
        elt.insertAdjacentElement("afterend",ul);
        return ul
    }
}

// Support unfolding in the sidebar 
function setUnfoldSidebar(elt = null) {
    if (!elt){ 
        elt = document.querySelector("#sidebar"); 
    }
    for (item of elt.querySelectorAll("li.can_fold")) {
        let arrow = item.firstElementChild;
        liFolding(arrow);
        arrow.addEventListener("click", function () {
            liFolding(arrow,true);
        }, false);
    }
}        
function liFolding(arrow, switch_state=false) {
    let li = arrow.parentElement;
    if (switch_state){
        li.classList.toggle("open");
    } 
    if (li.classList.contains("open")) {
        arrow.setAttribute("src", img_open);
        let ul = li.nextElementSibling
        if (!ul || ul.tagName!="UL"){
            ul=loadNode(li)
            setUnfoldSidebar(li);
        }
    }
    else {
        arrow.setAttribute("src", img_fold);
    }
}
function sort(array, fn){
    array.sort((a,b)=>{
        let x = fn(a);
        let y = fn(b);
        if (x<y) return -1
        else if (x>y) return 1
        else return 0;
    });
}

