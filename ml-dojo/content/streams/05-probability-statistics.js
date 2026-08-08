STREAMS.push({icon:'🎲',track:'Foundations Track',title:'Probability & Statistics',blurb:'From "what does 70% chance even mean?" through distributions and Gaussians — then, on those foundations, Bayesian probability.',requires:'log2',requiresName:'Logarithms & Exponentials',lessons:[
{id:'pr1',
 title:'Fundamentals: what probability is (measure it by simulating)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Probability is <b>how often something happens in the long run</b>. "A fair coin is 50%
heads" means: flip it a million times and very close to half will be heads. You don't have to
take that on faith — with Python you can <i>run</i> the million flips and watch the number
settle. That habit — <b>when unsure, simulate</b> — is the working data scientist's secret
weapon, and it's how we'll check every formula in this stream.</p></div>

<h3>Two readings of the same number</h3>
<p>The <b>frequentist</b> reading: probability = long-run frequency (the coin). The
<b>Bayesian</b> reading: probability = <i>degree of belief</i> ("70% chance it rains
tomorrow" — tomorrow happens once; the 70% describes your confidence, not a repeat count).
Both are used everywhere in ML; the advanced part of this stream is built on the second.</p>

<div class="notebox"><b>📐 Notation decoder — probability & statistics</b> (met across this
stream; refer back anytime):
<table>
<tr><td>P(A)</td><td>the <b>probability</b> of event A (a number from 0 to 1)</td></tr>
<tr><td>P(A | B)</td><td>the probability of A <b>given</b> B (the "|" reads "given")</td></tr>
<tr><td>P(A, B)</td><td>the <b>joint</b> probability — A <i>and</i> B both happen</td></tr>
<tr><td>E[X]</td><td>the <b>expectation</b> (mean) of X — its long-run average</td></tr>
<tr><td>Var(X), σ²</td><td>the <b>variance</b> — average squared spread</td></tr>
<tr><td>σ (sigma)</td><td>the <b>standard deviation</b> — spread in original units (√variance)</td></tr>
<tr><td>μ (mu)</td><td>the <b>mean</b> of a distribution</td></tr>
<tr><td>X ~ N(μ, σ²)</td><td>"X is <b>distributed as</b>" a normal (Gaussian) with mean μ, variance σ²</td></tr>
<tr><td>∝</td><td>"is <b>proportional to</b>" (shows up in Bayes' rule)</td></tr>
<tr><td>argmax</td><td>the value that <b>maximizes</b> something (MLE finds parameters this way)</td></tr>
</table>
Note the collision to keep straight: σ (sigma, lower-case) is standard deviation here, while Σ
(Sigma, capital) was summation in the notation stream — same letter, different jobs.</div>

<h3>Expectation and variance — the two numbers that summarize randomness</h3>
<p>The <b>expectation</b> (mean) is the long-run average: a die averages
(1+2+…+6)/6 = <b>3.5</b> — a value it never actually shows, but where the average settles.
The <b>variance</b> measures <i>spread</i>: the average of the <b>squared</b> distances from
the mean. Squared — remember why from the MSE story: so over- and under-shoots don't cancel,
and big misses count more. A die's variance is exactly <b>35/12 ≈ 2.92</b> — and your
simulation will land right on it.</p>
<div class="codeSample">import random
rolls = [random.randint(1, 6) for _ in range(100_000)]
mean = sum(rolls) / len(rolls)                          # ≈ 3.5
var  = sum((r - mean)**2 for r in rolls) / len(rolls)   # ≈ 2.92</div>

<div class="demystify"><b>Demystify "expectation":</b> nothing is being "expected" in the
everyday sense — a die never rolls 3.5. It's just the long-run average, and the name stuck
(from 17th-century gambling math). Same for "variance": it's simply "average squared distance
from the mean" — spread, measured in a way that will feed the math later.</div>`,
 docs:[['Seeing Theory — a visual intro to probability','https://seeing-theory.brown.edu/']],
 quiz:{title:'Quick check',questions:[
   {q:'"This coin is 50% heads" means, in the frequentist reading:',
    options:['Every second flip is heads, alternating','Over many flips, the fraction of heads settles toward one half','The coin remembers its last flip','Heads is worth half a point'],answer:1,
    why:'Probability = long-run frequency. Any short run can wobble; the fraction converges as flips accumulate.'},
   {q:'The expectation of a fair die is 3.5. Why is that not absurd, given no face shows 3.5?',
    options:['It is absurd — the books are wrong','Expectation is the long-run average, not a value that must occur','Dice actually have a 3.5 face','Because of rounding'],answer:1,
    why:'Expectation is where the running average settles over many rolls — it need not be a possible outcome.'},
   {q:'Variance uses SQUARED distances from the mean because:',
    options:['Squares are easier to type','Positive and negative deviations would cancel; squaring also makes big misses count more','It makes the number smaller','Tradition only'],answer:1,
    why:'Same logic as MSE: kill the cancellation, weight large deviations more, and keep the math smooth for what comes later.'}
 ]},
 exs:[{title:'Simulate a die: watch the mean and variance settle',
   lang:'python',
   prompt:`Simulate <code>100_000</code> rolls of a fair die with <code>random.randint(1, 6)</code>
   (the seed is fixed for you so results are reproducible):
   <ol>
   <li><code>rolls</code> — the list of 100,000 rolls,</li>
   <li><code>mean</code> — their average (should land within 0.05 of <b>3.5</b>),</li>
   <li><code>var</code> — the average of squared distances from the mean (within 0.1 of <b>35/12 ≈ 2.917</b>),</li>
   <li><code>p_six</code> — the fraction of rolls that are 6 (within 0.01 of <b>1/6 ≈ 0.167</b>).</li>
   </ol>`,
   starter:`import random
random.seed(42)          # fixed so your numbers are reproducible

# 1) 100,000 rolls of a fair die
rolls =

# 2) The long-run average — expectation
mean =

# 3) Average SQUARED distance from the mean — variance
var =

# 4) Fraction of rolls that are 6
p_six =

print(mean, var, p_six)
`,
   solution:`import random
random.seed(42)          # fixed so your numbers are reproducible

# 1) 100,000 rolls of a fair die
rolls = [random.randint(1, 6) for _ in range(100_000)]

# 2) The long-run average — expectation
mean = sum(rolls) / len(rolls)

# 3) Average SQUARED distance from the mean — variance
var = sum((r - mean) ** 2 for r in rolls) / len(rolls)

# 4) Fraction of rolls that are 6
p_six = sum(1 for r in rolls if r == 6) / len(rolls)

print(mean, var, p_six)
`,
   tests:[
     {d:'100,000 rolls, all between 1 and 6',expr:'len(rolls) == 100000 and min(rolls) >= 1 and max(rolls) <= 6'},
     {d:'mean settles near 3.5 (the expectation)',expr:'abs(mean - 3.5) < 0.05'},
     {d:'variance settles near 35/12 ≈ 2.917',expr:'abs(var - 35/12) < 0.1'},
     {d:'P(six) settles near 1/6',expr:'abs(p_six - 1/6) < 0.01'}
   ],
   hints:[
     'Build the rolls with a comprehension: [random.randint(1, 6) for _ in range(100_000)].',
     'mean = sum(rolls) / len(rolls); var = sum((r - mean)**2 for r in rolls) / len(rolls).',
     'Count sixes with sum(1 for r in rolls if r == 6), then divide by len(rolls).'
   ]}]},

{id:'st1',
 title:'Fundamentals: descriptive statistics — summarizing data beyond the mean',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Before modelling anything, you <b>describe</b> your data — and the mean alone lies. One
billionaire in a room of ten people makes the <i>average</i> wealth enormous while nine people
are broke. Descriptive statistics are the small set of numbers that summarize a dataset
honestly; reaching for them is the first move in every real ML project (exploratory data
analysis), and choosing the right one is a mark of competence.</p></div>

<h3>Middle: mean vs median vs mode</h3>
<p><b>Mean</b> — the average (sum ÷ count); sensitive to extreme values. <b>Median</b> — the
middle value when sorted; <i>robust</i> — the billionaire barely moves it. <b>Mode</b> — the
most common value. On <code>[1, 2, 2, 3, 100]</code>: mean ≈ 21.6 (dragged up by 100),
median = 2 (unbothered), mode = 2. When mean and median diverge, your data is <b>skewed</b> —
the mean is pulled toward the long tail. (Recognise the pair? Squared error lands on the mean,
absolute error on the median — the MSE-vs-MAE robustness story, in statistics form.)</p>

<h3>Spread: range, percentiles, and the IQR</h3>
<p><b>Range</b> = max − min (crude; one outlier ruins it). Far better: <b>percentiles</b>. The
<code>p</code>-th percentile is the value below which <code>p%</code> of the data falls. Three
matter most — the <b>quartiles</b>: <b>Q1</b> (25th percentile), <b>Q2</b> (50th = the median),
<b>Q3</b> (75th). The <b>interquartile range IQR = Q3 − Q1</b> is the spread of the middle
50% — a robust measure of "how spread out," ignoring the extremes. The standard outlier rule
(the whiskers of a box plot): anything below <code>Q1 − 1.5·IQR</code> or above
<code>Q3 + 1.5·IQR</code> is flagged as an outlier.</p>

<div class="demystify"><b>Demystify "robust":</b> a statistic is robust if a few weird values
barely change it. The median and IQR are robust; the mean, range, and standard deviation are
not. In real, messy ML data (which always has a few garbage rows), robust summaries tell you
the truth while the mean quietly misleads — which is exactly why box plots and medians are the
data scientist's default first look.</div>`,
 docs:[['Descriptive statistics — an overview','https://www.scribbr.com/statistics/descriptive-statistics/']],
 quiz:{title:'Quick check',questions:[
   {q:'On the data [1, 2, 2, 3, 100], the mean is ~21.6 but the median is 2. This tells you:',
    options:['The median is wrong','The data is skewed — one extreme value (100) drags the mean up, while the median stays robust','The mode is 100','Nothing useful'],answer:1,
    why:'Mean is sensitive to outliers, median is robust. A large gap between them signals skew and warns you not to trust the mean alone.'},
   {q:'The interquartile range (IQR) is:',
    options:['max − min','Q3 − Q1 — the spread of the middle 50% of the data, robust to outliers','The average','The most common value'],answer:1,
    why:'IQR ignores the extreme quarters, so a few outliers do not distort it — unlike the range or standard deviation.'},
   {q:'Why do data scientists reach for the median and IQR first on real data?',
    options:['They are easier to compute','Real data has garbage rows; robust statistics tell the truth while the mean and range get distorted by outliers','They are required by law','They only work on big data'],answer:1,
    why:'Robustness. The first look at messy data should not be fooled by a handful of extreme or erroneous values.'}
 ]},
 exs:[{title:'Robust vs sensitive — summarize data with an outlier',
   lang:'python',
   packages:['numpy'],
   prompt:`Salaries (thousands), with one outlier: <code>data = [30, 35, 40, 45, 50, 500]</code>:
   <ol>
   <li><code>mean</code> — the average (use <code>np.mean</code>; ≈ 116.7, dragged up by 500),</li>
   <li><code>median</code> — the middle (<code>np.median</code>; 42.5 — barely affected),</li>
   <li><code>q1, q3</code> — the 25th and 75th percentiles (<code>np.percentile(data, 25)</code> and <code>75</code>),</li>
   <li><code>iqr</code> — <code>q3 - q1</code>,</li>
   <li><code>mean_beats_median</code> — <code>True</code> if <code>mean &gt; 2 * median</code> (showing how far the outlier dragged the mean).</li>
   </ol>`,
   starter:`import numpy as np

data = [30, 35, 40, 45, 50, 500]

mean = np.mean(data)
median = np.median(data)

# 25th and 75th percentiles
q1 =
q3 =

# interquartile range
iqr =

# did the outlier drag the mean way above the median?
mean_beats_median =

print(mean, median, q1, q3, iqr, mean_beats_median)
`,
   solution:`import numpy as np

data = [30, 35, 40, 45, 50, 500]

mean = np.mean(data)
median = np.median(data)

# 25th and 75th percentiles
q1 = np.percentile(data, 25)
q3 = np.percentile(data, 75)

# interquartile range
iqr = q3 - q1

# did the outlier drag the mean way above the median?
mean_beats_median = mean > 2 * median

print(mean, median, q1, q3, iqr, mean_beats_median)
`,
   tests:[
     {d:'mean is dragged up near 116.7 by the outlier',expr:'abs(mean - 116.6667) < 0.1'},
     {d:'median stays robust at 42.5',expr:'abs(median - 42.5) < 1e-9'},
     {d:'quartiles: Q1 ≈ 36.25, Q3 ≈ 48.75',expr:'abs(q1 - 36.25) < 0.5 and abs(q3 - 48.75) < 0.5'},
     {d:'IQR = Q3 − Q1 (robust spread)',expr:'abs(iqr - (q3 - q1)) < 1e-9'},
     {d:'the mean is more than double the median — the outlier’s fingerprint',expr:'mean_beats_median == True'}
   ],
   hints:[
     'np.mean and np.median are one call each. Notice how different they are — that gap IS the outlier.',
     'np.percentile(data, 25) and np.percentile(data, 75) give the quartiles; iqr = q3 - q1.',
     'mean_beats_median = mean > 2 * median — the mean (~117) is far above twice the median (85), because 500 pulls it.'
   ]}]},

{id:'ct1',
 title:'Fundamentals: counting — permutations, combinations, and where the binomial comes from',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Probability of equally-likely outcomes is <b>favourable ÷ total</b> — so you have to
<i>count</i> outcomes, and outcomes explode fast. <b>Combinatorics</b> is the art of counting
without listing, and it is the missing piece behind the binomial distribution, the
"n-choose-k" you see in formulas, and a lot of probability reasoning.</p></div>

<h3>The foundation: the fundamental counting principle</h3>
<p>Everything in this lesson is built from one rule, and it is common sense: <b>if one choice
can be made in <code>m</code> ways and a second (independent) choice in <code>n</code> ways,
then the two together can be made in <code>m × n</code> ways.</b> Three shirts and four pants
give <code>3 × 4 = 12</code> outfits. It chains across any number of stages — just multiply the
number of options at each stage. That single "multiply the options" idea generates every
formula below; if you ever forget a formula, you can rebuild it from here.</p>

<h3>Factorials — the counting principle applied to arranging</h3>
<p>How many ways to arrange <code>n</code> distinct items in a row? <code>n</code> choices for
the first slot, <code>(n−1)</code> for the next (one is used up), and so on down to 1 —
multiply them all by the counting principle. That product is the <b>factorial</b>:
<code>n! = n × (n−1) × … × 2 × 1</code>. So <code>5! = 120</code>. One convention worth knowing:
<code>0! = 1</code> (there is exactly one way to arrange nothing). Factorials are the raw
material of permutations and combinations.</p>

<h3>Two quick probability rules</h3>
<p><b>Complement:</b> <code>P(not A) = 1 − P(A)</code> — often the easy way in ("at least one"
= 1 − "none"). <b>Addition rule:</b> <code>P(A or B) = P(A) + P(B) − P(A and B)</code> — add
the two, then subtract the overlap you double-counted (if they can't both happen, the overlap
is 0 and you just add).</p>

<h3>Permutations: order matters</h3>
<p>How many ways to arrange things when <b>order counts</b>? For <code>n</code> distinct items
in <code>k</code> slots: <code>n × (n−1) × … </code> for <code>k</code> factors, written
<code>n! / (n−k)!</code>. The <b>factorial</b> <code>n! = n×(n−1)×…×1</code> counts full
arrangements (5! = 120 ways to order 5 books). Example: how many 3-letter codes from 5 distinct
letters, no repeats? <code>5 × 4 × 3 = 60</code>.</p>

<h3>Combinations: order does NOT matter</h3>
<p>When picking a <i>group</i> where order is irrelevant (a committee, or <i>which</i> flips
came up heads), use <b>combinations</b> — "<b>n choose k</b>":</p>
<div class="codeSample">C(n, k) = n! / ( k! · (n−k)! )      "n choose k"      (Python: math.comb(n, k))</div>
<p>Example: how many ways to choose 2 people from 4? <code>C(4,2) = 6</code>. The link to ML
and probability: the number of ways to get <b>k heads in n coin flips</b> is exactly
<code>C(n, k)</code> — which is the counting factor in the <b>binomial distribution</b> you met
by shape in the distributions lesson. That is <i>why</i> the middle outcomes (many ways to
arrange them) are more likely than the extremes (only one way to get all-heads).</p>

<div class="demystify"><b>Demystify "n choose k":</b> it just answers "how many different
groups of <code>k</code> can I pick from <code>n</code>?" — nothing more. Permutations count
arrangements (order matters); combinations count selections (order does not). Mixing them up is
the classic counting mistake; the tell is the word "arrange/order" (permutation) vs
"choose/select/group" (combination).</div>`,
 docs:[['Permutations and combinations','https://www.mathsisfun.com/combinatorics/combinations-permutations.html'],['Python math.comb / math.perm','https://docs.python.org/3/library/math.html#math.comb']],
 quiz:{title:'Quick check',questions:[
   {q:'The fundamental counting principle says that 3 shirts and 4 pants give how many outfits?',
    options:['7 (add them)','12 (multiply: 3 × 4 — the number of options at each stage)','1','It depends'],answer:1,
    why:'Independent choices multiply: m ways × n ways = m×n combined. This one rule generates factorials, permutations, and combinations.'},
   {q:'The difference between a permutation and a combination is:',
    options:['Nothing','Permutations count ARRANGEMENTS (order matters); combinations count SELECTIONS (order does not)','Permutations are always bigger numbers','Combinations only work for 2 items'],answer:1,
    why:'Order is the whole distinction. "Arrange/order" → permutation; "choose/group/select" → combination.'},
   {q:'"n choose k", written C(n, k), answers:',
    options:['n times k','How many different groups of k can be picked from n (order irrelevant)','n to the power k','The larger of n and k'],answer:1,
    why:'C(n,k) = n!/(k!(n−k)!) counts unordered selections. It is the counting factor in the binomial distribution.'},
   {q:'The number of ways to get exactly k heads in n coin flips is:',
    options:['n × k','C(n, k) — which is why middle counts (many arrangements) beat the extremes (one arrangement)','always 1','k / n'],answer:1,
    why:'There are C(n,k) arrangements of k heads among n flips. All-heads has only C(n,n)=1 way; that is why extremes are rare.'}
 ]},
 exs:[{title:'Count it — factorials, choices, and the binomial coefficient',
   lang:'python',
   prompt:`Use Python's <code>math</code> module (<code>math.factorial</code>,
   <code>math.comb</code>, <code>math.perm</code>):
   <ol>
   <li><code>outfits</code> — by the counting principle, 3 shirts × 4 pants (12),</li>
   <li><code>arrangements</code> — how many ways to order 5 books (<code>5!</code> = 120),</li>
   <li><code>codes</code> — 3-letter codes from 5 distinct letters, no repeats, order matters (<code>math.perm(5, 3)</code> = 60),</li>
   <li><code>committees</code> — ways to choose 2 people from 4 (<code>math.comb(4, 2)</code> = 6),</li>
   <li><code>ways_2_heads</code> — number of ways to get exactly 2 heads in 4 flips (also <code>math.comb(4, 2)</code>),</li>
   <li><code>p_2_heads</code> — its probability: <code>ways_2_heads / 2**4</code> (there are 2⁴ = 16 equally likely flip sequences → 0.375).</li>
   </ol>`,
   starter:`import math

outfits =                # 3 shirts x 4 pants (counting principle)
arrangements =           # 5!
codes =                  # perm(5, 3): order matters, no repeats
committees =             # comb(4, 2): choose 2 of 4
ways_2_heads =           # comb(4, 2): 2 heads among 4 flips
p_2_heads =              # ways / total sequences (2**4)

print(outfits, arrangements, codes, committees, ways_2_heads, p_2_heads)
`,
   solution:`import math

outfits = 3 * 4                      # 3 shirts x 4 pants (counting principle)
arrangements = math.factorial(5)     # 5!
codes = math.perm(5, 3)              # perm(5, 3): order matters, no repeats
committees = math.comb(4, 2)         # comb(4, 2): choose 2 of 4
ways_2_heads = math.comb(4, 2)       # comb(4, 2): 2 heads among 4 flips
p_2_heads = ways_2_heads / 2**4      # ways / total sequences (2**4)

print(outfits, arrangements, codes, committees, ways_2_heads, p_2_heads)
`,
   tests:[
     {d:'3 × 4 = 12 outfits (fundamental counting principle)',expr:'outfits == 12'},
     {d:'5! = 120 arrangements of 5 books',expr:'arrangements == 120'},
     {d:'perm(5,3) = 60 ordered codes',expr:'codes == 60'},
     {d:'comb(4,2) = 6 committees',expr:'committees == 6'},
     {d:'6 ways to get 2 heads in 4 flips',expr:'ways_2_heads == 6'},
     {d:'P(exactly 2 heads in 4 flips) = 6/16 = 0.375',expr:'abs(p_2_heads - 0.375) < 1e-9'}
   ],
   hints:[
     'math.factorial(5) is 120. math.perm(5, 3) counts ordered selections (60).',
     'math.comb(4, 2) counts unordered selections (6) — and that is exactly the number of ways to place 2 heads among 4 flips.',
     'There are 2**4 = 16 equally likely head/tail sequences of length 4, so P(2 heads) = 6/16 = 0.375.'
   ]}]},

{id:'pr2',
 title:'Fundamentals: distributions — PMF, PDF, and why the Gaussian is everywhere',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A <b>distribution</b> is the full "shape of the randomness" — not just the average, but how
probability spreads over the outcomes. Meet the vocabulary word by word, because two letters
trip everyone: PMF and PDF.</p></div>

<h3>PMF — countable outcomes</h3>
<p>When outcomes can be listed (a die: 1–6), a <b>PMF</b> (probability <i>mass</i> function)
just assigns each outcome its probability: P(4) = 1/6. The bars sum to 1. Simple.</p>

<h3>PDF — continuous outcomes (the trap)</h3>
<p>Heights, weights, and errors are <b>continuous</b> — between any two values lie infinitely
many more. So the chance of being <i>exactly</i> 178.000000…cm is <b>zero</b>, and yet heights
obviously cluster around some typical value. The fix: a <b>PDF</b> (probability
<i>density</i> function) describes how <i>dense</i> probability is near each value, and real
probabilities are <b>areas under the curve</b> over a <i>range</i>: P(170 ≤ height ≤ 180) =
the area between 170 and 180. Density can even exceed 1 — only areas must behave.</p>

<h3>The Gaussian — the bell everyone means by "normal"</h3>
<p>One continuous shape dominates nature and ML: the <b>normal (Gaussian)</b> — the bell
curve. Two knobs describe it completely: the <b>mean</b> (where the peak sits) and the
<b>standard deviation</b> (how wide the bell spreads). Why is it everywhere? The
<b>central limit theorem</b>, in plain words: <i>add up many small independent effects and
the total is bell-shaped — almost no matter what the pieces look like</i>. Heights (many genes
+ many environmental nudges), measurement errors, sums of dice — all Gaussian. You'll prove it
yourself in the exercise: single die rolls are flat (uniform), but the <b>sum of ten dice</b>
piles up into a bell. Flat pieces, bell total — that's the CLT happening in your own data.</p>

<div class="demystify"><b>Demystify "normal":</b> the name doesn't mean other distributions are
abnormal — it's a historical label (from "the normal law of errors"). And the famous
"68% within one standard deviation" isn't a mystical rule; it's just the area under the bell
between −1σ and +1σ.</div>`,
 docs:[['Seeing Theory — distributions','https://seeing-theory.brown.edu/probability-distributions/index.html']],
 quiz:{title:'Quick check',questions:[
   {q:'For a continuous quantity like height, P(height is EXACTLY 178.000000 cm) is:',
    options:['About 68%','Zero — probabilities live in ranges, as areas under the PDF','One in six','Equal to the density at 178'],answer:1,
    why:'Infinitely many values means any exact one has probability zero. The PDF gives density; area over a range gives probability.'},
   {q:'A Gaussian is completely described by:',
    options:['Its minimum and maximum','Its mean (where the peak is) and standard deviation (how wide)','Its first ten samples','Its area, which varies'],answer:1,
    why:'Two numbers pin the whole bell: location and spread. (The area under any PDF is always exactly 1.)'},
   {q:'Why does the sum of ten dice look bell-shaped when a single die is flat?',
    options:['Dice are secretly Gaussian','The central limit theorem: sums of many independent pieces become bell-shaped, near-regardless of the pieces','It is a rendering artifact','Only weighted dice do this'],answer:1,
    why:'That is the CLT — and it is why the Gaussian shows up wherever many small effects add: heights, noise, measurement error.'}
 ]},
 exs:[{title:'Watch the bell emerge: the central limit theorem by hand',
   lang:'python',
   prompt:`Show the CLT with dice (seed fixed):
   <ol>
   <li><code>sums</code> — 20,000 samples, each the <b>sum of 10 dice</b> (each die <code>random.randint(1, 6)</code>),</li>
   <li><code>mean</code> — the average of the sums (should land near <b>35</b> = 10 × 3.5),</li>
   <li><code>middle</code> — the fraction of sums between 30 and 40 inclusive (the fat middle of the bell — should exceed 0.6),</li>
   <li><code>extreme</code> — the fraction of sums ≤ 14 or ≥ 56 (the thin tails — should be below 0.001; a flat distribution would put far more out there).</li>
   </ol>
   Middle fat, tails thin — a bell, built from flat pieces.`,
   starter:`import random
random.seed(7)

# 1) 20,000 sums of 10 dice each
sums =

# 2) Their average — near 10 * 3.5 = 35
mean =

# 3) Fraction between 30 and 40 inclusive — the fat middle
middle =

# 4) Fraction <= 14 or >= 56 — the starved tails
extreme =

print(mean, middle, extreme)
`,
   solution:`import random
random.seed(7)

# 1) 20,000 sums of 10 dice each
sums = [sum(random.randint(1, 6) for _ in range(10)) for _ in range(20_000)]

# 2) Their average — near 10 * 3.5 = 35
mean = sum(sums) / len(sums)

# 3) Fraction between 30 and 40 inclusive — the fat middle
middle = sum(1 for s in sums if 30 <= s <= 40) / len(sums)

# 4) Fraction <= 14 or >= 56 — the starved tails
extreme = sum(1 for s in sums if s <= 14 or s >= 56) / len(sums)

print(mean, middle, extreme)
`,
   tests:[
     {d:'20,000 sums, each between 10 and 60',expr:'len(sums) == 20000 and min(sums) >= 10 and max(sums) <= 60'},
     {d:'mean lands near 35',expr:'abs(mean - 35) < 0.5'},
     {d:'the middle (30–40) holds most of the probability',expr:'middle > 0.6'},
     {d:'the tails are nearly empty — the bell, not a flat line',expr:'extreme < 0.001'}
   ],
   hints:[
     'One sample is sum(random.randint(1, 6) for _ in range(10)); wrap that in a comprehension for 20,000 samples.',
     'middle: count sums s with 30 <= s <= 40, divide by len(sums).',
     'extreme: count s <= 14 or s >= 56. If the pieces were NOT summed (one die), these bins would hold plenty — summing is what starves the tails and fattens the middle.'
   ]}]},

{id:'pr4',
 title:'Fundamentals: conditional probability & independence — when knowledge changes the odds',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p><b>Conditional probability</b> answers: <i>"given what I now know, what are the odds?"</i>
P(rain | wet street) — the chance of rain <i>given</i> the street is wet — is very different
from P(rain) alone. Written <code>P(A | B)</code>, said "probability of A given B." Every
spam filter, medical test, and recommender is computing conditionals: P(spam | contains
"free money"), P(disease | positive test), P(you like this movie | you liked those).</p></div>

<h3>Computing it: just narrow the world</h3>
<p>P(A | B) = look ONLY at the cases where B happened, and ask what fraction of those also
have A. As a formula: <code>P(A|B) = P(A and B) / P(B)</code> — but the "narrow the world,
then count" reading is the one to keep. In a simulation it is literally a filter followed by
a fraction — which is exactly what you will run.</p>

<h3>Independence: when knowledge changes nothing</h3>
<p>A and B are <b>independent</b> when knowing B tells you nothing about A:
<code>P(A | B) = P(A)</code>, equivalently <code>P(A and B) = P(A)·P(B)</code>. Two dice are
independent — the first die does not care what the second shows. But the first die and
<i>the sum</i> are NOT independent: learn the first is a 3 and the odds of "sum = 8" move
from 5/36 to 1/6. Same world, new knowledge, new odds — that movement is the whole subject.</p>

<div class="demystify"><b>Demystify the "|":</b> the vertical bar is not division — it reads
"given." P(A|B) is a different <i>question</i> than P(A), asked in a world narrowed to B.
Mixing up P(A|B) with P(B|A) is the most consequential confusion in applied probability
(a test\u0027s accuracy P(+|sick) is NOT your risk P(sick|+) — next lesson turns exactly
this into the famous 9%).</div>

<div class="hardidea">🧠 <b>Why ML cares so much:</b> assuming independence when it is false is
one of the great silent model-killers (two correlated features double-counted as if they were
separate evidence). And the one assumption that makes Naive Bayes "naive" is — precisely —
conditional independence of features. You are one lesson away from seeing it exploited.</div>`,
 docs:[['Seeing Theory — conditional probability','https://seeing-theory.brown.edu/compound-probability/index.html']],
 quiz:{title:'Quick check',questions:[
   {q:'P(A | B) means:',
    options:['P(A) divided by P(B)','The probability of A in a world narrowed to the cases where B happened','The probability of both A and B','P(B) given A'],answer:1,
    why:'The bar reads "given": filter to B\u0027s cases, then ask how often A holds there.'},
   {q:'Two events are independent exactly when:',
    options:['They cannot both happen','Knowing one changes nothing about the other: P(A|B) = P(A), i.e. P(A and B) = P(A)·P(B)','They have the same probability','They involve dice'],answer:1,
    why:'Independence = knowledge of B is worthless for predicting A. The product rule is the same statement in multiplication form.'},
   {q:'A test is 99% accurate: P(positive | sick) = 0.99. Is that the same as P(sick | positive)?',
    options:['Yes, always','No — the two conditionals ask different questions and can differ wildly (rare disease: 99% vs ~9%)','Yes, if the test is expensive','Only for blood tests'],answer:1,
    why:'Reversing a conditional is the base-rate trap. Bayes\u0027 theorem (next lesson) is the correct way to flip the bar.'}
 ]},
 exs:[{title:'Watch knowledge move the odds — two dice, simulated',
   lang:'python',
   prompt:`Simulate <code>100_000</code> rolls of TWO dice (seed fixed). Compute:
   <ol>
   <li><code>p_sum8</code> — P(sum = 8) (expect ≈ 5/36 ≈ 0.139),</li>
   <li><code>p_sum8_given_first3</code> — P(sum = 8 | first die = 3): filter to first-die-3 rolls, then the fraction with sum 8 (expect ≈ 1/6 ≈ 0.167 — knowledge moved the odds!),</li>
   <li><code>p_first_even</code>, <code>p_both_even</code> — P(first even) and P(both even),</li>
   <li><code>indep_gap</code> — <code>abs(p_both_even − p_first_even * 0.5)</code> — near 0, because the dice ARE independent (product rule holds).</li>
   </ol>`,
   starter:`import random
random.seed(11)

rolls = [(random.randint(1, 6), random.randint(1, 6)) for _ in range(100_000)]

# 1) P(sum = 8) across all rolls
p_sum8 =

# 2) P(sum = 8 GIVEN first = 3): narrow the world, then count
first3 = [r for r in rolls if r[0] == 3]
p_sum8_given_first3 =

# 3) P(first even) and P(both even)
p_first_even =
p_both_even =

# 4) Independence check: both-even should equal first-even * 1/2
indep_gap =

print(p_sum8, p_sum8_given_first3, indep_gap)
`,
   solution:`import random
random.seed(11)

rolls = [(random.randint(1, 6), random.randint(1, 6)) for _ in range(100_000)]

# 1) P(sum = 8) across all rolls
p_sum8 = sum(1 for a, b in rolls if a + b == 8) / len(rolls)

# 2) P(sum = 8 GIVEN first = 3): narrow the world, then count
first3 = [r for r in rolls if r[0] == 3]
p_sum8_given_first3 = sum(1 for a, b in first3 if a + b == 8) / len(first3)

# 3) P(first even) and P(both even)
p_first_even = sum(1 for a, b in rolls if a % 2 == 0) / len(rolls)
p_both_even = sum(1 for a, b in rolls if a % 2 == 0 and b % 2 == 0) / len(rolls)

# 4) Independence check: both-even should equal first-even * 1/2
indep_gap = abs(p_both_even - p_first_even * 0.5)

print(p_sum8, p_sum8_given_first3, indep_gap)
`,
   tests:[
     {d:'P(sum=8) ≈ 5/36',expr:'abs(p_sum8 - 5/36) < 0.01'},
     {d:'P(sum=8 | first=3) ≈ 1/6 — conditioning MOVED the odds',expr:'abs(p_sum8_given_first3 - 1/6) < 0.02'},
     {d:'the two probabilities really differ (dependence detected)',expr:'p_sum8_given_first3 - p_sum8 > 0.01'},
     {d:'P(both even) ≈ P(first even) × 1/2 — the dice are independent',expr:'indep_gap < 0.01'}
   ],
   hints:[
     'p_sum8: count rolls where a + b == 8, divide by all 100,000.',
     'The conditional is the SAME computation inside the narrowed list first3 — filter, then fraction. That filter IS the "given".',
     'For independence: p_both_even should sit within noise of p_first_even * 0.5 — the product rule, observed in your own data.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> A standard deck has 52 cards, 4 of them kings. You draw one card. What is <code>P(king)</code>? Now you are told the card is a "face card" (J, Q, K — 12 of them). What is <code>P(king | face card)</code>?`,
    solution:`<code>P(king) = 4/52 = 1/13 ≈ 0.077</code>.<br>
    Given it is a face card, <b>narrow the world</b> to the 12 face cards; 4 of those are kings:<br>
    <code>P(king | face card) = 4/12 = 1/3 ≈ 0.333</code>.<br>
    Knowing "face card" more than quadrupled the probability — that is conditioning: information shrinks the sample space and changes the odds.`},
   {q:`<b>2. (Multiplication rule)</b> You draw two cards without replacing the first. Using <code>P(A and B) = P(A) · P(B | A)</code>, find the probability both are kings.`,
    solution:`<code>P(first king) = 4/52</code>. After removing a king, 3 kings remain in 51 cards, so <code>P(second king | first king) = 3/51</code>.<br>
    <code>P(both kings) = (4/52) · (3/51) = 12/2652 = 1/221 ≈ 0.0045</code>.<br>
    This multiplication rule — join two events by conditioning the second on the first — is exactly Step 2 in the derivation of Bayes' rule.`},
   {q:`<b>3. (Independence check)</b> Are "the first card is a king" and "the second card is a king" (drawn without replacement) independent? Show it with numbers.`,
    solution:`Independent would require <code>P(second king | first king) = P(second king)</code>.<br>
    But <code>P(second king | first king) = 3/51 ≈ 0.0588</code>, while <code>P(second king)</code> with no information is <code>4/52 ≈ 0.0769</code>. They differ, so the events are <b>dependent</b> — the first draw changes the deck. (With <i>replacement</i>, they would be independent, both 4/52.)`}
 ]}},

{id:'pr3',
 title:'Advanced: Bayesian probability — the 99% accurate test that is usually wrong',
 body:`
<div class="ground"><span class="gTag">🎯 What it does — and why it breaks intuition</span>
<p>Now the fundamentals pay off. <b>Bayes' theorem</b> is the rule for <b>updating a belief
when evidence arrives</b>. The famous shocker: a disease affects 1 person in 1,000. The test
is 99% accurate. You test positive. What's the chance you're sick? Most people — including
most doctors in published studies — say ~99%. The real answer is about <b>9%</b>. Let's see
why with nothing but counting.</p></div>

<h3>Count 100,000 people</h3>
<p>Out of 100,000: about <b>100 are sick</b> (1 in 1,000) — the test catches 99 of them.
About <b>99,900 are healthy</b> — but 1% of them, <b>999 people</b>, get a false positive.
So the positive pile holds 99 + 999 = 1,098 people, of whom only 99 are sick:
99/1,098 ≈ <b>9%</b>. The intuition-breaker has a name — the <b>base-rate fallacy</b>:
the rarity of the disease (the <i>base rate</i>) overwhelms the accuracy of the test.
Because the disease is rare, false positives from the huge healthy crowd swamp the true ones.</p>

<h3>Bayes' rule itself — where it comes from</h3>
<p>The counting works, but we want the <b>formula</b>, and — crucially — to see it is not
handed down from nowhere. It falls out of the conditional probability you already learned in
two short steps.</p>
<p><b>Step 1 — conditional probability (from the earlier lesson):</b> the chance of A given B is
the joint over the condition:</p>
<div class="mathblock">P(A | B) = P(A and B) / P(B)</div>
<p><b>Step 2 — the joint can be written two ways</b> (the multiplication rule), because "A and
B" is the same event as "B and A":</p>
<div class="mathblock">P(A and B) = P(B | A) · P(A)        (condition on A first)
P(A and B) = P(A | B) · P(B)        (condition on B first)</div>
<p><b>Put them together.</b> Substitute the first form of the joint into Step 1's numerator,
and you have <b>Bayes' rule</b>:</p>
<div class="mathblock"><b>P(A | B)  =  P(B | A) · P(A)  /  P(B)</b>

           posterior  =  likelihood × prior  /  evidence</div>
<p>That is the whole theorem — a rearrangement of conditional probability so you can <b>flip the
condition</b>: it turns "the chance of the evidence given the cause" (which you know — the test's
accuracy) into "the chance of the cause given the evidence" (what you actually want — your risk).
Reversing that arrow without Bayes is the base-rate fallacy.</p>

<h3>Walking it through, term by term</h3>
<p>Let <code>A = sick</code> and <code>B = tested positive (+)</code>. Bayes says
<code>P(sick | +) = P(+ | sick) · P(sick) / P(+)</code>. Fill each slot:</p>
<div class="mathblock">P(sick)      = 0.001        the PRIOR — 1 in 1,000 before any test
P(+ | sick)  = 0.99         the LIKELIHOOD — the test catches the sick
P(+)         = ?            the EVIDENCE — chance of a positive, for ANYONE</div>
<p>The one non-obvious term is <code>P(+)</code>, the total chance of a positive result. It has
two sources — true positives and false positives — added up (the <b>law of total
probability</b>):</p>
<div class="mathblock">P(+) = P(+|sick)·P(sick) + P(+|healthy)·P(healthy)
     = (0.99)(0.001)   +   (0.01)(0.999)
     = 0.00099         +   0.00999          =  0.01098</div>
<p>Now plug everything in:</p>
<div class="mathblock">P(sick | +) = (0.99 × 0.001) / 0.01098 = 0.00099 / 0.01098 ≈ <b>0.090</b>  (about 9%)</div>
<p>Exactly the counting answer — <code>99 / 1,098</code> — because the formula <i>is</i> the
counting, done with proportions instead of a census. Notice the denominator <code>0.01098</code>
is dominated by the <code>0.00999</code> false-positive term: that is the rare base rate letting
the huge healthy crowd swamp the signal, now visible right in the algebra.</p>

<h3>The vocabulary, demystified</h3>
<p><b>Prior</b> = your belief <i>before</i> the evidence (1/1,000 — also called
<i>a priori</i>). <b>Likelihood</b> = how well each hypothesis explains the evidence
(sick explains a positive at 99%; healthy at 1%). <b>Posterior</b> = the updated belief
<i>after</i> the evidence (~9% — <i>a posteriori</i>). <b>Evidence</b> = the total chance of
what you saw, <code>P(+)</code>, which normalizes the result to a real probability. So Bayes
reads: <i>posterior = likelihood × prior ÷ evidence.</i></p>

<div class="demystify"><b>Demystify:</b> "Bayesian inference" sounds like a philosophy degree.
It's the counting exercise above, done with algebra instead of a census. Prior in, evidence
weighed, posterior out. When ML papers say "we place a prior on the weights," they mean
exactly this machinery — and (from the glossary) MAP estimation = MLE + prior is where
regularization secretly comes from.</div>

<div class="hardidea">🧠 <b>Hard idea, made simple:</b> the posterior depends on BOTH the
test's accuracy AND how common the condition is. A great test for a rare thing still yields
mostly false alarms. This is why screening programs for rare diseases follow a positive with a
<i>second</i>, different test — the first positive raises your prior from 0.1% to 9%, and from
there the same evidence pushes the posterior to ~91%. Updating is iterative: today's posterior
is tomorrow's prior.</div>`,
 docs:[['3Blue1Brown — Bayes theorem','https://www.3blue1brown.com/lessons/bayes-theorem'],['Seeing Theory — Bayesian inference','https://seeing-theory.brown.edu/bayesian-inference/index.html']],
 quiz:{title:'Quick check',questions:[
   {q:'Disease: 1 in 1,000. Test: 99% accurate. You test positive once. Your chance of being sick is closest to:',
    options:['99%','9%','50%','1%'],answer:1,
    why:'Count it: ~99 true positives vs ~999 false positives — the rare base rate lets the healthy crowd swamp the signal. 99/1098 ≈ 9%.'},
   {q:'In Bayes vocabulary, the "prior" is:',
    options:['The test result','Your belief BEFORE seeing the evidence (a priori)','The final answer','The error rate of the test'],answer:1,
    why:'Prior (a priori) = before evidence; posterior (a posteriori) = after. The likelihood is how well each hypothesis explains what you saw.'},
   {q:'Why does a SECOND positive test change the picture so much?',
    options:['The test becomes more accurate','Your prior is now 9% (not 0.1%) — the same evidence now pushes the posterior to ~91%','Two tests are always definitive','It does not change anything'],answer:1,
    why:'Updating is iterative: today\u0027s posterior is tomorrow\u0027s prior. Starting from 9%, the arithmetic that gave 9% now gives ~91%.'}
 ]},
 exs:[{title:'Compute the posterior two ways: count it, then Bayes it',
   lang:'python',
   prompt:`Population 100,000; disease rate 1/1,000; test 99% sensitive (catches sick) and 99%
   specific (1% false-positive rate on healthy):
   <ol>
   <li><code>true_pos</code> — sick people who test positive (99% of the sick),</li>
   <li><code>false_pos</code> — healthy people who test positive (1% of the healthy),</li>
   <li><code>posterior_count</code> — fraction of positives who are actually sick (the ~9%),</li>
   <li><code>posterior_bayes</code> — the same number from the formula <code>(0.99 * 0.001) / (0.99*0.001 + 0.01*0.999)</code>,</li>
   <li><code>second_test</code> — start from prior = <code>posterior_bayes</code> and apply the same update again (the ~91%).</li>
   </ol>
   The two routes to the first answer must agree — that agreement IS Bayes' theorem.`,
   starter:`population = 100_000
sick = population * 0.001        # 100 people
healthy = population - sick      # 99,900 people

# 1) 99% of the sick test positive
true_pos =

# 2) 1% of the healthy test positive
false_pos =

# 3) Of everyone who tested positive, what fraction is sick?
posterior_count =

# 4) Same thing by the formula: P(+|sick)P(sick) / P(+)
posterior_bayes = (0.99 * 0.001) / (0.99 * 0.001 + 0.01 * 0.999)

# 5) A second positive test: reuse the update with prior = posterior_bayes
p = posterior_bayes
second_test =

print(posterior_count, posterior_bayes, second_test)
`,
   solution:`population = 100_000
sick = population * 0.001        # 100 people
healthy = population - sick      # 99,900 people

# 1) 99% of the sick test positive
true_pos = sick * 0.99

# 2) 1% of the healthy test positive
false_pos = healthy * 0.01

# 3) Of everyone who tested positive, what fraction is sick?
posterior_count = true_pos / (true_pos + false_pos)

# 4) Same thing by the formula: P(+|sick)P(sick) / P(+)
posterior_bayes = (0.99 * 0.001) / (0.99 * 0.001 + 0.01 * 0.999)

# 5) A second positive test: reuse the update with prior = posterior_bayes
p = posterior_bayes
second_test = (0.99 * p) / (0.99 * p + 0.01 * (1 - p))

print(posterior_count, posterior_bayes, second_test)
`,
   tests:[
     {d:'true positives ≈ 99 people',expr:'abs(true_pos - 99) < 0.5'},
     {d:'false positives ≈ 999 people',expr:'abs(false_pos - 999) < 0.5'},
     {d:'counting gives ≈ 9% — not 99%',expr:'abs(posterior_count - 0.0902) < 0.005'},
     {d:'the Bayes formula agrees with the counting (that agreement IS the theorem)',expr:'abs(posterior_count - posterior_bayes) < 1e-6'},
     {d:'a second positive pushes the posterior to ≈ 91%',expr:'abs(second_test - 0.9075) < 0.01'}
   ],
   hints:[
     'true_pos = sick * 0.99 (99 people); false_pos = healthy * 0.01 (999 people). Feel how the healthy crowd dominates.',
     'posterior_count = true_pos / (true_pos + false_pos) — sick positives over ALL positives.',
     'For the second test, the same shape with the new prior p: (0.99 * p) / (0.99 * p + 0.01 * (1 - p)). Yesterday\u0027s posterior is today\u0027s prior.'
   ]}],
 homework:{intro:'Work the algebra of Bayes by hand on fresh numbers, then check with the Playground. Write the formula, fill each slot, compute the denominator with total probability, divide.',problems:[
   {q:`<b>1.</b> Write Bayes' rule for <code>P(A | B)</code>, and label which part is the prior, the likelihood, and the evidence.`,
    solution:`<code>P(A | B) = P(B | A) · P(A) / P(B)</code>.<br>
    • <b>P(A)</b> = the <b>prior</b> (belief in A before the evidence).<br>
    • <b>P(B | A)</b> = the <b>likelihood</b> (how probable the evidence is if A is true).<br>
    • <b>P(B)</b> = the <b>evidence</b> (total probability of B, over all cases), which normalizes the answer.<br>
    In words: posterior = likelihood × prior ÷ evidence.`},
   {q:`<b>2.</b> A spam filter: 40% of email is spam. The word "free" appears in 80% of spam but only 5% of real email. An email contains "free". Use Bayes to find <code>P(spam | "free")</code>. Show the denominator via total probability.`,
    solution:`Let A = spam, B = contains "free". Knowns: <code>P(spam)=0.4</code>, <code>P("free"|spam)=0.8</code>, <code>P("free"|real)=0.05</code>, <code>P(real)=0.6</code>.<br>
    <b>Evidence (total probability of "free"):</b><br>
    <code>P("free") = (0.8)(0.4) + (0.05)(0.6) = 0.32 + 0.03 = 0.35</code>.<br>
    <b>Bayes:</b> <code>P(spam | "free") = (0.8 × 0.4) / 0.35 = 0.32 / 0.35 ≈ <b>0.914</b></code> — about 91% likely spam. The strong likelihood (0.8 vs 0.05) plus a fairly high prior (0.4) pushes it well above the prior.`},
   {q:`<b>3. (Base rate)</b> Redo problem 2, but now only 5% of email is spam (a well-filtered inbox), everything else the same. What is <code>P(spam | "free")</code> now, and what does the change teach you?`,
    solution:`Now <code>P(spam)=0.05</code>, <code>P(real)=0.95</code>.<br>
    <code>P("free") = (0.8)(0.05) + (0.05)(0.95) = 0.04 + 0.0475 = 0.0875</code>.<br>
    <code>P(spam | "free") = (0.8 × 0.05) / 0.0875 = 0.04 / 0.0875 ≈ <b>0.457</b></code> — only ~46%, now <i>below</i> 50%, even though the word is just as spammy!<br>
    <b>Lesson:</b> the same evidence yields a very different posterior when the <b>prior (base rate)</b> changes. Rare spam means most "free" emails are actually real — the base-rate effect, exactly as in the disease example.`}
 ]}},

{id:'pr5',
 title:'Advanced: maximum likelihood — how "fitting a model" actually works',
 body:`
<div class="ground"><span class="gTag">🎯 What it does — the bridge from probability to ML</span>
<p>Here is the secret that ties this whole stream to everything after it: <b>training a model
is usually maximum likelihood estimation in disguise</b>. The principle (<b>MLE</b>): among
all candidate explanations, <i>pick the one that makes the data you actually saw least
surprising</i>. Least-squares regression? MLE under Gaussian noise. Cross-entropy for
classifiers? MLE for categorical outcomes. When you later call <code>.fit()</code>, this
lesson is what the machine is doing.</p></div>

<h3>The smallest possible example: a suspicious coin</h3>
<p>You flip a coin 10 times and see <b>7 heads</b>. What is your best estimate of its
heads-probability <code>p</code>? MLE says: score every candidate <code>p</code> by the
probability it assigns to your exact data — the <b>likelihood</b>
<code>L(p) = p⁷ · (1−p)³</code> — and take the best-scoring one. The winner is exactly
<b>0.7</b>, the observed fraction. Intuitive result, principled route — and the route is what
generalizes to a billion-parameter model when the fraction shortcut does not exist.</p>

<h3>Two working details you will see everywhere</h3>
<p><b>Log-likelihood:</b> multiplying 10,000 small probabilities underflows to zero, so
everyone maximizes the <i>log</i> of the likelihood instead (same winner — log is
order-preserving — but sums instead of products). This is exactly the payoff you built in the
Logarithms stream: product-to-sum, monotonic, differentiable. When ML code minimizes "negative
log likelihood," now you can read it: <i>maximize the data\u0027s probability, in log form,
flipped to a minimization</i>. <b>And the calculus connection:</b> "maximize" means "climb
the likelihood surface" — the gradient ascent twin of the descent you already implemented.</p>

<div class="demystify"><b>Demystify "MLE vs MAP":</b> MLE listens only to the data. <b>MAP</b>
(maximum a posteriori) adds your prior: maximize likelihood × prior — Bayes\u0027 rule from
last lesson, used as a fitting principle. Seen 7 heads in 10 but strongly believe coins are
fair? MAP lands between 0.7 and 0.5. And the punchline you will meet again: <b>regularization
in ML is exactly a prior in disguise</b> — L2 penalty = Gaussian prior on the weights. The
probability stream and the ML track are the same subject wearing two outfits.</div>`,
 docs:[['StatQuest — maximum likelihood','https://www.youtube.com/watch?v=XepXtl9YKwc'],['Seeing Theory — likelihood','https://seeing-theory.brown.edu/bayesian-inference/index.html']],
 quiz:{title:'Quick check',questions:[
   {q:'Maximum likelihood estimation picks the parameter value that:',
    options:['Is closest to 0.5','Makes the observed data least surprising — assigns it the highest probability','Minimizes the parameter itself','The prior prefers'],answer:1,
    why:'Score candidates by the probability they give YOUR data; take the argmax. Training a model is this, at scale.'},
   {q:'Why do practitioners maximize LOG-likelihood instead of likelihood?',
    options:['Logs are more accurate mathematically','Products of thousands of small probabilities underflow; logs turn them into stable sums with the same maximizer','It changes the answer to a better one','Tradition from physics'],answer:1,
    why:'log is order-preserving: same winner, numerically sane. "Negative log likelihood" in ML code is exactly this, flipped to minimize.'},
   {q:'MAP differs from MLE by:',
    options:['Using a different dataset','Multiplying in a prior — beliefs before data — making regularization a prior in disguise','Ignoring the likelihood','Only working for coins'],answer:1,
    why:'MAP = argmax likelihood × prior. L2 regularization = Gaussian prior on weights: the Bayes lesson and the ML track, connected.'}
 ]},
 exs:[{title:'Fit your first model by maximum likelihood',
   lang:'python',
   prompt:`Observed flips (1 = heads): <code>data = [1,1,0,1,1,1,0,1,0,1]</code> — 7 heads, 3 tails.
   <ol>
   <li><code>mle</code> — the closed-form MLE: the observed heads fraction (0.7),</li>
   <li><code>best_p</code> — confirm it by brute force: over candidates <code>p = 0.01, 0.02, …, 0.99</code>, compute the likelihood <code>p**heads * (1-p)**tails</code> and keep the argmax (expect 0.70),</li>
   <li><code>ll_07, ll_05</code> — the LOG-likelihood (<code>math.log</code>) at p = 0.7 and p = 0.5: the data must score better under 0.7,</li>
   </ol>
   The agreement of (1) and (2) is the point: the formula and the principle are the same thing.`,
   starter:`import math

data = [1, 1, 0, 1, 1, 1, 0, 1, 0, 1]
heads = sum(data)
tails = len(data) - heads

# 1) The closed-form MLE: observed fraction
mle =

# 2) Brute-force the likelihood over p = 0.01 .. 0.99
best_p = 0.0
best_L = -1.0
for i in range(1, 100):
    p = i / 100
    L =                      # p^heads * (1-p)^tails
    if L > best_L:
        best_L, best_p = L, p

# 3) Log-likelihoods at 0.7 and 0.5
ll_07 =
ll_05 =

print(mle, best_p, ll_07 > ll_05)
`,
   solution:`import math

data = [1, 1, 0, 1, 1, 1, 0, 1, 0, 1]
heads = sum(data)
tails = len(data) - heads

# 1) The closed-form MLE: observed fraction
mle = heads / len(data)

# 2) Brute-force the likelihood over p = 0.01 .. 0.99
best_p = 0.0
best_L = -1.0
for i in range(1, 100):
    p = i / 100
    L = p**heads * (1 - p)**tails
    if L > best_L:
        best_L, best_p = L, p

# 3) Log-likelihoods at 0.7 and 0.5
ll_07 = heads * math.log(0.7) + tails * math.log(0.3)
ll_05 = heads * math.log(0.5) + tails * math.log(0.5)

print(mle, best_p, ll_07 > ll_05)
`,
   tests:[
     {d:'7 heads observed',expr:'heads == 7'},
     {d:'closed-form MLE is 0.7 — the observed fraction',expr:'abs(mle - 0.7) < 1e-9'},
     {d:'brute-force search agrees: best p is 0.70',expr:'abs(best_p - 0.7) < 0.011'},
     {d:'the data scores better under p=0.7 than p=0.5 (log-likelihood)',expr:'ll_07 > ll_05'}
   ],
   hints:[
     'mle = heads / len(data) — for a coin, the observed fraction IS the maximum-likelihood answer.',
     'L = p**heads * (1 - p)**tails — the probability of exactly your sequence under candidate p.',
     'Log form: heads*log(p) + tails*log(1-p). Products become sums; the winner does not move.'
   ]}]}
]});
