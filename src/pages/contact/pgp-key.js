import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import GPGKey from '!!raw-loader!/pgp-key/DD7EE78CAC98885B734000ADF07E8A60D810A543.asc';

export default function Home() {
    return (
        <Layout
            title={`PGP-Key`}
            description="PGP-Key of Dominik Fuchß">
            <header>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'left',
                    marginTop: '15px',
                }}>
                    <h1>PGP-Key (<Link to="/pgp-key/DD7EE78CAC98885B734000ADF07E8A60D810A543.asc" target='_blank' >0xD810A543</Link>)</h1>
                </div>
            </header>
            <main>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'left',
                    marginTop: '15px',
                    marginBottom: '15px',
                }}>
                    <CodeBlock language="text">{GPGKey}</CodeBlock>
                </div>
            </main>
        </Layout>
    );
}