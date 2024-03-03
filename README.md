# Why that?
I do not feel at ease with the way the rustdoc generated pages are currently structured. I fell that the docs are not easy enough to read and navigate into, especially on types with many methods with many different implementations.

I had a few ideas on how to improve the situation, so I decided to experiment them on a tiny proof of concept, demonstrating what I expect from the generated rustdoc to look like. By tinkering it and from feedback from the internal forum, I came up with a huge list of ideas to improve the documentation I would like to discus. Some of them are demonstrated in the prototype.
The prototype is available [there](https://utherii.github.io/new2.html), but keep in mind that it is absolutely not and will never be usable as a final product (Full javaScript, using old rustdoc data, no accessibility, no mobile mode, no source view, lot of bug, lot of missing features, ...). I just use it to test quickly new ideas. 

# List of the different ideas I would like to be considered for rustdoc :

## Rusty theme
### What:
 - Add a new theme inspired by the "Rust" theme from mdBook
### Why: 
 - Because I like it
 - It is a (mostly) light theme but still pretty different from the existing one. 
### Detail:
 - I would like to name it Rusty instead of Rust in mdBook to avoid confusion with the language name. It may seem it is some kind of official theme.   
### Questions: 
 - Is there a limit to the number of themes we want to support ?
 - Since the number of themes increase, should we use to a dropdown instead of many radio buttons to select the theme ? 
 - Do we need an authorization from mdbook author(s) ?
### What's in the prototype:
 - The prototype is based on the mdbook theme system. It use the rust style by default

## SearchbSar on the sidebar
### What:
 - Move the searchbar, the gear button and the help button to the sidebar
### Why:
 - Make them easier to reach, even without keyboard shortcut
 - The search bar does not need to be large
 - Keep all the features with a whole general scope in the sidebar.
### Question:
 - How to handle mobile mode
### Issues to solve:
 - The placeholder text should be shortened
 - The popups should be modified to not restrained in the sidebar   
### What's in the prototype:
 - The prototype has a text field in the sidebar but it is absolutely not working
 - The prototype has only theme selection in the options and no help button .

## Tree in the sidebar
### What:
 - Introduce a tree view of the documentation entries in the sidebar
### Why:
 - A tree seem natural too represent the crate/module hierarchy and the related items.
 - Allow to navigate quickly in the tree without charging a new the page every level.
 - The items that do not belong to the crate (Keyword, Primitives, ...) are clearly displayed outside of the crate at the top level.
### Details:
 - A first, the elements in the path to the currently displayed item are unfold, but you should be able to unfold the nodes manually. 
 - Stick elements at the top when scrolling.
### Questions:
 - Does we include the implemented items in the tree too (as the current doc do), since it would be redundant with the summary (see below)
 - Do we preload the whole tree. 
 - Witch icons set use for the tree elements? The icon with initials where supposed to be placeholders but they seem to work pretty well. I'm open to suggestions.
### What's in the prototype:
 - The prototype has a functional sidebar tree.

## Integrate other kind of documentations
### What:
 - Allow in the sidebar entries not directly related to a specific element in the code. It might be used to add documentation, like the "Rust Book" for std, a Guide for a framework, ...
 - When you click on the item on the sidebar, the documentation is opened at the right side as a regular documentation page.
 - Links in doc-comments to files related to theses items would open on the right side too, as if they had been selected from the sidebar.
### Why:
 - For some crates the most interesting pieces of information are not directly in the Rustdoc. It would be interesting to directly access them from the sidebar as a regular item.
 - The documentation not directly related to code would really feel first party. 
### Details: 
 - An attribute in the crate would point to the document to integrate, for example `[!doc(mdbook = "../book", entry="The Book")]` exact syntax TBD.
### Questions:
 - Should we open in the right side, in a new browser window or offer both options.
 - What kind of doc do we want to support ?
   - Markdown files seems obvious since there is already markdown support in rustdoc
   - Link to documentation page of websites might be opened in a iframe (maybe sandboxed ?) 
   - Handling mdBooks might be more complex, but it seems interesting since it a pretty common format to write guides in the Rust community. The Rust source already include multiple mdbook and some of them are referenced in the stdlib doc-comments. 
### What's in the prototype:
 - The prototype has a "The Book" entry, but nothing happens when you click on it

## Top-bar to scroll directly to the desired section
### What:
 - Every item has a header with the most basic informations(mostly just it's name and path) and a top bar that point the different sections of the documentation : Description, Summary, Details and Source. The content of those section is detailed above
 - The items that can not be implemented (functions, constants, ...) will not get Summary and Detail sections. 
### Why:
 - Move quickly to a section from anywhere in the page. It is particularly useful to :
   - go directly to the summary, if you are looking for a method and don't need the general description.
   - go back instantly to the description or summary when browsing the details or the source.
### Details:
 - The opacity of the button change to indicate the sections currently in the scroll view.
### Questions:
 - Do we keep the sections consecutive (except maybe for Source) so we can scroll from one to the other, or do we display just one at time.  
### What's in the prototype:
 - Mostly working as intended except for the Source section that is not implemented. 

## Summary : ImplementationSpecial (and normal) implementations
### What:
 - On items that can get an implementation, define a Summary section that  the description that would include :
   -  
### Why: 
 - It is especially useful to know that some traits (Send, Copy, Iterators, PartialEq, Add, ...) are implemented on a type since it has a important impact on what you can do with those types.
 - Paradoxically you often don't need the details of the functions a trait bring to the type, because you don't use them directly (From, Add, PartialEq, ...), you already know them (Iterator), or for markers trait. 
### Questions:
  - Witch implementation should be considered special? Current ideas :
    - Trait related to operators (PatialEq, Ord, Index, Add, ...)
    - Iterator (maybe IntoIterator)
    - Copy
    - Send / Sync
### What's in the prototype:
 - The prototype inform about special implementation about operators and iterators
 - The prototype currently don't list regular implementations.

## Summary : Special (and normal) implementations
 - Display informations about special behavior caused by special Trait implementation 
 - Display a simplified list (see below) of all the regular traits implementation.
### Why: 
 - It is especially useful to know that some traits (Send, Copy, Iterators, PartialEq, Add, ...) are implemented on a type since it has a important impact on what you can do with those types.
 - Paradoxically you often don't need the details of the functions a trait bring to the type, because you don't use them directly (From, Add, PartialEq, ...), you already know them (Iterator), or for markers trait. 
### Questions:
  - Witch implementation should be considered special? Current ideas :
    - Trait related to operators (PatialEq, Ord, Index, Add, ...)
    - Iterator (maybe IntoIterator)
    - Copy
    - Send / Sync
### What's in the prototype:
 - The prototype inform about special implementation about operators and iterators
 - The prototype currently don't list regular implementations.

## Simplified types
### What:
 - At some places item definitions are shortened. The generic parameters are elided with `<...>` and the where clause is not displayed. 
 - The modified definitions are followed with a <sup>🛈</sup> 
 - The full definition is available in a hover popup.
### Why:
 - Many definitions are to complex to be displayed completely in a clean list.
### Question
 - Should we use another marker than <sup>🛈</sup>
### What's in the prototype:
 - Types are shortened in the implementation column in the summary (visible if you don't already group items by implementations) 


