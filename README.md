# Rusty theme
### What:
 - Add a new theme inspired by the "Rust" theme from mdBook
### Why: 
 - Because I like it
 - It is a (mostly) light theme but still pretty different from the existing one. 
### Details:
 - I would like to name it Rusty instead of Rust in mdBook to avoid confusion with the language name. The Rust name make it look like some kind of official theme.   
### Questions: 
 - Is there a limit to the number of themes we want to support ?
 - Since the number of themes increase, should we resort on a dropdown instead of many radio buttons to select the theme ? 
 - Should we support other themes from mdbook too ? They seem less interesting to me since there are already two dark themes.
 - Do we need an authorization from mdbook author(s) ?
### What's in the prototype:
 - The prototype support all theme from mdBook including "rust", since it is based on the themes system from mdbook. I did it that way because rustdoc was not using css variables when I initiated the prototype. The Rust theme is used by default.

# Searchbar on the sidebar
### What:
 - Move the searchbar, the gear button and the help button to a fixed area at the top of the sidebar.
### Why:
 - Make them easier to reach from everywhere in the documentation, since most people don't remember keyboard shortcuts are available.
 - The search bar does not need to be so large.
 - Keep all the features with a general scope in the sidebar.
### Question:
 - How to handle mobile mode?
### Issues to solve:
 - The placeholder text should be shortened.
 - The popups should be modified to go across the sidebar slider.   
### What's in the prototype:
 - The prototype has a text field in the sidebar but it is absolutely not working.
 - The prototype has only theme selection in the options and no help button.

# Tree in the sidebar
### What:
 - Introduce a tree view of the documentation entries in the sidebar
### Why:
 - The sidebar content is currently disturbing. It mix content from the current item and sometimes content from the higher level.
 - A tree seem natural to represent the module hierarchy.
 - Allow to navigate quickly in the tree without charging all intermediate level pages.
### Details:
 - The crate module is displayed at top level along with other items that do not actually belong the the crate hierarchy like keywords, primitives, related crates or additional documentation (see `Integrate additional documentation`).
 - The path to the current item is unfold by default. 
 - The current item is highlighted.
 - While scrolling the tree, the last element of each level of the tree is stuck at the top.
### Questions:
 - Does we include the sub-items (variants, fields, implemented items, ...) in the tree too (as the current doc display them on sidebar), since it would be redundant with the summary (see `Summary: Table`)
 - Do we preload the whole tree (may be heavy, especially if we include sub-items), or do we load the tree content on demand (JavaScript required). 
 - Can we find better icons ? In my prototype, for items below the module level, I used initials ('s' for struct, 'e' for enum, ...) with the same color code than the current documentation. They where supposed to be placeholders, but it is more clear than any alternative icon I tried.
### What's in the prototype:
 - The prototype has a functional sidebar tree, except for 'The book' entry.

# Integrate additional documentations
### What:
 - Integrate documentations that are currently provided separately, like the "Rust Book" for the rust official documentation, guides for framework documentation, ...
 - Attributes in the crate would define the path to documents to integrate and it's name and location on the documentation tree, for example `#![doc(mdbook="../book", entry="Learning/The Book")]`. Exact syntax TBD.
 - The integrated documentation would appear on the sidebar. When you click on it, it is opened at the right panel as a regular documentation page.
 - Links in doc-comments to integrated items would open on the right side too, as if they had been selected from the sidebar.
 - Searches would be able to return entries from the related documents, along with doc-commented items 
### Why:
 - For some crates the most interesting pieces of information are not directly in the Rustdoc. It's useful to discover them have direct access to them from the rustdoc. 
### Questions:
 - What kind of doc do we want to support ?
   - Markdown files seems obvious since there is already markdown support in rustdoc
   - Link to documentation page on websites would be convenient. It might be opened in a iframe (maybe sandboxed ?) 
   - Handling mdBooks might be more complex, but it seems interesting since it is a pretty common format to write guides in the Rust community. The Rust source already include multiple mdbook and some of them are referenced in the stdlib doc-comments. 
 - Should we :
   - open in the right part? (it feels really nicer to me, but might not match perfectly how some existing documentations are organized)
   - just open in the doc in a new window? (easier)
   - offer the choice with and `integrated = false` parameter on the attribute. If so, what should be the default ?
### What's in the prototype:
 - The prototype has a "The Book" entry, but nothing happens yet when you click on it

# Top-bar to scroll directly to the desired section
### What:
 - Every item has a small header that stay on top while scrolling. I contains the most basic informations about the currently selected item and a top bar that point the different sections of the documentation : Description, Summary, Details and Source. 
 - The items with no sub-item (functions, constants, ...) will only get the Description and Source sections. 
### Why:
 - The bar allow to move quickly to a section from anywhere in the page. It is particularly useful to :
   - go directly to the summary, if you are looking for a method and don't need the general description.
   - go back instantly to the description or summary when browsing the details or the source.
### Details:
 - The opacity of the button change to indicate the sections currently in the scroll view.
### Questions:
 - Do we keep the sections consecutive (except maybe for Source) so we can scroll from one to the other, or do we display just one at time.  
### What's in the prototype:
 - Mostly working as intended, except for the Source section that is not implemented. 

# Summary : Special (and normal) implementations
 - Display at the top of the summary section informations about behavior caused by special Trait implementation. For example :
   - Operators ==, !=, [], <, <=, >, >=  available for Vec<T>>
   - Can be iterated providing `&'a T` items (IntoIterator<sup>🛈</sup))
   - Automatically copied (Copy)
   - Can not be sent to other thread (!Send)
 - Display a comma separated list of all the regular traits implementations with shortened notation(see `shortened definition`).
### Why: 
 - It is especially useful to know that some traits (Send, Copy, Iterators, PartialEq, Add, ...) are implemented on a type since it has a important impact on what you can do with those types.
 - Paradoxically you often don't need the details of the functions a trait bring to the type, because you don't use them directly (From, Add, PartialEq, ...), you already know them (Iterator), or for markers trait. 
### Questions:
  - Witch implementation should be considered special? Current ideas :
    - Trait related to operators (PartialEq, Ord, Index, Add, ...)
    - Iterator (maybe IntoIterator)
    - Copy
    - Send / Sync
### What's in the prototype:
 - The prototype inform only about operators and iterators (not IntoIterator).
 - The prototype currently don't list regular implementations.

# Summary : Table
### What:
 - Display a compact table listing all the functions, constants, variants, fields, ... that belong to the item or are implemented for it.
 - Each sub-item is displayed with 3 or 4 columns :
   - an icon indicating the kind of sub-item.
   - only the name of the sub-item (full declaration on tooltip).
   - if not grouped by impl, the origin(see detail) of the sub-item (full declaration on tooltip).
   - the first sentence of the doc comment.
 - Elements can be grouped by raw name, impl, return type or self type.
 - Elements from special impl, blanket imp, or auto impl can be hidden.
 ### Why
  - Allows to get a quick overview of all the elements of the type.
  - Remove most of the useless boilerplate.
  - Grouping by name can be useful on types with a lot of overridden method or if you have a idea of the name of the function you are looking for.
### Details
 - When grouping by implementation, sub-item that don't come from implementation (variants, fields, provided/required methods,...) will be displayed in groups, named after their kind, that will be displayed before actual impl groups.
 - When grouping by self type or return type, sub-items that are not functions (variants, fields, constants,...) will be displayed in groups, named after their kind, that will be displayed before the type groups.
 - The "origin" column of the sub-item contains :
   - The shortened definition (see `shortened definition`) of the trait providing the item, if applicable.
   - "<i>required</i>" or "<i>provided</i>" for functions defined inside a trait.
   - "<i>from</i> T" if the method is accessible through a `Deref<Target = T>` implementation.
### Questions
 - How should we trigger hiding :
   - Using buttons at the top of the method summary.
   - Using a `[hide/show in summary]` link at the end of the related special implementations.  
 - Should we add a warning at the end of the table : "🛈 some items are hidden"
### What's in the prototype:
  - The feature is mostly working but only for functions
  - Filtering is implemented with buttons at the top of the table.
  - Sometimes filtering does not work on page load

# Shortened implementation
### What:
 - At some places implementations will be shortened : 
   - only the implemented trait appear, when the implementer is the item being documented (or a related type)
   - only the implementer appear (prefixed by <i>for</i>), when the implemented trait is the item being documented.
 - The full impl definition is available in a hover popup.
 - There will be a <sup>🛈</sup> mark at the end of the shortened implementation inviting to look for the full implementation in the tooltip if: 
   - The type in impl clause is not exactly the type being documented (like a reference to the type or a generic using the type).
   - If there was a where clause. 
 - The generic parameters are elided with `<...>`, unless there are only one character long.
### Why:
 - Full impl definitions are too complex to be displayed completely in a short list.
### Details:
 - In comma separated list, if some implementations are identical once shortened, they appear only once in the list, but the hover popup will display all the related implementations, separated by an horizontal rule. 
### Question
 - Is there a better marker than <sup>🛈</sup>
### What's in the prototype:
 - Types are shortened in the "origin"" column in the summary (visible if you don't already group items by implementations) 
 - Generic are always elided with <...> even if they are only one character long.


