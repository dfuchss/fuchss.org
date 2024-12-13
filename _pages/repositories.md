---
layout: page
permalink: /repositories/
title: repositories
description: A selection of my GitHub repositories.
nav: true
nav_order: 4
social: true
---

{% if site.data.repositories.github_users %}

<!-- ## GitHub users -->
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div>

---

{% if site.repo_trophies.enabled %}
{% for user in site.data.repositories.github_users %}
{% if site.data.repositories.github_users.size > 1 %}

  <h4>{{ user }}</h4>
  {% endif %}
  <div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% include repository/repo_trophies.liquid username=user %}
  </div>

---

{% endfor %}
{% endif %}
{% endif %}

{% if site.data.repositories.github_repos %}

<!-- ## GitHub Repositories -->

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

{% if site.data.repositories.zenodo_repos %}

---

## Zenodo Repositories

These repositories are hosted on Zenodo and have a DOI assigned. They include research data, software, and more.

{% for repo in site.data.repositories.zenodo_repos %}

### {{repo.name}}

[![DOI](https://zenodo.org/badge/DOI/{{ repo.doi }}.svg)](https://doi.org/{{ repo.doi }})

{{repo.description}}

{% endfor %}
{% endif %}
