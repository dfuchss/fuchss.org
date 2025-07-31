// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "dropdown-aire-2025",
              title: "aire 2025",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/conferences/aire25/";
              },
            },{id: "dropdown-icse-2025",
              title: "icse 2025",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/conferences/icse25/";
              },
            },{id: "dropdown-icsa-2025",
              title: "icsa 2025",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/conferences/icsa25/";
              },
            },{id: "dropdown-ecsa-2022",
              title: "ecsa 2022",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/conferences/ecsa22/";
              },
            },{id: "dropdown-list-of-publications",
              title: "list of publications",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/publications/";
              },
            },{id: "nav-projects",
          title: "projects",
          description: "Just some of the projects I&#39;ve worked on.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "A selection of my GitHub repositories.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "projects-ardoco",
          title: 'ARDoCo',
          description: "Automating Requirements and Documentation Comprehension",
          section: "Projects",handler: () => {
              window.location.href = "/projects/ardoco/";
            },},{id: "projects-deltabot",
          title: 'DeltaBot',
          description: "DeltaBot is my first bot for Discord.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/deltabot/";
            },},{id: "projects-jambeez",
          title: 'JamBeez',
          description: "A cross-platform collaborative drum machine",
          section: "Projects",handler: () => {
              window.location.href = "/projects/jambeez/";
            },},{id: "projects-joinlink",
          title: 'JoinLink',
          description: "A bot that allows the creation of Join Links to non-public Rooms in Matrix",
          section: "Projects",handler: () => {
              window.location.href = "/projects/joinlink/";
            },},{id: "projects-mensabot",
          title: 'MensaBot',
          description: "A bot that reminds you of your food in your mensa",
          section: "Projects",handler: () => {
              window.location.href = "/projects/mensabot/";
            },},{id: "projects-object-casket",
          title: 'Object Casket',
          description: "Object Casket is a simple object mapper that can be used together with the Java Persistence API (JPA).",
          section: "Projects",handler: () => {
              window.location.href = "/projects/objectcasket/";
            },},{id: "projects-rεkit",
          title: 'RεKiT',
          description: "a platform jumper game",
          section: "Projects",handler: () => {
              window.location.href = "/projects/rekit/";
            },},{id: "projects-yarb",
          title: 'YARB',
          description: "Yet Another Reminder Bot",
          section: "Projects",handler: () => {
              window.location.href = "/projects/yarb/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%64%6F%6D%69%6E%69%6B@%66%75%63%68%73%73.%6F%72%67", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0001-6410-6769", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=bVvFp4oAAAAJ", "_blank");
        },
      },{
        id: 'social-dblp',
        title: 'DBLP',
        section: 'Socials',
        handler: () => {
          window.open("https://dblp.org/pid/243/9362.html", "_blank");
        },
      },{
        id: 'social-scopus',
        title: 'Scopus',
        section: 'Socials',
        handler: () => {
          window.open("https://www.scopus.com/authid/detail.uri?authorId=57209096250", "_blank");
        },
      },{
        id: 'social-semanticscholar',
        title: 'Semantic Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://www.semanticscholar.org/author/2276068674", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/dfuchss", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/dfuchss", "_blank");
        },
      },{
        id: 'social-work',
        title: 'Work',
        section: 'Socials',
        handler: () => {
          window.open("https://mcse.kastel.kit.edu/staff_dominik_fuchss.php", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
