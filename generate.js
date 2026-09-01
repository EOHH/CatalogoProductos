const fs = require('fs');
const comps = ['LandingHeader','LandingHero','LandingBenefits','LandingEditorial','LandingHowItWorks','LandingBurgundySection','LandingWhatsApp','LandingFinalCta','LandingFooter'];
comps.forEach(c => fs.writeFileSync(`src/features/landing/components/${c}.tsx`, `export function ${c}() { return <section>${c}</section> }`));
console.log('done');
