
const fs = require('fs');
const filename = process.argv[2] || './lighthouse-report.json';
const report = JSON.parse(fs.readFileSync(filename));

console.log('--- Scores ---');
Object.values(report.categories).forEach(cat => {
    console.log(`${cat.title}: ${Math.round(cat.score * 100)}`);
});

console.log('\n--- Failed/Warning Audits (Performance) ---');
const perfAudits = report.categories.performance.auditRefs;
perfAudits.forEach(ref => {
    const audit = report.audits[ref.id];
    if (audit.score !== 1 && audit.scoreDisplayMode !== 'notApplicable' && audit.scoreDisplayMode !== 'informative') {
        console.log(`\n[${Math.round(audit.score * 100)}] ${audit.title} (${audit.id})`);
        console.log(`Display Value: ${audit.displayValue}`);
        if (audit.numericValue) console.log(`Numeric Value: ${audit.numericValue}`);
        // console.log(audit.description);
    }
});

console.log('\n--- Layout Shift Details ---');
const clsAudit = report.audits['cumulative-layout-shift'];
console.log(`CLS Score: ${clsAudit.score}`);
console.log(`CLS Value: ${clsAudit.numericValue}`);
if (clsAudit.details && clsAudit.details.items) {
    clsAudit.details.items.forEach(item => {
        console.log('Shift:', item);
    });
}
