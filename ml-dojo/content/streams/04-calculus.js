STREAMS.push({icon:'📉',track:'Foundations Track',title:'Calculus & Gradients',blurb:'Not the school subject — the one idea that makes models learn: which way is downhill, and how steep.',requires:'la5',requiresName:'Linear Algebra fundamentals (through least squares)',lessons:[
{id:'ca0',
 title:'Fundamentals: rate of change — how fast is a function moving?',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Calculus is the mathematics of <b>change</b>, and before we can talk about derivatives we
need to say precisely what "how fast something changes" even means. You met functions in the
notation stream (a machine: input in, output out); calculus asks a new question about them:
<b>as the input moves, how fast does the output move?</b> That single question, made precise,
is the whole subject — and it is exactly what a model needs to know to learn ("if I change
this weight, how fast does the error move?").</p></div>

<h3>The simplest case: a straight line has one constant slope</h3>
<p>The <b>slope</b> of a line is <b>rise over run</b> — how much the output goes up for each
step the input takes right: <code>slope = (change in y) / (change in x)</code>. A car driving
at a steady 60 mph has <code>distance = 60 × time</code>: a straight line whose slope,
<b>60</b>, <i>is</i> the speed. A line is "boring" in the best way — its rate of change is the
same everywhere.</p>

<h3>Curves: the average rate of change over an interval</h3>
<p>Most functions are not lines — they bend, so their steepness changes from place to place.
For a curve, the <b>average rate of change</b> between two points <code>a</code> and
<code>b</code> is the slope of the straight line joining them (the "secant"):</p>
<div class="codeSample">average rate = (f(b) - f(a)) / (b - a)</div>
<p>Drop a ball and its height follows a curve; <code>(f(b)-f(a))/(b-a)</code> is its
<i>average</i> speed between two instants. Compute it for <code>f(x) = x²</code> from 1 to 3
and you get <code>(9-1)/(3-1) = 4</code>. From 1 to 2 you get 3. From 1 to 1.5 you get 2.5.
Notice the trend — as the second point slides toward 1, the average rate is heading somewhere.</p>

<div class="hardidea">🧠 <b>The question that forces calculus into existence.</b> Average rate
needs <i>two</i> points. But a speedometer shows your speed at a single <b>instant</b> — one
point. How can there be a "rate of change" at one point, when
<code>(f(a)-f(a))/(a-a) = 0/0</code> is undefined? You cannot answer this with algebra alone.
The escape — watching the average rate as the two points squeeze together — needs a new idea:
the <b>limit</b>, the very next lesson. This lesson set up the question; the next one answers
it, and the one after that names the answer the derivative.</div>

<div class="demystify"><b>Demystify "rate of change":</b> it is just slope, and slope is just
steepness — how much the output moves per unit of input. Speed is the rate of change of
distance; the slope of the error is the rate of change of "how wrong." Same idea, three
costumes.</div>`,
 docs:[['Rate of change and slope (Khan Academy)','https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs']],
 quiz:{title:'Quick check',questions:[
   {q:'The slope of a straight line is:',
    options:['Its height','Rise over run — the change in output divided by the change in input','Its length','Always 1'],answer:1,
    why:'Slope = (change in y)/(change in x): how fast the output rises per step of input. For a line it is the same everywhere.'},
   {q:'The average rate of change of f between a and b is:',
    options:['f(a) + f(b)','(f(b) - f(a)) / (b - a) — the slope of the line joining the two points','The maximum of f','f(b) times f(a)'],answer:1,
    why:'It is the secant slope: total change in output over the interval, divided by the width of the interval.'},
   {q:'Why can algebra alone not give the rate of change at a SINGLE point?',
    options:['Points have no rate','Plugging one point into (f(a)-f(a))/(a-a) gives 0/0, which is undefined — you need the limit idea to resolve it','Rates only exist for lines','It can, easily'],answer:1,
    why:'One point makes the run zero → 0/0. Watching the average rate as the interval shrinks (a limit) is the way through — the next lesson.'}
 ]},
 exs:[{title:'Average rate of change — and watch it home in',
   lang:'python',
   prompt:`Build the average-rate tool and see the two behaviours:
   <ol>
   <li><code>avg_rate(f, a, b)</code> returns <code>(f(b) - f(a)) / (b - a)</code>,</li>
   <li>for the line <code>line(x) = 3*x + 2</code>: <code>r_line</code> = its average rate from 0 to 10 (constant 3 — a line has one slope),</li>
   <li>for <code>sq(x) = x*x</code>: <code>r_wide</code> = average rate from 1 to 3 (4.0), and <code>r_narrow</code> = from 1 to 1.5 (2.5),</li>
   <li><code>closing_in</code> = average rate of <code>sq</code> from 1 to 1.001 — it should be within 0.01 of <b>2</b>, the instantaneous rate the next lessons will pin down exactly.</li>
   </ol>`,
   starter:`def avg_rate(f, a, b):
    # (f(b) - f(a)) / (b - a)
    pass

def line(x):
    return 3 * x + 2

def sq(x):
    return x * x

r_line = avg_rate(line, 0, 10)
r_wide = avg_rate(sq, 1, 3)
r_narrow = avg_rate(sq, 1, 1.5)
closing_in = avg_rate(sq, 1, 1.001)

print(r_line, r_wide, r_narrow, closing_in)
`,
   solution:`def avg_rate(f, a, b):
    return (f(b) - f(a)) / (b - a)

def line(x):
    return 3 * x + 2

def sq(x):
    return x * x

r_line = avg_rate(line, 0, 10)
r_wide = avg_rate(sq, 1, 3)
r_narrow = avg_rate(sq, 1, 1.5)
closing_in = avg_rate(sq, 1, 1.001)

print(r_line, r_wide, r_narrow, closing_in)
`,
   tests:[
     {d:'the line has constant slope 3, whatever the interval',expr:'abs(r_line - 3) < 1e-9 and abs(avg_rate(line, 100, 200) - 3) < 1e-9'},
     {d:'average rate of x² from 1 to 3 is 4.0',expr:'abs(r_wide - 4.0) < 1e-9'},
     {d:'from 1 to 1.5 it is 2.5 — smaller interval, different slope',expr:'abs(r_narrow - 2.5) < 1e-9'},
     {d:'squeezing the interval toward 1 homes in on 2',expr:'abs(closing_in - 2.0) < 0.01'}
   ],
   hints:[
     'avg_rate is one line: return (f(b) - f(a)) / (b - a).',
     'For the line, try two different intervals — you always get 3. A straight line has a single slope.',
     'For x², the average rate depends on the interval; as b slides toward 1, it approaches 2. That approached value is what limits (next lesson) make exact.'
   ]}]},

{id:'cl1',
 title:'Fundamentals: limits — what a value approaches (even where the function breaks)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Last lesson left us stuck: the rate of change at a single instant looked like
<code>0/0</code>. The <b>limit</b> is the idea that rescues it — and it underlies every
derivative, and therefore every gradient and every training step in ML. A limit answers:
<b>what value does <code>f(x)</code> get arbitrarily close to as <code>x</code> approaches some
point</b> — <i>even if the function is undefined exactly there?</i></p></div>

<h3>A hole you can still see across</h3>
<p>Take <code>g(x) = (x² − 1) / (x − 1)</code>. At <code>x = 1</code> it is
<code>0/0</code> — genuinely undefined, a <b>hole</b> in the graph. But look what happens as
<code>x</code> creeps toward 1:</p>
<div class="codeSample">g(0.9)   = 1.9
g(0.99)  = 1.99
g(0.999) = 1.999      →  heading straight for 2
g(1.001) = 2.001
g(1.01)  = 2.01</div>
<p>From both sides the value homes in on <b>2</b>, even though <code>g(1)</code> itself does not
exist. We write <code>lim (x→1) g(x) = 2</code>: "the limit as x approaches 1 is 2." (The reason
is that <code>(x²−1)/(x−1) = x+1</code> everywhere except the hole — and <code>x+1</code> at 1
is 2.) A limit is the <b>destination</b>, not necessarily the place you land.</p>

<h3>Why this is the whole foundation of derivatives</h3>
<p>The instantaneous rate of change from last lesson <i>is</i> a limit: the average rate
<code>(f(a+h) − f(a)) / h</code> as the gap <code>h</code> shrinks toward 0. You cannot set
<code>h = 0</code> (that is the <code>0/0</code>), but you can ask what the ratio
<b>approaches</b> — and that limit is the exact instantaneous slope. Every derivative you will
ever compute is secretly this limit; every gradient-descent step depends on it existing.</p>

<div class="hardidea">🧠 <b>The precise idea, plainly.</b> <code>lim (x→a) f(x) = L</code> means:
you can force <code>f(x)</code> as close to <code>L</code> as you like, just by taking
<code>x</code> close enough to <code>a</code> (without needing <code>x = a</code>). That is the
entire content of the famous "epsilon–delta" definition, in words. It also gives us
<b>continuity</b> — a function is continuous where its limit equals its actual value (no holes,
no jumps) — which is why "smooth" losses are nice to optimize.</div>

<div class="demystify"><b>Demystify "limit":</b> nothing mystical — it is where a process is
<i>heading</i>. A runner approaching the finish line, a balance approaching zero, an average
rate approaching an instantaneous one. The value can be perfectly definite even if the exact
endpoint is a hole. Computers estimate limits exactly the way you will in the exercise: get
close and look.</div>`,
 docs:[['Limits — an intuitive introduction (Khan Academy)','https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new']],
 quiz:{title:'Quick check',questions:[
   {q:'lim (x→1) of (x²−1)/(x−1) = 2 means:',
    options:['g(1) equals 2','As x gets arbitrarily close to 1, g(x) gets arbitrarily close to 2 — even though g(1) itself is undefined (0/0)','2 is the largest value of g','g never reaches 2'],answer:1,
    why:'A limit is the value approached, not necessarily attained. The function has a hole at x=1, yet the limit there is a definite 2.'},
   {q:'How is a derivative connected to limits?',
    options:['It is not','The derivative IS the limit of the average rate (f(a+h)−f(a))/h as h approaches 0','Derivatives replace limits','Limits are only for straight lines'],answer:1,
    why:'You cannot set h=0 (that is 0/0), but the ratio approaches a definite value as h shrinks — that limit is the instantaneous slope.'},
   {q:'A function is "continuous" at a point when:',
    options:['It is a straight line','Its limit there equals its actual value — no hole, no jump','It never changes','It has a maximum there'],answer:1,
    why:'Continuity = the value you approach matches the value you land on. Smooth, continuous losses are the pleasant ones to optimize.'}
 ]},
 exs:[{title:'Estimate a limit the way a computer does — get close and look',
   lang:'python',
   prompt:`Investigate <code>g(x) = (x² − 1)/(x − 1)</code> near its hole at x = 1, and see the
   derivative-as-limit:
   <ol>
   <li><code>near_below</code> = <code>g(0.999)</code> and <code>near_above</code> = <code>g(1.001)</code> — both near 2,</li>
   <li><code>limit_est</code> = their average (≈ 2.0), your numerical estimate of the limit,</li>
   <li><code>undefined_at_1</code> — evaluate <code>g(1)</code> inside try/except and set this <code>True</code> when it raises <code>ZeroDivisionError</code> (the 0/0 hole is real),</li>
   <li><code>slope_at_2</code> — the derivative of <code>sq(x)=x*x</code> at x=2 <i>as a limit</i>: <code>(sq(2+h) - sq(2)) / h</code> with a tiny <code>h = 1e-6</code> (≈ 4.0).</li>
   </ol>`,
   starter:`def g(x):
    return (x**2 - 1) / (x - 1)

def sq(x):
    return x * x

# 1) Approach the hole from both sides
near_below = g(0.999)
near_above = g(1.001)

# 2) Numerical estimate of the limit
limit_est =

# 3) But the function itself is undefined AT x = 1 (0/0)
undefined_at_1 = False
# ... use try/except around g(1)

# 4) A derivative IS a limit: slope of x^2 at 2 as h -> 0
h = 1e-6
slope_at_2 =

print(limit_est, undefined_at_1, slope_at_2)
`,
   solution:`def g(x):
    return (x**2 - 1) / (x - 1)

def sq(x):
    return x * x

# 1) Approach the hole from both sides
near_below = g(0.999)
near_above = g(1.001)

# 2) Numerical estimate of the limit
limit_est = (near_below + near_above) / 2

# 3) But the function itself is undefined AT x = 1 (0/0)
undefined_at_1 = False
try:
    g(1)
except ZeroDivisionError:
    undefined_at_1 = True

# 4) A derivative IS a limit: slope of x^2 at 2 as h -> 0
h = 1e-6
slope_at_2 = (sq(2 + h) - sq(2)) / h

print(limit_est, undefined_at_1, slope_at_2)
`,
   tests:[
     {d:'both sides approach 2 (the limit)',expr:'abs(near_below - 2) < 0.01 and abs(near_above - 2) < 0.01'},
     {d:'the numerical limit estimate is ≈ 2.0',expr:'abs(limit_est - 2.0) < 0.001'},
     {d:'g(1) is genuinely undefined — 0/0 was caught',expr:'undefined_at_1 == True'},
     {d:'the derivative-as-a-limit gives slope 4 at x=2',expr:'abs(slope_at_2 - 4.0) < 0.001'}
   ],
   hints:[
     'limit_est = (near_below + near_above) / 2 — average the two one-sided approaches.',
     'For the hole: try: g(1) then except ZeroDivisionError: undefined_at_1 = True. The run (x-1) is 0 at x=1.',
     'slope_at_2 = (sq(2 + h) - sq(2)) / h with h = 1e-6. This is the average rate with an almost-zero gap — i.e. the limit that defines the derivative. It lands on 4.'
   ]}]},

{id:'ca1',
 title:'What a derivative actually is: the nudge test',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Forget the school formulas for a minute. A <b>derivative</b> answers one question:
<i>"if I nudge the input a tiny bit, how much does the output move?"</i> That's it — it's the
<b>slope</b>, the sensitivity of output to input. Why ML cares: a model has knobs (weights) and
an <b>error</b> score (recall from Orientation: the <i>error/loss</i> is how wrong the model's
predictions are — not a program bug). Learning = asking, for each knob, <i>"if I nudge this
knob, does the error go up or down, and how fast?"</i> — and that question IS the derivative.</p></div>

<h3>You can measure it — no formulas needed</h3>
<p>Take <code>f(x) = x²</code>. What's its slope at <code>x = 3</code>? Nudge and see:</p>
<div class="codeSample">def f(x):
    return x * x

h = 0.0001                       # a tiny nudge
slope = (f(3 + h) - f(3)) / h    # rise over run
# ≈ 6.0001 — the slope at x=3 is about 6</div>
<p>This is the <b>numerical derivative</b>: nudge the input by a hair, measure how the output
moved, divide. The calculus you learned in school (the rule "the derivative of x² is 2x")
is just the <i>exact shortcut</i> for what the nudge test measures — at <code>x=3</code>,
<code>2x = 6</code>. Same answer, and the nudge test works even when you don't know any rules.</p>

<div class="demystify"><b>Demystify "derivative":</b> the scary word means <i>rate of change</i>,
nothing more. Positive slope = the function is going uphill there; negative = downhill;
zero = flat (a bottom, a top, or a plateau). And a sign you'll use forever: if the slope of
the ERROR with respect to a knob is positive, turning the knob up makes things worse — so
turn it down. That single sentence is most of machine learning.</div>

<div class="notebox"><b>📐 Notation decoder — calculus symbols</b> (four ways to write the same
idea, plus the multi-knob versions):
<table>
<tr><td>f(x)</td><td>a <b>function</b> — input x, output f(x)</td></tr>
<tr><td>f&#8242;(x)</td><td>"f-prime": the <b>derivative</b> of f — its slope (Lagrange notation)</td></tr>
<tr><td>dy/dx</td><td>the <b>same derivative</b>, read "the rate of change of y with respect to x" (Leibniz notation — it is <i>not</i> a fraction, just a name for the slope)</td></tr>
<tr><td>∂f/∂x</td><td>a <b>partial derivative</b> — the slope in the x-direction, holding the other variables still (the curly ∂ signals "one knob at a time")</td></tr>
<tr><td>∇f</td><td>"nabla f": the <b>gradient</b> — the vector of all the partial derivatives, one per knob</td></tr>
<tr><td>lim</td><td>a <b>limit</b> — "what the value settles toward" as something shrinks to zero</td></tr>
<tr><td>Δx, h</td><td>a <b>small change</b> in x — the "nudge" in the nudge test</td></tr>
</table>
So <code>dy/dx</code>, <code>f&#8242;(x)</code>, and "the slope" are three names for one thing;
<code>∂</code> and <code>∇</code> are just the many-knob versions you meet later in this stream.</div>

<div class="hardidea">🧠 <b>The precise statement (now that you have limits).</b> The derivative
is exactly the <b>limit</b> you just built — the average rate of change as the gap shrinks to
zero: <code>f'(x) = lim_{h→0} (f(x+h) − f(x)) / h</code>. The two previous lessons were not a
detour: "rate of change" gave the question, "limit" gave the tool, and "derivative" is simply
the name for the answer. The smaller the <code>h</code> in your experiment, the closer you get
to the true value — which is why your measured 6.0001 was a hair off 6.</div>`,
 docs:[['3Blue1Brown — The Essence of Calculus','https://www.3blue1brown.com/topics/calculus']],
 quiz:{title:'Quick check',questions:[
   {q:'In plain words, the derivative of a function at a point is:',
    options:['The function value there','How much the output moves when you nudge the input a tiny bit — the slope','The largest value the function reaches','The area under the curve'],answer:1,
    why:'Derivative = sensitivity = slope. The nudge test (f(x+h) − f(x)) / h measures exactly that.'},
   {q:'The error\u0027s derivative with respect to a knob is positive. To reduce the error you should:',
    options:['Turn the knob up','Turn the knob down','Leave the knob alone','Reset the knob to zero'],answer:1,
    why:'Positive slope means increasing the knob increases the error — so step the other way. This is the heart of learning.'},
   {q:'The school rule "derivative of x² is 2x" relates to the nudge test how?',
    options:['They are unrelated','The rule is the exact shortcut for what the nudge test measures approximately','The nudge test is more accurate','The rule only works for x=3'],answer:1,
    why:'Analytic rules give exactly what the numerical nudge approaches as h shrinks. Same quantity, two routes.'}
 ]},
 exs:[{title:'Measure slopes with the nudge test',
   lang:'python',
   prompt:`Implement the nudge test and use it. Pure Python — no imports:
   <ol>
   <li>Write <code>derivative(f, x)</code> that returns the numerical slope of <code>f</code> at <code>x</code> using nudge <code>h = 1e-6</code>: <code>(f(x+h) - f(x)) / h</code>.</li>
   <li><code>slope_at_3</code> — the slope of <code>square(x) = x*x</code> at <code>x=3</code> (should be ≈ 6).</li>
   <li><code>slope_at_0</code> — the slope of <code>square</code> at <code>x=0</code> (flat bottom — should be ≈ 0).</li>
   <li><code>direction</code> — the string <code>"down"</code> if <code>slope_at_3 &gt; 0</code> means the knob should go down to reduce x² (it does), else <code>"up"</code>.</li>
   </ol>`,
   starter:`def square(x):
    return x * x

def derivative(f, x):
    h = 1e-6
    # rise over run: (f(x+h) - f(x)) / h
    pass

slope_at_3 =
slope_at_0 =

# if the slope at 3 is positive, the knob must go DOWN to reduce the error
direction =

print(slope_at_3, slope_at_0, direction)
`,
   solution:`def square(x):
    return x * x

def derivative(f, x):
    h = 1e-6
    return (f(x + h) - f(x)) / h

slope_at_3 = derivative(square, 3)
slope_at_0 = derivative(square, 0)

# if the slope at 3 is positive, the knob must go DOWN to reduce the error
direction = "down" if slope_at_3 > 0 else "up"

print(slope_at_3, slope_at_0, direction)
`,
   tests:[
     {d:'derivative(square, 3) is about 6',expr:'abs(slope_at_3 - 6) < 0.01'},
     {d:'derivative(square, 0) is about 0 (flat at the bottom)',expr:'abs(slope_at_0) < 0.01'},
     {d:'direction is "down" — step against the slope',expr:'direction == "down"'},
     {d:'derivative works on other functions too (slope of 5x at 10 is 5)',expr:'abs(derivative(lambda x: 5*x, 10) - 5) < 0.01'}
   ],
   hints:[
     'derivative returns (f(x + h) - f(x)) / h — rise over run with a tiny run.',
     'Call it: slope_at_3 = derivative(square, 3). Expect about 6.000001.',
     'Positive slope at x=3 means x² increases if x increases — so to reduce it, go down: direction = "down".'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> Using the nudge test in your head (or the definition), what is the slope of the straight line <code>f(x) = 4x + 1</code> at <code>x = 2</code>? At <code>x = 100</code>?`,
    solution:`For a straight line the slope is the <b>same everywhere</b> — it is the coefficient of x. So <code>f'(2) = 4</code> and <code>f'(100) = 4</code>. Check with the nudge test: <code>(f(2+h) − f(2))/h = (4(2+h)+1 − 9)/h = 4h/h = 4</code>, for any h. A line has one constant rate of change.`},
   {q:`<b>2.</b> For <code>f(x) = x²</code>, use the definition <code>(f(x+h) − f(x))/h</code> and simplify (before letting h → 0) to find the exact slope at a general point x.`,
    solution:`<code>(f(x+h) − f(x))/h = ((x+h)² − x²)/h = (x² + 2xh + h² − x²)/h = (2xh + h²)/h = 2x + h</code>.<br>As <code>h → 0</code>, this approaches <b>2x</b>. So the derivative of x² is 2x — which is why its slope at x=3 is 6, matching your nudge-test measurement. You just derived the power rule for n=2 by hand.`},
   {q:`<b>3. (ML connection)</b> The error is <code>E(w) = (w − 5)²</code>. Its slope is <code>E'(w) = 2(w − 5)</code>. If your current weight is <code>w = 8</code>, is the slope positive or negative, and which way should gradient descent move w?`,
    solution:`<code>E'(8) = 2(8 − 5) = +6</code>, a <b>positive</b> slope — increasing w increases the error. So gradient descent moves w the <i>opposite</i> way, <b>downward</b>: <code>w ← w − lr·6</code>, toward the minimum at w = 5. Positive slope → step down; that single sign rule is the heart of training.`}
 ]}},

{id:'ca1b',
 title:'The differentiation rules — computing derivatives by hand (just the ML ones)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>The nudge test gives a derivative <i>numerically</i>, one point at a time. But there are
<b>rules</b> that hand you the derivative as a formula, instantly, for whole families of
functions — and you need them to read ML papers, apply the chain rule in backprop, and do the
homework. We teach only the rules ML actually uses; we deliberately skip the rest of a calculus
course (see the boundary note below).</p></div>

<h3>The power rule and its friends</h3>
<div class="codeSample">Power rule:      d/dx xⁿ  = n · xⁿ⁻¹        e.g.  x²  → 2x,   x³ → 3x²
Constant:        d/dx c   = 0               a flat line has slope 0
Constant × f:    d/dx c·f = c · f'          pull constants straight out
Sum rule:        d/dx (f + g) = f' + g'     differentiate term by term</div>
<p>Put them together: <code>d/dx (3x² + 2x + 5) = 6x + 2 + 0 = 6x + 2</code>. Check it against
the nudge test at any point and it matches exactly — the rule is just the shortcut. (Recognise
<code>x²  → 2x</code>? That is why the squared-error bowl has slope <code>2x</code>, the fact
gradient descent rode in the earlier lesson.)</p>

<h3>The product rule</h3>
<div class="codeSample">Product rule:    d/dx [f · g] = f'·g + f·g'</div>
<p>The derivative of a product is <i>not</i> the product of the derivatives — it is "derivative
of the first times the second, plus the first times derivative of the second." Example:
<code>d/dx [x² · (x+1)] = (2x)(x+1) + (x²)(1) = 3x² + 2x</code>.</p>

<h3>The chain rule (preview) and the derivatives ML lives on</h3>
<p>The <b>chain rule</b> — <code>d/dx f(g(x)) = f'(g(x)) · g'(x)</code> — gets its own full
lesson next (it is the engine of backprop), but it is one of these rules. With it, the three
derivatives that power machine learning:</p>
<div class="codeSample">d/dx eˣ    = eˣ            the exponential is its own derivative (!)
d/dx ln x  = 1/x
d/dx σ(x)  = σ(x)·(1 − σ(x))     the SIGMOID derivative — used in every backprop pass</div>
<p>That last one is famous: the sigmoid's slope is <code>σ(x)(1−σ(x))</code>, a tidy result you
get by applying the chain rule to <code>1/(1+e⁻ˣ)</code>. Every neural network that uses a
sigmoid computes exactly this during training. You will verify it in the exercise.</p>

<div class="demystify"><b>Honest boundary — and why you will rarely do this by hand.</b> We
cover the power, product, and chain rules and the derivatives of <code>eˣ</code>,
<code>ln x</code>, and the sigmoid — the differentiation ML uses — and we <i>skip</i> the rest
of a calculus course (integration, trig calculus, infinite series, related rates): ML does not
need them. And a reassuring truth: in real ML you almost never differentiate by hand, because
<b>autograd</b> (PyTorch, JAX) applies these exact rules automatically — that is literally what
"automatic differentiation" is. You learn the rules to <i>understand and debug</i> what the
machine does, not to grind them out yourself.</div>`,
 docs:[['Derivative rules (Khan Academy)','https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-1-new'],['Derivative of the sigmoid — worked','https://en.wikipedia.org/wiki/Logistic_function#Derivative']],
 quiz:{title:'Quick check',questions:[
   {q:'By the power rule, the derivative of 3x² + 2x + 5 is:',
    options:['6x³ + 2','6x + 2','3x + 2','x² + x'],answer:1,
    why:'Power rule term by term: 3·(2x) + 2·(1) + 0 = 6x + 2. Constants differentiate to 0; constant multiples pull out.'},
   {q:'The product rule for d/dx [f·g] is:',
    options:["f'·g'","f'·g + f·g' — derivative of first times second, plus first times derivative of second","f·g","f' + g'"],answer:1,
    why:'The derivative of a product is NOT the product of derivatives. It is the cross pattern f\u0027g + fg\u0027.'},
   {q:'The derivative of the sigmoid σ(x) is:',
    options:['σ(x)','σ(x)·(1 − σ(x)) — the tidy result used in every backprop pass','1/x','eˣ'],answer:1,
    why:'σ\u0027(x) = σ(x)(1−σ(x)), obtained via the chain rule on 1/(1+e⁻ˣ). It is why sigmoid gradients are cheap to compute.'}
 ]},
 exs:[{title:'Apply the rules — and check them against the nudge test',
   lang:'python',
   prompt:`Write each derivative <b>as a formula</b> (using the rules), then the code checks it
   matches the numerical derivative — proving you applied the rule correctly:
   <ol>
   <li><code>f(x) = 3*x**2 + 2*x + 5</code>; write <code>fprime(x)</code> by the power rule (<code>6x + 2</code>),</li>
   <li><code>g(x) = x**2 * (x + 1)</code>; write <code>gprime(x)</code> by the product rule (<code>3x² + 2x</code>),</li>
   <li><code>sigmoid(x) = 1/(1+e^-x)</code>; write <code>sig_prime(x)</code> using the famous <code>σ(x)(1−σ(x))</code>,</li>
   </ol>
   The provided <code>num_deriv</code> checks each against the nudge test at a sample point.`,
   packages:['numpy'],
   starter:`import math

def num_deriv(fn, x):        # ground-truth numerical derivative
    h = 1e-6
    return (fn(x + h) - fn(x)) / h

def f(x):
    return 3*x**2 + 2*x + 5

def fprime(x):
    # power rule: d/dx (3x^2 + 2x + 5)
    pass

def g(x):
    return x**2 * (x + 1)

def gprime(x):
    # product rule on x^2 and (x+1)  ->  3x^2 + 2x
    pass

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def sig_prime(x):
    # the famous result: sigma(x) * (1 - sigma(x))
    pass

print(fprime(2), gprime(2), sig_prime(0))
`,
   solution:`import math

def num_deriv(fn, x):        # ground-truth numerical derivative
    h = 1e-6
    return (fn(x + h) - fn(x)) / h

def f(x):
    return 3*x**2 + 2*x + 5

def fprime(x):
    return 6*x + 2

def g(x):
    return x**2 * (x + 1)

def gprime(x):
    return 3*x**2 + 2*x

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def sig_prime(x):
    s = sigmoid(x)
    return s * (1 - s)

print(fprime(2), gprime(2), sig_prime(0))
`,
   tests:[
     {d:'fprime matches the nudge test (power rule applied right)',expr:'abs(fprime(2) - num_deriv(f, 2)) < 1e-3 and abs(fprime(5) - num_deriv(f, 5)) < 1e-3'},
     {d:'fprime(2) equals 14 (6·2 + 2)',expr:'abs(fprime(2) - 14) < 1e-9'},
     {d:'gprime matches the nudge test (product rule applied right)',expr:'abs(gprime(3) - num_deriv(g, 3)) < 1e-3'},
     {d:'sigmoid derivative matches, and sig_prime(0) = 0.25',expr:'abs(sig_prime(0) - 0.25) < 1e-9 and abs(sig_prime(1) - num_deriv(sigmoid, 1)) < 1e-4'}
   ],
   hints:[
     'Power rule term by term: fprime(x) = 6*x + 2.',
     'Product rule d/dx[x²·(x+1)] = 2x·(x+1) + x²·1 = 3x² + 2x, so gprime(x) = 3*x**2 + 2*x.',
     'Reuse sigmoid inside sig_prime: s = sigmoid(x); return s * (1 - s). At x=0, σ=0.5 so the slope is 0.25 — the sigmoid is steepest in the middle.'
   ]}],
 homework:{intro:'Differentiate these by hand using the rules, then reveal the worked solution. These are exactly the kind of steps autograd does for you — doing a few yourself is how the rules stick.',problems:[
   {q:`<b>1.</b> Differentiate <code>f(x) = 5x³ − 4x² + 7</code> using the power, constant-multiple, and sum rules.`,
    solution:`Differentiate term by term.<br>
    • <code>d/dx 5x³ = 5·(3x²) = 15x²</code> (power rule, constant pulled out)<br>
    • <code>d/dx (−4x²) = −4·(2x) = −8x</code><br>
    • <code>d/dx 7 = 0</code> (constant)<br>
    <b>Answer:</b> <code>f'(x) = 15x² − 8x</code>.`},
   {q:`<b>2.</b> Use the product rule to differentiate <code>h(x) = (x + 3)(x² − 1)</code>.`,
    solution:`Product rule: <code>d/dx[f·g] = f'·g + f·g'</code> with <code>f = x+3</code> (so
    <code>f' = 1</code>) and <code>g = x²−1</code> (so <code>g' = 2x</code>).<br>
    <code>h'(x) = (1)(x² − 1) + (x + 3)(2x) = x² − 1 + 2x² + 6x = <b>3x² + 6x − 1</b></code>.<br>
    (Check: expand first — <code>h = x³ + 3x² − x − 3</code> — then power rule gives the same
    <code>3x² + 6x − 1</code>. Two routes, one answer.)`},
   {q:`<b>3. (Chain rule)</b> Differentiate <code>k(x) = (2x + 1)³</code>.`,
    solution:`Chain rule: <code>d/dx f(g(x)) = f'(g(x))·g'(x)</code>. Outer
    <code>f(u) = u³</code> (so <code>f'(u) = 3u²</code>), inner <code>g(x) = 2x+1</code> (so
    <code>g'(x) = 2</code>).<br>
    <code>k'(x) = 3(2x + 1)² · 2 = <b>6(2x + 1)²</b></code>. The inner derivative (the 2) is
    exactly what people forget — that factor is the whole reason the chain rule exists.`},
   {q:`<b>4. (ML, on paper then verify)</b> Show that the sigmoid derivative is
    <code>σ'(x) = σ(x)(1 − σ(x))</code>, then confirm numerically in the Playground that at
    <code>x = 2</code> it matches the nudge test.`,
    solution:`Write <code>σ(x) = (1 + e⁻ˣ)⁻¹</code>. Chain rule on the outer power −1 and the
    inner <code>1 + e⁻ˣ</code> (whose derivative is <code>−e⁻ˣ</code>):<br>
    <code>σ'(x) = −(1+e⁻ˣ)⁻² · (−e⁻ˣ) = e⁻ˣ / (1+e⁻ˣ)²</code>.<br>
    Now rewrite: <code>= [1/(1+e⁻ˣ)] · [e⁻ˣ/(1+e⁻ˣ)] = σ(x)·(1 − σ(x))</code>, since
    <code>e⁻ˣ/(1+e⁻ˣ) = 1 − σ(x)</code>. ∎<br>
    Verify:<div class="codeSample">import math
def sig(x): return 1/(1+math.exp(-x))
def num(f,x,h=1e-6): return (f(x+h)-f(x))/h
x=2
print(sig(x)*(1-sig(x)), num(sig,x))   # ~0.1050 both</div>`}
 ]}},

{id:'ca2',
 title:'Gradient descent: walk downhill, arrive at the answer',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Now use the slope to <b>learn</b>. The recipe called <b>gradient descent</b> — the engine
under nearly every model, from linear regression to GPT — is three lines: measure the slope
of the error at your current knob setting; step the knob a little bit <i>against</i> the
slope; repeat. Downhill, step by step, until the error stops improving.</p></div>

<h3>The foggy hillside</h3>
<p>Picture standing on a hillside in fog — you can't see the valley, but you can feel the
slope under your feet. Step downhill; repeat. That's the entire algorithm. The
<b>learning rate</b> is your stride length: too small and you inch forever; too large and you
overshoot the valley and bounce out. In the exercise you'll watch <code>x = 8</code> walk down
<code>f(x) = (x−3)²</code> and settle at the bottom, <code>x = 3</code> — found by feel alone.</p>
<div class="figure"><svg viewBox="0 0 440 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gradient descent walking down a bowl-shaped error curve">
  <line x1="45" y1="20" x2="45" y2="210" stroke="#5a7a7d" stroke-width="1.5"/>
  <line x1="45" y1="210" x2="415" y2="210" stroke="#5a7a7d" stroke-width="1.5"/>
  <text x="16" y="120" font-size="12" fill="#5a7a7d" transform="rotate(-90 16 120)">error (loss)</text>
  <text x="230" y="238" font-size="12" fill="#5a7a7d" text-anchor="middle">weight (the knob)</text>
  <path d="M 70 40 Q 230 350 390 40" fill="none" stroke="#0d9488" stroke-width="2.5"/>
  <!-- descent dots walking down the right arm to the minimum -->
  <g fill="#0f766e">
    <circle cx="360" cy="70" r="6"/><circle cx="322" cy="118" r="6"/>
    <circle cx="290" cy="152" r="6"/><circle cx="262" cy="176" r="6"/>
    <circle cx="240" cy="190" r="5"/><circle cx="230" cy="196" r="5"/>
  </g>
  <!-- arrows between steps -->
  <g stroke="#e2711d" stroke-width="1.8" fill="none">
    <path d="M 353 80 L 329 108" marker-end="url(#ah)"/>
    <path d="M 315 128 L 296 145" marker-end="url(#ah)"/>
    <path d="M 283 160 L 268 172" marker-end="url(#ah)"/>
  </g>
  <!-- tangent (the gradient/slope) at the start point -->
  <line x1="330" y1="52" x2="392" y2="92" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="396" y="70" font-size="11" fill="#7c3aed">slope here</text>
  <text x="300" y="45" font-size="11.5" fill="#0f766e" font-weight="700">start</text>
  <circle cx="230" cy="205" r="4" fill="#dc2626"/>
  <text x="205" y="200" font-size="11.5" fill="#dc2626" font-weight="700" text-anchor="end">minimum</text>
  <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#e2711d"/></marker></defs>
</svg>
<div class="figCap"><b>Gradient descent.</b> The curve is the error as you change one weight — a bowl. At any point the <b>gradient is the slope</b> (dashed line): it points <i>uphill</i>, so each step moves the weight the opposite way (orange arrows), walking down to the minimum. The step size is the learning rate.</div></div>
<div class="codeSample">x = 8.0                      # start anywhere
lr = 0.1                     # learning rate — stride length
for step in range(100):
    slope = derivative(f, x) # feel the hill
    x = x - lr * slope       # step AGAINST the slope
# x ends near 3.0 — the bottom, discovered not looked up</div>

<div class="demystify"><b>Demystify "gradient":</b> when there are many knobs, you measure one
slope per knob and stack them into a vector — THAT vector is the gradient. "Gradient descent"
= "measure all the slopes, step every knob against its slope, at once." With one knob, the
gradient IS the derivative. Nothing fancier is happening in a 100-billion-parameter model —
just this loop, with more knobs.</div>

<div class="hardidea">🧠 <b>Honest caveat (convexity, previewed).</b> Walking downhill finds
<i>a</i> bottom — not always <i>the deepest</i> one. Bowl-shaped ("convex") errors like
(x−3)² have exactly one bottom, so descent is guaranteed to find it. Neural-net losses are
bumpier; that's a real issue, and it gets its own deep-dive later. For now: one bowl, one
bottom, guaranteed arrival.</div>`,
 docs:[['Gradient descent, visually (3Blue1Brown)','https://www.3blue1brown.com/lessons/gradient-descent']],
 quiz:{title:'Quick check',questions:[
   {q:'Gradient descent updates a knob with x = x − lr·slope. Why the minus sign?',
    options:['Tradition','To step AGAINST the slope — downhill — so the error shrinks','To keep x positive','Because slopes are always negative'],answer:1,
    why:'The slope points uphill; subtracting it steps downhill. That single minus sign is what makes it "descent."'},
   {q:'The learning rate controls:',
    options:['How many knobs the model has','The stride length of each downhill step','The final answer','The number of data points'],answer:1,
    why:'Too small = crawling; too large = overshooting and bouncing. Choosing it well is a real practical skill.'},
   {q:'For a bowl-shaped (convex) error like (x−3)², gradient descent:',
    options:['Might get stuck anywhere','Is guaranteed to settle at the single bottom','Only works if you start at x=0','Needs a neural network'],answer:1,
    why:'One bowl, one bottom: convexity is exactly the guarantee that downhill leads to THE minimum, not just A minimum.'}
 ]},
 exs:[{title:'Find the bottom by feel: implement gradient descent',
   lang:'python',
   prompt:`The error function is <code>f(x) = (x - 3)²</code> — a bowl with its bottom at
   <code>x = 3</code>. Starting from <code>x = 8.0</code>, run <b>100 steps</b> of gradient
   descent with learning rate <code>lr = 0.1</code>, using the numerical
   <code>derivative</code> from last lesson (provided). Store the final position in
   <code>x</code> — it should land within 0.01 of 3. Also record <code>first_slope</code>,
   the slope at the starting point 8.0 (≈ 10), before any steps.`,
   starter:`def f(x):
    return (x - 3) ** 2

def derivative(fn, x):
    h = 1e-6
    return (fn(x + h) - fn(x)) / h

x = 8.0
lr = 0.1

first_slope =        # slope at the start, x = 8.0  (about 10)

# now take 100 steps: x = x - lr * slope, recomputing the slope each step

print("final x =", x, " first slope =", first_slope)
`,
   solution:`def f(x):
    return (x - 3) ** 2

def derivative(fn, x):
    h = 1e-6
    return (fn(x + h) - fn(x)) / h

x = 8.0
lr = 0.1

first_slope = derivative(f, x)   # slope at the start, x = 8.0 (about 10)

# now take 100 steps: x = x - lr * slope, recomputing the slope each step
for step in range(100):
    x = x - lr * derivative(f, x)

print("final x =", x, " first slope =", first_slope)
`,
   tests:[
     {d:'first_slope is about 10 (the hill is steep at x=8)',expr:'abs(first_slope - 10) < 0.01'},
     {d:'x walked downhill to the bottom: within 0.01 of 3',expr:'abs(x - 3) < 0.01'},
     {d:'the error at the final x is tiny',expr:'f(x) < 0.001'},
     {d:'the program prints its results',expr:'"final x" in _stdout'}
   ],
   hints:[
     'first_slope = derivative(f, 8.0) — measure before moving. (x−3)² has slope 2(x−3): at 8 that is 10.',
     'The loop: for step in range(100): x = x - lr * derivative(f, x). Recompute the slope EVERY step — the hill changes as you move.',
     'If x explodes instead of settling, your update has a plus sign — the minus (against the slope) is the whole trick.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> The error is <code>E(w) = (w − 3)²</code>, slope <code>E'(w) = 2(w − 3)</code>. Starting at <code>w = 8</code> with learning rate <code>lr = 0.1</code>, compute the first TWO gradient-descent steps by hand.`,
    solution:`Step 1: slope at 8 is <code>2(8−3) = 10</code>, so <code>w ← 8 − 0.1·10 = 7</code>.<br>Step 2: slope at 7 is <code>2(7−3) = 8</code>, so <code>w ← 7 − 0.1·8 = 6.2</code>.<br>Each step moves w toward the minimum at 3, and the steps get <i>smaller</i> as the slope flattens near the bottom — which is why descent naturally slows down as it converges.`},
   {q:`<b>2. (Learning rate)</b> With the same <code>E'(w) = 2(w − 3)</code> and start <code>w = 8</code>, what happens on the first step if the learning rate is <code>lr = 1.0</code> instead of 0.1? What does this tell you?`,
    solution:`Slope at 8 is 10, so <code>w ← 8 − 1.0·10 = −2</code>. You <b>overshot</b> the minimum (3) and landed on the far side, now even farther away than you started. Next step the slope is <code>2(−2−3) = −10</code>, pushing you back to <code>−2 − 1.0·(−10) = 8</code> — it will bounce forever (or diverge). Lesson: too large a learning rate overshoots and fails to converge; the rate must be small enough.`},
   {q:`<b>3. (Concept)</b> Why does gradient descent take <i>smaller</i> steps as it nears the minimum, even with a fixed learning rate?`,
    solution:`Because the step size is <code>lr × slope</code>, and the <b>slope shrinks toward 0</b> as you approach the bottom of the bowl (at the minimum the slope is exactly 0 — flat). So even with lr fixed, the actual movement <code>lr·slope</code> automatically gets smaller near the minimum, letting it settle gently rather than overshoot. The gradient encodes both direction <i>and</i> urgency.`}
 ]}},

{id:'ca3',
 title:'Fundamentals: partial derivatives & the gradient — many knobs at once',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Real models do not have one knob — they have two (a line: slope and intercept), thousands
(regression on many features), or billions (an LLM). The question stays the same — <i>"which
way is downhill?"</i> — but now it must be asked <b>per knob</b>. A <b>partial derivative</b>
is exactly that: the slope with respect to ONE knob, <i>holding the others still</i>. No new
idea. Just the nudge test, one knob at a time.</p></div>

<h3>The gradient: all the slopes, stacked</h3>
<p>Collect every knob's partial into one vector and you have the <b>gradient</b>, written
∇f. Linear algebra pays off here: the gradient IS a vector, and it points in the direction of
<b>steepest increase</b> of the error. So learning is: compute the gradient, step every knob
against its own slope, simultaneously. That is full <b>gradient descent</b> — the same loop
you wrote last lesson, now in n dimensions.</p>
<div class="codeSample">def f(w, b):                      # error as a function of TWO knobs
    return (2*w + b - 5) ** 2     # truth: 2w + b should equal 5

# partial wrt w: nudge w only          partial wrt b: nudge b only
dw = (f(w + h, b) - f(w, b)) / h
db = (f(w, b + h) - f(w, b)) / h
gradient = [dw, db]               # the downhill map, one entry per knob</div>

<div class="demystify"><b>Demystify "∂" and "∇":</b> the curly ∂ ("partial") just marks "this
derivative pretends the other variables are constants." The triangle ∇ ("nabla" — Greek for a
Phoenician harp of that shape, seriously) just means "the vector of all the partials."
Ancient symbols, small ideas.</div>

<div class="hardidea">🧠 <b>Why "steepest increase"?</b> Each partial says how much the error
rises per unit nudge of that knob. Moving along the gradient spends your step where it buys
the most rise; moving against it buys the most <i>drop</i>. That is provable with the dot
product you already own: the change in f for a small step s is ≈ ∇f · s, maximized when s
aligns with ∇f (cosine similarity = 1!), most negative when opposite. The two foundations
streams just met.</div>`,
 docs:[['Khan Academy — partial derivatives & gradient','https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives']],
 quiz:{title:'Quick check',questions:[
   {q:'A partial derivative ∂f/∂w is:',
    options:['A smaller derivative','The slope of f when nudging ONLY w, holding every other knob still','The average of all slopes','Half a derivative'],answer:1,
    why:'One knob at a time — the same nudge test, with the other variables frozen. That is all ∂ means.'},
   {q:'The gradient ∇f is:',
    options:['A single number','The vector of all partial derivatives — pointing toward steepest INCREASE','Always zero','The second derivative'],answer:1,
    why:'Stack each knob\u0027s slope into a vector: the full downhill map. Descent steps against it.'},
   {q:'Why does stepping AGAINST the gradient reduce the error fastest?',
    options:['Convention','The change in f ≈ ∇f · step — most negative when the step opposes the gradient (cosine −1)','Because errors are always positive','It does not; any direction works equally'],answer:1,
    why:'The dot-product argument: alignment maximizes increase, opposition maximizes decrease. Linear algebra meets calculus.'}
 ]},
 exs:[{title:'Two knobs, one gradient — and a perfect step',
   lang:'python',
   prompt:`The error is <code>f(w, b) = (2w + b − 5)²</code> — zero exactly when
   <code>2w + b = 5</code>. Start at <code>w = 1, b = 1</code>:
   <ol>
   <li><code>dw</code> — the numerical partial wrt <code>w</code> (nudge w only, h = 1e-6; expect ≈ −8),</li>
   <li><code>db</code> — the partial wrt <code>b</code> (expect ≈ −4),</li>
   <li><code>w2, b2</code> — one gradient-descent step with lr = 0.1: <code>w − lr·dw</code>, <code>b − lr·db</code>,</li>
   <li><code>f_before, f_after</code> — the error at the start (4) and after the step — watch it collapse.</li>
   </ol>`,
   starter:`def f(w, b):
    return (2*w + b - 5) ** 2

h = 1e-6
w, b = 1.0, 1.0

f_before = f(w, b)          # (2 + 1 - 5)^2 = 4

# 1) Partial wrt w: nudge ONLY w
dw =

# 2) Partial wrt b: nudge ONLY b
db =

# 3) One step against the gradient, lr = 0.1
lr = 0.1
w2 =
b2 =

# 4) The error after the step
f_after =

print(dw, db, f_before, f_after)
`,
   solution:`def f(w, b):
    return (2*w + b - 5) ** 2

h = 1e-6
w, b = 1.0, 1.0

f_before = f(w, b)          # (2 + 1 - 5)^2 = 4

# 1) Partial wrt w: nudge ONLY w
dw = (f(w + h, b) - f(w, b)) / h

# 2) Partial wrt b: nudge ONLY b
db = (f(w, b + h) - f(w, b)) / h

# 3) One step against the gradient, lr = 0.1
lr = 0.1
w2 = w - lr * dw
b2 = b - lr * db

# 4) The error after the step
f_after = f(w2, b2)

print(dw, db, f_before, f_after)
`,
   tests:[
     {d:'∂f/∂w ≈ −8 (w is the more powerful knob — its coefficient is 2)',expr:'abs(dw - (-8)) < 0.01'},
     {d:'∂f/∂b ≈ −4',expr:'abs(db - (-4)) < 0.01'},
     {d:'the error started at 4',expr:'abs(f_before - 4) < 1e-9'},
     {d:'one gradient step nearly zeroed the error',expr:'f_after < 0.01'},
     {d:'both knobs moved uphill in value (slopes were negative)',expr:'w2 > 1.0 and b2 > 1.0'}
   ],
   hints:[
     'dw nudges only w: (f(w + h, b) - f(w, b)) / h. db nudges only b.',
     'Both partials are negative (error falls as knobs rise) — so the update w - lr*dw INCREASES w. Stepping against a negative slope means going up.',
     'Notice dw is twice db: f is twice as sensitive to w. The gradient automatically steps the powerful knob harder — that is why it beats guessing.'
   ]}]},

{id:'ca4',
 title:'Advanced: the chain rule — the seed of backpropagation',
 body:`
<div class="ground"><span class="gTag">🎯 What it does — and why it changed history</span>
<p>Models are <b>chains</b>: data flows through step after step (multiply by weights → squash
→ multiply again → … → error). To train, you need each knob's effect on the final error —
but the knob sits many steps upstream. The <b>chain rule</b> is the law that carries
sensitivity through a chain: <i>if A affects B and B affects C, then A's effect on C is the
two effects multiplied</i>. Applied backwards through a network, layer by layer, it is called
<b>backpropagation</b> — and an efficient way to do it is what un-stuck neural networks in
1986 after decades of winter. This little rule is arguably the most consequential formula in
modern AI.</p></div>

<h3>The rule, concretely</h3>
<p>Chain two functions: <code>f(x) = x²</code>, then <code>g(u) = 3u + 1</code>, so
<code>h(x) = g(f(x))</code>. The chain rule says
<code>h′(x) = g′(f(x)) · f′(x)</code> — the outer slope, <i>evaluated where the inner
function left you</i>, times the inner slope. At <code>x = 2</code>: inner slope 4, outer
slope 3, total <b>12</b>. Gears: the first gear turns the second, the second turns the third;
teeth-ratios multiply.</p>

<div class="hardidea">🧠 <b>Why this unlocked deep learning.</b> A network is a long chain,
and every weight needs its slope. Computed naively (nudge each of a billion weights, re-run
the network each time), training would take geological time. The chain rule lets ONE backward
sweep reuse the shared downstream slopes for every weight at once — the cost of roughly two
forward passes, regardless of how many knobs. Backprop is not a new kind of math; it is the
chain rule <i>organized for reuse</i>. (You will implement exactly this, in numpy, in the
Deep Learning track.)</div>

<div class="demystify"><b>Demystify "backpropagation":</b> the scary compound word means
"propagate the error signal backwards through the chain, multiplying slopes as you go."
Nothing propagates forward except predictions; nothing propagates backward except blame.
Blame, distributed by multiplication — that is the whole algorithm.</div>`,
 docs:[['3Blue1Brown — backpropagation, intuitively','https://www.3blue1brown.com/lessons/backpropagation'],['Rumelhart, Hinton & Williams (1986) — the backprop paper','https://www.nature.com/articles/323533a0']],
 quiz:{title:'Quick check',questions:[
   {q:'h(x) = g(f(x)). The chain rule says h′(x) equals:',
    options:['g′(x) + f′(x)','g′(f(x)) · f′(x) — outer slope where the inner left you, times inner slope','g(f′(x))','f′(g(x))'],answer:1,
    why:'Sensitivities multiply through a chain — and the outer slope must be evaluated at the inner function\u0027s output.'},
   {q:'Why is backpropagation cheap even with a billion weights?',
    options:['GPUs make everything free','One backward sweep REUSES the shared downstream slopes for all weights — no per-weight re-run of the network','It only trains a few weights','It skips the chain rule'],answer:1,
    why:'The naive alternative (nudge each weight, re-run) costs a forward pass per weight. Backprop shares the work: ~two passes total.'},
   {q:'Historically, an efficient chain-rule algorithm for deep nets mattered because:',
    options:['It made networks smaller','Without it, hidden-layer weights could not be blamed efficiently — a key reason neural nets stalled before 1986','It removed the need for data','It proved networks always converge'],answer:1,
    why:'No efficient blame-assignment → no deep training. The 1986 backprop paper (with earlier roots) is what unlocked everything after.'}
 ]},
 exs:[{title:'Verify the chain rule numerically — your first backward pass',
   lang:'python',
   prompt:`Chain <code>f(x) = x²</code> into <code>g(u) = 3u + 1</code>: <code>h(x) = g(f(x))</code>.
   At <code>x = 2</code> (so <code>f(2) = 4</code>):
   <ol>
   <li><code>inner</code> — the numerical slope of <code>f</code> at 2 (expect ≈ 4),</li>
   <li><code>outer</code> — the numerical slope of <code>g</code> at <code>f(2) = 4</code> (expect ≈ 3),</li>
   <li><code>chain</code> — their product (the chain rule\u0027s prediction, ≈ 12),</li>
   <li><code>direct</code> — the slope of the WHOLE chain <code>h</code> at 2, measured directly with the nudge test — it must agree with <code>chain</code>. That agreement, at scale, is backpropagation.</li>
   </ol>`,
   starter:`def f(x):
    return x * x

def g(u):
    return 3 * u + 1

def h(x):
    return g(f(x))

def derivative(fn, x):
    hh = 1e-6
    return (fn(x + hh) - fn(x)) / hh

x = 2.0

# 1) Inner slope: f at x
inner =

# 2) Outer slope: g at f(x)  — note WHERE it is evaluated
outer =

# 3) The chain rule prediction: multiply
chain =

# 4) Direct measurement of the whole chain
direct =

print(inner, outer, chain, direct)
`,
   solution:`def f(x):
    return x * x

def g(u):
    return 3 * u + 1

def h(x):
    return g(f(x))

def derivative(fn, x):
    hh = 1e-6
    return (fn(x + hh) - fn(x)) / hh

x = 2.0

# 1) Inner slope: f at x
inner = derivative(f, x)

# 2) Outer slope: g at f(x)  — note WHERE it is evaluated
outer = derivative(g, f(x))

# 3) The chain rule prediction: multiply
chain = inner * outer

# 4) Direct measurement of the whole chain
direct = derivative(h, x)

print(inner, outer, chain, direct)
`,
   tests:[
     {d:'inner slope f′(2) ≈ 4',expr:'abs(inner - 4) < 0.01'},
     {d:'outer slope g′(4) ≈ 3',expr:'abs(outer - 3) < 0.01'},
     {d:'chain-rule prediction ≈ 12',expr:'abs(chain - 12) < 0.05'},
     {d:'direct measurement agrees with the chain rule — sensitivities really do multiply',expr:'abs(direct - chain) < 0.05'}
   ],
   hints:[
     'inner = derivative(f, 2.0). outer = derivative(g, f(2.0)) — evaluated at 4, where the inner function left you.',
     'chain = inner * outer. That multiplication IS the chain rule.',
     'direct = derivative(h, 2.0). When it matches chain (~12), you have verified the law backprop is built on.'
   ]}]}
]});
