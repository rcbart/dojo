STREAMS.push({icon:'🧮',track:'Scientific Python (after the math)',title:'NumPy: arrays & fast vectorized math',blurb:'The advanced-Python tool for the linear algebra you now understand — arrays, vectorized operations, broadcasting. The concepts were the math; this is the fast way to run them.',requires:'pr5',requiresName:'the Mathematical Foundations (through Probability & Statistics)',lessons:[
{id:'vec1',
 title:'What is a vector? (and why "Support Vector Machine" is just math)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Before a single symbol: a <b>vector</b> is just an <b>ordered list of numbers</b>. That's it.
<code>[height, weight, age]</code> = <code>[178, 74, 31]</code> is a vector describing a person.
Every row of every dataset you will ever touch in ML — a house, a customer, an image, a
sentence — is stored as a vector. If you understand "a list of numbers," you already have
the thing; the rest is what we <i>do</i> with it.</p></div>

<h3>Where it's used</h3>
<p>ML runs on vectors because a vector lets us hand a computer a <i>thing</i> as numbers it can
compare and compute with. A house becomes <code>[bedrooms, sqft, age, ...]</code>. A movie you
watched becomes a vector; recommending films is finding vectors that point the same way.
A word in a language model becomes a vector (an "embedding"). Learn vectors and you've learned
the container ML puts <i>everything</i> in.</p>

<h3>Two pictures of the same thing</h3>
<p>A vector has two mental images, and both are useful. (1) A <b>list</b>: <code>[3, 4]</code>.
(2) An <b>arrow</b> (or a point) in space: start at the origin, go 3 right and 4 up. The arrow
picture is why we can talk about a vector's <i>length</i> and its <i>direction</i> — and why
"similar things point the same way" is a real, computable idea and not a metaphor.</p>
<div class="figure"><svg viewBox="0 0 250 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The vector [3,4] as an arrow from the origin, with components 3 and 4 and length 5">
  <defs><marker id="va" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#0d9488"/></marker></defs>
  <!-- grid -->
  <g stroke="#e0eeeb" stroke-width="1">
    <line x1="40" y1="10" x2="40" y2="190"/><line x1="80" y1="10" x2="80" y2="190"/>
    <line x1="120" y1="10" x2="120" y2="190"/><line x1="160" y1="10" x2="160" y2="190"/>
    <line x1="200" y1="10" x2="200" y2="190"/>
    <line x1="40" y1="30" x2="210" y2="30"/><line x1="40" y1="70" x2="210" y2="70"/>
    <line x1="40" y1="110" x2="210" y2="110"/><line x1="40" y1="150" x2="210" y2="150"/>
  </g>
  <!-- axes -->
  <line x1="40" y1="190" x2="215" y2="190" stroke="#5a7a7d" stroke-width="1.5"/>
  <line x1="40" y1="190" x2="40" y2="10" stroke="#5a7a7d" stroke-width="1.5"/>
  <!-- components -->
  <line x1="40" y1="190" x2="160" y2="190" stroke="#0891b2" stroke-width="2" stroke-dasharray="5 3"/>
  <line x1="160" y1="190" x2="160" y2="30" stroke="#0891b2" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="100" y="205" font-size="12" fill="#0891b2" text-anchor="middle">3 right</text>
  <text x="167" y="115" font-size="12" fill="#0891b2">4 up</text>
  <!-- the vector -->
  <line x1="40" y1="190" x2="160" y2="30" stroke="#0d9488" stroke-width="3" marker-end="url(#va)"/>
  <circle cx="160" cy="30" r="4" fill="#0f766e"/>
  <text x="150" y="24" font-size="12.5" fill="#0f766e" font-weight="700" text-anchor="end">[3, 4]</text>
  <text x="92" y="100" font-size="12" fill="#0d9488" font-weight="700" transform="rotate(-53 92 100)">length 5</text>
  <text x="30" y="195" font-size="11" fill="#5a7a7d">0</text>
</svg>
<div class="figCap"><b>The vector [3, 4].</b> The same list of two numbers, drawn as an arrow: 3 across and 4 up. Its <b>length</b> is √(3²+4²) = 5 (Pythagoras), and its <b>direction</b> is where it points — the two things the arrow picture makes visible.</div></div>

<h3>The intuition: length and the dot product</h3>
<p>Two operations carry a huge amount of ML. The <b>length</b> (or "norm") of <code>[3, 4]</code>
is <code>5</code> — literally the arrow's length, from Pythagoras: √(3² + 4²) = 5. It's how far
the point is from the origin, and it's how models measure <i>how big</i> an error or a weight is.</p>
<p>The <b>dot product</b> lines two vectors up, multiplies them element-by-element, and adds the
results into a <i>single number</i> that measures <b>how aligned they are</b>. Same direction →
big positive number; perpendicular → zero; opposite → negative. This one operation <i>is</i> a
neuron (inputs · weights), <i>is</i> the "similarity" behind search and recommendations, and
shows up in nearly every model you'll meet.</p>

<div class="demystify"><b>Demystify:</b> a "<b>Support Vector Machine</b>" sounds like a
spaceship. It isn't a machine and there's nothing to be afraid of: it's a method that draws the
<i>line (or plane) that best separates two groups, as far from both as possible</i>. The
"vectors" are just the data points; the "support" vectors are the few points sitting closest to
the dividing line — the ones holding it in place. A bombastic name for a piece of geometry you
can picture. We'll do this every time a scary name shows up: name it, then reduce it to the
simple operation it really is.</div>

<div class="hardidea">🧠 <b>The math, made simple.</b> The dot product of
<code>a = [a₁, a₂]</code> and <code>b = [b₁, b₂]</code> is <code>a·b = a₁b₁ + a₂b₂</code>.
The length of <code>a</code> is <code>‖a‖ = √(a·a)</code>. Everything above is those two little
formulas — and in the exercise you'll compute both on real vectors, in real Python, running in
your browser.</div>`,
 deepDive:`<b>📖 Dive deeper: the dot product, rigorously (but in plain English).</b>
<p>We said the dot product measures <i>alignment</i>. Here is why that is literally true, built up
one honest step at a time.</p>
<p><b>1. The definition.</b> For two vectors <code>a = [a₁,…,a_n]</code> and
<code>b = [b₁,…,b_n]</code>, the dot product is <code>a·b = Σᵢ aᵢbᵢ = a₁b₁ + a₂b₂ + … + a_nb_n</code>.
Just multiply matching entries and add. This is the <i>algebraic</i> definition.</p>
<p><b>2. The geometric identity.</b> There is a second, equivalent formula:
<code>a·b = ‖a‖·‖b‖·cos θ</code>, where <code>‖a‖</code> is the length of <code>a</code> and
<code>θ</code> is the angle between the two arrows. Read it slowly: the dot product is the two
lengths multiplied, scaled by <code>cos θ</code> — and <code>cos θ</code> is exactly a measure of
alignment (1 when they point the same way, 0 at a right angle, −1 when opposite). That is <i>why</i>
"aligned → big, perpendicular → zero" isn't hand-waving; it falls out of this identity.</p>
<p><b>3. Length is a dot product with itself.</b> Set <code>b = a</code> and <code>θ = 0</code>:
<code>a·a = ‖a‖²</code>, so <code>‖a‖ = √(a·a)</code>. For <code>[3,4]</code> that's
<code>√(9+16) = 5</code> — Pythagoras, recovered as a special case. One operation gives you both
similarity <i>and</i> distance.</p>
<p><b>4. Why ML cares (the payoff).</b> <b>Cosine similarity</b> — the backbone of search and
recommendation — is just <code>cos θ = (a·b)/(‖a‖‖b‖)</code>, the dot product with the lengths
divided out, so only <i>direction</i> matters. A single artificial neuron computes
<code>w·x + b</code> then squashes it: the dot product <code>w·x</code> is asking "how much does
this input align with what I've learned to look for?" And in a transformer, attention scores are
<code>q·k</code> — the same dot product, deciding how much one token should attend to another.
Master this one operation and a startling amount of ML stops being mysterious.</p>
<p><b>5. The rigorous footnote.</b> Formally the dot product is one example of an <i>inner product</i>:
a rule ⟨a,b⟩ that is symmetric, linear in each argument, and positive-definite (⟨a,a⟩ ≥ 0, zero
only for the zero vector). Those three properties are <i>exactly</i> what let us define length and
angle at all — and they generalize beyond arrows to functions and probability distributions, which
is how kernels and function spaces (Bishop, Ch. 6) get off the ground. You don't need that yet, but
now you know the ladder is there.</p>`,
 docs:[['NumPy — the absolute basics for beginners','https://numpy.org/doc/stable/user/absolute_beginners.html'],['Bishop, Pattern Recognition and Machine Learning (free PDF)','https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/']],
 quiz:{title:'Quick check — did the idea land?',questions:[
   {q:'In the plainest terms, a vector is:',
    options:['A kind of spreadsheet formula','An ordered list of numbers (also picturable as an arrow or point in space)','A type of neural network','A special database table'],
    answer:1,
    why:'A vector is just an ordered list of numbers, e.g. [178, 74, 31]. The arrow/point picture is the same object seen geometrically.'},
   {q:'"Support Vector Machine" — stripped of the intimidating name — is really:',
    options:['A physical machine that stores vectors','A method that draws the line/plane best separating two groups, as far from both as possible','A programming language for math','A way to compress data on disk'],
    answer:1,
    why:'It is geometry: the widest-margin separating boundary. The "support vectors" are just the closest data points that pin that boundary in place.'},
   {q:'The dot product of two vectors gives you:',
    options:['Another, longer vector','A single number measuring how aligned the two vectors are','A matrix of all their products','The average of the two vectors'],
    answer:1,
    why:'Multiply element-by-element and add: one number. Big positive = aligned, zero = perpendicular, negative = opposing. It is the core "similarity" operation in ML.'}
 ]},
 exs:[{title:'Vectors, length, and the dot product — in real NumPy',
   lang:'python',
   packages:['numpy'],
   prompt:`Time to run real Python (NumPy) in your browser. Fill in the four blanks so the program:
   <ol>
   <li>makes the vector <code>v = [3, 4]</code> as a NumPy array,</li>
   <li>computes its <b>length</b> (the L2 norm) into <code>length</code> — it should come out to <code>5.0</code>,</li>
   <li>makes a second vector <code>u = [1, 0]</code>,</li>
   <li>computes the <b>dot product</b> <code>v·u</code> into <code>dot</code> — the alignment of <code>v</code> with the x-axis (it should be <code>3</code>),</li>
   </ol>
   then prints them. Hint: <code>np.array([...])</code>, <code>np.linalg.norm(x)</code>, and <code>np.dot(a, b)</code>.`,
   starter:`import numpy as np

# 1) Make the vector v = [3, 4]
v =

# 2) Its length (L2 norm) — how long the arrow is
length =

# 3) A second vector u = [1, 0]
u =

# 4) The dot product v . u  (how aligned v is with u)
dot =

print("length =", length, "  dot =", dot)
`,
   solution:`import numpy as np

# 1) Make the vector v = [3, 4]
v = np.array([3, 4])

# 2) Its length (L2 norm) — how long the arrow is
length = np.linalg.norm(v)

# 3) A second vector u = [1, 0]
u = np.array([1, 0])

# 4) The dot product v . u  (how aligned v is with u)
dot = np.dot(v, u)

print("length =", length, "  dot =", dot)
`,
   tests:[
     {d:'v is the vector [3, 4]',expr:'list(np.asarray(v).ravel()) == [3, 4]'},
     {d:'length is 5.0 (the L2 norm √(3²+4²))',expr:'abs(float(length) - 5.0) < 1e-9'},
     {d:'u is the vector [1, 0]',expr:'list(np.asarray(u).ravel()) == [1, 0]'},
     {d:'dot product v·u equals 3',expr:'abs(float(dot) - 3.0) < 1e-9'},
     {d:'the program prints its results',expr:'"length" in _stdout and "dot" in _stdout'}
   ],
   hints:[
     'A NumPy vector is made with np.array([...]). For step 1 that is literally np.array([3, 4]).',
     'The length / L2 norm has a built-in: np.linalg.norm(v). By hand it would be np.sqrt((v*v).sum()).',
     'The dot product is np.dot(v, u) (or v @ u). It multiplies matching entries and adds them: 3*1 + 4*0 = 3.'
   ]}]},

{id:'vec2',
 title:'Slicing & boolean masks: asking questions of data without loops',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Real data work is mostly questions: <i>"give me the prices column," "which houses cost more
than 200k?", "what is the average?"</i> In pure Python those are loops. In NumPy each is one
readable expression — and this notation is the daily bread of every ML practitioner, pandas
user, and paper-reproducer. Learn to read it and half of real-world ML code opens up.</p></div>

<h3>Slicing: rows and columns by position</h3>
<div class="codeSample">X = np.array([[120, 300],
              [ 90, 210],
              [150, 400],
              [ 60, 150]])   # 4 houses: size m², price k

X[0]        # first row  → [120, 300]     (one house)
X[:, 0]     # ALL rows, column 0 → [120, 90, 150, 60]   (all sizes)
X[:, 1]     # all prices
X[1:3]      # rows 1 and 2 (end excluded, like range)</div>
<p>The comma reads "rows, columns" and <code>:</code> means "all of them" —
<code>X[:, 0]</code> is "every row, column 0." That one idiom unlocks most NumPy you will
ever read.</p>

<h3>Boolean masks: filter by condition, no loop</h3>
<div class="codeSample">X[:, 1] > 200          # [True, True, True, False]  — a question per row
X[X[:, 1] > 200]       # the rows where it is True — the expensive houses</div>
<p>A comparison on an array asks the question <i>everywhere at once</i>, producing a
<b>mask</b> of booleans; indexing with the mask keeps the True rows. "Select the spam
emails," "drop the outliers," "take the test set" — all one-line masks in real code.</p>

<h3>Aggregation with axes</h3>
<p><code>X.mean()</code> averages everything; <code>X.mean(axis=0)</code> averages <i>down</i>
each column (per-feature means — you used it in linear algebra); <code>.max()</code>,
<code>.min()</code>, <code>.sum()</code>, <code>.std()</code> all take the same
<code>axis</code>. Rule of thumb: <b>axis=0 collapses rows</b> (one answer per column),
<b>axis=1 collapses columns</b> (one answer per row).</p>

<div class="demystify"><b>Demystify "vectorized":</b> when people say "vectorize your code"
they just mean "replace the Python loop with one whole-array operation." Nothing about
vectors-the-arrows — an unfortunate double use of the word, flagged here so it never trips
you.</div>`,
 docs:[['NumPy — indexing and slicing','https://numpy.org/doc/stable/user/basics.indexing.html']],
 quiz:{title:'Quick check',questions:[
   {q:'X[:, 1] reads as:',
    options:['Row 1','Every row, column 1 — the whole second column','The first two rows','Columns except the first'],answer:1,
    why:'Comma = "rows, columns"; ":" = all. So X[:, 1] is column 1 across all rows.'},
   {q:'X[X[:, 1] > 200] returns:',
    options:['True/False values','The rows of X where column 1 exceeds 200 — a filtered dataset','The number of matches','An error'],answer:1,
    why:'The comparison builds a boolean mask (one True/False per row); indexing with it keeps the True rows.'},
   {q:'X.mean(axis=0) gives:',
    options:['One number','One mean per COLUMN — it collapses the rows','One mean per row','The median'],answer:1,
    why:'axis=0 collapses rows: per-feature averages. axis=1 would collapse columns: per-example averages.'}
 ]},
 exs:[{title:'Query a housing dataset without a single loop',
   lang:'python',
   packages:['numpy'],
   prompt:`Using the 4-house matrix <code>X</code> (columns: size m², price k):
   <ol>
   <li><code>sizes</code> — the whole size column (<code>[120, 90, 150, 60]</code>),</li>
   <li><code>n_expensive</code> — how many houses cost more than 200 (mask, then <code>.shape[0]</code> or <code>.sum()</code> on the mask — expect 3),</li>
   <li><code>avg_price</code> — the average price (expect 265.0),</li>
   <li><code>biggest_cheap</code> — the largest size among houses costing <b>at most</b> 250 (mask + max — expect 90).</li>
   </ol>`,
   starter:`import numpy as np

X = np.array([[120, 300],
              [ 90, 210],
              [150, 400],
              [ 60, 150]])

# 1) The size column
sizes =

# 2) How many houses cost more than 200?
n_expensive =

# 3) Average price
avg_price =

# 4) Largest size among houses costing at most 250
biggest_cheap =

print(sizes, n_expensive, avg_price, biggest_cheap)
`,
   solution:`import numpy as np

X = np.array([[120, 300],
              [ 90, 210],
              [150, 400],
              [ 60, 150]])

# 1) The size column
sizes = X[:, 0]

# 2) How many houses cost more than 200?
n_expensive = (X[:, 1] > 200).sum()

# 3) Average price
avg_price = X[:, 1].mean()

# 4) Largest size among houses costing at most 250
biggest_cheap = X[X[:, 1] <= 250][:, 0].max()

print(sizes, n_expensive, avg_price, biggest_cheap)
`,
   tests:[
     {d:'sizes is the size column [120, 90, 150, 60]',expr:'list(np.asarray(sizes)) == [120, 90, 150, 60]'},
     {d:'3 houses cost more than 200',expr:'int(n_expensive) == 3'},
     {d:'average price is 265.0',expr:'abs(float(avg_price) - 265.0) < 1e-9'},
     {d:'largest size among ≤250k houses is 90',expr:'int(biggest_cheap) == 90'}
   ],
   hints:[
     'sizes = X[:, 0] — every row, column 0.',
     'A mask is a comparison: X[:, 1] > 200. Its .sum() counts the Trues (True counts as 1).',
     'Chain it: X[X[:, 1] <= 250] keeps the affordable rows (prices 210 and 150); [:, 0] takes their sizes; .max() gives 90.'
   ]}]},

{id:'vec3',
 title:'Broadcasting & vectorization: why NumPy is fast (standardize a dataset)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p><b>Broadcasting</b> is NumPy's rule for combining arrays of different shapes: the smaller
one is "stretched" to fit — without copying. <code>X - col_means</code> subtracts a
2-number row from every row of a 4×2 matrix in one shot. This single rule is why real ML code
has almost no loops: the loop is implicit, and it runs in compiled C instead of Python —
routinely 100–1000× faster on real data.</p></div>

<h3>The one transformation every dataset gets: standardization</h3>
<p>Features come in wildly different units — size in m² (60–150), price in thousands
(150–400). Many models silently assume features are comparable, so step one of countless
pipelines is the <b>z-score</b>: subtract each column's mean, divide by its standard
deviation. Result: every feature has mean 0 and spread 1 — same ruler for everything.</p>
<div class="codeSample">Z = (X - X.mean(axis=0)) / X.std(axis=0)
# one line. mean row broadcast down, std row broadcast down.
# Z.mean(axis=0) → [0, 0]    Z.std(axis=0) → [1, 1]</div>
<p>Read what broadcasting did: <code>X.mean(axis=0)</code> is a 2-number row; subtracting it
from the 4×2 matrix stretched it across all 4 rows. Then the same for the division. You will
write this exact line for the rest of your ML life (sklearn calls it
<code>StandardScaler</code> — now you know what is inside).</p>

<div class="hardidea">🧠 <b>The shape rule, precisely.</b> Two shapes are compatible when,
comparing dimensions from the right, each pair is equal or one of them is 1 (or missing);
size-1 dimensions get stretched. (4,2) vs (2,) → compatible: the (2,) row is stretched down
4 rows. (4,2) vs (4,) → NOT compatible — a classic gotcha: a length-4 column must be reshaped
to (4,1) first. When a "shapes don't match" error hits, this rule is the whole explanation.</div>

<div class="demystify"><b>Demystify "broadcasting":</b> nothing is being transmitted — the
term just means "pretend the small array is repeated to match, without actually copying it."
A memory-free virtual copy plus a compiled loop. That is the entire magic of NumPy.</div>`,
 docs:[['NumPy — broadcasting','https://numpy.org/doc/stable/user/basics.broadcasting.html']],
 quiz:{title:'Quick check',questions:[
   {q:'X is 4×2 and m = X.mean(axis=0) has shape (2,). X - m works because:',
    options:['NumPy ignores shapes','Broadcasting stretches the 2-number row across all 4 rows — no copy, compiled speed','m is converted to a scalar','It does not work'],answer:1,
    why:'Shapes align from the right: (4,2) vs (2,) → the row is virtually repeated down the rows.'},
   {q:'After Z = (X - X.mean(axis=0)) / X.std(axis=0), each column of Z has:',
    options:['Mean 1 and spread 0','Mean 0 and spread 1 — every feature on the same ruler','Its original units','Only positive values'],answer:1,
    why:'That is the z-score: center, then scale. The standard first step of countless ML pipelines (StandardScaler).'},
   {q:'Why is vectorized NumPy so much faster than a Python for-loop doing the same math?',
    options:['It skips half the numbers','The loop happens in compiled C over packed memory instead of interpreted Python objects','It uses the GPU automatically','It caches the answer'],answer:1,
    why:'Same arithmetic, different engine: compiled tight loops over contiguous arrays vs the Python interpreter per element.'}
 ]},
 exs:[{title:'Standardize the housing data in one line',
   lang:'python',
   packages:['numpy'],
   prompt:`Take the same 4×2 housing matrix and put both features on one ruler:
   <ol>
   <li><code>col_means</code> — per-column means (<code>axis=0</code>),</li>
   <li><code>col_stds</code> — per-column standard deviations,</li>
   <li><code>Z</code> — the standardized matrix <code>(X - col_means) / col_stds</code> — broadcasting does the rest,</li>
   <li><code>check_means</code>, <code>check_stds</code> — <code>Z.mean(axis=0)</code> and <code>Z.std(axis=0)</code>: they must come out ≈ [0, 0] and [1, 1].</li>
   </ol>`,
   starter:`import numpy as np

X = np.array([[120.0, 300.0],
              [ 90.0, 210.0],
              [150.0, 400.0],
              [ 60.0, 150.0]])

# 1) Per-column means
col_means =

# 2) Per-column standard deviations
col_stds =

# 3) The z-scored matrix — one line, broadcasting does the work
Z =

# 4) Verify the new ruler: means ~ [0,0], stds ~ [1,1]
check_means =
check_stds =

print(check_means, check_stds)
`,
   solution:`import numpy as np

X = np.array([[120.0, 300.0],
              [ 90.0, 210.0],
              [150.0, 400.0],
              [ 60.0, 150.0]])

# 1) Per-column means
col_means = X.mean(axis=0)

# 2) Per-column standard deviations
col_stds = X.std(axis=0)

# 3) The z-scored matrix — one line, broadcasting does the work
Z = (X - col_means) / col_stds

# 4) Verify the new ruler: means ~ [0,0], stds ~ [1,1]
check_means = Z.mean(axis=0)
check_stds = Z.std(axis=0)

print(check_means, check_stds)
`,
   tests:[
     {d:'col_means is [105, 265]',expr:'np.allclose(col_means, [105.0, 265.0])'},
     {d:'Z has column means ≈ 0 — centered',expr:'np.allclose(check_means, [0.0, 0.0], atol=1e-9)'},
     {d:'Z has column stds ≈ 1 — one ruler for every feature',expr:'np.allclose(check_stds, [1.0, 1.0], atol=1e-9)'},
     {d:'the first house is above average size (Z[0,0] > 0)',expr:'Z[0, 0] > 0'}
   ],
   hints:[
     'col_means = X.mean(axis=0); col_stds = X.std(axis=0) — axis=0 collapses the rows.',
     'Z = (X - col_means) / col_stds — the (2,) rows broadcast down the (4,2) matrix automatically.',
     'If check_means prints tiny numbers like 1e-16, that IS zero in float arithmetic — allclose handles it.'
   ]}]}
]});
