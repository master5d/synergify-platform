import type { Fit, Mark, RegionGuide } from '../types'

const fit = (mark: Mark, ru: string, en: string): Fit => ({ mark, why: { ru, en } })

// Гайд-вайбчек Маунт-Шасты. Факты — по источникам ниже (обращение 2026-10-19); нарратив помечен как нарратив;
// сакральные истории народов не пересказываются. Площадки — сайт открыт и принимает внешние группы на дату проверки.
export const SHASTA: RegionGuide = {
  slug: 'shasta',
  name: { ru: 'Маунт-Шаста', en: 'Mount Shasta' },
  placeType: 'sacred-mountains',
  character: {
    ru: 'Одинокий стратовулкан на южном конце Каскадных гор в северной Калифорнии: 4 322 метра, ледники, гора поднимается почти '
      + 'на три километра над округой и видна отовсюду. У подножия — маленький городок у истоков реки Сакраменто и старые мельничные '
      + 'посёлки среди хвойного леса. Ритм медленный: лес, озёра, водопады, горный воздух.',
    en: 'A solitary stratovolcano at the southern end of the Cascades in Northern California: 14,179 feet, glaciers, the mountain rises '
      + 'almost three kilometres above the land around it and is seen from everywhere. At its foot is a small town at the headwaters of '
      + 'the Sacramento River and old mill villages in the pine forest. The rhythm is slow: forest, lakes, waterfalls, mountain air.',
  },
  whoGoes: {
    ru: 'Лесная служба описывает публику горы так: одни едут ради восхождения, другие — духовные искатели, третьи — ради лугов и видов. '
      + 'Рядом — альпинисты и лыжники, семьи и пенсионеры на природе, а в городке — метафизические книжные, центры йоги и звука '
      + 'и буддийский монастырь с ретритами для мирян.',
    en: 'The Forest Service describes the mountain\'s visitors this way: some come to climb, some are spiritual seekers, some come for the '
      + 'meadows and the views. Around them are climbers and skiers, families and retirees in the outdoors, and in town there are metaphysical '
      + 'bookshops, yoga and sound centres and a Buddhist monastery with retreats for lay people.',
  },
  narrative: [
    {
      ru: 'Рассказывают, что внутри горы скрыт город лемурийцев — потомков затонувшего континента. История идёт от романа конца XIX века '
        + 'и книг 1930-х годов.',
      en: 'People say a city of Lemurians — descendants of a sunken continent — is hidden inside the mountain. The story goes back to a novel '
        + 'from the end of the 19th century and books from the 1930s.',
    },
    {
      ru: 'С 1930-х годов гору связывают с «Вознесёнными Владыками»: у её подножия до сих пор проходит ежегодное представление одного '
        + 'из духовных движений.',
      en: 'Since the 1930s the mountain has been linked with the "Ascended Masters": one spiritual movement still holds a yearly pageant '
        + 'at its foot.',
    },
    {
      ru: 'Линзовидные облака над вершиной называют маскировкой кораблей, гору — «одной из самых духовных в мире», кристаллы — '
        + '«программированными» на исцеление.',
      en: 'The lens-shaped clouds over the summit are called a disguise for ships, the mountain "one of the most spiritual in the world", '
        + 'crystals "programmed" for healing.',
    },
  ],
  culture: {
    lands: {
      ru: 'Гору считают священной народы пит-ривер, карук, шаста, винту и соседние народы, в том числе кламат и модок; они и сейчас '
        + 'проводят здесь обряды, и эти практики остаются закрытыми. Луг Пантер-Медоус и склоны выше 2 400 метров признаны культурным '
        + 'районом коренных народов. Истории о лемурийцах и владыках — не их истории.',
      en: 'The Pit River, Karuk, Shasta, Wintu and neighbouring peoples, including the Klamath and Modoc, hold the mountain sacred; they '
        + 'still hold ceremonies here, and those practices stay private. Panther Meadow and the slopes above 8,000 feet are recognised as a '
        + 'Native American cultural district. The stories of Lemurians and masters are not their stories.',
    },
    asks: {
      ru: 'Представитель народа пит-ривер говорит: на гору ничего не приносят и ничего с неё не уносят, приходят только с целью; кристаллам '
        + 'и подношениям в камнях и в источнике там не место. Священный источник на лугу Пантер-Медоус страдает от купаний и праха — '
        + 'луг восстанавливали народы вместе с лесной службой, к нему просят относиться бережно.',
      en: 'A representative of the Pit River people says: nothing is brought onto the mountain and nothing is taken from it, people come '
        + 'only with a purpose; crystals and offerings in the rocks and the spring do not belong there. The sacred spring at Panther Meadow '
        + 'is harmed by bathing and ashes — the tribes restored the meadow together with the Forest Service and ask for great care.',
    },
    links: [
      { title: 'Karuk Tribe', url: 'https://www.karuk.us/', accessed: '2026-10-19' },
      { title: 'Redding Rancheria', url: 'https://www.reddingrancheria-nsn.gov/', accessed: '2026-10-19' },
      { title: 'Shasta Indian Nation', url: 'https://shastaindiannation.org/', accessed: '2026-10-19' },
      { title: 'The Klamath Tribes', url: 'https://klamathtribes.org/', accessed: '2026-10-19' },
      {
        title: 'News from Native California — the Rainbow Tribe and Mount Shasta (2015)',
        url: 'https://newsfromnativecalifornia.com/out-of-the-woodwork-the-rainbow-tribe-and-mount-shasta/',
        accessed: '2026-10-19',
      },
    ],
  },
  themes: {
    silence: fit('match', 'Гора, лес и маленький городок держат тишину сами.', 'The mountain, the forest and the small town hold silence by themselves.'),
    body: fit('neutral', 'Йогу можно вести, но место её не усиливает и не мешает.', 'You can lead yoga here; the place neither amplifies it nor gets in the way.'),
    breath: fit('neutral', 'Для дыхания и работы с телом место ничего особого не добавляет.', 'For breath and bodywork the place adds nothing in particular.'),
    creative: fit('neutral', 'Виды вдохновляют, но творческой среды, как в городах искусства, здесь нет.', 'The views inspire, but there is no arts scene as in art towns.'),
    nature: fit('match', 'Озёра, водопады, луга и тропы вокруг горы.', 'Lakes, waterfalls, meadows and trails around the mountain.'),
    ritual: fit('clash', 'Гора священна для местных народов; чужие обряды на ней их задевают.', 'The mountain is sacred to local peoples; outside ceremonies on it hurt them.'),
    burnout: fit('match', 'Медленный ритм, лес и горный воздух снимают городскую спешку.', 'The slow rhythm, forest and mountain air take away city haste.'),
    couples: fit('neutral', 'Для пар место спокойное, но ничем особым не помогает.', 'A calm place for couples, but it does not help in any special way.'),
    leadership: fit(
      'neutral',
      'Корпоративным программам подходят курорт и отели, но смысл места не про это.',
      'A resort and hotels suit corporate programmes, but that is not what the place is about.',
    ),
    transition: fit(
      'match',
      'Гора видна отовсюду и служит образом перехода, ради которого едут.',
      'The mountain is visible from everywhere and serves as an image of the transition people come for.',
    ),
  },
  audiences: {
    beginners: fit(
      'neutral',
      'Тихо и понятно, но эзотерический фон городка новичка может смутить.',
      'Quiet and clear, but the esoteric backdrop of the town may confuse a newcomer.',
    ),
    practitioners: fit(
      'match',
      'Здесь давно живут практики: монастырь, центры, тишина для долгих сидений.',
      'Practice has long lived here: a monastery, centres, silence for long sittings.',
    ),
    burnedOut: fit('match', 'Мало людей, много леса и неба.', 'Few people, plenty of forest and sky.'),
    founders: fit('neutral', 'Есть курорт и залы, но публика места — не деловая.', 'There is a resort and halls, but the crowd here is not a business one.'),
    teams: fit('neutral', 'Отели принимают группы, но смысл места команде ничего не добавляет.', 'Hotels take groups, but the meaning of the place adds nothing for a team.'),
    couples: fit('neutral', 'Спокойно, но без особой романтики.', 'Calm, but without special romance.'),
    womensCircle: fit('neutral', 'Место не помогает и не мешает такому кругу.', 'The place neither helps nor gets in the way of such a circle.'),
    mensCircle: fit('match', 'Горы, тропы и простор подходят мужским программам на природе.', 'Mountains, trails and space suit men\'s programmes in nature.'),
    creatives: fit('neutral', 'Виды есть, творческой среды нет.', 'There are views, there is no creative scene.'),
    seekers: fit('match', 'Одна из самых известных духовных гор мира — этих людей сюда и тянет.', 'One of the best-known spiritual mountains in the world — this is who it draws.'),
  },
  verdict: {
    yes: {
      ru: 'Ретритам тишины, медитации и личной перемены для опытных практикующих и выгоревших горожан: место само держит тишину.',
      en: 'Retreats of silence, meditation and personal change for experienced practitioners and burned-out city dwellers: the place holds '
        + 'silence by itself.',
    },
    no: {
      ru: 'Программам с обрядами «на священной горе», шумным форматам и тем, кому нужен город и сцена.',
      en: 'Programmes with ceremonies "on the sacred mountain", loud formats and those who need a city and a scene.',
    },
  },
  venues: [
    {
      name: 'McCloud Hotel',
      kind: 'lodge',
      about: {
        ru: 'Отреставрированный отель 1916 года в старом мельничном посёлке; принимает ретриты и встречи, можно занять весь отель.',
        en: 'A restored 1916 hotel in an old mill village; hosts retreats and gatherings, the whole hotel can be booked.',
      },
      themes: ['silence', 'creative', 'burnout'],
      audiences: ['burnedOut', 'teams', 'creatives'],
      url: 'https://mccloudhotel.com/gatherings/',
      checked: '2026-10-19',
    },
    {
      name: 'McCloud Mercantile Hotel',
      kind: 'lodge',
      about: {
        ru: 'Небольшой отель в здании 1897 года на двенадцать номеров; для ретритов есть общий зал.',
        en: 'A small twelve-room hotel in an 1897 building; there is a great room for retreats.',
      },
      themes: ['creative', 'burnout'],
      audiences: ['burnedOut', 'creatives', 'couples'],
      url: 'https://www.mccloudmercantile.com/groups-events',
      checked: '2026-10-19',
    },
    {
      name: 'Mount Shasta Resort',
      kind: 'lodge',
      about: {
        ru: 'Курорт у подножия горы с залами; принимает ретриты и корпоративные события.',
        en: 'A resort at the foot of the mountain with event halls; hosts retreats and corporate events.',
      },
      themes: ['leadership', 'burnout'],
      audiences: ['founders', 'teams'],
      url: 'https://www.mountshastaresort.com/events-at-mount-shasta-resort/',
      checked: '2026-10-19',
    },
    {
      name: 'Shasta View Lodge',
      kind: 'lodge',
      about: {
        ru: 'Девять хижин с видом на гору; лодж сдают целиком под ретриты и встречи.',
        en: 'Nine cabins with a view of the mountain; the lodge is rented out whole for retreats and meetings.',
      },
      themes: ['silence', 'nature', 'burnout'],
      audiences: ['practitioners', 'burnedOut', 'mensCircle'],
      url: 'https://www.shastaviewlodge.com/retreats',
      checked: '2026-10-19',
    },
  ],
  sources: [
    { title: 'Wikipedia — Mount Shasta', url: 'https://en.wikipedia.org/wiki/Mount_Shasta', accessed: '2026-10-19' },
    { title: 'Wikipedia — Legends of Mount Shasta', url: 'https://en.wikipedia.org/wiki/Legends_of_Mount_Shasta', accessed: '2026-10-19' },
    {
      title: 'USDA Forest Service — Mt. Shasta Wilderness',
      url: 'https://www.fs.usda.gov/r05/shasta-trinity/recreation/mt-shasta-wilderness',
      accessed: '2026-10-19',
    },
    {
      title: 'Advisory Council on Historic Preservation — Mount Shasta case',
      url: 'https://www.achp.gov/sites/default/files/2018-07/Mount%20Shasta.pdf',
      accessed: '2026-10-19',
    },
    { title: 'Visit Mt. Shasta', url: 'https://www.visitmtshasta.com/', accessed: '2026-10-19' },
  ],
}
