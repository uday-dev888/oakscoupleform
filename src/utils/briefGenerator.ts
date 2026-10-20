/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { QuestionnaireAnswers } from "../types/questionnaire.ts";

/**
 * Generates a clean, elegant, human-readable brief text for the photography
 * and cinema team, organized by chapters.
 */
export function generateBriefSummary(
  studioName: string,
  answers: QuestionnaireAnswers
): string {
  const p1 = answers.partner1 || "Partner 1";
  const p2 = answers.partner2 || "Partner 2";

  const divider = "=".repeat(60);
  const subDivider = "-".repeat(40);

  const lines: string[] = [];

  lines.push(divider);
  lines.push(`OUR STORY QUESTIONNAIRE — STUDIO BRIEF`);
  lines.push(`${studioName.toUpperCase()}`);
  lines.push(`Couple: ${p1} & ${p2}`);
  lines.push(`Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`);
  lines.push(divider);
  lines.push("");

  // CHAPTER 1
  lines.push(`CHAPTER 1: YOUR STORY`);
  lines.push(subDivider);
  lines.push(`1. What do you call each other?`);
  lines.push(`   • ${p1} calls ${p2}: "${answers.q1_calls.aCallsB || '—'}"`);
  lines.push(`   • ${p2} calls ${p1}: "${answers.q1_calls.bCallsA || '—'}"`);
  lines.push("");

  lines.push(`2. What do you both do for living and what are you truly passionate about doing?`);
  lines.push(`   • ${p1}: ${answers.q2_workPassion.partnerA || '—'}`);
  lines.push(`   • ${p2}: ${answers.q2_workPassion.partnerB || '—'}`);
  lines.push("");

  lines.push(`3. How did you first meet?`);
  lines.push(`   ${answers.q3_firstMeet ? answers.q3_firstMeet : '—'}`);
  lines.push("");

  lines.push(`4. What was your first impression of each other?`);
  lines.push(`   • ${p1}: ${answers.q4_firstImpression.partnerA || '—'}`);
  lines.push(`   • ${p2}: ${answers.q4_firstImpression.partnerB || '—'}`);
  lines.push("");

  const words = answers.q5_threeWords.filter(Boolean).join(", ");
  lines.push(`5. How would you describe yourselves as a couple in three words?`);
  lines.push(`   ${words ? words : '—'}`);
  lines.push("");

  const activities = [
    ...(answers.q6_activities.selected || []),
    answers.q6_activities.other ? `Other: ${answers.q6_activities.other}` : null,
  ].filter(Boolean).join("; ");
  lines.push(`6. What do you enjoy doing together?`);
  lines.push(`   ${activities ? activities : '—'}`);
  lines.push("");

  lines.push(`7. What do you love most about each other?`);
  lines.push(`   • ${p1}: ${answers.q7_loveMost.partnerA || '—'}`);
  lines.push(`   • ${p2}: ${answers.q7_loveMost.partnerB || '—'}`);
  lines.push("");

  lines.push(`8. Is there a funny story, inside joke, or special moment that defines your relationship?`);
  lines.push(`   ${answers.q8_funnyStory ? answers.q8_funnyStory : '—'}`);
  lines.push("");

  lines.push(`9. How did the proposal happen? (If applicable.)`);
  if (answers.q9_proposal.choice === "na") {
    lines.push(`   Not applicable`);
  } else {
    lines.push(`   ${answers.q9_proposal.story ? answers.q9_proposal.story : '—'}`);
  }
  lines.push("");

  // CHAPTER 2
  lines.push(`CHAPTER 2: YOUR PEOPLE`);
  lines.push(subDivider);
  lines.push(`10. Who are the most important people you want us to capture please give a family tree?`);
  const members = answers.q10_people.familyMembers || [];
  if (members.length === 0) {
    lines.push(`   (No specific individual VIP cards entered)`);
  } else {
    const sideA = members.filter((m) => m.side === "sideA");
    const sideB = members.filter((m) => m.side === "sideB");
    const both = members.filter((m) => m.side === "both");

    if (sideA.length > 0) {
      lines.push(`   [${p1}'s Side]:`);
      sideA.forEach((m) => {
        lines.push(`     • ${m.name} (${m.relationship})${m.mustCapture ? " — [MUST CAPTURE]" : ""}`);
      });
    }
    if (sideB.length > 0) {
      lines.push(`   [${p2}'s Side]:`);
      sideB.forEach((m) => {
        lines.push(`     • ${m.name} (${m.relationship})${m.mustCapture ? " — [MUST CAPTURE]" : ""}`);
      });
    }
    if (both.length > 0) {
      lines.push(`   [Both Sides / Mutual]:`);
      both.forEach((m) => {
        lines.push(`     • ${m.name} (${m.relationship})${m.mustCapture ? " — [MUST CAPTURE]" : ""}`);
      });
    }
  }

  if (answers.q10_people.treePhotoUrl) {
    lines.push(`   • Family tree reference photo uploaded: Yes`);
  }
  if (answers.q10_people.treeNotes) {
    lines.push(`   • Written notes on family: ${answers.q10_people.treeNotes}`);
  }
  lines.push("");

  // CHAPTER 3
  lines.push(`CHAPTER 3: THE LOOK AND FEEL`);
  lines.push(subDivider);
  lines.push(`11. How do you want your wedding photographs and films to feel?`);
  lines.push(`   ${answers.q11_filmFeel ? answers.q11_filmFeel : '—'}`);
  lines.push("");

  lines.push(`12. Are there any photographers, films, or Pinterest references you love?`);
  if (answers.q12_references.links?.length) {
    lines.push(`   • Links: ${answers.q12_references.links.join(", ")}`);
  }
  if (answers.q12_references.images?.length) {
    lines.push(`   • Reference screenshots/photos attached: ${answers.q12_references.images.length} images`);
  }
  if (answers.q12_references.notes) {
    lines.push(`   • Specific photographers or films mentioned: ${answers.q12_references.notes}`);
  }
  if (!answers.q12_references.links?.length && !answers.q12_references.images?.length && !answers.q12_references.notes) {
    lines.push(`   —`);
  }
  lines.push("");

  lines.push(`13. What tone are you expecting to set for your wedding day`);
  lines.push(`   ${answers.q13_tone ? answers.q13_tone : '—'}`);
  lines.push("");

  // CHAPTER 4
  lines.push(`CHAPTER 4: YOUR DAY`);
  lines.push(subDivider);
  const moments = [
    ...(answers.q14_moments.selected || []),
    answers.q14_moments.other ? `Other: ${answers.q14_moments.other}` : null,
  ].filter(Boolean).join("; ");
  lines.push(`14. What are the moments you are most looking forward to during your wedding?`);
  lines.push(`   ${moments ? moments : '—'}`);
  lines.push("");

  lines.push(`15. Is there anything you definitely want us to capture or avoid?`);
  lines.push(`   • Definitely capture: ${answers.q15_captureAvoid.definitelyCapture || '—'}`);
  lines.push(`   • Please avoid: ${answers.q15_captureAvoid.pleaseAvoid || '—'}`);
  lines.push("");

  lines.push(`16. Please mention your non negotiables in your films and photographs?`);
  lines.push(`   ${answers.q16_nonNegotiables ? answers.q16_nonNegotiables : '—'}`);
  lines.push("");

  lines.push(`17. Who do you think is going to be more emotional during wedding?`);
  lines.push(`   ${answers.q17_emotional ? answers.q17_emotional : '—'}`);
  lines.push("");

  // CHAPTER 5
  lines.push(`CHAPTER 5: WORKING TOGETHER`);
  lines.push(subDivider);
  lines.push(`18. How versatile are you with the camera?`);
  lines.push(`   ${answers.q18_cameraVersatility ? answers.q18_cameraVersatility : '—'}`);
  lines.push("");

  const priorities = [
    ...(answers.q19_whatMattersMost.selected || []),
    answers.q19_whatMattersMost.other ? `Other: ${answers.q19_whatMattersMost.other}` : null,
  ].filter(Boolean).join("; ");
  lines.push(`19. What matters most to you when choosing a wedding photography and filmmaking team?`);
  lines.push(`   ${priorities ? priorities : '—'}`);
  lines.push("");

  lines.push(`20. How comfortable are you with being guided or directed during portraits and filming?`);
  lines.push(`   ${answers.q20_guidanceComfort ? answers.q20_guidanceComfort : '—'}`);
  lines.push("");

  const comfortTips = [
    ...(answers.q21_comfortTips.selected || []),
    answers.q21_comfortTips.notes ? `Note: ${answers.q21_comfortTips.notes}` : null,
  ].filter(Boolean).join("; ");
  lines.push(`21. Is there anything that would help you feel more comfortable in front of the camera?`);
  lines.push(`   ${comfortTips ? comfortTips : '—'}`);
  lines.push("");

  lines.push(`22. What do you hope to feel when you watch your wedding film years from now?`);
  lines.push(`   ${answers.q22_futureFeeling ? answers.q22_futureFeeling : '—'}`);
  lines.push("");

  // ONE LAST THING
  lines.push(`ONE LAST THING`);
  lines.push(subDivider);
  lines.push(`23. Is there anything else you would love us to know about you, your story, or your wedding?`);
  lines.push(`   ${answers.q23_oneLastThing.notes ? answers.q23_oneLastThing.notes : '—'}`);
  if (answers.q23_oneLastThing.images?.length) {
    lines.push(`   • Attached photos: ${answers.q23_oneLastThing.images.length} photos`);
  }
  lines.push("");
  lines.push(divider);

  return lines.join("\n");
}
