// Стартовый набор реестра практик (spec подпроекта B, §5.4; слово владельца 2026-10-17: «забери из файлов intake +
// … Retreats Blueprint.docx»). Это пересказ, а не цитата: имена ведущих и площадок убраны, обещания заменены описанием
// того, что делает гость. Поля, которые исходник не заполнил, дописаны и перечислены в `added` — страница помечает их.
// Не вошли (спека §5.4 и решение контроллера): церемонии с веществами, «очищения» с медицинским обещанием, тактильные
// практики с детьми, практики, от которых в исходнике осталось одно название, и практики, суть которых — обещание
// («целительская практика», «развитие экстрасенсорных способностей»).

import type { Lang } from '../retreat-calc/engine'

type Bi = Record<Lang, string>

export interface StarterCard {
  id: string
  format: 'group' | 'pair' | 'solo'
  groupMinutes: number | null
  pairMinutes: number | null
  touch: boolean
  load: 'low' | 'medium' | 'high'
  name: Bi
  groupSize: Bi
  touchConsent: Bi
  contraindications: Bi
  guestDoes: Bi
  description: Bi
  needs: Bi
  notPromise: Bi
  source: Bi
  /** Поля, дописанные к исходнику. */
  added: string[]
}

const CATALOG: Bi = { ru: 'Каталог практик ведущих из интейка курса, пересказ.', en: 'Leaders’ practice catalogue from the course intake, retold.' }
const BLUEPRINT: Bi = { ru: 'Мастер-документ ретритов из интейка курса, пересказ.', en: 'Retreat master document from the course intake, retold.' }
const NONE: Bi = { ru: '', en: '' }
const NO_TOUCH_CONTRA: Bi = { ru: 'Особых нет. Гость может сидеть в стороне и просто слушать.', en: 'None in particular. A guest may sit aside and just listen.' }

export const STARTER: readonly StarterCard[] = [
  {
    id: 'intention-circle', format: 'group', groupMinutes: 20, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Круг намерений', en: 'Intention circle' },
    groupSize: { ru: 'вся группа, до 20', en: 'whole group, up to 20' },
    touchConsent: NONE,
    contraindications: NO_TOUCH_CONTRA,
    guestDoes: { ru: 'Сидит в круге и по очереди говорит, с чем пришёл на ретрит. Можно передать слово дальше.', en: 'Sits in a circle and, in turn, says what they came to the retreat with. Passing is fine.' },
    description: { ru: 'Открытие первого дня. Каждый называет своё намерение на эти дни, остальные слушают без советов.', en: 'Opens the first day. Each person names an intention for these days; the others listen without advice.' },
    needs: { ru: 'Зал, подушки или стулья кругом.', en: 'A room, cushions or chairs in a circle.' },
    notPromise: { ru: 'Круг помогает услышать группу, а не исполняет намерения.', en: 'The circle helps people hear each other; it does not make intentions come true.' },
    source: CATALOG,
    added: ['groupSize', 'contraindications', 'needs', 'notPromise'],
  },
  {
    id: 'voice-breath', format: 'group', groupMinutes: 20, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Звук на выдохе', en: 'Sound on the out-breath' },
    groupSize: { ru: 'любая', en: 'any' },
    touchConsent: NONE,
    contraindications: { ru: 'При болезни горла — без звука, только дыхание.', en: 'With a sore throat, breathe without sound.' },
    guestDoes: { ru: 'Сидит, дышит и тянет на выдохе гласные звуки за ведущим, от низких к высоким.', en: 'Sits, breathes and hums vowel sounds on the out-breath after the leader, from low to high.' },
    description: { ru: 'Короткая голосовая практика: семь звуков по традиции чакр, по две-три минуты на каждый.', en: 'A short voice practice: seven sounds following the chakra tradition, two or three minutes each.' },
    needs: { ru: 'Тихий зал.', en: 'A quiet room.' },
    notPromise: { ru: 'Это работа с голосом и дыханием, а не настройка энергии.', en: 'This is voice and breath work, not energy tuning.' },
    source: CATALOG,
    added: ['groupSize', 'contraindications', 'needs', 'notPromise'],
  },
  {
    id: 'dynamic-meditation', format: 'group', groupMinutes: 60, pairMinutes: null, touch: false, load: 'high',
    name: { ru: 'Динамическая медитация', en: 'Dynamic meditation' },
    groupSize: { ru: 'группа с инструктором, места вокруг каждого хватает на прыжки', en: 'a group with an instructor, room around each person for jumping' },
    touchConsent: NONE,
    contraindications: { ru: 'Болезни сердца, повышенное давление, беременность, эпилепсия, травмы суставов, недавние операции, запрет на интенсивную нагрузку. При боли или головокружении — остановиться. Делать натощак.', en: 'Heart conditions, high blood pressure, pregnancy, epilepsy, joint injuries, recent surgery, a ban on intense exercise. Stop at pain or dizziness. Do it on an empty stomach.' },
    guestDoes: { ru: 'Пять частей: быстрое хаотичное дыхание, выплеск движением и голосом, прыжки, замирание, танец.', en: 'Five parts: fast chaotic breathing, release through movement and voice, jumping, stillness, dance.' },
    description: { ru: 'Час по таймингу 10 + 10 + 10 + 15 + 15 минут под музыку. Прыжки можно заменить мягким пружинением на месте.', en: 'An hour timed 10 + 10 + 10 + 15 + 15 minutes to music. Jumping can be replaced by gentle bouncing in place.' },
    needs: { ru: 'Большой зал с местом вокруг каждого, повязки на глаза по желанию — с ними гость остаётся на своём месте, запись музыки.', en: 'A large room with space around each person, optional blindfolds — with one, a guest stays in place, the music.' },
    notPromise: { ru: 'Практика даёт сильную телесную нагрузку. Что она «очистит», мы не обещаем.', en: 'The practice is physically intense. We do not promise it will “cleanse” anything.' },
    source: { ru: 'Каталог практик и мастер-документ ретритов из интейка курса, пересказ. Метод известен по автору техники.', en: 'Practice catalogue and retreat master document from the course intake, retold. The method is known by its author.' },
    added: ['needs', 'notPromise'],
  },
  {
    id: 'gibberish', format: 'group', groupMinutes: 30, pairMinutes: null, touch: false, load: 'medium',
    name: { ru: 'Джиббериш', en: 'Gibberish' },
    groupSize: { ru: 'любая', en: 'any' },
    touchConsent: NONE,
    contraindications: { ru: 'Если громкий голос рядом пугает, гость сидит у края и говорит тихо.', en: 'If loud voices nearby feel scary, a guest sits at the edge and speaks quietly.' },
    guestDoes: { ru: 'Пятнадцать минут говорит вслух бессмысленные звуки, потом пятнадцать минут сидит в тишине.', en: 'Speaks meaningless sounds aloud for fifteen minutes, then sits in silence for fifteen.' },
    description: { ru: 'Практика на шум и тишину: сначала поток звуков без слов, затем неподвижное сидение.', en: 'A practice of noise and silence: a stream of wordless sounds, then sitting still.' },
    needs: { ru: 'Зал, где шум никому не мешает.', en: 'A room where noise bothers no one.' },
    notPromise: { ru: 'Мы не обещаем, что уйдут эмоции или мысли. Гость замечает, что с ним происходит.', en: 'We do not promise emotions or thoughts will go away. Guests notice what happens to them.' },
    source: CATALOG,
    added: ['groupSize', 'contraindications', 'guestDoes', 'needs', 'notPromise'],
  },
  {
    id: 'morning-breath', format: 'group', groupMinutes: 60, pairMinutes: null, touch: false, load: 'medium',
    name: { ru: 'Утренние дыхательные практики', en: 'Morning breathing practices' },
    groupSize: { ru: 'любая', en: 'any' },
    touchConsent: NONE,
    contraindications: { ru: 'Беременность, эпилепсия, повышенное давление, болезни сердца: только спокойное дыхание. При головокружении — вернуться к обычному дыханию.', en: 'Pregnancy, epilepsy, high blood pressure, heart conditions: calm breathing only. If dizzy, return to normal breathing.' },
    guestDoes: { ru: 'Сидит и дышит в разных ритмах за ведущим: медленно, с задержкой, затем быстрее.', en: 'Sits and breathes in different rhythms after the leader: slowly, with holds, then faster.' },
    description: { ru: 'Начало дня: 45–60 минут дыхательных упражнений от спокойных к более активным.', en: 'The start of the day: 45–60 minutes of breathing exercises, from calm to more active.' },
    needs: { ru: 'Коврики, свежий воздух.', en: 'Mats, fresh air.' },
    notPromise: { ru: 'Дыхание будит и согревает. Здоровье на весь день мы не обещаем.', en: 'Breathing wakes you up and warms you. We do not promise health for the whole day.' },
    source: CATALOG,
    added: ['groupSize', 'contraindications', 'guestDoes', 'needs', 'notPromise'],
  },
  {
    id: 'eye-contact', format: 'pair', groupMinutes: 40, pairMinutes: 10, touch: false, load: 'medium',
    name: { ru: 'Зрительный контакт в парах', en: 'Eye contact in pairs' },
    groupSize: { ru: 'чётное число; при нечётном ведущий встаёт в пару', en: 'an even number; with an odd number the leader joins a pair' },
    touchConsent: NONE,
    contraindications: { ru: 'Долгий взгляд в глаза бывает тяжёлым. Гость может отвести взгляд или выйти из пары.', en: 'A long gaze can feel heavy. A guest may look away or leave the pair.' },
    guestDoes: { ru: 'Сидит напротив партнёра и молча смотрит ему в глаза десять минут, затем меняет пару.', en: 'Sits opposite a partner and silently looks into their eyes for ten minutes, then changes partners.' },
    description: { ru: 'Десять минут на пару — в исходнике. На группу: четыре смены пар, сорок минут.', en: 'Ten minutes per pair in the source. For the group: four partner changes, forty minutes.' },
    needs: { ru: 'Подушки парами, таймер, мягкий звонок.', en: 'Cushions in pairs, a timer, a soft bell.' },
    notPromise: { ru: 'Практика про внимание к другому человеку, а не про развитие способностей.', en: 'The practice is about attention to another person, not about developing abilities.' },
    source: CATALOG,
    added: ['groupMinutes', 'groupSize', 'contraindications', 'needs', 'notPromise'],
  },
  {
    id: 'silent-attention', format: 'group', groupMinutes: 90, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Медитация внимания в тишине', en: 'Silent attention meditation' },
    groupSize: { ru: 'до 20', en: 'up to 20' },
    touchConsent: NONE,
    contraindications: NO_TOUCH_CONTRA,
    guestDoes: { ru: 'Сидит или лежит неподвижно и наблюдает ощущения, пока ведущий держит медитативное внимание.', en: 'Sits or lies still and observes sensations while the leader holds meditative attention.' },
    description: { ru: 'Пассивная медитативная техника из традиции кундалини-йоги. Полтора часа в тишине.', en: 'A passive meditative technique from the kundalini yoga tradition. An hour and a half in silence.' },
    needs: { ru: 'Тёплый зал, коврики, пледы.', en: 'A warm room, mats, blankets.' },
    notPromise: { ru: 'Это медитация. Она не заменяет врача и ничего не лечит.', en: 'This is meditation. It replaces no doctor and treats nothing.' },
    source: CATALOG,
    added: ['groupSize', 'contraindications', 'guestDoes', 'needs', 'notPromise'],
  },
  {
    id: 'kundalini-yoga', format: 'group', groupMinutes: 90, pairMinutes: null, touch: false, load: 'medium',
    name: { ru: 'Кундалини-йога', en: 'Kundalini yoga' },
    groupSize: { ru: 'любая, новичкам можно', en: 'any, beginners welcome' },
    touchConsent: NONE,
    contraindications: { ru: 'Беременность, давление, травмы спины и коленей: облегчённые варианты. Быстрое дыхание — с осторожностью.', en: 'Pregnancy, blood pressure, back or knee injuries: easier variants. Fast breathing with care.' },
    guestDoes: { ru: 'Выполняет за ведущим комплекс упражнений с дыханием, затем медитацию и отдых лёжа.', en: 'Follows the leader through a set of exercises with breathing, then meditation and rest lying down.' },
    description: { ru: 'Класс на полтора часа: настройка, комплекс упражнений, расслабление, медитация.', en: 'A ninety-minute class: tuning in, a set of exercises, relaxation, meditation.' },
    needs: { ru: 'Коврики, пледы, зал.', en: 'Mats, blankets, a room.' },
    notPromise: { ru: 'Это класс йоги. Изменить жизнь он не обещает.', en: 'This is a yoga class. It does not promise to change your life.' },
    source: CATALOG,
    added: ['groupSize', 'contraindications', 'guestDoes', 'needs', 'notPromise'],
  },
  {
    id: 'sadhana', format: 'group', groupMinutes: 150, pairMinutes: null, touch: false, load: 'medium',
    name: { ru: 'Утренняя садхана', en: 'Morning sadhana' },
    groupSize: { ru: 'любая', en: 'any' },
    touchConsent: NONE,
    contraindications: { ru: 'Травмы коленей: поза героя 22 минуты — сидя на стуле. Ранний подъём — по желанию.', en: 'Knee injuries: the 22-minute hero pose on a chair. The early start is optional.' },
    guestDoes: { ru: 'До завтрака читает или слушает утренние молитвы, делает комплекс йоги и поёт мантры 62 минуты.', en: 'Before breakfast reads or listens to morning prayers, does a yoga set and chants for 62 minutes.' },
    description: { ru: 'Утренний комплекс на два с половиной часа. Медитативная часть: 7 + 7 + 7 + 7 + 7 + 22 + 5 минут.', en: 'A two-and-a-half-hour morning routine. The meditative part: 7 + 7 + 7 + 7 + 7 + 22 + 5 minutes.' },
    needs: { ru: 'Зал с 5:30, коврики, пледы, записи мантр.', en: 'A room from 5:30, mats, blankets, mantra recordings.' },
    notPromise: { ru: 'Это практика дисциплины. Что она настроит чакры и разум, мы не утверждаем.', en: 'This is a discipline practice. We make no claim it tunes chakras or the mind.' },
    source: { ru: 'Каталог практик и мастер-документ ретритов из интейка курса, пересказ; традиция кундалини-йоги.', en: 'Practice catalogue and retreat master document from the course intake, retold; kundalini yoga tradition.' },
    added: ['groupSize', 'contraindications', 'needs', 'notPromise'],
  },
  {
    id: 'tunnel-walk', format: 'group', groupMinutes: 60, pairMinutes: null, touch: true, load: 'medium',
    name: { ru: 'Тоннель', en: 'The tunnel' },
    groupSize: { ru: 'от 12', en: '12 or more' },
    touchConsent: { ru: 'Перед практикой каждый говорит, можно ли его касаться. Кто сказал «нет», проходит тоннель без касаний. «Стоп» останавливает в любой момент.', en: 'Before the practice everyone says whether they may be touched. Those who say no walk through untouched. “Stop” ends it at any moment.' },
    contraindications: { ru: 'Травма, связанная с касанием, — гость может стоять в шеренге и не проходить сам.', en: 'Touch-related trauma: a guest may stand in the line and not walk through.' },
    guestDoes: { ru: 'Медленно идёт с закрытыми глазами между двумя шеренгами. Шеренги касаются его рук и плеч, если он согласился.', en: 'Walks slowly, eyes closed, between two lines. The lines touch their arms and shoulders if they agreed.' },
    description: { ru: 'Группа встаёт в две шеренги лицом друг к другу. Каждый по очереди проходит по проходу.', en: 'The group forms two lines facing each other. Everyone takes a turn walking down the passage.' },
    needs: { ru: 'Длинный зал, тихая музыка.', en: 'A long room, quiet music.' },
    notPromise: { ru: 'Это опыт заботы группы. Мы не обещаем, что он что-то исправит.', en: 'This is an experience of the group’s care. We do not promise it will fix anything.' },
    source: CATALOG,
    added: ['groupSize', 'touchConsent', 'contraindications', 'needs', 'notPromise'],
  },
  {
    id: 'intense-breathing', format: 'group', groupMinutes: 180, pairMinutes: null, touch: true, load: 'high',
    name: { ru: 'Интенсивное дыхание под музыку', en: 'Intense breathing to music' },
    groupSize: { ru: 'до 8 на одного ассистента', en: 'up to 8 per assistant' },
    touchConsent: { ru: 'Ассистент касается только с согласия, данного до сеанса, — например, кладёт руку на плечо. Гость может отказаться заранее или во время.', en: 'An assistant touches only with consent given before the session, such as a hand on the shoulder. A guest may refuse before or during.' },
    contraindications: { ru: 'Болезни сердца и сосудов, давление, эпилепсия, беременность, глаукома, отслоение сетчатки, остеопороз, недавние операции, психиатрический диагноз. Астма — ингалятор при себе. Скрининг до ретрита.', en: 'Heart and vascular conditions, blood pressure, epilepsy, pregnancy, glaucoma, retinal detachment, osteoporosis, recent surgery, a psychiatric diagnosis. Asthma: keep an inhaler at hand. Screening before the retreat.' },
    guestDoes: { ru: 'Лёжа начинает дышать чаще и глубже под громкую музыку, дальше дышит в своём ритме. В любой момент можно вернуться к обычному дыханию.', en: 'Lying down, starts breathing faster and deeper to loud music, then breathes at their own pace. They may return to normal breathing at any moment.' },
    description: { ru: 'Сеанс два–два с половиной часа, затем рисунок и круг интеграции. Возможны онемение, спазмы и паника, поэтому нужны ассистенты.', en: 'A session of two to two and a half hours, then drawing and an integration circle. Numbness, cramps and panic can occur, so it needs assistants.' },
    needs: { ru: 'Зал на весь сеанс, матрасы, пледы, вода, музыкальный сет от двух часов, ассистенты.', en: 'A room for the whole session, mattresses, blankets, water, a music set of two hours or more, assistants.' },
    notPromise: { ru: 'Практика даёт сильные телесные и эмоциональные состояния. Лечения она не заменяет.', en: 'The practice brings strong bodily and emotional states. It replaces no treatment.' },
    source: BLUEPRINT,
    added: ['touchConsent', 'contraindications', 'notPromise'],
  },
  {
    id: 'free-dance', format: 'group', groupMinutes: 90, pairMinutes: null, touch: false, load: 'medium',
    name: { ru: 'Свободный танец', en: 'Free dance' },
    groupSize: { ru: 'любая, новичкам можно', en: 'any, beginners welcome' },
    touchConsent: NONE,
    contraindications: { ru: 'Травмы ног и спины: танцевать сидя или медленно.', en: 'Leg or back injuries: dance seated or slowly.' },
    guestDoes: { ru: 'Двигается под музыку как хочет, без шагов и разговоров.', en: 'Moves to music however they like, without steps or talking.' },
    description: { ru: 'Полтора часа танца без правил: волна музыки от медленной к быстрой и обратно.', en: 'Ninety minutes of dance without rules: a wave of music from slow to fast and back.' },
    needs: { ru: 'Зал, звук, вода.', en: 'A room, sound, water.' },
    notPromise: { ru: 'Это танец. Других обещаний у него нет.', en: 'This is dance. It makes no other promises.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'contraindications', 'guestDoes', 'description', 'needs', 'notPromise'],
  },
  {
    id: 'evening-satsang', format: 'group', groupMinutes: 60, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Вечерний сатсанг', en: 'Evening satsang' },
    groupSize: { ru: 'вся группа', en: 'whole group' },
    touchConsent: NONE,
    contraindications: NO_TOUCH_CONTRA,
    guestDoes: { ru: 'Сидит в тишине, поёт вместе со всеми, слушает чтение и вопросы других.', en: 'Sits in silence, sings with everyone, listens to readings and others’ questions.' },
    description: { ru: 'Спокойное завершение дня: тишина, общее пение, чтение, вопросы ведущему.', en: 'A calm end to the day: silence, singing together, reading, questions to the leader.' },
    needs: { ru: 'Зал, свечи по правилам площадки.', en: 'A room, candles if the venue allows.' },
    notPromise: { ru: 'Это вечерняя встреча группы, а не обучение истине.', en: 'This is an evening gathering, not a teaching of truth.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'contraindications', 'needs', 'notPromise'],
  },
  {
    id: 'qigong', format: 'group', groupMinutes: 45, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Цигун на рассвете', en: 'Qigong at sunrise' },
    groupSize: { ru: 'любая', en: 'any' },
    touchConsent: NONE,
    contraindications: { ru: 'Особых нет. При травмах — амплитуда меньше.', en: 'None in particular. With injuries, smaller movements.' },
    guestDoes: { ru: 'Стоя повторяет за ведущим медленные движения с дыханием.', en: 'Standing, repeats slow movements with breathing after the leader.' },
    description: { ru: 'Медленная утренняя практика на открытом воздухе, если позволяет погода.', en: 'A slow morning practice outdoors if the weather allows.' },
    needs: { ru: 'Ровная площадка, удобная обувь.', en: 'Level ground, comfortable shoes.' },
    notPromise: { ru: 'Это мягкая разминка, а не лечебная гимнастика.', en: 'This is a gentle warm-up, not therapeutic exercise.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'contraindications', 'guestDoes', 'needs', 'notPromise'],
  },
  {
    id: 'yin-yoga', format: 'group', groupMinutes: 75, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Инь-йога', en: 'Yin yoga' },
    groupSize: { ru: 'любая', en: 'any' },
    touchConsent: NONE,
    contraindications: { ru: 'Гипермобильность суставов, беременность: без глубоких растяжек.', en: 'Hypermobile joints, pregnancy: no deep stretches.' },
    guestDoes: { ru: 'Держит спокойные позы на полу по три–пять минут с опорой на подушки.', en: 'Holds calm floor poses for three to five minutes, supported by cushions.' },
    description: { ru: 'Медленная практика перед ужином после активного дня.', en: 'A slow practice before dinner after an active day.' },
    needs: { ru: 'Коврики, болстеры, пледы.', en: 'Mats, bolsters, blankets.' },
    notPromise: { ru: 'Это отдых в позах. Других обещаний нет.', en: 'This is resting in poses. No other promises.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'contraindications', 'guestDoes', 'description', 'needs', 'notPromise'],
  },
  {
    id: 'partner-yoga', format: 'pair', groupMinutes: 75, pairMinutes: null, touch: true, load: 'medium',
    name: { ru: 'Йога в парах', en: 'Partner yoga' },
    groupSize: { ru: 'чётное число', en: 'an even number' },
    touchConsent: { ru: 'Пары складываются по согласию. Гость может делать позы один, с опорой на стену.', en: 'Pairs form by mutual consent. A guest may do the poses alone, using a wall.' },
    contraindications: { ru: 'Травмы спины и суставов: без поддержек весом партнёра.', en: 'Back or joint injuries: no supports that carry the partner’s weight.' },
    guestDoes: { ru: 'Выполняет позы вместе с партнёром, опираясь друг на друга руками и спиной.', en: 'Does poses with a partner, leaning on each other with hands and backs.' },
    description: { ru: 'Все пары работают одновременно, поэтому длительность на группу — как у класса.', en: 'All pairs work at once, so the group duration equals the class length.' },
    needs: { ru: 'Коврики парами.', en: 'Mats in pairs.' },
    notPromise: { ru: 'Это класс йоги вдвоём, а не терапия отношений.', en: 'This is yoga for two, not relationship therapy.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'touchConsent', 'contraindications', 'guestDoes', 'description', 'needs', 'notPromise'],
  },
  {
    id: 'cold-water', format: 'solo', groupMinutes: 15, pairMinutes: null, touch: false, load: 'medium',
    name: { ru: 'Холодный душ', en: 'Cold shower' },
    groupSize: { ru: 'каждый сам', en: 'on their own' },
    touchConsent: NONE,
    contraindications: { ru: 'Беременность, повышенное давление, болезни сердца, синдром Рейно, холодовая крапивница. Во время месячных — по самочувствию. Спросите врача.', en: 'Pregnancy, high blood pressure, heart conditions, Raynaud’s syndrome, cold urticaria. During a period — as you feel. Ask a doctor.' },
    guestDoes: { ru: 'Три раза чередует тёплую и холодную воду, затем растирается маслом.', en: 'Alternates warm and cold water three times, then rubs in oil.' },
    description: { ru: 'Короткая утренняя процедура по желанию, в своё время до завтрака.', en: 'A short optional morning routine, at one’s own time before breakfast.' },
    needs: { ru: 'Душ с холодной водой, масло, полотенце.', en: 'A shower with cold water, oil, a towel.' },
    notPromise: { ru: 'Холодная вода бодрит. Лечебного действия мы не обещаем.', en: 'Cold water wakes you up. We promise no therapeutic effect.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'description', 'needs', 'notPromise'],
  },
  {
    id: 'group-walk', format: 'group', groupMinutes: 90, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Прогулка с остановками', en: 'Walk with pauses' },
    groupSize: { ru: 'до 20 на ведущего', en: 'up to 20 per leader' },
    touchConsent: NONE,
    contraindications: { ru: 'Трудно ходить: короткий маршрут или остановки у дома.', en: 'Difficulty walking: a short route or pauses near the house.' },
    guestDoes: { ru: 'Идёт за ведущим молча и на остановках несколько минут смотрит и слушает.', en: 'Walks after the leader in silence and, at stops, looks and listens for a few minutes.' },
    description: { ru: 'Прогулка по окрестностям с семью короткими остановками внимания.', en: 'A walk around the area with seven short stops for attention.' },
    needs: { ru: 'Маршрут, проверенный заранее, вода, аптечка.', en: 'A route checked in advance, water, a first-aid kit.' },
    notPromise: { ru: 'Это прогулка, а не активация чакр.', en: 'This is a walk, not chakra activation.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'groupSize', 'contraindications', 'guestDoes', 'needs', 'notPromise'],
  },
  {
    id: 'seva', format: 'group', groupMinutes: 60, pairMinutes: null, touch: false, load: 'low',
    name: { ru: 'Сева — общая работа', en: 'Seva — shared work' },
    groupSize: { ru: 'группами по 4–6', en: 'groups of 4–6' },
    touchConsent: NONE,
    contraindications: { ru: 'Задачи по силам: тяжёлое не поднимать без желания.', en: 'Tasks within one’s strength: no heavy lifting unless wanted.' },
    guestDoes: { ru: 'Час помогает на кухне, в саду или с уборкой зала вместе с небольшой группой.', en: 'Spends an hour helping in the kitchen, garden or hall with a small group.' },
    description: { ru: 'Совместная работа по договорённости с площадкой. Задачи раздают заранее.', en: 'Shared work agreed with the venue. Tasks are handed out in advance.' },
    needs: { ru: 'Список задач от площадки, перчатки.', en: 'A task list from the venue, gloves.' },
    notPromise: { ru: 'Это помощь месту, а не работа вместо персонала площадки.', en: 'This is help for the place, not work in place of the venue’s staff.' },
    source: BLUEPRINT,
    added: ['groupMinutes', 'groupSize', 'contraindications', 'guestDoes', 'description', 'needs', 'notPromise'],
  },
]
