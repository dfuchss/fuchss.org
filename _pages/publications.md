---
layout: page
permalink: /publications/
title: list of publications
# description:
nav: false
nav_order: 2
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

{% assign total_citations = 0 %}
{% assign citation_counts = '' | split: '' %}
{% for paper in site.data.citations.papers %}
{% assign c = paper[1].citations | default: 0 | plus: 0 %}
{% assign total_citations = total_citations | plus: c %}
{% assign citation_counts = citation_counts | push: c %}
{% endfor %}
{% assign citation_counts = citation_counts | sort | reverse %}
{% assign h_index = 0 %}
{% assign i10_index = 0 %}
{% for count in citation_counts %}
{% assign rank = forloop.index %}
{% if count >= rank %}
{% assign h_index = rank %}
{% endif %}
{% if count >= 10 %}
{% assign i10_index = i10_index | plus: 1 %}
{% endif %}
{% endfor %}
{% assign scholar_id = site.data.socials.scholar_userid %}
{% assign citations_updated = site.data.citations.metadata.last_updated %}

<div class="pub-shell">
	<div class="pub-hero">
		<div class="pub-hero-header">
			<div>
				<p class="pub-title">Citation overview</p>
				<p class="pub-updated">Last updated: {{ citations_updated | date: '%B %d, %Y' }}</p>
			</div>
			<div class="pub-search">
				{% include bib_search.liquid %}
			</div>
		</div>
		<div class="metrics-grid">
			<a class="metric-card metric-link" href="https://scholar.google.com/citations?user={{ scholar_id }}" aria-label="Google Scholar profile" rel="noopener" target="_blank">
				<p class="metric-title">Total citations</p>
				<p class="metric-value">{{ total_citations | number_with_delimiter }}</p>
				<p class="metric-sub">View on Scholar</p>
			</a>
			<div class="metric-card">
				<p class="metric-title">h-index</p>
				<p class="metric-value">{{ h_index }}</p>
				<p class="metric-sub">Papers with ≥ h citations</p>
			</div>
			<div class="metric-card">
				<p class="metric-title">i10-index</p>
				<p class="metric-value">{{ i10_index }}</p>
				<p class="metric-sub">Papers with ≥ 10 citations</p>
			</div>
		</div>
	</div>
</div>

<div class="publications">

{% bibliography %}

</div>
