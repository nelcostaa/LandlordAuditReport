// Update motivation_learning_point with fear-driven, expert-to-landlord tone
import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const motivations: Record<string, string> = {
  // DOCUMENTATION - Certificates
  '1.1': "Your expired or missing certificates put you at immediate legal risk. UK councils actively prosecute landlords, and you're facing £5,000+ fines per certificate violation. If a tenant gets injured and you can't prove compliance, you're personally liable. This isn't just a checkbox – it's your financial protection.",
  
  '1.2': "If your tenant doesn't receive copies of these certificates, they have legal grounds to withhold rent or claim back months of payments through a tribunal. I've seen landlords lose £10,000+ because they \"forgot\" to hand over documents. Tenants know their rights now.",
  
  '1.3': "Missed renewal dates mean gaps in your insurance coverage. One expired gas certificate and your building insurance becomes void. If something happens during that gap, you're uninsured and personally liable. Most landlords only realize this when it's too late.",
  
  // DOCUMENTATION - Fire Safety
  '1.5': "Fire risk assessments are legally required for HMOs in the UK. Without one, you face unlimited fines and potential prison time if there's a fire incident. The fire service can prohibit you from letting the property, meaning zero income while you still pay the mortgage.",
  
  // DOCUMENTATION - Council
  '3.1': "Operating without proper HMO licensing is a criminal offense in the UK. Councils can issue £30,000 fines PER property and force you to repay up to 12 months of rent to your tenants. Your property gets blacklisted, and you won't be able to let it legally.",
  
  // DOCUMENTATION - Tenancy Agreements
  '4.1': "Without documented tenant responsibilities, you can't enforce anything. Tenants will claim they \"didn't know\" about any rules when they cause damage or break lease terms. You'll lose every tribunal case without written, signed agreements.",
  
  '5.1': "Poor rent tracking means you won't notice missed payments until it's too late to act. By the time you realize, you're owed £3,000+ and the eviction process takes 6+ months. Good landlords track rent weekly because they've learned this lesson.",
  
  '6.1': "When you don't have a repair log system and a tenant takes you to tribunal, you'll have no evidence of your response times or actions taken. The tribunal will side with the tenant every time. That repair you \"definitely did\" two months ago? Without records, it never happened.",
  
  // COMMUNICATION
  '7.1': "Everything you tell your tenant verbally means nothing in court. If it's not in writing, it didn't happen. Phone call about repairs? Doesn't exist. Warning about noise? Never happened. Written records are your only defense when tenants claim you ignored them.",
  
  '8.1': "Complaint logs prove you acted responsibly when tenants claim you were negligent. Without them, you're defenseless in tribunal hearings. Councils use your lack of documentation against you in licensing reviews – it shows \"poor management practices.\"",
  
  '9.1': "Correct notice procedures aren't optional – get them wrong and your Section 21 or Section 8 eviction gets thrown out entirely. You'll be back to square one, losing thousands in legal fees and unpaid rent while the tenant stays put rent-free.",
  
  '10.1': "Tenant behavioral issues escalate quickly when there's no clear reporting system. Small problems become major disputes, rent strikes, or tribunal cases. Your lack of process gives problem tenants leverage – they'll claim you never gave them a way to resolve things.",
  
  '11.1': "Your response time to tenant communications shows \"duty of care\" in legal proceedings. Slow or no responses? Tribunals see neglectful landlord. Fast responses with records? You're in the clear. The difference is thousands in potential claims.",
  
  '12.1': "Tenants withhold rent when they can't reach you for urgent issues. A blocked drain becomes \"uninhabitable conditions\" if you don't respond quickly. They're legally entitled to deduct rent or claim compensation when you're not accessible.",
  
  // EVIDENCE GATHERING
  '13.1': "Without documented check-in/check-out inspections with photos, you'll never get deposit deductions approved. Tenants will claim all damage was pre-existing. The deposit scheme always sides with tenants when you have no evidence. Those cigarette burns? Your problem now.",
  
  '14.1': "Inventory reports are your only defense against tenant damage claims and deposit disputes. No inventory means you automatically lose. That's £2,000+ of your money gone because you skipped a 2-hour process at move-in.",
  
  '15.1': "Regular inspection photos prove property condition over time. When tenants claim you let the property deteriorate or didn't maintain it, your dated photos are evidence. Without them, you're accused of neglect and face fines or license revocation.",
  
  '16.1': "Written and photographic records of maintenance work prove you fulfilled your landlord obligations. When a tenant claims you ignored a leaking roof and ruined their belongings, your repair log with photos saves you from a £5,000+ damages claim.",
  
  '16.2': "Maintenance records show you're a responsible landlord in licensing reviews. Poor or missing records mean councils refuse license renewals, forcing you to sell at a loss or leave properties empty. Your property portfolio's future depends on boring paperwork.",
  
  '17.1': "Incident reports protect you when things go wrong. A tenant slips and claims £10,000 in damages? Your incident report showing you addressed the hazard immediately is the difference between winning and losing. No report? You're negligent by default.",
  
  '18.1': "Communication archives are evidence of your professionalism. When tenants fabricate stories about what you said or promised, your saved emails and texts prove the truth. I've seen landlords lose £15,000 cases because they deleted \"old messages.\"",
  
  '19.1': "Deposit protection documentation must be perfect. Get it wrong and tenants can claim 1-3x the deposit amount in compensation – even if they owe you money. This is one of the most expensive mistakes UK landlords make.",
  
  '20.1': "Your document retention system determines whether you can defend yourself in legal challenges years later. Tribunals and courts demand evidence. No records from 2 years ago? You lose by default. Good landlords keep everything for 6+ years because they've seen what happens when you don't.",
  
  '21.1': "Digital backups mean you don't lose everything when your laptop crashes or office floods. Landlords without backups have lost legal cases because they couldn't produce required documents. Cloud storage costs £5/month. Losing a tribunal case costs £5,000+.",
  
  // TENANT MANUALS
  '2.1': "A proper tenant manual prevents 80% of \"I didn't know\" excuses. Tenants can't claim they weren't aware of rules, procedures, or responsibilities when you have their signed acknowledgment. This document wins tribunal cases before they start.",
};

async function updateMotivations() {
  console.log('🔥 Updating Motivation/Learning Points');
  console.log('   Tone: Expert → Landlord (Direct, Fear-Driven, UK-Specific)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let updated = 0;
  let skipped = 0;

  for (const [questionNumber, motivation] of Object.entries(motivations)) {
    try {
      const result = await sql`
        UPDATE question_templates
        SET motivation_learning_point = ${motivation}
        WHERE question_number = ${questionNumber}
      `;

      if (result.rowCount && result.rowCount > 0) {
        console.log(`✅ Q${questionNumber}: Updated (${motivation.length} chars)`);
        updated++;
      } else {
        console.log(`⚠️  Q${questionNumber}: Not found`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Q${questionNumber}: Error -`, error);
      skipped++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

updateMotivations();

