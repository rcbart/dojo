STREAMS.push({icon:'🧭',track:'Start Here',title:'Orientation: the words before the work',blurb:'A short map of the machine-learning ideas the foundations keep borrowing — so nothing is ever referenced before you have met it.',lessons:[
{id:'ml0',
 title:'What machine learning is — and what "error" really means',
 body:`
<div class="ground"><span class="gTag">🎯 Why this comes before everything</span>
<p>The math streams ahead (linear algebra, calculus, probability) keep pointing at machine
learning to explain <i>why</i> the math matters — "this is how a model reduces its <b>error</b>,"
"this is how it <b>learns</b>." That is only fair if you already know those words. So before any
math, here is the map: the handful of ML terms the foundations borrow, in plain English. We are
not teaching ML yet — the full ML track comes after the foundations. This is just so no idea is
ever used before you have met it.</p></div>

<h3>The five words the whole course leans on</h3>
<p><b>Model</b> — the thing machine learning produces: a function with adjustable <b>knobs</b>
(also called <i>parameters</i> or <i>weights</i>). Turn the knobs, and it computes different
answers. <b>Prediction</b> — the model's answer for a given input (a predicted house price, a
guess of "spam" or "not spam"). <b>Features</b> — the inputs you feed it (a house's size, age,
location — the columns of your data). <b>Label</b> (or <b>target</b>) — the true answer you
want it to predict (the actual sale price). <b>Training</b> (or <b>learning</b>) — the process
of adjusting the knobs so the predictions get closer to the labels. That is the entire loop,
and every algorithm in the ML track is a variation on it.</p>

<h3>The centerpiece: what "error" means in ML</h3>
<p>Say a model predicts a house will sell for <b>180k</b> and it actually sells for <b>200k</b>.
The model was <b>wrong by 20k</b>. That gap — <i>prediction minus reality</i> — is the
<b>error</b> (for a single example it is also called the <b>residual</b>). Error is not a bug
or a crash; it is simply <b>a number measuring how wrong a prediction is</b>.</p>
<p>A model makes <i>many</i> predictions, so we need one number for "how wrong overall." That
single summary is the <b>loss</b> (also called the <b>cost</b>, or <b>objective</b> — three
words, same thing). The most common one is <b>Mean Squared Error (MSE)</b>: take every gap,
<b>square it</b>, and average. Why squared? Briefly (the full answer is a whole lesson later):
so that overshoots and undershoots do not cancel out, and so that big misses count much more
than small ones.</p>
<p>Now the payoff — this single idea unlocks the math streams. Every time you read
<b>"reduce the error," "minimize the loss," or "gradient descent"</b> in the coming lessons, it
means exactly one thing: <b>turn the model's knobs until that number is as small as possible.</b>
Linear algebra will give us a way to compute predictions in bulk; calculus will give us a way to
find which direction shrinks the error; probability will tell us what "as small as possible"
should even mean. All three are in service of this.</p>

<div class="demystify"><b>Critical: "error" has TWO meanings in this course — never mix them.</b>
(1) A <b>program error</b> — a bug that stops your code from running (Python's
<code>IndentationError</code>, <code>ValueError</code>, a crash). You will learn to read these
in the Python stream's "Reading errors" lesson. (2) A <b>model error</b> — how wrong a
perfectly-working model's predictions are. A program with zero bugs can still have enormous
model error. When the math streams say "reduce the error," they always mean the <i>model</i>
kind. When they say "read the error message," they mean the <i>program</i> kind. Same word,
two worlds.</div>

<h3>What it looks like as a number (you will write this yourself soon)</h3>
<div class="codeSample"># predictions the model made, and the actual answers
predictions = [180, 150, 310]
actuals     = [200, 140, 300]

# the error (residual) for each: prediction - actual
residuals = [-20, 10, 10]          # off by 20 low, 10 high, 10 high

# one number for "how wrong overall" — Mean Squared Error
# average of the squared residuals:
# (400 + 100 + 100) / 3 = 200.0   ← this is the loss training shrinks</div>
<p>You do not need to write that yet — the Python stream teaches you how. For now, just hold
the idea: <b>error is how wrong; loss is how wrong overall; training makes it small.</b></p>`,
 docs:[['A visual, non-technical intro to ML','https://mlu-explain.github.io/']],
 quiz:{title:'Quick check — the vocabulary',questions:[
   {q:'In machine learning, the "error" of a prediction is:',
    options:['A bug that crashes the program mid-run','The gap between the prediction and the truth','A missing or corrupted data file','The time the program takes to run'],answer:1,
    why:'Error = prediction minus reality. For one example it is the residual; averaged and squared across all of them it becomes the loss (MSE).'},
   {q:'When a later math lesson says "gradient descent reduces the error," it means:',
    options:['It fixes bugs in your code','It turns the model\u2019s knobs to shrink the loss','It hides the error messages from you','It makes the program run much faster'],answer:1,
    why:'"Reduce the error" = shrink the model error (loss) by adjusting the parameters. That is what training is.'},
   {q:'A "loss" or "cost" function is:',
    options:['The price you paid for the software licence','A single score of how wrong the model is','A particular kind of program crash or exception','The number of input features in the dataset'],answer:1,
    why:'Loss = cost = objective: a single score of overall wrongness. MSE is the most common example.'},
   {q:'A program with no bugs at all:',
    options:['Must therefore have zero model error','Can still have large model error anyway','Cannot be trained on any data','Will never produce any predictions'],answer:1,
    why:'Working code and an accurate model are separate things. The math streams always mean model error; "read the error" means the program kind.'}
 ]}}
]});
