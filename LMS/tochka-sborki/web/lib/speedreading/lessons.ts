// lib/speedreading/lessons.ts
// Проза уроков скорочтения. Отдельно от course.ts (там структура) — чтобы длинный
// markdown не мешал читать скелет курса. Ключ = slug урока из SPEEDREADING_COURSE.
// Методика public-domain, текст оригинальный: ни одной фразы из чужих книг/курсов
// (шрам OpenYoga). Проза проходит lintDehustle — см. lessons.test.ts.
// Пустая строка = урок ещё не написан: страница урока такой slug не создаёт.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export const SPEEDREADING_PROSE: Record<string, Bi> = {
  'baseline': {
    ru: `Прежде чем что-то менять в чтении, стоит узнать, что именно вы меняете. Большинство людей не знают свою скорость чтения даже приблизительно: ощущение «читаю медленно» обычно основано на сравнении с кем-то, кто читал другой текст в другом состоянии. Первый урок — не про технику, а про измерение. Мы снимем базовую цифру, посмотрим на понимание и найдём привычки, которые тормозят вас сильнее всего.

## Что такое «скорость чтения» на самом деле

Скорость измеряют в словах в минуту (wpm), но само число без второго показателя бессмысленно. Можно прогнать глазами страницу за двадцать секунд и не удержать ни одной мысли — формально это будет 600 wpm, фактически это ноль. Поэтому любой честный замер идёт в паре: скорость и проверка понимания. Если после текста вы не можете ответить на несколько вопросов по содержанию, замер не засчитывается.

Ориентиры для взрослого читателя на родном языке: художественная проза и публицистика — примерно 200-300 wpm, плотный нон-фикшн — 150-250, технический или юридический текст — заметно ниже, и это нормально. Скорость сильно зависит от материала. Один и тот же человек читает роман втрое быстрее, чем спецификацию, и это не признак плохого навыка.

## Что тормозит чаще всего

Есть четыре привычки, которые встречаются почти у всех и съедают больше времени, чем любые «неправильные движения глаз».

Первая — регрессии, непроизвольные возвраты к уже прочитанному. Они занимают заметную долю времени чтения и чаще связаны не с непониманием, а с тревогой «а вдруг я что-то упустил».

Вторая — внутреннее проговаривание. Оно не вредно само по себе, но привязывает скорость чтения к скорости речи.

Третья — узкое поле захвата: взгляд цепляется за отдельные слова вместо групп.

Четвёртая, и самая недооценённая, — плохой отбор материала. Час, потраченный на текст, который не стоило открывать, не спасёт никакая техника.

## Условия замера

Чтобы цифра что-то значила, замер должен быть воспроизводимым. Одинаковое время суток, отсутствие уведомлений, одинаковый тип текста, экран на комфортном расстоянии. Не пытайтесь читать быстрее обычного: базовая линия — это ваше обычное чтение, а не рекорд.

## Упражнение

Сегодня, 15 минут.

1. Откройте \`/speedreading/test/\` и пройдите замер один раз в обычном темпе. Запишите две цифры: wpm и процент понимания. Не переделывайте, если результат не понравился — это и есть точка отсчёта.
2. Возьмите любой текст на 3-4 минуты чтения — статью, главу, рабочий документ. Читайте с карандашом или заметкой рядом и ставьте палочку каждый раз, когда поймали себя на возврате назад. Не боритесь с возвратами, просто считайте.
3. Запишите три строки: скорость, понимание, число возвратов за 3-4 минуты. Это ваш профиль на старте.
4. Повторите замер через неделю в тех же условиях. Одна точка — не данные, две — уже линия.

## Что это даёт и чего не даёт

Замер не делает вас быстрее ни на одно слово. Он даёт другое: конкретное число вместо ощущения, и понимание, какая из четырёх привычек у вас доминирует — от этого зависит, какие уроки курса вам действительно нужны. Ожидайте, что первый результат окажется выше, чем вы думали: люди систематически недооценивают свою скорость. И будьте готовы, что процент понимания окажется ниже ожидаемого — это тоже полезная новость.`,
    en: `Before changing how you read, it helps to know what you are changing. Most people cannot estimate their own reading speed within a hundred words per minute. The feeling of "I read slowly" usually comes from comparing yourself to someone reading a different text in a different state of mind. This first lesson is not about technique. It is about measurement: a baseline number, a comprehension check, and an honest look at which habits cost you the most.

## What reading speed actually means

Speed is measured in words per minute, but the number alone means nothing. You can sweep your eyes across a page in twenty seconds and retain nothing. On paper that is 600 wpm; in practice it is zero. Any honest measurement comes as a pair: rate and comprehension. If you cannot answer a few questions about what you just read, the measurement does not count.

Rough reference points for an adult reading in a first language: narrative prose and journalism run around 200-300 wpm, dense non-fiction around 150-250, technical or legal material considerably lower. Speed depends heavily on the material. The same person reads a novel three times faster than a specification, and that is not a defect.

## The four common drags

Four habits show up in almost everyone, and together they cost more time than any theory about eye movement.

The first is regression — involuntary jumps back to text you already read. These take up a measurable share of reading time, and they usually come from a vague anxiety about missing something rather than from actual confusion.

The second is subvocalization, the inner voice. It is not harmful in itself, but it ties reading speed to speaking speed.

The third is a narrow span: the eye grabs single words instead of small groups.

The fourth, and the most underrated, is poor selection. No technique rescues an hour spent on a text that was not worth opening.

## Making the number reproducible

A baseline is only useful if you can repeat it. Same time of day, notifications off, same kind of text, screen at a comfortable distance. Do not try to read faster than usual. A baseline is your ordinary reading, not a personal record.

## Exercise

Today, 15 minutes.

1. Open \`/speedreading/test/\` and take one measurement at your normal pace. Write down two numbers: wpm and comprehension percentage. Do not retake it because you dislike the result — that result is the starting point.
2. Take any text worth 3-4 minutes of reading: an article, a chapter, a work document. Keep a pen or a note nearby and make a mark every time you catch yourself jumping back. Do not fight the jumps, just count them.
3. Record three lines: rate, comprehension, regressions per 3-4 minutes. That is your starting profile.
4. Repeat the measurement in a week under the same conditions. One point is not data; two points make a line.

## What this gives you, and what it does not

Measuring makes you faster by exactly zero words per minute. What it gives you is a number instead of a feeling, and a sense of which of the four habits dominates in your case — which determines which lessons in this course you actually need. Expect the first result to be higher than you guessed; people routinely underestimate their own rate. And be prepared for comprehension to come in lower than expected. That is useful news too.`,
  },
  'regression': {
    ru: `Возврат глаз — это когда взгляд без сознательного решения прыгает назад, к предыдущей строке или к слову, которое вы вроде бы уже прочитали. У опытных читателей такие возвраты занимают порядка десятой части всего времени чтения; у людей, читающих в напряжении или на неродном языке, заметно больше. Хорошая новость в том, что значительная часть этих возвратов не нужна — они не восстанавливают смысл, а обслуживают тревогу.

## Два разных возврата

Важно различать. Есть осмысленный возврат: вы наткнулись на определение термина, потеряли, к чему относится местоимение, или встретили формулировку, от которой зависит вся дальнейшая логика. Такой возврат — рабочий инструмент, и убирать его не надо. Исследования движений глаз показывают, что регрессии учащаются на синтаксически сложных местах, и это функциональное поведение.

И есть возврат по привычке: глаз соскальзывает на полстроки назад просто потому, что внимание на секунду ушло. Вы перечитываете фразу, которую поняли с первого раза. Именно с этим типом мы работаем.

Отличить их проще, чем кажется. Задайте себе после возврата один вопрос: «я узнал что-то новое?» Если ответ «нет» — возврат был холостым. Первую неделю достаточно просто замечать разницу, не пытаясь ничего исправлять: осознанность здесь работает быстрее, чем усилие.

## Почему возвраты множатся

Обычно из-за трёх вещей. Слишком медленный темп: если движение по строке вялое, у внимания появляется зазор, куда оно и уходит. Отсутствие цели: когда непонятно, что вы ищете в тексте, любая фраза кажется одинаково важной, и любую хочется перепроверить. И чтение в шуме — не обязательно звуковом; открытая вкладка мессенджера работает так же.

Отсюда контринтуитивный вывод: умеренное ускорение часто снижает число возвратов. Не потому, что вы «натренировали глаз», а потому, что вниманию некогда отвлекаться.

## Инструмент: физический ограничитель

Самый надёжный способ — механически лишить взгляд возможности вернуться. Палец, карандаш или карточка, которая закрывает уже прочитанное сверху. Это старый приём, он не магический, но он работает, потому что переводит регрессию из автоматического действия в осознанное: чтобы вернуться, придётся сдвинуть карточку.

Второй инструмент — RSVP. Слова показываются по одному в фиксированной точке, вернуться физически невозможно. Как постоянный режим чтения RSVP неудобен и мешает пониманию сложных текстов, но как тренажёр отвыкания от возвратов он полезен именно своей жёсткостью.

## Упражнение

Сегодня, 12-15 минут.

1. Возьмите текст средней сложности. 5 минут читайте с карточкой, закрывающей прочитанные строки сверху. Двигайте её равномерно, чуть быстрее комфортного темпа.
2. Откройте \`/speedreading/rsvp/\`. Поставьте скорость примерно на 10% выше вашей базовой из первого урока. Прочитайте 3 минуты. Не гонитесь за максимальной цифрой: цель — не рекорд, а опыт чтения без возможности вернуться.
3. Затем 4 минуты обычного чтения без всяких приспособлений, снова считая возвраты. Сравните с числом из первого урока.
4. Повторяйте связку 4-5 раз в течение двух недель.

## Что это даёт и чего не даёт

Реалистичный результат — снижение холостых возвратов и, как следствие, выигрыш в общем времени порядка 10-15% при том же понимании. Это не превращается в удвоение скорости, и не должно. Осмысленные возвраты останутся, и это правильно: текст, который нельзя перечитать, вы читаете хуже. Настоящий выигрыш здесь не в скорости, а в том, что чтение перестаёт быть дёрганым.`,
    en: `A regression is when your eyes jump backwards without any conscious decision — to the previous line, or to a word you supposedly just read. In skilled readers these backward jumps account for roughly a tenth of total reading time; in people reading under stress or in a second language, considerably more. The useful part is that a large share of them are not doing any work. They serve anxiety, not comprehension.

## Two different jumps

The distinction matters. There is the deliberate return: you hit a term whose definition you lost, a pronoun with no clear referent, or a clause the rest of the argument depends on. That return is a working tool and should stay. Eye-movement research consistently finds that regressions cluster at syntactically difficult points, which is functional behaviour.

Then there is the habitual jump: the eye slips half a line back because attention wandered for a moment, and you reread a sentence you understood the first time. That is the one worth removing.

Telling them apart is easier than it sounds. After a jump, ask one question: did I learn anything? If the answer is no, the jump was empty.

## Why they multiply

Usually three causes. A pace that is too slow — a sluggish sweep across the line leaves a gap that attention promptly falls into. No purpose — if you do not know what you are looking for, every sentence feels equally important and equally worth double-checking. And reading in noise, which does not have to be audible; an open chat tab does the same job.

Hence a counterintuitive point: reading moderately faster often reduces regressions. Not because your eyes got trained, but because attention has less room to drift.

## Tool one: a physical stop

The most reliable method is to make going back mechanically inconvenient. A finger, a pen, or a card that covers the lines you have already read from above. It is an old trick and there is nothing magical about it, but it converts regression from an automatic move into a deliberate one: to go back, you must move the card.

## Tool two: RSVP

Rapid serial visual presentation shows words one at a time in a fixed position. Going back is simply not possible. As a permanent way to read it is uncomfortable and hurts comprehension on complex material, but as a training device for unlearning regressions its rigidity is exactly the point.

## Exercise

Today, 12-15 minutes.

1. Take a text of moderate difficulty. Read for 5 minutes with a card covering the lines above. Move it steadily, slightly faster than comfortable.
2. Open \`/speedreading/rsvp/\`. Set the rate about 10% above the baseline from lesson one. Read for 3 minutes. Do not chase the highest number — the goal is the experience of reading with no way back, not a record.
3. Then read normally for 4 minutes with no aids, counting regressions again. Compare with your lesson-one count.
4. Repeat the sequence 4-5 times over two weeks.

## What this gives you, and what it does not

A realistic outcome is fewer empty regressions and a 10-15% saving in overall time at unchanged comprehension. It does not compound into doubled speed, and it should not. Deliberate returns will remain, which is correct: a text you are forbidden to reread is a text you understand less well. The real gain here is not raw pace — it is that reading stops feeling jittery.`,
  },
  'subvocalization': {
    ru: `Внутренний голос — это когда вы «слышите» текст, который читаете. Иногда это едва заметное напряжение в горле и языке, иногда полноценная внутренняя декламация. Вокруг него накопилось много вредных советов: избавиться полностью, заглушить, отучиться навсегда. Это неверно и невозможно. Внутреннее проговаривание — часть того, как человек читает; оно помогает удерживать сложные конструкции и почти всегда возвращается на трудных местах, даже у самых быстрых читателей.

Работать имеет смысл не с уничтожением голоса, а с его громкостью и с тем, когда он включается.

## Где голос стоит дорого

Проговаривание задаёт естественный потолок: речь взрослого человека — примерно 150-200 слов в минуту. Пока вы буквально произносите про себя каждое слово, выше этой планки вы не поднимаетесь. Для романа, стихов или юридического договора это нормальная цена — там звучание и точность формулировки и есть содержание.

Но большая часть повседневного чтения — рабочая переписка, обзорные статьи, документация, новости — не требует звучания. Здесь голос работает вхолостую и просто ограничивает темп.

## Где голос стоит сохранить

Честно: почти везде, где текст плотный. Исследования понимания при чтении показывают, что фонологический код помогает удерживать порядок слов и синтаксис. Если вы читаете определение, формулу, юридический пункт или незнакомую тему — не глушите голос, он вам нужен. Попытка читать «беззвучно» сложный материал обычно кончается тем, что вы дочитали страницу и не поняли ни одного абзаца.

Практический критерий: глушите голос там, где вам нужен смысл целиком, а не точная формулировка. Если по ходу чтения вы ловите себя на том, что голос вернулся сам — не считайте это срывом. Обычно это сигнал, что текст стал плотнее, и голос включился по делу.

## Как ослабляют голос

Три подхода, от мягкого к жёсткому.

Первый — темп. Если вести взгляд немного быстрее, чем успевает внутренняя речь, голос сам собой отстаёт и переходит в фоновое бормотание. Ничего специально подавлять не нужно.

Второй — занять артикуляцию. Тихий счёт про себя, простой повторяющийся слог или жевание — что-то, что занимает речевой аппарат. Приём грубый, для тренировки годится, для постоянного чтения нет.

Третий — RSVP на скорости чуть выше вашей речевой границы. Когда слова идут быстрее, чем их можно произнести, проговаривание просто не успевает сформироваться.

## Упражнение

Сегодня, 12 минут.

1. Возьмите лёгкий текст — новостную статью, знакомую тему. 4 минуты читайте, ведя пальцем чуть быстрее комфортного. Заметьте, где голос отстал, а где вернулся.
2. Откройте \`/speedreading/rsvp/\`, поставьте 280-320 wpm — заведомо выше речевого потолка. Читайте 3 минуты, затем своими словами перескажите вслух главную мысль в двух предложениях. Если пересказ не получился — снизьте скорость на 40 wpm и повторите.
3. Последние 4 минуты возьмите сложный текст и читайте намеренно с голосом, спокойно. Это не откат назад, а вторая половина навыка: научиться включать голос осознанно.

## Что это даёт и чего не даёт

Ослабление голоса на простых текстах даёт реальный, но ограниченный выигрыш — примерно с 200 до 300-400 wpm на подходящем материале. Это не открывает дорогу к тысяче слов в минуту: убрав проговаривание, вы упираетесь в следующий предел — скорость, с которой мозг вообще извлекает смысл. И на сложных текстах приглушённый голос ничего не даёт, а понимание ухудшает. Настоящий навык здесь — не тишина, а переключаемость.`,
    en: `The inner voice is the sense of hearing the text as you read it. Sometimes it is a faint tension in the throat and tongue; sometimes it is a full internal recital. A great deal of bad advice has accumulated around it: eliminate it, silence it, unlearn it permanently. That is neither correct nor possible. Subvocalization is part of how human reading works. It helps hold complex structures in mind and reliably returns at difficult passages, even in the fastest readers.

The useful work is not on abolishing the voice but on its volume, and on when it switches on.

## Where the voice is expensive

Sounding out words imposes a natural ceiling: adult speech runs at roughly 150-200 words per minute. As long as you are literally pronouncing every word internally, you stay under that ceiling. For a novel, for poetry, or for a contract, that is a fair price — there the sound and the exact wording are the content.

But most everyday reading — work email, survey articles, documentation, news — does not need sound. There the voice runs idle and simply caps your pace.

## Where the voice is worth keeping

Honestly: nearly everywhere the text is dense. Research on reading comprehension indicates that the phonological code helps hold word order and syntax in working memory. If you are reading a definition, a formula, a legal clause, or an unfamiliar field, do not suppress the voice — you need it. Trying to read hard material "silently" usually ends with a finished page and no retained paragraph.

A practical rule: quiet the voice where you need the meaning as a whole, not the exact wording.

## Three ways to turn it down

From gentle to blunt.

Pace. Move your eyes slightly faster than inner speech can keep up, and the voice falls behind on its own, dropping into background murmur. Nothing needs to be actively suppressed.

Occupying articulation. Counting quietly, repeating a simple syllable, chewing — anything that keeps the speech apparatus busy. Crude, fine for training, unusable as a permanent habit.

RSVP just above your speech ceiling. When words arrive faster than they can be pronounced, subvocalization has no time to form.

## Exercise

Today, 12 minutes.

1. Take an easy text — a news article on a familiar topic. Read for 4 minutes, guiding with a finger slightly faster than comfortable. Notice where the voice falls behind and where it returns.
2. Open \`/speedreading/rsvp/\` and set 280-320 wpm, deliberately above the speech ceiling. Read for 3 minutes, then say the main idea out loud in two sentences in your own words. If you cannot, drop 40 wpm and repeat.
3. For the last 4 minutes, take a difficult text and read it deliberately with the voice on, unhurried. This is not backsliding — it is the second half of the skill: turning the voice on by choice.

## What this gives you, and what it does not

Quieting the voice on easy material gives a real but bounded gain — roughly from 200 to 300-400 wpm on suitable text. It does not open a road to a thousand words per minute: remove subvocalization and you immediately meet the next limit, the rate at which the brain extracts meaning at all. On difficult texts a muted voice gains nothing and costs comprehension. The actual skill here is not silence. It is switching.`,
  },
  'peripheral': {
    ru: `Глаз не скользит по строке плавно. Чтение состоит из коротких скачков — саккад — и остановок между ними, фиксаций. Смысл извлекается только во время остановок, каждая длится примерно четверть секунды. Значит, есть два способа читать быстрее: делать остановки короче или делать их реже, забирая за одну фиксацию больше текста. Второй путь — тема этого урока.

## Сколько глаз видит за одну остановку

Здесь нужна честность, потому что вокруг этого построено больше всего мифов. Область чёткого зрения — фовеа — покрывает всего около двух градусов, это примерно 6-8 знаков. Чуть дальше идёт парафовеальная зона, где буквы уже неразличимы, но видны длины слов, пробелы и общая форма. Эффективное окно восприятия при чтении слева направо асимметрично: около 3-4 знаков влево от точки фиксации и до 14-15 вправо.

Отсюда следует прямой вывод: читать «строку за один взгляд» физически невозможно, и диагональное чтение страницы целиком тоже. Всё, что обещает захват абзаца одним взглядом, обещает то, чего анатомия не позволяет.

Реальная цель скромнее и достижима: устойчиво брать за фиксацию не одно слово, а группу из двух-трёх коротких слов, и не тратить фиксации на служебные части речи.

## Что реально тренируется

Тренируется не «расширение поля зрения» — физиология фовеа не меняется. Тренируется использование того, что уже видно на периферии: привычка опираться на форму соседнего слова и не ставить туда отдельную остановку. Плюс равномерность движения: неопытный читатель делает больше фиксаций, чем нужно, и ставит их хаотично.

Отсюда практика: вести взгляд по строке не по каждому слову, а по двум-трём опорным точкам. В строке обычной ширины таких точек хватает.

## При чём тут таблицы Шульте

Таблицы Шульте — сетка с перемешанными числами, которые нужно найти по порядку, удерживая взгляд в центре. Это не тренажёр чтения: связь между результатами в таблицах и скоростью чтения слабая, и обещать перенос было бы нечестно. Что таблицы действительно дают — навык не дёргать глазом на каждый объект и доверять периферии. Как разминка перед чтением они уместны, как замена чтению — нет.

## Упражнение

Сегодня, 12-14 минут.

1. \`/speedreading/schulte/\` — 4 подхода по таблице 5×5. Держите взгляд в центре, ищите числа периферией. Записывайте время каждого подхода; между подходами 30 секунд паузы.
2. Возьмите текст с узкой колонкой — новостной сайт, PDF в две колонки, книга в мягкой обложке. 5 минут читайте, сознательно ставя ровно две остановки на строку: примерно на трети и на двух третях длины. Строки будут «проваливаться» — это нормально первые пару минут.
3. 3 минуты обычного чтения широкого текста, без правил. Просто заметьте, изменилось ли ощущение ритма.
4. Повторяйте 3-4 раза в неделю. Ширина колонки важнее усердия: на строке в 90 знаков две фиксации не работают.

## Что это даёт и чего не даёт

Экономия фиксаций — самый реальный источник прироста скорости из всех, о которых говорят в скорочтении, но и он ограничен. Потолок примерно там же, где потолок всего навыка: 400-500 wpm на несложном материале при сохранном понимании. Поле зрения при этом не расширяется, страницу «фотографировать» вы не научитесь, и на плотном тексте фиксаций всё равно понадобится больше. Зато исчезает пословное «клевание», и чтение становится ощутимо менее утомительным.`,
    en: `The eye does not glide smoothly along a line. Reading is a sequence of short jumps — saccades — separated by stops called fixations. Meaning is extracted only during the stops, each lasting roughly a quarter of a second. So there are two ways to read faster: make the stops shorter, or make them fewer by taking in more text per stop. This lesson is about the second.

## How much the eye actually takes in

Honesty matters here, because this is where the biggest myths live. The region of sharp vision, the fovea, covers about two degrees — around 6 to 8 characters. Just beyond it lies the parafoveal zone, where letters are no longer legible but word lengths, spaces, and overall shapes are. The effective perceptual span in left-to-right reading is asymmetric: roughly 3-4 characters to the left of fixation and up to 14-15 to the right.

The conclusion follows directly: reading a full line "in one glance" is physically impossible, and so is diagonal scanning of a whole page. Anything promising a paragraph per glance is promising something anatomy does not allow.

The realistic goal is more modest and quite reachable: consistently take in a group of two or three short words per fixation, and stop spending fixations on function words.

## What actually improves

Not your visual field — foveal physiology does not change with practice. What improves is your use of what the periphery already delivers: the habit of leaning on the shape of the neighbouring word instead of placing a separate stop on it. Alongside that comes evenness. Inexperienced readers make more fixations than necessary and place them erratically.

Hence the practice: guide your eyes along the line by two or three anchor points rather than word by word. On a normal-width column, that is enough.

## Where Schulte tables fit

A Schulte table is a grid of shuffled numbers you locate in order while holding your gaze at the centre. It is not a reading trainer: the link between table times and reading speed is weak, and claiming transfer would be dishonest. What the tables genuinely build is the habit of not twitching toward every object and of trusting the periphery. As a warm-up before reading they are fine. As a substitute for reading they are not.

## Exercise

Today, 12-14 minutes.

1. \`/speedreading/schulte/\` — 4 rounds on a 5×5 table. Keep your gaze centred and find the numbers peripherally. Record each round's time; rest 30 seconds between rounds.
2. Take a text in a narrow column — a news site, a two-column PDF, a paperback. Read for 5 minutes placing exactly two stops per line, at roughly one third and two thirds of its length. Lines will feel like they are collapsing for the first minute or two. That is expected.
3. Read a wide-column text normally for 3 minutes with no rules. Just notice whether the rhythm feels different.
4. Repeat 3-4 times a week. Column width matters more than effort: on a 90-character line, two fixations do not work.

## What this gives you, and what it does not

Saving fixations is the most real source of speed gain in the whole speed-reading repertoire — and it is still bounded. The ceiling sits about where the ceiling of the whole skill sits: 400-500 wpm on undemanding material with comprehension intact. Your visual field does not widen, you will not learn to photograph a page, and dense text will still require more stops. What does go away is word-by-word pecking, and reading becomes noticeably less tiring.`,
  },
  'comprehension': {
    ru: `Здесь курс поворачивает. Первые уроки убирали лишние движения; этот — про то, ради чего вы вообще читаете. И здесь придётся сказать неприятное: скорость и понимание связаны обратно, и связь эта не устраняется тренировкой. Обзор Rayner и коллег (2016) сводит десятилетия исследований к простому выводу — при чтении заметно выше примерно 500-600 wpm понимание падает независимо от техники, а «фотографическое чтение» не подтверждается ни одним корректным экспериментом.

Значит, дальше выигрыш ищут не в глазах, а в отборе и структуре.

## Не всё нужно читать одинаково

Главный рычаг взрослого чтения — решение о режиме, принятое до чтения. Их примерно три.

Разведка: 2-3 минуты на текст любого объёма. Заголовки, первые и последние абзацы разделов, выделения, выводы. Цель — ответить на один вопрос: стоит ли это читать целиком.

Поиск: вы знаете, что ищете, и идёте за конкретным фрагментом, игнорируя всё остальное. Это не чтение и не должно им притворяться.

Сплошное чтение: медленно, с голосом, с возвратами, с заметками. Дорогой режим, и именно поэтому его нужно тратить осознанно.

Большая часть потерянного времени — это сплошное чтение там, где хватило бы разведки. Никакая техника не компенсирует неправильно выбранный режим.

## Вопрос перед текстом

Понимание резко улучшается, если до чтения сформулировать, что вы хотите из текста получить. Один вопрос, записанный в одну строку. Он превращает чтение из пассивного приёма в поиск ответа: внимание получает критерий важности, и текст сам расслаивается на нужное и фоновое.

Побочный эффект: холостые возвраты почти исчезают, потому что становится ясно, что можно не перечитывать.

## Держать структуру, а не слова

Плотный нон-фикшн почти всегда построен как иерархия: тезис, аргументы, оговорки, следствия. Если вы читаете предложениями, вы держите в памяти список фраз, и он рассыпается через час. Если читаете структурой — «вот утверждение, вот три довода, второй слабый» — вы держите каркас, на который потом можно вернуть детали.

Практический признак, что структура схвачена: вы можете пересказать раздел в трёх предложениях, не заглядывая в текст. Если не получается — дело почти никогда не в скорости чтения, а в том, что вы читали без вопроса и брали всё подряд одинаково внимательно.

## Упражнение

Сегодня, 20 минут.

1. Выберите статью на 10-12 минут чтения. До чтения запишите один вопрос, ради которого вы её открываете.
2. Сначала 2 минуты разведки: заголовки, первый и последний абзацы, выделения. Запишите предполагаемую структуру в 3-4 пункта.
3. Прочитайте текст целиком в нормальном темпе — около 8 минут. По ходу правьте свои 3-4 пункта, если ошиблись.
4. Закройте текст. Три предложения по памяти: ответ на ваш вопрос, главный аргумент, слабое место.
5. Раз в неделю проверяйте себя на \`/speedreading/test/\` — там понимание считается вместе со скоростью, и это единственный способ заметить, что вы разогнались за счёт смысла.

## Что это даёт и чего не даёт

Отбор режима и вопрос перед чтением дают больше сэкономленных часов, чем все глазодвигательные приёмы вместе. Но это не скорость чтения: строка не поедет быстрее. Более того, на нужных текстах вы, скорее всего, замедлитесь — и это правильная сделка. Курс не обещает вам тысячу слов в минуту, потому что таких людей нет. Он обещает, что вы будете тратить сплошное чтение на то, что этого стоит.`,
    en: `This is where the course turns. The earlier lessons removed wasted movement; this one is about the reason you read at all. And it requires saying something unwelcome: speed and comprehension trade off against each other, and training does not dissolve that trade-off. The review by Rayner and colleagues (2016) condenses decades of research into a plain conclusion — much above roughly 500-600 wpm, comprehension drops regardless of technique, and "photographic reading" has never survived a properly controlled test.

So the remaining gains are not in the eyes. They are in selection and structure.

## Not everything deserves the same mode

The biggest lever in adult reading is a decision made before reading starts. There are about three modes.

Reconnaissance: 2-3 minutes on a text of any length. Headings, first and last paragraphs of sections, emphasis, conclusions. It answers one question — is this worth reading in full?

Search: you know what you are looking for and go get that fragment, ignoring everything else. This is not reading and should not pretend to be.

Full reading: slow, with the inner voice on, with deliberate returns and notes. An expensive mode, which is exactly why it should be spent on purpose.

Most wasted reading time is full reading where reconnaissance would have done. No technique compensates for the wrong mode.

## A question before the text

Comprehension improves sharply when you state, before reading, what you want out of the text. One question, written on one line. It turns reading from passive intake into a search for an answer: attention acquires a criterion for importance, and the text separates itself into signal and background.

A side effect: empty regressions largely disappear, because it becomes obvious what does not need rereading.

## Hold the structure, not the sentences

Dense non-fiction is almost always a hierarchy: claim, support, caveats, consequences. If you read sentence by sentence, you are holding a list of phrases in memory, and it falls apart within the hour. If you read structurally — "here is the claim, here are three supports, the second one is weak" — you hold a frame that details can be hung back onto later.

The practical test that you have the structure: you can restate a section in three sentences without looking.

## Exercise

Today, 20 minutes.

1. Pick an article worth 10-12 minutes of reading. Before you start, write down the one question you are opening it for.
2. Spend 2 minutes on reconnaissance: headings, first and last paragraphs, emphasis. Write your predicted structure as 3-4 bullets.
3. Read the whole text at normal pace, about 8 minutes. Correct your 3-4 bullets as you go where you guessed wrong.
4. Close the text. Three sentences from memory: the answer to your question, the main argument, the weakest point.
5. Once a week, check yourself on \`/speedreading/test/\`, where comprehension is scored alongside rate. It is the only way to notice that you sped up by spending meaning.

## What this gives you, and what it does not

Choosing the mode and setting a question saves more hours than every eye-movement technique combined. But it is not reading speed: the line will not move faster. In fact, on the texts that matter you will probably slow down — and that is the right trade. This course does not promise a thousand words a minute, because nobody reads that way. It promises that your expensive reading will go to things that deserve it.`,
  },
  'retention': {
    ru: `Прочитанное и запомненное — разные вещи, и разрыв между ними больше, чем кажется. Через неделю от статьи, прочитанной внимательно, обычно остаётся общее впечатление и одна-две детали. Это не дефект памяти, а её нормальный режим: мозг не хранит то, к чему не возвращается. Значит, последний урок — не про чтение, а про то, что происходит после.

## Почему пересказ работает лучше перечитывания

Устойчивый результат когнитивной психологии: активное извлечение из памяти закрепляет материал заметно сильнее, чем повторное чтение. Классические эксперименты Roediger и Karpicke (2006) показали, что группа, которая после чтения тестировала себя, через неделю вспоминала существенно больше, чем группа, читавшая текст повторно, — хотя вторая была уверена в обратном.

Это важная деталь: перечитывание создаёт ощущение знания. Текст узнаётся, всё кажется знакомым, и возникает ложная уверенность. Попытка вспомнить без текста ощущается труднее и именно поэтому работает.

Вывод простой: закрыть текст и пересказать — эффективнее, чем открыть и пробежать глазами ещё раз.

## Интервалы

Второй рычаг — распределение повторений во времени. Одно возвращение через сутки, следующее через неделю, следующее через месяц дают гораздо больше, чем то же суммарное время, потраченное сразу.

Для чтения это означает скромный ритуал, а не систему карточек на все случаи жизни. Три возврата к одному тексту — обычно потолок разумного. Если материал не заслуживает трёх коротких возвратов, скорее всего, он не заслуживал и сплошного чтения.

## Заметка, которую вы прочитаете

Выписки, скопированные дословно, почти никогда не перечитываются: они не требуют усилия при создании и не несут следов вашего мышления. Работает другой формат — короткая заметка своими словами, из трёх частей: о чём текст в одном предложении, что для меня новое, где я с этим не согласен или чего не понял.

Третий пункт самый ценный. Он фиксирует границу вашего понимания, и именно к нему интересно возвращаться.

## Упражнение

Сегодня и в ближайшие 8 дней, по 5-10 минут.

1. Возьмите текст, прочитанный на прошлом уроке. Закройте его и напишите по памяти три пункта: суть в одном предложении, одно новое, одно спорное. Пишите своими словами; смотреть в текст нельзя.
2. Откройте текст и проверьте себя: 2 минуты. Отметьте, что вы пропустили. Не переписывайте заметку целиком, добавьте одну строку.
3. Через сутки: 3 минуты, вспомните три пункта, не открывая ни текст, ни заметку. Потом сверьтесь.
4. Через неделю: то же самое, 3 минуты. Если на третьем заходе всё вспоминается легко — материал усвоен, дальше возвращаться не нужно.
5. Заведите один файл на все такие заметки. Не систему — просто файл.

## Что это даёт и чего не даёт

Три коротких возврата по 3-5 минут дают удержание, несопоставимое с одним внимательным прочтением, и стоят меньше десяти минут на текст. Но это не фотографическая память и не дословное запоминание: вы будете помнить структуру и выводы, а не формулировки. И это не работает задним числом — к прочитанному полгода назад и не записанному возвращаться поздно.

Здесь же честный итог всего курса. Реалистичный результат шести уроков — уверенные 300-400 wpm на несложных текстах вместо 200-250, меньше холостых возвратов, осознанный выбор режима и то, что прочитанное перестаёт испаряться за неделю. Тысячи слов в минуту не будет ни у вас, ни у авторов курсов, которые это обещают. Зато выигрыш, который есть, остаётся с вами надолго.`,
    en: `Reading something and remembering it are different events, and the gap between them is wider than it feels. A week after carefully reading an article, most people retain a general impression and one or two details. This is not a memory defect; it is memory working normally. The brain does not keep what it never returns to. So the final lesson is not about reading. It is about what happens afterwards.

## Why recall beats rereading

One of the more robust findings in cognitive psychology is that actively retrieving material fixes it far better than reading it again. The classic experiments by Roediger and Karpicke (2006) found that participants who tested themselves after reading recalled substantially more a week later than those who reread the passage — even though the rereading group was more confident of the opposite.

That detail matters. Rereading manufactures a feeling of knowing. The text looks familiar, everything seems already understood, and false confidence follows. Trying to recall without the text feels harder, and that difficulty is precisely why it works.

The practical form is simple: close the text and restate it, rather than opening it and running your eyes over it once more.

## Spacing

The second lever is distributing repetitions over time. One return after a day, another after a week, another after a month beats the same total minutes spent in one sitting.

For reading this means a modest ritual, not a flashcard system covering your whole life. Three returns to a text is usually the sensible ceiling. If the material does not merit three short returns, it probably did not merit full reading either.

## A note you will actually reread

Verbatim highlights are almost never revisited: they cost no effort to make and carry no trace of your thinking. What works is a short note in your own words, in three parts: what the text is about in one sentence, what was new to me, and where I disagree or did not follow.

The third part is the valuable one. It records the edge of your understanding, and that is the part worth coming back to.

## Exercise

Today and over the next 8 days, 5-10 minutes at a time.

1. Take the text from the previous lesson. Close it and write three items from memory: the gist in one sentence, one new thing, one thing you dispute. In your own words, with the text closed.
2. Open the text and check yourself: 2 minutes. Mark what you missed. Do not rewrite the note — add one line.
3. After a day: 3 minutes, recall the three items without opening either the text or the note. Then compare.
4. After a week: the same, 3 minutes. If the third pass comes easily, the material has landed and no further returns are needed.
5. Keep one file for all such notes. Not a system — just a file.

## What this gives you, and what it does not

Three short returns of 3-5 minutes produce retention that a single careful reading cannot approach, at a cost under ten minutes per text. It is not photographic memory and not verbatim recall: you will remember structure and conclusions, not phrasing. And it cannot be applied retroactively — for something read six months ago and never written down, the moment has passed.

This is also the honest summary of the whole course. A realistic outcome of six lessons is a steady 300-400 wpm on undemanding text instead of 200-250, fewer empty regressions, a deliberate choice of reading mode, and material that stops evaporating within a week. A thousand words a minute is not coming — not for you, and not for the people selling it. But the gain that is real tends to stay.`,
  },
}

/** Проза урока на нужном языке или null, если урок ещё не написан. */
export function getSpeedreadingProse(slug: string, locale: Locale): string | null {
  const body = SPEEDREADING_PROSE[slug]?.[locale]?.trim()
  return body ? body : null
}

/** Slug'и уроков, у которых есть проза на обоих языках (для generateStaticParams). */
export function writtenSpeedreadingSlugs(): string[] {
  return Object.entries(SPEEDREADING_PROSE)
    .filter(([, bi]) => bi.ru.trim().length > 0 && bi.en.trim().length > 0)
    .map(([slug]) => slug)
}
