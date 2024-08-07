// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

function get_recent_literature() {
  // Find most recent literature folder in ./docs/literature
  const fs = require('fs');
  const path = require('path');
  const dir = './docs/literature';
  const files = fs.readdirSync(dir);
  const publication_years = files
    .filter(file => fs.statSync(path.join(dir, file)).isDirectory())
    .sort()
    .reverse();
  return publication_years[0];
}

const recent_literature = get_recent_literature();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'fuchss.org',
  staticDirectories: ['static'],
  tagline: '',
  favicon: 'images/favicon.jpg',

  url: 'https://www.fuchss.org',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    ['@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/l/deltabot',
            to: '/projects/misc/deltabot'
          },
          {
            from: '/projects/deltabot',
            to: '/projects/misc/deltabot'
          }
        ]
      }
    ],
    [
      require.resolve('docusaurus-lunr-search'), {
        languages: ['en']
      }
    ]
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          lastmod: 'date',
          ignorePatterns: [],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);

            // Now add the PDF files from ./static/literature (recursive search for .pdf files)
            const fs = require('fs');
            const dir = './static/literature';
            const pdfs = fs.readdirSync(dir, { withFileTypes: true, recursive: true })
              .filter(dirent => dirent.isFile() && dirent.name.endsWith('.pdf'))
              .map(dirent => config.url + dirent.parentPath.replace('static/', '/') + '/' + dirent.name);
            const pdfItems = pdfs.map(pdf => ({ url: pdf }));

            return items.concat(pdfItems);
          },
        }
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          autoCollapseCategories: true
        }
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'FUCHSS.ORG',

        logo: {
          alt: 'fuchss.org Logo',
          src: 'images/favicon.jpg',
        },
        items: [
          {
            position: 'right',
            href: 'https://s.kit.edu/fuchss',
            label: 'KIT KASTEL'
          },
          {
            // type: 'docSidebar',
            // sidebarId: 'projectsSidebar',
            to: '/category/projects',
            position: 'right',
            label: 'Projects',
          },
          {
            // type: 'docSidebar',
            // sidebarId: 'literatureSidebar',
            to: `/category/${recent_literature}`,
            position: 'right',
            label: 'Literature',
          }
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Social',
            items: [
              {
                label: 'Google Scholar',
                href: 'https://scholar.google.com/citations?user=bVvFp4oAAAAJ',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/dfuchss/',
              }
            ],
          },
          {
            title: 'Development',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/dfuchss',
              }
            ]
          },
          {
            title: 'Contact',
            items: [
              {
                label: 'Mail',
                href: 'mailto:dominik@fuchss.org'
              },
              {
                label: 'PGP-Key',
                to: '/contact/pgp-key',
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dominik Fuchß<br/><a href="https://status.fuchss.org/status/main">Status</a> &#x2022; <a href="/impressum">Impressum</a>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  customFields: {
    recent_literature: recent_literature
  },
};

module.exports = config;
