STREAMS.push({icon:'📈',track:'Foundations Track',title:'Logarithms & Exponentials',blurb:'The one piece of school math ML leans on hardest — log-likelihood, log-loss, entropy, log scales. Taught for real, and why we even use it.',requires:'ca4',requiresName:'Calculus & Gradients',lessons:[
{id:'log0',
 title:'Fundamentals: exponents & powers — the ground logs are built on',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>A logarithm is "an exponent asked backwards," so before logs we need exponents solid. A
<b>power</b> <code>xⁿ</code> means multiply <code>x</code> by itself <code>n</code> times:
<code>2³ = 2·2·2 = 8</code>. Here <code>x</code> is the <b>base</b> and <code>n</code> the
<b>exponent</b>. This lesson locks down the handful of rules that make exponents — and therefore
logs, growth, decay, softmax, and sigmoids — behave predictably.</p></div>

<h3>The rules (each is just counting the multiplications)</h3>
<div class="codeSample">xᵃ · xᵇ = xᵃ⁺ᵇ        multiply → ADD exponents     (2² · 2³ = 2⁵ = 32)
xᵃ / xᵇ = xᵃ⁻ᵇ        divide → SUBTRACT exponents   (2⁵ / 2² = 2³ = 8)
(xᵃ)ᵇ  = xᵃᵇ          power of a power → MULTIPLY    ((2²)³ = 2⁶ = 64)
x⁰ = 1               anything to the 0 is 1
x⁻ⁿ = 1 / xⁿ         negative exponent → reciprocal (2⁻¹ = 0.5)
x^(1/2) = √x         fractional exponent → a root   (9^(1/2) = 3)</div>
<p>Notice the top rule: <b>multiplying powers adds their exponents.</b> Hold onto that — it is
the exact mirror of the log property "log of a product is a sum," and it is <i>why</i> logs
turn multiplication into addition. Exponents and logs are the same staircase, walked in
opposite directions.</p>

<h3>Why ML cares</h3>
<p><b>Exponential growth/decay</b> shows up in learning-rate schedules (decay a rate each step)
and in probabilities that compound. The base <b>e ≈ 2.718</b> (the "natural" base) appears
everywhere: <code>eˣ</code> in <b>softmax</b> (turning scores into probabilities) and
<code>e⁻ˣ</code> in the <b>sigmoid</b>. Get comfortable with powers now and those later formulas
read as arithmetic, not hieroglyphs.</p>

<div class="demystify"><b>Demystify "to the power":</b> for whole numbers it is repeated
multiplication; the rules then <i>extend</i> that idea consistently to zero, negative, and
fractional exponents (so that <code>xᵃ·xᵇ = xᵃ⁺ᵇ</code> keeps working). That is why
<code>x⁰ = 1</code> and <code>x^(1/2) = √x</code> are not arbitrary — they are forced by keeping
one rule true.</div>`,
 docs:[['Exponent rules — a refresher','https://www.mathsisfun.com/algebra/exponent-laws.html']],
 quiz:{title:'Quick check',questions:[
   {q:'2² · 2³ equals:',
    options:['2⁶ = 64','2⁵ = 32 — multiplying powers ADDS the exponents','2⁻¹','4⁵'],answer:1,
    why:'xᵃ·xᵇ = xᵃ⁺ᵇ, so 2²·2³ = 2⁵ = 32. This add-when-you-multiply rule is exactly what logs mirror.'},
   {q:'A negative exponent, like 2⁻¹, means:',
    options:['A negative number','The reciprocal: 1/2¹ = 0.5','Subtraction','An error'],answer:1,
    why:'x⁻ⁿ = 1/xⁿ. Negative exponents flip to the denominator; they are not negative numbers.'},
   {q:'x^(1/2) is another way of writing:',
    options:['x divided by 2','the square root of x','x times 0.5','2ˣ'],answer:1,
    why:'A fractional exponent is a root: x^(1/2) = √x. This falls out of keeping the exponent rules consistent.'}
 ]},
 exs:[{title:'Exponent arithmetic and the rules',
   lang:'python',
   prompt:`Pure Python (<code>**</code> is "to the power"):
   <ol>
   <li><code>cube</code> = <code>2 ** 3</code> (8),</li>
   <li><code>recip</code> = <code>2 ** -1</code> (0.5 — negative exponent),</li>
   <li><code>root</code> = <code>9 ** 0.5</code> (3.0 — fractional exponent = square root),</li>
   <li><code>rule_holds</code> = <code>True</code> if <code>2**2 * 2**3</code> equals <code>2**(2+3)</code> (the add-the-exponents rule).</li>
   </ol>`,
   starter:`# ** is exponentiation in Python
cube =
recip =
root =

# The rule: multiplying powers adds exponents
rule_holds =

print(cube, recip, root, rule_holds)
`,
   solution:`# ** is exponentiation in Python
cube = 2 ** 3
recip = 2 ** -1
root = 9 ** 0.5

# The rule: multiplying powers adds exponents
rule_holds = (2**2 * 2**3) == 2**(2 + 3)

print(cube, recip, root, rule_holds)
`,
   tests:[
     {d:'2 ** 3 = 8',expr:'cube == 8'},
     {d:'2 ** -1 = 0.5 (reciprocal)',expr:'abs(recip - 0.5) < 1e-12'},
     {d:'9 ** 0.5 = 3.0 (square root)',expr:'abs(root - 3.0) < 1e-12'},
     {d:'2²·2³ = 2⁵ — the add-the-exponents rule holds',expr:'rule_holds == True and (2**2 * 2**3) == 32'}
   ],
   hints:[
     'Use ** for powers: 2 ** 3, 2 ** -1, 9 ** 0.5.',
     'A negative exponent gives a fraction (0.5); a 0.5 exponent gives a square root (3.0).',
     'rule_holds compares 2**2 * 2**3 with 2**(2+3) — both are 32, so multiplying added the exponents.'
   ]}]},

{id:'log1',
 title:'Fundamentals: a logarithm is just an exponent (asked backwards)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Logarithms scare people only because no one says the one-sentence version:
<b>a logarithm is an exponent.</b> Exponentiation asks "what is 10 to the power 3?" (answer:
1000). A logarithm asks the <i>same question backwards</i>: "10 to <b>what power</b> gives
1000?" (answer: 3). So <code>log10(1000) = 3</code>. That is the whole definition —
<code>log_b(x)</code> is <b>the power you raise b to, to get x</b>. If you can read
<code>2³ = 8</code>, you can read <code>log2(8) = 3</code>; they are the same fact, viewed
from two ends.</p></div>

<h3>The three bases you will meet</h3>
<p><b>log10</b> — "how many orders of magnitude?" (1, 10, 100, 1000 → 0, 1, 2, 3).
<b>log2</b> — "how many doublings?" (the language of bits and halving).
<b>ln</b> — the <i>natural log</i>, base <code>e ≈ 2.718</code>. This is the one ML uses almost
everywhere; in Python, plain <code>math.log(x)</code> means <b>ln</b>. Different bases just
rescale each other by a constant, so the <i>shape</i> of every log is the same.</p>

<h3>The magic property — the reason logs matter at all</h3>
<div class="codeSample">log(a * b) = log(a) + log(b)      # multiplication BECOMES addition
log(a ** n) = n * log(a)          # powers BECOME multiplication</div>
<p>This is the property everything downstream rests on: <b>a logarithm turns multiplication
into addition.</b> It is why slide rules worked, and — as the next lesson shows — it is
exactly why ML replaces "multiply a thousand probabilities" (which breaks computers) with
"add a thousand logs" (which does not).</p>

<h3>Logs compress huge ranges</h3>
<p>The values 1, 10, 100, 1000, 1,000,000 are wildly far apart — but their logs are
0, 1, 2, 3, 6: evenly spaced. That is what a "log scale" on a chart does, and why earthquakes
(Richter), sound (decibels), and acidity (pH) are all measured in logs — they span too many
orders of magnitude for a linear scale to show.</p>

<div class="demystify"><b>Demystify the notation:</b> <code>log</code> and its inverse
<code>exp</code> (raising e to a power) undo each other, exactly like square and square-root:
<code>exp(log(x)) = x</code> and <code>log(exp(x)) = x</code>. Whenever a log makes a number
unrecognizably small or large, <code>exp</code> is the way back.</p></div>

<div class="notebox"><b>📐 Notation decoder — logs & exponentials</b>:
<table>
<tr><td>logₐ(x)</td><td>"log base b of x" — the power you raise b to, to get x</td></tr>
<tr><td>ln(x)</td><td>the <b>natural log</b> — base e; in Python this is <code>math.log(x)</code></td></tr>
<tr><td>log(x)</td><td>in ML, "log" almost always means <b>ln</b> (natural log)</td></tr>
<tr><td>e</td><td>Euler's number ≈ <b>2.718</b> — the natural base</td></tr>
<tr><td>eˣ, exp(x)</td><td>the <b>exponential</b> — e raised to the power x; the inverse of ln</td></tr>
<tr><td>bˣ</td><td>b raised to the power x (any base)</td></tr>
</table></div>`,
 docs:[['Logarithms — a visual intro (Better Explained)','https://betterexplained.com/articles/using-logs-in-the-real-world/']],
 quiz:{title:'Quick check',questions:[
   {q:'log10(1000) equals 3 because:',
    options:['1000 divided by 3','3 is the power you raise 10 to, to get 1000 (10 cubed = 1000)','1000 minus 997','It is a coincidence'],answer:1,
    why:'A logarithm IS an exponent asked backwards: log_b(x) = the power of b that produces x. 10^3 = 1000, so log10(1000) = 3.'},
   {q:'The property log(a * b) = log(a) + log(b) means:',
    options:['Logs are additive by luck','A logarithm converts multiplication into addition — the single most useful thing about logs','Logs only work on whole numbers','a and b must be equal'],answer:1,
    why:'Turning products into sums is the core superpower — the basis of slide rules and of log-likelihood in ML.'},
   {q:'In Python, math.log(x) (no base given) computes:',
    options:['log base 10','The natural log, ln — base e ≈ 2.718, the base ML uses everywhere','log base 2','The number of digits'],answer:1,
    why:'Plain math.log is ln. math.log10 and math.log2 exist for the other bases; ML almost always means ln.'}
 ]},
 exs:[{title:'Logs are exponents — prove the properties',
   lang:'python',
   prompt:`Use the <code>math</code> module (recall imports!):
   <ol>
   <li><code>l1000</code> — <code>log10(1000)</code> (should be 3.0),</li>
   <li><code>l8</code> — <code>log2(8)</code> (should be 3.0),</li>
   <li><code>prod, summed</code> — <code>ln(6)</code> and <code>ln(2) + ln(3)</code>; they must be equal (multiplication became addition),</li>
   <li><code>roundtrip</code> — <code>exp(log(5))</code>, proving log and exp undo each other (should be 5.0).</li>
   </ol>`,
   starter:`import math

# 1) log base 10 of 1000
l1000 =

# 2) log base 2 of 8
l8 =

# 3) The magic property: ln(6) vs ln(2) + ln(3)
prod = math.log(6)
summed =

# 4) exp undoes log
roundtrip =

print(l1000, l8, prod, summed, roundtrip)
`,
   solution:`import math

# 1) log base 10 of 1000
l1000 = math.log10(1000)

# 2) log base 2 of 8
l8 = math.log2(8)

# 3) The magic property: ln(6) vs ln(2) + ln(3)
prod = math.log(6)
summed = math.log(2) + math.log(3)

# 4) exp undoes log
roundtrip = math.exp(math.log(5))

print(l1000, l8, prod, summed, roundtrip)
`,
   tests:[
     {d:'log10(1000) is 3.0',expr:'abs(l1000 - 3.0) < 1e-9'},
     {d:'log2(8) is 3.0',expr:'abs(l8 - 3.0) < 1e-9'},
     {d:'ln(6) equals ln(2) + ln(3) — multiplication became addition',expr:'abs(prod - summed) < 1e-9'},
     {d:'exp(log(5)) returns 5.0 — the two are inverses',expr:'abs(roundtrip - 5.0) < 1e-9'}
   ],
   hints:[
     'math.log10(1000) and math.log2(8) — both are 3, seen from base 10 and base 2.',
     'summed = math.log(2) + math.log(3). Because 2 * 3 = 6, this equals math.log(6) — the product-to-sum property.',
     'roundtrip = math.exp(math.log(5)) — exp is raising e to a power, the inverse of the natural log.'
   ]}]},

{id:'log2',
 title:'Advanced: why ML uses logs everywhere (log-likelihood, log-loss, surprise)',
 body:`
<div class="ground"><span class="gTag">🎯 The four reasons — grounded before the probability stream needs them</span>
<p>ML is soaked in logs: <b>log-likelihood</b>, <b>log-loss</b> (cross-entropy), log-odds,
entropy. It is not decoration — there are four concrete reasons, and once you see them you
will never be surprised by a log again.</p></div>

<h3>Reason 1 — products of probabilities destroy computers; sums of logs survive</h3>
<p>The probability of many independent things is a product: multiply all their individual
probabilities. But probabilities are below 1, and multiplying hundreds of them drives the
result toward zero until the computer literally rounds it to <b>0.0</b> — "numerical
underflow," and now every answer is 0, useless. The fix is the log property from last lesson:
<code>log(p1 · p2 · … · pn) = log(p1) + log(p2) + … + log(pn)</code>. The product that
underflowed to 0 becomes a <b>sum</b> — a normal, finite negative number. This is the entire
reason models maximize <b>log</b>-likelihood instead of likelihood (the MLE lesson, next
stream — now you know why it takes the log).</p>

<h3>Reason 2 — logs do not move the answer (monotonic)</h3>
<p>A log is <b>order-preserving</b>: if <code>a > b</code> then <code>log(a) > log(b)</code>,
always. So the setting that <i>maximizes</i> the likelihood is the exact same setting that
maximizes the log-likelihood. You gain numerical safety and lose <b>nothing</b> — the winner
does not change. That is why taking logs is always "allowed."</p>

<h3>Reason 3 — logs make the calculus easy</h3>
<p>The derivative of a giant product is a nightmare; the derivative of a <i>sum</i> is trivial
(differentiate each term). Since training means taking derivatives (gradient descent!),
turning the product into a sum of logs is what makes the gradient computable at all.</p>

<h3>Reason 4 — log is the natural measure of "surprise"</h3>
<p>How surprising is an event of probability <code>p</code>? Define surprise as
<code>log(1/p) = −log(p)</code>. A certain event (<code>p = 1</code>) has zero surprise; a
one-in-a-million event has a lot. This is not arbitrary — it is the only measure where the
surprise of two independent events <i>adds up</i> (there is that product-to-sum property
again). Averaged over outcomes, surprise is <b>entropy</b>; measured against a model's guesses,
it is <b>cross-entropy</b> — the standard classification loss you will meet as "log-loss." So
logs are not just a numerical trick; they are the language information itself is written in.</p>

<div class="hardidea">🧠 <b>The one picture to keep:</b> <i>likelihood multiplies, log-likelihood
adds.</i> Everywhere ML would multiply many probabilities — training a classifier, fitting a
distribution, scoring a language model — it takes logs and adds instead: stable, order-preserving,
differentiable, and information-meaningful, all at once. That is why the log is everywhere.</div>`,
 docs:[['Log-likelihood and why we use it (StatQuest)','https://www.youtube.com/watch?v=Dn6b9fCIUpM']],
 quiz:{title:'Quick check',questions:[
   {q:'Why does ML maximize the LOG-likelihood instead of the likelihood itself?',
    options:['Logs give a bigger number','Multiplying many probabilities underflows to 0.0; taking logs turns the product into a stable SUM (and, being monotonic, does not change the answer)','It is required by law','Likelihood cannot be computed'],answer:1,
    why:'Numerical stability via product-to-sum, at no cost because log is order-preserving. The single most common reason logs appear in ML.'},
   {q:'Taking the log before maximizing is safe because a logarithm is:',
    options:['Always positive','Monotonic (order-preserving): the value that maximizes f also maximizes log(f)','Faster to compute','Linear'],answer:1,
    why:'If a > b then log(a) > log(b). So the argmax is unchanged — you gain stability and lose nothing.'},
   {q:'Defining the "surprise" of an event as log(1/p) leads directly to:',
    options:['The determinant','Entropy and cross-entropy (log-loss) — the information measures behind classification loss','The mean','Matrix rank'],answer:1,
    why:'Average surprise is entropy; surprise measured against a model is cross-entropy. Logs are the native language of information.'}
 ]},
 exs:[{title:'Watch a product underflow — and logs save it',
   lang:'python',
   prompt:`Make the numerical problem happen, then fix it:
   <ol>
   <li><code>probs</code> — a list of four hundred 0.1 values (<code>[0.1] * 400</code>),</li>
   <li><code>direct</code> — multiply them all together in a loop (start at 1.0) — it will collapse to <b>0.0</b> (underflow),</li>
   <li><code>log_sum</code> — instead sum <code>math.log(p)</code> over the same list — a finite number near <b>-921</b>,</li>
   <li><code>underflowed</code> — <code>True</code> if <code>direct == 0.0</code> (it did) while <code>log_sum</code> is finite (<code>math.isfinite</code>),</li>
   <li><code>order_kept</code> — <code>True</code> if <code>math.log(0.7) &gt; math.log(0.5)</code> (logs preserve order, so maximizing is safe).</li>
   </ol>`,
   starter:`import math

probs = [0.1] * 400

# 2) The naive product — multiply them all
direct = 1.0
# ... loop over probs, multiplying into direct

# 3) The log-space version — SUM the logs
log_sum =

# 4) The product died (0.0); the log sum lived
underflowed =

# 5) Logs preserve order, so switching to logs is safe
order_kept =

print(direct, log_sum, underflowed, order_kept)
`,
   solution:`import math

probs = [0.1] * 400

# 2) The naive product — multiply them all
direct = 1.0
for p in probs:
    direct *= p

# 3) The log-space version — SUM the logs
log_sum = sum(math.log(p) for p in probs)

# 4) The product died (0.0); the log sum lived
underflowed = (direct == 0.0) and math.isfinite(log_sum)

# 5) Logs preserve order, so switching to logs is safe
order_kept = math.log(0.7) > math.log(0.5)

print(direct, log_sum, underflowed, order_kept)
`,
   tests:[
     {d:'the naive product underflowed all the way to 0.0',expr:'direct == 0.0'},
     {d:'the sum of logs is finite and near -921',expr:'math.isfinite(log_sum) and abs(log_sum - 400*math.log(0.1)) < 1e-6'},
     {d:'the log approach survived where the product died',expr:'underflowed == True'},
     {d:'logs preserve order — maximizing in log space is safe',expr:'order_kept == True'}
   ],
   hints:[
     'The product loop: for p in probs: direct *= p. Four hundred 0.1s multiply down past the smallest float, so it becomes exactly 0.0.',
     'log_sum = sum(math.log(p) for p in probs) — 400 copies of log(0.1) ≈ -2.30, totalling about -921. Finite and usable.',
     'This IS why MLE works in log space: the likelihood would underflow, but the log-likelihood is a well-behaved sum.'
   ]}]}
]});
