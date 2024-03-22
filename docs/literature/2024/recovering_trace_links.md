---
title: "Recovering Trace Links Between Software Documentation And Code"
displayed_sidebar: rootSidebar
# hide_table_of_contents: true
---
# [Recovering Trace Links Between Software Documentation And Code](https://doi.org/10.5445/IR/1000165692)
## Abstract
Introduction Software development involves creating various artifacts at different levels of abstraction and establishing relationships between them is essential. Traceability link recovery (TLR) automates this process, enhancing software quality by aiding tasks like maintenance and evolution. However, automating TLR is challenging due to semantic gaps resulting from different levels of abstraction. While automated TLR approaches exist for requirements and code, architecture documentation lacks tailored solutions, hindering the preservation of architecture knowledge and design decisions.
Methods This paper presents our approach TransArC for TLR between architecture documentation and code, using component-based architecture models as intermediate artifacts to bridge the semantic gap. We create transitive trace links by combining the existing approach ArDoCo for linking architecture documentation to models with our novel approach ArCoTL for linking architecture models to code.
Results We evaluate our approaches with five open-source projects, comparing our results to baseline approaches. The model-to-code TLR approach achieves an average F1-score of 0.98, while the documentation-to-code TLR approach achieves a promising average F1-score of 0.82, significantly outperforming baselines.
Conclusion Combining two specialized approaches with an intermediate artifact shows promise for bridging the semantic gap. In future research, we will explore further possibilities for such transitive approaches.

<a href="/literature/2024/icse-24-tlr.pdf">
  <FAIcon icon="fa-solid fa-file-pdf" size="1x" /><b> Download Preprint</b>
</a>

## BibTeX
```bibtex
@inproceedings{keim_recovering_2024,
    author       = {Keim, Jan and Corallo, Sophie and Fuchß, Dominik and Hey, Tobias and Telge, Tobias and Koziolek, Anne},
    year         = {2024},
    title        = {Recovering Trace Links Between Software Documentation And Code},
    eventtitle   = {46th International Conference on Software Engineering},
    eventdate    = {2024-04-14/2024-04-20},
    booktitle    = {Proceedings of 46th International Conference on Software Engineering (ICSE 2024)}
}
```