import { FAMILIES } from './families'
import type { Bi, ChannelId, EventClass, Format, RungId } from './types'

// Полный реестр 41 формата мероприятий на карте
export const FORMATS: Format[] = [
  {
    id: 'retreat',
    name: {
      ru: 'Ретрит / wellness / silent retreat',
      en: 'Retreat / wellness / silent retreat',
    },
    about: {
      ru: 'Несколько дней вместе в одном месте: практики, тишина или восстановление вдали от обычной жизни.',
      en: 'Several days together in one place: practice, silence or recovery away from everyday life.',
    },
    family: 'retreat',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'vipassana',
    name: {
      ru: 'Випассана',
      en: 'Vipassana',
    },
    about: {
      ru: 'Долгий ретрит молчаливой медитации по строгому распорядку.',
      en: 'A long retreat of silent meditation on a strict schedule.',
    },
    family: 'retreat',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'detox-tour',
    name: {
      ru: 'Детокс-тур',
      en: 'Detox tour',
    },
    about: {
      ru: 'Поездка, где группа вместе отказывается от привычного — еды, экранов, спешки.',
      en: 'A trip where a group gives up something habitual together — food, screens, rush.',
    },
    family: 'retreat',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'yoga-tour',
    name: {
      ru: 'Йога-тур',
      en: 'Yoga tour',
    },
    about: {
      ru: 'Путешествие небольшой группы с ежедневной практикой йоги.',
      en: 'A small group journey with daily yoga practice.',
    },
    family: 'retreat',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'field-course',
    name: {
      ru: 'Выездной обучающий курс',
      en: 'Residential training course',
    },
    about: {
      ru: 'Обучение с выездом: группа живёт вместе и учится несколько дней подряд.',
      en: 'Training on the road: the group lives together and studies for several days in a row.',
    },
    family: 'retreat',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'immersion',
    name: {
      ru: 'Погружение (immersion)',
      en: 'Immersion',
    },
    about: {
      ru: 'Глубокое погружение в одну тему или практику без отвлечений.',
      en: 'A deep dive into one theme or practice without distractions.',
    },
    family: 'retreat',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'individual',
    name: {
      ru: 'Индивидуальные сессии',
      en: 'One-to-one sessions',
    },
    about: {
      ru: 'Работа с одним человеком: встреча за встречей, под его вопрос.',
      en: 'Work with one person: session after session, around their question.',
    },
    family: 'one-to-one',
    cells: [
      { rung: 'one', channel: 'offline', eventClass: 'regular' },
      { rung: 'one', channel: 'online', eventClass: 'regular' },
    ],
  },
  {
    id: 'meeting',
    name: {
      ru: 'Встреча',
      en: 'Meetup',
    },
    about: {
      ru: 'Одна встреча людей с общим интересом: разговор, практика или знакомство.',
      en: 'A single gathering of people with a shared interest: a conversation, a practice or an introduction.',
    },
    family: 'table',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'breakfasts',
    name: {
      ru: 'Завтраки',
      en: 'Breakfasts',
    },
    about: {
      ru: 'Регулярный завтрак, на который приходят поговорить и увидеть своих.',
      en: 'A regular breakfast where people come to talk and see their own.',
    },
    family: 'table',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'regular' }],
  },
  {
    id: 'salon',
    name: {
      ru: 'Салон',
      en: 'Salon',
    },
    about: {
      ru: 'Вечер у хозяина: тема, разговор, иногда выступление гостя.',
      en: 'An evening at the host’s place: a theme, a conversation, sometimes a guest speaker.',
    },
    family: 'table',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'regular' }],
  },
  {
    id: 'birds-of-a-feather',
    name: {
      ru: 'Ужин по интересам (birds of a feather)',
      en: 'Birds of a feather dinner',
    },
    about: {
      ru: 'Ужин, куда зовут людей с одним интересом, чтобы они нашли друг друга.',
      en: 'A dinner for people with one shared interest, so they can find each other.',
    },
    family: 'table',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'dinner-en-blanc',
    name: {
      ru: 'Белый ужин',
      en: 'White dinner',
    },
    about: {
      ru: 'Большой ужин под открытым небом, где все в белом, а место держат в секрете до последнего часа.',
      en: 'A large open-air dinner where everyone wears white and the place is kept secret until the last hour.',
    },
    family: 'table',
    cells: [{ rung: 'large', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'analog-sundays',
    name: {
      ru: 'Аналоговые воскресенья',
      en: 'Analog Sundays',
    },
    about: {
      ru: 'Воскресенье без экранов: игры, книги, прогулки, живой разговор.',
      en: 'A Sunday without screens: games, books, walks, live conversation.',
    },
    family: 'table',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'regular' }],
  },
  {
    id: 'cinema-spirituality',
    name: {
      ru: 'Кино и духовность',
      en: 'Cinema and spirituality',
    },
    about: {
      ru: 'Показ фильма и разговор о том, что он задел.',
      en: 'A film screening followed by a conversation about what it touched.',
    },
    family: 'table',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'regular' }],
  },
  {
    id: 'weekly-practice-groups',
    name: {
      ru: 'Еженедельные группы практики',
      en: 'Weekly practice groups',
    },
    about: {
      ru: 'Одна и та же группа раз в неделю практикует вместе онлайн.',
      en: 'The same group practises together online once a week.',
    },
    family: 'regular-group',
    cells: [{ rung: 'small', channel: 'online', eventClass: 'regular' }],
  },
  {
    id: 'monthly-pop-up',
    name: {
      ru: 'Ежемесячные pop-up занятия',
      en: 'Monthly pop-up classes',
    },
    about: {
      ru: 'Раз в месяц занятие в новом месте для всех, кто придёт.',
      en: 'Once a month a class in a new place, open to whoever comes.',
    },
    family: 'regular-group',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'regular' }],
  },
  {
    id: 'groups',
    name: {
      ru: 'Группы',
      en: 'Groups',
    },
    about: {
      ru: 'Постоянная малая группа, которая встречается по расписанию.',
      en: 'A standing small group that meets on a schedule.',
    },
    family: 'regular-group',
    cells: [
      { rung: 'small', channel: 'offline', eventClass: 'regular' },
      { rung: 'small', channel: 'online', eventClass: 'regular' },
    ],
  },
  {
    id: 'detox-groups',
    name: {
      ru: 'Детокс-группы',
      en: 'Detox groups',
    },
    about: {
      ru: 'Группа, которая несколько недель вместе меняет одну привычку.',
      en: 'A group that changes one habit together over several weeks.',
    },
    family: 'regular-group',
    cells: [{ rung: 'small', channel: 'online', eventClass: 'cycle' }],
  },
  {
    id: 'book-club',
    name: {
      ru: 'Книжный клуб',
      en: 'Book club',
    },
    about: {
      ru: 'Читают одну книгу и встречаются её обсудить.',
      en: 'People read one book and meet to discuss it.',
    },
    family: 'regular-group',
    cells: [
      { rung: 'small', channel: 'hybrid', eventClass: 'regular' },
      { rung: 'small', channel: 'online', eventClass: 'regular' },
    ],
  },
  {
    id: 'masterclass',
    name: {
      ru: 'Мастер-класс',
      en: 'Masterclass',
    },
    about: {
      ru: 'Короткое занятие, где ведущий показывает один навык и все пробуют.',
      en: 'A short session where the leader shows one skill and everyone tries it.',
    },
    family: 'learning',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'training',
    name: {
      ru: 'Тренинг',
      en: 'Training',
    },
    about: {
      ru: 'Один-два дня отработки навыка в группе, с упражнениями.',
      en: 'One or two days of practising a skill in a group, with exercises.',
    },
    family: 'learning',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'seminar',
    name: {
      ru: 'Семинар',
      en: 'Seminar',
    },
    about: {
      ru: 'Встреча, где ведущий раскрывает тему, а группа обсуждает.',
      en: 'A session where the leader unfolds a theme and the group discusses it.',
    },
    family: 'learning',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'courses',
    name: {
      ru: 'Курсы',
      en: 'Courses',
    },
    about: {
      ru: 'Серия занятий по программе с началом и концом.',
      en: 'A series of classes on a programme with a start and an end.',
    },
    family: 'learning',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'cycle' }],
  },
  {
    id: 'apprenticeships',
    name: {
      ru: 'Ученичество',
      en: 'Apprenticeships',
    },
    about: {
      ru: 'Ученик работает рядом с мастером и учится на деле.',
      en: 'An apprentice works beside a master and learns by doing.',
    },
    family: 'learning',
    cells: [{ rung: 'few', channel: 'offline', eventClass: 'cycle' }],
  },
  {
    id: 'bootcamp',
    name: {
      ru: 'Буткемп',
      en: 'Bootcamp',
    },
    about: {
      ru: 'Плотная учёба за короткий срок: каждый день и с полной нагрузкой.',
      en: 'Dense learning in a short time: every day and at full load.',
    },
    family: 'learning',
    cells: [{ rung: 'medium', channel: 'offline', eventClass: 'cycle' }],
  },
  {
    id: 'online-course',
    name: {
      ru: 'Онлайн-курс',
      en: 'Online course',
    },
    about: {
      ru: 'Записанные уроки и задания, которые проходят в своём темпе.',
      en: 'Recorded lessons and assignments, taken at your own pace.',
    },
    family: 'learning',
    cells: [{ rung: 'many', channel: 'online', eventClass: 'cycle' }],
  },
  {
    id: 'audio-course',
    name: {
      ru: 'Аудио-курс',
      en: 'Audio course',
    },
    about: {
      ru: 'Курс, который слушают: в дороге, на прогулке, перед сном.',
      en: 'A course you listen to: on the road, on a walk, before sleep.',
    },
    family: 'learning',
    cells: [{ rung: 'many', channel: 'online', eventClass: 'cycle' }],
  },
  {
    id: 'live-practicum',
    name: {
      ru: 'Live-практикум',
      en: 'Live practicum',
    },
    about: {
      ru: 'Практикум с живыми встречами — часть в зале, часть онлайн.',
      en: 'A practicum with live sessions — part in the room, part online.',
    },
    family: 'learning',
    cells: [{ rung: 'medium', channel: 'hybrid', eventClass: 'cycle' }],
  },
  {
    id: 'marathon',
    name: {
      ru: 'Марафон',
      en: 'Marathon',
    },
    about: {
      ru: 'Большая группа несколько недель каждый день делает одно задание.',
      en: 'A large group does one task every day for several weeks.',
    },
    family: 'online-intensive',
    cells: [{ rung: 'large', channel: 'online', eventClass: 'cycle' }],
  },
  {
    id: 'growth-lab',
    name: {
      ru: 'Лаборатория / мастерская роста',
      en: 'Personal growth lab',
    },
    about: {
      ru: 'Малая группа разбирает свои задачи и пробует новое от встречи к встрече.',
      en: 'A small group works on its own questions and tries new things from meeting to meeting.',
    },
    family: 'online-intensive',
    cells: [{ rung: 'small', channel: 'online', eventClass: 'cycle' }],
  },
  {
    id: 'virtual-retreat',
    name: {
      ru: 'Виртуальный ретрит',
      en: 'Virtual retreat',
    },
    about: {
      ru: 'Ретрит на расстоянии: общий распорядок дня, практики и тишина у себя дома.',
      en: 'A retreat at a distance: a shared daily rhythm, practice and silence at home.',
    },
    family: 'online-intensive',
    cells: [{ rung: 'large', channel: 'online', eventClass: 'one-off' }],
  },
  {
    id: 'community-detox',
    name: {
      ru: 'Детокс всем сообществом',
      en: 'Community detox',
    },
    about: {
      ru: 'Всё сообщество разом на время отказывается от одной привычки и поддерживает друг друга.',
      en: 'A whole community gives up one habit for a while and supports each other.',
    },
    family: 'online-intensive',
    cells: [{ rung: 'large', channel: 'online', eventClass: 'cycle' }],
  },
  {
    id: 'angelic-therapy-lab',
    name: {
      ru: 'Ангельско-терапевтическая лаборатория',
      en: 'Angelic therapy lab',
    },
    about: {
      ru: 'Небольшая группа с авторской духовной практикой — встречи и в зале, и онлайн.',
      en: 'A small group with the leader’s own spiritual practice — meetings both in the room and online.',
    },
    family: 'online-intensive',
    cells: [{ rung: 'small', channel: 'hybrid', eventClass: 'cycle' }],
  },
  {
    id: 'author-tour',
    name: {
      ru: 'Авторский тур / экспедиция',
      en: 'Signature tour / expedition',
    },
    about: {
      ru: 'Путешествие по маршруту, который собрал сам ведущий, со смыслом для группы.',
      en: 'A journey along a route the leader built, with meaning for the group.',
    },
    family: 'tour',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'weekend-tour',
    name: {
      ru: 'Тур выходного дня',
      en: 'Weekend tour',
    },
    about: {
      ru: 'Короткая поездка группы на выходные.',
      en: 'A short group trip for a weekend.',
    },
    family: 'tour',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'plein-air',
    name: {
      ru: 'Творческий пленэр',
      en: 'Creative plein air',
    },
    about: {
      ru: 'Выезд на природу или в город, чтобы рисовать, писать или снимать вместе.',
      en: 'A trip to nature or a town to draw, write or shoot together.',
    },
    family: 'tour',
    cells: [{ rung: 'small', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'festival-camp',
    name: {
      ru: 'Фестиваль-кэмп',
      en: 'Festival camp',
    },
    about: {
      ru: 'Несколько дней палаточного фестиваля: много площадок, ведущих и гостей.',
      en: 'A multi-day camping festival: many stages, leaders and guests.',
    },
    family: 'big-event',
    cells: [{ rung: 'large', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'camp',
    name: {
      ru: 'Лагерь',
      en: 'Camp',
    },
    about: {
      ru: 'Лагерь на несколько дней или недель с общим распорядком.',
      en: 'A camp for several days or weeks with a shared routine.',
    },
    family: 'big-event',
    cells: [{ rung: 'large', channel: 'offline', eventClass: 'one-off' }],
  },
  {
    id: 'online-conference',
    name: {
      ru: 'Онлайн-конференция',
      en: 'Online conference',
    },
    about: {
      ru: 'День или несколько дней выступлений онлайн для широкой аудитории.',
      en: 'One or several days of online talks for a wide audience.',
    },
    family: 'big-event',
    cells: [{ rung: 'many', channel: 'online', eventClass: 'one-off' }],
  },
  {
    id: 'chat-club',
    name: {
      ru: 'Чат-клуб',
      en: 'Chat club',
    },
    about: {
      ru: 'Постоянный чат, где сообщество общается, а ведущий задаёт тон и темы.',
      en: 'A standing chat where the community talks and the leader sets the tone and topics.',
    },
    family: 'club',
    cells: [{ rung: 'large', channel: 'online', eventClass: 'regular' }],
  },
  {
    id: 'online-culture-house',
    name: {
      ru: 'Онлайн-дом культуры',
      en: 'Online house of culture',
    },
    about: {
      ru: 'Онлайн-клуб с расписанием кружков, встреч и событий для многих людей.',
      en: 'An online club with a schedule of circles, meetings and events for many people.',
    },
    family: 'club',
    cells: [{ rung: 'many', channel: 'online', eventClass: 'regular' }],
  },
]

// Фильтрация форматов по ступени, каналу и классу события
export function formatsIn(
  rung: RungId,
  channel: ChannelId,
  eventClass: EventClass | null
): Format[] {
  return FORMATS.filter((format) =>
    format.cells.some(
      (cell) =>
        cell.rung === rung &&
        cell.channel === channel &&
        (eventClass === null || cell.eventClass === eventClass)
    )
  )
}

// Получение ссылки на курс семейства, к которому относится формат
export function courseOf(f: Format): Bi | null {
  const family = FAMILIES.find((item) => item.id === f.family)
  return family ? family.course : null
}
