import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function LogoWithText() {
  const myLogo = require('/images/me.png').default;
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
        <p>
          <img src={myLogo} />
        </p>
        <h2>Dominik Fuchß</h2>
      </div>
    </div>
  );
}

function CardsForTopics() {
  const {siteConfig} = useDocusaurusContext();
  const recent_literature = siteConfig.customFields.recent_literature;
  const linkToPapersOfCurrentYear = `/category/${recent_literature}`;

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
      <div style={{ border: '1px solid #ccc', padding: '1.5rem 1.5rem 1.5rem 1.5rem', marginLeft: '10px', marginRight: '10px' }}>
        <h2>
          <Link to="/category/projects">Projects</Link>
        </h2>
        <p>Here you can find a list of my projects.</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '1.5rem 1.5rem 1.5rem 1.5rem', marginLeft: '10px', marginRight: '10px' }}>
        <h2>
          <Link href={linkToPapersOfCurrentYear}>Literature</Link>
        </h2>
        <p>Here you can find a list of my publications.</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title={`Home`}
      description="Home page of Dominik Fuchß">
      <main>
        <LogoWithText />
        <CardsForTopics />
      </main>
    </Layout>
  );
}
