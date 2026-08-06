// lib/speedreading/passages.ts
// Original bilingual reading passages + comprehension questions for the WPM test (Скорочтение epic, slice 4).
// All prose is original and de-hustle clean (passages.test.ts asserts lintDehustle []). No third-party text.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface TestQuestion { prompt: Bi; choices: Bi[]; answer: number }
export interface TestPassage { id: string; text: Bi; questions: TestQuestion[] }

export const PASSAGES: TestPassage[] = [
  {
    id: 'attention',
    text: {
      ru: 'Чтение начинается не с глаз, а с внимания. Глаз способен различить строку за доли секунды, но смысл возникает только там, куда направлено внимание. Если оно рассеяно, взгляд скользит по словам, а в голове почти ничего не остаётся — приходится возвращаться и перечитывать. Внимание работает как узкий луч: в каждый момент оно освещает небольшой участок текста. Чем спокойнее ум, тем ровнее движется этот луч и тем реже он перескакивает назад. Тренировка чтения — это во многом тренировка внимания: научиться удерживать луч на строке, не отвлекаясь на посторонние мысли. Когда внимание собрано, скорость растёт сама собой, потому что глазу больше не приходится дважды проходить один и тот же участок. Поэтому первый шаг быстрого чтения — не ускорять глаз, а успокоить и собрать внимание.',
      en: 'Reading begins not with the eyes but with attention. The eye can take in a line in a fraction of a second, yet meaning appears only where attention is pointed. When it is scattered, the gaze slides over the words and almost nothing stays in the mind, so you have to go back and read again. Attention works like a narrow beam: at any moment it lights up a small part of the text. The calmer the mind, the more evenly that beam moves and the less it jumps backward. Training your reading is largely training your attention — learning to hold the beam on the line without drifting into stray thoughts. When attention is gathered, speed grows on its own, because the eye no longer has to cross the same stretch twice. So the first step of faster reading is not to speed up the eye but to settle and gather attention.',
    },
    questions: [
      {
        prompt: { ru: 'С чего, по тексту, начинается чтение?', en: 'Where does reading begin, according to the text?' },
        choices: [
          { ru: 'Со скорости глаза', en: 'With eye speed' },
          { ru: 'С внимания', en: 'With attention' },
          { ru: 'С громкости голоса', en: 'With the loudness of the voice' },
          { ru: 'С размера шрифта', en: 'With font size' },
        ],
        answer: 1,
      },
      {
        prompt: { ru: 'Что происходит, когда внимание рассеяно?', en: 'What happens when attention is scattered?' },
        choices: [
          { ru: 'Скорость растёт', en: 'Speed increases' },
          { ru: 'Приходится возвращаться и перечитывать', en: 'You have to go back and re-read' },
          { ru: 'Глаз отдыхает', en: 'The eye rests' },
          { ru: 'Текст запоминается лучше', en: 'The text is remembered better' },
        ],
        answer: 1,
      },
      {
        prompt: { ru: 'Каков, по тексту, первый шаг быстрого чтения?', en: 'What is the first step of faster reading?' },
        choices: [
          { ru: 'Ускорять глаз', en: 'Speed up the eye' },
          { ru: 'Читать вслух', en: 'Read aloud' },
          { ru: 'Собрать и успокоить внимание', en: 'Settle and gather attention' },
          { ru: 'Увеличить шрифт', en: 'Enlarge the font' },
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 'memory',
    text: {
      ru: 'Прочитать — не значит запомнить. Память устроена так, что большая часть новой информации быстро тускнеет: уже через сутки без повторения в голове остаётся лишь малая доля прочитанного. Психолог Герман Эббингауз описал это как кривую забывания — она круто падает в первые часы, а потом становится более пологой. И вот что важно: каждое повторение делает кривую положе — то, что мы возвращаем в память через день, через неделю и через месяц, держится куда дольше. Поэтому для чтения важна не только скорость, но и то, что происходит после. Короткий пересказ своими словами сразу после текста, а затем несколько разнесённых во времени повторений сохраняют больше, чем повторное чтение подряд. Смысл, связанный с тем, что вы уже знаете, забывается медленнее, чем отдельные разрозненные факты.',
      en: 'Reading something is not the same as remembering it. Memory is built so that most new information fades quickly: within a day, without review, only a small share of what you read is still in your head. The psychologist Hermann Ebbinghaus described this as the forgetting curve — it drops steeply in the first hours and then flattens out. And here is what matters: each review makes the curve gentler — what we bring back to mind after a day, a week, and a month holds far longer. So for reading, not only speed matters but also what happens afterward. A short retelling in your own words right after the text, followed by a few reviews spread over time, keeps more than reading it again straight through. Meaning tied to what you already know is forgotten more slowly than separate, disconnected facts.',
    },
    questions: [
      {
        prompt: { ru: 'Что происходит с большей частью новой информации через сутки без повторения?', en: 'What happens to most new information after a day without review?' },
        choices: [
          { ru: 'Она укрепляется', en: 'It gets stronger' },
          { ru: 'Остаётся лишь малая доля', en: 'Only a small share remains' },
          { ru: 'Она сохраняется полностью', en: 'It is fully kept' },
          { ru: 'Она превращается в навык', en: 'It turns into a skill' },
        ],
        answer: 1,
      },
      {
        prompt: { ru: 'Кто описал кривую забывания?', en: 'Who described the forgetting curve?' },
        choices: [
          { ru: 'Иван Павлов', en: 'Ivan Pavlov' },
          { ru: 'Герман Эббингауз', en: 'Hermann Ebbinghaus' },
          { ru: 'Альфред Бине', en: 'Alfred Binet' },
          { ru: 'Уильям Джеймс', en: 'William James' },
        ],
        answer: 1,
      },
      {
        prompt: { ru: 'Что, по тексту, помогает сохранить больше?', en: 'What helps keep more, per the text?' },
        choices: [
          { ru: 'Читать один раз очень быстро', en: 'Reading once very fast' },
          { ru: 'Повторное чтение подряд', en: 'Reading again straight through' },
          { ru: 'Пересказ и разнесённые повторения', en: 'Retelling and spaced reviews' },
          { ru: 'Ничего не делать после', en: 'Doing nothing afterward' },
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 'vision',
    text: {
      ru: 'Во время чтения глаз движется не плавно, а короткими скачками. Между скачками он на миг замирает — и только в эти остановки мозг получает чёткую картинку. Сам скачок длится доли секунды, и в этот момент мы почти ничего не видим. Опытный читатель делает меньше остановок на строке, потому что за одну остановку захватывает не одно слово, а небольшую группу. Помогает в этом периферийное зрение: чёткой остаётся лишь узкая центральная зона, но края поля тоже несут информацию, и её можно научиться использовать. Ещё одна привычка, которая замедляет чтение, — возвраты, когда глаз без необходимости прыгает к уже прочитанному. Чем спокойнее и увереннее идёт взгляд, тем меньше таких возвратов. Поэтому тренажёры скорочтения работают с двумя вещами сразу: расширяют зону охвата и убирают лишние возвраты.',
      en: 'While reading, the eye does not glide smoothly but moves in short jumps. Between the jumps it freezes for an instant — and only in those stops does the brain get a clear picture. The jump itself lasts a fraction of a second, and during it we see almost nothing. A practised reader makes fewer stops per line, because each stop takes in not a single word but a small group. Peripheral vision helps here: only a narrow central zone stays sharp, but the edges of the field carry information too, and you can learn to use it. Another habit that slows reading is regression — when the eye jumps back to already-read words without need. The calmer and more confident the gaze, the fewer such returns. This is why speed-reading trainers work on two things at once: they widen the span you take in and remove the extra returns.',
    },
    questions: [
      {
        prompt: { ru: 'Как движется глаз при чтении?', en: 'How does the eye move while reading?' },
        choices: [
          { ru: 'Плавно и непрерывно', en: 'Smoothly and continuously' },
          { ru: 'Короткими скачками с остановками', en: 'In short jumps with stops' },
          { ru: 'Только сверху вниз', en: 'Only top to bottom' },
          { ru: 'По кругу', en: 'In a circle' },
        ],
        answer: 1,
      },
      {
        prompt: { ru: 'Когда мозг получает чёткую картинку?', en: 'When does the brain get a clear picture?' },
        choices: [
          { ru: 'Во время скачка', en: 'During the jump' },
          { ru: 'В моменты остановки', en: 'In the moments it stops' },
          { ru: 'Постоянно', en: 'Constantly' },
          { ru: 'Только в начале строки', en: "Only at the line's start" },
        ],
        answer: 1,
      },
      {
        prompt: { ru: 'С какими двумя вещами, по тексту, работают тренажёры?', en: 'What two things do the trainers work on, per the text?' },
        choices: [
          { ru: 'Громкость и темп', en: 'Loudness and tempo' },
          { ru: 'Зона охвата и лишние возвраты', en: 'The span taken in and extra returns' },
          { ru: 'Шрифт и цвет', en: 'Font and color' },
          { ru: 'Поза и дыхание', en: 'Posture and breathing' },
        ],
        answer: 1,
      },
    ],
  },
]

export interface ResolvedQuestion { prompt: string; choices: string[]; answer: number }
export interface ResolvedPassage { id: string; text: string; questions: ResolvedQuestion[] }

export function resolvePassage(passage: TestPassage, locale: Locale): ResolvedPassage {
  return {
    id: passage.id,
    text: passage.text[locale],
    questions: passage.questions.map(q => ({ prompt: q.prompt[locale], choices: q.choices.map(c => c[locale]), answer: q.answer })),
  }
}

export function pickPassage(count: number): TestPassage {
  return PASSAGES[((count % PASSAGES.length) + PASSAGES.length) % PASSAGES.length]
}
