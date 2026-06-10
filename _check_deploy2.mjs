import https from 'https';
import { execSync } from 'child_process';

// Read the local built files
import fs from 'fs';

const localIndex = fs.readFileSync('dist/assets/index-Dg2wXyIm.js', 'utf8');
console.log('LOCAL index-Dg2wXyIm.js:');
console.log('  callEdgeFn:', localIndex.includes('callEdgeFn'));
console.log('  window.location.origin:', localIndex.includes('window.location.origin'));
console.log('  /api/edge:', localIndex.includes('/api/edge'));

const localIntegrations = fs.existsSync('dist/assets/Integrations-CyqVDsRl.js') 
  ? fs.readFileSync('dist/assets/Integrations-CyqVDsRl.js', 'utf8') : 'NOT FOUND';
console.log('LOCAL Integrations-CyqVDsRl.js:');
console.log('  window.open:', localIntegrations.includes('window.open'));
console.log('  gbp_success:', localIntegrations.includes('gbp_success'));

// Check what's actually deployed
console.log('\n=== Checking DEPLOYED version ===\n');
https.get('https://reviewping-eight.vercel.app', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const match = body.match(/src="\/assets\/index-([^.]+)\.js"/);
    const hash = match ? match[1] : 'unknown';
    console.log('Deployed index hash:', hash);
    
    // Fetch the deployed main JS
    https.get('https://reviewping-eight.vercel.app/assets/index-' + hash + '.js', (res2) => {
      let js = '';
      res2.on('data', c => js += c);
      res2.on('end', () => {
        console.log('Deployed JS:');
        console.log('  callEdgeFn:', js.includes('callEdgeFn'));
        console.log('  /api/edge:', js.includes('/api/edge'));
        console.log('  window.location.origin:', js.includes('window.location.origin'));
        
        // Find chunk references
        const sendReqMatch = js.match(/SendReq-([^.]+)\.js/);
        if (sendReqMatch) {
          https.get('https://reviewping-eight.vercel.app/assets/SendReq-' + sendReqMatch[1] + '.js', (res3) => {
            let sendReq = '';
            res3.on('data', c => sendReq += c);
            res3.on('end', () => {
              console.log('\nDeployed SendReq chunk:');
              console.log('  callEdgeFn:', sendReq.includes('callEdgeFn'));
              console.log('  /api/edge:', sendReq.includes('/api/edge'));
            });
          }).on('error', e => console.error(e));
        }
        
        const integMatch = js.match(/Integrations-([^.]+)\.js/);
        if (integMatch) {
          https.get('https://reviewping-eight.vercel.app/assets/Integrations-' + integMatch[1] + '.js', (res3) => {
            let integ = '';
            res3.on('data', c => integ += c);
            res3.on('end', () => {
              console.log('\nDeployed Integrations chunk:');
              console.log('  window.open:', integ.includes('window.open'));
              console.log('  gbp_success:', integ.includes('gbp_success'));
              console.log('  postMessage handler:', integ.includes('addEventListener("message"'));
            });
          }).on('error', e => console.error(e));
        }
      });
    }).on('error', e => console.error(e));
  });
}).on('error', e => console.error(e));
