STREAMS.push({icon:'🐍',track:'Foundations Track',title:'Python from Zero (Tools of the Trade)',blurb:'Learn to actually program in Python — before any NumPy, data, or ML. The tools of the trade come first.',lessons:[
{id:'py1',
 title:'Your first Python: variables, lists, and what a "dimension" is',
 body:`
<div class="ground"><span class="gTag">🎯 What Python even is</span>
<p>Before the first line of code: <b>Python is a programming language</b> — a precise way of
writing instructions that a computer executes. Specifically, it is a <b>general-purpose,
interpreted</b> language: general-purpose meaning it runs everything from websites to
telescopes (not just ML), and interpreted meaning a program called the <i>interpreter</i>
reads your file and executes it line by line, immediately — no separate build step, which is
a big part of why it feels so quick to think in. It was created by Guido van Rossum in 1991
and designed around one value above all: <b>readability</b> — code that looks close to plain
English. That design choice is exactly why it became the language of data science and ML.</p>
<p>In ML, Python's role is precise: it is where ML solutions are <b>prototyped, designed, and
orchestrated</b> — the heavy number-crunching itself runs in far more optimized compiled code
that Python directs (an honest distinction this track makes precise in the ML Toolkit
stream). ML work leans on words like <i>list</i>, <i>index</i>, and <i>dimension</i> as if
everyone already knows them, so before we touch NumPy or a single dataset, we learn the tools
of the trade from zero — starting with "what is a variable."</p></div>

<div class="demystify"><b>Demystify the name:</b> Python is named after <i>Monty Python's
Flying Circus</i>, not the snake — van Rossum wanted a name that was short, unique, and
slightly mischievous. The documentation is full of spam-and-eggs jokes for this reason.</div>

<p><b>Everything in this course runs right here in your browser</b> — nothing to install.
But if you ever want to experiment further on your own machine, there is a step-by-step
walkthrough for the standard professional setup:</p>
<p><button class="primary" onclick="renderSetupGuide()">🛠 Set up Python for ML on my machine — step by step</button></p>

<h3>A variable is a labelled box</h3>
<p>A <b>variable</b> is just a name that points at a value, so you can use it later:</p>
<div class="codeSample">age = 31
name = "Ada"
price = 4.50
is_open = True</div>
<p>Those four values show the everyday <b>types</b>: a whole number (<code>int</code>), text
(<code>str</code>, always in quotes), a decimal (<code>float</code>), and a true/false
(<code>bool</code>). You never declare the type — Python reads it from the value.</p>

<h3>A list is an ordered collection — and your first "dimension"</h3>
<p>A <b>list</b> holds several values in order, inside square brackets:</p>
<div class="codeSample">scores = [80, 90, 100]
scores[0]        # 80  — counting starts at 0! this is the "index"
len(scores)      # 3   — how many items</div>
<p>Here is the idea people quietly assume in ML: <b>dimension</b> just means <i>how many
numbers (axes) it takes to describe your data</i>. A single value like <code>90</code> is one
number. A flat <b>list</b> like <code>[80, 90, 100]</code> is <b>one-dimensional</b> — you need
one index to reach an item. A <b>list of lists</b> — a grid — is <b>two-dimensional</b>: rows
and columns, reached with two indices:</p>
<div class="codeSample">grid = [[1, 2, 3],
        [4, 5, 6]]
grid[1][2]       # 6  — row 1, column 2
len(grid)        # 2  — number of rows
len(grid[0])     # 3  — number of columns</div>
<div class="demystify"><b>Demystify "dimension":</b> it is not a spooky word. A table of data
with <b>n rows and m columns</b> is "n examples, each described by m numbers" — that <i>m</i>
is the number of dimensions (also called <i>features</i>) of each example. When later lessons
say "a point in 3-dimensional space," they just mean a list of 3 numbers. When they say
"300-dimensional," they mean a list of 300 numbers. Same idea, bigger list.</div>

<h3>Loops and functions — doing something to every item</h3>
<p>A <b>loop</b> repeats work; a <b>function</b> is a reusable named recipe that takes inputs and
<code>return</code>s a result:</p>
<div class="codeSample">def average(nums):
    return sum(nums) / len(nums)

average([80, 90, 100])   # 90.0</div>
<p><code>sum()</code> and <code>len()</code> are built in. In the exercise you'll use exactly
these tools — no libraries, just Python — to prove the ideas stuck.</p>`,
 docs:[['The Python Tutorial — official','https://docs.python.org/3/tutorial/'],['Python for absolute beginners','https://wiki.python.org/moin/BeginnersGuide/NonProgrammers']],
 quiz:{title:'Quick check — the tools of the trade',questions:[
   {q:'What kind of thing is Python?',
    options:['A spreadsheet application','A general-purpose, interpreted programming language designed for readability','A database','An operating system'],
    answer:1,
    why:'A language for writing instructions a computer executes — run line by line by an interpreter, designed to read close to plain English, and used far beyond ML.'},
   {q:'A variable is best described as:',
    options:['A math equation that must be solved','A name that points at a value so you can reuse it','A type of loop','A file on disk'],
    answer:1,
    why:'Assignment like age = 31 makes the name "age" refer to the value 31. No type declaration needed — Python infers it.'},
   {q:'For scores = [80, 90, 100], what is scores[0] and len(scores)?',
    options:['90 and 3','80 and 3','80 and 2','100 and 3'],
    answer:1,
    why:'Indexing starts at 0, so scores[0] is the first item, 80. len() counts the items: 3.'},
   {q:'In the way ML uses the word, the "dimension" of a data point means:',
    options:['How large the numbers are','How many independent numbers (axes/features) it takes to describe it','How much memory it uses','How many decimal places it has'],
    answer:1,
    why:'A list of 3 numbers is a 3-dimensional point; a list of 300 is 300-dimensional. Dimension = how many values describe each example.'}
 ]},
 exs:[{title:'Variables, lists, and dimensions — pure Python (no libraries)',
   lang:'python',
   prompt:`Use only plain Python — no imports. Fill in the blanks so the program:
   <ol>
   <li>makes a list <code>scores = [80, 90, 100]</code>,</li>
   <li>computes their <b>average</b> into <code>avg</code> using <code>sum()</code> and <code>len()</code> (it should be <code>90.0</code>),</li>
   <li>makes the 2-D grid <code>grid = [[1, 2, 3], [4, 5, 6]]</code>,</li>
   <li>sets <code>rows</code> to the number of rows and <code>cols</code> to the number of columns (its two <b>dimensions</b>),</li>
   </ol>
   then prints them. Reminder: <code>len(grid)</code> is the row count; <code>len(grid[0])</code> is the column count.`,
   starter:`# Pure Python — no imports needed.

# 1) A list of three scores
scores =

# 2) Their average (use sum() and len())
avg =

# 3) A 2-D grid: 2 rows, 3 columns
grid =

# 4) Its two dimensions
rows =
cols =

print("avg =", avg, " rows =", rows, " cols =", cols)
`,
   solution:`# Pure Python — no imports needed.

# 1) A list of three scores
scores = [80, 90, 100]

# 2) Their average (use sum() and len())
avg = sum(scores) / len(scores)

# 3) A 2-D grid: 2 rows, 3 columns
grid = [[1, 2, 3], [4, 5, 6]]

# 4) Its two dimensions
rows = len(grid)
cols = len(grid[0])

print("avg =", avg, " rows =", rows, " cols =", cols)
`,
   tests:[
     {d:'scores is the list [80, 90, 100]',expr:'scores == [80, 90, 100]'},
     {d:'avg is 90.0 (sum divided by count)',expr:'abs(avg - 90.0) < 1e-9'},
     {d:'grid has 2 rows and 3 columns',expr:'len(grid) == 2 and len(grid[0]) == 3'},
     {d:'rows is 2 (the first dimension)',expr:'rows == 2'},
     {d:'cols is 3 (the second dimension)',expr:'cols == 3'},
     {d:'the program prints its results',expr:'"avg" in _stdout and "rows" in _stdout'}
   ],
   hints:[
     'A list is written with square brackets: scores = [80, 90, 100]. No import needed.',
     'The average is the sum divided by the count: sum(scores) / len(scores).',
     'For the grid, len(grid) counts the rows (2); len(grid[0]) counts the columns of the first row (3).'
   ]}]},

{id:'py8',
 title:'Lists in depth: slicing, negative indexes, and growing lists',
 body:`
<div class="ground"><span class="gTag">🎯 Why go deeper on lists</span>
<p>Lists are the container you will touch most, and three of their tricks — <b>slicing</b>,
<b>negative indexes</b>, and <b>mutation</b> — appear constantly in real code (and NumPy
borrows the exact same notation, so learning it here pays twice).</p></div>

<h3>Negative indexes: counting from the end</h3>
<div class="codeSample">nums = [10, 20, 30, 40, 50]
nums[0]      # 10  — first
nums[-1]     # 50  — LAST (minus means "from the end")
nums[-2]     # 40  — second to last</div>
<p><code>nums[-1]</code> is how Python code says "the last item" without knowing the length —
you will see it everywhere.</p>

<h3>Slicing: a sub-list by range</h3>
<div class="codeSample">nums[1:4]    # [20, 30, 40]  — start included, END EXCLUDED
nums[:2]     # [10, 20]      — from the beginning
nums[2:]     # [30, 40, 50]  — to the end
nums[:]      # a COPY of the whole list</div>
<p>The rule to burn in: <b>start included, end excluded</b> — the same convention as
<code>range(a, b)</code>, and the same slice notation NumPy uses on whole datasets
(<code>X[:, 0]</code> is this exact syntax, with a comma). Why exclusive ends? So
<code>nums[:k]</code> and <code>nums[k:]</code> split a list cleanly with no overlap — you
will use precisely this to split data into train and test sets later.</p>

<h3>Mutation: lists can change</h3>
<div class="codeSample">nums.append(60)      # grows the list in place → [10, 20, 30, 40, 50, 60]
nums[0] = 99         # replaces an item in place
30 in nums           # True — membership test</div>
<p>A list is a living object: <code>append</code> grows it, assignment by index rewrites a
slot. Contrast with numbers and strings, which never change in place. One classic
consequence, flagged now so it never bites you: <code>b = a</code> does <b>not</b> copy a
list — both names point at the <i>same</i> list, and changing one "changes" the other.
An actual copy is <code>b = a[:]</code>.</p>

<div class="demystify"><b>Demystify "index out of range":</b> the error just means you asked
for a slot that does not exist (like <code>nums[10]</code> in a 6-item list). Note the
asymmetry: <i>indexing</i> past the end is an error, but <i>slicing</i> past the end is
forgiven (<code>nums[2:100]</code> quietly stops at the end) — a deliberate design choice
that makes slice-based code robust.</div>`,
 docs:[['Python tutorial — lists','https://docs.python.org/3/tutorial/introduction.html#lists']],
 quiz:{title:'Quick check',questions:[
   {q:'For nums = [10, 20, 30, 40, 50], what is nums[-1] and nums[1:3]?',
    options:['50 and [20, 30]','50 and [20, 30, 40]','40 and [10, 20]','An error and [20, 30]'],answer:0,
    why:'-1 means last (50). Slices include the start, EXCLUDE the end: indexes 1 and 2 → [20, 30].'},
   {q:'After b = a (where a is a list), appending to b:',
    options:['Leaves a unchanged','Also changes a — both names point at the SAME list; a real copy is a[:]','Raises an error','Creates a new list automatically'],answer:1,
    why:'Assignment shares the object; it does not copy. This is the classic beginner trap, defused now.'},
   {q:'Why does Python exclude the end index in slices (nums[1:4] stops at 3)?',
    options:['A historical accident with no benefit','So nums[:k] and nums[k:] split cleanly with no overlap — like train/test splits later','To make slices shorter','Because indexes start at 1'],answer:1,
    why:'Half-open ranges compose perfectly: the two halves share no element and miss none. Data splitting uses exactly this.'}
 ]},
 exs:[{title:'Slice, grow, and split like a data scientist',
   lang:'python',
   prompt:`Given <code>nums = [10, 20, 30, 40, 50]</code>:
   <ol>
   <li><code>last</code> — the last item via a negative index (no <code>len()</code>),</li>
   <li><code>middle</code> — the slice <code>[20, 30, 40]</code>,</li>
   <li>append <code>60</code>, then set <code>n</code> to the new length (6),</li>
   <li><code>train, test</code> — split the (grown) list into the first 4 items and the rest, using two slices with the same cut point,</li>
   <li><code>copy_differs</code> — make <code>c = nums[:]</code> (a real copy), append <code>99</code> to <code>c</code>, and set this to <code>True</code> if <code>len(c) != len(nums)</code> (proving the copy is independent).</li>
   </ol>`,
   starter:`nums = [10, 20, 30, 40, 50]

# 1) Last item, negative index
last =

# 2) The middle three: [20, 30, 40]
middle =

# 3) Grow the list, then measure it
nums.append(60)
n =

# 4) Split at position 4: first four / the rest
train =
test =

# 5) A real copy is independent
c = nums[:]
c.append(99)
copy_differs =

print(last, middle, n, train, test, copy_differs)
`,
   solution:`nums = [10, 20, 30, 40, 50]

# 1) Last item, negative index
last = nums[-1]

# 2) The middle three: [20, 30, 40]
middle = nums[1:4]

# 3) Grow the list, then measure it
nums.append(60)
n = len(nums)

# 4) Split at position 4: first four / the rest
train = nums[:4]
test = nums[4:]

# 5) A real copy is independent
c = nums[:]
c.append(99)
copy_differs = len(c) != len(nums)

print(last, middle, n, train, test, copy_differs)
`,
   tests:[
     {d:'last is 50, found with a negative index',expr:'last == 50'},
     {d:'middle is [20, 30, 40] — start included, end excluded',expr:'middle == [20, 30, 40]'},
     {d:'after append, the list has 6 items',expr:'n == 6'},
     {d:'train/test split cleanly: [10,20,30,40] and [50,60]',expr:'train == [10,20,30,40] and test == [50,60]'},
     {d:'the copy grew independently — nums is untouched by c.append',expr:'copy_differs == True and len(nums) == 6'}
   ],
   hints:[
     'last = nums[-1]; middle = nums[1:4] — remember the end index is excluded.',
     'The split idiom: train = nums[:4], test = nums[4:]. Same cut point, no overlap, nothing missed.',
     'nums[:] makes a genuine copy; plain c = nums would have shared the same list and the lengths would match.'
   ]}]},

{id:'py2',
 title:'Making decisions: booleans and if / elif / else',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Programs make choices. A <b>boolean</b> is a value that is either <code>True</code> or
<code>False</code>, and comparisons produce them: <code>3 > 5</code> is <code>False</code>,
<code>age >= 18</code> might be <code>True</code>. An <code>if</code> statement runs a block
only when its condition is <code>True</code>.</p></div>
<div class="codeSample">temp = 30
if temp > 25:
    label = "hot"
elif temp > 15:
    label = "mild"
else:
    label = "cold"
# label is "hot"</div>
<p>Read it top to bottom: Python checks each condition in order and runs the <b>first</b> one
that is true, skipping the rest. <code>elif</code> means "else, if…"; <code>else</code> is the
catch-all. The comparison operators produce booleans: <code>==</code> (equal), <code>!=</code>
(not equal), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>.</p>

<h3>Logical operators: combining conditions</h3>
<p>Real decisions need more than one test at a time, and the three <b>logical operators</b>
join booleans together:</p>
<div class="codeSample">and   True only if BOTH sides are true     age >= 18 and has_ticket
or    True if EITHER side is true          is_weekend or is_holiday
not   flips a boolean                      not is_empty</div>
<p>So <code>if age >= 13 and age &lt;= 19:</code> is "a teenager"; <code>if not found:</code>
runs when <code>found</code> is False. A handy shortcut Python allows: <code>13 &lt;= age &lt;= 19</code>
chains comparisons directly. In ML you will write these constantly — "keep the row if it is
<i>not</i> missing <b>and</b> the value is positive." Two quiet rules worth knowing:
<code>and</code>/<code>or</code> read left to right and <b>stop early</b> once the answer is
decided (short-circuit), and any value can be treated as truthy/falsy — <code>0</code>, an
empty list <code>[]</code>, and an empty string <code>""</code> all count as <b>False</b>.</p>

<div class="demystify"><b>Watch out:</b> <code>=</code> assigns a value; <code>==</code> asks
"are these equal?". Mixing them up is the single most common beginner bug. And
<code>and</code>/<code>or</code>/<code>not</code> are words in Python — not <code>&amp;&amp;</code>,
<code>||</code>, <code>!</code> as in some other languages.</div>`,
 quiz:{title:'Quick check',questions:[
   {q:'What does the expression 3 > 5 evaluate to?',
    options:['True','False','3','An error'],answer:1,
    why:'3 is not greater than 5, so the comparison is False — a boolean value.'},
   {q:'"age >= 18 and has_ticket" is True when:',
    options:['Either condition is true','BOTH conditions are true — that is what "and" requires','Neither is true','Always'],answer:1,
    why:'"and" needs both sides true; "or" needs just one; "not" flips a boolean. These three combine conditions.'},
   {q:'In an if / elif / else chain, how many blocks run?',
    options:['All whose conditions are true','Exactly one — the first true condition (or else)','Always the else block','None until the end'],answer:1,
    why:'Python runs the first branch whose condition is True and skips the rest; else runs only if none matched.'}
 ]},
 exs:[{title:'Write a classifier with if / elif / else',
   lang:'python',
   prompt:`Write a function <code>classify(n)</code> that returns the string <code>"positive"</code>
   if <code>n</code> is greater than 0, <code>"negative"</code> if it is less than 0, and
   <code>"zero"</code> otherwise. Then set <code>passing</code> to a boolean: <code>True</code>
   if <code>score</code> is at least 60.`,
   starter:`def classify(n):
    # return "positive", "negative", or "zero"
    pass

score = 72
passing =            # True if score >= 60

print(classify(5), classify(-2), classify(0), passing)
`,
   solution:`def classify(n):
    if n > 0:
        return "positive"
    elif n < 0:
        return "negative"
    else:
        return "zero"

score = 72
passing = score >= 60

print(classify(5), classify(-2), classify(0), passing)
`,
   tests:[
     {d:'classify(5) is "positive"',expr:'classify(5) == "positive"'},
     {d:'classify(-2) is "negative"',expr:'classify(-2) == "negative"'},
     {d:'classify(0) is "zero"',expr:'classify(0) == "zero"'},
     {d:'passing is True for score 72',expr:'passing is True'}
   ],
   hints:[
     'Inside classify, use if n > 0: return "positive" — a return immediately ends the function.',
     'Add elif n < 0: return "negative" and else: return "zero".',
     'passing is just the comparison itself: passing = score >= 60 (that expression is already a boolean).'
   ]}]},

{id:'pyop',
 title:'Operators: assignment shortcuts, division, and the one-line if',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A handful of compact operators show up in almost every program (and every loop you are about
to write). None is hard; they are just shorthand. Meeting them now means the code ahead reads
smoothly instead of looking cryptic.</p></div>

<h3>Augmented assignment: update a variable in place</h3>
<div class="codeSample">total = 10
total += 5     # same as  total = total + 5   →  15
total -= 3     #                              →  12
total *= 2     #                              →  24
total /= 4     #                              →  6.0</div>
<p><code>+=</code> reads "add to." It is the exact pattern behind an <b>accumulator</b> — start
at a value and keep updating it — which is how a loop builds a sum, a count, or (later) how
training keeps adjusting a weight: <code>weight -= learning_rate * gradient</code>. You will use
<code>+=</code> in the very next lesson.</p>

<h3>Integer division // and remainder %</h3>
<div class="codeSample">17 / 5    # 3.4   — normal division (always a float)
17 // 5   # 3     — floor division: how many whole 5s fit
17 % 5    # 2     — modulo: the remainder left over</div>
<p>These two are workhorses in ML plumbing: <code>%</code> tests divisibility
(<code>n % 2 == 0</code> means "even"), and both split data into <b>batches</b> — "how many
full batches of 32?" is <code>n // 32</code>, and <code>i % 32</code> tells you your position
inside the current batch.</p>

<h3>The ternary: an <code>if</code> that fits on one line</h3>
<div class="codeSample">label = "even" if n % 2 == 0 else "odd"</div>
<p>The <b>conditional expression</b> (nicknamed the "ternary") is a compact
<code>if</code>/<code>else</code> that <i>produces a value</i>. Read it as: "<code>label</code>
is <code>"even"</code> <b>if</b> the condition holds, <b>else</b> <code>"odd"</code>." It is the
same logic as a full if-block, squeezed into one expression — handy when you just need to pick
between two values.</p>

<div class="demystify"><b>Demystify <code>%</code>:</b> "modulo" is just the remainder from
division, the thing you learned as "17 divided by 5 is 3 remainder 2." Nothing more — but that
remainder is secretly everywhere: even/odd, wrapping around a clock, cycling through colors,
and slicing data into batches.</div>`,
 docs:[['Python operators','https://docs.python.org/3/reference/expressions.html#operator-precedence']],
 quiz:{title:'Quick check',questions:[
   {q:'After total = 10; total += 5; total *= 2, what is total?',
    options:['20','30 — first 10 + 5 = 15, then 15 * 2 = 30','25','17'],answer:1,
    why:'+= updates in place (10 → 15), then *= doubles it (15 → 30). Augmented assignment is just "do the op, then store back."'},
   {q:'17 % 5 evaluates to:',
    options:['3','2 — the remainder after taking out three 5s (15), leaving 2','3.4','85'],answer:1,
    why:'Modulo is the remainder. 17 // 5 = 3 (whole 5s), and 17 − 15 = 2 is left over. n % 2 == 0 is the standard "is it even?" test.'},
   {q:'The expression  "yes" if x > 0 else "no"  is:',
    options:['A syntax error','A ternary — a compact if/else that produces one of two values','A loop','A function call'],answer:1,
    why:'The conditional expression picks a value based on a condition, all on one line — the same logic as a full if/else block.'}
 ]},
 exs:[{title:'Use the compact operators',
   lang:'python',
   prompt:`Pure Python:
   <ol>
   <li>Start <code>total = 10</code>; use <code>+=</code> to add 5, then <code>*=</code> to double it — leave the result in <code>total</code> (30),</li>
   <li><code>whole</code> = <code>17 // 5</code> and <code>rem</code> = <code>17 % 5</code> (3 and 2),</li>
   <li><code>parity</code> — use a ternary to set it to <code>"even"</code> if <code>num</code> is even, else <code>"odd"</code> (for <code>num = 4</code> → "even").</li>
   </ol>`,
   starter:`total = 10
# add 5 to total, then double it, using += and *=


# whole-number quotient and remainder of 17 divided by 5
whole =
rem =

num = 4
# set parity using a ternary
parity =

print(total, whole, rem, parity)
`,
   solution:`total = 10
# add 5, then double, using += and *=
total += 5
total *= 2

whole = 17 // 5      # 17 // 5
rem = 17 % 5         # 17 % 5

num = 4
parity = "even" if num % 2 == 0 else "odd"

print(total, whole, rem, parity)
`,
   tests:[
     {d:'total is 30 (10 += 5 → 15, then *= 2 → 30)',expr:'total == 30'},
     {d:'17 // 5 is 3 (whole fives)',expr:'whole == 3'},
     {d:'17 % 5 is 2 (the remainder)',expr:'rem == 2'},
     {d:'the ternary set parity to "even" for num = 4',expr:'parity == "even"'}
   ],
   hints:[
     'total += 5 then total *= 2. Augmented assignment updates the variable in place.',
     '// is floor division (3), % is the remainder (2).',
     'parity = "even" if num % 2 == 0 else "odd" — the value before "if", the condition, then "else" the other value.'
   ]}]},

{id:'py3',
 title:'Repeating work: loops',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A <b>loop</b> does something once for each item, so you never copy-paste the same line.
A <code>for</code> loop walks through a collection; <code>range(a, b)</code> generates the
numbers <code>a, a+1, …, b-1</code> (the end is <i>excluded</i>).</p></div>
<div class="codeSample">total = 0
for x in [10, 20, 30]:
    total += x        # total becomes 10, then 30, then 60
# total is 60

for i in range(1, 4):
    print(i)          # prints 1, 2, 3</div>
<p>The pattern <code>total += x</code> (short for <code>total = total + x</code>) is an
<b>accumulator</b>: start at a base value, then update it each pass. Summing, counting, and
finding a maximum are all accumulators — and later, <i>training a model</i> is one too.</p>
<p>You can loop over <i>any</i> collection this way, not just lists — including a <b>dictionary
(a map)</b>, where you often want each key <i>and</i> its value together with
<code>for key, value in d.items()</code>. Dictionaries come a couple of lessons from now, so we
cover that pattern in full there — just know that <code>for</code> is not list-only.</p>

<h3>while: loop until a condition changes</h3>
<p><code>for</code> is for "once per item." Its sibling <code>while</code> is for "as long as
this is true" — when you do not know in advance how many repetitions you need:</p>
<div class="codeSample">x = 100.0
steps = 0
while x > 1:          # keep going as long as the condition holds
    x = x / 2
    steps += 1
# x is 0.78125, steps is 7</div>
<p>That shape — <i>repeat until good enough</i> — is exactly how model training loops work
("keep stepping downhill while the error is still improving"). Two control words work in any
loop: <code>break</code> exits the loop immediately; <code>continue</code> skips to the next
pass. And the classic hazard, named now: a <code>while</code> whose condition never becomes
false runs forever — always make sure something inside the loop moves it toward stopping.</p>`,
 quiz:{title:'Quick check',questions:[
   {q:'When do you reach for while instead of for?',
    options:['Never; they are identical','When you do not know the number of repetitions in advance — repeat AS LONG AS a condition holds (like "train until good enough")','When looping over a list','Only for infinite loops'],answer:1,
    why:'for = once per item; while = until the condition changes. Training loops are the canonical ML example of the second.'},
   {q:'Which numbers does range(1, 4) produce?',
    options:['1, 2, 3, 4','1, 2, 3','0, 1, 2, 3','2, 3, 4'],answer:1,
    why:'range starts at the first number and stops BEFORE the second: 1, 2, 3.'},
   {q:'What is total += x short for?',
    options:['total = x','total = total + x','total = total * x','x = x + total'],answer:1,
    why:'+= updates the variable in place: total = total + x. It is the accumulator pattern.'}
 ]},
 exs:[{title:'Sum the even numbers with a loop',
   lang:'python',
   prompt:`Using a <code>for</code> loop over <code>range(1, 11)</code> (the numbers 1..10), add up
   just the <b>even</b> numbers into <code>total</code> and count how many there were into
   <code>count</code>. (A number is even when <code>x % 2 == 0</code>.) Expected: total 30, count 5.`,
   starter:`total = 0
count = 0
for x in range(1, 11):
    # if x is even, add it to total and add 1 to count
    pass

print("total =", total, " count =", count)
`,
   solution:`total = 0
count = 0
for x in range(1, 11):
    if x % 2 == 0:
        total += x
        count += 1

print("total =", total, " count =", count)
`,
   tests:[
     {d:'total is 30 (2+4+6+8+10)',expr:'total == 30'},
     {d:'count is 5 (there are five evens)',expr:'count == 5'},
     {d:'the program prints its results',expr:'"total" in _stdout'}
   ],
   hints:[
     'The even test is x % 2 == 0 (the remainder when divided by 2 is zero).',
     'Inside the if, do two accumulations: total += x and count += 1.',
     'range(1, 11) stops at 10, so the evens are 2, 4, 6, 8, 10 → total 30, count 5.'
   ]}]},

{id:'pycomp',
 title:'Comprehensions: building lists in one line (the ML workhorse)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>You just wrote loops that build a result — start an empty list, loop, append. That pattern is
so common Python gives it a one-line form: the <b>comprehension</b>. It is the single most
common line of code in data and ML work — every dataset transformation you will read uses it —
so learning to write and read it now pays off on every lesson after this one.</p></div>

<h3>From a loop to a comprehension</h3>
<div class="codeSample"># the long way — build a list with a loop
squares = []
for x in range(5):
    squares.append(x * x)

# the same thing, as a comprehension
squares = [x * x for x in range(5)]     # [0, 1, 4, 9, 16]</div>
<p>Read it left to right: "<code>x * x</code> — <b>for each</b> <code>x</code> <b>in</b>
<code>range(5)</code>." The <i>expression</i> comes first (what to put in the list), then the
loop. It builds the whole list in one readable line.</p>

<h3>Filtering: add an <code>if</code></h3>
<div class="codeSample">evens = [x for x in range(10) if x % 2 == 0]     # [0, 2, 4, 6, 8]
big = [n for n in [4, 120, 7, 300] if n > 100]   # [120, 300]</div>
<p>A trailing <code>if</code> keeps only the items that pass — "for each x, <b>if</b> it is even,
include it." This is exactly how you will filter rows of data later.</p>

<h3>The <code>_</code> throwaway, and "do this N times"</h3>
<div class="codeSample">zeros = [0 for _ in range(4)]                    # [0, 0, 0, 0]
rolls = [random.randint(1, 6) for _ in range(1000)]   # roll a die 1000 times</div>
<p>When you do <b>not need the loop variable</b> — you just want to repeat something a set number
of times — the convention is to name it <code>_</code> (a plain underscore), Python's way of
saying "I am ignoring this." That <code>[... for _ in range(n)]</code> reads as "do this
<code>n</code> times and collect the results."</p>

<h3>Generator expressions: feeding <code>sum</code>, <code>min</code>, <code>max</code></h3>
<div class="codeSample">total = sum(x * x for x in nums)          # no [ ] needed inside sum()
count_big = sum(1 for x in nums if x > 100)   # COUNT the items over 100</div>
<p>Drop the square brackets and you have a <b>generator expression</b> — the same idea, but it
feeds values one at a time straight into <code>sum</code>/<code>min</code>/<code>max</code>
without building a list first (lighter on memory for big data). One idiom is worth memorizing
because it appears constantly: <code>sum(1 for x in items if condition)</code> <b>counts</b> how
many items match — you add <code>1</code> for each one that passes. (You will see this exact line
counting die rolls and matching data in the probability stream.)</p>

<h3>Nested comprehensions: building a grid (a matrix)</h3>
<p>Put a comprehension <i>inside</i> another and you build a <b>list of lists</b> — a grid. This
is exactly how you will build matrices in the linear-algebra stream:</p>
<div class="codeSample">grid = [[r * c for c in range(3)] for r in range(2)]
# [[0, 0, 0], [0, 1, 2]]   — outer loop makes rows, inner loop makes each row</div>
<p>Read it outside-in: the <b>outer</b> <code>for r in range(2)</code> makes two rows; for each
row, the <b>inner</b> <code>[... for c in range(3)]</code> builds that row's three cells. It is
two nested loops folded together. A related move you will see is looping twice to <i>flatten</i>
— <code>[x for row in grid for x in row]</code> walks every row, then every cell in it, into one
flat list. (These are the fanciest comprehensions we use; if one is hard to read, unfold it into
plain nested for-loops.)</p>

<div class="demystify"><b>Demystify the comprehension:</b> it is <i>just a for-loop folded onto
one line</i> — nothing new is happening, the machine still loops. If a comprehension ever looks
confusing, mentally unfold it back into the empty-list-loop-append form and it becomes obvious.
Dicts and sets have the same shorthand: <code>{k: v for ...}</code> and <code>{x for ...}</code>.</div>`,
 docs:[['Python tutorial — list comprehensions','https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions']],
 quiz:{title:'Quick check',questions:[
   {q:'[x * 2 for x in range(4)] produces:',
    options:['[0, 1, 2, 3]','[0, 2, 4, 6] — double each number from 0 to 3','[2, 4, 6, 8]','8'],answer:1,
    why:'For each x in 0,1,2,3, the expression x*2 gives 0,2,4,6. A comprehension is a loop that builds a list.'},
   {q:'In  [0 for _ in range(5)]  , what is the underscore _ for?',
    options:['A syntax error','A throwaway name for the loop variable you do not need — "just do this 5 times"','It multiplies by 5','It reverses the list'],answer:1,
    why:'_ is the convention for "I am ignoring this variable." Here you just want to repeat 0 five times: [0,0,0,0,0].'},
   {q:'What does  sum(1 for x in data if x > 10)  compute?',
    options:['The total of all values','The COUNT of items greater than 10 — it adds 1 for each match','The largest value','10'],answer:1,
    why:'Adding 1 for every item that passes the condition counts them. This "sum(1 for ... if ...)" idiom is everywhere in data code.'}
 ]},
 exs:[{title:'Write your first comprehensions',
   lang:'python',
   prompt:`Use comprehensions (no manual append loops):
   <ol>
   <li><code>squares</code> — the squares of 1..5: <code>[1, 4, 9, 16, 25]</code>,</li>
   <li><code>evens</code> — the even numbers in <code>range(10)</code>: <code>[0, 2, 4, 6, 8]</code>,</li>
   <li><code>count_big</code> — how many numbers in <code>[3, 8, 1, 9, 4]</code> are greater than 4 (use the <code>sum(1 for ...)</code> counting idiom — expect 2),</li>
   <li><code>threes</code> — the number <code>3</code> repeated 4 times using <code>_</code>: <code>[3, 3, 3, 3]</code>.</li>
   </ol>`,
   starter:`nums = [3, 8, 1, 9, 4]

# 1) squares of 1..5
squares =

# 2) even numbers in range(10)
evens =

# 3) count how many nums are > 4 (sum of 1 per match)
count_big =

# 4) the value 3, four times (use _)
threes =

print(squares, evens, count_big, threes)
`,
   solution:`nums = [3, 8, 1, 9, 4]

# 1) squares of 1..5
squares = [x * x for x in range(1, 6)]

# 2) even numbers in range(10)
evens = [x for x in range(10) if x % 2 == 0]

# 3) count how many nums are > 4 (sum of 1 per match)
count_big = sum(1 for x in nums if x > 4)

# 4) the value 3, four times (use _)
threes = [3 for _ in range(4)]

print(squares, evens, count_big, threes)
`,
   tests:[
     {d:'squares is [1, 4, 9, 16, 25]',expr:'squares == [1, 4, 9, 16, 25]'},
     {d:'evens is [0, 2, 4, 6, 8] (filtered with if)',expr:'evens == [0, 2, 4, 6, 8]'},
     {d:'count_big is 2 — the numbers 8 and 9 (the counting idiom)',expr:'count_big == 2'},
     {d:'threes is [3, 3, 3, 3] (repeat with _)',expr:'threes == [3, 3, 3, 3]'}
   ],
   hints:[
     'squares = [x * x for x in range(1, 6)] — expression first, then the for.',
     'Filter with a trailing if: [x for x in range(10) if x % 2 == 0].',
     'Count with sum(1 for x in nums if x > 4); repeat with [3 for _ in range(4)].'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> Rewrite this loop as a single comprehension:<div class="codeSample">result = []
for word in ["cat", "dog", "bird"]:
    result.append(len(word))</div>`,
    solution:`<code>result = [len(word) for word in ["cat", "dog", "bird"]]</code> → <code>[3, 3, 4]</code>.<br>The expression is <code>len(word)</code> (what goes in the list), then the loop <code>for word in [...]</code>. It builds the exact same list as the append-loop, in one line.`},
   {q:`<b>2.</b> Write a comprehension that counts how many numbers in <code>[5, 12, 3, 20, 8]</code> are at least 10. What is the value?`,
    solution:`<code>sum(1 for n in [5, 12, 3, 20, 8] if n >= 10)</code>. The matches are 12 and 20, so it adds 1 twice → <b>2</b>. The <code>sum(1 for ... if ...)</code> pattern is the standard way to count items meeting a condition — you will use it to count die rolls, matching rows, and correct predictions.`}
 ]}},

{id:'py9',
 title:'Indentation: how Python knows where a block begins and ends',
 body:`
<div class="ground"><span class="gTag">🎯 The rule everything else sits on</span>
<p>Before <code>if</code> and loops, you must know Python's most distinctive rule:
<b>indentation is not decoration — it is grammar.</b> Where other languages wrap a block of
code in braces <code>{ }</code>, Python defines a block by <b>how far its lines are indented</b>.
The visual structure IS the logical structure — get the spacing wrong and the program either
crashes or, worse, quietly does the wrong thing.</p></div>

<h3>The two-part rule</h3>
<p><b>1. A colon <code>:</code> announces a block.</b> Lines ending in <code>:</code>
(<code>if …:</code>, <code>for …:</code>, <code>def …:</code>) promise that a block follows.
<b>2. The block is every following line indented one level deeper.</b> The block ends at the
first line that returns to the old indentation. Convention (used by virtually all Python on
earth): one level = <b>4 spaces</b>.</p>
<div class="codeSample">temperature = 30
if temperature > 25:
    print("hot")          # inside the if — indented 4 spaces
    print("stay hydrated")  # still inside — same indentation
print("done")            # back to column 0 → OUTSIDE the if, always runs</div>
<p>Move that last print 4 spaces right and it becomes part of the if — printed only on hot
days. <b>Same characters, different program.</b> That is what "indentation is grammar" means.</p>

<h3>Nesting: levels inside levels</h3>
<div class="codeSample">def count_positives(nums):      # level 0: the def line
    count = 0                   # level 1: inside the function
    for x in nums:              # level 1: still inside the function
        if x > 0:               # level 2: inside the for
            count += 1          # level 3: inside the if
    return count                # level 1: for is over — back out</div>
<p>Read the levels like an outline: each colon opens a deeper level; de-denting closes it.
The <code>return</code> sits at level 1, so it runs after the loop finishes — indent it to
level 3 by accident and the function returns during the first positive number. (This exact
bug has shipped to production at real companies.)</p>

<div class="demystify"><b>Demystify <code>IndentationError</code>:</b> Python telling you the
outline is malformed — a line indented where no block was announced ("unexpected indent"), or
a block promised by a colon but never provided ("expected an indented block"). It is the
easiest error family to fix: make the indentation match the structure you meant. Two rules of
hygiene: never mix tabs and spaces (our editor inserts 4 spaces for Tab), and keep every line
of a block at exactly the same depth.</div>

<h3>The <code>pass</code> keyword: a do-nothing placeholder</h3>
<p>Since every block promised by a colon <b>must</b> contain at least one line, Python gives you
<code>pass</code> — a statement that does <i>nothing at all</i>. Its only job is to be a valid,
empty body while you decide what to write:</p>
<div class="codeSample">def not_written_yet():
    pass          # a placeholder — the function is legal but empty (returns None)</div>
<p>You will see <code>pass</code> in the starter code of exercises: it marks the spot where
<b>your code goes</b> — delete it and write the real body. It is not printed and does nothing
when run; it simply keeps the block from being empty until you fill it in.</p>

<div class="hardidea">🧠 <b>Why Python chose this.</b> In brace languages, programmers indent
<i>anyway</i> for readability — so code has two structures: the braces (what the machine
reads) and the indentation (what humans read), and they can silently disagree. Python removes
the duplication: one structure, readable by both. It is why Python looks like runnable
pseudocode — and why it won data science.</div>`,
 docs:[['Python tutorial — first steps (indentation)','https://docs.python.org/3/tutorial/introduction.html#first-steps-towards-programming'],['PEP 8 — indentation style','https://peps.python.org/pep-0008/#indentation']],
 quiz:{title:'Quick check',questions:[
   {q:'How does Python know which lines belong to an if-block?',
    options:['Curly braces around them','They are indented one level deeper than the if, until a line returns to the old depth','They are on the same line','A special end keyword'],answer:1,
    why:'The colon announces the block; the deeper-indented lines are its body; de-denting closes it. Indentation IS the grammar.'},
   {q:'In count_positives, if "return count" were indented to sit inside the for-loop, the function would:',
    options:['Work the same','Return during the FIRST iteration — a silent logic bug, not an error','Raise IndentationError','Run faster'],answer:1,
    why:'It would still be legal Python — just wrong. Indentation bugs that parse cleanly are the dangerous kind; reading levels like an outline catches them.'},
   {q:'The standard indentation unit in Python is:',
    options:['1 space','4 spaces (never mixing tabs and spaces)','A tab character always','8 spaces'],answer:1,
    why:'Four spaces is the universal convention (PEP 8). Mixing tabs and spaces is the classic source of phantom IndentationErrors.'}
 ]},
 exs:[{title:'Three levels deep: prove you control the blocks',
   lang:'python',
   prompt:`Write two functions whose correctness depends entirely on indentation:
   <ol>
   <li><code>count_positives(nums)</code> — a <code>for</code> loop with an <code>if</code> inside it, counting values > 0. The <code>return</code> must sit at function level (after the loop!) — <code>count_positives([1, -2, 3])</code> → 2.</li>
   <li><code>first_negative(nums)</code> — loop through, and <code>return x</code> <i>inside</i> the if this time (returning early is CORRECT here, the moment a negative is found); return <code>None</code> after the loop if there is none — <code>first_negative([5, -7, 9])</code> → -7.</li>
   </ol>
   The two functions are mirror images: one return belongs outside the loop, one inside the if. Indentation is the only thing expressing that difference.`,
   starter:`def count_positives(nums):
    count = 0
    # for each x in nums:
    #     if x > 0:
    #         add 1 to count
    # return count  <-- AFTER the loop (function level)
    pass

def first_negative(nums):
    # for each x in nums:
    #     if x < 0:
    #         return x  <-- INSIDE the if (early return is correct here)
    # return None  <-- only reached if the loop finds nothing
    pass

print(count_positives([1, -2, 3]), first_negative([5, -7, 9]))
`,
   solution:`def count_positives(nums):
    count = 0
    for x in nums:
        if x > 0:
            count += 1
    return count

def first_negative(nums):
    for x in nums:
        if x < 0:
            return x
    return None

print(count_positives([1, -2, 3]), first_negative([5, -7, 9]))
`,
   tests:[
     {d:'count_positives([1, -2, 3]) is 2',expr:'count_positives([1, -2, 3]) == 2'},
     {d:'count_positives counts ALL of a long list (return is after the loop)',expr:'count_positives([1, 2, 3, 4, -5]) == 4'},
     {d:'count_positives([]) is 0',expr:'count_positives([]) == 0'},
     {d:'first_negative([5, -7, 9]) is -7 (early return inside the if)',expr:'first_negative([5, -7, 9]) == -7'},
     {d:'first_negative returns None when there is no negative',expr:'first_negative([1, 2, 3]) is None'}
   ],
   hints:[
     'Levels in count_positives: def=0, count/for/return=1, if=2, count+=1 at 3. The return de-dents back to level 1 so it runs after the whole loop.',
     'If count_positives([1,2,3,4,-5]) gives 1 instead of 4, your return is indented inside the loop — de-dent it.',
     'In first_negative the early return x sits at level 3 (inside the if) on purpose; the return None sits at level 1, reached only when the loop completes without finding one.'
   ]}]},

{id:'py4',
 title:'Functions: reusable recipes',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A <b>function</b> is a named recipe: give it inputs (<i>parameters</i>), it does work and
hands back a result with <code>return</code>. Functions let you name an idea once and reuse it
everywhere — the way real programs stay manageable.</p></div>
<div class="codeSample">def average(nums):
    return sum(nums) / len(nums)

average([80, 90, 100])   # 90.0</div>
<p>A function can return more than one value at once as a <b>tuple</b> (an ordered, fixed group
written with commas): <code>return smallest, largest</code>. You unpack it with
<code>lo, hi = ...</code>. Built-ins <code>min()</code>, <code>max()</code>, <code>sum()</code>,
<code>len()</code> save you writing loops for the common cases.</p>

<h3>Scope: variables inside a function stay inside</h3>
<p>A variable created inside a function (including its parameters) is <b>local</b> — it exists
only while that call runs, and vanishes after. The same name outside is a different variable.
This is a feature, not a nuisance: it means a function is a <b>sealed workshop</b> — you can
call it a thousand times without its internal scratch variables leaking out or colliding with
yours. Reading outer ("global") variables from inside works, but the professional habit is:
<b>pass things in as parameters, hand results back with return</b> — functions that secretly
depend on outside variables are the ones that break mysteriously later.</p>`,
 quiz:{title:'Quick check',questions:[
   {q:'What does return do inside a function?',
    options:['Prints the value to the screen','Hands a value back to whoever called the function, and ends it','Saves the value to a file','Starts a loop'],answer:1,
    why:'return produces the function result and immediately exits it. print only displays text; it does not hand back a value.'},
   {q:'What is (1, 3) in the line return 1, 3?',
    options:['A list','A tuple — an ordered group of values','A dictionary','A syntax error'],answer:1,
    why:'Comma-separated values become a tuple, so a function can return several results at once.'},
   {q:'A variable created inside a function:',
    options:['Is visible everywhere in the program','Is LOCAL — it exists only during that call, keeping the function a sealed workshop','Must be declared with a keyword','Is automatically saved to a file'],answer:1,
    why:'Locals vanish when the call ends and never collide with outside names. Pass data in as parameters, hand it back with return.'}
 ]},
 exs:[{title:'Write a stats function that returns three values',
   lang:'python',
   prompt:`Write <code>stats(nums)</code> that returns a tuple <code>(minimum, maximum, average)</code>
   for a list of numbers — use the built-ins <code>min()</code>, <code>max()</code>,
   <code>sum()</code>, <code>len()</code>. For <code>[3, 1, 4, 1, 5]</code> it should return
   <code>(1, 5, 2.8)</code>.`,
   starter:`def stats(nums):
    # return (minimum, maximum, average)
    pass

lo, hi, avg = stats([3, 1, 4, 1, 5])
print("min", lo, "max", hi, "avg", avg)
`,
   solution:`def stats(nums):
    return min(nums), max(nums), sum(nums) / len(nums)

lo, hi, avg = stats([3, 1, 4, 1, 5])
print("min", lo, "max", hi, "avg", avg)
`,
   tests:[
     {d:'minimum is correct',expr:'stats([3,1,4,1,5])[0] == 1'},
     {d:'maximum is correct',expr:'stats([3,1,4,1,5])[1] == 5'},
     {d:'average is 2.8',expr:'abs(stats([3,1,4,1,5])[2] - 2.8) < 1e-9'},
     {d:'works on another list too',expr:'stats([10, 20]) == (10, 20, 15.0)'}
   ],
   hints:[
     'You can return several values separated by commas: return a, b, c.',
     'The three values are min(nums), max(nums), and sum(nums) / len(nums).',
     'The caller unpacks them with lo, hi, avg = stats(...).'
   ]}]},

{id:'pyret',
 title:'Return values in depth: giving results back (including several at once)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A function's <b>return value</b> is the answer it hands back to whoever called it. Getting
comfortable with returns — including Python's ability to return <i>several</i> values at once —
is what lets you build programs out of small, reusable pieces instead of one giant blob.</p></div>

<h3>return hands a value back AND ends the function</h3>
<div class="codeSample">def double(x):
    return x * 2      # hand back x*2, and stop here

y = double(5)         # y is now 10</div>
<p>Two things happen at <code>return</code>: the value is sent back to the caller, and the
function <b>stops immediately</b> — any code after it does not run. That "stop immediately" is
useful: an <b>early return</b> handles a special case up front and exits, so the rest of the
function can assume the normal case.</p>
<div class="codeSample">def safe_divide(a, b):
    if b == 0:
        return None       # bail out early — nothing below runs
    return a / b          # the normal case</div>

<h3>No return? You get None</h3>
<p>A function that never hits a <code>return</code> (or says just <code>return</code> with
nothing after) hands back the special value <b>None</b> — Python's "nothing here." A common
beginner bug: <code>print</code>ing inside a function but forgetting to <code>return</code>, so
the caller receives <code>None</code>. <b>print shows a value; return gives it back.</b> They
are not the same.</p>

<h3>Multiple return values — a Python superpower</h3>
<div class="codeSample">def min_and_max(nums):
    return min(nums), max(nums)     # two values, comma-separated

lo, hi = min_and_max([4, 1, 9, 2])  # unpack into two names: lo=1, hi=9</div>
<p>Unlike many languages, a Python function can return <b>as many values as you like</b> at
once — just separate them with commas. Under the hood they travel as a <b>tuple</b>
(the fixed group you met), and the caller <b>unpacks</b> them into separate names. This is
everywhere in ML: scikit-learn's <code>train_test_split</code> returns four things at once;
a model might return <i>both</i> a prediction and its confidence. If you only want some of
them, the convention is <code>_</code> for "ignore this one": <code>lo, _ = min_and_max(xs)</code>.</p>

<div class="demystify"><b>Demystify "returning multiple values":</b> nothing magic — Python
bundles them into one tuple on the way out (<code>return a, b</code> is <code>return (a, b)</code>),
and unpacks it on the way in (<code>x, y = ...</code>). It just <i>reads</i> like returning
several things, which is why Python code leans on it so heavily.</div>`,
 docs:[['Python tutorial — defining functions','https://docs.python.org/3/tutorial/controlflow.html#defining-functions']],
 quiz:{title:'Quick check',questions:[
   {q:'What does a function return if it never reaches a return statement?',
    options:['0','An empty string','None — the "nothing here" value','It raises an error'],answer:2,
    why:'No return (or a bare return) yields None. Printing inside a function is NOT returning — the caller still gets None.'},
   {q:'def f(): return 1, 2  — what is the type of what f() gives back?',
    options:['Two separate integers','A tuple (1, 2) — comma-separated returns bundle into one tuple','A list','An error'],answer:1,
    why:'return a, b is return (a, b): a tuple. The caller unpacks it with x, y = f(). That is how Python "returns several values."'},
   {q:'Why is an "early return" useful?',
    options:['It runs faster','It handles a special case and exits immediately, so the rest of the function can assume the normal case','It returns twice','Python requires it'],answer:1,
    why:'return stops the function on the spot. Bailing out early on an edge case keeps the main logic clean and unindented.'}
 ]},
 exs:[{title:'Return one value, several values, and None',
   lang:'python',
   prompt:`Write three functions:
   <ol>
   <li><code>square(x)</code> — returns <code>x * x</code>,</li>
   <li><code>divmod2(a, b)</code> — returns <b>two</b> values, the quotient <code>a // b</code> and the remainder <code>a % b</code> (for 17, 5 → (3, 2)),</li>
   <li><code>first_negative(nums)</code> — returns the first negative number (early return inside the loop), or <code>None</code> if there is none,</li>
   </ol>
   then set <code>q, r = divmod2(17, 5)</code> (unpacking the two return values).`,
   starter:`def square(x):
    pass

def divmod2(a, b):
    # return TWO values: quotient and remainder
    pass

def first_negative(nums):
    # return the first negative (early return), else None after the loop
    pass

q, r = divmod2(17, 5)
print(square(4), q, r, first_negative([3, -2, 5]), first_negative([1, 2]))
`,
   solution:`def square(x):
    return x * x

def divmod2(a, b):
    # return TWO values: quotient and remainder
    return a // b, a % b

def first_negative(nums):
    # return the first negative (early return), else None after the loop
    for n in nums:
        if n < 0:
            return n
    return None

q, r = divmod2(17, 5)
print(square(4), q, r, first_negative([3, -2, 5]), first_negative([1, 2]))
`,
   tests:[
     {d:'square(4) returns 16',expr:'square(4) == 16'},
     {d:'divmod2(17, 5) returns the pair (3, 2)',expr:'divmod2(17, 5) == (3, 2)'},
     {d:'unpacking works: q = 3, r = 2',expr:'q == 3 and r == 2'},
     {d:'first_negative finds -2 (early return)',expr:'first_negative([3, -2, 5]) == -2'},
     {d:'first_negative returns None when there is none',expr:'first_negative([1, 2]) is None'}
   ],
   hints:[
     'square just returns x * x.',
     'divmod2 returns two comma-separated values: return a // b, a % b — that is a tuple.',
     'first_negative loops; the moment it sees n < 0 it returns n (early return); after the loop, return None.'
   ]}]},

{id:'pypat',
 title:'Intermediate patterns: zip, enumerate, lambda, any & all',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A short toolkit of intermediate idioms that show up throughout ML code. None is hard once
named, and meeting them here means the math and ML streams never surprise you with unfamiliar
syntax. Each is a small convenience over loops you already know.</p></div>

<h3><code>zip</code>: walk two lists together</h3>
<div class="codeSample">preds  = [3, 5, 7]
actual = [2, 5, 8]
for p, a in zip(preds, actual):     # pairs them up: (3,2), (5,5), (7,8)
    print(p - a)
# common one-liner — the error on each example:
errors = [p - a for p, a in zip(preds, actual)]   # [1, 0, -1]</div>
<p><code>zip(a, b)</code> pairs up matching items so you can loop over both at once. It is
everywhere in ML: comparing predictions to actual labels, pairing features with weights. (You
saw the by-hand version — <code>a[i] * b[i] for i in range(len(a))</code>; <code>zip</code> is
the cleaner way to say the same thing.)</p>

<h3><code>enumerate</code>: the item AND its position</h3>
<div class="codeSample">for i, name in enumerate(["ada", "alan", "grace"]):
    print(i, name)      # 0 ada / 1 alan / 2 grace</div>
<p>When you need both the index and the value, <code>enumerate</code> hands you both — cleaner
than tracking a counter yourself.</p>

<h3><code>lambda</code>: a tiny throwaway function</h3>
<div class="codeSample">square = lambda x: x * x     # same as: def square(x): return x * x
square(4)                     # 16</div>
<p>A <b>lambda</b> is a one-line, unnamed function — just <code>lambda args: expression</code>.
Its main use is passing a little function as an argument, most often the <code>key=</code> of
<code>sorted</code>/<code>max</code>/<code>min</code> to say "compare by <i>this</i>":</p>
<div class="codeSample">words = ["cat", "hippo", "dog"]
longest = max(words, key=lambda w: len(w))     # compare words BY length → "hippo"
by_length = sorted(words, key=lambda w: len(w))  # ['cat', 'dog', 'hippo']</div>
<p>Read <code>key=lambda w: len(w)</code> as "when comparing, look at each word's length." The
same trick sorts by any property you name. (You do not have to use lambda — a named function
works too — but this compact form is the convention you will read everywhere, including when we
sort records by a field later.)</p>

<h3><code>any</code> and <code>all</code>: is ANY / are ALL true?</h3>
<div class="codeSample">nums = [4, 0, 7]
any(n < 0 for n in nums)    # False — none is negative
all(n >= 0 for n in nums)   # True  — every one is >= 0</div>
<p><code>any(...)</code> is True if at least one item passes; <code>all(...)</code> is True only
if every item does. Fed a generator expression (last lesson), they answer "does this hold
anywhere / everywhere?" in one readable line — handy for validating data.</p>

<div class="demystify"><b>Demystify these:</b> every one is a <i>shorthand for a loop you could
write by hand</i>. <code>zip</code> = "index both lists together," <code>enumerate</code> =
"count as you go," <code>lambda</code> = "a function too small to name," <code>any</code>/<code>all</code>
= "loop and check." If any confuses you, expand it back into a plain for-loop and it is obvious.</div>`,
 docs:[['Python built-in functions','https://docs.python.org/3/library/functions.html']],
 quiz:{title:'Quick check',questions:[
   {q:'zip([1, 2, 3], [10, 20, 30]) lets you:',
    options:['Compress the lists to a file','Loop over both lists together, pairing (1,10), (2,20), (3,30)','Add the two lists','Sort them'],answer:1,
    why:'zip pairs matching items so you can process two lists in step — e.g. predictions vs actual labels.'},
   {q:'max(words, key=lambda w: len(w)) returns:',
    options:['The longest length (a number)','The longest WORD itself — key says "compare BY length"','A lambda','An error'],answer:1,
    why:'key= takes a little function saying what to compare by; lambda w: len(w) means "use the length of each word." max returns the winning item itself, not the length.'},
   {q:'all(n > 0 for n in [3, 1, -2]) is:',
    options:['True','False — not every number is > 0 (−2 fails), so "all" is False','3','An error'],answer:1,
    why:'all is True only if EVERY item passes; one failure makes it False. any would be True here (some pass).'}
 ]},
 exs:[{title:'zip, lambda, and all in action',
   lang:'python',
   prompt:`Use the intermediate idioms:
   <ol>
   <li><code>diffs</code> — pair <code>a = [10, 20, 30]</code> with <code>b = [8, 20, 35]</code> using <code>zip</code> and list the differences <code>a − b</code>: <code>[2, 0, -5]</code>,</li>
   <li><code>longest</code> — the longest word in <code>words</code>, via <code>max(..., key=lambda ...)</code> comparing by length,</li>
   <li><code>all_pass</code> — <code>True</code> if <b>every</b> score in <code>[80, 91, 75]</code> is at least 70 (use <code>all</code>).</li>
   </ol>`,
   starter:`a = [10, 20, 30]
b = [8, 20, 35]
words = ["cat", "hippo", "dog", "elephant"]
scores = [80, 91, 75]

# 1) differences a - b, pairing with zip
diffs =

# 2) longest word (max with a key comparing by length)
longest =

# 3) do all scores clear 70?
all_pass =

print(diffs, longest, all_pass)
`,
   solution:`a = [10, 20, 30]
b = [8, 20, 35]
words = ["cat", "hippo", "dog", "elephant"]
scores = [80, 91, 75]

# 1) differences a - b, pairing with zip
diffs = [x - y for x, y in zip(a, b)]

# 2) longest word (max with a key comparing by length)
longest = max(words, key=lambda w: len(w))

# 3) do all scores clear 70?
all_pass = all(s >= 70 for s in scores)

print(diffs, longest, all_pass)
`,
   tests:[
     {d:'zip pairs the lists: diffs is [2, 0, -5]',expr:'diffs == [2, 0, -5]'},
     {d:'max with a key finds the longest word: "elephant"',expr:'longest == "elephant"'},
     {d:'all scores clear 70 → True',expr:'all_pass == True'},
     {d:'all correctly returns False when one fails',expr:'all(s >= 80 for s in scores) == False'}
   ],
   hints:[
     'zip(a, b) yields pairs: [x - y for x, y in zip(a, b)].',
     'max(words, key=lambda w: len(w)) compares words by length and returns the whole word.',
     'all(s >= 70 for s in scores) is True only if every score passes.'
   ]}]},

{id:'py5',
 title:'Dictionaries and text',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A <b>dictionary</b> maps <i>keys</i> to <i>values</i> — a labelled lookup, like a real
dictionary maps a word to its meaning. Written with braces:
<code>{"apples": 3, "pears": 5}</code>. You read and write by key:
<code>prices["apples"]</code>.</p></div>
<div class="codeSample">counts = {}
counts["a"] = counts.get("a", 0) + 1   # .get returns a default if the key is missing
# counts is {"a": 1}

text = "the cat sat"
words = text.split()     # ["the", "cat", "sat"]  — split on spaces
f"{len(words)} words"    # "3 words"  — an f-string drops values into text</div>
<p>Two everyday text tools appear here: <code>.split()</code> breaks a string into a list of
words, and an <b>f-string</b> (<code>f"…{value}…"</code>) builds text with values plugged in.
The <code>.get(key, default)</code> trick — return a default when a key isn't there yet — is
exactly how you tally things up.</p>

<h3>Looping over a dictionary (both key and value at once)</h3>
<p>You know how to loop over a list; looping over a <b>dictionary</b> is just as common. A plain
<code>for</code> loop over a dict walks its <b>keys</b>; <code>.values()</code> walks the values;
and the one you will use most, <code>.items()</code>, hands you <b>each key and its value
together</b> — using the tuple-unpacking you met with functions:</p>
<div class="codeSample">prices = {"apple": 3, "pear": 5, "plum": 2}

for fruit in prices:                 # keys:   apple, pear, plum
    print(fruit)

for cost in prices.values():         # values: 3, 5, 2
    print(cost)

for fruit, cost in prices.items():   # BOTH at once — the everyday one
    print(fruit, "costs", cost)      # apple costs 3 / pear costs 5 / plum costs 2</div>
<p>That <code>for key, value in d.items()</code> pattern is how you process every entry of a map
— summing values, finding the biggest, transforming a table. You will reach for it constantly
in data and ML code (a dictionary of word counts, of per-category totals, of model settings). It
combines two things you already know: looping, and unpacking a pair into two names.</p>

<div class="demystify"><b>Demystify <code>.items()</code>:</b> a dictionary does not loop over
pairs by default — a bare <code>for x in d</code> gives you only the keys (a frequent surprise).
<code>.items()</code> is what asks for the key-and-value pair each time, and
<code>for k, v in …</code> unpacks that pair into two handy names.</div>`,
 quiz:{title:'Quick check',questions:[
   {q:'Looping with  for k, v in prices.items()  gives you, each pass:',
    options:['Only the keys, one by one','A key and its value together (unpacked into k and v)','Only the values, one by one','The whole dictionary each time'],answer:1,
    why:'.items() yields (key, value) pairs; a bare "for x in d" would give only keys. .values() gives only values.'},
   {q:'What does "a b a".split() return?',
    options:['"aba"','["a", "b", "a"]','["a b a"]','3'],answer:1,
    why:'split() with no argument breaks the string on whitespace into a list of the words.'},
   {q:'Why use counts.get("x", 0) instead of counts["x"]?',
    options:['It is faster','It returns a default (0) if the key is missing, instead of erroring','It sorts the dictionary','There is no difference'],answer:1,
    why:'Reading a missing key with [] raises an error; .get supplies a fallback, which is perfect for tallying.'}
 ]},
 exs:[{title:'Count the words in a sentence',
   lang:'python',
   prompt:`Write <code>word_count(text)</code> that returns a dictionary mapping each word to how
   many times it appears. Split on spaces and use <code>.get</code> to tally. For
   <code>"a b a"</code> it should return <code>{"a": 2, "b": 1}</code>.`,
   starter:`def word_count(text):
    counts = {}
    # for each word in text.split(), add 1 to its tally
    return counts

print(word_count("a b a"))
`,
   solution:`def word_count(text):
    counts = {}
    for w in text.split():
        counts[w] = counts.get(w, 0) + 1
    return counts

print(word_count("a b a"))
`,
   tests:[
     {d:'"a b a" tallies to {"a":2,"b":1}',expr:'word_count("a b a") == {"a":2,"b":1}'},
     {d:'counts every distinct word',expr:'word_count("red red red blue") == {"red":3,"blue":1}'},
     {d:'empty text gives an empty dict',expr:'word_count("") == {}'}
   ],
   hints:[
     'Loop over text.split() to get each word.',
     'Tally with counts[w] = counts.get(w, 0) + 1 — the .get default handles the first sighting.',
     'Return counts after the loop, not inside it.'
   ]}]},

{id:'py12',
 title:'The other containers: tuples, sets, and choosing the right one',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>You know lists (ordered, changeable) and dicts (key → value). Python has two more everyday
containers, and real code — including all the ML libraries — uses each where it shines. Being
able to <b>choose the right container</b> is a quiet mark of competence.</p></div>

<h3>Tuples: ordered and locked</h3>
<div class="codeSample">point = (3, 5)          # like a list, but IMMUTABLE — cannot change
x, y = point            # unpacking — you met this with return a, b
shape = (150, 4)        # you have seen this: NumPy's .shape IS a tuple</div>
<p>A <b>tuple</b> is a list that cannot change. Why would you *want* that? For fixed-size
records where each position has a meaning — a coordinate, a (rows, columns) shape, a
(min, max, mean) result. Immutability is a promise to the reader: this grouping is a fact,
not a work-in-progress. (It also lets tuples serve as dict keys, which lists cannot.)</p>

<h3>Sets: membership, uniqueness, no order</h3>
<div class="codeSample">seen = {"ada", "alan", "ada"}     # duplicates collapse → {"ada", "alan"}
"ada" in seen                     # True — and FAST, even with millions of items
unique_words = set(words)         # the classic one-liner: dedupe anything</div>
<p>A <b>set</b> holds each value at most once and answers <code>in</code> questions almost
instantly (a list checks item by item; a set jumps straight there — the difference between
milliseconds and minutes on big data). The two everyday jobs: <b>dedupe</b> (how many
<i>unique</i> users/words/labels?) and <b>fast membership</b> (is this email in the spam
list?). Sets also do algebra: <code>a & b</code> (both), <code>a | b</code> (either),
<code>a - b</code> (in a, not b) — handy for comparing groups.</p>

<h3>The chooser, in one breath</h3>
<p>Order matters and it will change → <b>list</b>. Fixed record, positions have meaning →
<b>tuple</b>. Lookup by name/key → <b>dict</b>. Uniqueness or fast membership → <b>set</b>.
That single sentence covers most container decisions you will ever make.</p>

<div class="demystify"><b>Demystify "hashable/immutable":</b> when an error says "unhashable
type: list," it means: only <i>unchangeable</i> values (tuples, strings, numbers) can be dict
keys or set members — because a value that could change underneath the lookup table would
corrupt it. Swap the list for a tuple and the error goes away.</div>`,
 docs:[['Python tutorial — tuples and sets','https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences']],
 quiz:{title:'Quick check',questions:[
   {q:'Why choose a tuple over a list for a (rows, columns) shape?',
    options:['Tuples are faster to type','It is a fixed record — immutability promises the grouping will not change, and each position has a meaning','Lists cannot hold two numbers','Tuples use less disk'],answer:1,
    why:'Immutable, fixed-size, position-meaningful records are what tuples are FOR — which is why .shape is one.'},
   {q:'You have 10 million emails and a blocklist to check each against. The blocklist should be a:',
    options:['List — order matters','Set — membership checks are near-instant regardless of size','Tuple — it is fixed','String'],answer:1,
    why:'A list checks item by item (slow at scale); a set jumps straight to the answer. Fast membership is the set superpower.'},
   {q:'set([1, 2, 2, 3, 3, 3]) equals:',
    options:['{1, 2, 2, 3, 3, 3}','{1, 2, 3} — duplicates collapse; sets hold each value at most once','[1, 2, 3]','An error'],answer:1,
    why:'Uniqueness is the defining property — and set(anything) is the standard dedupe one-liner.'}
 ]},
 exs:[{title:'Pick the right container for each job',
   lang:'python',
   prompt:`A log of user visits: <code>visits = ["ada", "alan", "ada", "grace", "alan", "ada"]</code>:
   <ol>
   <li><code>unique_users</code> — the set of distinct visitors (3 of them),</li>
   <li><code>n_unique</code> — how many distinct visitors,</li>
   <li><code>returned</code> — a set of users who appear MORE than once (hint: count with a dict or .count, or use set algebra),</li>
   <li><code>summary</code> — a tuple <code>(total_visits, n_unique)</code> — a fixed record, then unpack it into <code>total</code> and <code>uniq</code>.</li>
   </ol>`,
   starter:`visits = ["ada", "alan", "ada", "grace", "alan", "ada"]

# 1) Distinct visitors — one line
unique_users =

# 2) How many distinct visitors?
n_unique =

# 3) Who came back? (appears more than once)
returned =

# 4) A fixed record of the answer, then unpack it
summary =
total, uniq = summary

print(unique_users, n_unique, returned, total, uniq)
`,
   solution:`visits = ["ada", "alan", "ada", "grace", "alan", "ada"]

# 1) Distinct visitors — one line
unique_users = set(visits)

# 2) How many distinct visitors?
n_unique = len(unique_users)

# 3) Who came back? (appears more than once)
returned = {u for u in unique_users if visits.count(u) > 1}

# 4) A fixed record of the answer, then unpack it
summary = (len(visits), n_unique)
total, uniq = summary

print(unique_users, n_unique, returned, total, uniq)
`,
   tests:[
     {d:'unique_users is the set of 3 distinct names',expr:'unique_users == {"ada", "alan", "grace"}'},
     {d:'n_unique is 3',expr:'n_unique == 3'},
     {d:'returned identifies ada and alan (grace visited once)',expr:'returned == {"ada", "alan"}'},
     {d:'summary is the tuple (6, 3) and unpacks correctly',expr:'summary == (6, 3) and total == 6 and uniq == 3'}
   ],
   hints:[
     'set(visits) collapses duplicates in one call; len() of that counts the distinct visitors.',
     'A set comprehension works: {u for u in unique_users if visits.count(u) > 1}.',
     'summary = (len(visits), n_unique) — parentheses optional but clear; total, uniq = summary unpacks by position.'
   ]}]},

{id:'py6',
 title:'Working with data — a dataset by hand',
 body:`
<div class="ground"><span class="gTag">🎯 Why this is the finish line</span>
<p>Real data is usually a <b>table</b>: rows of records, each with named fields. In pure Python
we represent that as a <b>list of dictionaries</b> — one dict per row. Everything pandas does
later (filter, aggregate, group) you can do here by hand — and doing it by hand once is what
makes the library feel like a shortcut instead of magic.</p></div>
<div class="codeSample">people = [
    {"name": "Ada",   "age": 36, "city": "London"},
    {"name": "Alan",  "age": 41, "city": "London"},
    {"name": "Grace", "age": 45, "city": "NYC"},
]

# average age — an accumulator over a comprehension
avg_age = sum(p["age"] for p in people) / len(people)     # 40.67

# everyone in London — filter with a comprehension
londoners = [p["name"] for p in people if p["city"] == "London"]   # ["Ada", "Alan"]

# the oldest person — max with a key
oldest = max(people, key=lambda p: p["age"])["name"]      # "Grace"</div>
<p>That's the whole craft in miniature: <b>select</b> columns (<code>p["age"]</code>),
<b>filter</b> rows (<code>if p["city"] == "London"</code>), and <b>aggregate</b>
(<code>sum</code>, <code>len</code>, <code>max</code>). <code>key=lambda p: p["age"]</code>
just tells <code>max</code> "compare people <i>by</i> their age." You are now working with
data.</p>`,
 docs:[['Python data structures — the tutorial','https://docs.python.org/3/tutorial/datastructures.html']],
 quiz:{title:'Quick check',questions:[
   {q:'Why represent a data table as a list of dictionaries?',
    options:['It is the only way Python stores data','Each row is a record with named fields, so it mirrors a real table','Dictionaries are faster than lists','It avoids using loops'],answer:1,
    why:'A list holds the rows in order; each dict gives that row named columns (name, age, city) — exactly a table.'},
   {q:'What does [p["name"] for p in people if p["city"] == "London"] produce?',
    options:['Every name in the table','The names of only the people whose city is London','The number of Londoners','A dictionary of cities'],answer:1,
    why:'It is a filtered comprehension: keep the name, but only for rows where the city matches.'}
 ]},
 exs:[{title:'Summarise a dataset with comprehensions',
   lang:'python',
   prompt:`Given the <code>people</code> table below, compute three things: <code>avg_age</code>
   (the average age, ~40.67), <code>londoners</code> (a list of the <b>names</b> of people whose
   city is <code>"London"</code>), and <code>oldest</code> (the <b>name</b> of the oldest person).`,
   starter:`people = [
    {"name": "Ada",   "age": 36, "city": "London"},
    {"name": "Alan",  "age": 41, "city": "London"},
    {"name": "Grace", "age": 45, "city": "NYC"},
]

avg_age =                 # average of every person's age
londoners =               # names where city == "London"
oldest =                  # name of the person with the largest age

print(avg_age, londoners, oldest)
`,
   solution:`people = [
    {"name": "Ada",   "age": 36, "city": "London"},
    {"name": "Alan",  "age": 41, "city": "London"},
    {"name": "Grace", "age": 45, "city": "NYC"},
]

avg_age = sum(p["age"] for p in people) / len(people)
londoners = [p["name"] for p in people if p["city"] == "London"]
oldest = max(people, key=lambda p: p["age"])["name"]

print(avg_age, londoners, oldest)
`,
   tests:[
     {d:'avg_age is about 40.67',expr:'abs(avg_age - (36+41+45)/3) < 1e-9'},
     {d:'londoners is ["Ada", "Alan"]',expr:'londoners == ["Ada", "Alan"]'},
     {d:'oldest is "Grace"',expr:'oldest == "Grace"'},
     {d:'the program prints its results',expr:'"Grace" in _stdout'}
   ],
   hints:[
     'Average: sum(p["age"] for p in people) / len(people).',
     'Filter with a comprehension: [p["name"] for p in people if p["city"] == "London"].',
     'Oldest: max(people, key=lambda p: p["age"]) gives the whole row; add ["name"] to get the name.'
   ]}]},

{id:'py7',
 title:'Reading errors: tracebacks, exceptions, and how to debug',
 body:`
<div class="ground"><span class="gTag">🎯 Why this is a real skill</span>
<p>Every programmer — junior or principal — spends serious time reading error messages. The
difference is that experienced people <b>read them as information</b>, not as failure. A
Python error report (a <b>traceback</b>) tells you three things: <i>where</i> it happened
(file + line), <i>what kind</i> of thing went wrong (the exception type), and <i>what</i>
exactly (the message). Read bottom-up: the last line is the punchline.</p></div>

<h3>The exception types you will actually meet</h3>
<p><code>TypeError</code> — mixed incompatible types ("can't add str and int").
<code>ValueError</code> — right type, bad value (<code>int("abc")</code>).
<code>IndexError</code> — asked a list for a position it doesn't have.
<code>KeyError</code> — asked a dict for a missing key.
<code>ZeroDivisionError</code> — divided by zero. Knowing these five by sight solves most
beginner debugging on the spot — and later, a "singular matrix" or "shapes don't match" error
from NumPy is read with exactly the same skill.</p>

<h3>Handling errors on purpose: try / except</h3>
<div class="codeSample">try:
    result = int(user_input)     # may raise ValueError
except ValueError:
    result = 0                   # a chosen fallback, not a crash</div>
<p><code>try</code> runs the risky code; if the named exception occurs, the <code>except</code>
block runs instead of crashing. Rule of craft: catch the <b>specific</b> exception you expect —
a bare <code>except:</code> that swallows everything hides real bugs (including your typos).</p>

<div class="demystify"><b>Demystify "exception":</b> not an insult — an <i>exceptional
situation</i>, packaged as an object and thrown up the call chain until someone handles it.
The traceback is just the trail it left while flying.</div>`,
 docs:[['Python tutorial — errors and exceptions','https://docs.python.org/3/tutorial/errors.html']],
 quiz:{title:'Quick check',questions:[
   {q:'int("hello") raises which exception?',
    options:['TypeError','ValueError — the type (str) is fine, the VALUE cannot be converted','IndexError','SyntaxError'],answer:1,
    why:'Right type, bad value → ValueError. TypeError would be for e.g. int(["a", "b"]).'},
   {q:'The most useful line of a long traceback is usually:',
    options:['The first line','The LAST line — the exception type and message, then work upward for the location','A random middle line','None; tracebacks are noise'],answer:1,
    why:'Read bottom-up: last line = what went wrong; the lines above = where. That habit is half of debugging.'},
   {q:'Why is a bare "except:" (catching everything) bad practice?',
    options:['It is slower','It silently swallows unrelated bugs — including your own typos — making them undebuggable','Python forbids it','It only works once'],answer:1,
    why:'Catch the specific exception you expect; let surprises crash loudly so you can see and fix them.'}
 ]},
 exs:[{title:'Catch exactly what you expect',
   lang:'python',
   prompt:`Practice deliberate error handling:
   <ol>
   <li><code>safe_divide(a, b)</code> — returns <code>a / b</code>, but returns <code>None</code> on division by zero (catch <code>ZeroDivisionError</code> only),</li>
   <li><code>parse_int(s)</code> — returns <code>int(s)</code>, or <code>0</code> if the string is not a number (catch <code>ValueError</code> only),</li>
   <li><code>caught</code> — run <code>[1, 2, 3][10]</code> inside a try/except and store the string <code>"IndexError"</code> when (not if!) it fires.</li>
   </ol>`,
   starter:`# 1) a / b, but None instead of crashing on b == 0
def safe_divide(a, b):
    pass

# 2) int(s), but 0 if s is not numeric
def parse_int(s):
    pass

# 3) Trigger an IndexError on purpose and catch it
caught = ""
try:
    [1, 2, 3][10]
except ________:
    caught = "IndexError"

print(safe_divide(10, 2), safe_divide(1, 0), parse_int("42"), parse_int("abc"), caught)
`,
   solution:`# 1) a / b, but None instead of crashing on b == 0
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

# 2) int(s), but 0 if s is not numeric
def parse_int(s):
    try:
        return int(s)
    except ValueError:
        return 0

# 3) Trigger an IndexError on purpose and catch it
caught = ""
try:
    [1, 2, 3][10]
except IndexError:
    caught = "IndexError"

print(safe_divide(10, 2), safe_divide(1, 0), parse_int("42"), parse_int("abc"), caught)
`,
   tests:[
     {d:'safe_divide(10, 2) is 5.0',expr:'safe_divide(10, 2) == 5.0'},
     {d:'safe_divide(1, 0) returns None instead of crashing',expr:'safe_divide(1, 0) is None'},
     {d:'parse_int("42") is 42',expr:'parse_int("42") == 42'},
     {d:'parse_int("abc") falls back to 0',expr:'parse_int("abc") == 0'},
     {d:'the IndexError was triggered and caught by name',expr:'caught == "IndexError"'}
   ],
   hints:[
     'The shape is: try: return a / b, then except ZeroDivisionError: return None.',
     'Same shape for parse_int, but the exception int("abc") raises is ValueError.',
     'Fill the blank with IndexError — the specific exception a too-large list index raises.'
   ]}]},

{id:'py10',
 title:'Imports: using other people’s code (the gateway to the whole ML ecosystem)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>No one writes ML from a blank file. Real projects stand on <b>other people's code</b>:
Python's built-in <b>standard library</b> (math, random, files, dates — installed with
Python itself) and third-party <b>packages</b> like NumPy, pandas, and scikit-learn. The
<code>import</code> statement is how your file gains access to them — and since every ML
project starts with a block of imports, reading and writing them fluently is a core skill,
not a footnote.</p></div>

<h3>The three forms you will read every day</h3>
<div class="codeSample">import math                  # 1) bring in the whole module
math.sqrt(16)                #    use it with a dot: module.thing

from math import sqrt, pi    # 2) pull specific names in directly
sqrt(16)                     #    no prefix needed

import numpy as np           # 3) import under a short ALIAS
np.array([1, 2, 3])          #    "np" is a nickname you chose</div>
<p>Form 3 is the one ML lives in. The aliases are universal, near-mandatory conventions:
<code>import numpy as np</code>, <code>import pandas as pd</code>,
<code>import matplotlib.pyplot as plt</code>. Any ML code you read anywhere will use exactly
these — which is why our NumPy stream opens with that precise line, and now you know exactly
what it does: load the package once, and give it a two-letter name.</p>

<h3>Modules vs packages — and where they come from</h3>
<p>A <b>module</b> is one importable file; a <b>package</b> is a bundle of them under one
name (scikit-learn is a package; <code>sklearn.linear_model</code> is a module inside it —
the dots mirror folders). Standard-library modules ship with Python. Third-party packages
must be <b>installed once</b> into your environment — on your own machine that is
<code>pip install scikit-learn</code> — and then imported in code. Two different verbs:
<i>install</i> fetches the code onto the machine; <i>import</i> loads it into your program.
The classic error decoded: <code>ModuleNotFoundError: No module named 'sklearn'</code>
does not mean your import line is wrong — it means the package is not installed in the
environment you are running. (Here in MLDojo, the browser fetches packages for you
automatically on first use; in a real project, installing them — usually into a per-project
<i>virtual environment</i> — is your job, and the ML Toolkit stream picks that story up.)</p>

<div class="demystify"><b>Demystify "from x import y" vs "import x":</b> both load the same
code; they differ only in what name lands in your file — the whole module (<code>math.sqrt</code>,
clear where things come from) or one name (<code>sqrt</code>, shorter). Style guidance you can
trust: whole-module or aliased imports for big libraries (<code>np.</code>, <code>pd.</code> —
everyone instantly knows what they are reading), <code>from</code>-imports for a few specific
tools (<code>from sklearn.linear_model import LinearRegression</code>). Avoid
<code>from x import *</code> — it dumps unknown names into your file and real codebases ban it.</div>

<h3>The <code>if __name__ == "__main__":</code> line (a.k.a. "dunder main")</h3>
<p>Open almost any Python script and you will find this near the bottom:</p>
<div class="codeSample">def main():
    print("running the program")

if __name__ == "__main__":
    main()</div>
<p>Here is the whole story. When Python runs a file, it sets a hidden variable
<code>__name__</code> (a <b>dunder</b> — double-underscore — name). If you <b>run the file
directly</b> (<code>python myfile.py</code>), Python sets <code>__name__ == "__main__"</code>.
But if another file <b>imports</b> yours, then <code>__name__</code> is instead the module's
name (<code>"myfile"</code>). So the line <code>if __name__ == "__main__":</code> means: <b>"only
do this when I am the file being run, not when I am imported."</b></p>
<p>Why it matters: it lets a file be <i>both</i> a reusable module (you can
<code>import</code> its functions without side effects) <i>and</i> a runnable script. Without the
guard, any top-level code (like <code>main()</code>) would fire the moment someone imported the
file just to reuse one function — a classic surprise. Putting your "run it" code under the guard
keeps importing safe.</p>

<div class="demystify"><b>Demystify "dunder main":</b> <code>__main__</code> is just the name
Python gives the file you launched. The guard is a plain <code>if</code> comparing a string —
nothing magical — and it is the single most common idiom you will see at the bottom of Python
scripts. Read it as "if this file is the one being run, start here."</div>`,
 docs:[['Python tutorial — modules','https://docs.python.org/3/tutorial/modules.html'],['pip — installing packages','https://packaging.python.org/en/latest/tutorials/installing-packages/']],
 quiz:{title:'Quick check',questions:[
   {q:'What does "import numpy as np" do?',
    options:['Downloads numpy from the internet','Loads the installed numpy package and gives it the short name np in your file','Renames numpy on disk','Re-runs all the numpy code every time you use np'],answer:1,
    why:'Import loads an installed package into your program; "as np" is just a local nickname — the universal ML convention.'},
   {q:'A ModuleNotFoundError for sklearn most likely means:',
    options:['Your import line has a typo in the syntax','The package is not INSTALLED in the environment you are running — install (pip) and import are different verbs','sklearn no longer exists','Python is broken'],answer:1,
    why:'Install fetches code onto the machine (once); import loads it into the program (each run). The error says the first step is missing.'},
   {q:'In sklearn.linear_model, the dots represent:',
    options:['Multiplication','The path inside the package — a bundle of modules organized like folders','A version number','A typo'],answer:1,
    why:'Packages are nested namespaces: sklearn is the package, linear_model a module inside it. The dots mirror that structure.'}
 ]},
 exs:[{title:'All three import forms, in one working program',
   lang:'python',
   prompt:`Use each import style on the standard library:
   <ol>
   <li>Import <code>math</code> whole; set <code>root</code> to <code>math.sqrt(16)</code> (4.0),</li>
   <li>Use a <code>from</code>-import to bring in <code>pi</code> directly; set <code>circle_area</code> to <code>pi * 3 ** 2</code> (≈ 28.27),</li>
   <li>Import <code>random</code> under the alias <code>rnd</code>; seed it with <code>rnd.seed(1)</code> and set <code>pick</code> to <code>rnd.randint(1, 100)</code> (deterministic thanks to the seed),</li>
   <li><code>forms</code> — a list of the three strings <code>"module"</code>, <code>"from"</code>, <code>"alias"</code> in the order you used them.</li>
   </ol>`,
   starter:`# 1) Whole-module import
import math
root =

# 2) from-import: bring pi in directly
from math import pi
circle_area =

# 3) Aliased import: random under the nickname rnd

rnd.seed(1)
pick = rnd.randint(1, 100)

# 4) The three forms, named
forms =

print(root, circle_area, pick, forms)
`,
   solution:`# 1) Whole-module import
import math
root = math.sqrt(16)

# 2) from-import: bring pi in directly
from math import pi
circle_area = pi * 3 ** 2

# 3) Aliased import: random under the nickname rnd
import random as rnd

rnd.seed(1)
pick = rnd.randint(1, 100)

# 4) The three forms, named
forms = ["module", "from", "alias"]

print(root, circle_area, pick, forms)
`,
   tests:[
     {d:'math.sqrt(16) is 4.0 — whole-module form',expr:'root == 4.0'},
     {d:'circle_area uses the directly-imported pi (≈ 28.274)',expr:'abs(circle_area - 28.2743) < 0.001'},
     {d:'the aliased random module produced the seeded pick',expr:'isinstance(pick, int) and 1 <= pick <= 100'},
     {d:'the same seed always gives the same pick (determinism check)',expr:'(lambda r=__import__("random"): (r.seed(1), r.randint(1,100))[1])() == pick'},
     {d:'all three forms named in order',expr:'forms == ["module", "from", "alias"]'}
   ],
   hints:[
     'Form 1 is already written: root = math.sqrt(16).',
     'With from math import pi, you write pi directly — no math. prefix: circle_area = pi * 3 ** 2.',
     'The missing line is: import random as rnd — after that, rnd.seed(1) and rnd.randint work. This is exactly the shape of import numpy as np.'
   ]}]},

{id:'pyproj',
 title:'Multiple files & packages: structuring a real project',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Real programs are not one giant file — they are <b>many small files</b>, each with one job,
that import each other. Learning to split code across files (and group files into <b>packages</b>)
is what lets a project grow past a toy. Good news: you already know the tool — it is the same
<code>import</code> you used for libraries, because <b>a library is just modules someone else
wrote</b>.</p></div>

<h3>Your own modules — a module is just a .py file</h3>
<p>Put related functions in their own file, then import them from another. Say two files sit in
the same folder:</p>
<div class="codeSample"># helpers.py
def clean(text):
    return text.strip().lower()

# main.py  (same folder)
from helpers import clean          # import ONE name from your file
import helpers                     # or the whole module, used as helpers.clean(...)

print(clean("  Hello  "))          # hello</div>
<p>That is the exact syntax you used for <code>math</code> and <code>numpy</code> — because
<code>helpers.py</code> <i>is</i> a module, no different from a library except that you wrote it.
Python finds it because it looks in the <b>current file's folder</b> first (part of the module
search path). Split a program by responsibility — <code>data.py</code>, <code>model.py</code>,
<code>train.py</code> — and each file stays small and reusable.</p>

<h3>Packages — a folder of modules</h3>
<p>When you have many modules, group them into a <b>package</b>: a <i>folder</i> of <code>.py</code>
files. Historically you mark the folder as a package by adding a (often empty) <code>__init__.py</code>
file inside it. Then you import with <b>dots that mirror the folders</b> — the same dotted paths
you saw in <code>sklearn.linear_model</code>:</p>
<div class="codeSample">myproject/
    data/
        __init__.py
        loaders.py        # def load_csv(path): ...
    models/
        __init__.py
        linear.py         # class LinearModel: ...
    train.py

# inside train.py:
from data.loaders import load_csv     # dots follow the folder path
from models.linear import LinearModel</div>

<h3>A realistic (small) ML project layout</h3>
<div class="codeSample">house_prices/
    data.py       # load_data() — reads the CSV, returns X, y
    model.py      # LinearModel — fit() and predict()
    train.py      # the ENTRY POINT: imports the others, runs the training

# train.py
from data import load_data
from model import LinearModel

def main():
    X, y = load_data("houses.csv")
    model = LinearModel()
    model.fit(X, y)
    print("done")

if __name__ == "__main__":     # only runs when you launch train.py directly
    main()</div>
<p>Notice how <code>train.py</code> is small — it just wires together modules that each do one
thing — and how <code>if __name__ == "__main__":</code> (last lesson) marks it as the file you
<i>run</i>, while <code>data.py</code> and <code>model.py</code> are files you <i>import</i>.</p>

<div class="demystify"><b>Demystify "my code vs a library":</b> there is no real difference.
<code>numpy</code> and your <code>helpers.py</code> are both just modules — importable files of
Python. A library is only "modules someone else wrote and installed into your environment." Once
you can import your own files, you understand exactly what importing a library does. <i>(Note:
this is a project-structure skill you practise on your own machine — the in-browser Playground
runs a single file. The setup guide shows how to make a project folder.)</i></div>`,
 docs:[['Python tutorial — modules & packages','https://docs.python.org/3/tutorial/modules.html#packages']],
 quiz:{title:'Quick check',questions:[
   {q:'In Python, a "module" is:',
    options:['A special kind of class','A single .py file of code you can import','A folder of files','A running program'],answer:1,
    why:'A module is one importable .py file. Your helpers.py is a module, exactly like numpy is — a library is just modules someone else wrote.'},
   {q:'To group several modules into a package, you put them in a folder and add:',
    options:['A README file','An __init__.py file to mark it as a package','A .zip archive','Nothing — folders are automatic'],answer:1,
    why:'An __init__.py (often empty) marks a folder as a package; then you import with dotted paths like package.module that mirror the folders.'},
   {q:'from models.linear import LinearModel means:',
    options:['Download a model from the internet','Import LinearModel from linear.py inside the models package (folder)','Create a new folder','Run linear.py as a program'],answer:1,
    why:'The dots follow the folder path: the models/ package, its linear.py module, and the LinearModel name inside it — same dotted style as sklearn.linear_model.'}
 ]}},

{id:'py11',
 title:'Files, input & output: getting data in and results out',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>An ML application is a pipeline with two ends: <b>data comes in</b> (usually from files —
almost always CSV, "comma-separated values") and <b>results go out</b> (formatted numbers, a
report, a saved file). This lesson covers both ends in pure Python — so when pandas reads a
CSV in one line later, you know exactly what it just did for you.</p></div>

<h3>Writing and reading files</h3>
<div class="codeSample">with open("scores.csv", "w") as f:      # "w" = write mode
    f.write("name,score\\n")             # \\n = end of line
    f.write("Ada,91\\n")
    f.write("Alan,87\\n")

with open("scores.csv") as f:           # default mode = read
    text = f.read()                     # the whole file as one string
    # or: for line in f:  — one line at a time (big files!)</div>
<p>The <code>with</code> block is the professional habit worth copying from day 1: it opens
the file, and <b>guarantees it closes</b> when the block ends — even if an error strikes
mid-way (it is try/finally, packaged). Note it is also our old friend: a colon and an
indented block.</p>

<h3>Parsing CSV by hand — once</h3>
<div class="codeSample">rows = []
lines = text.strip().split("\\n")        # split into lines
header = lines[0].split(",")             # ["name", "score"]
for line in lines[1:]:                   # skip the header — a slice!
    name, score = line.split(",")        # split each line on commas
    rows.append({"name": name, "score": int(score)})</div>
<p>Split lines, split commas, convert types, build the list-of-dicts from your capstone.
That is all a CSV is — and every tool from pandas up is automating this exact loop.</p>

<h3>Output: formatted printing, and input()</h3>
<p>Results deserve better than raw floats. F-strings take a format spec after a colon:
<code>f"{avg:.1f}"</code> → one decimal place; <code>f"{n:,}"</code> → thousands separators
(1,234,567); <code>f"{share:.0%}"</code> → a percentage. For interactive terminal programs,
<code>input("prompt")</code> pauses and returns what the user types (always as a
<i>string</i> — convert with <code>int()</code>/<code>float()</code>, and guard with the
try/except you learned, because users type "abc"). Honest note: <code>input()</code> belongs
to terminal apps; in browsers and web apps, user input arrives through UI events instead —
here in MLDojo, your "input" is the code and data you provide.</p>

<div class="demystify"><b>Demystify "file handle":</b> the <code>f</code> in
<code>open(...) as f</code> is not the file's contents — it is a <i>connection</i> to the
file (a bookmark with methods). <code>f.read()</code> pulls contents through it;
closing it (which <code>with</code> does for you) releases the connection. Forgetting to
close files is a classic slow leak in long-running programs — <code>with</code> makes the
mistake impossible.</div>`,
 docs:[['Python tutorial — reading and writing files','https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files'],['f-string format specs','https://docs.python.org/3/library/string.html#format-specification-mini-language']],
 quiz:{title:'Quick check',questions:[
   {q:'Why is "with open(...) as f:" preferred over plain open()?',
    options:['It is shorter to type','The with-block GUARANTEES the file closes when the block ends, even if an error occurs mid-way','It reads files faster','It creates the file if missing'],answer:1,
    why:'with = open + guaranteed cleanup (a packaged try/finally). The professional habit from day one.'},
   {q:'input() returns what the user typed as:',
    options:['An int if they typed digits','Always a STRING — convert with int()/float(), guarded by try/except','A list of words','A boolean'],answer:1,
    why:'Everything arrives as text. "42" is not 42 until you convert it — and users type "abc", which is why parse_int exists.'},
   {q:'A CSV file is, at bottom:',
    options:['A special binary database format','Plain text: one line per row, commas between values — parseable with split()','An Excel-only format','Compressed data'],answer:1,
    why:'Lines and commas, nothing more. pandas reads it in one line later, but now you know what that line automates.'}
 ]},
 exs:[{title:'A complete mini-pipeline: file in, parsed, computed, formatted out',
   lang:'python',
   prompt:`Build the two ends of a real pipeline:
   <ol>
   <li>Write <code>scores.csv</code> with a header and three rows: Ada,91 / Alan,87 / Grace,95 (use a <code>with</code> block),</li>
   <li>Read it back and parse it into <code>rows</code> — a list of dicts with <code>int</code> scores (skip the header with a slice),</li>
   <li><code>avg</code> — the mean score (91.0),</li>
   <li><code>report</code> — the formatted string <code>f"Average: {avg:.1f} over {len(rows)} students"</code> → <code>"Average: 91.0 over 3 students"</code>.</li>
   </ol>`,
   starter:`# 1) Write the file (with-block, "w" mode, \\n line endings)
with open("scores.csv", "w") as f:
    f.write("name,score\\n")
    # ... write the three data rows

# 2) Read it back and parse into a list of dicts
rows = []
with open("scores.csv") as f:
    text = f.read()
lines = text.strip().split("\\n")
for line in lines[1:]:          # skip the header
    # split on the comma, convert score to int, append a dict
    pass

# 3) The average score
avg =

# 4) A human-readable report (one decimal place)
report =

print(report)
`,
   solution:`# 1) Write the file (with-block, "w" mode, \\n line endings)
with open("scores.csv", "w") as f:
    f.write("name,score\\n")
    f.write("Ada,91\\n")
    f.write("Alan,87\\n")
    f.write("Grace,95\\n")

# 2) Read it back and parse into a list of dicts
rows = []
with open("scores.csv") as f:
    text = f.read()
lines = text.strip().split("\\n")
for line in lines[1:]:          # skip the header
    name, score = line.split(",")
    rows.append({"name": name, "score": int(score)})

# 3) The average score
avg = sum(r["score"] for r in rows) / len(rows)

# 4) A human-readable report (one decimal place)
report = f"Average: {avg:.1f} over {len(rows)} students"

print(report)
`,
   tests:[
     {d:'scores.csv was written and read back (3 data rows parsed)',expr:'len(rows) == 3'},
     {d:'scores are ints, not strings',expr:'rows[0]["score"] == 91 and isinstance(rows[0]["score"], int)'},
     {d:'all three people are present',expr:'[r["name"] for r in rows] == ["Ada", "Alan", "Grace"]'},
     {d:'avg is 91.0',expr:'abs(avg - 91.0) < 1e-9'},
     {d:'the report is formatted to one decimal place',expr:'report == "Average: 91.0 over 3 students"'}
   ],
   hints:[
     'Three more writes: f.write("Ada,91\\n") etc. — the \\n ends each line.',
     'Parsing: name, score = line.split(",") then rows.append({"name": name, "score": int(score)}) — int() converts the text.',
     'The format spec {avg:.1f} renders 91.0 with exactly one decimal. This exact CSV loop is what pd.read_csv automates.'
   ]}]},

{id:'py13',
 title:'Objects & classes: the shape of everything in Python',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Here is a fact that reorganizes everything you have learned: <b>in Python, everything is an
object</b>. A list, a string, a number, a DataFrame, a trained model — each is an object, which
means each bundles <b>data</b> together with <b>methods</b> (functions you call on it with a
dot). You have been using objects the whole time: <code>list.append()</code>,
<code>str.split()</code>, <code>array.mean()</code> — those dots are you calling an object's
methods. This lesson names the pattern and shows you how to make your own.</p></div>

<h3>A class is a blueprint; an object is one built from it</h3>
<div class="codeSample">class RunningMean:
    def __init__(self):        # runs when you create one — sets up the data
        self.total = 0
        self.count = 0
    def add(self, x):          # a method — note "self" is the object itself
        self.total += x
        self.count += 1
    def mean(self):
        return self.total / self.count

rm = RunningMean()             # build an object from the blueprint
rm.add(10); rm.add(20)         # call its methods
rm.mean()                      # 15.0</div>
<p>A <b>class</b> defines a new kind of object. <code>__init__</code> is the setup routine that
runs when you create one. <code>self</code> is the automatic first parameter of every method —
it <i>is</i> the particular object being worked on, so <code>self.total</code> is "this
object's own total." You rarely need to write classes as a beginner — but you will <b>read</b>
them constantly, because the whole ML ecosystem is built from them.</p>

<h3>Dunder methods: the special <code>__names__</code></h3>
<p>You already met one: <code>__init__</code>. Those double-underscore-wrapped names —
pronounced <b>"dunder"</b> (short for <b>d</b>ouble <b>under</b>score) — are Python's
<b>special methods</b>: methods Python calls <i>automatically</i> in certain situations, so your
objects can plug into the language's built-in behavior. You do not call them by name; Python
does, behind a friendlier syntax:</p>
<div class="codeSample">class Money:
    def __init__(self, cents):      # runs at   Money(500)
        self.cents = cents
    def __str__(self):              # runs at   print(m)  /  str(m)
        return f"{self.cents / 100:.2f} dollars"
    def __eq__(self, other):        # runs at   m == other
        return self.cents == other.cents
    def __len__(self):              # runs at   len(m)
        return self.cents

m = Money(500)
print(m)          # 5.00 dollars  ← Python called __str__ for you
m == Money(500)   # True         ← Python called __eq__
len(m)            # 500          ← Python called __len__</div>
<p>So <code>len(x)</code> secretly calls <code>x.__len__()</code>, <code>a + b</code> calls
<code>a.__add__(b)</code>, <code>print(x)</code> calls <code>x.__str__()</code>, and so on.
That is <i>why</i> the same <code>len()</code>, <code>+</code>, and <code>[]</code> work on
lists, strings, and NumPy arrays alike — each type implements the matching dunder. Defining a few
dunders makes your own objects feel like built-in ones. (You will rarely write them as a
beginner, but recognising them turns confusing library code into something readable.)</p>

<div class="demystify"><b>Why this matters for ML:</b> <code>model = LinearRegression()</code>
builds an <i>object</i> from scikit-learn's <code>LinearRegression</code> <i>class</i>;
<code>model.fit(X, y)</code> calls its method (which stashes the learned numbers inside the
object, as <code>model.coef_</code>); <code>model.predict(...)</code> calls another. The
fit/predict interface you met is just <b>objects with methods</b>. Understanding classes is
what turns "magic library incantations" into "oh — it is an object, and these are its
methods."</p></div>`,
 docs:[['Python tutorial — classes','https://docs.python.org/3/tutorial/classes.html']],
 quiz:{title:'Quick check',questions:[
   {q:'When you write list.append(3) or model.predict(X), the dot means:',
    options:['Multiplication','You are calling a METHOD on an object — every value in Python is an object bundling data with methods','Division','Importing a module'],answer:1,
    why:'Everything is an object; methods are the functions attached to it. You have been doing OOP since your first .append().'},
   {q:'In a class, what is "self"?',
    options:['A keyword you must avoid','The particular object the method is working on — self.total is "this object\u2019s own total"','The name of the class','A global variable'],answer:1,
    why:'self is the automatic first parameter: the specific instance. It is how an object refers to its own data.'},
   {q:'model = LinearRegression() then model.fit(X, y). In class terms this is:',
    options:['Two unrelated function calls','Creating an OBJECT from a class, then calling one of its methods — exactly the pattern in this lesson','A syntax error','Importing sklearn'],answer:1,
    why:'sklearn models are objects; fit/predict are methods. Classes are why the whole ecosystem feels consistent.'}
 ]},
 exs:[{title:'Write your own object: a running-statistics accumulator',
   lang:'python',
   prompt:`Build a class <code>RunningMean</code> (an accumulator, as an object):
   <ol>
   <li><code>__init__</code> sets <code>self.total = 0</code> and <code>self.count = 0</code>,</li>
   <li><code>add(self, x)</code> adds <code>x</code> to the total and increments the count,</li>
   <li><code>mean(self)</code> returns total / count,</li>
   </ol>
   Then create one, add 10, 20, 30, and put the result in <code>result</code> (20.0).`,
   starter:`class RunningMean:
    def __init__(self):
        # set up self.total and self.count
        pass
    def add(self, x):
        # add x to the total, increment the count
        pass
    def mean(self):
        # return the average so far
        pass

rm = RunningMean()
rm.add(10)
rm.add(20)
rm.add(30)
result = rm.mean()

print(result)
`,
   solution:`class RunningMean:
    def __init__(self):
        self.total = 0
        self.count = 0
    def add(self, x):
        self.total += x
        self.count += 1
    def mean(self):
        return self.total / self.count

rm = RunningMean()
rm.add(10)
rm.add(20)
rm.add(30)
result = rm.mean()

print(result)
`,
   tests:[
     {d:'RunningMean is a class you can instantiate',expr:'isinstance(RunningMean(), RunningMean)'},
     {d:'after adding 10, 20, 30 the mean is 20.0',expr:'abs(result - 20.0) < 1e-9'},
     {d:'a fresh object is independent (its own self.total)',expr:'(lambda r=RunningMean(): (r.add(5), r.mean())[1])() == 5.0'},
     {d:'add updates both total and count',expr:'(lambda r=RunningMean(): (r.add(2), r.add(4), r.total == 6 and r.count == 2)[2])()'}
   ],
   hints:[
     '__init__ just assigns starting values: self.total = 0 and self.count = 0.',
     'add uses self to reach the object\u2019s own data: self.total += x; self.count += 1.',
     'mean returns self.total / self.count. Each object built from the class carries its own totals — that is the point of self.'
   ]}]},

{id:'py14',
 title:'You cannot memorize Python — how to learn any function or library',
 body:`
<div class="ground"><span class="gTag">🎯 The most important skill of all</span>
<p>Here is the honest truth this course is built on: <b>nobody knows all of Python.</b> The
standard library alone has hundreds of modules; NumPy, pandas, and scikit-learn have thousands
of functions between them; the wider ecosystem has hundreds of thousands of packages. No
course could cover them all, and no professional has them memorized. What separates competent
programmers from stuck ones is not memory — it is knowing <b>how to find and understand what
you need, right when you need it.</b> That skill is the real deliverable of this stream.</p></div>

<h3>The four moves, in order</h3>
<p><b>1. Ask the object what it can do.</b> Two built-ins work on <i>anything</i>:
<code>dir(x)</code> lists the methods available on <code>x</code>; <code>help(x)</code> prints
its documentation, including what arguments it takes. Forgot what a string can do?
<code>dir("")</code>. Unsure how <code>sorted</code> works? <code>help(sorted)</code>. The
answer is inside Python itself.</p>
<div class="codeSample">help(str.replace)     # shows: replace(old, new, count=-1) and what it does
dir([])               # every method a list has: append, sort, count, index, ...</div>
<p><b>2. Read the official documentation.</b> Every serious library has real docs with
examples — <a href="https://docs.python.org/3/" target="_blank" rel="noopener">docs.python.org</a>,
the NumPy/pandas/sklearn sites. Learning to skim a function's signature (its arguments and
their defaults) and copy an example is a core professional skill, not cheating.</p>
<p><b>3. Read the error, then search it.</b> When something breaks, the traceback (Python
stream: "Reading errors") usually names the problem. Pasting an unfamiliar error message into
a search engine lands you on a solution more often than not — every professional does this
daily.</p>
<p><b>4. Ask the tutor.</b> Right here in MLDojo, the <b>Ask the Tutor</b> panel will explain
any function, decode any error, or walk you through any algorithm step by step. Use it as your
always-available pair programmer.</p>

<div class="demystify"><b>Reframe what "knowing Python" means:</b> it is not a full dictionary
in your head. It is <b>fluency with the core</b> (which this stream gives you) plus <b>the
reflexes to look up the rest</b>. When you meet <code>np.argsort</code> or
<code>df.pivot_table</code> in a later lesson and think "I have never seen that" — good. You are
not supposed to have. You are supposed to know it is a method on an object, that
<code>help()</code> and the docs will explain it, and that you can try it in the Playground in
ten seconds. That posture is competence.</div>`,
 docs:[['The Python standard library (you will never memorize it — bookmark it)','https://docs.python.org/3/library/'],['How to read Python documentation','https://docs.python.org/3/tutorial/']],
 quiz:{title:'Quick check',questions:[
   {q:'You meet an unfamiliar function, df.groupby, in a lesson. The competent first move is:',
    options:['Give up — you were not taught it','Recognize it is a method on an object, and use help()/the docs/the tutor/the Playground to learn it in seconds','Memorize the whole pandas library first','Avoid that lesson'],answer:1,
    why:'Competence is not prior memorization; it is the reflex to look things up fast. That is the whole point of this lesson.'},
   {q:'What does dir(x) do?',
    options:['Deletes x','Lists the methods and attributes available on x — a menu of what you can do with it','Runs x','Downloads documentation'],answer:1,
    why:'dir() asks any object what it offers; help() then explains any item on that menu. The answers live inside Python.'},
   {q:'"Knowing Python" is best understood as:',
    options:['Having every function memorized','Fluency with the core PLUS the reflexes to find and understand the rest when needed','Never needing documentation','Only using functions you were explicitly taught'],answer:1,
    why:'No one memorizes it all. The durable skill is core fluency plus knowing how to learn anything else on demand.'}
 ]},
 exs:[{title:'Use methods you were never explicitly taught (look them up!)',
   lang:'python',
   prompt:`This exercise deliberately needs string/list methods we never drilled — exactly the
   everyday situation. Discover them (they behave as their names suggest; <code>help(str)</code>
   or the tutor confirms):
   <ol>
   <li><code>shout</code> — <code>"machine learning"</code> in all caps (a string method that upper-cases),</li>
   <li><code>fixed</code> — <code>"a,b,c"</code> with commas replaced by dashes → <code>"a-b-c"</code>,</li>
   <li><code>top3</code> — the three largest numbers of <code>[5, 1, 9, 3, 7, 2]</code>, sorted high-to-low (use <code>sorted(..., reverse=True)</code> then a slice),</li>
   <li><code>joined</code> — the words <code>["deep", "learning"]</code> joined into one string with a space (a string method that joins a list).</li>
   </ol>`,
   starter:`# You were not explicitly taught these methods — that is the point.
# Their names say what they do; help(str) / help(sorted) / the tutor confirm.

text = "machine learning"
shout =                     # all uppercase

csv = "a,b,c"
fixed =                     # replace commas with dashes -> "a-b-c"

nums = [5, 1, 9, 3, 7, 2]
top3 =                      # three largest, high to low: [9, 7, 5]

words = ["deep", "learning"]
joined =                    # "deep learning"  (join with a space)

print(shout, fixed, top3, joined)
`,
   solution:`# You were not explicitly taught these methods — that is the point.
# Their names say what they do; help(str) / help(sorted) / the tutor confirm.

text = "machine learning"
shout = text.upper()                     # all uppercase

csv = "a,b,c"
fixed = csv.replace(",", "-")            # replace commas with dashes -> "a-b-c"

nums = [5, 1, 9, 3, 7, 2]
top3 = sorted(nums, reverse=True)[:3]    # three largest, high to low: [9, 7, 5]

words = ["deep", "learning"]
joined = " ".join(words)                 # "deep learning"  (join with a space)

print(shout, fixed, top3, joined)
`,
   tests:[
     {d:'shout upper-cases the text',expr:'shout == "MACHINE LEARNING"'},
     {d:'fixed replaced commas with dashes',expr:'fixed == "a-b-c"'},
     {d:'top3 is the three largest, high to low',expr:'top3 == [9, 7, 5]'},
     {d:'joined combined the words with a space',expr:'joined == "deep learning"'}
   ],
   hints:[
     'Strings have .upper() and .replace(old, new). Try help(str) or just type text. and imagine the menu dir("") would show.',
     'sorted(nums, reverse=True) gives high-to-low; add [:3] to keep the first three.',
     'The join is "backwards" from how it reads: the separator calls join on the list — " ".join(words). Looking THIS up is the skill.'
   ]}]}
]});
