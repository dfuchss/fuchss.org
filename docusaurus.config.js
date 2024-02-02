// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;


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
            from: '/l/cop',
            to: '/projects/archived-projects/copbot'
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
            to: `/category/${new Date().getFullYear()}`,
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
              },
              {
                label: 'GitLab',
                href: 'https://gitlab.com/dfuchss',
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
};

module.exports = config;
