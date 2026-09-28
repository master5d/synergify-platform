// lib/eidetics/lessons.ts
// Проза уроков «Эйдетики». Как у скорочтения: структура — course.ts, проза — здесь.
// 2026-09-28: ЧЕРНОВИК агента по решению владельца («сделай черновик и вычитку»), ждёт вычитки;
// статус модуля — 'soon', пока владелец не скажет иначе. Опорные тезисы и источники — в спеке
// docs/superpowers/specs/2026-09-28-eidetics.md. Текст оригинальный, ни фразы из чужих курсов.
// Утверждения об эффективности — только со ссылкой на источник спеки. Урок 4: RU — буквенно-цифровой
// код школы Козаренко (устоявшаяся русская таблица, пересказ своими словами), EN — «Major system»
// (англоязычная традиция); обе помечены как практика без сильной доказательной базы.
// Проза проходит lintDehustle и манифест обещаний — см. lessons.test.ts.
// Пустая строка = урок ещё не написан: страница урока такой slug не создаёт.
import type { Bi } from '../speedreading/bi'
import type { Locale } from '../dictionaries'

export const EIDETICS_PROSE: Record<string, Bi> = {
  images: {
    ru: `Память охотнее держит то, что можно увидеть, услышать или потрогать, чем голое слово. На этом стоят все приёмы модуля: цепочка, дворец памяти, коды чисел, имена. Поэтому первый урок — про сырьё: как превратить слово или мысль в образ, за который память может зацепиться, и как связать два образа так, чтобы один вытаскивал другой. Но начнём с замера: чтобы потом понять, помогает ли тебе хоть что-то, нужна точка «до».

## Почему образ держится лучше слова

Канадский психолог Аллан Пайвио предложил теорию двойного кодирования (Paivio 1971): конкретное слово вроде «яблоко» хранится двумя путями — как слово и как картинка, а абстрактное вроде «польза» — в основном одним. Отсюда объяснение давно замеченного факта: конкретные слова в опытах запоминаются лучше абстрактных.

Важная оговорка. Это теория, которая объясняет, почему образные приёмы вообще могут работать, а не проверка какого-то приёма. В большом обзоре учебных техник (Dunlosky 2013) «образы» как отдельный приём получили низкую оценку полезности: они помогают со списками конкретных слов и мало — со сложными учебными текстами. Образ — кирпич. Работать он начинает в конструкции, о которой следующие уроки.

## Какой образ держится

Хороший образ отвечает на вопрос «что именно я вижу?» одной конкретной сценой.

Конкретность. Не «фрукт» и даже не «яблоко вообще», а одно зелёное яблоко с вмятиной на боку.

Преувеличение. Яблоко размером с табуретку запоминается лучше, чем обычное: необычное выделяется на фоне привычного.

Движение. Катящееся, лопающееся, падающее держится лучше неподвижного.

Другие чувства. Хруст, запах, тяжесть в руке — каждая такая деталь добавляет ещё одну зацепку.

Ты в сцене. Если яблоко катится тебе под ноги, это твоё событие, а не картинка из учебника.

Абстрактное слово переводят в конкретное двумя способами. По смыслу: «свобода» — распахнутая дверца клетки, «время» — песочные часы. По созвучию: «тенденция» — тент, «аргумент» — аргонавт на корабле. Созвучие кажется глупым, и это нормально: образ никто, кроме тебя, не увидит, ему нужно быть не красивым, а цепким.

## Как связать два образа

Два образа, которые просто стоят рядом, в памяти не склеиваются. Их нужно заставить взаимодействовать: один что-то делает с другим. «Кот» и «зонт» — не кот возле зонта, а кот, который раскрыл зонт лапой, и порыв ветра поднимает его над крышей. Проверка связи простая: подумай о первом образе — второй появляется сам или его приходится искать?

Не у всех внутренние картинки яркие, и это нормально. Приёму нужен не чёткий «кадр», а конкретная деталь, которую можно назвать словами: что это, какого размера, что с ним происходит.

## Упражнение

Сегодня, 20 минут, плюс одна короткая проверка позже.

1. Замер «до». Открой \`/trenazhery/eidetika/ryad/\`, выбери слова и длину 10. Запоминай как обычно, без приёмов из этого урока, и сразу проверь себя. Через час или завтра пройди отложенную проверку этого ряда. Запиши обе цифры — это твоя точка отсчёта.
2. Возьми новый ряд из 10 слов (новый ряд в тренажёре или любые 10 слов из книги). На каждое слово — образ за 10–15 секунд. Запиши одной строкой, что ты видишь: не «кот», а «рыжий кот с порванным ухом».
3. Разбей слова на пары: первое со вторым, третье с четвёртым и так далее. Для каждой пары сделай сцену, где один образ что-то делает с другим.
4. Через час закрой записи. Называй первое слово каждой пары и вспоминай второе. Отметь, какие пары выпали, и посмотри на их образы: чаще всего там не было действия.
5. Ряд целиком по порядку пока не собирай — это задача следующего урока.

## Что это даёт и чего не даёт

Урок даёт навык, на котором держится всё остальное: быстро превращать слово в сцену и сцеплять сцены попарно. Сначала это медленно, 10–15 секунд на слово — нормальный темп новичка.

Чего не даёт. Отдельные образы не хранят порядок: пары ты вспомнишь, а ряд — нет. На сложном связном тексте образы помогают мало, это видно и в обзоре Dunlosky 2013. И главное: результат замера «до» — не приговор и не норма, с которой надо сравнивать других. Сравнивать в этом модуле можно только себя с собой.

## Источники

1. Paivio A. (1971). Imagery and Verbal Processes. Holt, Rinehart & Winston.
2. Dunlosky J. et al. (2013). Improving students' learning with effective learning techniques. Psychological Science in the Public Interest 14(1), 4–58. doi:10.1177/1529100612453266`,
    en: `Memory holds on more readily to what can be seen, heard or touched than to a bare word. Every technique in this module rests on that: the chain, the memory palace, number codes, names. So the first lesson is about raw material — how to turn a word or an idea into an image memory can hook onto, and how to link two images so that one pulls out the other. But we start with a measurement: to find out later whether anything helps you at all, you need a "before" point.

## Why an image holds better than a word

The Canadian psychologist Allan Paivio proposed dual-coding theory (Paivio 1971): a concrete word like "apple" is stored in two ways, as a word and as a picture, while an abstract one like "benefit" is stored mostly in one. That offers an explanation for a long-observed fact: in experiments, concrete words are remembered better than abstract ones.

An important caveat. This is a theory that explains why imagery techniques can work at all, not a test of any particular technique. In a large review of learning techniques (Dunlosky 2013), imagery used on its own was rated low in utility: it helps with lists of concrete words and does little for complex study texts. An image is a brick. It starts working inside a structure, which is what the next lessons are about.

## What makes an image stick

A good image answers the question "what exactly do I see?" with one concrete scene.

Concreteness. Not "a fruit", not even "an apple in general", but one green apple with a dent in its side.

Exaggeration. An apple the size of a stool is remembered better than an ordinary one: the unusual stands out against the familiar.

Movement. Something rolling, bursting or falling holds better than something still.

Other senses. A crunch, a smell, the weight in your hand — each detail adds another hook.

You in the scene. If the apple rolls under your feet, it is your event, not a picture from a textbook.

Abstract words are turned into concrete ones in two ways. By meaning: "freedom" becomes a cage door swung open, "time" an hourglass. By sound: "tendency" becomes a tent, "argument" an Argonaut on a ship. Sound-alikes feel silly, and that is fine: nobody but you will see the image, and it needs to be sticky, not beautiful.

## How to link two images

Two images simply standing side by side do not bond in memory. They have to interact: one does something to the other. "Cat" and "umbrella" is not a cat next to an umbrella, but a cat that has opened the umbrella with its paw as a gust of wind lifts it over a roof. The test of a link is simple: think of the first image — does the second appear by itself, or do you have to search for it?

Not everyone's inner pictures are vivid, and that is fine. The technique needs not a sharp "frame" but a concrete detail you can put into words: what it is, how big, what is happening to it.

## Exercise

Today, 20 minutes, plus one short check later.

1. The "before" measurement. Open \`/en/trenazhery/eidetika/ryad/\`, choose words and length 10. Memorise the way you normally would, without anything from this lesson, and check yourself right away. An hour later or tomorrow, take the delayed check for that series. Write down both numbers — that is your starting point.
2. Take a new series of 10 words (a new series in the trainer, or any 10 words from a book). Give each word an image in 10–15 seconds. Write down in one line what you see: not "cat" but "ginger cat with a torn ear".
3. Split the words into pairs: first with second, third with fourth, and so on. For each pair make a scene in which one image does something to the other.
4. An hour later, close your notes. Say the first word of each pair and recall the second. Mark which pairs dropped out and look at their images: most often there was no action in them.
5. Do not try to rebuild the whole series in order yet — that is the job of the next lesson.

## What this gives you, and what it does not

This lesson gives you the skill everything else rests on: quickly turning a word into a scene and hooking scenes together in pairs. At first it is slow; 10–15 seconds per word is a normal beginner's pace.

What it does not give you. Separate images do not store order: you will recall the pairs but not the series. With complex connected text, images help little, which is also what the Dunlosky 2013 review shows. And most importantly: your "before" score is not a verdict and not a norm to compare other people against. In this module the only comparison is you against yourself.

## Sources

1. Paivio A. (1971). Imagery and Verbal Processes. Holt, Rinehart & Winston.
2. Dunlosky J. et al. (2013). Improving students' learning with effective learning techniques. Psychological Science in the Public Interest 14(1), 4–58. doi:10.1177/1529100612453266`,
  },
  chain: {
    ru: `В прошлом уроке образы складывались в пары. Но пары не помнят порядок: ты вспомнишь, что кот связан с зонтом, и не вспомнишь, что было до кота. Этот урок — про то, как из разрозненных образов сделать одну нить, по которой ряд вспоминается с начала до конца.

## Опыт с историями

Классическая проверка приёма — опыт Бауэра и Кларк (Bower & Clark 1969). Студенты учили двенадцать списков по десять существительных. Одной группе предложили на каждый список сочинить короткую историю, в которой слова идут по порядку; другая группа учила списки как обычно, времени у обеих было поровну. Сразу после каждого списка обе группы вспоминали его почти полностью. Разница проявилась в конце, когда нужно было вспомнить все двенадцать списков: группа историй назвала около 93 % слов, контрольная — около 13 %.

Цифры впечатляют, но важно, что именно они описывают: студентов, списки конкретных слов, лабораторию и отложенную проверку в конце опыта. Твой результат будет другим, и его стоит мерить самому — для этого в тренажёре есть отложенная проверка.

## Цепочка и история — не одно и то же

Цепочка — это пары, сцепленные внахлёст: первое со вторым, второе с третьим, третье с четвёртым. Она проста, но рвётся в самом слабом звене: забыл одну сцену — потерял всё, что после неё.

История держится крепче: в ней есть герой и события, которые вытекают друг из друга. Даже если одна сцена побледнела, логика сюжета подсказывает, что было дальше: герой не мог оказаться на крыше, не поднявшись по лестнице.

## Как строить историю

Один герой на весь ряд. Им можешь быть ты сам или любой персонаж, который легко представить.

Каждое слово — видимое событие, а не упоминание. Не «он подумал о маяке», а «он забрался на маяк».

Переходы через действие. Следующий образ появляется потому, что что-то произошло с предыдущим.

Никаких лишних деталей. Каждая дополнительная подробность — тоже то, что придётся помнить.

Пример ряда: маяк, перчатка, суп, скрипка, облако. Ты взбираешься на маяк, и на верхней ступеньке лежит огромная кожаная перчатка. Ты надеваешь её — она полна горячего супа, суп выплёскивается прямо на скрипку, которая лежит у стены. Скрипка начинает играть сама, и от звука над маяком собирается облако. Нелепо — и хорошо: нелепое отличается от обычного и потому заметно.

## Упражнение

Сегодня, 20–25 минут, плюс отложенная проверка.

1. Открой \`/trenazhery/eidetika/ryad/\`, слова, длина 10. Сначала на каждое слово сделай образ, как в прошлом уроке, затем свяжи их в одну историю по порядку. Времени бери столько, сколько нужно: скорость сейчас не важна.
2. Воспроизведи ряд, пройдя историю в голове от начала до конца. Посмотри на две цифры тренажёра: сколько названо и сколько на своём месте.
3. Через час или больше пройди отложенную проверку этого ряда, не перечитывая историю заранее.
4. Если на 10 словах обе проверки прошли спокойно, в следующий раз возьми 15.
5. Сравни с замером «до» из первого урока. Смотри прежде всего на отложенную проверку: именно она показывает, держится ли.

## Что это даёт и чего не даёт

История даёт порядок и заметно облегчает отложенное вспоминание — в опыте Bower & Clark разница была именно там. Ей почти не нужна подготовка: только воображение и немного времени.

Чего не даёт. Вспоминать с середины неудобно: чтобы добраться до седьмого слова, приходится пересказать шесть. Две истории, построенные в один день, легко путаются между собой. Длинные ряды дают длинную и хрупкую историю. Для этих задач есть следующий приём — метод локусов.

## Источники

1. Bower G.H., Clark M.C. (1969). Narrative stories as mediators for serial learning. Psychonomic Science 14, 181–182. doi:10.3758/BF03332778`,
    en: `In the previous lesson images came together in pairs. But pairs do not remember order: you will recall that the cat goes with the umbrella and not what came before the cat. This lesson is about turning scattered images into one thread along which a series can be recalled from start to finish.

## An experiment with stories

The classic test of this technique is the study by Bower and Clark (Bower & Clark 1969). Students learned twelve lists of ten nouns each. One group was asked to make up a short story for each list, with the words in order; the other group learned the lists the usual way, and both had the same amount of time. Right after each list, both groups recalled it almost completely. The difference appeared at the end, when all twelve lists had to be recalled: the story group named about 93% of the words, the control group about 13%.

The numbers are impressive, but it matters what they describe: students, lists of concrete words, a laboratory, and a delayed check at the end of the session. Your result will be different, and it is worth measuring yourself — that is what the trainer's delayed check is for.

## A chain and a story are not the same thing

A chain is a set of overlapping pairs: first with second, second with third, third with fourth. It is simple, but it breaks at its weakest link: forget one scene and you lose everything after it.

A story holds more firmly: it has a hero and events that follow from each other. Even if one scene fades, the logic of the plot suggests what came next: the hero could not be on the roof without climbing the ladder.

## How to build a story

One hero for the whole series. It can be you or any character that is easy to picture.

Every word is a visible event, not a mention. Not "he thought about a lighthouse" but "he climbed the lighthouse".

Transitions through action. The next image appears because something happened to the previous one.

No extra details. Every additional detail is one more thing to remember.

An example series: lighthouse, glove, soup, violin, cloud. You climb the lighthouse, and on the top step lies a huge leather glove. You put it on — it is full of hot soup, and the soup splashes right onto a violin lying by the wall. The violin starts playing by itself, and at the sound a cloud gathers over the lighthouse. Absurd — and good: the absurd differs from the ordinary, and so it stands out.

## Exercise

Today, 20–25 minutes, plus the delayed check.

1. Open \`/en/trenazhery/eidetika/ryad/\`, words, length 10. First make an image for each word, as in the previous lesson, then link them into one story in order. Take as long as you need: speed does not matter yet.
2. Recall the series by walking through the story in your head from beginning to end. Look at the trainer's two numbers: how many recalled and how many in the right place.
3. An hour or more later, take the delayed check for that series without rereading the story first.
4. If both checks went smoothly with 10 words, take 15 next time.
5. Compare with your "before" measurement from the first lesson. Look at the delayed check first: that is the one that shows whether it holds.

## What this gives you, and what it does not

A story gives you order and makes delayed recall noticeably easier — in the Bower & Clark study, that is exactly where the difference was. It needs almost no preparation: just imagination and a little time.

What it does not give you. Recalling from the middle is awkward: to get to the seventh word you have to retell six. Two stories built on the same day easily get mixed up. Long series make a long and fragile story. For these problems there is the next technique — the method of loci.

## Sources

1. Bower G.H., Clark M.C. (1969). Narrative stories as mediators for serial learning. Psychonomic Science 14, 181–182. doi:10.3758/BF03332778`,
  },
  loci: {
    ru: `У истории из прошлого урока есть слабое место: она держит порядок, но не даёт опоры, если сюжет оборвался. Метод локусов решает это иначе. Опора — не придуманный сюжет, а маршрут, который ты и так знаешь наизусть: своя квартира, дорога, двор. Ты мысленно раскладываешь образы по точкам этого маршрута, а потом проходишь его ещё раз и собираешь то, что оставил.

## Что показывают исследования

Этот приём проверен лучше остальных в модуле.

Магуайр с коллегами (Maguire 2003) сравнили участников соревнований по запоминанию с обычными людьми. По результатам тестов на интеллект и по строению мозга «чемпионы» от контрольной группы не отличались. Отличалось другое: девять из десяти пользовались методом локусов, и при запоминании у них сильнее работали области мозга, связанные с пространственной памятью и ориентированием. Вывод исследования — выдающиеся результаты в запоминании идут от приёма, а не от особой памяти.

Дреслер с коллегами (Dresler 2017) проверили, можно ли этому научить новичка. Люди без опыта шесть недель тренировали метод локусов примерно по полчаса в день. Число слов, которые они запоминали из списка в 72 слова, выросло примерно с 26 до 62. Группы, которые тренировали рабочую память или не тренировались вовсе, такого роста не показали. Через четыре месяца значительная часть прироста у тренировавшихся сохранялась. Повторный анализ тех же участников (Wagner 2021) подтвердил, что память держалась месяцами, а мозг при запоминании работал экономнее.

Две оговорки. Это были добровольцы, которые шесть недель занимались ежедневно по программе. И проверяли их на списках слов — на том, для чего приём и создан.

## Как выбрать маршрут

Маршрут, который ты знаешь без усилий. Пройти его в памяти должно быть так же легко, как дома найти выключатель в темноте.

Точки по порядку и в одном направлении. Прихожая, вешалка, зеркало, дверь в кухню, плита — и дальше, никогда не назад.

Разные точки. Два одинаковых стула подряд — плохой выбор: образы на них перепутаются.

Заметные места, а не пустоты. Стол, окно, ванна — да; «середина коридора» — хуже.

Для начала хватит десяти точек. Больше не нужно, пока десять не проходятся уверенно.

## Как класть образ на место

Образ должен взаимодействовать с точкой так же, как в прошлых уроках образы взаимодействовали друг с другом. Не «на плите лежит перчатка», а «перчатка горит на конфорке, и в кухне пахнет палёной кожей». Проходя маршрут потом, ты не ищешь слово — ты смотришь на плиту, и она показывает, что на ней случилось.

Одна точка — один образ. Когда освоишься, можно класть по два, но не в начале.

## Маршрут используется снова

Один и тот же маршрут можно заполнять много раз. Через день-два старые образы бледнеют, и точки освобождаются. Если нужно держать два ряда одновременно, заведи второй маршрут: например, квартиру для одного и дорогу к остановке для другого.

## Упражнение

Сегодня, 25–30 минут, плюс отложенная проверка.

1. Открой \`/trenazhery/eidetika/dvorec/\` и запиши свой маршрут: 10 точек по порядку. Маршрут хранится только в этом браузере.
2. Закрой глаза и пройди маршрут дважды, не открывая список. Если какая-то точка всплывает с трудом, замени её на более заметную.
3. Запусти тренировку дворца: разложи слова по точкам и пройди маршрут. Не торопись, скорость сейчас не важна.
4. Затем открой \`/trenazhery/eidetika/ryad/\`, слова, длина 10 или 15, и разложи ряд по тому же маршруту. Через час или больше пройди отложенную проверку.
5. Сравни с историей из прошлого урока. Какой приём держался лучше именно у тебя?

## Что это даёт и чего не даёт

Метод локусов даёт порядок и доступ с любого места: чтобы вспомнить седьмое слово, достаточно мысленно подойти к седьмой точке. Он лучше других приёмов модуля подтверждён исследованиями — Dresler 2017, Wagner 2021.

Чего не даёт. Он требует подготовки: маршрут нужно завести и пройти несколько раз до работы с ним. Новички в исследовании тренировались неделями, а не один вечер. Лучше всего он подходит для рядов — слов, пунктов, чисел, — и хуже для смысла связного текста, где важны отношения между идеями. И он не улучшает память вообще: участники Maguire 2003 не отличались особой памятью, у них был отработанный приём.

## Источники

1. Maguire E.A. et al. (2003). Routes to remembering: the brains behind superior memory. Nature Neuroscience 6(1), 90–95. doi:10.1038/nn988
2. Dresler M. et al. (2017). Mnemonic training reshapes brain networks to support superior memory. Neuron 93(5), 1227–1235. doi:10.1016/j.neuron.2017.02.003
3. Wagner I.C., Konrad B.N., Schuster P. et al. (2021). Durable memories and efficient neural coding through mnemonic training using the method of loci. Science Advances 7(10), eabc7606. doi:10.1126/sciadv.abc7606`,
    en: `The story from the previous lesson has a weak spot: it keeps order, but gives you nothing to stand on once the plot breaks. The method of loci solves this differently. The support is not an invented plot but a route you already know by heart: your home, a road, a yard. In your mind you place images at the points along that route, and later you walk it again and collect what you left.

## What the research shows

This technique is better tested than anything else in the module.

Maguire and colleagues (Maguire 2003) compared competitors in memory championships with ordinary people. On intelligence tests and in brain structure, the "champions" did not differ from the control group. Something else did: nine out of ten used the method of loci, and while memorising, brain regions linked to spatial memory and navigation were more active in them. The study's conclusion is that outstanding memorisation comes from technique, not from an unusual memory.

Dresler and colleagues (Dresler 2017) tested whether a newcomer can learn it. People with no experience trained the method of loci for six weeks, about half an hour a day. The number of words they remembered from a 72-word list rose from roughly 26 to roughly 62. Groups that trained working memory or did not train at all showed no such rise. Four months later, the trained group had kept a substantial part of the gain. A follow-up analysis of the same participants (Wagner 2021) confirmed that the memories lasted for months and that the brain worked more economically while memorising.

Two caveats. These were volunteers who practised daily on a programme for six weeks. And they were tested on word lists — exactly what the technique is made for.

## How to choose a route

A route you know without effort. Walking it in your mind should be as easy as finding the light switch at home in the dark.

Places in order and in one direction. Hallway, coat rack, mirror, kitchen door, stove — and onward, never back.

Distinct places. Two identical chairs in a row are a poor choice: the images on them will get mixed up.

Noticeable spots, not empty space. A table, a window, a bathtub — yes; "the middle of the corridor" — less so.

Ten places are enough to start. You do not need more until ten feel solid.

## How to place an image

The image should interact with the place, just as images interacted with each other in the earlier lessons. Not "a glove lies on the stove" but "a glove is burning on the hob, and the kitchen smells of scorched leather". When you walk the route later, you do not search for the word — you look at the stove, and it shows you what happened on it.

One place, one image. Once you are comfortable you can put two, but not at the start.

## A route can be reused

The same route can be filled many times. After a day or two the old images fade and the places free up. If you need to hold two series at once, set up a second route: say, your home for one and the road to the bus stop for the other.

## Exercise

Today, 25–30 minutes, plus the delayed check.

1. Open \`/en/trenazhery/eidetika/dvorec/\` and write down your route: 10 places in order. The route is stored only in this browser.
2. Close your eyes and walk the route twice without looking at the list. If a place comes up with difficulty, replace it with a more noticeable one.
3. Start a palace run: place the words at the points and walk the route. Do not hurry; speed does not matter yet.
4. Then open \`/en/trenazhery/eidetika/ryad/\`, words, length 10 or 15, and lay the series out along the same route. An hour or more later, take the delayed check.
5. Compare with the story from the previous lesson. Which technique held better for you in particular?

## What this gives you, and what it does not

The method of loci gives you order and access from any point: to recall the seventh word, you only need to walk up to the seventh place in your mind. Of all the techniques in this module it has the strongest research support — Dresler 2017, Wagner 2021.

What it does not give you. It takes preparation: the route has to be set up and walked a few times before you use it. The newcomers in the study trained for weeks, not for one evening. It suits series best — words, points, numbers — and fits less well with the meaning of connected text, where relations between ideas matter. And it does not improve memory in general: the participants in Maguire 2003 had no special memory, they had a well-practised technique.

## Sources

1. Maguire E.A. et al. (2003). Routes to remembering: the brains behind superior memory. Nature Neuroscience 6(1), 90–95. doi:10.1038/nn988
2. Dresler M. et al. (2017). Mnemonic training reshapes brain networks to support superior memory. Neuron 93(5), 1227–1235. doi:10.1016/j.neuron.2017.02.003
3. Wagner I.C., Konrad B.N., Schuster P. et al. (2021). Durable memories and efficient neural coding through mnemonic training using the method of loci. Science Advances 7(10), eabc7606. doi:10.1126/sciadv.abc7606`,
  },
  numbers: {
    ru: `Слово легко превратить в образ. С числом так не выйдет: «семьдесят девять» ничего не показывает. Поэтому для чисел нужен промежуточный шаг — код, который переводит цифры в согласные звуки, а согласные в слова. Дальше с этими словами работают как со всеми остальными: кладут в историю или на маршрут.

## Откуда этот приём и насколько он проверен

Сразу честно: это практика и традиция, а не метод с сильной доказательной базой. В англоязычной традиции такой код называют «Major system», или фонетической системой. Он давно известен и широко используется, но хороших контролируемых исследований именно этого приёма мало, и цифр эффекта мы приводить не будем.

Косвенно на принцип указывает другая работа. Эрикссон и Чейз (Ericsson & Chase 1982) описали студента, который за больше чем двести часов тренировок довёл число цифр, запоминаемых на слух, примерно с семи до почти восьмидесяти. Особой памяти у него не было: он был бегуном и превращал группы цифр во время забегов, то есть в то, что уже знал. Это не наш код, но тот же принцип — цифра получает смысл через знакомое. И там же видна граница: на буквах объём его памяти остался обычным.

## Русская таблица

Для русского языка устоялась своя таблица — буквенно-цифровой код из школы мнемотехники В. А. Козаренко (система «Джордано»). Её мы и берём, а не изобретаем новую: у неё есть учебник, упражнения и сообщество тех, кто ей пользуется. Каждой цифре в ней соответствуют две согласные:

0 — Н, М · 1 — Г, Ж · 2 — Д, Т · 3 — К, Х · 4 — Ч, Щ · 5 — П, Б · 6 — Ш, Л · 7 — С, З · 8 — В, Ф · 9 — Р, Ц.

Как её запомнить. У семи цифр первая буква совпадает с началом названия: Ноль, Два, Четыре, Пять, Шесть, Семь, Восемь. Остаётся выучить три — 1 (Г, Ж), 3 (К, Х), 9 (Р, Ц) — и вторые буквы. Придумай для них свои зацепки: например, Г похожа на единицу с флажком. Своя зацепка держится лучше чужой.

## Как число становится словом

Гласные, Й, Ь и Ъ не считаются — их вставляешь как угодно. В этой традиции число читают по первым согласным слова: для двузначного числа — по двум первым, остальные буквы не читаются. Примеры: 13 — гайка (Г, К), 25 — дуб (Д, Б), 35 — куб, 40 — чайник (Ч, Н), 50 — пень, 79 — сыр, 86 — вилка.

Для каждой пары цифр есть четыре сочетания согласных, поэтому слово почти всегда находится. Выбирай то, что легко увидеть: предмет или животное лучше, чем чувство или действие.

Длинное число режут на пары. 257935 — это 25, 79, 35: дуб, сыр, куб. Дальше как в прошлых уроках: с дуба свисает сыр, сыр падает на кубик и раскалывает его. Или раскладываешь три образа по первым трём точкам своего маршрута.

## Упражнение

Сегодня 25–30 минут, затем по 5 минут несколько дней.

1. Выучи таблицу: 10 минут. Выпиши её, закрой, восстанови по памяти, сверь. Повтори, пока не восстановишь без ошибок.
2. Составь слова для десяти двузначных чисел — любых, например от 10 до 19. Запиши по одному слову на число и больше его не меняй: постоянный словарь работает быстрее, чем каждый раз новое слово.
3. Открой \`/trenazhery/eidetika/ryad/\`, режим цифр, длина 10. Разбей ряд на пять пар, каждую переведи в слово, слова свяжи историей или положи на маршрут. Проверь сразу и через час или больше.
4. Не беспокойся, если сначала выходит медленнее, чем просто повторять цифры. Код окупается позже, когда словарь пар уже готов.
5. В следующие дни дополняй словарь по десять чисел за раз.

## Что это даёт и чего не даёт

Код даёт способ превратить число в образ и дальше работать с ним приёмами, которые ты уже знаешь. Он полезен, когда число длинное или его надо держать долго.

Чего не даёт. Доказательств эффективности именно этой системы мало — это практика, а не проверенный метод. Сначала она медленнее простого повторения: чтобы на 30 секунд удержать короткое число, проще повторить его вслух. Словарь из ста пар — это отдельная работа на недели. И навык, как в опыте Эрикссона и Чейза, не переносится сам собой на другое: код для цифр не улучшает запоминание всего остального.

## Источники

1. Ericsson K.A., Chase W.G. (1982). Exceptional memory. American Scientist 70(6), 607–615.
2. Козаренко В. А. Учебник мнемотехники. Система запоминания «Джордано». М.: Джордано, 2002 (есть переиздания) — источник русской таблицы; не исследование, а учебник практики.`,
    en: `A word is easy to turn into an image. A number is not: "seventy-nine" shows you nothing. So numbers need an intermediate step — a code that turns digits into consonant sounds, and consonants into words. After that, those words are handled like any others: put into a story or along a route.

## Where the technique comes from and how well it is tested

To be upfront: this is practice and tradition, not a method with strong evidence behind it. In English it is called the Major system, or the phonetic system. It has been known for a long time and is widely used, but good controlled studies of this particular technique are scarce, and we will not quote effect sizes.

Another study points to the principle indirectly. Ericsson and Chase (Ericsson & Chase 1982) described a student who, over more than two hundred hours of practice, raised the number of spoken digits he could hold from about seven to nearly eighty. He had no special memory: he was a runner and turned groups of digits into running times — into something he already knew. That is not our code, but it is the same principle: a digit gains meaning through something familiar. And the limit shows there too: his memory for letters stayed ordinary.

## The table

In the Major system each digit maps to consonant sounds — sounds, not letters:

0 — s, z · 1 — t, d · 2 — n · 3 — m · 4 — r · 5 — l · 6 — j, sh, ch, soft g · 7 — k, hard g · 8 — f, v · 9 — p, b.

How to learn it. Some links are traditional: t has one downstroke, n two, m three; r is the last sound of "four"; l is the Roman numeral for fifty. The rest are worth learning by heart. Make up your own hooks where these do not help: your own hook holds better than someone else's.

The Russian version of this lesson uses a different table: Russian has its own established letter code, from the mnemonics school of V. A. Kozarenko. A code only works in the language you think in.

## How a number becomes a word

Vowels and the sounds w, h and y do not count — insert them however you like. Every consonant sound in the word counts, so the word has to contain exactly the right ones. Examples: 13 — dime (d, m), 25 — nail, 35 — mule, 40 — rose, 79 — cap, 86 — fish.

Pick what is easy to see: an object or an animal is better than a feeling or an action.

A long number is cut into pairs. 257935 is 25, 79, 35: nail, cap, mule. Then as in the earlier lessons: a nail pins a cap to a wall, and a mule pulls the cap off with its teeth. Or you lay the three images out on the first three places of your route.

## Exercise

Today 25–30 minutes, then 5 minutes a day for a few days.

1. Learn the table: 10 minutes. Write it out, cover it, rebuild it from memory, compare. Repeat until you can rebuild it without mistakes.
2. Make words for ten two-digit numbers — any ten, say 10 to 19. Write down one word per number and do not change it afterwards: a fixed dictionary works faster than a new word each time.
3. Open \`/en/trenazhery/eidetika/ryad/\`, digit mode, length 10. Split the series into five pairs, turn each pair into a word, and link the words with a story or place them on your route. Check right away and again an hour or more later.
4. Do not worry if at first this is slower than simply repeating the digits. The code pays off later, once your dictionary of pairs is ready.
5. Over the following days, add ten numbers at a time to the dictionary.

## What this gives you, and what it does not

The code gives you a way to turn a number into an image and then work with it using the techniques you already know. It is useful when a number is long or has to be kept for a long time.

What it does not give you. The evidence for this particular system is thin — it is practice, not a tested method. At first it is slower than plain repetition: to hold a short number for 30 seconds, it is easier to repeat it aloud. A dictionary of a hundred pairs is a separate project of several weeks. And, as in the Ericsson and Chase study, the skill does not carry over on its own: a code for digits does not improve memory for everything else.

## Sources

1. Ericsson K.A., Chase W.G. (1982). Exceptional memory. American Scientist 70(6), 607–615.
2. The Major system itself is a practical tradition, not a research finding; the Russian letter code is from V. A. Kozarenko, "Textbook of Mnemonics. The Giordano memory system" (Moscow, 2002; later editions) — a practice manual, not a study.`,
  },
  names: {
    ru: `Лицо человека ты узнаёшь через месяц, а имя вылетает через минуту. Это обычное дело: лицо ты видел, а имя — случайное слово, которое никак с этим лицом не связано. Урок про то, как эту связь сделать самому: найти в лице заметную деталь, превратить имя в образ и соединить их.

В этом уроке нет тренажёра, и это решение, а не недоделка. Тренажёру нужны фотографии и имена реальных людей, а это чужие данные. Поэтому упражнение — на воображаемых примерах, а настоящая практика — в живом разговоре.

## Три шага

Приём с образами для пар «лицо — имя» проверял Маккарти (McCarty 1980). Он состоит из трёх шагов, и в опыте участники, которые им пользовались, запоминали пары «лицо — имя» лучше контрольной группы.

Первый — заметная черта. Найди в лице то, что бросается в глаза именно тебе: густые брови, высокий лоб, ямочка на подбородке, веснушки. Выбирай черты лица, а не одежду и не причёску: они не меняются к следующей встрече.

Второй — имя становится образом. По смыслу или по созвучию, как абстрактные слова в первом уроке: Роман — толстая книга-роман, Марина — причал с лодками, Лев — лев, Олег — олень, Роза — роза.

Третий — связь. Образ имени взаимодействует с чертой: из густых бровей Романа торчат страницы книги; на высоком лбу Марины, как на причале, покачиваются лодки. Сцена существует только у тебя в голове, поэтому она может быть нелепой. Но не делай её насмешкой над внешностью человека: смешное к образу, а не к человеку.

## Закрепить сразу

Самая частая причина забыть имя — не память, а внимание: имя прозвучало, пока ты думал, что сказать. Поэтому к трём шагам добавляются привычки разговора.

Если не расслышал — переспроси. Это нормально и вежливо.

Произнеси имя вслух один раз в разговоре — естественно, без нажима.

Через несколько минут вспомни имя про себя, глядя на человека. Это маленькая проверка, а проверка закрепляет лучше повторного прочтения — об этом подробнее в последнем уроке (Roediger & Karpicke 2006).

Попрощайся по имени.

## Упражнение

Сегодня, 15 минут, плюс проверка через час. Все люди ниже выдуманы.

1. Прочитай пять описаний и для каждого сделай три шага: черта, образ имени, связь. Запиши сцену одной строкой.
2. Марина — высокий лоб, светлые кудри. Олег — очень широкие плечи, маленький нос. Вера — тёмные глаза, ямочки на щеках. Тимур — густая короткая борода, шрам на брови. Роза — веснушки, острый подбородок.
3. Закрой описания и сцены на час.
4. Через час закрой имена в описаниях и по чертам лица вспомни каждое имя. Для каждого, кого не вспомнил, посмотри на сцену: что в ней было слабым — черта, образ имени или связь.
5. На ближайшей реальной встрече с новым человеком сделай три шага в голове. Записывать сцены про реальных людей не нужно: приём работает в уме.

## Что это даёт и чего не даёт

Приём даёт связь между лицом и именем, которой без него нет, — именно её проверял McCarty 1980. Привычки разговора дают то, без чего приём не срабатывает: имя, которое ты действительно услышал.

Чего не даёт. Он не работает, если имя прозвучало мимо тебя: сначала внимание, потом образ. Он рассчитан на несколько новых людей за раз, а не на сотню. И это не лечение. У некоторых людей узнавание лиц трудно от рождения, и приём этого не изменит. Если память на лица или имена резко ухудшилась — это повод обратиться к врачу, а не к тренажёру.

## Источники

1. McCarty D.L. (1980). Investigation of a visual imagery mnemonic device for acquiring face–name associations. Journal of Experimental Psychology: Human Learning and Memory 6(2), 145–155.
2. Roediger H.L., Karpicke J.D. (2006). Test-enhanced learning. Psychological Science 17(3), 249–255. doi:10.1111/j.1467-9280.2006.01693.x`,
    en: `You recognise a person's face a month later, yet their name slips away within a minute. That is normal: you saw the face, while the name is an arbitrary word with no link to it. This lesson is about making that link yourself: find a noticeable detail in the face, turn the name into an image, and join the two.

There is no trainer for this lesson, and that is a decision, not a gap. A trainer would need photos and names of real people, and that is other people's data. So the exercise uses imaginary examples, and the real practice happens in live conversation.

## Three steps

An imagery technique for face–name pairs was tested by McCarty (McCarty 1980). It has three steps, and in the study participants who used it learned face–name pairs better than a control group.

First, a distinctive feature. Find something in the face that catches your eye in particular: thick eyebrows, a high forehead, a cleft chin, freckles. Choose features of the face, not clothes or hairstyle: those change by the next meeting.

Second, the name becomes an image. By meaning or by sound, like the abstract words in the first lesson: Rose — a rose, Bill — a bird's bill, Carl — a car, Mark — a marker pen, Jack — a car jack.

Third, the link. The image of the name interacts with the feature: a small car is parked in Carl's cleft chin; a rose grows out of Rose's high forehead. The scene exists only in your head, so it can be absurd. But do not make it mockery of the person's appearance: the humour belongs to the image, not to the person.

## Lock it in straight away

The most common reason for forgetting a name is not memory but attention: the name was said while you were thinking about what to say. So the three steps come with a few conversation habits.

If you did not catch the name, ask again. That is normal and polite.

Say the name aloud once in the conversation — naturally, without emphasis.

A few minutes later, recall the name silently while looking at the person. That is a small test, and testing yourself fixes material better than rereading it — more on that in the last lesson (Roediger & Karpicke 2006).

Say goodbye using the name.

## Exercise

Today, 15 minutes, plus a check an hour later. Everyone below is invented.

1. Read five descriptions and do the three steps for each: feature, name image, link. Write the scene down in one line.
2. Rose — high forehead, fair curls. Carl — very broad shoulders, a small nose. Grace — dark eyes, dimples. Mark — a short thick beard, a scar across one eyebrow. Bill — freckles, a pointed chin.
3. Put the descriptions and scenes away for an hour.
4. An hour later, cover the names in the descriptions and recall each name from the facial features. For each one you missed, look at the scene: what was weak — the feature, the name image, or the link?
5. Next time you meet someone new in real life, do the three steps in your head. There is no need to write down scenes about real people: the technique works in the mind.

## What this gives you, and what it does not

The technique gives you a link between face and name that does not exist without it — exactly what McCarty 1980 tested. The conversation habits give you what the technique cannot work without: a name you actually heard.

What it does not give you. It does not work if the name went past you: attention first, image second. It is meant for a few new people at a time, not for a hundred. And it is not a treatment. For some people recognising faces is hard from birth, and a technique will not change that. If your memory for faces or names has suddenly got worse, see a doctor, not a trainer.

## Sources

1. McCarty D.L. (1980). Investigation of a visual imagery mnemonic device for acquiring face–name associations. Journal of Experimental Psychology: Human Learning and Memory 6(2), 145–155.
2. Roediger H.L., Karpicke J.D. (2006). Test-enhanced learning. Psychological Science 17(3), 249–255. doi:10.1111/j.1467-9280.2006.01693.x`,
  },
  spacing: {
    ru: `Всё, что ты запоминал в этом модуле, без возврата блекнет. Ты это уже видел: отложенная проверка в тренажёре почти всегда даёт меньше, чем проверка сразу. Это не сбой, а обычная работа памяти. Последний урок — про то, как возвращаться к запомненному так, чтобы оно держалось, и не тратить на это лишнего времени.

## Что говорят исследования

Здесь опора самая надёжная во всём модуле.

Первое — распределённое повторение. Сепеда с коллегами (Cepeda 2006) свели вместе сотни экспериментов: повторение, разнесённое во времени, даёт лучшее запоминание, чем то же время, потраченное за один присест. И чем дольше нужно помнить, тем длиннее выгодные промежутки между повторами.

Второе — вспоминание вместо перечитывания. Рёдигер и Карпик (Roediger & Karpicke 2006) показали: те, кто после изучения проверял себя, через неделю помнили больше тех, кто перечитывал материал, — хотя вторые были увереннее в своём результате.

В большом обзоре учебных техник (Dunlosky 2013) именно эти два приёма — распределённая практика и самопроверка — получили высшую оценку полезности. Для сравнения: образы как отдельный приём в том же обзоре оценены низко. Поэтому последний урок — не приложение к модулю, а то, что удерживает результат всех остальных.

## План повторов

Простой ориентир: сразу, через час, вечером или на следующий день, через три дня, через неделю, через две-три недели. Это не научная формула — одной формулы исследования не дают, — а разумный старт, который ты подстроишь под себя.

Правило подстройки. Вспомнилось легко — следующий промежуток делай длиннее. Вспомнилось с трудом или с ошибками — повтори раньше, чем по плану. Не вспомнилось — посмотри и начни этот ряд сначала.

## Как повторять

Повтор — это попытка вспомнить, а не перечитывание. Пройди маршрут или историю в голове, назови всё, что нашёл, и только потом сверься. Трудное вспоминание неприятнее лёгкого перечитывания, и именно поэтому оно работает.

На каждый повтор уходит минута-две. Три-четыре таких возврата — меньше десяти минут на ряд.

## Упражнение

Сегодня 15 минут, дальше по две минуты в назначенные дни.

1. Открой \`/trenazhery/eidetika/ryad/\`, слова, длина 15. Запомни ряд приёмом, который у тебя лучше сработал в прошлых уроках: историей или по маршруту. Проверь сразу.
2. Через час или больше пройди отложенную проверку в тренажёре.
3. Дальше повторяй по плану, без тренажёра: запиши ряд по памяти на листок, потом сверь со своей записью, сделанной в первый день. Отметь дату и сколько вспомнил.
4. Через неделю сравни три строки: замер «до» из первого урока, отложенную проверку сегодня и результат через неделю.
5. Реши, что будешь держать так дальше — слова, числа, даты, пункты — и заведи для этого один список с датами повторов.

## Что это даёт и чего не даёт

Повторы с растущими промежутками и самопроверкой дают то, что держится неделями и месяцами, а не до вечера, — это самая надёжная часть модуля (Cepeda 2006; Roediger & Karpicke 2006; Dunlosky 2013).

Чего не даёт. Повтор не спасёт то, что не было запомнено: сначала образ, история или маршрут, потом интервалы. Держать можно только то, к чему возвращаешься, — забытый список не восстановится задним числом.

И честный итог модуля. Реалистичный результат шести уроков — умение запоминать ряды слов, чисел и имён заметно надёжнее, чем в замере «до», если тратить на это время и возвращаться к запомненному. Фотографической памяти в конце курса нет — ни у тебя, ни у рекордсменов, которые, как показали Maguire 2003 и Ericsson & Chase 1982, пользуются приёмами, а не особой памятью. Сравнивать свой результат стоит только со своим же замером «до».

## Источники

1. Cepeda N.J. et al. (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. Psychological Bulletin 132(3), 354–380. doi:10.1037/0033-2909.132.3.354
2. Roediger H.L., Karpicke J.D. (2006). Test-enhanced learning. Psychological Science 17(3), 249–255. doi:10.1111/j.1467-9280.2006.01693.x
3. Dunlosky J. et al. (2013). Improving students' learning with effective learning techniques. Psychological Science in the Public Interest 14(1), 4–58. doi:10.1177/1529100612453266
4. Maguire E.A. et al. (2003). Routes to remembering: the brains behind superior memory. Nature Neuroscience 6(1), 90–95. doi:10.1038/nn988
5. Ericsson K.A., Chase W.G. (1982). Exceptional memory. American Scientist 70(6), 607–615.`,
    en: `Everything you memorised in this module fades without a return. You have already seen it: the trainer's delayed check almost always gives less than the immediate one. That is not a malfunction; it is memory working as usual. The last lesson is about how to return to what you memorised so that it holds, without spending more time than you need.

## What the research says

This is where the module stands on its firmest ground.

First, spaced repetition. Cepeda and colleagues (Cepeda 2006) brought together hundreds of experiments: repetition spread out over time produces better retention than the same time spent in one sitting. And the longer you need to remember something, the longer the useful gaps between repetitions.

Second, recall instead of rereading. Roediger and Karpicke (Roediger & Karpicke 2006) showed that people who tested themselves after studying remembered more a week later than those who reread the material — even though the rereaders were more confident of their result.

In a large review of learning techniques (Dunlosky 2013), these two — distributed practice and practice testing — received the top utility rating. For comparison, imagery used on its own was rated low in the same review. So this last lesson is not an appendix to the module; it is what keeps the result of all the others.

## A repetition plan

A simple guide: right away, an hour later, that evening or the next day, three days later, a week later, two or three weeks later. This is not a scientific formula — research does not offer a single one — but a sensible starting point you will adjust for yourself.

The adjustment rule. If recall came easily, make the next gap longer. If it was hard or had mistakes, repeat sooner than planned. If nothing came, look at it and start that series over.

## How to repeat

A repetition is an attempt to recall, not a rereading. Walk the route or the story in your head, name everything you find, and only then check. Effortful recall feels less pleasant than easy rereading, and that is exactly why it works.

Each repetition takes a minute or two. Three or four such returns cost under ten minutes per series.

## Exercise

Today 15 minutes, then two minutes on the scheduled days.

1. Open \`/en/trenazhery/eidetika/ryad/\`, words, length 15. Memorise the series with the technique that worked better for you in the earlier lessons: a story or a route. Check right away.
2. An hour or more later, take the delayed check in the trainer.
3. After that, repeat on schedule without the trainer: write the series down from memory on paper, then compare with the copy you made on the first day. Note the date and how many you recalled.
4. After a week, compare three lines: the "before" measurement from the first lesson, today's delayed check, and the result a week later.
5. Decide what you will keep this way from now on — words, numbers, dates, points — and start one list with repetition dates for it.

## What this gives you, and what it does not

Repetitions at growing intervals, with self-testing, give you material that holds for weeks and months rather than until the evening — the most reliable part of the module (Cepeda 2006; Roediger & Karpicke 2006; Dunlosky 2013).

What it does not give you. Repetition cannot rescue what was never memorised: first the image, the story or the route, then the intervals. You can only keep what you return to — a forgotten list will not come back after the fact.

And an honest summary of the module. A realistic outcome of six lessons is the ability to memorise series of words, numbers and names noticeably more reliably than in your "before" measurement, provided you put in the time and return to what you memorised. There is no photographic memory at the end of this course — not for you, and not for record holders either, who, as Maguire 2003 and Ericsson & Chase 1982 showed, use techniques rather than an unusual memory. The only comparison worth making is with your own "before" measurement.

## Sources

1. Cepeda N.J. et al. (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. Psychological Bulletin 132(3), 354–380. doi:10.1037/0033-2909.132.3.354
2. Roediger H.L., Karpicke J.D. (2006). Test-enhanced learning. Psychological Science 17(3), 249–255. doi:10.1111/j.1467-9280.2006.01693.x
3. Dunlosky J. et al. (2013). Improving students' learning with effective learning techniques. Psychological Science in the Public Interest 14(1), 4–58. doi:10.1177/1529100612453266
4. Maguire E.A. et al. (2003). Routes to remembering: the brains behind superior memory. Nature Neuroscience 6(1), 90–95. doi:10.1038/nn988
5. Ericsson K.A., Chase W.G. (1982). Exceptional memory. American Scientist 70(6), 607–615.`,
  },
}

/** Проза урока на нужном языке или null, если урок ещё не написан. */
export function getEideticsProse(slug: string, locale: Locale): string | null {
  const body = EIDETICS_PROSE[slug]?.[locale]?.trim()
  return body ? body : null
}

/** Slug'и уроков с прозой на обоих языках (для generateStaticParams). */
export function writtenEideticsSlugs(): string[] {
  return Object.entries(EIDETICS_PROSE)
    .filter(([, bi]) => bi.ru.trim().length > 0 && bi.en.trim().length > 0)
    .map(([slug]) => slug)
}
