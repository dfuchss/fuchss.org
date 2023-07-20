import React from 'react';
// import clsx from 'clsx';
// import Link from '@docusaurus/Link';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

// import styles from './index.module.css';

/*
function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}
*/

function LogoWithText() {
  return (
    <div
      style={{
        paddingTop: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}>
      <div>
        <p><img src="/images/logo.png" /></p>
        <h2>Dominik Fuchß</h2>
      </div>
    </div>
  );
}

function CardsForTopics() {
  return (
    <div
      style={{
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '15px',
      }}>
      <div style={{border: '1px solid #ccc', padding: '1.5rem 1.5rem 1.5rem 1.5rem', marginLeft: '10px', marginRight: '10px'}}>
        <h2><a href="/docs/category/projects">Projects</a></h2>
        <p>Here you can find a list of my projects.</p>
      </div>
      <div style={{border: '1px solid #ccc', padding: '1.5rem 1.5rem 1.5rem 1.5rem',  marginLeft: '10px', marginRight: '10px'}}>
        <h2><a href="/docs/category/literature">Literature</a></h2>
        <p>Here you can find a list of my publications.</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title={`Home`}
      description="Home page of Dominik Fuchss">
      <main>
        <LogoWithText />
        <CardsForTopics />
      </main>
    </Layout>
  );
}
