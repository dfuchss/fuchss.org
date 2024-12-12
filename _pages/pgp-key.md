---
layout: page
title: PGP Key
permalink: /pgp-key/
---

Below is my PGP key for secure communication: [DD7EE78CAC98885B734000ADF07E8A60D810A543](/assets/pgp-key/DD7EE78CAC98885B734000ADF07E8A60D810A543.asc)

<pre><code id="pgp-key"></code></pre>

<script>
fetch('/assets/pgp-key/DD7EE78CAC98885B734000ADF07E8A60D810A543.asc')
  .then(response => response.text())
  .then(data => {
    document.getElementById('pgp-key').textContent = data;
  })
  .catch(error => console.error('Error loading PGP key:', error));
</script>
