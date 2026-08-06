// «Практика в живой связи» — первый курс академии. Engine + data: движок читает
// данные, копи здесь. Источник — приватный разбор одного онлайн-курса
// (academy/_notes, gitignored); публичный текст не называет ни курса, ни автора
// разбора. Публичные книги и программы называются по правилу дома
// «Слова имеют происхождение».
import type { Locale } from '../registry'

interface Bi { ru: string; en: string }

export interface Lesson {
  slug: string
  title: Bi
  summary: Bi
  /** Абзацы урока; локализованный массив одинаковой длины не требуется */
  prose: { ru: string[]; en: string[] }
}

export interface CourseCopy {
  eyebrow: string
  heading: string
  tagline: string
  intro: string[]
  lessonsLabel: string
  lessons: { slug: string; title: string; summary: string }[]
  metaTitle: string
  metaDescription: string
  backLabel: string
  indexBackLabel: string
}

const COURSE: { name: Bi; tagline: Bi; intro: { ru: string[]; en: string[] } } = {
  name: { ru: 'Практика в живой связи', en: 'Practice in Living Connection' },
  tagline: {
    ru: 'шесть уроков о том, почему честной практике внимания нужны другие люди',
    en: 'six lessons on why an honest attention practice needs other people',
  },
  intro: {
    ru: [
      'Практики внимания сегодня продаются как приложение: включил запись, подышал, закрыл вкладку. Этот курс — о том, что при такой упаковке теряется несущая конструкция: другие люди. Не аудитория, не чат с красивыми картинками — живой круг, в котором опыт можно произнести вслух и быть услышанным.',
      'Шесть коротких уроков. Ни один не обещает результата и не заменяет ни врача, ни психотерапевта. Это карта различий: как отличить практику, которая встречает человека, от практики, которая его изолирует.',
    ],
    en: [
      'Attention practices are sold like an app these days: play the recording, breathe, close the tab. This course is about what that packaging strips away — the load-bearing structure of other people. Not an audience, not a chat full of pretty pictures: a living circle where experience can be spoken out loud and heard.',
      'Six short lessons. None of them promises an outcome, and none replaces a doctor or a psychotherapist. It is a map of distinctions: how to tell a practice that meets a person from a practice that isolates one.',
    ],
  },
}

export const LESSONS: Lesson[] = [
  {
    slug: 'slon-v-komnate',
    title: { ru: 'Слон в комнате', en: 'The elephant in the room' },
    summary: {
      ru: 'Чего не видит одиночная практика — и почему классические программы осознанности были групповыми.',
      en: 'What a solitary practice cannot see — and why the classic mindfulness programs were group-based.',
    },
    prose: {
      ru: [
        'У практики внимания есть слепое пятно, и оно устроено просто: то, что человек вытесняет, не приходит к нему по запросу. Сидя в одиночестве с закрытыми глазами, можно годами наблюдать дыхание и ни разу не встретить того, от чего дыхание сбивается. Психика бережёт хозяина: неудобное не показывается, пока рядом нет никого, кто мог бы его выдержать вместе с ним.',
        'Поэтому зрелые форматы практики никогда не были одиночными. Программа MBSR, с которой в 1979 году Джон Кабат-Зинн начал светскую линию обучения осознанности, была очной и групповой: восемь недель, еженедельные встречи по два с половиной — три часа, дневной ретрит, и — обязательной частью — разговор. Участники вместе практиковали и вместе обсуждали, что поднимается. Обсуждение не было довеском к методу. Оно было методом.',
        'Когда такой курс переносят в интернет и по дороге убирают групповой процесс — остаются тексты, записи и дневник, который читает незнакомый проверяющий, — форма сохранена, конструкция вынута. Человек остаётся один на один с тем, что практика в нём поднимает. В лучшем случае она тогда просто не работает глубоко: психика мудро не открывает того, что некому разделить. В худшем — открывает.',
        'Слон в комнате одиночной практики — сама комната: в ней больше никого нет. Первый вопрос к любому курсу внимания звучит не «какая техника», а «кто будет рядом, когда техника сработает».',
      ],
      en: [
        'An attention practice has a blind spot, and it is simply built: what a person represses does not show up on request. Sitting alone with closed eyes, you can watch your breath for years and never once meet the thing that makes the breath catch. The psyche protects its owner: the uncomfortable does not surface while there is no one nearby who could hold it together with you.',
        'This is why mature practice formats were never solitary. MBSR — the program with which Jon Kabat-Zinn started the secular line of mindfulness training in 1979 — was in-person and group-based: eight weeks, weekly meetings of two and a half to three hours, a day-long retreat, and, as a mandatory part, conversation. Participants practiced together and discussed together what was coming up. The discussion was not an add-on to the method. It was the method.',
        'When such a course is moved online and the group process is quietly removed along the way — leaving texts, recordings, and a diary read by an unfamiliar reviewer — the form is preserved and the structure is taken out. A person is left alone with whatever the practice stirs in them. In the better case it then simply does not work deeply: the psyche wisely does not open what there is no one to share. In the worse case — it opens.',
        'The elephant in the room of solitary practice is the room itself: there is no one else in it. The first question to ask of any attention course is not "what is the technique" but "who will be there when the technique works."',
      ],
    },
  },
  {
    slug: 'anatomiya-myortvoy-praktiki',
    title: { ru: 'Анатомия мёртвой практики', en: 'Anatomy of a dead practice' },
    summary: {
      ru: 'Чек-лист различий: изоляция, вопросы без адресата, методичка вместо живого текста, комфорт вместо контакта.',
      en: 'A checklist of distinctions: isolation, questions with no addressee, a manual instead of a living text, comfort instead of contact.',
    },
    prose: {
      ru: [
        'Мёртвую практику можно узнать до того, как она начнёт вредить. У неё повторяющаяся анатомия, и каждый орган проверяется простым вопросом.',
        'Первое — изоляция, выданная за формат. Участников много, но между ними нет ни диалога, ни обсуждения; совместные сессии устроены так, что слова никому не дают. Проверка: предусмотрено ли место, где твой опыт слышат живые люди — не смайликом, а ответом.',
        'Второе — вопросы без адресата. Задать вопрос можно, получить ответ — нет: сопровождающие меняются каждую неделю, квалификации не хватает, и на прямой вопрос о методе приходит вежливая пустота. Проверка: спроси о происхождении метода и посмотри, ответит ли кто-нибудь по существу.',
        'Третье — методичка вместо живого текста. Инструкции правильные, сухие и безжизненные: делай раз, делай два. Живые тексты о практике узнаются иначе — сквозь них сквозит понимание и тепло к читателю. Проверка: захотелось ли перечитать хоть один абзац не по обязанности.',
        'Четвёртое — комфорт, выданный за глубину. Обещано приятное состояние в уютной обстановке; всё неудобное, что практика обязана поднимать, объявлено признаком того, что с тобой что-то не так. Проверка: есть ли у формата место для трудного — или трудное по умолчанию отправляют «разбираться самостоятельно».',
        'Ни один пункт сам по себе не приговор. Все четыре вместе — диагноз: перед тобой упаковка практики, из которой вынули практику.',
      ],
      en: [
        'A dead practice can be recognized before it starts doing harm. Its anatomy repeats, and each organ is checked with a simple question.',
        'First — isolation presented as a format. There are many participants, but no dialogue and no discussion between them; the shared sessions are built so that no one is given the floor. The check: is there a place where living people hear your experience — not with an emoji, but with an answer.',
        'Second — questions with no addressee. Asking is possible; receiving an answer is not: the facilitators change every week, the qualification is not there, and a direct question about the method returns a polite emptiness. The check: ask where the method comes from and see whether anyone answers in substance.',
        'Third — a manual instead of a living text. The instructions are correct, dry, and lifeless: do this, do that. Living texts about practice read differently — understanding and warmth toward the reader come through them. The check: did you want to reread even one paragraph other than out of duty.',
        'Fourth — comfort presented as depth. A pleasant state in a cozy setting is promised; everything uncomfortable that a practice is obliged to bring up is declared a sign that something is wrong with you. The check: does the format have room for the difficult — or is the difficult sent off by default to be "dealt with on your own."',
        'No single item is a verdict on its own. All four together are a diagnosis: you are looking at the packaging of a practice from which the practice has been removed.',
      ],
    },
  },
  {
    slug: 'svidetelstvovanie',
    title: { ru: 'Свидетельствование', en: 'Witnessing' },
    summary: {
      ru: 'В честной практике проявляются вытесненные чувства — и им нужен свидетель. Граница: практика не терапия.',
      en: 'In an honest practice, repressed feelings surface — and they need a witness. The boundary: practice is not therapy.',
    },
    prose: {
      ru: [
        'Если практика внимания настоящая, рано или поздно она делает неудобную вещь: показывает человеку чувства, которые он не выбирал видеть. Тревогу, ярость, горе — всё, что было аккуратно убрано, чтобы жить дальше. Это не сбой практики. Это её работа: внимание — свет, и он не выбирает, что освещать.',
        'В такой момент решает не техника, а присутствие. Чувству, которое впервые названо вслух, нужен свидетель — человек, который выдержит услышанное, не бросившись чинить, оценивать или успокаивать. В зрелых традициях эту роль несёт учитель или круг; в честных светских программах — группа и ведущий. Свидетельствование не делает ничего эффектного. Оно делает главное: неудобное чувство перестаёт быть постыдной тайной и становится частью общего человеческого опыта.',
        'Отсюда простое следствие: если формат устроен так, что поднятые чувства некому разделить, то от чувств он умеет только защищаться. Тогда «спокойствие», которое формат производит, — не плод практики, а укрепление тех же стен, что человек и так строил всю жизнь.',
        'И граница, которую этот курс повторит не раз: свидетельствование — не лечение. Есть состояния, с которыми правильно идти к психотерапевту и врачу, и никакая практика этого похода не отменяет. Честная школа говорит это прямо и сама показывает дорогу к специалисту — не потому, что человек «не справился», а потому, что уважает пределы своего ремесла.',
      ],
      en: [
        'If an attention practice is real, sooner or later it does an inconvenient thing: it shows a person feelings they did not choose to see. Anxiety, rage, grief — everything that was neatly put away so life could go on. This is not the practice malfunctioning. This is its work: attention is light, and light does not choose what to illuminate.',
        'At such a moment it is not the technique that decides, but presence. A feeling named out loud for the first time needs a witness — a person who can hold what they heard without rushing to fix, judge, or soothe. In mature traditions this role is carried by a teacher or a circle; in honest secular programs, by the group and its facilitator. Witnessing does nothing spectacular. It does the essential: the uncomfortable feeling stops being a shameful secret and becomes part of shared human experience.',
        'A simple consequence follows: if a format is built so that no one is there to share what surfaces, then the only thing it can do with feelings is defend against them. The "calm" such a format produces is not a fruit of practice but a reinforcement of the same walls the person has been building all along.',
        'And the boundary this course will repeat more than once: witnessing is not treatment. There are states with which the right move is to see a psychotherapist and a doctor, and no practice cancels that visit. An honest school says this plainly and points the way to a specialist itself — not because the person "failed to cope," but because it respects the limits of its craft.',
      ],
    },
  },
  {
    slug: 'osoznannost-bez-zakuporki',
    title: { ru: 'Осознанность без закупорки', en: 'Awareness without sealing over' },
    summary: {
      ru: 'Понимание себя в мире против вытеснения неприятного; ловушка элитного комфорта и чувства собственной важности.',
      en: 'Understanding yourself in the world versus repressing the unpleasant; the trap of elite comfort and self-importance.',
    },
    prose: {
      ru: [
        'Слово «осознанность» стало скользким. В массовой упаковке оно всё чаще означает не понимание себя в мире, а умение не замечать в мире ничего неприятного — включая собственную роль в нём. Такая осознанность работает как закупорка: человек герметично закрывается в комфортном «здесь и сейчас», где нет ни его истории, ни его общества, ни его ответственности.',
        'Кен Уилбер назвал родственное явление «бумеритом»: современная духовность легко заражается нарциссизмом, и тогда практика служит не пробуждению, а самоукрашению. В комплекте обычно идёт чувство собственной важности: «я практикую» превращается в тихую форму «я лучше тех, кто суетится». Узнать эту подмену просто — по плодам. Настоящая практика делает человека более проницаемым для мира: он яснее видит других людей и своё место среди них. Закупорка делает наоборот: мир становится декорацией к личному спокойствию.',
        'Особенно честно этот тест работает в трудные времена. Тревога, страх и гнев в ответ на большие события — не поломка, которую практика должна устранить, а здоровый отклик живого человека на действительность. Формат, который предлагает эти чувства просто выключить — не встретить, не понять, а выключить, — предлагает не равновесие, а анестезию.',
        'Осознанность без закупорки не гарантирует комфорта. Она возвращает человеку способность видеть — в том числе то, на что смотреть не хочется. И потому ей снова нужны другие люди: в одиночку удобнее всего не видеть.',
      ],
      en: [
        'The word "mindfulness" has become slippery. In its mass-market packaging it more and more often means not understanding yourself in the world, but the skill of noticing nothing unpleasant in the world — including your own role in it. That kind of awareness works like a seal: a person closes hermetically into a comfortable "here and now" that contains no history, no society, and no responsibility of theirs.',
        'Ken Wilber gave a kindred phenomenon the name "Boomeritis": modern spirituality is easily infected by narcissism, and then practice serves not awakening but self-decoration. Self-importance usually comes bundled in: "I practice" quietly turns into "I am better than the ones who fuss." The substitution is easy to recognize — by its fruits. A real practice makes a person more permeable to the world: they see other people, and their own place among them, more clearly. Sealing over does the opposite: the world becomes scenery for one’s personal calm.',
        'The test is at its most honest in hard times. Anxiety, fear, and anger in response to large events are not a malfunction for practice to remove, but a healthy response of a living person to reality. A format that offers to simply switch those feelings off — not meet them, not understand them, switch them off — is offering not balance but anesthesia.',
        'Awareness without sealing over does not guarantee comfort. It gives a person back the capacity to see — including what one would rather not look at. And that is why, again, it needs other people: alone, not seeing is the most comfortable option there is.',
      ],
    },
  },
  {
    slug: 'krug-praktiki',
    title: { ru: 'Круг практики', en: 'The practice circle' },
    summary: {
      ru: 'Как собрать живой формат: малая группа, обмен опытом, слово у каждого. Мост к ИГИ-ритуалу синергемы.',
      en: 'How to assemble a living format: a small group, shared experience, everyone gets the floor. A bridge to the synergema insight ritual.',
    },
    prose: {
      ru: [
        'Живой формат не требует ни зала, ни лицензии, ни харизматичного ведущего. Ему нужно немногое, но именно это немногое чаще всего и убирают.',
        'Малая группа — такая, чтобы за встречу слово успел взять каждый. Четыре-восемь человек достаточно; сто участников вебинара — это не группа, а аудитория.',
        'Регулярность и заранее известный план. Тему встречи задаёт календарь, а не настроение ведущего — этот принцип защищает круг от превращения в чей-то театр.',
        'Обмен опытом как обязательная часть. После совместной практики — время, когда каждый может сказать, что поднялось, и быть услышанным без оценки и без советов, которых не просили. Слово идёт по кругу; молчание — законный ответ, но у каждого есть место, где его слышат.',
        'Вращение ролей. Вести круг — не должность: сегодня ведёшь ты, через месяц — другой. Так у круга не отрастает властная вертикаль, а у ведущего — нимб.',
        'И выход, который ничего не стоит: уйти можно молча, вернуться — без объяснений. Круг, из которого страшно уйти, уже не круг, а ловушка.',
        'В академии этой конструкции соответствует ИГИ — ритуал группового инсайта синергемы: карты-категории, четыре шага, слово у каждого. Он самодостаточен: не нужен сервер, аккаунт или ведущий со стороны — только несколько людей, договорившихся встречаться. Собранный по этим правилам круг и есть та несущая конструкция, о которой были первые четыре урока.',
      ],
      en: [
        'A living format requires no hall, no license, and no charismatic leader. It needs little — but that little is exactly what usually gets removed.',
        'A small group — small enough that everyone gets the floor within one meeting. Four to eight people is enough; a hundred webinar attendees is not a group, it is an audience.',
        'Regularity and a plan known in advance. The calendar sets the topic of the meeting, not the facilitator’s mood — this principle protects the circle from becoming someone’s theater.',
        'Shared experience as a mandatory part. After practicing together — time in which each person can say what came up and be heard without evaluation and without advice no one asked for. The floor moves around the circle; silence is a legitimate answer, but everyone has a place where they are heard.',
        'Rotating roles. Leading the circle is not a post: today you lead, next month someone else does. This keeps a vertical of power from growing in the circle — and a halo from growing on the leader.',
        'And an exit that costs nothing: you may leave quietly and return without explanations. A circle that is frightening to leave is no longer a circle but a trap.',
        'In the academy this construction has a name: IGI, the synergema group-insight ritual — category cards, four steps, everyone gets the floor. It is self-sufficient: no server, no account, no outside facilitator — only a few people who agreed to meet. A circle assembled by these rules is the load-bearing structure the first four lessons were about.',
      ],
    },
  },
  {
    slug: 'kak-vybirat-shkolu',
    title: { ru: 'Как выбирать школу', en: 'How to choose a school' },
    summary: {
      ru: 'Вопросы, на которые школа обязана отвечать, — и главный признак удавшейся школы: она перестаёт быть нужной.',
      en: 'The questions a school must answer — and the main sign of a school that worked: it stops being needed.',
    },
    prose: {
      ru: [
        'Всё, что разобрано в пяти уроках, сворачивается в короткий список вопросов. Их можно задать любому курсу, школе или кругу — до того, как отдать им своё время.',
        'Кто ответит на мой вопрос о методе — и хватит ли у этого человека квалификации? «У нас есть кураторы» — не ответ, если куратор меняется еженедельно и на вопрос по существу отвечает пересылкой.',
        'Откуда метод? Школа, которая называет происхождение своих практик — включая спорные страницы, — надёжнее школы, которая заимствует тихо и переименовывает чужое в своё.',
        'Где в формате живые люди? Есть ли место, где мой опыт услышат и разделят, — или мне предложены записи, тексты и дневник, уходящий в пустоту.',
        'Что здесь делают с трудным? Если всё неудобное объявляется моей личной неисправностью и отправляется «на психотерапию» — при том, что сам формат и поднял это неудобное, — школа пользуется плодами практики, не отвечая за них.',
        'Можно ли уйти? Молча, без последствий, без разговора об «уровне, который ты потеряешь». И — симметрично — можно ли остаться собой: формат, требующий отдалиться от семьи, друзей и работы, отвечает на этот вопрос отрицательно.',
        'И последний вопрос — самый важный: чем это закончится? Честная школа строит свою ненужность: она растит людей, которые дальше практикуют сами, в своих кругах, без неё. Если у пути нет конца — если всегда есть следующий уровень, следующая ступень доступа, следующая причина остаться — это не путь. Это подписка.',
      ],
      en: [
        'Everything taken apart in the previous five lessons folds into a short list of questions. You can put them to any course, school, or circle — before giving them your time.',
        'Who will answer my question about the method — and is that person qualified to? "We have curators" is not an answer if the curator changes weekly and responds to a substantive question by forwarding it.',
        'Where does the method come from? A school that names the origins of its practices — including the disputed pages — is more reliable than a school that borrows quietly and renames someone else’s work as its own.',
        'Where are the living people in this format? Is there a place where my experience will be heard and shared — or am I offered recordings, texts, and a diary that goes into a void.',
        'What is done here with the difficult? If everything uncomfortable is declared my personal defect and referred out — while it was the format itself that brought this discomfort up — the school is harvesting the fruits of practice without answering for them.',
        'Can I leave? Quietly, without consequences, without a talk about "the level you will lose." And, symmetrically, can I remain myself: a format that requires stepping away from family, friends, and work has answered this question in the negative.',
        'And the last question — the most important one: how does this end? An honest school builds its own unnecessity: it grows people who go on practicing by themselves, in their own circles, without it. If the path has no end — if there is always a next level, a next tier of access, a next reason to stay — it is not a path. It is a subscription.',
      ],
    },
  },
]

const UI: Record<Locale, { eyebrow: string; lessonsLabel: string; backLabel: string; indexBackLabel: string; lessonWord: string }> = {
  ru: {
    eyebrow: 'курс академии',
    lessonsLabel: 'уроки',
    backLabel: '← к курсу',
    indexBackLabel: '← к академии',
    lessonWord: 'урок',
  },
  en: {
    eyebrow: 'academy course',
    lessonsLabel: 'lessons',
    backLabel: '← back to the course',
    indexBackLabel: '← back to the academy',
    lessonWord: 'lesson',
  },
}

export function resolveCourse(locale: Locale): CourseCopy {
  const ui = UI[locale]
  return {
    eyebrow: ui.eyebrow,
    heading: COURSE.name[locale],
    tagline: COURSE.tagline[locale],
    intro: COURSE.intro[locale],
    lessonsLabel: ui.lessonsLabel,
    lessons: LESSONS.map((l) => ({ slug: l.slug, title: l.title[locale], summary: l.summary[locale] })),
    metaTitle: `${COURSE.name[locale]} — S.A.S.H.A`,
    metaDescription: COURSE.tagline[locale],
    backLabel: ui.backLabel,
    indexBackLabel: ui.indexBackLabel,
  }
}

export interface LessonView {
  eyebrow: string
  index: number
  total: number
  title: string
  prose: string[]
  metaTitle: string
  metaDescription: string
  backLabel: string
  next: { slug: string; title: string } | null
}

export function getLesson(slug: string, locale: Locale): LessonView | null {
  const i = LESSONS.findIndex((l) => l.slug === slug)
  if (i === -1) return null
  const lesson = LESSONS[i]
  const ui = UI[locale]
  const next = LESSONS[i + 1] ?? null
  return {
    eyebrow: `${ui.lessonWord} ${String(i + 1).padStart(2, '0')} / ${String(LESSONS.length).padStart(2, '0')}`,
    index: i + 1,
    total: LESSONS.length,
    title: lesson.title[locale],
    prose: lesson.prose[locale],
    metaTitle: `${lesson.title[locale]} — ${COURSE.name[locale]}`,
    metaDescription: lesson.summary[locale],
    backLabel: ui.backLabel,
    next: next ? { slug: next.slug, title: next.title[locale] } : null,
  }
}

/** Карточка курса для лендинга академии (внутренняя ссылка, не registry). */
export function courseCard(locale: Locale): { name: string; tagline: string; href: string } {
  return {
    name: COURSE.name[locale],
    tagline: COURSE.tagline[locale],
    href: locale === 'en' ? '/en/praktika/' : '/praktika/',
  }
}
