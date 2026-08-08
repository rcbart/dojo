STREAMS.push({icon:'🤖',track:'ML & AI Track',title:'Classic Machine Learning: Your First Models',blurb:'The payoff. Everything the foundations built — vectors, gradients, probability — now becomes real models that learn from data. Built by hand, then the one-line library version.',requires:'tk4',requiresName:'the ML Toolkit (pandas, scikit-learn, plotting)',lessons:[
{id:'mlwhat',
 title:'What machine learning actually is: the fit → predict → evaluate loop',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>You met the words in Orientation; now we make them real. <b>Machine learning is learning a
function from examples.</b> Instead of you writing rules ("if the email says FREE MONEY, it is
spam"), you show the computer many labelled examples and it <i>finds the rule itself</i> by
tuning knobs to reduce error. Every classic model — regression, classification, trees — is a
variation on one loop: <b>fit, predict, evaluate.</b></p></div>

<h3>The three words made concrete</h3>
<p><b>fit</b> (a.k.a. train): show the model the <i>training data</i> — features
<code>X</code> and their true labels <code>y</code> — and let it tune its knobs to match.
<b>predict</b>: give the trained model new features and it outputs its guess. <b>evaluate</b>:
measure how wrong those guesses are (the error/loss) — ideally on data it has <i>never seen</i>,
so you know it will work in the real world, not just memorize.</p>
<div class="codeSample">model.fit(X_train, y_train)     # learn from labelled examples
preds = model.predict(X_test)   # guess on new data
error = mse(preds, y_test)      # how wrong were the guesses?</div>
<p>That <code>fit/predict</code> shape is the exact scikit-learn interface you met — and it is
the same whether the model is a line, a tree, or a neural network. Learn the loop once, use it
everywhere.</p>

<h3>Weights: the knobs, grounded (as promised)</h3>
<p>A model is a function with adjustable numbers called <b>weights</b> (or parameters). For a
straight-line model <code>prediction = w · feature + b</code>, the weight <code>w</code> is
<b>how much that feature counts</b> toward the prediction, and <code>b</code> (the <b>bias</b>
or intercept) is the baseline. Reading a weight: its <b>sign</b> says whether more of the
feature pushes the prediction up or down, its <b>size</b> says how strongly. "+18k per bedroom,
−900 per year of age" — those numbers <i>are</i> the weights. Training is nothing but searching
for the weights that make the error small. ("Weight," "parameter," and "coefficient" are three
words for the same thing — <code>model.coef_</code> in scikit-learn.)</p>

<h3>Regression vs classification</h3>
<p>Two flavours cover most of classic ML: <b>regression</b> predicts a <i>number</i> (house
price, temperature) — the demystified name just means "predict a continuous value"; and
<b>classification</b> predicts a <i>category</i> (spam / not-spam, cat / dog). Same fit/predict
loop; different kind of answer, and a different way to measure error (squared error for numbers,
accuracy for categories). You will build one of each in this stream.</p>

<div class="demystify"><b>Demystify "a model":</b> not a mind, not magic — a <b>function with
tunable numbers</b>, plus a procedure for tuning them to fit data. When you hear "we trained a
model," picture: we searched for the weights that made the error small. Everything else is
which function and which search.</div>`,
 docs:[['scikit-learn — an intro to machine learning','https://scikit-learn.org/stable/tutorial/basic/tutorial.html']],
 quiz:{title:'Quick check',questions:[
   {q:'The core loop of a classic ML model is:',
    options:['Download, install, run','fit (learn from labelled examples) → predict (guess on new data) → evaluate (measure the error)','Compile, link, execute','Guess randomly forever'],answer:1,
    why:'Fit tunes the weights on training data; predict applies them to new data; evaluate measures how wrong — ideally on unseen data.'},
   {q:'In prediction = w · feature + b, the weight w is:',
    options:['The number of features','How much the feature counts toward the prediction — its sign is the direction, its size the strength','The error','Always 1'],answer:1,
    why:'Weights (= parameters = coefficients) are the knobs training tunes. "+18k per bedroom" is a weight. b is the baseline (bias/intercept).'},
   {q:'Predicting a house PRICE is regression; predicting SPAM/not-spam is:',
    options:['Also regression','Classification — the answer is a category, not a number','Clustering','Not machine learning'],answer:1,
    why:'Regression predicts a continuous number; classification predicts a category. Same fit/predict loop, different answer type and error measure.'}
 ]},
 exs:[{title:'Be the model: predict, then measure the error',
   lang:'python',
   prompt:`Four houses, feature = size, label = price: <code>sizes = [1, 2, 3, 4]</code>,
   <code>prices = [3, 5, 7, 9]</code>. A linear model predicts <code>price = w*size + b</code>.
   <ol>
   <li>With <code>w = 2, b = 1</code>, compute <code>preds</code> for every size (a list),</li>
   <li><code>mse</code> — the mean squared error between <code>preds</code> and <code>prices</code> (this model is perfect, so 0.0),</li>
   <li>a <b>baseline</b> model that ignores size and always predicts the mean price: <code>base_pred</code> = mean(prices), and <code>base_mse</code> — the MSE of always guessing that (should be 5.0),</li>
   <li><code>beats_baseline</code> — <code>True</code> if the linear model's mse is lower than the baseline's (a good model beats "just guess the average").</li>
   </ol>`,
   starter:`sizes = [1, 2, 3, 4]
prices = [3, 5, 7, 9]
w, b = 2, 1

# 1) predictions of the linear model
preds =

# 2) mean squared error vs the true prices
mse =

# 3) baseline: always predict the average price
base_pred = sum(prices) / len(prices)
base_mse =

# 4) does the model beat the baseline?
beats_baseline =

print(preds, mse, base_pred, base_mse, beats_baseline)
`,
   solution:`sizes = [1, 2, 3, 4]
prices = [3, 5, 7, 9]
w, b = 2, 1

# 1) predictions of the linear model
preds = [w * s + b for s in sizes]

# 2) mean squared error vs the true prices
mse = sum((preds[i] - prices[i]) ** 2 for i in range(len(prices))) / len(prices)

# 3) baseline: always predict the average price
base_pred = sum(prices) / len(prices)
base_mse = sum((base_pred - prices[i]) ** 2 for i in range(len(prices))) / len(prices)

# 4) does the model beat the baseline?
beats_baseline = mse < base_mse

print(preds, mse, base_pred, base_mse, beats_baseline)
`,
   tests:[
     {d:'the model predicts [3, 5, 7, 9] — exactly right here',expr:'preds == [3, 5, 7, 9]'},
     {d:'its MSE is 0.0 (a perfect fit on this data)',expr:'abs(mse) < 1e-9'},
     {d:'the baseline always guesses the mean price 6.0',expr:'abs(base_pred - 6.0) < 1e-9'},
     {d:'the baseline MSE is 5.0 — worse than the model',expr:'abs(base_mse - 5.0) < 1e-9'},
     {d:'the model beats the baseline',expr:'beats_baseline == True'}
   ],
   hints:[
     'preds = [w * s + b for s in sizes] — apply the line to every size.',
     'MSE = average of (pred - actual) squared: sum((preds[i]-prices[i])**2 ...) / len.',
     'The baseline predicts the same mean for everyone; a real model uses the feature and does better.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> A model predicts salary from years of experience as <code>salary = 5·years + 30</code> (in thousands). What does the weight 5 mean, and what does the 30 mean? Predict the salary for 4 years.`,
    solution:`The <b>weight 5</b> means each extra year of experience adds <b>5k</b> to the predicted salary (positive → more experience, higher pay; size 5 → the strength). The <b>30</b> is the <b>bias/baseline</b>: the predicted salary at 0 years (a starting point). Prediction at 4 years: <code>5·4 + 30 = 50</code> → <b>50k</b>.`},
   {q:`<b>2. (Concept)</b> Why do we evaluate a model on data it has never seen (a test set) instead of the data it trained on?`,
    solution:`Because doing well on the training data is easy and misleading — a model can <b>memorize</b> those exact examples without learning the real pattern (overfitting), then fail on anything new. The whole point of a model is to work on <b>future, unseen</b> data, so we hold out a test set to get an honest estimate of that. Low training error but high test error is the classic warning sign.`}
 ]}},

{id:'mllinreg',
 title:'Linear regression: teaching a line to fit data (gradient descent from scratch)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p><b>Linear regression</b> is the "hello world" of ML: fit the best straight line through your
data, then use it to predict. It is where <i>all</i> the foundations finally click together —
the line is a dot product (linear algebra), the error is MSE (probability/loss), and finding
the best weights is gradient descent (calculus). You are about to train a real model with
nothing but what you already know.</p></div>

<h3>The model, the loss, the learning</h3>
<p><b>Model:</b> <code>prediction = w · x + b</code> — a line with two knobs, the slope
<code>w</code> and intercept <code>b</code>. <b>Loss:</b> the mean squared error, how wrong the
line is on average. <b>Learning:</b> gradient descent — nudge <code>w</code> and <code>b</code>
downhill on the loss until it stops improving. The gradients (the slopes of the MSE with
respect to each knob) are, by the calculus you did:</p>
<div class="mathblock">error_i = (w·xᵢ + b) − yᵢ            (how wrong on example i)

∂Loss/∂w = (2/n) · Σ errorᵢ · xᵢ      (nudge for the slope)
∂Loss/∂b = (2/n) · Σ errorᵢ           (nudge for the intercept)</div>
<p>Then the update is the gradient-descent step you already wrote: <code>w -= lr · ∂Loss/∂w</code>
and <code>b -= lr · ∂Loss/∂b</code>. Repeat, and the line walks toward the data.</p>

<div class="worked"><b>✍️ One step by hand.</b> Data <code>x=[1,2], y=[3,5]</code>, start
<code>w=0, b=0</code>, so both predictions are 0 and errors are <code>[0−3, 0−5] = [−3, −5]</code>.
<div class="mathblock">∂Loss/∂w = (2/2)·((−3)(1) + (−5)(2)) = (−3 − 10) = −13
∂Loss/∂b = (2/2)·((−3) + (−5))       = −8</div>
With <code>lr = 0.1</code>: <code>w ← 0 − 0.1·(−13) = 1.3</code>, <code>b ← 0 − 0.1·(−8) = 0.8</code>.
Both knobs moved up (the line was too low). Repeat a few hundred times and it converges to the
best-fit line.</div>

<div class="demystify"><b>Demystify "regression":</b> the confusing name is Galton's historical
accident ("regression to the mean") — today it simply means <b>predict a number</b>. And the
sklearn one-liner <code>LinearRegression().fit(X, y)</code> does exactly the training loop you
are about to write (via the closed-form normal equations from the linear-algebra stream); the
from-scratch version is how you <i>understand</i> what that one line does.</p></div>`,
 docs:[['scikit-learn — LinearRegression','https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html']],
 quiz:{title:'Quick check',questions:[
   {q:'Linear regression finds its weights by:',
    options:['Trying every possible line','Gradient descent (or the closed-form normal equations) — nudging w and b downhill on the MSE loss','Sorting the data','Random guessing'],answer:1,
    why:'The line has two knobs; training walks them down the loss surface (gradient descent) or solves the normal equations directly.'},
   {q:'The gradient ∂Loss/∂w for MSE is (2/n)·Σ(errorᵢ·xᵢ). What is errorᵢ?',
    options:['The true label yᵢ','The prediction minus the actual: (w·xᵢ + b) − yᵢ','Always zero','The learning rate'],answer:1,
    why:'Error is prediction − actual. Multiplying it by xᵢ and averaging gives the slope of the loss in the w-direction — the nudge.'},
   {q:'If after training the loss stops decreasing, it means:',
    options:['The code crashed','The line has settled near the bottom of the loss bowl — the best-fit weights','The learning rate is 0','There is no data'],answer:1,
    why:'A flat loss means the gradient is ~0 — you are at the minimum, the best line the model can draw.'}
 ]},
 exs:[{title:'Train a linear regression by gradient descent',
   lang:'python',
   prompt:`Data (true line is <code>y = 2x + 1</code>): <code>x = [1, 2, 3, 4]</code>,
   <code>y = [3, 5, 7, 9]</code>. Start <code>w = 0.0, b = 0.0</code>, learning rate
   <code>lr = 0.01</code>, and run <b>2000</b> steps of gradient descent:
   <ol>
   <li>each step: compute <code>preds</code>, the <code>errors</code> (pred − y), then the two gradients <code>dw</code> and <code>db</code> from the formulas, and update w and b,</li>
   <li>after training, <code>w</code> ≈ 2 and <code>b</code> ≈ 1,</li>
   <li><code>pred_5</code> — the trained model's prediction at x = 5 (≈ 11),</li>
   <li><code>final_mse</code> — the mean squared error after training (≈ 0).</li>
   </ol>`,
   starter:`x = [1.0, 2.0, 3.0, 4.0]
y = [3.0, 5.0, 7.0, 9.0]
n = len(x)
w, b, lr = 0.0, 0.0, 0.01

for step in range(2000):
    preds = [w * x[i] + b for i in range(n)]
    errors = [preds[i] - y[i] for i in range(n)]
    dw = (2 / n) * sum(errors[i] * x[i] for i in range(n))
    db = (2 / n) * sum(errors[i] for i in range(n))
    # update the two knobs against their gradients
    w =
    b =

pred_5 =
final_mse = sum((w * x[i] + b - y[i]) ** 2 for i in range(n)) / n

print(round(w, 3), round(b, 3), round(pred_5, 3), round(final_mse, 6))
`,
   solution:`x = [1.0, 2.0, 3.0, 4.0]
y = [3.0, 5.0, 7.0, 9.0]
n = len(x)
w, b, lr = 0.0, 0.0, 0.01

for step in range(2000):
    preds = [w * x[i] + b for i in range(n)]
    errors = [preds[i] - y[i] for i in range(n)]
    dw = (2 / n) * sum(errors[i] * x[i] for i in range(n))
    db = (2 / n) * sum(errors[i] for i in range(n))
    # update the two knobs against their gradients
    w = w - lr * dw
    b = b - lr * db

pred_5 = w * 5 + b
final_mse = sum((w * x[i] + b - y[i]) ** 2 for i in range(n)) / n

print(round(w, 3), round(b, 3), round(pred_5, 3), round(final_mse, 6))
`,
   tests:[
     {d:'the learned slope w is ≈ 2',expr:'abs(w - 2.0) < 0.05'},
     {d:'the learned intercept b is ≈ 1',expr:'abs(b - 1.0) < 0.1'},
     {d:'the trained model predicts ≈ 11 at x = 5',expr:'abs(pred_5 - 11.0) < 0.1'},
     {d:'the final MSE is tiny — the line fits',expr:'final_mse < 0.01'}
   ],
   hints:[
     'The update is the gradient-descent step from calculus: w = w - lr * dw, and b = b - lr * db.',
     'Everything else is provided — the loop already computes preds, errors, and the two gradients.',
     'After 2000 small steps the line converges to y = 2x + 1, so pred_5 = 2·5 + 1 = 11.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> Data <code>x=[1,2], y=[3,5]</code>, current <code>w=1, b=0</code>. Compute the predictions, the errors (pred − y), and the gradient <code>∂Loss/∂w = (2/n)·Σ(errorᵢ·xᵢ)</code> by hand.`,
    solution:`Predictions: <code>w·x + b = [1·1+0, 1·2+0] = [1, 2]</code>. Errors (pred − y): <code>[1−3, 2−5] = [−2, −3]</code>.<br>
    <code>∂Loss/∂w = (2/2)·((−2)(1) + (−3)(2)) = (−2 − 6) = <b>−8</b></code>. It is negative, so gradient descent will <b>increase</b> w (the line is too shallow/low), moving it toward the data — exactly what you want.`},
   {q:`<b>2. (Concept)</b> The learning rate is 0.01 and training took 2000 steps. What happens if you make the learning rate far too big (say 5.0)?`,
    solution:`With too large a learning rate, each step <b>overshoots</b> the bottom of the loss bowl and lands farther up the other side. The weights bounce around and the loss <b>grows instead of shrinking</b> (it diverges) — you will see w and b explode to huge or NaN values. The rate must be small enough that each step actually descends. Too small, though, and it converges very slowly — choosing it is a real practical skill.`}
 ]}},

{id:'mlclass',
 title:'Classification with logistic regression: turning a score into a decision',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Now predict a <b>category</b>, not a number: is this email spam? <b>Logistic regression</b>
takes the same linear score <code>w·x + b</code> as before, then squashes it through the
<b>sigmoid</b> into a probability between 0 and 1 — "0.93 spam" — and decides by a threshold
(usually 0.5). It is the workhorse first classifier, and the direct ancestor of a neural
network's output layer.</p></div>

<h3>Score → probability → decision</h3>
<p><b>Step 1 — score:</b> <code>z = w·x + b</code>, exactly the linear model. <b>Step 2 —
probability:</b> <code>p = sigmoid(z) = 1 / (1 + e^(−z))</code> — the S-curve (from the
functions lesson) maps any score into (0, 1). A big positive score → near 1; big negative →
near 0; zero → exactly 0.5. <b>Step 3 — decision:</b> predict class 1 (spam) if
<code>p ≥ 0.5</code>, else class 0. Because sigmoid(0) = 0.5, the decision flips exactly where
the score <code>z</code> crosses 0 — that line is the <b>decision boundary</b>.</p>

<div class="worked"><b>✍️ Worked by hand.</b> One feature: number of spammy words. Weights
<code>w = 1, b = −3</code>, so <code>z = x − 3</code>. An email with 5 spammy words:
<div class="mathblock">z = 5 − 3 = 2
p = 1 / (1 + e^(−2)) = 1 / (1 + 0.135) ≈ 0.88   →  p ≥ 0.5, predict SPAM</div>
An email with 1 spammy word: <code>z = −2</code>, <code>p ≈ 0.12</code> → predict NOT spam. The
boundary sits at <code>x = 3</code> (where <code>z = 0, p = 0.5</code>).</div>

<div class="demystify"><b>Demystify "logistic regression":</b> the name lies twice over — it
does <b>classification</b>, not regression, and there is nothing scary about it: it is linear
regression's score passed through the sigmoid to become a probability. Why not just use a line
for 0/1 labels? Because a line gives −4 or 7.2 — nonsense as a probability; the sigmoid keeps
the answer honestly between 0 and 1. (And its loss is cross-entropy, not MSE — the log-loss you
met in the logarithms stream.)</div>`,
 docs:[['scikit-learn — LogisticRegression','https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html']],
 quiz:{title:'Quick check',questions:[
   {q:'Logistic regression turns the linear score w·x + b into a class by:',
    options:['Rounding it to the nearest integer','Passing it through the sigmoid to get a probability in (0,1), then thresholding at 0.5','Taking its absolute value','Sorting the scores'],answer:1,
    why:'Score → sigmoid → probability → decision. The sigmoid keeps the output a valid probability; 0.5 is the usual cut.'},
   {q:'Despite its name, logistic regression performs:',
    options:['Regression (predicting a number)','Classification (predicting a category) — the "regression" in the name is misleading','Clustering','Sorting'],answer:1,
    why:'It predicts a category via a probability. The name is a historical quirk; it is a classifier.'},
   {q:'The decision boundary of logistic regression sits where:',
    options:['x = 0 always','the score z = w·x + b crosses 0, i.e. the probability = 0.5','the data ends','the largest feature is'],answer:1,
    why:'sigmoid(0) = 0.5, so the class flips exactly where the linear score is zero — that is the boundary.'}
 ]},
 exs:[{title:'Build a spam classifier with logistic regression',
   lang:'python',
   prompt:`One feature = number of spammy words. Weights <code>w = 1.0, b = -3.0</code>, so
   score <code>z = w*x + b</code>. Emails <code>xs = [0, 2, 4, 5]</code> with true labels
   <code>labels = [0, 0, 1, 1]</code> (1 = spam):
   <ol>
   <li>write <code>sigmoid(z)</code> = <code>1 / (1 + math.exp(-z))</code>,</li>
   <li><code>probs</code> — the spam probability for each email,</li>
   <li><code>preds</code> — the class for each: 1 if prob ≥ 0.5 else 0,</li>
   <li><code>accuracy</code> — the fraction of predictions that match the true labels (expect 1.0 — all correct here).</li>
   </ol>`,
   starter:`import math

def sigmoid(z):
    pass

xs = [0, 2, 4, 5]
labels = [0, 0, 1, 1]
w, b = 1.0, -3.0

probs = [sigmoid(w * x + b) for x in xs]
preds =
accuracy =

print([round(p, 3) for p in probs], preds, accuracy)
`,
   solution:`import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

xs = [0, 2, 4, 5]
labels = [0, 0, 1, 1]
w, b = 1.0, -3.0

probs = [sigmoid(w * x + b) for x in xs]
preds = [1 if p >= 0.5 else 0 for p in probs]
accuracy = sum(1 for i in range(len(labels)) if preds[i] == labels[i]) / len(labels)

print([round(p, 3) for p in probs], preds, accuracy)
`,
   tests:[
     {d:'sigmoid(0) is 0.5 (the middle of the S-curve)',expr:'abs(sigmoid(0) - 0.5) < 1e-9'},
     {d:'the probabilities rise with more spammy words',expr:'probs[0] < probs[1] < probs[2] < probs[3]'},
     {d:'predictions are [0, 0, 1, 1] (boundary at 3 spammy words)',expr:'preds == [0, 0, 1, 1]'},
     {d:'accuracy is 1.0 — every email classified correctly',expr:'abs(accuracy - 1.0) < 1e-9'}
   ],
   hints:[
     'sigmoid: return 1 / (1 + math.exp(-z)).',
     'preds = [1 if p >= 0.5 else 0 for p in probs] — threshold each probability.',
     'accuracy = (number of preds matching labels) / total. With z = x - 3, the boundary is x = 3.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> With <code>w = 2, b = -6</code>, an email has 4 spammy words. Compute the score z, then the probability with sigmoid, then the decision. (Use e ≈ 2.718; sigmoid(2) ≈ 0.88.)`,
    solution:`Score: <code>z = 2·4 − 6 = 2</code>. Probability: <code>sigmoid(2) = 1/(1+e^(−2)) ≈ 1/(1+0.135) ≈ <b>0.88</b></code>. Since 0.88 ≥ 0.5, predict <b>SPAM</b>. The boundary is where <code>z = 0</code>: <code>2x − 6 = 0 → x = 3</code>, so 4 words (above 3) is spam, as expected.`},
   {q:`<b>2. (Concept)</b> Why squash the linear score through a sigmoid instead of just using the raw score w·x + b to classify?`,
    solution:`The raw linear score can be any number — −4, 7.2, 100 — which is meaningless as a probability and makes "how confident?" impossible to read. The <b>sigmoid maps any score into (0, 1)</b>, giving a genuine probability you can threshold and interpret ("88% spam"). It also gives a smooth, differentiable output so the model can be trained by gradient descent, and pairs with the cross-entropy (log) loss to punish confident-but-wrong predictions. A bare line does none of that.`}
 ]}}
]});
