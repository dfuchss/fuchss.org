---
layout: publication
permalink: /c/icse24/
title: Recovering Trace Links Between Software Documentation And Code
description:
publication: keim_recovering_2024
authors:
  - jan_keim
  - sophie_corallo
  - dominik_fuchss
  - tobias_hey
  - tobias_telge
  - anne_koziolek
---

Published at the [46th International Conference on Software Engineering (ICSE 2024), April 14-20 2024](https://conf.researchr.org/home/icse-2024).

Additional presentation at the [Software Engineering 2025 (SE25)](https://se2025.sdq.kastel.kit.edu/), the symposium of the German Computer Science Society (Gesellschaft für Informatik (GI)).

<p align="center">
	<img src="/assets/img/conferences/approach_overview_icse24.svg" alt="Approach Overview"/>
</p>

## Abstract

_Introduction_
Software development involves creating various artifacts at different levels of abstraction and establishing relationships between them is essential.
Traceability link recovery (TLR) automates this process, enhancing software quality by aiding tasks like maintenance and evolution.
However, automating TLR is challenging due to semantic gaps resulting from different levels of abstraction.
While automated TLR approaches exist for requirements and code, architecture documentation lacks tailored solutions, hindering the preservation of architecture knowledge and design decisions.

_Methods_
This paper presents our approach TransArC for TLR between architecture documentation and code, using component-based architecture models as intermediate artifacts to bridge the semantic gap.
We create transitive trace links by combining the existing approach ArDoCo for linking architecture documentation to models with our novel approach ArCoTL for linking architecture models to code.

_Results_
We evaluate our approaches with five open-source projects, comparing our results to baseline approaches.
The model-to-code TLR approach achieves an average F1-score of 0.98, while the documentation-to-code TLR approach achieves a promising average F1-score of 0.82, significantly outperforming baselines.

_Conclusion_
Combining two specialized approaches with an intermediate artifact shows promise for bridging the semantic gap.
In future research, we will explore further possibilities for such transitive approaches.

## Links

- Paper (Open Access) on [ACM](https://doi.org/10.1145/3597503.3639130) or [KITopen](https://doi.org/10.5445/IR/1000165692)
- Replication Package on [Zenodo](https://doi.org/10.5281/zenodo.10411853) and the corresponding [GitHub repository](https://github.com/ArDoCo/Replication-Package-ICSE24_Recovering-Trace-Links-Between-Software-Documentation-And-Code)
