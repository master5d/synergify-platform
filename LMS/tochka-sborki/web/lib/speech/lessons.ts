// lib/speech/lessons.ts
// Проза уроков ораторского курса. Отдельно от course.ts (там структура).
// Ключ = slug урока из SPEECH_COURSE.
// ⚠ Копирайт: корпус владельца (Карнеги, Леммерман) — только как ориентир темы;
// текст оригинальный, фундамент public-domain (классическая риторика). Ни строки
// из современных авторов (шрам OpenYoga). Проза проходит lintDehustle.
// Пустая строка = урок ещё не написан: страница урока такой slug не создаёт.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export const SPEECH_PROSE: Record<string, Bi> = {
  'prep': {
    ru: `Речь начинается задолго до того, как вы открываете рот, и почти никогда — с текста. Самая частая ошибка человека, которому предстоит выступать, — сесть и начать писать первую фразу. Через полчаса он получает абзац, который ему не нравится, и вывод, что он плохо говорит. На самом деле он просто пропустил этап, на котором решается всё остальное: зачем он вообще выходит.

## Цель, а не тема

Тема отвечает на вопрос «о чём». Цель отвечает на вопрос «что изменится в зале». «Отчёт за квартал» — это тема. «Чтобы отдел перестал бояться новой системы учёта и на этой неделе завёл в ней хотя бы одну задачу» — это цель. Разница не косметическая: из темы нельзя вывести, что оставить, а что выбросить, а из цели — можно.

Классическая риторика различала три рода речи: о прошлом (было или не было, кто прав), о будущем (делать или не делать) и о настоящем (что мы ценим и почему). Полезно честно определить свой род. Если вы думаете, что говорите о будущем, а на деле оправдываетесь за прошлое, слушатель это чувствует раньше вас.

Запишите цель одной фразой по образцу: «После моих семи минут слушатель сможет / захочет / поймёт ____». Если фраза не складывается, выступать пока рано — не потому что вы не готовы говорить, а потому что вы ещё не решили, зачем.

## Кто в зале

Аудитория — не «люди вообще». Три вопроса дают почти всё: что они уже знают по теме, что их в связи с ней тревожит и что они реально могут сделать после. Первый вопрос спасает от объяснения очевидного и от пропуска необходимого. Второй показывает, где будет сопротивление. Третий не даёт закончить призывом, который никто не в состоянии выполнить.

Если вы не знаете ответов — спросите заранее. Два коротких разговора с будущими слушателями дают больше, чем два часа догадок.

## Материал: собирайте с избытком

Разумная норма — собрать в три-пять раз больше, чем поместится в отведённое время. Избыток нужен не для того, чтобы всё сказать, а для того, чтобы было из чего выбирать, и чтобы вы стояли перед залом человеком, который знает больше, чем говорит. Это слышно в голосе.

Берите из четырёх источников: собственный опыт (конкретные случаи, с датами и деталями), проверяемые факты и цифры со ссылкой на источник, наблюдения других людей и — отдельной стопкой — возражения. Возражения собирайте так же прилежно, как аргументы: они вам понадобятся в уроке про работу с аудиторией, а пока просто показывают, где ваша позиция тонкая.

Пишите по одному факту или одной истории на карточку (бумажную или в заметках). Карточки потом легко тасовать; сплошной текст — нет.

## Упражнение (25 минут, сегодня)

1. **5 минут.** Напишите цель одной фразой по образцу выше. Перепишите её минимум дважды — первая формулировка почти всегда про тему, а не про цель.
2. **10 минут.** Поставьте таймер и наберите 12 карточек: факты, случаи, цифры, чужие реплики. Не оценивайте, не редактируйте — только набор.
3. **5 минут.** Отметьте каждую карточку «да», «нет» или «может» по одному критерию: работает ли она на цель. Если «да» меньше четырёх — материал ещё не собран, вернитесь к шагу 2 завтра.
4. **5 минут.** Запишите на диктофон 90 секунд свободного ответа на вопрос «зачем я вообще про это говорю» и послушайте. Отметьте секунду, на которой голос стал живее: там ваша настоящая цель, и она может отличаться от написанной.

Повторяйте перед каждым выступлением. К пятому разу это займёт десять минут вместо двадцати пяти.

Группа здесь полезна в одном месте: дайте человеку, не погружённому в тему, прочитать вашу фразу-цель и пересказать своими словами. Расхождение между тем, что вы имели в виду, и тем, что он услышал, — самая дешёвая правка из всех возможных.

## Итог

Подготовка не делает речь безупречной. Она делает её вашей: вы выходите, зная, зачем стоите здесь, и держа в руках больше материала, чем произнесёте. Большая часть собранного не прозвучит — это не потеря, а запас, который позволяет вам не бояться вопросов.`,
    en: `A talk starts long before you open your mouth, and it almost never starts with the text. The most common mistake is to sit down and write the first sentence. Half an hour later you have a paragraph you dislike and a conclusion that you're bad at speaking. In fact you skipped the stage that decides everything else: why you are getting up at all.

## Purpose, not topic

A topic answers "what about". A purpose answers "what changes in the room". "Quarterly report" is a topic. "So the team stops dreading the new tracking system and logs at least one task in it this week" is a purpose. The difference is practical, not cosmetic: a topic can't tell you what to cut, and a purpose can.

Classical rhetoric sorted speeches by time: about the past (what happened), about the future (whether to act), and about the present (what we value). Name yours honestly. If you think you're talking about the future but you're actually defending the past, the room notices before you do.

Write your purpose as one sentence: "After my seven minutes, a listener will be able to / will want to / will understand ____." If the sentence won't come, it's too early to speak — not because you lack skill, but because you haven't decided what this is for.

## Who is in the room

An audience is never "people in general". Three questions get you most of the way: what do they already know, what worries them about it, and what can they actually do afterwards. The first saves you from explaining the obvious and from skipping the necessary. The second shows you where resistance lives. The third stops you from ending on a call to action nobody in the room is able to perform.

If you don't know the answers, ask. Two short conversations with future listeners beat two hours of guessing.

## Gather more than fits

A workable rule: collect three to five times more than your time allows. The surplus isn't there to be spoken. It's there so you have something to choose from, and so you stand in front of the room as someone who knows more than they say. That is audible in the voice.

Draw from four sources: your own experience (specific cases, with dates and details), checkable facts with a source you could name, other people's observations, and — in a separate pile — objections. Collect objections as diligently as arguments. You'll need them later; for now they show you where your position is thin.

Put one fact or one story on one card, paper or digital. Cards can be reshuffled later. A wall of prose cannot.

## Exercise (25 minutes, today)

1. **5 minutes.** Write your purpose as one sentence, using the template above. Rewrite it at least twice — the first version is nearly always a topic in disguise.
2. **10 minutes.** Set a timer and produce 12 cards: facts, cases, numbers, things people said. No judging, no editing. Volume only.
3. **5 minutes.** Mark each card yes, no, or maybe against a single test: does it serve the purpose. Fewer than four yeses means the material isn't gathered yet — return to step 2 tomorrow.
4. **5 minutes.** Record 90 seconds of yourself answering, unscripted, "why am I talking about this at all", then listen back. Note the second where your voice came alive. That is your real purpose, and it may not match the one you wrote.

Repeat before every talk. By the fifth time it takes ten minutes instead of twenty-five.

A group helps at exactly one point: hand your purpose sentence to someone outside the subject and ask them to say it back in their own words. The gap between what you meant and what they heard is the cheapest edit you will ever make.

## In closing

Preparation doesn't make a talk flawless. It makes it yours: you walk up knowing why you're standing there, holding more material than you'll use. Most of what you gathered won't be spoken. That isn't waste — it's the reserve that lets you stop fearing questions.`,
  },
  'plan': {
    ru: `Собранный материал сам себя не выстроит. План — это не оглавление и не список пунктов для слайдов; это маршрут, по которому вы ведёте слушателя из точки, где он сейчас, в точку, где он должен оказаться. Хороший план слышен на слух: человек в зале в любой момент понимает, где он и сколько осталось.

## Три части и их работа

Древние учебники делили речь на вступление, изложение с доказательством и заключение. Формулировка простая, но каждая часть выполняет свою задачу, и путать их дорого.

Вступление отвечает на один невысказанный вопрос слушателя: «зачем мне слушать?» Ответ должен прозвучать в первые тридцать-сорок секунд. Не благодарности, не извинения за волнение, не пересказ регламента — конкретный случай, вопрос или цифра, которые обозначают, о чём пойдёт речь и почему это касается сидящих.

Середина несёт содержание: два-четыре смысловых блока, каждый со своим утверждением и своей опорой — примером, цифрой, разбором. Больше четырёх блоков на короткой речи не удерживает никто, включая вас.

Заключение возвращает к цели и говорит, что дальше. Оно короткое. Хуже всего заканчивается речь, которая заканчивается трижды.

## Четыре рабочих порядка

Порядок блоков — не вкус, а выбор под задачу.

**Проблема — решение.** Работает, когда зал уже чувствует проблему. Не работает, если проблему приходится сначала доказывать: тогда вы тратите на неё всю речь.

**Хронология.** Как было, что случилось, что теперь. Честный порядок для отчётов и историй, опасный для убеждения: слушатель может выйти с ощущением «понятно», но без действия.

**От известного к новому.** Начать с того, что зал уже принимает, и шаг за шагом добавлять неизвестное. Медленно, но выдерживает скепсис.

**Тезис и разбор.** Сначала главное утверждение, потом три опоры. Лучший порядок, когда времени мало или когда часть зала уйдёт в середине.

Выбирайте порядок после того, как определили цель, а не до.

## Тайминг

Тайминг — часть уважения к залу, а не техническая деталь. Спокойный темп речи — примерно 110-130 слов в минуту; на семь минут это около 800-900 слов, то есть меньше, чем кажется. Планируйте на 80% времени: семиминутный слот означает речь на пять с половиной минут. Оставшееся уйдёт на паузы, реакцию зала и то, что вы обязательно скажете сверх плана.

Проставьте у каждого блока минуты и запишите их на полях. Если сумма не сходится — режьте не темп, а блоки. Ускоренная речь не экономит время, она просто перестаёт доходить.

Переходы стоит написать словами: одна фраза между блоками, которая говорит, что закончилось и что начинается. Именно на переходах слушатель обычно теряется, а говорящий обычно импровизирует хуже всего.

## Упражнение (30 минут, сегодня)

1. **10 минут.** Разложите карточки из прошлого урока в 3 стопки — это ваши блоки. Каждой стопке дайте заголовок в форме утверждения, а не темы: не «сроки», а «сроки сдвинулись на две недели, и вот почему это к лучшему».
2. **5 минут.** Выберите один из четырёх порядков и переставьте стопки. Затем выберите другой и переставьте ещё раз. Сравните: какой из двух отвечает на вопрос зала быстрее.
3. **5 минут.** Проставьте минуты: вступление 0:45, блоки по 1:30, заключение 0:40. Сумма должна быть на 20% меньше слота.
4. **10 минут.** Запишите себя, проговаривая только заголовки блоков и переходы между ними — без содержания, 2 минуты максимум. Прослушайте. Если по одному этому скелету не видно логики, содержание её не спасёт. Перепишите переходы и запишите второй дубль.

В одиночку это работает полностью. Группа добавляет одно: попросите слушателя после вашей речи назвать три блока по памяти. Что он не вспомнил — того в плане не было.

## Итог

План не сковывает, а освобождает: когда маршрут ясен, можно позволить себе отвлечься на вопрос из зала и вернуться, не потеряв нить. И почти всегда правильный ход — убрать один блок. Речь от этого становится не беднее, а разборчивее.`,
    en: `Gathered material does not arrange itself. A plan is not a table of contents or a list of slide bullets. It's the route along which you walk a listener from where they are to where they need to end up. A good plan is audible: at any moment the person in the room knows where they are and how much is left.

## Three parts, three jobs

The old handbooks split a speech into opening, body with proof, and close. Simple enough — but each part does distinct work, and confusing them is expensive.

The opening answers one unspoken question: why should I listen? The answer belongs in the first thirty or forty seconds. Not thanks, not an apology for nerves, not a recap of the agenda — a specific case, question, or number that shows what this is about and why it touches the people sitting there.

The body carries the content: two to four blocks, each with its own claim and its own support — an example, a figure, a piece of analysis. Nobody holds more than four blocks in a short talk, you included.

The close returns to the purpose and says what happens next. It is short. The worst-ending talk is the one that ends three times.

## Four working orders

Block order isn't taste. It's a choice made for a job.

**Problem then solution.** Works when the room already feels the problem. Fails when you have to prove the problem first — you'll spend the whole talk on it.

**Chronological.** How it was, what happened, where we are. An honest order for reports and stories, a risky one for persuasion: people leave understanding, but not acting.

**Known to new.** Start where the room already agrees and add unfamiliar ground a step at a time. Slow, but it survives scepticism.

**Claim then support.** State the main point, then give three supports. The best order when time is short or when half the room will leave in the middle.

Choose the order after you've fixed the purpose, never before.

## Timing

Timing is a form of respect, not a technicality. An unhurried speaking pace runs about 110-130 words a minute, so seven minutes is roughly 800-900 words — less than it feels. Plan for 80% of your slot: a seven-minute slot means a five-and-a-half-minute talk. The rest goes to pauses, the room's reactions, and the things you will inevitably add.

Write a minute figure next to every block. If the sum overruns, cut blocks, not pace. Speeding up doesn't save time; it just stops landing.

Write your transitions out as sentences: one line between blocks saying what has ended and what begins. Transitions are where listeners get lost, and where speakers improvise worst.

## Exercise (30 minutes, today)

1. **10 minutes.** Sort last lesson's cards into 3 piles — those are your blocks. Title each pile as a claim, not a topic: not "timelines" but "the timeline moved two weeks, and here's why that's better".
2. **5 minutes.** Pick one of the four orders and arrange the piles. Then pick a different one and rearrange. Compare: which answers the room's question sooner?
3. **5 minutes.** Assign minutes: opening 0:45, blocks 1:30 each, close 0:40. The total must be 20% under your slot.
4. **10 minutes.** Record yourself speaking only the block titles and the transitions between them — no content, 2 minutes maximum. Listen back. If the logic isn't visible from that skeleton alone, content won't rescue it. Rewrite the transitions and record a second take.

This works fully on your own. A group adds one thing: after your talk, ask a listener to name the three blocks from memory. Whatever they can't recall was never really in the plan.

## In closing

A plan doesn't constrain you, it frees you: when the route is clear you can afford to follow a question from the room and come back without losing the thread. And the right move is almost always to remove one block. That makes the talk not poorer, but legible.`,
  },
  'devices': {
    ru: `Ораторский приём — это форма, которая помогает мысли дойти. Ударение здесь на слове «дойти»: приём не добавляет вам правоты и не заменяет содержания. Он делает уже собранное различимым на слух — а речь воспринимается на слух, с одного прохода, без возможности перечитать абзац. Именно поэтому приёмы вообще существуют, и именно поэтому их так легко развернуть против слушателя. Этот урок про обе стороны.

## Приёмы, которые служат ясности

**Конкретность.** «Мы потеряли много времени» проходит мимо; «мы потеряли одиннадцать рабочих дней на согласованиях» остаётся. Слушатель удерживает образы и числа, а не оценки. Замените в своём тексте три оценочных слова на три проверяемых факта — и половина работы над речью сделана.

**Повтор.** Одна и та же формулировка, возвращающаяся в начале нескольких фраз подряд, собирает внимание и делает мысль запоминаемой. Древние называли это анафорой; работает она и сегодня, но при одном условии — повторять надо то, что вы действительно готовы защищать. Повторённая пустота становится заметнее, а не убедительнее.

**Контраст.** Пара противопоставленных частей («не быстрее, а точнее») даёт слушателю опору: он понимает, что вы выбираете и от чего отказываетесь. Контраст честен, пока обе половины реальны.

**Вопрос.** Заданный вслух вопрос заставляет зал думать вместе с вами. Держите паузу после него хотя бы две секунды, иначе он превращается в украшение.

**Пауза.** Самый недооценённый приём. Молчание в две-три секунды после важной фразы даёт ей осесть и одновременно возвращает вам дыхание. Начинающему кажется, что пауза длится вечность; на записи она обычно оказывается вдвое короче, чем ощущалась.

**Образ и история.** Короткий случай из жизни делает абстракцию осязаемой. Правило одно: история должна быть настоящей и вашей. Позаимствованный или приукрашенный случай рано или поздно вскроется, и вместе с ним обесценится всё остальное.

## Приёмы давления, которых мы не используем

Приём становится манипуляцией, когда он обходит суждение слушателя вместо того, чтобы его питать. Их нужно уметь называть — в том числе чтобы узнавать, когда так говорят с вами.

**Ложная срочность.** «Решение нужно сейчас, иначе поздно», когда на деле срок другой. Отнимает у человека время на размышление — то есть ровно то, что делает согласие настоящим.

**Стыд.** «Взрослый человек это бы уже понял». Слушатель замолкает, но не соглашается; вы получаете тишину и принимаете её за поддержку.

**Лесть.** «Вы, в отличие от других, разбираетесь». Покупает расположение авансом и делает возражение неудобным — теперь несогласный как бы теряет выданный ему статус.

**Ложная дилемма.** «Либо мы делаем это, либо ничего не меняем». Третьи варианты почти всегда есть, и слушатель это чувствует, даже если не находит их сразу.

**Ложная общность.** «Мы все понимаем, что...» — там, где никакого общего понимания нет. Приписывает залу мнение и делает несогласие выходом из группы.

Их объединяет одно: слушатель, узнав, как с ним разговаривали, пожалел бы о своём согласии. Это рабочая проверка. Если ваша фраза проходит её — она честная, какой бы сильной ни была.

## Упражнение (20 минут, сегодня)

1. **7 минут.** Возьмите один блок своей речи и перепишите его дважды: версия А — с одним повтором и одним контрастом; версия Б — с одной конкретной цифрой вместо оценочного слова и одной паузой, отмеченной в тексте знаком \`//\`.
2. **5 минут.** Запишите обе версии на диктофон и прослушайте подряд. Отметьте, в какой из них вам самому веришь больше.
3. **5 минут.** Перечитайте текст с одним вопросом к каждой фразе: не давлю ли я здесь. Найдите минимум одну фразу с признаками из второго раздела — она почти наверняка есть — и перепишите её так, чтобы утверждение осталось, а давление ушло.
4. **3 минуты.** Запишите в заметки, какой приём давления вам даётся легче всего. Это ваша личная зона внимания на весь курс.

Группа полезна на шаге 3: чужое ухо ловит давление лучше своего. Но и в одиночку запись через сутки работает почти так же — вы слушаете себя уже как посторонний.

## Итог

Сильная речь и честная речь — не противоположности. Приёмы дают силу, этика задаёт направление, и разделять их не нужно: приём, применённый к правде, усиливает правду. Проверка одна и всегда доступна — согласился бы слушатель, если бы видел вашу кухню целиком.`,
    en: `A rhetorical device is a shape that helps a thought arrive. The stress is on *arrive*: a device adds nothing to your case and substitutes for no content. It makes what you already have audible — and speech is taken in by ear, in one pass, with no rereading. That's why devices exist, and why they're so easy to turn against a listener. This lesson is about both edges.

## Devices that serve clarity

**Concreteness.** "We lost a lot of time" slides past; "we lost eleven working days to sign-offs" stays. Listeners retain images and numbers, not judgements. Swap three evaluative words for three checkable facts and half the work is done.

**Repetition.** The same phrasing returning at the head of several sentences gathers attention and makes a thought portable. The ancients called it anaphora, and it still works — on one condition: repeat only what you're prepared to defend. Repeated emptiness gets more conspicuous, not more convincing.

**Contrast.** A paired opposition ("not faster — more accurate") gives a listener footing: they see what you're choosing and what you're giving up. Contrast stays honest as long as both halves are real.

**The question.** A question asked aloud makes the room think alongside you. Hold two seconds of silence after it, or it's decoration.

**The pause.** The most underrated device there is. Two or three seconds after an important line lets it settle and hands your breath back to you. To a beginner a pause feels endless; on the recording it's half as long as it felt.

**Image and story.** A short real incident makes an abstraction touchable. One rule: the story must be true and yours. A borrowed or improved anecdote surfaces eventually, and takes the credibility of everything else with it.

## Pressure devices we don't use

A device becomes manipulation when it routes around a listener's judgement instead of feeding it. Learn to name these — not least so you recognise them when they're aimed at you.

**Manufactured urgency.** "We need a decision now or it's too late," when the real deadline isn't that. It removes thinking time — the very thing that makes agreement real.

**Shame.** "Anyone serious would have grasped this by now." The listener goes quiet but doesn't agree; you get silence and mistake it for support.

**Flattery.** "You, unlike the others, actually understand this." It buys goodwill upfront and makes disagreement costly — objecting means forfeiting the status you handed over.

**False dilemma.** "Either we do this or nothing changes." Third options almost always exist, and the room senses it even when it can't name them.

**Assumed consensus.** "We all understand that…" where no shared understanding exists. It attributes an opinion to the room and turns dissent into leaving the group.

They share one feature: a listener who later saw how they were talked to would regret agreeing. If your sentence passes that test, it's honest — however forceful it is.

## Exercise (20 minutes, today)

1. **7 minutes.** Take one block of your talk and rewrite it twice: version A with one repetition and one contrast; version B with a concrete number replacing an evaluative word, and one pause marked \`//\`.
2. **5 minutes.** Record both and listen back to back. Note which one you believe more in your own voice.
3. **5 minutes.** Reread the draft asking one question of each sentence: am I pushing here? Find at least one line with the traits from section two — there almost certainly is one — and rewrite it so the claim survives and the pressure goes.
4. **3 minutes.** Note which pressure device comes most naturally to you. That's your watch item for the rest of the course.

A group helps at step 3: someone else's ear catches pressure better than your own. Alone, a recording heard a day later works nearly as well — by then you hear yourself as a stranger.

## In closing

Forceful and honest are not opposites. Devices supply force, ethics supplies direction, and there's no need to separate them: a device applied to the truth strengthens the truth. The test is always available — would this listener still agree if they saw your whole workshop?`,
  },
  'delivery': {
    ru: `Одну и ту же фразу можно произнести так, что она убедит, и так, что она вызовет неловкость. Разница — в технике произнесения: дыхании, дикции, темпе, паузе, интонации, жесте. Это ремесленная часть ораторства, и хорошая новость в том, что ремесло тренируется предсказуемо. Плохая — что тренируется оно только через собственную запись, потому что изнутри головы свой голос слышен искажённо.

## Опора: дыхание и звук

Голос ставится на выдохе, а не на горле. Проверка занимает секунды: положите ладонь на живот и вдохните так, чтобы поднялась ладонь, а не плечи. Если поднимаются плечи — дыхание верхнее, воздуха хватает на короткую фразу, и к концу предложения голос садится, а слушатель слышит тревогу, которой у вас, может быть, и нет.

Второе — громкость. Начинающие говорят тише, чем нужно, и почти всегда извиняются за это позой. Ориентир простой: говорите для человека в последнем ряду, а не для первого. Тогда середина зала получит нормальный звук, а не напряжённый шёпот.

## Дикция и артикуляция

Дикция — это чёткость, с которой различаются звуки; артикуляция — работа губ, языка и челюсти, которая эту чёткость даёт. Взрослый человек чаще всего говорит с полузакрытым ртом: в бытовом разговоре собеседник рядом и всё понимает, а в зале половина согласных теряется по дороге.

Тренируется это скучно и надёжно: медленное чтение вслух с намеренно преувеличенной работой рта, пять минут в день. Скороговорки полезны, но только на медленном темпе — гонка закрепляет смазанность. Отдельно проверьте окончания слов: у большинства говорящих проглатываются именно они, и именно на них часто держится смысл.

## Темп, пауза, интонация

Спокойный темп — примерно 110-130 слов в минуту. Волнение разгоняет до 160-180, и это главная причина, по которой хорошо подготовленную речь не понимают. Замедление не требует усилия воли: достаточно вернуть паузы, темп выравнивается сам.

Пауза делает три вещи сразу — даёт слушателю осмыслить, вам вдохнуть, а фразе прозвучать законченной. Ставьте её в трёх местах: после важного утверждения, перед выводом и на переходе между блоками. Двух-трёх секунд достаточно.

Интонация в русской и английской речи чаще всего страдает одинаково: фраза заканчивается вверх, как вопрос, и всё сказанное звучит неуверенно. Осознанное понижение тона к точке — самая быстрая поправка из всех, что можно внести за один вечер.

Слова-паразиты («вот», «как бы», «ну») — не порок речи, а заполнение паузы. Уберите страх молчания, и они уйдут сами; борьба с ними по списку обычно только добавляет напряжения.

## Жест и взгляд

Жест уместен, когда он опережает слово или совпадает с ним, и мешает, когда отстаёт. Держите руки свободными на уровне пояса — не в карманах и не сцепленными: сцепленные руки сообщают залу защиту, даже если вы спокойны. Взгляд ведите по залу отрезками: три-четыре секунды на одного человека, потом переход. Скольжение по головам читается как отсутствие контакта.

## Упражнение (20 минут, сегодня)

1. **3 минуты.** Дыхание: 10 циклов «вдох на 4 счёта — выдох на 8», ладонь на животе. Затем произнесите одну длинную фразу целиком на одном выдохе.
2. **5 минут.** Медленное чтение вслух любого абзаца с преувеличенной артикуляцией. Половина нормального темпа. Следите за окончаниями.
3. **7 минут.** Запишите 2 минуты своей речи. Прослушайте с секундомером и посчитайте: сколько слов в минуту, сколько пауз длиннее двух секунд, сколько фраз закончились интонацией вверх. Запишите три числа.
4. **5 минут.** Второй дубль того же куска с одной задачей: три сознательные паузы и понижение тона в конце каждой фразы. Сравните числа.

Делайте это четыре дня подряд, записывая числа в столбик. Прогресс в технике виден только в динамике; по одной записи вы его не увидите и решите, что ничего не меняется.

Группа тут не нужна вовсе — диктофон честнее любого слушателя. Тренер полезен позже, когда база уже есть и нужен разбор нюансов.

## Итог

Техника произнесения — самая механическая часть курса и самая быстро окупаемая: три недели по двадцать минут дают слышимую разницу. Но техника ничего не добавляет к содержанию. Она лишь убирает помехи между тем, что вы поняли, и тем, что услышал зал.`,
    en: `The same sentence can land as convincing or as awkward. The difference is delivery: breath, articulation, pace, pause, intonation, gesture. This is the craft half of speaking, and the good news is that craft trains predictably. The bad news is that it trains only through your own recordings, because from inside your head your voice reaches you distorted.

## Support: breath and sound

Voice rides on the out-breath, not on the throat. The check takes seconds: put a palm on your belly and breathe so the palm moves, not your shoulders. If the shoulders rise, you're breathing high — air runs out mid-sentence, the voice sags toward the full stop, and the room hears an anxiety you may not actually feel.

Second, volume. Beginners speak more quietly than needed and then apologise for it with their posture. Aim at the person in the back row, not the front one. Then the middle of the room gets a normal sound instead of a strained near-whisper.

## Articulation

Diction is how distinctly your sounds separate; articulation is the lip, tongue, and jaw work that produces it. Most adults speak with a half-closed mouth — fine in conversation, where the listener is close, but in a room half the consonants get lost in transit.

The training is dull and dependable: slow reading aloud with deliberately exaggerated mouth movement, five minutes a day. Tongue-twisters help, but only slowly — racing rehearses the smear. Check your word endings specifically. That's what most speakers swallow, and endings frequently carry the meaning.

## Pace, pause, intonation

An unhurried pace is about 110-130 words per minute. Nerves push it to 160-180, and that is the main reason well-prepared talks aren't understood. Slowing down needs no willpower: restore the pauses and the pace corrects itself.

A pause does three things at once — gives the listener time to process, gives you air, and lets the sentence sound finished. Place them in three spots: after an important claim, before a conclusion, and at transitions between blocks. Two or three seconds is plenty.

Intonation fails the same way in most speakers: the sentence lifts at the end, like a question, and everything said sounds tentative. Deliberately dropping your pitch into the full stop is the fastest single fix available in one evening.

Fillers ("like", "sort of", "you know") aren't a speech defect; they're pause-filling. Remove the fear of silence and they leave on their own. Hunting them from a list usually just adds tension.

## Gesture and gaze

A gesture works when it arrives just before or with the word, and hurts when it lags behind. Keep hands free at waist height — not pocketed, not clasped. Clasped hands report defensiveness to the room even when you're calm. Move your gaze in segments: three or four seconds on one person, then move. Skimming across heads reads as no contact at all.

## Exercise (20 minutes, today)

1. **3 minutes.** Breath: 10 cycles of in for 4 counts, out for 8, palm on the belly. Then say one long sentence complete on a single out-breath.
2. **5 minutes.** Read any paragraph aloud slowly with exaggerated articulation — half your normal pace. Watch the word endings.
3. **7 minutes.** Record 2 minutes of your talk. Listen back with a stopwatch and count three things: words per minute, pauses longer than two seconds, sentences that ended on a rising tone. Write the three numbers down.
4. **5 minutes.** Second take of the same passage with one job: three deliberate pauses and a falling tone at every full stop. Compare the numbers.

Do this four days running, keeping the numbers in a column. Progress in craft is only visible as a trend; from a single recording you'll conclude nothing is changing.

No group is needed here at all — a recorder is more honest than any listener. A coach becomes useful later, once the basics exist and the work is nuance.

## In closing

Delivery is the most mechanical part of this course and the fastest to repay: three weeks at twenty minutes a day produce an audible difference. But technique adds nothing to substance. It only removes the interference between what you understood and what the room heard.`,
  },
  'memory': {
    ru: `Заученный наизусть текст ломается на первой же неожиданности: сбился порядок слов — и говорящий останавливается, ищет пропавшую фразу и теряет зал. Смысловая память ведёт себя иначе: забыв формулировку, вы говорите то же самое другими словами, и никто в зале ничего не замечает. Этот урок про то, как перейти от первого способа ко второму.

## Почему зубрёжка подводит

Дословное заучивание создаёт цепочку: каждое слово держится за предыдущее. Порвите звено — рассыпается остаток. Вдобавок такой текст слышно: интонация становится ровной, взгляд уходит внутрь, паузы встают не по смыслу, а там, где кончился выученный кусок.

Есть два места, где дословность оправдана и даже необходима: первая фраза и последняя. Их стоит знать наизусть — они снимают тревогу на старте и не дают речи развалиться на финише. Всё между ними лучше держать смыслом.

## Опоры: скелет, образы, места

**Скелет.** Сведите речь к списку из 5-9 утверждений — по одному на блок. Это и есть то, что вы обязаны помнить. Всё остальное вырастает из них при говорении, потому что материал вы собирали сами и знаете больше, чем скажете.

**Образы.** Абстрактный пункт запоминается плохо, картинка — хорошо. «Согласования затянулись» превратите в конкретную сцену: стопка бумаг, конкретный кабинет, конкретный день. Вы вспоминаете сцену — фраза приходит следом.

**Места.** Античная мнемотехника, дошедшая до нас как «дворец памяти», работает и сегодня: разложите свои 5-9 опор по знакомому маршруту — прихожая, кухня, окно, стол — и мысленно пройдите его. Порядок мест удерживает порядок мыслей. Метод древний, бесплатный и надёжный.

**Ключевые слова на бумаге.** Одна карточка, 5-9 слов, крупно. Не текст — именно слова. Карточка в руке снимает страх «а вдруг забуду» лучше, чем полный распечатанный текст, в котором вы всё равно не найдёте нужную строку.

## Повторение, которое работает

Три вещи повышают отдачу от повторов.

**Вслух, а не глазами.** Чтение про себя создаёт иллюзию знания. Проговаривание вслух задействует то же, что и выступление.

**По памяти, а не по тексту.** Попытка вспомнить закрепляет сильнее, чем перечитывание. Вспомнили с трудом — значит, повтор сработал.

**С промежутками.** Три подхода в разные дни дают больше, чем девять подряд в один вечер. Разумная схема на неделю: сегодня, завтра, через два дня, накануне.

И одно правило против самообмана: повторяйте стоя и вслух, в полный голос. Речь, отрепетированная сидя и шёпотом, в зале ведёт себя как незнакомая.

## Упражнение (25 минут, сегодня)

1. **5 минут.** Выпишите скелет: 7 утверждений, по одному на блок, каждое не длиннее строки.
2. **5 минут.** К каждому подберите один зрительный образ — конкретную сцену, а не символ. Запишите двумя-тремя словами рядом.
3. **5 минут.** Разложите 7 образов по знакомому маршруту в своей квартире. Пройдите маршрут мысленно дважды: вперёд и назад. Назад — обязательно, это ловит слабые звенья.
4. **7 минут.** Не глядя в записи, наговорите речь на диктофон целиком. Где встали — не подглядывайте, идите дальше своими словами.
5. **3 минуты.** Прослушайте и отметьте места провалов. Их обычно два-три. Именно к ним нужен образ покрепче, а не лишний повтор.

Повторите цикл 4 и 5 завтра и послезавтра — на третий день провалов почти не остаётся.

Группа тут даёт одно преимущество: слушатель может перебить вас вопросом посередине, и вы проверите, умеете ли вернуться в маршрут. В одиночку это имитируется будильником, поставленным на случайную минуту.

## Итог

Цель — не воспроизвести текст, а знать материал настолько, чтобы речь собиралась заново каждый раз. Такая речь чуть менее гладкая и заметно более живая, а слушатель почти всегда выбирает живое.`,
    en: `A word-for-word memorised text breaks at the first surprise: the order slips, the speaker stops, hunts for the missing phrase, and loses the room. Meaning-based memory behaves differently — forget the wording and you say the same thing in other words, and nobody notices. This lesson is about moving from the first mode to the second.

## Why rote fails

Verbatim memorising builds a chain where each word hangs off the previous one. Break a link and the remainder scatters. It also shows: the intonation flattens, the gaze turns inward, and pauses land where a memorised chunk ended rather than where the meaning did.

Two places justify word-for-word memory, and there it's genuinely useful: the first sentence and the last. Know those cold — they defuse the opening nerves and stop the ending from dissolving. Everything between is better held as meaning.

## Anchors: skeleton, images, places

**Skeleton.** Reduce the talk to 5-9 claims, one per block. That is what you're obliged to remember. The rest regrows in the moment, because you gathered the material yourself and know more than you'll say.

**Images.** An abstract point is remembered badly; a picture well. Turn "the approvals dragged on" into a specific scene: the stack of paper, the particular room, the particular day. You recall the scene and the sentence follows.

**Places.** The ancient technique that reached us as the "memory palace" still works: lay your 5-9 anchors along a familiar route — hallway, kitchen, window, desk — and walk it mentally. The order of places holds the order of thoughts. Two thousand years old, free, and reliable.

**Keywords on paper.** One card, 5-9 words, written large. Words, not sentences. A card in your hand kills the "what if I blank" fear better than a full printout, in which you'd never find the right line anyway.

## Rehearsal that pays

Three things raise the return on repetition.

**Aloud, not by eye.** Silent reading creates the illusion of knowing. Speaking aloud engages what performance engages.

**From memory, not from the page.** The effort of retrieval fixes material far better than rereading. If recall was hard, the rep worked.

**Spaced.** Three passes on different days beat nine in one evening. A sane week: today, tomorrow, two days later, the night before.

And one rule against self-deception: rehearse standing, at full voice. A talk rehearsed sitting down and half-whispered arrives in the room as something unfamiliar.

## Exercise (25 minutes, today)

1. **5 minutes.** Write the skeleton: 7 claims, one per block, none longer than a line.
2. **5 minutes.** Attach one visual image to each — a concrete scene, not a symbol. Note it in two or three words alongside.
3. **5 minutes.** Distribute the 7 images along a familiar route through your home. Walk it mentally twice, forwards and backwards. Backwards matters — it catches the weak links.
4. **7 minutes.** Without looking at any notes, record the whole talk. Where you stall, don't peek; keep going in your own words.
5. **3 minutes.** Listen back and mark the collapse points. There are usually two or three. Those need a stronger image, not another repetition.

Repeat steps 4 and 5 tomorrow and the day after. By the third day the collapses are mostly gone.

A group offers one advantage here: a listener can interrupt with a question mid-talk, testing whether you can find your way back to the route. Alone, an alarm set for a random minute imitates it well enough.

## In closing

The goal isn't to reproduce a text but to know the material well enough that the talk reassembles itself each time. Such a talk is slightly less polished and noticeably more alive, and audiences choose alive almost every time.`,
  },
  'audience': {
    ru: `Речь — не трансляция, а обмен, даже когда говорит один человек. Зал всё время отвечает: позами, тишиной определённого качества, движением к телефонам. Слушать эти ответы и реагировать на них — навык, отдельный от умения говорить, и осваивается он последним, потому что требует внимания, свободного от текста. Свободным оно становится только тогда, когда подготовка, план и опоры уже сделали свою работу.

## Контакт с самого начала

Контакт устанавливается в первые полминуты и почти целиком через две вещи: взгляд и то, что вы говорите первым. Найдите в зале три-четыре точки в разных секторах и говорите поочерёдно людям, а не пространству. Три-четыре секунды на человека — это одна законченная фраза; смена на каждом слове читается как беспокойство.

Первая фраза должна говорить о слушателе, а не о вас. «Спасибо, что пригласили, я немного волнуюсь» — про вас. Конкретный вопрос, случай или цифра, задевающая их положение дел, — про них. Обозначить регламент полезно и дёшево: «Семь минут, вопросы в конце» снимает у зала фоновую неопределённость.

## Чтение зала

Наблюдайте за тремя сигналами. Взгляды: подняты — вас слушают; опущены в устройства — потеряли нить, чаще всего на переходе. Позы: корпус вперёд — интерес, откинутые назад и скрещённые руки — сомнение, но не обязательно несогласие. Тишина: живая тишина плотная, мёртвая — рассеянная, и разница слышна, когда вы её однажды заметили.

Реакция на потерю внимания у вас всего одна и очень надёжная: вернуться к конкретности. Пример, цифра, короткий случай, обращённый вопрос. Не громче, не быстрее — конкретнее. Ускорение отдаляет ещё сильнее.

## Вопросы и возражения

Вопрос — не помеха, а подарок: он показывает, где вас не поняли, и делает разговор двусторонним. Работающий порядок из четырёх шагов: дослушайте до конца, не перебивая; повторите вопрос своими словами («правильно ли я понял: вас беспокоит, что…»); ответьте коротко; спросите, ответили ли вы. Повтор вопроса даёт вам две секунды на мысль, а спрашивающему — уверенность, что его услышали.

Не знаете ответа — скажите это прямо и назовите, когда ответите. «Не знаю, посмотрю и напишу до пятницы» стоит дороже любой импровизации: импровизацию проверят, и второй раз вам поверят меньше.

Возражение по существу отделяйте от эмоции. Согласитесь с той частью, где собеседник прав, — это не уступка, а точность. Затем возражайте по конкретному пункту. Спор с человеком вместо спора с утверждением проигрывается даже при вашей правоте, потому что зал встаёт на сторону того, на кого давят.

С агрессией работает то же самое плюс температура: отвечайте на полтона тише и медленнее, чем к вам обратились. Это не слабость, а отказ от эскалации, и зал считывает его правильно.

## Упражнение (20 минут, сегодня)

1. **7 минут.** Выпишите 5 самых неудобных вопросов, которые вам могут задать. Ровно тех, которых вы не хотите. Именно они и прозвучат.
2. **8 минут.** Запишите на диктофон ответ на каждый: по 60-90 секунд, по схеме «повторил — ответил — проверил». Не пишите текст заранее, отвечайте с ходу.
3. **5 минут.** Прослушайте и отметьте, где вы начали оправдываться, а где ответили. Разница слышна по длине: оправдание всегда длиннее ответа.

Делайте это перед каждым выступлением — список из пяти вопросов снимает больше тревоги, чем ещё один прогон текста.

Группа полезна здесь по-настоящему: попросите двоих задать вам эти вопросы вслух, один из них — недоброжелательно. Живой недружелюбный тон нельзя воспроизвести самому. Если группы нет, отвечайте стоя и вслух — этого хватит на девять десятых эффекта.

## Итог

Работа с аудиторией сводится к одному решению, принимаемому заранее: вы вышли, чтобы им было полезно, или чтобы вам было хорошо. Первое видно по тому, что вы замедляетесь на непонятном, признаёте незнание и отвечаете на вопрос, который задали, а не на удобный. Это и есть та часть девиза, ради которой всё остальное: за человеком идут не потому, что он всех переспорил, а потому, что рядом с ним думается яснее.`,
    en: `A talk is an exchange, not a broadcast, even when one person is speaking. The room answers continuously — with posture, with a particular quality of silence, with hands drifting toward phones. Hearing those answers is a separate skill from speaking, and it comes last, because it needs attention that isn't busy with the text. Attention only frees up once preparation, structure, and anchors have done their work.

## Contact from the first seconds

Contact is made in the first half-minute, almost entirely through two things: your gaze and your first sentence. Find three or four points across different sectors of the room and speak to people in turn, not to the space. Three or four seconds each is roughly one complete sentence; switching every word reads as anxiety.

The first sentence should be about the listener, not you. "Thanks for having me, I'm a little nervous" is about you. A specific question, case, or number touching their situation is about them. Stating the shape of the thing is cheap: "Seven minutes, questions at the end" removes a layer of background uncertainty.

## Reading the room

Watch three signals. Eyes: up means you have them; down into devices means the thread was lost, usually at a transition. Posture: leaning in is interest; leaning back with folded arms is doubt, though not necessarily disagreement. Silence: live silence is dense, dead silence is diffuse, and the difference is unmistakable once you've noticed it.

You have one reliable response to lost attention: return to the concrete. An example, a figure, a short incident, a question aimed at them. Not louder, not faster — more concrete. Speeding up pushes them further away.

## Questions and objections

A question is a gift, not an interruption: it shows where you weren't understood. A four-step order that works: hear it out without interrupting; restate it in your own words ("so if I've got it right, the worry is that…"); answer briefly; ask whether that answered it. The restatement buys you two seconds of thought and gives the asker proof of being heard.

If you don't know, say so and name when you'll respond. "I don't know — I'll check and write to you by Friday" beats any improvisation. Improvisation gets checked, and next time you're believed less.

Separate the substance of an objection from its heat. Agree with the part where the other person is right — that's precision, not concession. Then disagree on the specific point. Arguing with a person instead of a claim loses even when you're correct: the room sides with whoever is being pushed.

Hostility takes the same approach plus temperature: answer half a tone quieter and slower than you were addressed. That isn't weakness, it's declining to escalate, and rooms read it correctly.

## Exercise (20 minutes, today)

1. **7 minutes.** Write down the 5 most uncomfortable questions you could be asked. Exactly the ones you'd rather avoid — those are the ones that get asked.
2. **8 minutes.** Record an answer to each: 60-90 seconds, following restate–answer–check. Don't script them; answer cold.
3. **5 minutes.** Listen back and mark where you started justifying yourself versus where you actually answered. Length gives it away: justification always runs longer than an answer.

Do this before every talk. Five hard questions remove more anxiety than another run-through of the text.

A group genuinely helps here: ask two people to put those questions to you aloud, one of them unkindly. A live unfriendly tone can't be self-generated. Without a group, answer standing and out loud — that gets you nine-tenths of the benefit.

## In closing

Working with an audience reduces to one decision made in advance: did you get up so it would be useful to them, or so it would feel good to you. The first shows in the details — you slow down where you weren't clear, you admit what you don't know, and you answer the question that was asked rather than the convenient one. That's the part of the motto everything else serves: people follow someone not because he out-argued the room, but because thinking is clearer near him.`,
  },
}

/** Проза урока на нужном языке или null, если урок ещё не написан. */
export function getSpeechProse(slug: string, locale: Locale): string | null {
  const body = SPEECH_PROSE[slug]?.[locale]?.trim()
  return body ? body : null
}

/** Slug'и уроков, у которых есть проза на обоих языках (для generateStaticParams). */
export function writtenSpeechSlugs(): string[] {
  return Object.entries(SPEECH_PROSE)
    .filter(([, bi]) => bi.ru.trim().length > 0 && bi.en.trim().length > 0)
    .map(([slug]) => slug)
}
