const https = require('https');

// 1. Check deployed gpb-connect function
https.get('https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/gpb-connect?error=access_denied', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const match = body.match(/https:\/\/[^\/\"]+/);
    console.log('1. GBP function SITE_URL:', match ? match[0] : 'NOT FOUND');
    console.log('   Has dashboard redirect:', body.includes('dashboard?gbp='));
  });
}).on('error', e => console.error(e));

// 2. Check deployed frontend for hardcoded URLs
https.get('https://reviewping-eight.vercel.app', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const match = body.match(/src="\/assets\/index-([^.]+)\.js"/);
    if (match) {
      const chunkUrl = 'https://reviewping-eight.vercel.app/assets/index-' + match[1] + '.js';
      https.get(chunkUrl, (res2) => {
        let js = '';
        res2.on('data', c => js += c);
        res2.on('end', () => {
          const urls = [...js.matchAll(/https:\/\/[^"\`\s]+/g)].map(m => m[0]);
          const vercelUrls = urls.filter(u => u.includes('vercel.app'));
          console.log('2. Frontend hardcoded URLs:');
          vercelUrls.forEach(u => console.log('   -', u));
          
          const hasProxyFallback = js.includes('/api/edge');
          console.log('   Has proxy fallback:', hasProxyFallback);
          
          // Check VITE_SITE_URL
          const siteUrlMatch = js.match(/VITE_SITE_URL[^"]+"([^"]+)"/);
          if (siteUrlMatch) console.log('   VITE_SITE_URL:', siteUrlMatch[1]);
        });
      }).on('error', e => console.error(e));
    }
  });
}).on('error', e => console.error(e));
