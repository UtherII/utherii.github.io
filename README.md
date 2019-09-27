# Why that?
I do not feel at ease with the way the rustdoc generated pages are currently structured. I fell that the docs are not easy to read and navigate into, especially on types with many methods with many different implementations.

I had a few ideas on how to improve the situation, so I decided to experiment them on a tiny proof of concept, limited to two pages, demonstrating what I expect from the generated rustdoc.

# What will I do with this?

First, I would like to know if people like my alternative design, since it is quite different, it may not please everybody. Then I would like to know if the rustdoc team is intersted to use this in rustdoc. 

According to the feedback, I may work to make it part of rustdoc, work on this as a separate project or just give up the idea.

# The main differences with the existing rustdoc are :
- The sidebar is resizable and contains:
  - the search bar (searches are usually small, no need for a huge bar)
  - a expandable tree view containing:
    - the markdown documentation at first item.
    - primitives and keyword (outside of the std crate since they are not part of it).
    - the main crate and the related crates (by default the tree is open on the main crate) 
  - the tree is unfold to display the current item, but you should be able to unfold the nodes manually). 
- Menubar to switch between summary, description and the methods details anytime.
- Compact summary at the top of the pages (with icons)
  - especially useful to display the methods sorted by name
  - tooltip to display the full function and implementation declarations. 
  - method with multiple implementations are folded (useful on type like primitives)
- The block collapsing feature (too messy IMO) is replaced by sticking the current implementation at the top during scrolling

# Poc limitation
- Only two pages can be viewed: std::collection and std::collection::Hashmap 
- In the sidebar, you can only expand the book, keywords, primitives, the std crate and std::collection module.
- Lot of small functionalities missing (it's just a POC)
- The Method item in the menubar does not color correctly on Chrome


