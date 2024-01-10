import React from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import PGPKey from '!!raw-loader!/pgp-key/DD7EE78CAC98885B734000ADF07E8A60D810A543.asc';

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
                    <h1>PGP-Key (<a href="/pgp-key/DD7EE78CAC98885B734000ADF07E8A60D810A543.asc" target='_blank' >0xD810A543</a>)</h1>
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
                    <CodeBlock language="text">{PGPKey}</CodeBlock>
                </div>
            </main>
        </Layout>
    );
}