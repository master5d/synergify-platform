import type { Rung } from './types'

// Ступени масштаба группы в порядке возрастания: законы ступени и признаки «пора выше» / «рано»
export const RUNGS: Rung[] = [
  {
    id: 'one',
    label: { ru: 'Один на один', en: 'One to one' },
    size: { ru: '1 человек', en: '1 person' },
    laws: {
      attention: { ru: 'Всё внимание — одному человеку.', en: 'All the attention goes to one person.' },
      pricePerHead: { ru: 'Самая высокая за человека, но людей мало.', en: 'The highest per person, but there are few people.' },
      team: { ru: 'Не нужна.', en: 'Not needed.' },
      voice: {
        ru: 'Звучит в каждой фразе — и человек слышит его отдельно для себя.',
        en: 'It sounds in every sentence — and the person hears it just for themselves.',
      },
      gives: {
        ru: 'Здесь проверяют свой подход на живом человеке и учатся слышать.',
        en: 'Here you test your approach on a live person and learn to listen.',
      },
    },
    upSignals: [
      { ru: 'К тебе возвращаются и приводят знакомых.', en: 'People come back to you and bring friends.' },
      { ru: 'Одни и те же вопросы повторяются от человека к человеку.', en: 'The same questions repeat from person to person.' },
      { ru: 'Свободных часов в неделе почти не осталось.', en: 'There are almost no free hours left in your week.' },
    ],
    earlySignals: [
      { ru: 'Ты ещё не можешь объяснить свой подход за пять минут.', en: 'You cannot yet explain your approach in five minutes.' },
      {
        ru: 'После каждой встречи остаётся «я не знаю, что с этим делать».',
        en: 'After each session you are left with “I don’t know what to do with this”.',
      },
    ],
  },
  {
    id: 'few',
    label: { ru: 'Один на нескольких', en: 'One to a few' },
    size: { ru: '2–7 человек', en: '2–7 people' },
    laws: {
      attention: { ru: 'Почти личное: каждого видно и слышно.', en: 'Almost personal: everyone is seen and heard.' },
      pricePerHead: { ru: 'Ниже, чем один на один.', en: 'Lower than one to one.' },
      team: { ru: 'Не нужна; роли можно менять по кругу.', en: 'Not needed; roles can rotate.' },
      voice: { ru: 'Делит место с голосами участников.', en: 'It shares the room with the participants’ voices.' },
      gives: {
        ru: 'Здесь учатся держать рамку и видеть, что люди дают друг другу.',
        en: 'Here you learn to hold the frame and to see what people give each other.',
      },
    },
    upSignals: [
      { ru: 'Встречи идут, даже если тебя на одной нет.', en: 'Meetings go on even when you miss one.' },
      { ru: 'Новые люди просятся в группу.', en: 'New people ask to join.' },
    ],
    earlySignals: [
      { ru: 'Каждая встреча держится только на тебе.', en: 'Every meeting rests on you alone.' },
      { ru: 'Люди приходят один раз и не возвращаются.', en: 'People come once and do not return.' },
    ],
  },
  {
    id: 'small',
    label: { ru: 'Малая группа', en: 'Small group' },
    size: { ru: '8–15 человек', en: '8–15 people' },
    laws: {
      attention: { ru: 'Каждому — несколько минут за встречу.', en: 'Each person gets a few minutes per meeting.' },
      pricePerHead: { ru: 'Умеренная; группа делит расходы.', en: 'Moderate; the group shares the costs.' },
      team: { ru: 'Иногда помощник: запись, площадка, напоминания.', en: 'Sometimes a helper: sign-ups, the venue, reminders.' },
      voice: { ru: 'Ведёт, но группа уже звучит сама.', en: 'It leads, but the group already speaks on its own.' },
      gives: {
        ru: 'Здесь рождается сообщество — люди знают друг друга по именам.',
        en: 'This is where a community is born — people know each other by name.',
      },
    },
    upSignals: [
      { ru: 'Места заканчиваются раньше даты.', en: 'Places run out before the date.' },
      { ru: 'Участники зовут на что-то длиннее — выезд, курс.', en: 'Participants ask for something longer — a trip, a course.' },
    ],
    earlySignals: [
      { ru: 'Половину встречи уходит на организацию.', en: 'Half of each meeting goes into logistics.' },
      { ru: 'Ты не знаешь, зачем люди приходят.', en: 'You do not know why people come.' },
    ],
  },
  {
    id: 'medium',
    label: { ru: 'Средняя группа', en: 'Medium group' },
    size: { ru: '16–30 человек', en: '16–30 people' },
    laws: {
      attention: {
        ru: 'Личного внимания мало; его заменяют программа и малые группы внутри.',
        en: 'There is little personal attention; the programme and small groups inside replace it.',
      },
      pricePerHead: { ru: 'Ниже за человека, но выше общий бюджет и риск.', en: 'Lower per person, but the total budget and risk are higher.' },
      team: { ru: 'Нужна: площадка, помощник, иногда соведущий.', en: 'Needed: a venue, a helper, sometimes a co-leader.' },
      voice: {
        ru: 'Звучит как программа: важно не только что ты говоришь, но и как устроены дни.',
        en: 'It sounds as a programme: what matters is not only what you say but how the days are built.',
      },
      gives: {
        ru: 'Здесь проверяют, держится ли подход без личного контакта с каждым.',
        en: 'Here you test whether the approach holds without personal contact with everyone.',
      },
    },
    upSignals: [
      { ru: 'Группа собирается без рекламы, своими людьми.', en: 'The group fills up without ads, from your own people.' },
      { ru: 'Есть команда, которой можно отдать часть работы.', en: 'There is a team you can hand part of the work to.' },
    ],
    earlySignals: [
      { ru: 'Касса закрывается только скидками.', en: 'The till closes only with discounts.' },
      { ru: 'Ты один отвечаешь за всё — от трансфера до практик.', en: 'You alone answer for everything — from transfers to practices.' },
    ],
  },
  {
    id: 'large',
    label: { ru: 'Большая группа', en: 'Large group' },
    size: { ru: '31–150 человек', en: '31–150 people' },
    laws: {
      attention: {
        ru: 'Личного внимания почти нет; внимание дают структура и помощники.',
        en: 'There is almost no personal attention; structure and helpers provide it.',
      },
      pricePerHead: { ru: 'Низкая за человека; выручка держится на числе людей.', en: 'Low per person; income rests on the number of people.' },
      team: { ru: 'Обязательна: модераторы, техника, поддержка участников.', en: 'Required: moderators, tech, participant support.' },
      voice: { ru: 'Звучит как голос сообщества — его повторяют другие.', en: 'It sounds as the voice of a community — others repeat it.' },
      gives: {
        ru: 'Здесь подход становится движением, которое живёт без тебя в комнате.',
        en: 'Here the approach becomes a movement that lives without you in the room.',
      },
    },
    upSignals: [
      { ru: 'Участники сами ведут малые группы внутри.', en: 'Participants lead small groups inside on their own.' },
      { ru: 'Запросов больше, чем мест.', en: 'There are more requests than places.' },
    ],
    earlySignals: [
      { ru: 'Команда держится на твоём личном контроле.', en: 'The team holds only through your personal control.' },
      { ru: 'Люди теряются и уходят на середине.', en: 'People get lost and leave halfway.' },
    ],
  },
  {
    id: 'many',
    label: { ru: 'Один на многих', en: 'One to many' },
    size: { ru: 'больше 150 человек', en: 'over 150 people' },
    laws: {
      attention: {
        ru: 'Личного внимания нет — только материал, ритм и сообщество.',
        en: 'There is no personal attention — only the material, the rhythm and the community.',
      },
      pricePerHead: { ru: 'Самая низкая за человека или вход свободный.', en: 'The lowest per person, or free entry.' },
      team: { ru: 'Нужна система: команда, расписание, правила.', en: 'A system is needed: a team, a schedule, rules.' },
      voice: { ru: 'Звучит в записи и в чужих пересказах.', en: 'It sounds in recordings and in other people’s retellings.' },
      gives: { ru: 'Охват: подход встречает людей, которых ты никогда не увидишь.', en: 'Reach: the approach meets people you will never see.' },
    },
    upSignals: [
      { ru: 'Сообщество растёт и без твоих публикаций.', en: 'The community grows even without your posts.' },
      {
        ru: 'Люди из охвата приходят на нижние ступени — к тебе лично.',
        en: 'People from your reach come to the lower steps — to you personally.',
      },
    ],
    earlySignals: [
      { ru: 'Ты ещё не проверил подход на живых людях лично.', en: 'You have not yet tested the approach on live people in person.' },
      { ru: 'Без тебя всё останавливается.', en: 'Everything stops without you.' },
    ],
  },
]
