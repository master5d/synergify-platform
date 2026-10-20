import type { Fit, Mark, RegionGuide } from '../types'

const fit = (mark: Mark, ru: string, en: string): Fit => ({ mark, why: { ru, en } })

// Гайд-вайбчек Седоны. Факты — по источникам ниже (обращение 2026-10-19); нарратив помечен как нарратив;
// сакральные истории народов не пересказываются. Площадки — сайт открыт и принимает внешние группы на дату проверки.
export const SEDONA: RegionGuide = {
  slug: 'sedona',
  name: { ru: 'Седона', en: 'Sedona' },
  placeType: 'deserts',
  character: {
    ru: 'Городок в Аризоне среди красных песчаниковых скал, которые на рассвете и закате светятся розовым, в окружении национального '
      + 'леса с каньонами, столовыми горами и ручьём Ок-Крик. Около десяти тысяч жителей и около трёх миллионов гостей в год: место '
      + 'красивое и людное, с сильной культурой искусства и кино.',
    en: 'A small Arizona town among red sandstone rocks that glow pink at sunrise and sunset, surrounded by a national forest of canyons, '
      + 'mesas and Oak Creek. About ten thousand residents and about three million visitors a year: a beautiful and busy place with a '
      + 'strong arts and film culture.',
  },
  whoGoes: {
    ru: 'По опросу торговой палаты не меньше трети туристов ищут духовные и метафизические занятия. Рядом — хайкеры и велосипедисты '
      + 'на сотнях троп, художники и любители кино, много людей старшего возраста. Популярные тропы за десятилетие стали вдвое '
      + 'многолюднее.',
    en: 'According to a chamber of commerce survey, at least a third of visitors look for spiritual and metaphysical activities. Alongside '
      + 'them are hikers and cyclists on hundreds of trails, artists and film lovers, many older people. Popular trails have doubled '
      + 'their traffic in a decade.',
  },
  narrative: [
    {
      ru: 'Рассказывают о «вихрях» — точках, где закручивается энергия земли и легче исцеляться и медитировать; самые известные — '
        + 'у четырёх скал и каньонов. Само слово в этом смысле появилось в конце 1970-х годов.',
      en: 'People speak of "vortexes" — spots where the earth\'s energy swirls and healing and meditation come easier; the best known are '
        + 'at four rocks and canyons. The word in this sense appeared at the end of the 1970s.',
    },
    {
      ru: 'Город называют «духовной меккой»; в 1987 году здесь собрались тысячи искателей на «Гармоническую конвергенцию».',
      en: 'The town is called a "spiritual mecca"; in 1987 thousands of seekers gathered here for the "Harmonic Convergence".',
    },
  ],
  culture: {
    lands: {
      ru: 'Родина народов явапаи и апачи (нация Явапаи-Апачи в долине Верде); места предков с наскальными изображениями важны '
        + 'и для народа хопи. Один из каньонов у города — священное место явапаи, им сейчас управляют лес и частный курорт. '
        + 'Представители явапаи называют связь их народа с «вихрями» выдумкой.',
      en: 'The homeland of the Yavapai and Apache peoples (the Yavapai-Apache Nation in the Verde Valley); ancestral sites with rock art '
        + 'also matter to the Hopi people. One canyon near the town is a Yavapai holy place, now managed by the forest and a private '
        + 'resort. Yavapai representatives call the link between their people and the "vortexes" made up.',
    },
    asks: {
      ru: 'Народ хопи просит уважать свои законы, культуру и образ жизни и не снимать и не публиковать обряды, музыку и рассказанные '
        + 'истории без согласия. На местах предков: смотреть, но не трогать, ничего не оставлять и не уносить. Город просит не складывать '
        + 'камни в пирамидки и уважать тех, кто медитирует на скалах.',
      en: 'The Hopi people ask visitors to respect their laws, culture and way of life and not to film or publish ceremonies, music and '
        + 'stories told to them without consent. At ancestral sites: look but do not touch, leave nothing and take nothing. The town asks '
        + 'visitors not to stack rocks and to respect those meditating on the rocks.',
    },
    links: [
      { title: 'Yavapai-Apache Nation', url: 'https://yavapai-apache.org/', accessed: '2026-10-19' },
      {
        title: 'Yavapai-Apache Cultural Resource Center',
        url: 'https://yavapai-apache.org/directory/yavapai-apache-cultural-resource-center/',
        accessed: '2026-10-19',
      },
      { title: 'The Hopi Tribe', url: 'https://www.hopi-nsn.gov/', accessed: '2026-10-19' },
      {
        title: 'Hopi Cultural Preservation Office',
        url: 'https://www.hopi-nsn.gov/tribal-services/department-natural-resources-2/hopi-cultural-preservation-office/',
        accessed: '2026-10-19',
      },
      {
        title: 'Friends of the Forest — a Yavapai-Apache perspective on the landscape',
        url: 'https://www.friendsoftheforestsedona.org/serving-sedona/reading-the-landscape-and-its-history-from-a-yavapai-apache-perspective/',
        accessed: '2026-10-19',
      },
    ],
  },
  themes: {
    silence: fit('clash', 'Три миллиона гостей в год: тишину на тропах приходится искать.', 'Three million visitors a year: silence on the trails has to be searched for.'),
    body: fit('match', 'Свет, простор и площадки у скал хорошо держат йогу и движение.', 'Light, space and spots by the rocks hold yoga and movement well.'),
    breath: fit('match', 'Открытый горизонт и сухой воздух поддерживают дыхательные практики.', 'The open horizon and dry air support breath practices.'),
    creative: fit('match', 'Город художников и кино с долгой историей искусства.', 'A town of artists and film with a long arts history.'),
    nature: fit('match', 'Сотни троп, каньоны и ручей Ок-Крик.', 'Hundreds of trails, canyons and Oak Creek.'),
    ritual: fit(
      'clash',
      'Священные места народов здесь присвоены «вихревым» туризмом; свои обряды на них их задевают.',
      'Sacred places of local peoples are taken over by "vortex" tourism; outside ceremonies there hurt them.',
    ),
    burnout: fit('match', 'Красота мест и сильные виды быстро переключают с городской жизни.', 'The beauty of the place and strong views quickly switch people off city life.'),
    couples: fit('match', 'Закаты над скалами и курорты у ручья — место для пар.', 'Sunsets over the rocks and resorts by the creek — a place for couples.'),
    leadership: fit('match', 'Курорты принимают выездные сессии руководителей и команд.', 'Resorts host executive and team retreats.'),
    transition: fit(
      'neutral',
      'Место яркое, но для глубокой перемены важнее программа, чем пейзаж.',
      'The place is vivid, but for deep change the programme matters more than the scenery.',
    ),
  },
  audiences: {
    beginners: fit('match', 'Много понятных форматов и инфраструктуры для первого опыта.', 'Plenty of clear formats and infrastructure for a first experience.'),
    practitioners: fit('neutral', 'Опытным практикующим здесь может мешать туристический поток.', 'Experienced practitioners may be put off by the tourist crowds.'),
    burnedOut: fit('match', 'Сильные виды и тёплый свет быстро снимают городское напряжение.', 'Strong views and warm light quickly ease city tension.'),
    founders: fit('match', 'Курорты с залами и сервисом для выездных сессий.', 'Resorts with halls and service for offsite sessions.'),
    teams: fit('match', 'Площадки умеют принимать корпоративные группы.', 'Venues know how to host corporate groups.'),
    couples: fit('match', 'Романтичные закаты и курорты у ручья.', 'Romantic sunsets and resorts by the creek.'),
    womensCircle: fit('match', 'Много ретрит-центров и сообщество практиков.', 'Many retreat centres and a community of practitioners.'),
    mensCircle: fit('neutral', 'Природа подходит, но атмосфера курорта не про суровый формат.', 'The nature fits, but the resort atmosphere is not about a rugged format.'),
    creatives: fit('match', 'Художественная среда, галереи, фестиваль кино.', 'An arts scene, galleries, a film festival.'),
    seekers: fit(
      'match',
      'Седону знают как одну из главных духовных точек Америки — этих людей сюда и тянет.',
      'Sedona is known as one of America\'s main spiritual spots — this is who it draws.',
    ),
  },
  verdict: {
    yes: {
      ru: 'Телесным, творческим и восстановительным ретритам, парам, руководителям и командам, новичкам: место яркое, понятное и с сервисом.',
      en: 'Body, creative and recovery retreats, couples, executives and teams, newcomers: the place is vivid, easy to read and well '
        + 'served.',
    },
    no: {
      ru: 'Ретритам глубокой тишины и программам с обрядами «на вихрях»: здесь людно, а священные места принадлежат другим.',
      en: 'Retreats of deep silence and programmes with ceremonies "at the vortexes": it is crowded here, and the sacred places belong '
        + 'to others.',
    },
  },
  venues: [
    {
      name: 'Amara Resort & Spa',
      kind: 'lodge',
      about: {
        ru: 'Современный курорт у красных скал; принимает выездные сессии руководителей и тимбилдинг.',
        en: 'A modern resort by the red rocks; hosts executive retreats and team building.',
      },
      themes: ['leadership', 'burnout'],
      audiences: ['founders', 'teams'],
      url: 'https://www.amararesort.com/business-meetings/',
      checked: '2026-10-19',
    },
    {
      name: 'Briar Patch Inn',
      kind: 'lodge',
      about: {
        ru: 'Отдельные хижины на берегу ручья в каньоне; давно принимает ретриты.',
        en: 'Separate cabins on the creek in the canyon; has hosted retreats for many years.',
      },
      themes: ['silence', 'nature', 'creative'],
      audiences: ['practitioners', 'creatives', 'couples'],
      url: 'https://briarpatchinn.com/retreats/',
      checked: '2026-10-19',
    },
    {
      name: 'Enchantment Resort',
      kind: 'lodge',
      about: {
        ru: 'Курорт в каньоне среди скал; принимает корпоративные ретриты. Каньон — священное место явапаи.',
        en: 'A resort in a canyon among the rocks; hosts corporate retreats. The canyon is a Yavapai holy place.',
      },
      themes: ['leadership', 'burnout'],
      audiences: ['founders', 'teams', 'couples'],
      url: 'https://www.enchantmentresort.com/sedona-event-venues/corporate-events-retreats/',
      checked: '2026-10-19',
    },
    {
      name: 'L\'Auberge de Sedona',
      kind: 'lodge',
      about: {
        ru: 'Курорт с коттеджами у ручья среди красных скал; есть отдельное направление встреч и ретритов.',
        en: 'A resort with cottages by the creek among the red rocks; has a separate meetings and retreats team.',
      },
      themes: ['couples', 'burnout', 'leadership'],
      audiences: ['couples', 'founders', 'burnedOut'],
      url: 'https://www.lauberge.com/corporate-group-planning-connection',
      checked: '2026-10-19',
    },
    {
      name: 'Sedona Mago Retreat & Wellness',
      kind: 'retreat-center',
      about: {
        ru: 'Некоммерческий велнес-центр на большом кампусе среди красных скал; проводит свои ретриты и принимает внешние группы.',
        en: 'A non-profit wellness centre on a large campus among the red rocks; runs its own retreats and hosts outside groups.',
      },
      themes: ['body', 'breath', 'burnout', 'transition'],
      audiences: ['beginners', 'burnedOut', 'womensCircle', 'seekers'],
      url: 'https://sedonamagoretreat.org/host-retreats/',
      checked: '2026-10-19',
    },
    {
      name: 'The Field at Oak Creek',
      kind: 'group-house',
      about: {
        ru: 'Усадьба у ручья с гостевыми домами и глэмпингом; подходит для камерного ретрита.',
        en: 'An estate by the creek with guest houses and glamping; suits an intimate retreat.',
      },
      themes: ['silence', 'nature', 'creative'],
      audiences: ['womensCircle', 'creatives', 'practitioners'],
      url: 'https://thefieldatoakcreek.com/retreats/',
      checked: '2026-10-19',
    },
  ],
  sources: [
    { title: 'Wikipedia — Sedona, Arizona', url: 'https://en.wikipedia.org/wiki/Sedona,_Arizona', accessed: '2026-10-19' },
    {
      title: 'USDA Forest Service — Red Rock Ranger District',
      url: 'https://www.fs.usda.gov/r03/coconino/recreation/red-rock-ranger-district',
      accessed: '2026-10-19',
    },
    { title: 'Arizona Highways — Alternative Energy (2025)', url: 'https://www.arizonahighways.com/article/alternative-energy', accessed: '2026-10-19' },
    { title: 'Visit Sedona — What is a vortex', url: 'https://visitsedona.com/spiritual-wellness/what-is-a-vortex/', accessed: '2026-10-19' },
    { title: 'Spiritual Tourism: Travel to Experience Vortex Energy (ASU, 2026)', url: 'https://zenodo.org/records/20464862', accessed: '2026-10-19' },
  ],
}
