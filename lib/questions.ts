import { InterviewQuestion } from '@/types';

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: '1',
    text: '自己紹介をお願いします。お名前、学歴、そして自分の強みについて教えてください。',
    category: 'general',
    timeLimit: 120, // 2 minutes
  },
  {
    id: '2', 
    text: '当社を志望する理由を教えてください。',
    category: 'general',
    timeLimit: 90,
  },
  {
    id: '3',
    text: 'あなたの長所と短所について教えてください。',
    category: 'behavioral',
    timeLimit: 120,
  },
  {
    id: '4',
    text: '学生時代に最も力を入れて取り組んだことについて、具体的なエピソードを教えてください。',
    category: 'behavioral',
    timeLimit: 180, // 3 minutes
  },
  {
    id: '5',
    text: '5年後のあなたはどのような人材になっていたいですか？',
    category: 'general',
    timeLimit: 90,
  },
];

export const getRandomQuestion = (): InterviewQuestion => {
  const randomIndex = Math.floor(Math.random() * interviewQuestions.length);
  return interviewQuestions[randomIndex];
};

export const getQuestionById = (id: string): InterviewQuestion | undefined => {
  return interviewQuestions.find(q => q.id === id);
};