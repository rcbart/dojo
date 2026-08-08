STREAMS.push({icon:'🧰',track:'Scientific Python (after the math)',title:'The ML Toolkit: pandas, scikit-learn & plotting',blurb:'The advanced Python stream: the libraries that run real ML work — and the honest story of what Python actually does in ML.',requires:'vec3',requiresName:'NumPy: arrays & fast vectorized math',lessons:[
{id:'tk1',
 title:'Python’s real role in ML: the control room, not the engine room',
 body:`
<div class="ground"><span class="gTag">🎯 The honest story</span>
<p>Let's correct a myth before it takes root: <b>"ML is written in Python" is only half
true.</b> Python is where ML solutions are <b>prototyped, designed, and orchestrated</b> —
where you express ideas, wire pipelines, and explore data. But the actual number-crunching —
the millions of matrix multiplies — would be hopelessly slow in pure Python. The real work
runs in <b>highly optimized compiled code</b>: C and C++ inside NumPy and scikit-learn,
CUDA kernels on GPUs inside PyTorch, Fortran-descended linear-algebra libraries (BLAS/LAPACK)
underneath them all. Python is the <b>control room</b>; the engine room is compiled, parallel,
and brutally optimized for the computational demands of ML.</p></div>

<h3>Why Python then?</h3>
<p>Because thinking speed matters more than looping speed. Python is the fastest mainstream
language to <i>express an idea in</i>, and its ML ecosystem is unmatched. The division of
labor is deliberate: you write 10 readable lines; each line dispatches tons of work to
compiled kernels. When people say "NumPy is fast," they mean: <i>the Python you wrote is a
thin steering layer over a compiled engine</i>. That is also why loops over arrays are the
cardinal sin — every trip back into the Python interpreter abandons the engine.</p>

<h3>And in production?</h3>
<p>The same honesty applies at the far end: serious production systems often go further —
inference servers in C++ or Rust, models exported to optimized runtimes (ONNX, TensorRT),
specialized hardware. The pattern to internalize: <b>design and validate in Python, execute
in whatever the computation demands.</b> Knowing this makes you better at both — you will
write Python that stays on the fast path, and you will understand what the tools beneath you
are doing.</p>

<h3>The toolkit you are about to meet</h3>
<p><b>NumPy</b> (done — arrays and vectorized math), <b>pandas</b> (next lesson — labelled
tables), <b>scikit-learn</b> (the one after — classic ML with a fit/predict interface),
<b>matplotlib</b> (plotting — heavily used in the ML track ahead), and later
<b>PyTorch</b> (deep learning, Phase 2 — where the GPU story becomes central). Each is a
Python face on a compiled engine.</p>

<div class="demystify"><b>Demystify "Python is slow":</b> both things are true — the Python
<i>interpreter</i> is slow, and Python <i>programs</i> doing ML are fast — because a
well-written ML program spends ~99% of its time inside compiled kernels. The skill is keeping
it there: vectorize, batch, never loop over elements. You will measure this yourself, right
now.</div>`,
 docs:[['Why NumPy is fast (NumPy docs)','https://numpy.org/doc/stable/user/whatisnumpy.html#why-is-numpy-fast']],
 quiz:{title:'Quick check',questions:[
   {q:'The most accurate description of the role of Python in ML is:',
    options:['All ML computation happens in Python','Python is the prototyping/design/orchestration layer; the heavy computation runs in optimized compiled code (C/C++/CUDA) that Python directs','Python is only used for teaching','Python is being replaced entirely'],answer:1,
    why:'Control room vs engine room. NumPy, sklearn, and PyTorch are Python interfaces over compiled, parallel kernels.'},
   {q:'Why is looping over array elements in Python the cardinal performance sin?',
    options:['Loops are forbidden syntax','Each element-wise trip through the interpreter abandons the compiled engine; one vectorized call keeps all the work on the fast path','It uses too much memory','It only matters on GPUs'],answer:1,
    why:'The interpreter is slow per operation; the kernels are fast per million operations. Vectorizing is how you stay in the engine room.'},
   {q:'In serious production ML systems:',
    options:['Everything stays in Python end to end','Models are often exported to optimized runtimes or re-implemented (C++/Rust/TensorRT) for the computational demands of serving','Python is never involved','Production is the same as prototyping'],answer:1,
    why:'Design and validate in Python; execute in whatever the computation demands. Knowing both halves is the professional picture.'}
 ]},
 exs:[{title:'Measure the engine room: pure Python vs the compiled kernel',
   lang:'python',
   packages:['numpy'],
   prompt:`Prove the control-room/engine-room story on your own machine. With two vectors of
   500,000 numbers:
   <ol>
   <li><code>dot_loop</code> — the dot product via a pure-Python loop, timed into <code>t_loop</code> (use <code>time.perf_counter()</code>),</li>
   <li><code>dot_np</code> — the same dot product via <code>np.dot</code>, timed into <code>t_np</code>,</li>
   <li><code>agree</code> — <code>True</code> if the two answers match within <code>1e-6</code> (relative) — same math, different engine,</li>
   <li><code>speedup</code> — <code>t_loop / t_np</code>. Print it and see the engine room's advantage with your own eyes.</li>
   </ol>`,
   starter:`import numpy as np
import time

n = 500_000
a = np.arange(n, dtype=np.float64)
b = np.ones(n, dtype=np.float64)
a_list = a.tolist()
b_list = b.tolist()

# 1) Pure-Python loop, timed
t0 = time.perf_counter()
dot_loop = 0.0
# ... loop over range(n), accumulate a_list[i] * b_list[i]
t_loop = time.perf_counter() - t0

# 2) The compiled kernel, timed
t0 = time.perf_counter()
dot_np =
t_np = time.perf_counter() - t0

# 3) Same answer?
agree =

# 4) How much faster was the engine room?
speedup = t_loop / t_np

print("agree:", agree, " speedup: {:.0f}x".format(speedup))
`,
   solution:`import numpy as np
import time

n = 500_000
a = np.arange(n, dtype=np.float64)
b = np.ones(n, dtype=np.float64)
a_list = a.tolist()
b_list = b.tolist()

# 1) Pure-Python loop, timed
t0 = time.perf_counter()
dot_loop = 0.0
for i in range(n):
    dot_loop += a_list[i] * b_list[i]
t_loop = time.perf_counter() - t0

# 2) The compiled kernel, timed
t0 = time.perf_counter()
dot_np = np.dot(a, b)
t_np = time.perf_counter() - t0

# 3) Same answer?
agree = abs(dot_loop - dot_np) / abs(dot_np) < 1e-6

# 4) How much faster was the engine room?
speedup = t_loop / t_np

print("agree:", agree, " speedup: {:.0f}x".format(speedup))
`,
   tests:[
     {d:'the loop computed the true dot product (n(n-1)/2)',expr:'abs(dot_loop - (500_000*499_999/2)) / (500_000*499_999/2) < 1e-9'},
     {d:'np.dot agrees with the loop — same math, different engine',expr:'bool(agree)'},
     {d:'the compiled kernel was meaningfully faster',expr:'speedup > 3'},
     {d:'timings were actually measured (both positive)',expr:'t_loop > 0 and t_np > 0'}
   ],
   hints:[
     'The loop: for i in range(n): dot_loop += a_list[i] * b_list[i] — deliberately the slow way.',
     'dot_np = np.dot(a, b) — one call, all 500,000 multiply-adds inside the compiled kernel.',
     'agree = abs(dot_loop - dot_np) / abs(dot_np) < 1e-6. Expect a speedup in the tens-to-hundreds — that ratio IS the reason vectorization matters.'
   ]}]},

{id:'tk2',
 title:'pandas: the labelled table (your capstone, industrialized)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Remember the Python capstone — a dataset as a list of dictionaries, filtered and
aggregated by hand? <b>pandas</b> is that idea industrialized: the <b>DataFrame</b> is a
table with <i>named columns</i> and fast NumPy arrays underneath (engine room again). It is
the tool for the unglamorous 80% of real ML — loading, cleaning, joining, and summarizing
data — and the reason you did it by hand first is so none of what follows is magic.</p></div>

<h3>The moves you already know, in their industrial form</h3>
<div class="codeSample">import pandas as pd
df = pd.DataFrame({
    "name": ["Ada", "Alan", "Grace"],
    "age":  [36, 41, 45],
    "city": ["London", "London", "NYC"],
})
df["age"].mean()                  # aggregate a column        (capstone: sum/len)
df[df["city"] == "London"]        # filter rows by condition  (capstone: comprehension)
df.groupby("city")["age"].mean()  # split into groups, aggregate each — the new superpower</div>
<p>Filtering uses exactly the boolean-mask idea from NumPy — <code>df["city"] == "London"</code>
is a mask; indexing with it keeps the True rows. <b>groupby</b> is the one genuinely new move:
split the table by a key, apply an aggregate per group, get one row per group. "Average age
per city," "revenue per customer," "error rate per model" — most business questions are a
groupby.</p>

<div class="demystify"><b>Demystify "DataFrame":</b> the exotic name means "a table whose
columns have names and consistent types" — your list-of-dicts, stored column-wise in NumPy
arrays for speed. Nothing more frightening than a spreadsheet with an API.</div>`,
 docs:[['10 minutes to pandas','https://pandas.pydata.org/docs/user_guide/10min.html']],
 quiz:{title:'Quick check',questions:[
   {q:'df[df["age"] > 40] is:',
    options:['A syntax error','Boolean-mask filtering — the NumPy idea, applied to labelled rows','A groupby','A file operation'],answer:1,
    why:'The comparison builds a True/False mask per row; indexing keeps the True rows. Same concept as NumPy, now with column names.'},
   {q:'df.groupby("city")["age"].mean() computes:',
    options:['The overall mean age','One mean age PER city — split by key, aggregate per group','The number of cities','The oldest person'],answer:1,
    why:'Groupby = split-apply-combine: one row per group with its aggregate. Most reporting questions have this shape.'},
   {q:'Under the hood, a DataFrame stores its columns as:',
    options:['Python lists of dictionaries','NumPy arrays — so pandas operations run in the compiled engine room','Text files','SQL tables'],answer:1,
    why:'pandas is a labelled interface over NumPy storage — which is why vectorized pandas is fast and row-by-row loops over a DataFrame are slow.'}
 ]},
 exs:[{title:'Filter, aggregate, group — the real tool this time',
   lang:'python',
   packages:['pandas'],
   prompt:`The same people-table from your capstone, now as a DataFrame:
   <ol>
   <li><code>avg_age</code> — the mean of the <code>age</code> column (≈ 40.67),</li>
   <li><code>londoners</code> — the list of <b>names</b> where city is "London" (use a mask, then <code>.tolist()</code>),</li>
   <li><code>oldest</code> — the name of the oldest person (hint: <code>df.loc[df["age"].idxmax(), "name"]</code>),</li>
   <li><code>by_city</code> — a dict of mean age per city from a groupby (use <code>.to_dict()</code>; expect London 38.5, NYC 45.0).</li>
   </ol>`,
   starter:`import pandas as pd

df = pd.DataFrame({
    "name": ["Ada", "Alan", "Grace"],
    "age":  [36, 41, 45],
    "city": ["London", "London", "NYC"],
})

# 1) Mean age of everyone
avg_age =

# 2) Names of the Londoners (mask, then .tolist())
londoners =

# 3) Name of the oldest person
oldest =

# 4) Mean age per city, as a dict
by_city =

print(avg_age, londoners, oldest, by_city)
`,
   solution:`import pandas as pd

df = pd.DataFrame({
    "name": ["Ada", "Alan", "Grace"],
    "age":  [36, 41, 45],
    "city": ["London", "London", "NYC"],
})

# 1) Mean age of everyone
avg_age = df["age"].mean()

# 2) Names of the Londoners (mask, then .tolist())
londoners = df[df["city"] == "London"]["name"].tolist()

# 3) Name of the oldest person
oldest = df.loc[df["age"].idxmax(), "name"]

# 4) Mean age per city, as a dict
by_city = df.groupby("city")["age"].mean().to_dict()

print(avg_age, londoners, oldest, by_city)
`,
   tests:[
     {d:'avg_age ≈ 40.67 — same answer as your hand-rolled capstone',expr:'abs(avg_age - (36+41+45)/3) < 1e-9'},
     {d:'londoners is ["Ada", "Alan"]',expr:'londoners == ["Ada", "Alan"]'},
     {d:'oldest is "Grace"',expr:'oldest == "Grace"'},
     {d:'groupby gives London 38.5 and NYC 45.0',expr:'abs(by_city["London"] - 38.5) < 1e-9 and abs(by_city["NYC"] - 45.0) < 1e-9'}
   ],
   hints:[
     'Column access is df["age"]; it has .mean() directly.',
     'Mask then select: df[df["city"] == "London"]["name"].tolist().',
     'The groupby chain: df.groupby("city")["age"].mean().to_dict() — split by city, average each group, dict it.'
   ]}]},

{id:'tk3',
 title:'scikit-learn: the fit/predict interface (the math you already did, packaged)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p><b>scikit-learn</b> is the standard library of classic ML: regression, classification,
clustering, evaluation — everything the ML Track ahead teaches — behind one tiny, uniform
interface: <code>model.fit(X, y)</code> to learn, <code>model.predict(X)</code> to use.
Here is the demystifying punchline: for linear regression, <b>you have already implemented
what <code>.fit()</code> does</b> — it solves the least-squares problem from the linear
algebra stream. The library is not magic; it is the math you did, packaged, tested, and
running in the engine room (compiled solvers underneath).</p></div>

<h3>The interface that carries the whole ML track</h3>
<div class="codeSample">from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X, y)          # learn: internally solves least squares
model.coef_              # the learned slope(s)  — your w[1] from the normal equations
model.intercept_         # the learned intercept — your w[0]
model.predict([[5.0]])   # use the model on new data</div>
<p>Every scikit-learn model — trees, SVMs, clustering — speaks this same fit/predict dialect,
which is why the ML track can move fast: learn a concept, ground it, then wield it through an
interface you already know. The trailing underscore convention (<code>coef_</code>) marks
"learned from data, exists only after fit" — a small idiom worth knowing.</p>

<div class="demystify"><b>Demystify "training a model":</b> for linear regression,
<code>.fit()</code> = solve the normal equations (or an equivalent, more numerically careful
routine). You watched the residual go perpendicular with your own eyes in the linear algebra
stream; sklearn just does that reliably, at scale, for every model family. When the ML track
says "train," picture the bowl and the walk downhill — never an incantation.</div>`,
 docs:[['scikit-learn — getting started','https://scikit-learn.org/stable/getting_started.html']],
 quiz:{title:'Quick check',questions:[
   {q:'model.fit(X, y) on a LinearRegression does what, in terms you already know?',
    options:['Something proprietary and unknowable','Solves the least-squares problem — the normal equations you implemented in the linear algebra stream','Downloads a pretrained model','Sorts the data'],answer:1,
    why:'The library packages the exact math you did by hand: minimize squared error, residual perpendicular to features.'},
   {q:'The trailing underscore in coef_ and intercept_ signals:',
    options:['A typo','"Learned from data — exists only after .fit()" — the sklearn naming idiom','A private variable you must not read','A deprecated feature'],answer:1,
    why:'Parameters estimated by fitting get the underscore; settings you chose (hyperparameters) do not. A tiny convention that reads whole codebases.'},
   {q:'Why does every sklearn model sharing fit/predict matter for learning ML?',
    options:['It does not matter','One interface, many models: each new concept in the ML track plugs into a dialect you already speak','It makes all models identical inside','It removes the need to understand concepts'],answer:1,
    why:'Uniformity separates the concept (what a tree or SVM does) from the mechanics (how to run one) — so lessons focus on the concept.'}
 ]},
 exs:[{title:'Your normal equations vs sklearn — same numbers, engine-room edition',
   lang:'python',
   packages:['scikit-learn','numpy'],
   prompt:`Use the exact data from the least-squares lesson: <code>x = [1, 2, 3, 4]</code>,
   <code>y = [3.1, 4.9, 7.2, 8.8]</code>:
   <ol>
   <li><code>w</code> — your normal-equations solution <code>(XᵀX)⁻¹Xᵀy</code> (as before: ≈ [1.15, 1.94]),</li>
   <li><code>model</code> — a fitted <code>LinearRegression</code> (note: sklearn wants <code>x</code> as a column, <code>x.reshape(-1, 1)</code>),</li>
   <li><code>slope, intercept</code> — <code>model.coef_[0]</code> and <code>model.intercept_</code> — they must match your w,</li>
   <li><code>pred_5</code> — <code>model.predict</code> at x = 5 (≈ 10.85, same as your by-hand prediction).</li>
   </ol>
   When the numbers agree, you have demystified <code>.fit()</code> forever.`,
   starter:`import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.1, 4.9, 7.2, 8.8])

# 1) Your normal equations (column of 1s + x)
X = np.column_stack([np.ones(4), x])
w =

# 2) The library: fit on x as a column
model = LinearRegression()
# ... fit it on x.reshape(-1, 1) and y

# 3) What the library learned
slope =
intercept =

# 4) Predict at x = 5
pred_5 = float(model.predict(np.array([[5.0]]))[0])

print(w, slope, intercept, pred_5)
`,
   solution:`import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.1, 4.9, 7.2, 8.8])

# 1) Your normal equations (column of 1s + x)
X = np.column_stack([np.ones(4), x])
w = np.linalg.inv(X.T @ X) @ X.T @ y

# 2) The library: fit on x as a column
model = LinearRegression()
model.fit(x.reshape(-1, 1), y)

# 3) What the library learned
slope = model.coef_[0]
intercept = model.intercept_

# 4) Predict at x = 5
pred_5 = float(model.predict(np.array([[5.0]]))[0])

print(w, slope, intercept, pred_5)
`,
   tests:[
     {d:'your normal equations give w ≈ [1.15, 1.94]',expr:'abs(w[0] - 1.15) < 0.01 and abs(w[1] - 1.94) < 0.01'},
     {d:'the sklearn slope matches your w[1]',expr:'abs(slope - w[1]) < 1e-8'},
     {d:'the sklearn intercept matches your w[0]',expr:'abs(intercept - w[0]) < 1e-8'},
     {d:'prediction at x=5 ≈ 10.85 — the library IS the math you did',expr:'abs(pred_5 - 10.85) < 0.01'}
   ],
   hints:[
     'w = np.linalg.inv(X.T @ X) @ X.T @ y — copied straight from the least-squares lesson.',
     'model.fit(x.reshape(-1, 1), y) — sklearn expects a 2-D X (n samples × m features), hence the reshape.',
     'slope = model.coef_[0]; intercept = model.intercept_. If they match w to 8 decimals, .fit() has no secrets left.'
   ]}]},

{id:'tk4',
 title:'matplotlib: seeing your data (your first real plot, rendered right here)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>In ML, <b>if you have not plotted your data, you do not know your data</b>. Summary
numbers lie by omission (four wildly different datasets can share identical means, variances,
and correlations — the famous Anscombe quartet); a plot exposes in one glance what tables
hide: curvature, outliers, clusters, nonsense. <b>matplotlib</b> is Python's standard
plotting library — pandas and seaborn draw <i>through</i> it — and from this lesson on,
your plots render <b>directly below your code</b>, exactly like a real notebook.</p></div>

<h3>The 90% you will actually use</h3>
<div class="codeSample">import matplotlib.pyplot as plt     # THE conventional alias

plt.scatter(x, y)                   # points — data as it really is
plt.plot(x, line_y, color="red")    # a line — e.g. your model's fit
plt.xlabel("size (100m²)")          # ALWAYS label your axes
plt.ylabel("price (100k)")
plt.title("Housing: data vs fitted line")</div>
<p><code>scatter</code> for raw data points, <code>plot</code> for lines (fits, trends,
loss curves), plus histograms (<code>hist</code>) for distributions — those three cover the
vast majority of working ML plotting: exploratory looks, model-vs-data comparisons, and
training curves. The labels are not decoration; an unlabeled plot is a bug in professional
work.</p>

<div class="demystify"><b>Demystify "the figure":</b> matplotlib holds an invisible canvas
(the <i>figure</i>) that your commands draw onto; <code>show()</code> — or MLDojo's runner —
renders it when you are done. That is why calls stack: scatter, then plot, then labels all
land on the same canvas until it is displayed.</div>`,
 docs:[['matplotlib — quick start','https://matplotlib.org/stable/users/explain/quick_start.html'],['Anscombe quartet — why plotting matters','https://en.wikipedia.org/wiki/Anscombe%27s_quartet']],
 quiz:{title:'Quick check',questions:[
   {q:'Why plot data when you already have its mean, variance, and correlation?',
    options:['Plots are just prettier','Summary statistics hide structure — completely different datasets can share identical summaries (Anscombe); a plot exposes shape, outliers, clusters','You should not; numbers suffice','Only for presentations'],answer:1,
    why:'The quartet is the canonical proof: same stats, wildly different data. Looking is not optional in real ML work.'},
   {q:'plt.scatter vs plt.plot:',
    options:['They are identical','scatter draws individual data points; plot draws connected lines (fits, trends, curves)','plot is 3-D only','scatter is deprecated'],answer:1,
    why:'Points for raw data, lines for models and trends — overlaying both is the classic "did my fit capture the data?" picture.'},
   {q:'The conventional import for matplotlib is:',
    options:['import matplotlib','import matplotlib.pyplot as plt — the alias every ML codebase uses','from matplotlib import *','import pyplot'],answer:1,
    why:'Like np and pd, plt is a universal convention — reading ML code anywhere assumes you know it.'}
 ]},
 exs:[{title:'Plot the housing data and your fitted line — and see it render',
   lang:'python',
   packages:['matplotlib','numpy'],
   prompt:`Bring the least-squares story to life visually:
   <ol>
   <li>With <code>x = [1, 2, 3, 4]</code>, <code>y = [3.1, 4.9, 7.2, 8.8]</code>, get <code>slope, intercept</code> from <code>np.polyfit(x, y, 1)</code> (yet another route to ≈ 1.94 and 1.15),</li>
   <li><code>line_y</code> — the fitted line's values <code>slope * x + intercept</code>,</li>
   <li>Draw the <b>scatter</b> of the data AND the <b>line</b> of the fit on one canvas,</li>
   <li>Label both axes and set a title — then Run, and your plot appears below the console output.</li>
   </ol>`,
   starter:`import numpy as np
import matplotlib.pyplot as plt

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.1, 4.9, 7.2, 8.8])

# 1) Fit a line (degree 1 polynomial): returns [slope, intercept]
slope, intercept = np.polyfit(x, y, 1)

# 2) The fitted line's y-values
line_y =

# 3) Scatter the data, then plot the fitted line over it

# 4) Labels and title (an unlabeled plot is a bug!)

print("slope:", round(slope, 2), " intercept:", round(intercept, 2))
`,
   solution:`import numpy as np
import matplotlib.pyplot as plt

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.1, 4.9, 7.2, 8.8])

# 1) Fit a line (degree 1 polynomial): returns [slope, intercept]
slope, intercept = np.polyfit(x, y, 1)

# 2) The fitted line's y-values
line_y = slope * x + intercept

# 3) Scatter the data, then plot the fitted line over it
plt.scatter(x, y)
plt.plot(x, line_y, color="red")

# 4) Labels and title (an unlabeled plot is a bug!)
plt.xlabel("size (100 m2)")
plt.ylabel("price (100k)")
plt.title("Housing: data vs fitted line")

print("slope:", round(slope, 2), " intercept:", round(intercept, 2))
`,
   tests:[
     {d:'polyfit found the familiar slope ≈ 1.94',expr:'abs(slope - 1.94) < 0.01'},
     {d:'line_y is the fitted line evaluated at the data points',expr:'abs(line_y[0] - (slope*1 + intercept)) < 1e-9 and len(line_y) == 4'},
     {d:'a figure exists with the scatter (points) drawn',expr:'len(plt.get_fignums()) == 1 and len(plt.gca().collections) >= 1'},
     {d:'the fitted line is drawn on the same canvas',expr:'len(plt.gca().lines) >= 1'},
     {d:'axes are labeled and the plot is titled',expr:'plt.gca().get_xlabel() != "" and plt.gca().get_ylabel() != "" and plt.gca().get_title() != ""'}
   ],
   hints:[
     'line_y = slope * x + intercept — broadcasting evaluates the line at all four x values at once.',
     'Two draw calls on one canvas: plt.scatter(x, y) then plt.plot(x, line_y, color="red").',
     'plt.xlabel("..."), plt.ylabel("..."), plt.title("...") — then Run and look below the console: that image is your figure, rendered by MLDojo exactly like a notebook would.'
   ]}]}
]});
