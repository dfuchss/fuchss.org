---
layout: publication
permalink: /c/ecsa21/
title: Trace Link Recovery for Software Architecture Documentation
description:
publication: keim_tracelink_2021
authors:
  - jan_keim
  - sophie_corallo
  - dominik_fuchss
  - claudius_kocher
  - janek_speit
  - anne_koziolek
---

Published at the [15th European Conference on Software Architecture (ECSA 2021), September 13-17 2021](https://conf.researchr.org/home/ecsa-2021)

## Abstract

Software Architecture Documentation often consists of different artifacts.
On the one hand, there is informal textual documentation.
On the other hand, there are formal models of the system.
Finding related information in multiple artifacts with different level of formality is often not easy.
Therefore, trace links between these can help to understand the system.
In this paper, we propose an extendable, agent-based framework for creating trace links between textual software architecture documentation and models.
Our framework SWATTR offers different pipeline stages to extract text and model information, identify elements in text, and connect these elements to model elements.
In each stage, multiple agents can be used to capture necessary information to automatically create trace links.
We evaluate the performance of our approach with three case studies and compare our results to baseline approaches.
The results for our approach are good to excellent with a weighted average F1-Score of 0.72 over all case studies.
Moreover, our approach outperforms the baseline approaches on non-weighted average by at least 0.24 (weighted 0.31).

## Links

- Paper on [Springer Link](https://doi.org/10.1007/978-3-030-86044-8_7) and on [KITopen](https://doi.org/10.5445/IR/1000138399)
- Replication Package on [Zenodo](https://doi.org/10.5281/zenodo.4730621) and the corresponding [GitHub repository](https://github.com/ArDoCo/SWATTR)
