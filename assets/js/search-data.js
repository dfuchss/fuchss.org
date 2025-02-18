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
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "dropdown-icse-2025",
              title: "ICSE 2025",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-refsq-2025",
              title: "REFSQ 2025",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-icsa-2025",
              title: "ICSA 2025",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-icse-2024",
              title: "ICSE 2024",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-icsa-2023",
              title: "ICSA 2023",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-ecsa-2021",
              title: "ECSA 2021",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-list-of-publications",
              title: "List of Publications",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
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
        },{id: "post-al-folio-conf",
      
        title: "al-folio-conf",
      
      description: "Elevate Your Conference Website with al-folio-conf: A Jekyll Theme 🚀",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/10/31/al-folio-conf/";
        
      },
    },{id: "post-ardoco-metrics-calculator",
      
        title: "ArDoCo Metrics Calculator",
      
      description: "ArDoCo Metrics Calculator a tool to calculate classification and rank metrics.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/08/30/ardoco-metrics/";
        
      },
    },{id: "post-yarb-twim",
      
        title: "YARB @ TWIM",
      
      description: "My first post on YARB at 09.08.2024",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/08/09/twim-yarb/";
        
      },
    },{id: "post-matrixjoinlink-twim",
      
        title: "MatrixJoinLink @ TWIM",
      
      description: "My post on MatrixJoinLink at TWIM 24.05.2024",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/05/24/twim-mjl/";
        
      },
    },{id: "post-matrixjoinlink-twim",
      
        title: "MatrixJoinLink @ TWIM",
      
      description: "My post on MatrixJoinLink at TWIM 17.11.2023",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2023/11/17/twim-mjl/";
        
      },
    },{id: "post-matrixjoinlink-twim",
      
        title: "MatrixJoinLink @ TWIM",
      
      description: "My post on MatrixJoinLink at TWIM 25.08.2023",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2023/08/25/twim-mjl/";
        
      },
    },{id: "post-matrixjoinlink-twim",
      
        title: "MatrixJoinLink @ TWIM",
      
      description: "My first post on MatrixJoinLink at TWIM 04.08.2023",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2023/08/04/twim-mjl/";
        
      },
    },{id: "post-mensabot-twim",
      
        title: "MensaBot @ TWIM",
      
      description: "My first post on MensaBot at TWIM 04.08.2023",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2023/08/04/twim-mensa/";
        
      },
    },{id: "projects-ardoco",
          title: 'ArDoCo',
          description: "Architecture Documentation Consistency",
          section: "Projects",handler: () => {
              window.location.href = "/projects/ArDoCo/";
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
        id: 'social-researchgate',
        title: 'ResearchGate',
        section: 'Socials',
        handler: () => {
          window.open("https://www.researchgate.net/profile/Dominik-Fuchss/", "_blank");
        },
      },{
        id: 'social-scopus',
        title: 'Scopus',
        section: 'Socials',
        handler: () => {
          window.open("https://www.scopus.com/authid/detail.uri?authorId=57209096250", "_blank");
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
        id: 'social-dblp',
        title: 'DBLP',
        section: 'Socials',
        handler: () => {
          window.open("https://dblp.org/pid/243/9362.html", "_blank");
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
