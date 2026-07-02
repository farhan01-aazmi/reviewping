#!/usr/bin/env node
/**
 * Seed the backlink database with the gap analysis targets.
 * 
 * Usage: node scripts/backlink-machine/seed.js
 */
const fs = require('fs');
const path = require('path');
const DB = require('./db.cjs');

const GAP_DOMAINS = `
contrary.com,nurturely.io,rickcasehonda.com,manawellnessandaestheticsgroup.com
rydellchevy.com,soberpartners.com,securityvisionmb.com,ryanventairductsolutions.com
australiaspeed.com.au,solarskylights.com.au,ferrisjewelry.com,cuinsight.com
web-design-london-uk.co.uk,ivandryerventandchimneycleaning.com,progressmedical.com
subger.com,album.vc,stevengaragedoormaintenance.com,cyazer.com,hubspot.com
podium.engineering,upullandsave.com,repuvibe.com,moraninsurance.com
partnerbase.com,goprimelectric.com,getbox2u.com,servicebusinessmastery.com
jackgaragedoorreplacement.com,theturtleeffect.com,grace-medspa.com
llflooringdesign.com,toiletrepairplumber.com,zipdo.co,glarity.app
classifiedsubmissions.com,branchenbuch.ch,smoothmedspa.com,nerdisa.com
rydellford.com,workingnomads.com,alghuraf-press.blogspot.com,itsthewell.com
removedigital.com.au,pnwrejuvenation.com,twit.tv,mypodcastdata.com
mahlerjewelers.com,lawfirm500.com,josegaragedoorsensorissues.com
totalbodyunlimited.com,the-tutorials.web.app,josephmuciraexclusives.com
sapphireventures.com,mara-solutions.com,webcatalog.io,reelproof.io
anewscafe.com,parkerlockchangeservice.com,welcome2mydesk.blogspot.com
gallivantertravel.com.au,peakconciergemedicine.com,aspencreekaesthetics.com
lordstreetgarage.com.au,tmscomfort.com,4emailmarketers.com,venusrisingmedspa.com
eloasalary.blogspot.com,lockoutsservice.com,ppcmate.com,fanajewelry.com
everydayoffroad.au,ramonschimneysweepcleaning.com,jewelrytogo.net
austinlocalgaragedoorcompany.com,astricknation.com,rinsecleaning.com,phoenixlaserrc.com
phdeck.com,whatarethebest.com,rooferscoffeeshop.com,moyens.net,advids.co
vandendooljewellers.com,removedigital.com,pawnmaster.com,airmccoy.com,triswimschool.com
skindalemedspa.com,player.fm,neilpatel.com
enlightenmd.com,mybusinessflow.com,masonanthony.edu,podium.co,beststartup.us
drouintyreandbatteryservice.com.au,hectorroofreplacementservice.com
williamgatemaintenanceservice.com,elkgroveplumbinganddrain.com
`
  .replace(/\n/g, ',')
  .split(',')
  .filter(d => d.trim())
  .map(d => ({ domain: d.trim() }));

console.log(`🌱 Seeding ${GAP_DOMAINS.length} backlink targets...`);
const added = DB.addTargets(GAP_DOMAINS);
console.log(`✅ ${added} new targets added to the database.`);

const total = DB.getTargets().length;
console.log(`📊 Total targets in DB: ${total}`);

console.log(`
🚀 Next steps:
   1. node scripts/backlink-machine/scraper.js --limit 10
   2. node scripts/backlink-machine/generate-emails.js
   3. node scripts/backlink-machine/send.js --dry-run
   4. node scripts/backlink-machine/send.js --send --limit 5
   5. node scripts/backlink-machine/dashboard.js
`);
