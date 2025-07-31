---
layout: publication
permalink: /conferences/icse25/
title: "LiSSA: Toward Generic Traceability Link Recovery through Retrieval-Augmented Generation"
description:
publication: fuchss_lissa_2025
authors:
  - dominik_fuchss
  - tobias_hey
  - jan_keim
  - haoyu_liu
  - niklas_ewald
  - tobias_thirolf
  - anne_koziolek
---

Published at the [47th IEEE/ACM International Conference on Software Engineering (ICSE 2025), April 27 - May 03 2025](https://conf.researchr.org/home/icse-2025/).

![Approach Overview](/assets/img/conferences/icse25-approach.svg){:width="100%" style="background-color: white; border-radius: 8px; padding: 10px; display: block; margin: 0 auto;"}

## Abstract

There are a multitude of software artifacts which need to be handled during the development and maintenance of a software system. These artifacts interrelate in multiple, complex ways.
Therefore, many software engineering tasks are enabled — and even empowered — by a clear understanding of artifact interrelationships and also by the continued advancement of techniques for automated artifact linking.

However, current approaches in automatic Traceability Link Recovery (TLR) target mostly the links between specific sets of artifacts, such as those between requirements and code.
Fortunately, recent advancements in Large Language Models (LLMs) can enable TLR approaches to achieve broad applicability.
Still, it is a nontrivial problem how to provide the LLMs with the specific information needed to perform TLR.

In this paper, we present LiSSA, a framework that harnesses LLM performance and enhances them through Retrieval-Augmented Generation (RAG).
We empirically evaluate LiSSA on three different TLR tasks, requirements to code, documentation to code, and architecture documentation to architecture models, and we compare our approach to state-of-the-art approaches.

Our results show that the RAG-based approach can significantly outperform the state-of-the-art on the code-related tasks.
However, further research is required to improve the performance of RAG-based approaches to be applicable in practice.

## Links

- Paper on [IEEE Xplore](https://doi.org/10.1109/ICSE55347.2025.00186) or [KITopen](https://publikationen.bibliothek.kit.edu/1000179816)
- Replication Package on [Zenodo](https://doi.org/10.5281/zenodo.14714706) and the corresponding [GitHub repository](https://github.com/ARDoCo/ReplicationPackage-ICSE25_LiSSA-Toward-Generic-Traceability-Link-Recovery-through-RAG/tree/main)
