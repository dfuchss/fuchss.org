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

{% for user in site.data.repositories.github_users %}
{% if site.data.repositories.github_users.size > 1 %}<h4>{{ user }}</h4>{% endif %}
{% include repository/repo_user.liquid username=user %}
{% endfor %}

---

{% endif %}

{% if site.data.repositories.github_repos %}

<!-- ## GitHub Repositories -->

<div class="repo-grid">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

{% if site.data.repositories.zenodo_repos %}

---

## Zenodo Repositories

<div class="repo-grid">
  {% for repo in site.data.repositories.zenodo_repos %}
    {% include repository/repo_zenodo.liquid repo=repo %}
  {% endfor %}
</div>

{% endif %}
