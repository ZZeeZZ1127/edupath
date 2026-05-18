import type { StudentProfile, ChatMessage } from '../types';

export const mariaProfile: StudentProfile = {
  name: `Maria`,
  grade: 11,
  age: 17,
  interests: [`Biology`, `Debate`, `Pre-Medicine`, `Environmental Science`],
  strengths: [`Research`, `Public Speaking`, `Writing`, `Critical Thinking`],
  goals: [`Apply to top universities with strong pre-med programs`, `Pursue research experience and debate competitions before senior year`],
  extracurriculars: [`Debate Team (Captain)`, `Science Club`, `Hospital Volunteer`, `School Newspaper`],
};

export const mockChatHistory: ChatMessage[] = [
  {
    id: `msg-1`,
    role: `user`,
    content: `What should I be doing this year to prepare for college?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: `msg-2`,
    role: `assistant`,
    content: `Maria, based on your biology interest and your role as debate team captain, this is a critical year for building your application narrative. Here's what I'd prioritize:\n\n**This semester:**\n- Apply to the **NIH Summer Internship Program** — your biology background makes you a strong candidate, and the deadline is March 2026\n- Push your debate team to nationals qualifications — as captain, a nationals bid is a significant leadership achievement\n- Take on a leadership role in your hospital volunteering (patient liaison or youth ambassador programs are common)\n\n**For your college list:**\nYour biology + pre-med goals + debate background is a compelling combination. I've identified 6 schools that match your profile well — from reach schools like Johns Hopkins (where your biology research interest directly fits their biomedical focus) to strong matches like University of Michigan (ranked debate team + top pre-med).\n\nWant me to build a full application plan for any of these?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9),
  },
];
