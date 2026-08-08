STREAMS.push({icon:'📐',track:'Foundations Track',title:'Linear Algebra for ML',blurb:'The language ML is written in — from "what is a matrix?" to the operations that run every model.',requires:'mf2',requiresName:'Math Notation & Functions',lessons:[
{id:'la1',
 title:'Fundamentals: why matrices? A dataset IS a matrix',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>You already know a vector: an ordered list of numbers. A <b>matrix</b> is the next step up —
a <b>grid</b> of numbers, rows × columns. And here is the reason ML cares, before any math:
<b>a dataset is literally a matrix</b>. Each <b>row</b> is one example (one house, one patient),
each <b>column</b> is one feature (size, age, price). Three houses described by two numbers
each = a 3×2 matrix. That's not an analogy — it is how your data actually sits in memory.</p></div>

<h3>Why bother with a special object for grids?</h3>
<p>Because ML constantly does <i>the same operation to every row at once</i> — score every
house, predict every patient. Written with loops that's slow and verbose. Written as one
matrix operation it's one line, and it runs on hardware built for exactly this (this is
what GPUs are actually for). You'll feel the difference in the exercise: the loop way, then
the one-line way, same answer.</p>

<h3>Matrix arithmetic, from zero</h3>
<p><b>Adding</b> two matrices of the same shape: add matching cells. <b>Scaling</b> a matrix by
a number: multiply every cell. Both are exactly what you'd guess. In NumPy:</p>
<div class="codeSample">import numpy as np
A = np.array([[1, 2],
              [3, 4]])
A + A        # [[2, 4], [6, 8]]     — cell by cell
2 * A        # [[2, 4], [6, 8]]     — every cell doubled
A.shape      # (2, 2)               — rows, columns</div>
<p><code>.shape</code> tells you the dimensions — <code>(rows, columns)</code>. A dataset of
150 examples with 4 features has shape <code>(150, 4)</code>. When an error says "shapes don't
match," it's telling you the grids can't line up — the most common bug in all of ML code.</p>

<div class="demystify"><b>Demystify:</b> a matrix isn't just a table — it can also act as a
<b>machine that transforms vectors</b>: feed a vector in, get a new vector out (rotate it,
stretch it, project it). Both pictures are true, and ML uses both: data-as-matrix (this lesson)
and matrix-as-transformation (next lesson, where multiplication makes that precise).</div>

<div class="notebox"><b>📐 Notation decoder — linear algebra symbols</b> (you will meet these
across this stream; refer back anytime):
<table>
<tr><td>v  or  <b>v</b></td><td>a <b>vector</b> — a list of numbers (often shown in bold or with a little arrow)</td></tr>
<tr><td>A, X</td><td>a <b>matrix</b> — capital letters, by convention</td></tr>
<tr><td>Aᵀ</td><td>the <b>transpose</b> — flip rows and columns (Python: <code>A.T</code>)</td></tr>
<tr><td>A⁻¹</td><td>the <b>inverse</b> — the matrix that undoes A</td></tr>
<tr><td>I</td><td>the <b>identity</b> matrix — the "do nothing" matrix</td></tr>
<tr><td>‖v‖</td><td>the <b>norm</b> — the length of a vector</td></tr>
<tr><td>a · b</td><td>the <b>dot product</b> — line up, multiply, add → one number (alignment)</td></tr>
<tr><td>a × b</td><td>the <b>cross product</b> — a 3D-only operation (mostly geometry, rarely ML)</td></tr>
<tr><td>u vᵀ, u ⊗ v</td><td>the <b>outer product</b> — two vectors → a whole matrix</td></tr>
<tr><td>AB, A @ B</td><td><b>matrix multiplication</b> (Python uses the <code>@</code> operator)</td></tr>
<tr><td>λ (lambda)</td><td>an <b>eigenvalue</b> — the stretch factor of an eigenvector</td></tr>
<tr><td>det(A)</td><td>the <b>determinant</b> — the volume-scaling factor (0 ⇒ no inverse)</td></tr>
</table></div>`,
 docs:[['NumPy — array basics','https://numpy.org/doc/stable/user/absolute_beginners.html']],
 quiz:{title:'Quick check',questions:[
   {q:'A dataset of 200 patients, each described by 5 measurements, is naturally a matrix of shape:',
    options:['(5, 200)','(200, 5)','(200, 200)','(5, 5)'],answer:1,
    why:'Rows = examples (200 patients), columns = features (5 measurements): shape (200, 5).'},
   {q:'Adding two matrices of the same shape works by:',
    options:['Multiplying rows by columns','Adding matching cells, position by position','Joining them side by side','It is not allowed'],answer:1,
    why:'Addition is cell-by-cell (element-wise). That is why the shapes must match exactly.'},
   {q:'Why does ML use matrix operations instead of Python loops?',
    options:['Loops are forbidden in Python','One matrix operation applies the same work to all rows at once — massively faster, and what GPUs are built for','Matrices use less memory than lists','It is just tradition'],answer:1,
    why:'Vectorized matrix operations do in one hardware-accelerated step what a loop does row by row.'}
 ]},
 exs:[{title:'Your dataset as a matrix (pure Python)',
   lang:'python',
   prompt:`A tiny housing dataset: three houses, each with [size_in_100m², age_in_decades]:
   <code>[[1, 2], [3, 4], [5, 6]]</code>. Build it with plain Python lists (a matrix is a list
   of rows) and work with it by hand:
   <ol>
   <li><code>X</code> — the 3×2 matrix (a list of three rows),</li>
   <li><code>shape</code> — its shape as a tuple <code>(rows, cols)</code> using <code>len</code>,</li>
   <li><code>doubled</code> — every cell doubled (a comprehension),</li>
   <li><code>col_means</code> — the mean of each <b>column</b> (average size, average age) — expect <code>[3.0, 4.0]</code>.</li>
   </ol>`,
   starter:`# A matrix is just a list of rows (each row a list)

# 1) Three houses (rows), two features (columns)
X = [[1, 2], [3, 4], [5, 6]]

# 2) Its shape — (number of rows, number of columns)
shape =

# 3) Every cell doubled — a nested comprehension
doubled =

# 4) The mean of each column: average down the rows, one value per column
n_rows = len(X)
n_cols = len(X[0])
col_means =

print(shape, col_means)
`,
   solution:`# A matrix is just a list of rows (each row a list)

# 1) Three houses (rows), two features (columns)
X = [[1, 2], [3, 4], [5, 6]]

# 2) Its shape — (number of rows, number of columns)
shape = (len(X), len(X[0]))

# 3) Every cell doubled — a nested comprehension
doubled = [[2 * cell for cell in row] for row in X]

# 4) The mean of each column: average down the rows, one value per column
n_rows = len(X)
n_cols = len(X[0])
col_means = [sum(X[r][c] for r in range(n_rows)) / n_rows for c in range(n_cols)]

print(shape, col_means)
`,
   tests:[
     {d:'X is the 3×2 matrix [[1,2],[3,4],[5,6]]',expr:'X == [[1,2],[3,4],[5,6]]'},
     {d:'shape is (3, 2) — 3 examples, 2 features',expr:'shape == (3, 2)'},
     {d:'doubled doubles every cell',expr:'doubled == [[2,4],[6,8],[10,12]]'},
     {d:'col_means is [3.0, 4.0]',expr:'col_means == [3.0, 4.0]'}
   ],
   hints:[
     'A matrix is a list of rows: X = [[1, 2], [3, 4], [5, 6]]. shape = (len(X), len(X[0])).',
     'doubled = [[2 * cell for cell in row] for row in X] — walk every row, then every cell.',
     'For each column c, average X[r][c] over all rows r: sum(...) / n_rows. Do it for c in range(n_cols).'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> By hand, write the matrix with 2 rows and 3 columns whose entry in row <i>i</i>, column <i>j</i> is <i>i + j</i> (counting rows and columns from 0). What is its shape?`,
    solution:`Row 0: (0+0, 0+1, 0+2) = [0, 1, 2]. Row 1: (1+0, 1+1, 1+2) = [1, 2, 3].<br>So the matrix is <code>[[0, 1, 2], [1, 2, 3]]</code>, with shape <b>(2, 3)</b> — 2 rows, 3 columns.`},
   {q:`<b>2.</b> For <code>X = [[10, 1], [20, 3], [30, 5]]</code> (three houses, columns = price, age), compute the mean of each column by hand.`,
    solution:`Column 0 (price): (10 + 20 + 30) / 3 = 60/3 = <b>20</b>. Column 1 (age): (1 + 3 + 5) / 3 = 9/3 = <b>3</b>.<br>So <code>col_means = [20.0, 3.0]</code>. Averaging "down the rows" gives one number per feature — exactly what you compute before standardizing data.`}
 ]}},

{id:'la1b',
 title:'Fundamentals: the basic operations — adding, scaling, and multiplying',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Before the star operation (matrix multiplication, next lesson), we need the everyday
arithmetic of vectors and matrices — adding them, scaling them, and the <i>two different</i>
ways to multiply. These are the moves you will use in every line of ML code, and one of them
is the single most common NumPy mistake, so we pin it down now.</p></div>

<h3>Adding vectors: combine, entry by entry</h3>
<div class="codeSample">[1, 2, 3] + [4, 5, 6] = [5, 7, 9]      # add matching entries</div>
<p>Vector addition lines the two up and adds each pair. Geometrically it is "do this movement,
then that one" (tip to tail). In ML you add vectors constantly — combining feature
contributions, or nudging a point of weights. The rule: <b>same length required</b>.</p>

<h3>Scaling: multiply every entry by a number</h3>
<div class="codeSample">3 * [1, 2, 3] = [3, 6, 9]              # a scalar stretches the whole vector
-1 * [1, 2, 3] = [-1, -2, -3]         # negative flips its direction</div>
<p>Multiplying a vector (or matrix) by a single number — a <b>scalar</b> — stretches or shrinks
it, and flips it if the number is negative. You already met this in disguise:
<code>x = x - lr * gradient</code> from gradient descent <i>scales the gradient by the learning
rate</i>. Adding + scaling together is a <b>linear combination</b> — the operation the whole
subject is named after.</p>

<h3>The two multiplications — do not confuse them</h3>
<p>Vectors have <i>two</i> different "multiplications," and mixing them up is the classic bug:</p>
<div class="codeSample">Element-wise (Hadamard):  [1, 2, 3] * [4, 5, 6] = [3, 10, 18]   # multiply matching entries
Dot product:              [1, 2, 3] · [4, 5, 6] = 3+10+18 = 31   # ...then ADD → one number</div>
<p><b>Element-wise</b> multiply keeps a vector (each entry times its partner);
<b>dot product</b> goes one step further and sums, collapsing to a single number. In NumPy the
distinction is a single character: <code>a * b</code> is <b>element-wise</b>, while
<code>a @ b</code> (or <code>np.dot</code>) is the <b>dot product</b>. Reaching for
<code>*</code> when you meant <code>@</code> is the number-one NumPy mistake — now you will
never make it silently.</p>

<h3>Matrices: same rules, one grid up</h3>
<p><b>Adding matrices</b> of the same shape: add matching cells. <b>Scaling a matrix</b>:
multiply every cell. <b>Element-wise</b> <code>A * B</code> multiplies matching cells (same
shape) — and is a completely different operation from the matrix multiplication
<code>A @ B</code> you meet next lesson. Same words, one dimension higher.</p>

<h3>The transpose: flip a matrix over its diagonal</h3>
<div class="codeSample">A  = [[1, 2, 3],          Aᵀ = [[1, 4],
      [4, 5, 6]]                [2, 5],
   (2 rows, 3 cols)             [3, 6]]   (3 rows, 2 cols)</div>
<p>The <b>transpose</b> <code>Aᵀ</code> (in NumPy, <code>A.T</code>) turns rows into columns and
columns into rows — row <code>i</code> becomes column <code>i</code>. A <code>2×3</code> becomes
a <code>3×2</code>. It looks like bookkeeping, but it is everywhere in ML: it is how you line
shapes up so a multiplication is legal (the <code>Xᵀ</code> in the regression formula
<code>(XᵀX)⁻¹Xᵀy</code> is a transpose), and <code>XᵀX</code> — a matrix times its own
transpose — is how the covariance and normal-equation matrices are built. Transpose twice and
you are back where you started: <code>(Aᵀ)ᵀ = A</code>.</p>

<div class="demystify"><b>Demystify the star:</b> in NumPy, <code>*</code> <b>always</b> means
element-wise (entry times matching entry), and <code>@</code> means "the real matrix/dot
multiply." Math notation writes plain juxtaposition <code>AB</code> for the matrix product, so
people expect <code>A * B</code> to do that — it does not. When your shapes are right but the
numbers are wrong, check whether you wanted <code>*</code> or <code>@</code>.</div>`,
 docs:[['NumPy — array operations','https://numpy.org/doc/stable/user/absolute_beginners.html#basic-array-operations']],
 quiz:{title:'Quick check',questions:[
   {q:'[1, 2, 3] + [4, 5, 6] (as vectors) gives:',
    options:['[1,2,3,4,5,6] (joined)','[5, 7, 9] — add matching entries','32','[4, 10, 18]'],answer:1,
    why:'Vector addition is entry-by-entry (same length required). Joining lists is a different, non-math operation.'},
   {q:'In NumPy, a * b (for two equal-length arrays) computes:',
    options:['The dot product (a single number)','Element-wise multiplication — each entry times its partner, keeping a vector','Matrix multiplication','An error'],answer:1,
    why:'* is ALWAYS element-wise in NumPy. The dot product is a @ b or np.dot(a, b). Confusing the two is the classic bug.'},
   {q:'The difference between element-wise multiply and the dot product is:',
    options:['They are the same','The dot product also SUMS the products into one number; element-wise keeps a vector','Element-wise only works on matrices','The dot product flips the vector'],answer:1,
    why:'[1,2]*[3,4] = [3,8] (element-wise, a vector); [1,2]·[3,4] = 3+8 = 11 (dot, one number). The sum is the whole difference.'}
 ]},
 exs:[{title:'Every basic operation, once (pure Python)',
   lang:'python',
   prompt:`Implement each operation yourself with plain Python (vectors are lists, matrices are
   lists of rows). With <code>u = [1, 2, 3]</code>, <code>v = [4, 5, 6]</code>,
   <code>A = [[1, 2], [3, 4]]</code>, <code>B = [[1, 2, 3], [4, 5, 6]]</code>:
   <ol>
   <li><code>vsum</code> — add matching entries → [5, 7, 9],</li>
   <li><code>scaled</code> — <code>2</code>× each entry of u → [2, 4, 6],</li>
   <li><code>elementwise</code> — multiply matching entries (Hadamard) → [4, 10, 18],</li>
   <li><code>dot</code> — multiply matching entries, then <b>add</b> → one number, 32,</li>
   <li><code>Asum</code> — A + A (cell by cell) and <code>A3</code> — 3 × A,</li>
   <li><code>BT</code> — B transposed (rows become columns → a 3×2).</li>
   </ol>`,
   starter:`u = [1, 2, 3]
v = [4, 5, 6]
A = [[1, 2], [3, 4]]
B = [[1, 2, 3], [4, 5, 6]]

# 1) vector addition — add matching entries
vsum =

# 2) scale a vector — 2 times each entry
scaled =

# 3) element-wise (Hadamard) product — multiply matching entries, stay a list
elementwise =

# 4) dot product — multiply matching entries, then SUM into one number
dot =

# 5) matrix add and scalar-multiply (cell by cell)
Asum =
A3 =

# 6) transpose — entry [i][j] becomes [j][i]  (2x3 -> 3x2)
BT =

print(vsum, scaled, elementwise, dot)
print(Asum, A3, BT)
`,
   solution:`u = [1, 2, 3]
v = [4, 5, 6]
A = [[1, 2], [3, 4]]
B = [[1, 2, 3], [4, 5, 6]]

# 1) vector addition — add matching entries
vsum = [u[i] + v[i] for i in range(len(u))]

# 2) scale a vector — 2 times each entry
scaled = [2 * x for x in u]

# 3) element-wise (Hadamard) product — multiply matching entries, stay a list
elementwise = [u[i] * v[i] for i in range(len(u))]

# 4) dot product — multiply matching entries, then SUM into one number
dot = sum(u[i] * v[i] for i in range(len(u)))

# 5) matrix add and scalar-multiply (cell by cell)
Asum = [[A[i][j] + A[i][j] for j in range(2)] for i in range(2)]
A3 = [[3 * cell for cell in row] for row in A]

# 6) transpose — entry [i][j] becomes [j][i]  (2x3 -> 3x2)
BT = [[B[i][j] for i in range(len(B))] for j in range(len(B[0]))]

print(vsum, scaled, elementwise, dot)
print(Asum, A3, BT)
`,
   tests:[
     {d:'u + v = [5, 7, 9] (vector addition)',expr:'vsum == [5, 7, 9]'},
     {d:'2 * u = [2, 4, 6] (scaling)',expr:'scaled == [2, 4, 6]'},
     {d:'element-wise u*v = [4, 10, 18] (still a list/vector)',expr:'elementwise == [4, 10, 18]'},
     {d:'dot product = 32 (one number, the element-wise sum)',expr:'dot == 32'},
     {d:'A + A doubles every cell; 3 * A triples every cell',expr:'Asum == [[2,4],[6,8]] and A3 == [[3,6],[9,12]]'},
     {d:'transpose turns the 2×3 into a 3×2',expr:'BT == [[1,4],[2,5],[3,6]]'}
   ],
   hints:[
     'Addition and scaling are the obvious symbols: u + v and 2 * u.',
     'The trap: u * v is ELEMENT-WISE ([4,10,18]); the dot product is u @ v (32 = 4+10+18). One character apart.',
     'Matrices follow the same rules: A + A adds cells, 3 * A scales cells. Transpose is B.T (rows become columns). (A @ A would be the matrix product — next lesson.)'
   ]}],
 homework:{problems:[
   {q:'<b>1.</b> By hand, compute <code>[2, -1, 3] + [0, 4, -2]</code> and <code>-2 × [3, -1, 0]</code>.',
    solution:`Addition is entry-by-entry: <code>[2+0, -1+4, 3+(-2)] = [2, 3, 1]</code>.<br>
    Scaling multiplies every entry: <code>-2 × [3, -1, 0] = [-6, 2, 0]</code> (and the negative
    sign flips each entry's sign).`},
   {q:`<b>2.</b> For <code>a = [1, 0, 2]</code> and <code>b = [3, 4, 1]</code>, compute BOTH the element-wise product and the dot product, and say which is a vector and which is a number.`,
    solution:`<b>Element-wise</b> (multiply matching entries, keep a vector):
    <code>a * b = [1·3, 0·4, 2·1] = [3, 0, 2]</code> — a <b>vector</b>.<br>
    <b>Dot product</b> (multiply, then add): <code>a · b = 3 + 0 + 2 = 5</code> — a single
    <b>number</b>.<br>
    The dot product is just the element-wise product with its entries summed.`},
   {q:`<b>3. (On your computer)</b> In the Playground, create <code>a</code> and <code>b</code> from problem 2 as NumPy arrays and confirm <code>a * b</code> and <code>a @ b</code> give what you computed. Why do they differ?`,
    solution:`<div class="codeSample">import numpy as np
a = np.array([1, 0, 2]); b = np.array([3, 4, 1])
print(a * b)   # [3 0 2]  — element-wise (NumPy's * is ALWAYS element-wise)
print(a @ b)   # 5        — dot product (multiply then sum)</div>
    They differ because <code>*</code> stops at "multiply matching entries," while
    <code>@</code> takes the extra step of summing them into one number. Reaching for
    <code>*</code> when you meant <code>@</code> is the classic NumPy bug.`}
 ]}},

{id:'la2',
 title:'Fundamentals: matrix multiplication — every prediction at once (and the identity)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Here is the operation that runs essentially all of ML. Suppose each house's price is
predicted as <code>50·size + (−2)·age</code>. For ONE house that's a dot product:
<code>[size, age] · [50, −2]</code>. <b>Matrix multiplication is just doing that dot product
for every row at once</b>: multiply the data matrix by the weight vector, get all predictions
in one shot. A model "scoring a dataset" IS this multiplication — nothing more.</p></div>

<h3>The rule, plainly</h3>
<p><code>C = A @ B</code> (NumPy's multiply symbol): each output cell is the <b>dot product of a
row of A with a column of B</b>. Specifically, the cell in <b>row i, column j</b> of the answer
is the dot product of <b>row i of A</b> with <b>column j of B</b>. That's the whole rule. It
also explains the shape law: the row length of A must equal the column length of B — you can't
dot two lists of different lengths.</p>

<div class="worked"><b>✍️ Worked by hand — multiply a matrix by a vector.</b> Take our three
houses and the weights, and compute every prediction the slow, honest way.
<div class="mathblock">X = | 1  2 |        w = | 50 |
    | 3  4 |            | −2 |
    | 5  6 |

Each prediction = (that row) · w = row·[50, −2]:

Row 1: [1, 2]·[50, −2] = (1)(50) + (2)(−2) = 50 − 4  =  46
Row 2: [3, 4]·[50, −2] = (3)(50) + (4)(−2) = 150 − 8 = 142
Row 3: [5, 6]·[50, −2] = (5)(50) + (6)(−2) = 250 −12 = 238

X @ w = [46, 142, 238]</div>
Three houses in, three predictions out — each one a dot product of a row with the weights.
The <code>(3×2) @ (2,) → (3,)</code> shape is just "3 rows each producing one number."</div>

<div class="worked"><b>✍️ Worked by hand — matrix × matrix.</b> Same rule, now the right side
has two columns, so each answer cell picks a row of A and a column of B.
<div class="mathblock">A = | 1  2 |     B = | 5  6 |
    | 3  4 |         | 7  8 |

C[row i, col j] = (row i of A) · (col j of B):

C[1,1] = [1,2]·[5,7] = 1·5 + 2·7 = 5 + 14  = 19
C[1,2] = [1,2]·[6,8] = 1·6 + 2·8 = 6 + 16  = 22
C[2,1] = [3,4]·[5,7] = 3·5 + 4·7 = 15 + 28 = 43
C[2,2] = [3,4]·[6,8] = 3·6 + 4·8 = 18 + 32 = 50

A @ B = | 19  22 |
        | 43  50 |</div>
Notice <b>order matters</b>: <code>A @ B</code> is generally <i>not</i> <code>B @ A</code>
(unlike ordinary numbers) — swapping which matrix supplies the rows changes the answer.</div>

<h3>The identity matrix — the "do nothing" machine</h3>
<p>The <b>identity matrix</b> <code>I</code> has <b>1s down the diagonal and 0s everywhere
else</b> (<code>np.eye(n)</code>). The 2×2 and 3×3 identities look like:</p>
<div class="mathblock">I₂ = | 1  0 |        I₃ = | 1  0  0 |
     | 0  1 |             | 0  1  0 |
                          | 0  0  1 |</div>
<p>Multiplying by it changes nothing — <code>I @ v = v</code> — and here is <i>why</i>, worked
out, so it is not just a claim:</p>
<div class="worked"><b>✍️ Worked by hand — why I does nothing.</b> Multiply I₂ by the vector
<code>v = [7, 3]</code>. Each output entry is a row of I dotted with v:
<div class="mathblock">Row 1: [1, 0]·[7, 3] = (1)(7) + (0)(3) = 7 + 0 = 7
Row 2: [0, 1]·[7, 3] = (0)(7) + (1)(3) = 0 + 3 = 3

I @ [7, 3] = [7, 3]   ← unchanged</div>
The single <code>1</code> in each row "selects" exactly one entry of <code>v</code> and the
<code>0</code>s erase the rest — so every entry passes through untouched. That is the whole
trick.</div>
<p>It is the <b>number 1 of the matrix world</b>, and that is exactly why it matters: it is the
reference point for "undoing" a transformation (the <i>inverse</i> is defined by
<code>A @ A⁻¹ = I</code> — apply, then un-apply, and you have done nothing), and it shows up
inside ridge regression (<code>XᵀX + λI</code>), the regularization trick you'll meet in the
ML track.</p>

<div class="demystify"><b>Demystify:</b> "matrix multiplication" sounds like arbitrary rules to
memorize. It isn't — it's <i>batched dot products</i>, and a dot product is "multiply matching
entries and add." One idea, reused at scale. If you can dot two vectors, you already know the
whole operation.</div>`,
 docs:[['NumPy — matmul (@)','https://numpy.org/doc/stable/reference/generated/numpy.matmul.html']],
 quiz:{title:'Quick check',questions:[
   {q:'In C = A @ B, each cell of C is:',
    options:['The product of matching cells of A and B','The dot product of a row of A with a column of B','The sum of a row of A','Always 0 or 1'],answer:1,
    why:'That is the whole rule — batched dot products. It is also why inner shapes must match.'},
   {q:'X is 3×2 (3 houses, 2 features) and w has 2 weights. X @ w gives:',
    options:['A 2×3 matrix','3 numbers — one prediction per house','2 numbers — one per feature','An error'],answer:1,
    why:'(3×2) @ (2,) → 3 values: each house\u0027s dot product with the weights. Scoring a dataset IS this multiply.'},
   {q:'The identity matrix I is special because:',
    options:['It doubles every value','I @ v = v — it changes nothing, like multiplying by 1','It sorts the matrix','It only works on 2×2 matrices'],answer:1,
    why:'1s on the diagonal, 0s elsewhere: the do-nothing transformation, and the reference point for defining inverses (A @ A⁻¹ = I).'}
 ]},
 exs:[{title:'Predict every house at once (matrix × vector, by hand)',
   lang:'python',
   prompt:`Implement the matrix–vector product yourself. Houses <code>X = [[1,2],[3,4],[5,6]]</code>,
   weights <code>w = [50, -2]</code>:
   <ol>
   <li><code>preds</code> — each house's prediction = its row dotted with w (multiply matching entries, add). Expected <code>[46, 142, 238]</code>,</li>
   <li><code>I</code> — the 2×2 identity matrix, built as a list of rows,</li>
   <li><code>unchanged</code> — I applied to w (row·w for each row of I) — must equal w,</li>
   <li><code>first_by_hand</code> — the first prediction written out: <code>1*50 + 2*(-2)</code>.</li>
   </ol>`,
   starter:`X = [[1, 2], [3, 4], [5, 6]]
w = [50, -2]

# 1) All predictions: for each row, the dot product row . w
preds =

# 2) The 2x2 identity matrix (1s on the diagonal, 0s elsewhere)
I =

# 3) Apply I to w by hand: for each row of I, dot it with w
unchanged =

# 4) First house written out
first_by_hand =

print(preds, unchanged, first_by_hand)
`,
   solution:`X = [[1, 2], [3, 4], [5, 6]]
w = [50, -2]

# 1) All predictions: for each row, the dot product row . w
preds = [sum(row[j] * w[j] for j in range(len(w))) for row in X]

# 2) The 2x2 identity matrix (1s on the diagonal, 0s elsewhere)
I = [[1, 0], [0, 1]]

# 3) Apply I to w by hand: for each row of I, dot it with w
unchanged = [sum(row[j] * w[j] for j in range(len(w))) for row in I]

# 4) First house written out
first_by_hand = 1*50 + 2*(-2)

print(preds, unchanged, first_by_hand)
`,
   tests:[
     {d:'preds is [46, 142, 238] — three dot products at once',expr:'preds == [46, 142, 238]'},
     {d:'I is the 2×2 identity [[1,0],[0,1]]',expr:'I == [[1,0],[0,1]]'},
     {d:'I applied to w leaves w unchanged',expr:'unchanged == [50, -2]'},
     {d:'first house by hand is 46 — matching preds[0]',expr:'first_by_hand == 46 and preds[0] == 46'}
   ],
   hints:[
     'The one-shot multiply is X @ w — NumPy lines up each row of X with w.',
     'np.eye(2) builds the identity; I @ w should print [50. -2.].',
     'First row dot: 1*50 + 2*(-2) = 50 - 4 = 46. Check it equals preds[0] — that is the whole secret of @.'
   ]}]},

{id:'latf',
 title:'Fundamentals: a matrix is a transformation of space',
 body:`
<div class="ground"><span class="gTag">🎯 The idea that unlocks the rest</span>
<p>So far a matrix has been a grid of numbers and a batch of dot products. Here is the deeper
picture that makes eigenvectors, determinants, and inverses finally make sense: <b>a matrix is
a machine that moves points around — it transforms space.</b> But first we owe you an honest
answer to a question you should be asking: <i>what is "space"?</i></p></div>

<h3>First: what do we even mean by "space"?</h3>
<p>Not outer space — no vacuum, no stars. In math, a <b>space</b> is simply <b>the collection of
every possible point of a given size.</b> Picture an endless sheet of graph paper: every
location on it is a pair of numbers <code>[x, y]</code>, and the whole sheet — all possible
pairs — is what we call <b>2-D space</b>. A vector like <code>[3, 4]</code> is just <i>one
location</i> in it. Add a third number and you get <b>3-D space</b>: every possible
<code>[x, y, z]</code>, like every location in the room you're sitting in.</p>
<p>The idea keeps going even when you can't picture it. <b>n-dimensional space</b> is every
possible list of <code>n</code> numbers. You cannot visualise 300-D, but it is the same
concept: the set of all 300-number vectors. This matters directly for ML: a dataset of houses,
each described by 5 features, <b>lives in 5-dimensional space</b> — each house is one point in
it, and the whole dataset is a cloud of points floating in that space. "Space" is just the
coordinate playground your data lives in; the word is borrowed because the 2-D and 3-D versions
happen to look like the physical space we know.</p>

<h3>How a matrix "operates on space"</h3>
<p>You already know <code>A @ v</code> takes a vector <code>v</code> and produces a new vector.
Now think of <code>v</code> as a <b>point</b> in the plane. The matrix takes that point and
<b>moves it somewhere else</b>. Do this to <i>every</i> point at once and the entire plane gets
picked up and reshaped — stretched, rotated, sheared, or flipped. That reshaping is what "a
matrix transforms space" means, literally: feed a point in, get its new location out.</p>

<h3>The one trick to see what a matrix does: follow the arrows</h3>
<p>You don't have to move infinitely many points — just watch the two basis vectors
<code>[1, 0]</code> (one step right) and <code>[0, 1]</code> (one step up). Here is the beautiful
fact: <b>the columns of the matrix are exactly where those two arrows land.</b> Column 1 is
where <code>[1,0]</code> goes; column 2 is where <code>[0,1]</code> goes. Know that, and you
know the whole transformation.</p>
<div class="worked"><b>✍️ Worked — a stretch.</b> Take <code>A = [[2, 0], [0, 3]]</code>. Send
the basis arrows through it:
<div class="mathblock">A @ [1, 0]:  row1·[1,0] = 2·1 + 0·0 = 2     →  [2, 0]
             row2·[1,0] = 0·1 + 3·0 = 0
A @ [0, 1]:  row1·[0,1] = 2·0 + 0·1 = 0     →  [0, 3]
             row2·[0,1] = 0·0 + 3·1 = 3</div>
So <code>[1,0]</code> (one right) becomes <code>[2,0]</code> (two right) and <code>[0,1]</code>
(one up) becomes <code>[0,3]</code> (three up) — those are exactly the columns of A. The unit
square is stretched into a 2-wide, 3-tall rectangle; a corner like <code>[1,1]</code> lands at
<code>A @ [1,1] = [2, 3]</code>. <b>This is what "the matrix scales space" means</b>, worked out
by hand.</div>
<div class="worked"><b>✍️ Worked — a shear (slant).</b> <code>S = [[1, 1], [0, 1]]</code>:
<div class="mathblock">S @ [1, 0] = [1, 0]     (the right-arrow stays put)
S @ [0, 1] = [1, 1]     (the up-arrow tips over to the right)</div>
Vertical lines slant; the square becomes a parallelogram. Different matrices reshape space in
different ways — stretch, shear, rotate (e.g. <code>[[0,−1],[1,0]]</code> rotates 90°), or flip.</div>

<h3>Now the payoff — and it connects the next three lessons</h3>
<p>Once you see a matrix as a reshaping of space, three things that sounded abstract become
concrete: the <b>determinant</b> (next lesson) is simply <i>how much the transformation grows or
shrinks area</i>; if a matrix squashes 2-D space onto a line, area goes to zero — that is a
determinant of 0. The <b>inverse</b> is the transformation that <i>reverses</i> the reshaping
and puts every point back; if space was flattened onto a line, information is destroyed and no
reversal exists (no inverse). And <b>eigenvectors</b> are the special directions the
transformation does not rotate, only stretches. All three are just questions about "what did
this reshaping do to space."</p>

<div class="demystify"><b>Demystify "linear transformation":</b> that phrase just means "a
matrix's action on space." <i>Linear</i> means the reshaping keeps grid lines straight and
evenly spaced and leaves the origin fixed — no bending. That is precisely why matrices can only
stretch, rotate, shear, and flip (never curve), and why stacking matrix layers in a neural
network needs a nonlinearity between them to bend space at all (calculus/functions stream).</div>`,
 docs:[['3Blue1Brown — linear transformations & matrices','https://www.3blue1brown.com/lessons/linear-transformations']],
 quiz:{title:'Quick check',questions:[
   {q:'What does it mean that "a matrix transforms space"?',
    options:['It stores space in memory','It takes each point (as a vector) and moves it to a new location — reshaping the whole plane at once','It measures the size of space','It deletes points'],answer:1,
    why:'A @ v moves the point v somewhere new; doing this to every point stretches/rotates/shears/flips all of space. That is the transformation.'},
   {q:'The columns of a 2×2 matrix tell you:',
    options:['Its determinant','Where the basis vectors [1,0] and [0,1] land after the transformation','How many rows it has','Its inverse'],answer:1,
    why:'Column 1 = image of [1,0], column 2 = image of [0,1]. Those two landing spots define the entire transformation.'},
   {q:'If a matrix squashes 2-D space flat onto a single line, then:',
    options:['Its determinant is huge','Area collapses to 0 (determinant 0), information is lost, and the transformation cannot be reversed (no inverse)','It becomes the identity','Nothing special happens'],answer:1,
    why:'Flattening a dimension destroys information — you cannot un-flatten it. That is the geometric reason det=0 matrices have no inverse.'}
 ]},
 exs:[{title:'Watch a matrix move the basis vectors',
   lang:'python',
   prompt:`Apply matrices to vectors by hand (a matrix–vector product: each output entry is a
   row dotted with the vector). See that the columns of a matrix are where the basis vectors go:
   <ol>
   <li><code>A = [[2, 0], [0, 3]]</code>; compute <code>Ae1</code> (A applied to [1,0]) and <code>Ae2</code> (A applied to [0,1]),</li>
   <li><code>cols_match</code> — <code>True</code> if Ae1 equals column 0 of A and Ae2 equals column 1,</li>
   <li><code>corner</code> — where the unit-square corner <code>[1, 1]</code> lands (expect [2, 3]),</li>
   <li><code>sheared</code> — for the shear <code>S = [[1, 1], [0, 1]]</code>, where <code>[0, 1]</code> lands (expect [1, 1]).</li>
   </ol>`,
   starter:`def apply(M, v):
    # matrix-vector product: each entry is a row of M dotted with v
    return [sum(row[j] * v[j] for j in range(len(v))) for row in M]

A = [[2, 0], [0, 3]]

# 1) where the basis vectors land
Ae1 = apply(A, [1, 0])
Ae2 = apply(A, [0, 1])

# 2) the columns of A ARE those landing spots (column 0 is [A[0][0], A[1][0]])
col0 = [A[0][0], A[1][0]]
col1 = [A[0][1], A[1][1]]
cols_match =

# 3) where the corner [1,1] goes
corner =

# 4) a shear sends the up-arrow sideways
S = [[1, 1], [0, 1]]
sheared =

print(Ae1, Ae2, cols_match, corner, sheared)
`,
   solution:`def apply(M, v):
    # matrix-vector product: each entry is a row of M dotted with v
    return [sum(row[j] * v[j] for j in range(len(v))) for row in M]

A = [[2, 0], [0, 3]]

# 1) where the basis vectors land
Ae1 = apply(A, [1, 0])
Ae2 = apply(A, [0, 1])

# 2) the columns of A ARE those landing spots (column 0 is [A[0][0], A[1][0]])
col0 = [A[0][0], A[1][0]]
col1 = [A[0][1], A[1][1]]
cols_match = Ae1 == col0 and Ae2 == col1

# 3) where the corner [1,1] goes
corner = apply(A, [1, 1])

# 4) a shear sends the up-arrow sideways
S = [[1, 1], [0, 1]]
sheared = apply(S, [0, 1])

print(Ae1, Ae2, cols_match, corner, sheared)
`,
   tests:[
     {d:'[1,0] lands at [2,0] and [0,1] lands at [0,3] (the stretch)',expr:'Ae1 == [2, 0] and Ae2 == [0, 3]'},
     {d:'the columns of A ARE where the basis vectors land',expr:'cols_match == True'},
     {d:'the corner [1,1] lands at [2,3]',expr:'corner == [2, 3]'},
     {d:'the shear sends [0,1] to [1,1] (space slants)',expr:'sheared == [1, 1]'}
   ],
   hints:[
     'apply(A, [1,0]) dots each row of A with [1,0] — it picks out column 0. Same for [0,1].',
     'cols_match = Ae1 == col0 and Ae2 == col1, where col0 = [A[0][0], A[1][0]].',
     'corner = apply(A, [1,1]) = [2,3]; the shear apply(S, [0,1]) = [1,1] — the up-arrow tips sideways.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> The matrix <code>A = [[3, 0], [0, 1]]</code> transforms space. Where do <code>[1, 0]</code> and <code>[0, 1]</code> land, and in words, what does A do to the plane?`,
    solution:`<code>A @ [1,0] = [3, 0]</code> and <code>A @ [0,1] = [0, 1]</code>.<br>The right-arrow triples in length; the up-arrow is unchanged. So A <b>stretches space horizontally by 3</b> and leaves the vertical alone — the unit square becomes a 3-wide, 1-tall rectangle. (Its determinant, the area factor, is 3·1 = 3.)`},
   {q:`<b>2.</b> A matrix sends <code>[1, 0] → [1, 0]</code> and <code>[0, 1] → [0, 0]</code>. Write the matrix, and explain why it has no inverse.`,
    solution:`The columns are the landing spots of the basis vectors, so the matrix is <code>[[1, 0], [0, 0]]</code>.<br>It sends the entire up-direction to the origin — it <b>flattens 2-D space onto the horizontal line</b>. Two different points (e.g. [5,2] and [5,9]) both land on [5,0], so you cannot tell them apart afterward: information is destroyed and the transformation <b>cannot be reversed</b>. That is why it is singular (its determinant is 1·0 − 0·0 = 0).`},
   {q:`<b>3. (Concept)</b> Why must there be a nonlinearity between matrix "layers" in a neural network — what can a matrix alone never do to space?`,
    solution:`A matrix can only apply a <b>linear</b> transformation: stretch, rotate, shear, flip — grid lines stay straight and evenly spaced. It can <b>never bend or curve</b> space. Stacking matrices just gives another matrix (another linear map), so depth alone adds nothing. A nonlinearity (like the sigmoid or ReLU) bends space between layers, which is what lets deep networks carve the curved decision boundaries real data needs.`}
 ]}},

{id:'la3',
 title:'Fundamentals: norms, distance & similarity — how ML measures "close"',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Half of machine learning is some version of one question: <i>"how similar are these two
things?"</i> Recommend a movie = find users <b>close</b> to you. Classify an email = is it
<b>closer</b> to spam or to ham? Detect fraud = is this transaction <b>far</b> from normal?
Since every thing is a vector, we need to measure closeness between vectors — and this lesson
is the complete toolkit for that.</p></div>

<h3>Norm: how long is a vector?</h3>
<p>The <b>L2 norm</b> <code>‖v‖</code> is the arrow's length — Pythagoras generalized:
<code>√(v₁² + v₂² + …)</code>, in NumPy <code>np.linalg.norm(v)</code>. Its sibling the
<b>L1 norm</b> adds absolute values instead (<code>|v₁| + |v₂| + …</code>) — the
"city-block" length.</p>
<div class="worked"><b>✍️ Worked by hand.</b> For <code>v = [3, 4]</code>:
<div class="mathblock">L2 norm:  ‖v‖ = √(3² + 4²) = √(9 + 16) = √25 = 5
L1 norm:  |3| + |4| = 7</div>
Same vector, two rulers, two lengths.</div>
<p><b>Why ML cares, in plain English:</b> a norm is how a model measures "how big" something is
— <i>how big is this error?</i> and <i>how big are these weights?</i> Penalizing large weights
(so the model stays simple) is just penalizing their norm — that is exactly what L2 and L1
<b>regularization</b> do, and it is the same L2-vs-L1 pair you met as MSE vs MAE.</p>

<h3>Distance: how far apart are two points?</h3>
<p>The distance between vectors <code>a</code> and <code>b</code> is just the norm of their
<b>difference</b>: <code>‖a − b‖</code> — subtract to get the gap vector, then measure its
length.</p>
<div class="worked"><b>✍️ Worked by hand.</b> Distance from <code>a = [1, 2]</code> to
<code>b = [4, 6]</code>:
<div class="mathblock">a − b = [1−4, 2−6] = [−3, −4]
‖a − b‖ = √((−3)² + (−4)²) = √(9 + 16) = √25 = 5</div></div>
<p><b>Why ML cares, in plain English:</b> "similar things are close, weird things are far."
A <b>k-nearest-neighbours</b> classifier labels a new point by the labels of the closest points
to it; <b>anomaly/fraud detection</b> flags points that sit far from the normal crowd. Both are
just this subtract-then-measure step.</p>

<h3>Cosine similarity: same direction, ignoring size</h3>
<p>First, recall the <b>dot product</b> (from the NumPy and basic-operations lessons): line two
vectors up, multiply matching entries, and add them into a <i>single number</i> — it is large
when the two point the same way and zero when they are at right angles. Cosine similarity takes
that number and <b>divides out both lengths</b>, so only <i>direction</i> is left:</p>
<div class="mathblock">cosine similarity(a, b) = (a · b) / (‖a‖ · ‖b‖)     ranges from −1 to 1</div>
<div class="worked"><b>✍️ Worked by hand.</b> Take <code>a = [1, 2]</code> and
<code>b = [2, 4]</code> (b points the exact same way as a, just longer):
<div class="mathblock">dot:   a · b = (1)(2) + (2)(4) = 2 + 8 = 10
norms: ‖a‖ = √(1+4) = √5 ,  ‖b‖ = √(4+16) = √20
cosine = 10 / (√5 · √20) = 10 / √100 = 10 / 10 = 1.0</div>
A cosine of <b>1.0</b> means "identical direction" — correct, since b is just 2×a. If b were
<code>[−2, −4]</code> (opposite way) it would be −1; at right angles, 0.</div>
<p><b>Why ML cares, in plain English:</b> often <i>direction means the meaning, and size is just
loudness.</i> Two users have the same <b>taste</b> if their rating vectors point the same way,
even if one rates far more movies — cosine ignores the volume and compares the taste. The same
idea powers <b>semantic search</b> and <b>RAG</b>: a sentence's meaning is stored as a vector
(an "embedding"), and two texts are judged similar in meaning when their vectors point the same
way. Cosine similarity is the single most common "how alike are these?" measure in modern ML.</p>

<div class="demystify"><b>Demystify "norm":</b> an ordinary word made scary. A norm is a
<i>ruler</i> — a rule for assigning a length. L2 is the ruler of straight-line distance;
L1 is the ruler of a taxi driving a street grid. Different rulers, different behavior (L2
punishes big coordinates harder — squares again!) — and choosing the ruler is a modelling
decision, not a formality.</div>`,
 docs:[['NumPy — linalg.norm','https://numpy.org/doc/stable/reference/generated/numpy.linalg.norm.html']],
 quiz:{title:'Quick check',questions:[
   {q:'The distance between two data points a and b, as vectors, is:',
    options:['a · b','The norm of their difference, ‖a − b‖','Their average','The number of matching entries'],answer:1,
    why:'Subtract, then measure the length of the gap. Nearest-neighbor methods are exactly this.'},
   {q:'Cosine similarity divides the dot product by both lengths. What does that buy?',
    options:['Faster computation','Only DIRECTION matters — two users with the same taste match even if one rates 10× more movies','It guarantees a positive answer','Nothing; it equals the dot product'],answer:1,
    why:'Dividing out the lengths removes magnitude, leaving the angle — pure "same taste?" with 1 = identical direction.'},
   {q:'The L1 norm of [3, −4] and the L2 norm of [3, −4] are:',
    options:['7 and 5','5 and 7','1 and 25','Both 7'],answer:0,
    why:'L1 = |3| + |−4| = 7 (city-block). L2 = √(9+16) = 5 (straight line). Two rulers, two answers.'}
 ]},
 exs:[{title:'Build a tiny recommender: who is closest to Alice?',
   lang:'python',
   packages:['numpy'],
   prompt:`Three users rated three movies (0–5): <code>alice = [5, 1, 4]</code>,
   <code>bob = [4, 0, 5]</code>, <code>carol = [1, 5, 0]</code>. Compute:
   <ol>
   <li><code>dist_bob</code> — Euclidean (L2) distance from Alice to Bob (≈ 1.732),</li>
   <li><code>dist_carol</code> — distance from Alice to Carol (≈ 6.928),</li>
   <li><code>cos_bob</code> — cosine similarity of Alice and Bob (≈ 0.964 — same taste),</li>
   <li><code>closest</code> — the string <code>"bob"</code> or <code>"carol"</code>, whoever is nearer to Alice.</li>
   </ol>
   You have just implemented the heart of "users like you also watched…".`,
   starter:`import math

alice = [5.0, 1.0, 4.0]
bob   = [4.0, 0.0, 5.0]
carol = [1.0, 5.0, 0.0]

def dot(a, b):
    return sum(a[i] * b[i] for i in range(len(a)))

def norm(v):
    return math.sqrt(sum(x * x for x in v))

def diff(a, b):
    return [a[i] - b[i] for i in range(len(a))]

# 1) L2 distance Alice–Bob: the norm of the difference (alice - bob)
dist_bob =

# 2) L2 distance Alice–Carol
dist_carol =

# 3) Cosine similarity Alice–Bob: dot / (norm * norm)
cos_bob =

# 4) "bob" or "carol" — whoever is closer to Alice
closest =

print(dist_bob, dist_carol, cos_bob, closest)
`,
   solution:`import math

alice = [5.0, 1.0, 4.0]
bob   = [4.0, 0.0, 5.0]
carol = [1.0, 5.0, 0.0]

def dot(a, b):
    return sum(a[i] * b[i] for i in range(len(a)))

def norm(v):
    return math.sqrt(sum(x * x for x in v))

def diff(a, b):
    return [a[i] - b[i] for i in range(len(a))]

# 1) L2 distance Alice–Bob: the norm of the difference (alice - bob)
dist_bob = norm(diff(alice, bob))

# 2) L2 distance Alice–Carol
dist_carol = norm(diff(alice, carol))

# 3) Cosine similarity Alice–Bob: dot / (norm * norm)
cos_bob = dot(alice, bob) / (norm(alice) * norm(bob))

# 4) "bob" or "carol" — whoever is closer to Alice
closest = "bob" if dist_bob < dist_carol else "carol"

print(dist_bob, dist_carol, cos_bob, closest)
`,
   tests:[
     {d:'Alice–Bob distance is √3 ≈ 1.732',expr:'abs(dist_bob - 3**0.5) < 1e-6'},
     {d:'Alice–Carol distance is √48 ≈ 6.928',expr:'abs(dist_carol - 48**0.5) < 1e-6'},
     {d:'cosine similarity Alice–Bob ≈ 0.964 (same taste)',expr:'abs(cos_bob - 0.9639) < 0.001'},
     {d:'closest is "bob" — the recommendation engine works',expr:'closest == "bob"'}
   ],
   hints:[
     'Distance = norm of the difference: norm(diff(alice, bob)). The helpers are given.',
     'Cosine = dot(alice, bob) / (norm(alice) * norm(bob)).',
     'Pick the smaller distance: closest = "bob" if dist_bob < dist_carol else "carol".'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> By hand, find the L2 norm and the L1 norm of <code>[6, 8]</code>.`,
    solution:`<b>L2</b> = √(6² + 8²) = √(36 + 64) = √100 = <b>10</b>. <b>L1</b> = |6| + |8| = <b>14</b>. The straight-line length is 10; the city-block length is 14.`},
   {q:`<b>2.</b> Compute the cosine similarity of <code>a = [1, 0]</code> and <code>b = [1, 1]</code> by hand. What angle does that correspond to?`,
    solution:`dot = (1)(1) + (0)(1) = 1. ‖a‖ = 1, ‖b‖ = √2. cosine = 1 / (1·√2) = 1/√2 ≈ <b>0.707</b>. Since cos(45°) = 0.707, the two vectors are <b>45° apart</b> — moderately similar in direction, as you'd expect for "right" vs "diagonally up-right."`}
 ]}},

{id:'ladet',
 title:'Fundamentals: the determinant — one number that says how a matrix warps space',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Now that you have seen a matrix <b>reshape space</b> (the last lesson — stretch, shear,
rotate, flip), the <b>determinant</b> measures one specific thing about that reshaping: <b>how
much it grows or shrinks area (in 2D) or volume (in 3D)</b>. It is a single number squeezed out
of a <i>square</i> matrix, and that one number quietly powers a lot — it tells you whether the
transformation can be <i>reversed</i> (inverted — the next lessons), whether your features are
redundant, and how probabilities rescale when you change variables. We build it from a worked
example, not a formula dump.</p></div>

<h3>Computing it — the 2×2 case, by hand</h3>
<p>For a 2×2 matrix the determinant is <b>"main diagonal product minus anti-diagonal
product"</b>:</p>
<div class="mathblock">det | a  b | = a·d − b·c
    | c  d |</div>
<div class="worked"><b>✍️ Worked by hand.</b> Take <code>A = [[3, 1], [2, 4]]</code>:
<div class="mathblock">det | 3  1 | = (3)(4) − (1)(2) = 12 − 2 = 10
    | 2  4 |</div>
So <code>det(A) = 10</code>. Now a second one, <code>S = [[2, 4], [1, 2]]</code>:
<div class="mathblock">det | 2  4 | = (2)(2) − (4)(1) = 4 − 4 = 0
    | 1  2 |</div>
<code>det(S) = 0</code> — and notice <i>why</i>: row 2 <code>[1,2]</code> is just half of row 1
<code>[2,4]</code>. The rows carry the same direction, so <code>S</code> is degenerate. Zero
determinant is the fingerprint of that.</div>

<h3>What the number MEANS — area scaling</h3>
<p>Picture the unit square (corners at the origin, area 1). Feed its corners through a matrix
and it becomes a parallelogram. <b>The determinant is the area of that parallelogram</b> —
i.e. the factor by which the matrix scales <i>every</i> area.</p>
<div class="worked"><b>✍️ Worked — the stretch matrix.</b> <code>D = [[3, 0], [0, 2]]</code>
stretches x by 3 and y by 2.
<div class="mathblock">det | 3  0 | = (3)(2) − (0)(0) = 6
    | 0  2 |</div>
The unit square (area 1) becomes a 3-wide, 2-tall rectangle (area 6) — exactly the
determinant. So "det = 6" literally means <b>this transformation makes every area 6× bigger</b>.
A <b>det of 0</b> means area is crushed to nothing — the square is flattened onto a line, a
dimension is lost, and (next lesson) that is precisely why the matrix has no inverse. A
<b>negative</b> determinant means the transformation also <i>flips</i> orientation (a mirror
image), and its size is still the area factor.</p></div>

<h3>Where it is used in the real world (and in ML)</h3>
<p>Beyond a school exercise, the determinant earns its keep: (1) <b>Can it be reversed?</b> —
<code>det ≠ 0</code> means the transformation preserves area (no dimension crushed), so it can be
<i>undone</i>; <code>det = 0</code> means it flattened space and cannot be reversed. "Can be
undone" has a name — <b>invertible</b> — which the next two lessons build in full. This is the
single most common use of the determinant.
(2) <b>Detecting redundant features</b> — a near-zero determinant of <code>XᵀX</code> warns
that features are collinear and a regression will be unstable. (3) <b>Area / volume</b> — the
determinant of the vectors' matrix gives the area (2D) or volume (3D) they span, used in
graphics and geometry. (4) <b>Change of variables</b> — when you transform a probability
distribution, densities rescale by the determinant of the transformation (the "Jacobian
determinant"); this is the engine behind change-of-variables in statistics and
<b>normalizing flows</b> in modern generative ML. One number, all of these jobs.</p>

<div class="demystify"><b>Demystify "determinant":</b> the name comes from its original job —
it <i>determines</i> whether a system of equations has a unique solution (yes ⟺ det ≠ 0). Do
not memorize the bigger-matrix formulas; understand the meaning (area/volume scaling; zero =
collapsed = non-invertible) and let <code>np.linalg.det</code> crunch the arithmetic. For 3×3
and up it is more work by hand, but the <i>meaning</i> is identical — a volume-scaling factor.</div>`,
 docs:[['Determinant — the geometric meaning (3Blue1Brown)','https://www.3blue1brown.com/lessons/determinant'],['np.linalg.det','https://numpy.org/doc/stable/reference/generated/numpy.linalg.det.html']],
 quiz:{title:'Quick check',questions:[
   {q:'The determinant of [[3, 1], [2, 4]] is:',
    options:['14','10 — main diagonal (3·4) minus anti-diagonal (1·2) = 12 − 2','5','12'],answer:1,
    why:'2×2 determinant is ad − bc = (3)(4) − (1)(2) = 12 − 2 = 10.'},
   {q:'Geometrically, a determinant of 6 means the matrix:',
    options:['Has 6 rows','Scales every area (or volume) by a factor of 6','Adds 6 to each entry','Has 6 as an entry'],answer:1,
    why:'The determinant is the area/volume scaling factor of the transformation — the unit square becomes a shape of area 6.'},
   {q:'A determinant of 0 tells you the matrix:',
    options:['Is very large','Collapses space onto a lower dimension — so it is singular (no inverse), often because rows/columns are redundant','Is the identity','Doubles everything'],answer:1,
    why:'Zero area scaling = a dimension is crushed flat = not invertible. It is the fingerprint of dependent rows/columns.'}
 ]},
 exs:[{title:'Determinants by hand (the ad − bc rule)',
   lang:'python',
   prompt:`Write a 2×2 determinant function and use it:
   <ol>
   <li><code>det(M)</code> — returns <code>M[0][0]*M[1][1] - M[0][1]*M[1][0]</code> (main diagonal minus anti-diagonal),</li>
   <li><code>det_A</code> = det of <code>[[3, 1], [2, 4]]</code> (→ 10),</li>
   <li><code>det_S</code> = det of <code>[[2, 4], [1, 2]]</code> (→ 0, redundant rows),</li>
   <li><code>det_D</code> = det of <code>[[3, 0], [0, 2]]</code> (→ 6, scales area ×6).</li>
   </ol>`,
   starter:`def det(M):
    # 2x2 determinant: main diagonal product minus anti-diagonal product
    pass

A = [[3, 1], [2, 4]]
S = [[2, 4], [1, 2]]
D = [[3, 0], [0, 2]]

det_A =
det_S =
det_D =

print(det_A, det_S, det_D)
`,
   solution:`def det(M):
    # 2x2 determinant: main diagonal product minus anti-diagonal product
    return M[0][0] * M[1][1] - M[0][1] * M[1][0]

A = [[3, 1], [2, 4]]
S = [[2, 4], [1, 2]]
D = [[3, 0], [0, 2]]

det_A = det(A)
det_S = det(S)
det_D = det(D)

print(det_A, det_S, det_D)
`,
   tests:[
     {d:'the ad − bc rule gives det(A) = 10',expr:'det_A == 10'},
     {d:'the redundant matrix has determinant 0 (rows are dependent)',expr:'det_S == 0'},
     {d:'the stretch matrix has determinant 6 — it scales area ×6',expr:'det_D == 6'},
     {d:'det works on another matrix too: det([[1,2],[3,4]]) = -2',expr:'det([[1,2],[3,4]]) == -2'}
   ],
   hints:[
     'return M[0][0]*M[1][1] - M[0][1]*M[1][0] — main diagonal product minus anti-diagonal product.',
     'det(A) = 3*4 - 1*2 = 10. det(S) = 2*2 - 4*1 = 0 (row2 = ½·row1).',
     'det(D) = 3*2 - 0*0 = 6 — the area-scaling factor of the stretch.'
   ]}],
 homework:{intro:'Compute these determinants by hand (2×2 is just ad − bc), then check in the Playground with np.linalg.det.',problems:[
   {q:`<b>1.</b> Find the determinants of <code>[[5, 2], [3, 4]]</code> and <code>[[6, 3], [2, 1]]</code>. Which one is invertible?`,
    solution:`<code>det[[5,2],[3,4]] = (5)(4) − (2)(3) = 20 − 6 = <b>14</b></code> — non-zero, so <b>invertible</b>.<br>
    <code>det[[6,3],[2,1]] = (6)(1) − (3)(2) = 6 − 6 = <b>0</b></code> — zero, so <b>not invertible</b> (notice row 1 = 3× row 2: <code>[6,3] = 3·[2,1]</code>, redundant rows).`},
   {q:`<b>2. (Meaning)</b> The matrix <code>[[4, 0], [0, 0.5]]</code> stretches x by 4 and shrinks y to half. What is its determinant, and what does that number say about areas?`,
    solution:`<code>det = (4)(0.5) − (0)(0) = <b>2</b></code>. So the transformation multiplies every area by <b>2</b>: a unit square (area 1) becomes a 4-wide, 0.5-tall rectangle of area 2. Stretching by 4 and shrinking by 0.5 nets ×2 on area — the determinant captures the combined effect in one number.`},
   {q:`<b>3. (Concept)</b> Without computing, explain why any matrix with a row of all zeros must have determinant 0.`,
    solution:`A zero row means the transformation sends one whole direction to nothing — space is flattened, so the area/volume scaling factor is 0. (Algebraically, every term of the determinant multiplies one entry from that row, and they are all 0.) A zero determinant means the matrix is singular: it collapses a dimension and cannot be inverted.`}
 ]}},

{id:'la4',
 title:'Fundamentals: the inverse — undoing a matrix, and solving for a model exactly',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>You know matrices <i>transform</i> vectors. The <b>inverse</b> matrix <code>A⁻¹</code>
<b>undoes</b> the transformation: <code>A⁻¹ @ (A @ v) = v</code>, and
<code>A @ A⁻¹ = I</code> — apply, un-apply, back where you started (that is exactly what the
identity from lesson 2 was <i>for</i>). Why ML cares: "find the weights that fit the data" is
often literally "un-apply the data matrix" — solving equations at scale.</p></div>

<h3>Computing a 2×2 inverse, by hand</h3>
<p>There is a clean formula for the 2×2 case: <b>swap the diagonal, negate the off-diagonal,
and divide by the determinant.</b></p>
<div class="mathblock">A = | a  b |     ⟹     A⁻¹ = (1 / det) · |  d  −b |
    | c  d |                              | −c   a |     where det = ad − bc</div>
<div class="worked"><b>✍️ Worked by hand.</b> Invert <code>A = [[4, 3], [2, 2]]</code>.
<div class="mathblock">Step 1 — determinant:  det = (4)(2) − (3)(2) = 8 − 6 = 2
Step 2 — rearrange:    | d  −b | = |  2  −3 |
                       |−c   a |   | −2   4 |
Step 3 — divide by det (2):
   A⁻¹ = (1/2)·|  2  −3 | = |  1.0  −1.5 |
              | −2   4 |   | −1.0   2.0 |</div>
Check it undoes A (multiply them, one entry at a time):
<div class="mathblock">A @ A⁻¹ , row1·col1 = [4,3]·[1,−1] = 4 − 3 = 1
          row1·col2 = [4,3]·[−1.5, 2] = −6 + 6 = 0
          row2·col1 = [2,2]·[1,−1] = 2 − 2 = 0
          row2·col2 = [2,2]·[−1.5, 2] = −3 + 4 = 1
        = | 1  0 |  =  I   ✓
          | 0  1 |</div>
See where the determinant comes in? You <b>divide by it</b> — so if <code>det = 0</code>, the
formula asks you to divide by zero, and the inverse simply does not exist. That is the algebra
behind "singular = no inverse."</div>

<h3>Solving many equations at once</h3>
<p>Suppose predictions work like <code>A @ w = b</code>: known data <code>A</code>, observed
outcomes <code>b</code>, unknown weights <code>w</code>. School algebra would grind through
substitution. Linear algebra says: <code>w = A⁻¹ @ b</code> — one line, any number of
equations. In practice you call <code>np.linalg.solve(A, b)</code> (faster and more accurate
than computing the inverse explicitly — a real practitioner habit worth having from day 1).</p>

<h3>When you CANNOT undo: singular matrices</h3>
<p>Some matrices destroy information — like multiplying by zero, there is no way back. A
matrix whose rows/columns repeat information (one column is twice another) is <b>singular</b>:
no inverse exists. Its <b>determinant</b> is 0 — the number that flags it. In ML this is not
exotic: put the same feature into your dataset twice (height in cm AND in metres) and the
math of exact fitting breaks in precisely this way. "Singular matrix" errors in real libraries
are usually <i>redundant features</i> talking to you.</p>

<div class="demystify"><b>Demystify "determinant":</b> geometrically it is the <i>volume
scaling factor</i> of the transformation — how much the matrix stretches space. Determinant 0
means space gets squashed flat (a dimension is lost) — and information squashed flat cannot be
un-squashed. That is the whole reason det = 0 ⇔ no inverse.</div>`,
 docs:[['NumPy — linalg.solve','https://numpy.org/doc/stable/reference/generated/numpy.linalg.solve.html']],
 quiz:{title:'Quick check',questions:[
   {q:'The defining property of the inverse A⁻¹ is:',
    options:['A⁻¹ has negative entries','A @ A⁻¹ = I — applying then un-applying lands on "do nothing"','A⁻¹ is A flipped upside down','Every matrix has one'],answer:1,
    why:'Inverse = undo, and "undone" means the identity: the do-nothing matrix from lesson 2.'},
   {q:'A dataset accidentally contains height-in-cm AND height-in-metres as two columns. Exact solving breaks because:',
    options:['The numbers are too big','The matrix is singular — one column is a multiple of the other, so information is redundant and the transformation cannot be undone','Python forbids duplicate columns','Heights are always Gaussian'],answer:1,
    why:'Redundant columns squash a dimension flat (det = 0). Real "singular matrix" errors usually mean exactly this.'},
   {q:'Why prefer np.linalg.solve(A, b) over np.linalg.inv(A) @ b?',
    options:['solve is more accurate and faster — computing an explicit inverse is wasteful','inv does not exist in NumPy','They give unrelated answers','solve works on strings'],answer:0,
    why:'A real-practice habit: solvers avoid explicitly forming the inverse, which is slower and numerically worse.'}
 ]},
 exs:[{title:'Invert a 2×2 by hand and recover a model',
   lang:'python',
   prompt:`Use the 2×2 inverse formula (swap the diagonal, negate the off-diagonal, divide by the
   determinant). Data <code>A = [[2, 1], [1, 3]]</code>, outcomes <code>b = [5, 10]</code>:
   <ol>
   <li><code>d</code> — the determinant of A (ad − bc → 5),</li>
   <li><code>A_inv</code> — the inverse: <code>[[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]]</code> each divided by <code>d</code>,</li>
   <li><code>w</code> — the weights, <code>A_inv</code> applied to <code>b</code> (expect [1.0, 3.0]),</li>
   <li><code>det_S</code> — the determinant of <code>S = [[1, 2], [2, 4]]</code> (expect 0 — no inverse possible).</li>
   </ol>`,
   starter:`def apply(M, v):
    return [sum(M[i][j] * v[j] for j in range(len(v))) for i in range(len(M))]

A = [[2, 1], [1, 3]]
b = [5, 10]

# 1) determinant of A (ad - bc)
d =

# 2) inverse by the formula (swap diagonal, negate off-diagonal, divide by d)
A_inv =

# 3) the weights: apply A_inv to b
w =

# 4) determinant of a redundant matrix
S = [[1, 2], [2, 4]]
det_S =

print(d, w, det_S)
`,
   solution:`def apply(M, v):
    return [sum(M[i][j] * v[j] for j in range(len(v))) for i in range(len(M))]

A = [[2, 1], [1, 3]]
b = [5, 10]

# 1) determinant of A (ad - bc)
d = A[0][0] * A[1][1] - A[0][1] * A[1][0]

# 2) inverse by the formula (swap diagonal, negate off-diagonal, divide by d)
A_inv = [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]

# 3) the weights: apply A_inv to b
w = apply(A_inv, b)

# 4) determinant of a redundant matrix
S = [[1, 2], [2, 4]]
det_S = S[0][0] * S[1][1] - S[0][1] * S[1][0]

print(d, w, det_S)
`,
   tests:[
     {d:'determinant of A is 5',expr:'d == 5'},
     {d:'the inverse recovers the true weights w = [1, 3]',expr:'abs(w[0] - 1.0) < 1e-9 and abs(w[1] - 3.0) < 1e-9'},
     {d:'applying A back to w reproduces b = [5, 10]',expr:'apply(A, w) == [5, 10] or (abs(apply(A,w)[0]-5)<1e-9 and abs(apply(A,w)[1]-10)<1e-9)'},
     {d:'the duplicated-information matrix has determinant 0 — no way back',expr:'det_S == 0'}
   ],
   hints:[
     'd = A[0][0]*A[1][1] - A[0][1]*A[1][0] = 2*3 - 1*1 = 5.',
     'Inverse: swap the diagonal (A[1][1], A[0][0]), negate the off-diagonal, divide every entry by d.',
     'w = apply(A_inv, b). Verify by eye: 2·1 + 1·3 = 5 ✓ and 1·1 + 3·3 = 10 ✓. S has row2 = 2·row1, so det_S = 0.'
   ]}],
 homework:{intro:'Invert 2×2 matrices by hand with the swap-negate-divide formula, then verify by multiplying back to the identity.',problems:[
   {q:`<b>1.</b> Find the inverse of <code>A = [[2, 1], [1, 1]]</code> using the 2×2 formula, and verify <code>A · A⁻¹ = I</code>.`,
    solution:`<b>Determinant:</b> <code>det = (2)(1) − (1)(1) = 1</code>.<br>
    <b>Rearrange</b> (swap diagonal, negate off-diagonal): <code>| 1  −1 |  over  |−1   2 |</code>, i.e. <code>[[1, −1], [−1, 2]]</code>. Divide by det = 1, so it is unchanged: <code>A⁻¹ = [[1, −1], [−1, 2]]</code>.<br>
    <b>Check:</b> row1·col1 = [2,1]·[1,−1] = 2 − 1 = 1; row1·col2 = [2,1]·[−1,2] = −2 + 2 = 0; row2·col1 = [1,1]·[1,−1] = 0; row2·col2 = [1,1]·[−1,2] = 1. Result = <code>[[1,0],[0,1]] = I</code> ✓.`},
   {q:`<b>2.</b> Try to invert <code>[[2, 4], [1, 2]]</code>. What goes wrong, and what does it mean?`,
    solution:`<b>Determinant:</b> <code>det = (2)(2) − (4)(1) = 4 − 4 = 0</code>. The inverse formula divides by the determinant, so you would divide by <b>zero</b> — the inverse <b>does not exist</b>. The matrix is <b>singular</b>: its rows are dependent (<code>[2,4] = 2·[1,2]</code>), it collapses a dimension, and there is no way to undo it. In ML this is what a duplicated/collinear feature does to <code>XᵀX</code>.`},
   {q:`<b>3. (ML link)</b> Why does regression solve <code>w = (XᵀX)⁻¹Xᵀy</code> rather than <code>w = X⁻¹y</code>?`,
    solution:`Because <code>X</code> (the data matrix) is almost never square — it has many more rows (examples) than columns (features) — and <b>only square matrices have an inverse</b>. The trick is that <code>XᵀX</code> <i>is</i> square (features × features), so it can be inverted (when features are independent). Multiplying by <code>Xᵀ</code> first turns the un-invertible tall <code>X</code> into a square, solvable system — that is the whole reason the normal equations look the way they do.`}
 ]}},

{id:'la8',
 title:'Fundamentals: span, basis & independence — what your features can (and cannot) express',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Three ideas that sound abstract but answer a very practical ML question: <i>"what can my
model actually reach with these features?"</i> A linear model's predictions are always a
<b>combination</b> of its feature directions — some amount of this one plus some amount of
that one. The set of everything reachable that way is the <b>span</b>. If the true answer
lies outside the span of your features, no amount of training will get there. That is why
"add a better feature" often beats "train harder."</p></div>

<h3>Linear combinations and span</h3>
<p>A <b>linear combination</b> of vectors is scaled copies added together:
<code>c₁·b₁ + c₂·b₂</code>. The <b>span</b> of a set of vectors is everything you can build
that way. Two useful pictures: <code>[1,0]</code> and <code>[0,1]</code> span the whole 2D
plane (any point = so much right + so much up); a single vector spans only the line through
it.</p>

<h3>Independence: does a new feature add anything?</h3>
<p>Vectors are <b>linearly independent</b> when none of them can be built from the others —
each genuinely adds a new direction. <code>[1,2]</code> and <code>[2,4]</code> are
<i>dependent</i>: the second is just twice the first, adds nothing, and their span is still
one line. Sound familiar? That is precisely the duplicated-feature disease from the inverse
lesson (height in cm and in metres), and precisely what <b>rank</b> counts: rank = the number
of independent directions = the true dimension of the span.</p>

<h3>Basis: the minimal honest description</h3>
<p>A <b>basis</b> is an independent set that spans the space — no redundancy, nothing missing;
every point has exactly one recipe in terms of it. Finding the coefficients of that recipe is
a <code>solve</code> — the same tool as last lesson. And a preview with teeth: <b>PCA</b>
(two lessons ahead) is nothing but choosing a <i>better basis</i> for your data — axes along
the real variation instead of the arbitrary original columns.</p>

<div class="demystify"><b>Demystify "span/basis/rank":</b> three words, one question each.
Span: <i>what is reachable?</i> Independence: <i>does this direction add anything new?</i>
Basis: <i>what is the minimal set that reaches everything?</i> Rank: <i>how many genuinely
different directions are in here?</i> All four are bookkeeping about expressiveness — which
is why they matter to models.</div>`,
 docs:[['3Blue1Brown — span and basis','https://www.3blue1brown.com/lessons/span']],
 quiz:{title:'Quick check',questions:[
   {q:'The span of the vectors [1,0] and [0,1] is:',
    options:['Just those two points','The entire 2D plane — any point is some amount right plus some amount up','A single line','Empty'],answer:1,
    why:'Every 2D point is a linear combination c₁·[1,0] + c₂·[0,1]. Two independent directions span the plane.'},
   {q:'[1,2] and [2,4] are linearly dependent. Practically, this means:',
    options:['They are both long','The second adds NO new direction — like a duplicated feature, the span is still just one line','They are perpendicular','They span the plane'],answer:1,
    why:'[2,4] = 2·[1,2]: redundant information. Rank 1, singular matrix, "add a feature that says nothing new."'},
   {q:'If the true relationship lies OUTSIDE the span of your features, then:',
    options:['More training epochs will fix it','No linear model on those features can reach it — you need new/better features','The learning rate is wrong','The data is corrupted'],answer:1,
    why:'A model can only combine what it is given. Expressiveness is set by the span — which is why feature engineering matters.'}
 ]},
 exs:[{title:'Recipes, redundancy, and reach (pure Python)',
   lang:'python',
   prompt:`Basis vectors <code>b1 = [1, 0]</code> and <code>b2 = [1, 1]</code>; target
   <code>t = [3, 5]</code>. Writing <code>t = c1·b1 + c2·b2</code> gives two equations —
   solve them by hand:
   <ol>
   <li><code>c2</code> — from the 2nd coordinate: <code>c1·0 + c2·1 = 5</code>, so c2 = 5,</li>
   <li><code>c1</code> — from the 1st: <code>c1·1 + c2·1 = 3</code>, so c1 = 3 − c2 = −2,</li>
   <li><code>rebuilt</code> — <code>[c1·b1[0] + c2·b2[0], c1·b1[1] + c2·b2[1]]</code>, which must equal t,</li>
   <li><code>rank_D</code> — the rank of <code>D = [[1, 2], [2, 4]]</code>: 2 if its determinant ≠ 0, else 1 (dependent). Expect <b>1</b>. <code>rank_B</code> similarly for <code>B = [[1, 1], [0, 1]]</code> (expect <b>2</b>).</li>
   </ol>`,
   starter:`b1 = [1, 0]
b2 = [1, 1]
t  = [3, 5]

# 1) c2 from the second coordinate (c1*0 + c2*1 = 5)
c2 =

# 2) c1 from the first coordinate (c1*1 + c2*1 = 3)
c1 =

# 3) rebuild t from the recipe c1*b1 + c2*b2
rebuilt =

# 4) rank of a 2x2 = 2 if det != 0, else 1 (if not all zero)
def rank2(M):
    det = M[0][0]*M[1][1] - M[0][1]*M[1][0]
    if det != 0:
        return 2
    return 1 if any(x != 0 for row in M for x in row) else 0

rank_D = rank2([[1, 2], [2, 4]])
rank_B = rank2([[1, 1], [0, 1]])

print(c1, c2, rebuilt, rank_D, rank_B)
`,
   solution:`b1 = [1, 0]
b2 = [1, 1]
t  = [3, 5]

# 1) c2 from the second coordinate (c1*0 + c2*1 = 5)
c2 = 5

# 2) c1 from the first coordinate (c1*1 + c2*1 = 3)
c1 = 3 - c2

# 3) rebuild t from the recipe c1*b1 + c2*b2
rebuilt = [c1 * b1[0] + c2 * b2[0], c1 * b1[1] + c2 * b2[1]]

# 4) rank of a 2x2 = 2 if det != 0, else 1 (if not all zero)
def rank2(M):
    det = M[0][0]*M[1][1] - M[0][1]*M[1][0]
    if det != 0:
        return 2
    return 1 if any(x != 0 for row in M for x in row) else 0

rank_D = rank2([[1, 2], [2, 4]])
rank_B = rank2([[1, 1], [0, 1]])

print(c1, c2, rebuilt, rank_D, rank_B)
`,
   tests:[
     {d:'the recipe is c1 = -2, c2 = 5 (t = -2·b1 + 5·b2)',expr:'c1 == -2 and c2 == 5'},
     {d:'the recipe rebuilds t = [3, 5] exactly',expr:'rebuilt == [3, 5]'},
     {d:'dependent pair has rank 1 — one direction, despite two columns',expr:'rank_D == 1'},
     {d:'the basis has rank 2 — two genuinely different directions',expr:'rank_B == 2'}
   ],
   hints:[
     'The second coordinate isolates c2: 0·c1 + 1·c2 = 5 → c2 = 5.',
     'Substitute into the first: c1 + c2 = 3 → c1 = 3 - 5 = -2. Check: -2·[1,0] + 5·[1,1] = [3,5] ✓.',
     'rank2 uses the determinant: D has det 1·4−2·2 = 0 → rank 1; B has det 1 → rank 2.'
   ]}]},

{id:'la9',
 title:'Fundamentals: when is a matrix invertible? (and why ML cares)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>You met the inverse (the matrix that undoes a transformation) and saw that some matrices
have none. Now we answer the real question precisely: <b>when does a matrix have an inverse,
and when does it not?</b> This is not abstract trivia — the single most common numerical
failure in classic ML (a regression that blows up or refuses to fit) is <i>exactly</i> a
matrix that should be invertible but is not, and knowing why lets you fix it.</p></div>

<h3>The one condition, wearing five outfits</h3>
<p>For a <b>square</b> matrix, these statements are all the <i>same fact</i> — if one is true,
all are; if one fails, all fail:</p>
<div class="codeSample">A is invertible
  ⟺  det(A) ≠ 0                      (the determinant is non-zero)
  ⟺  A has full rank                 (rank = number of rows)
  ⟺  A's columns are independent     (none is a combination of the others)
  ⟺  A x = b has exactly one solution for every b
  ⟺  the transformation loses no information (it can be undone)</div>
<p>They connect through the ideas you already built: independent columns (last lesson) means
full rank; full rank means the transformation does not squash any dimension flat; not squashing
means a non-zero determinant (recall det = the volume-scaling factor); and losing no volume
means you can reverse it. One truth, five equivalent tests.</p>

<h3>When it FAILS: singular matrices</h3>
<p>A matrix with <b>no</b> inverse is called <b>singular</b>. It happens exactly when the
columns are <i>dependent</i> — one carries no new information (it is a combination of the
others). Then <code>det = 0</code>, the rank is deficient, the transformation collapses space
onto a lower dimension, and there is no way back (like trying to un-multiply by zero). And a
blunt fact often missed: <b>only square matrices can have a (true) inverse at all</b> — a
tall data matrix <code>X</code> (more rows than columns) is never invertible, which is
precisely why regression cannot just "invert X."</p>

<h3>Why ML cares — the collinear-features trap</h3>
<p>Linear regression's normal equations are <code>w = (XᵀX)⁻¹ Xᵀy</code>: they invert the
square matrix <code>XᵀX</code>. That inverse exists <b>only if the columns of X are
independent</b> — and they are <i>not</i> when two features carry the same information:
"price in dollars" and "price in euros" (one is 1.1× the other), or a one-hot encoding that
includes every category plus an all-ones column. Then <code>XᵀX</code> is singular, the inverse
does not exist, and a naive solver either crashes or returns garbage. The fixes are exactly the
tools ML reaches for:</p>
<p>• <b>Drop</b> the redundant feature (the cleanest fix). • Use the <b>pseudoinverse</b>
(<code>np.linalg.pinv</code>), which returns a sensible answer even when the true inverse does
not exist. • Add <b>regularization</b>: ridge regression solves
<code>(XᵀX + λI)⁻¹Xᵀy</code>, and that little <code>+ λI</code> nudge <b>guarantees</b> the
matrix is invertible (it restores full rank) — which is a big part of <i>why</i> regularization
makes models numerically stable, not just statistically humble.</p>

<div class="demystify"><b>Demystify "singular":</b> it does not mean "single" — in old
mathematical usage it means <i>special / degenerate</i>, a matrix that has collapsed onto
itself. "Non-singular" and "invertible" are the same word; "singular" and "not invertible" are
the same word. When a library throws <code>LinAlgError: singular matrix</code>, it is telling
you: your columns are secretly redundant — go find the duplicated information.</div>`,
 docs:[['Invertible matrix — the equivalent conditions','https://textbooks.math.gatech.edu/ila/invertible-matrix-theorem.html'],['np.linalg.pinv (pseudoinverse)','https://numpy.org/doc/stable/reference/generated/numpy.linalg.pinv.html']],
 quiz:{title:'Quick check',questions:[
   {q:'A square matrix is invertible if and only if:',
    options:['It has only positive entries','Its determinant is non-zero (equivalently: full rank, independent columns, a unique solution to Ax=b)','It is large enough','It is symmetric'],answer:1,
    why:'One fact, five equivalent tests: det≠0 ⟺ full rank ⟺ independent columns ⟺ unique solution ⟺ no information lost.'},
   {q:'You add "price in euros" to a model that already has "price in dollars" (euros = 1.1 × dollars). The normal equations break because:',
    options:['The numbers get too big','The two columns are dependent, so XᵀX is singular (no inverse) — collinear features have no unique solution','Euros are not supported','Regression cannot use money'],answer:1,
    why:'Redundant/collinear columns make XᵀX rank-deficient and non-invertible. This is THE classic real-world regression failure.'},
   {q:'How does ridge regression, (XᵀX + λI)⁻¹, help numerically?',
    options:['It deletes features','The + λI nudge restores full rank, guaranteeing the matrix is invertible even when XᵀX alone is singular','It makes the data bigger','It has no effect on invertibility'],answer:1,
    why:'Adding λI to the diagonal lifts a rank-deficient matrix back to full rank — so the inverse always exists. A key reason regularization stabilizes fitting.'}
 ]},
 exs:[{title:'Test invertibility — and watch ridge rescue a singular matrix',
   lang:'python',
   prompt:`Use the 2×2 determinant (ad − bc) as your invertibility test.
   <code>A = [[2, 1], [1, 3]]</code> (independent) and <code>S = [[1, 2], [2, 4]]</code>
   (column 2 = 2 × column 1):
   <ol>
   <li><code>det_A, det_S</code> — their determinants (A = 5, S = 0),</li>
   <li><code>A_invertible, S_invertible</code> — booleans from <code>abs(det) &gt; 1e-9</code>,</li>
   <li><code>det_ridge</code> — the determinant of the ridge-nudged matrix <code>S + 0.1·I</code> = <code>[[1.1, 2], [2, 4.1]]</code>: it is non-zero, so invertible again.</li>
   </ol>`,
   starter:`def det(M):
    return M[0][0]*M[1][1] - M[0][1]*M[1][0]

A = [[2, 1], [1, 3]]
S = [[1, 2], [2, 4]]   # column 2 is 2x column 1 — dependent!

# 1) determinants
det_A =
det_S =

# 2) invertible? (determinant meaningfully non-zero)
A_invertible =
S_invertible =

# 3) ridge fix: add 0.1 down the diagonal, then take the determinant
ridge = [[S[0][0] + 0.1, S[0][1]], [S[1][0], S[1][1] + 0.1]]
det_ridge =

print(det_A, det_S, A_invertible, S_invertible, det_ridge)
`,
   solution:`def det(M):
    return M[0][0]*M[1][1] - M[0][1]*M[1][0]

A = [[2, 1], [1, 3]]
S = [[1, 2], [2, 4]]   # column 2 is 2x column 1 — dependent!

# 1) determinants
det_A = det(A)
det_S = det(S)

# 2) invertible? (determinant meaningfully non-zero)
A_invertible = abs(det_A) > 1e-9
S_invertible = abs(det_S) > 1e-9

# 3) ridge fix: add 0.1 down the diagonal, then take the determinant
ridge = [[S[0][0] + 0.1, S[0][1]], [S[1][0], S[1][1] + 0.1]]
det_ridge = det(ridge)

print(det_A, det_S, A_invertible, S_invertible, det_ridge)
`,
   tests:[
     {d:'A has non-zero determinant (det = 5)',expr:'det_A == 5'},
     {d:'S has determinant 0 — it is singular',expr:'det_S == 0'},
     {d:'A is invertible, S is not',expr:'A_invertible == True and S_invertible == False'},
     {d:'ridge (S + 0.1·I) is invertible again — det is non-zero (0.51)',expr:'abs(det_ridge - 0.51) < 1e-9'}
   ],
   hints:[
     'det(M) = ad − bc. det(A) = 2·3 − 1·1 = 5; det(S) = 1·4 − 2·2 = 0.',
     'Invertible test: abs(det) > 1e-9 (a tiny threshold, since floating point rarely gives exactly 0).',
     'The ridge matrix adds 0.1 down the diagonal → [[1.1, 2], [2, 4.1]]; det = 1.1·4.1 − 2·2 = 4.51 − 4 = 0.51 ≠ 0 — the +λI trick making a singular matrix solvable.'
   ]}],
 homework:{intro:'Do these by hand first (they are small on purpose), then reveal the worked solution. A calculator is fine; the point is the reasoning.',problems:[
   {q:'<b>1.</b> Is <code>M = [[1, 2], [2, 4]]</code> invertible? Compute its determinant by hand and say why.',
    solution:`The determinant of <code>[[a, b], [c, d]]</code> is <code>ad − bc</code>.<br>
    Here: <code>det = (1)(4) − (2)(2) = 4 − 4 = <b>0</b></code>.<br>
    A zero determinant means <b>not invertible (singular)</b>. Confirm the reason: column 2
    <code>[2, 4]</code> is exactly <code>2 ×</code> column 1 <code>[1, 2]</code> — the columns
    are dependent, so the matrix has rank 1, not full rank 2.`},
   {q:'<b>2.</b> Is <code>D = [[2, 0], [0, 3]]</code> invertible? If so, write its inverse.',
    solution:`<code>det = (2)(3) − (0)(0) = 6 ≠ 0</code>, so <b>yes, invertible</b>.<br>
    A diagonal matrix inverts by reciprocating each diagonal entry:
    <code>D⁻¹ = [[1/2, 0], [0, 1/3]]</code>.<br>
    Check: <code>D · D⁻¹ = [[2·½, 0], [0, 3·⅓]] = [[1, 0], [0, 1]] = I</code> ✓.`},
   {q:`<b>3. (Concept)</b> A dataset has columns <code>height_cm</code> and a newly added <code>height_inches</code>. Explain, in terms of invertibility, why fitting a plain linear regression will now fail — and give two ways to fix it.`,
    solution:`<code>height_inches = height_cm / 2.54</code>, so the new column is a scalar
    multiple of the old one — the two feature columns are <b>linearly dependent</b>.<br>
    Therefore <code>XᵀX</code> is <b>singular</b> (rank-deficient), its inverse does not exist,
    and the normal equations <code>w = (XᵀX)⁻¹Xᵀy</code> have no unique solution — the solver
    fails or returns unstable, meaningless weights.<br>
    <b>Fixes (any one):</b> (a) drop one of the two redundant columns; (b) use the
    pseudoinverse <code>np.linalg.pinv</code>; (c) add regularization — ridge solves
    <code>(XᵀX + λI)⁻¹</code>, and the <code>+ λI</code> restores full rank so an inverse
    exists.`},
   {q:`<b>4. (Concept)</b> A 3-column data matrix has columns where the third is always the sum of the first two (col3 = col1 + col2). Without any computation, what is its rank, and why does that matter for a model?`,
    solution:`<b>Rank 2</b>, not 3. Although there are three columns, the third adds <i>no new
    information</i> — it is entirely determined by the first two (col1 + col2). Only two of the
    directions are genuinely independent. If these were features, the third would be redundant
    and would make <code>XᵀX</code> singular (rank-deficient), so the normal equations have no
    unique solution — the same collinear-feature trap as problem 3, one dimension larger. The
    fix is the same: drop the redundant column, use the pseudoinverse, or add regularization.`}
 ]}},

{id:'la5',
 title:'Fundamentals: least squares — when no exact answer exists (the geometry of regression)',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Last lesson had a perfect world: as many equations as unknowns, one exact answer. Real data
is never like that — 1,000 noisy houses, 2 knobs. <code>X @ w = y</code> has <b>no exact
solution</b>: no line passes through every point. <b>Least squares</b> is the principled
compromise: find the <code>w</code> whose predictions are <i>as close as possible</i> to
<code>y</code> — minimizing the squared error (the MSE story, now in matrix form). This IS
linear regression; you are about to fit your first real model with pure linear algebra.</p></div>

<h3>The transpose, and the one formula</h3>
<p>The <b>transpose</b> <code>Xᵀ</code> (in NumPy, <code>X.T</code>) flips rows and columns —
bookkeeping that lets shapes line up. With it, the least-squares answer is one line, the
<b>normal equations</b>: <code>w = (XᵀX)⁻¹ Xᵀ y</code>. You already own every piece:
transpose, matrix multiply, inverse. Assembled, they fit a regression model in closed form —
no iteration, no library, no magic.</p>

<h3>The geometry: a shadow</h3>
<p>Why "as close as possible" has a clean answer: the predictions <code>X @ w</code> can only
ever live in the "reachable set" your features span. Least squares <b>projects</b> the true
<code>y</code> onto that set — like a shadow cast onto a wall: the closest reachable point.
The tell-tale signature: the leftover error (the <b>residual</b>) is <i>perpendicular</i> to
the features — <code>Xᵀ(y − Xw) = 0</code>. Your exercise verifies that orthogonality on real
numbers; when you see it print ≈0, you are watching the geometry of regression work.</p>

<div class="demystify"><b>Demystify "normal equations":</b> nothing to do with the normal
distribution here — "normal" is the geometry word for <i>perpendicular</i>. The equations
literally say "make the residual perpendicular to the features." A name that finally makes
sense once someone tells you which meaning of normal is intended.</div>`,
 docs:[['Least squares — the geometric picture (3Blue1Brown-style)','https://textbooks.math.gatech.edu/ila/least-squares.html']],
 quiz:{title:'Quick check',questions:[
   {q:'With 1,000 noisy data points and 2 weights, X @ w = y has:',
    options:['Exactly one exact solution','Usually NO exact solution — least squares finds the closest achievable predictions instead','Infinitely many exact solutions','No meaning'],answer:1,
    why:'More equations than knobs + noise = nothing fits perfectly. Least squares minimizes the squared miss — regression itself.'},
   {q:'The least-squares solution leaves a residual (error) that is:',
    options:['Zero','Perpendicular to the features — the shadow geometry, Xᵀ(y − Xw) = 0','Always positive','Equal to y'],answer:1,
    why:'Projection drops a perpendicular. That orthogonality is the definition of "closest reachable point" and the content of the normal equations.'},
   {q:'"Normal" in "normal equations" refers to:',
    options:['The normal distribution','Perpendicular — the residual is normal (at right angles) to the feature directions','Ordinary, as in not special','Normalization of the data'],answer:1,
    why:'A geometry word, not a statistics word. The equations enforce perpendicularity of the leftover error.'}
 ]},
 exs:[{title:'Fit a regression line by the normal equations (pure Python)',
   lang:'python',
   prompt:`Four noisy measurements: <code>x = [1, 2, 3, 4]</code>,
   <code>y = [3.1, 4.9, 7.2, 8.8]</code> (true process near <code>2x + 1</code>). For a straight
   line, the normal equations solve to these sum formulas (n = number of points):
   <ol>
   <li><code>slope</code> = <code>(n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)</code> (≈ 1.94),</li>
   <li><code>intercept</code> = <code>(Σy − slope·Σx) / n</code> (≈ 1.15),</li>
   <li><code>ortho</code> — <code>[Σ(residualᵢ), Σ(xᵢ·residualᵢ)]</code> where residualᵢ = yᵢ − (intercept + slope·xᵢ); both must be ≈ 0 (the two normal equations = the residual is perpendicular to the features),</li>
   <li><code>pred_5</code> — the prediction at x = 5 (≈ 10.85).</li>
   </ol>`,
   starter:`x = [1.0, 2.0, 3.0, 4.0]
y = [3.1, 4.9, 7.2, 8.8]
n = len(x)

Sx  = sum(x)
Sy  = sum(y)
Sxy = sum(x[i] * y[i] for i in range(n))
Sxx = sum(xi * xi for xi in x)

# 1) slope from the sum formula
slope =

# 2) intercept
intercept =

# 3) residuals, then the two orthogonality sums (both ~ 0)
residual = [y[i] - (intercept + slope * x[i]) for i in range(n)]
ortho = [sum(residual), sum(x[i] * residual[i] for i in range(n))]

# 4) predict at x = 5
pred_5 =

print(slope, intercept, ortho, pred_5)
`,
   solution:`x = [1.0, 2.0, 3.0, 4.0]
y = [3.1, 4.9, 7.2, 8.8]
n = len(x)

Sx  = sum(x)
Sy  = sum(y)
Sxy = sum(x[i] * y[i] for i in range(n))
Sxx = sum(xi * xi for xi in x)

# 1) slope from the sum formula
slope = (n * Sxy - Sx * Sy) / (n * Sxx - Sx * Sx)

# 2) intercept
intercept = (Sy - slope * Sx) / n

# 3) residuals, then the two orthogonality sums (both ~ 0)
residual = [y[i] - (intercept + slope * x[i]) for i in range(n)]
ortho = [sum(residual), sum(x[i] * residual[i] for i in range(n))]

# 4) predict at x = 5
pred_5 = intercept + slope * 5

print(slope, intercept, ortho, pred_5)
`,
   tests:[
     {d:'slope ≈ 1.94 — close to the true 2',expr:'abs(slope - 1.94) < 0.01'},
     {d:'intercept ≈ 1.15 — close to the true 1',expr:'abs(intercept - 1.15) < 0.01'},
     {d:'the residual is perpendicular to the features (both sums ≈ 0)',expr:'abs(ortho[0]) < 1e-6 and abs(ortho[1]) < 1e-6'},
     {d:'prediction at x=5 is ≈ 10.85',expr:'abs(pred_5 - 10.85) < 0.01'}
   ],
   hints:[
     'slope = (n*Sxy - Sx*Sy) / (n*Sxx - Sx*Sx). These sums ARE the normal equations for a line.',
     'intercept = (Sy - slope*Sx) / n.',
     'The two ortho sums being ~0 is the "residual perpendicular to the features" geometry, verified on real numbers.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> Fit a line through just two points <code>(1, 3)</code> and <code>(3, 7)</code> by hand (two points determine a line exactly, so the residual is 0).`,
    solution:`Slope = rise/run = (7 − 3)/(3 − 1) = 4/2 = <b>2</b>. Intercept: from y = 2x + b at (1, 3): 3 = 2·1 + b → b = <b>1</b>. So the line is <code>y = 2x + 1</code>. With only two points it passes through both exactly — the residuals are 0, and least squares degenerates to "connect the dots."`},
   {q:`<b>2. (Concept)</b> Why does least squares minimize the SUM of SQUARED residuals rather than just the sum of residuals?`,
    solution:`The plain sum of residuals is a bad target: positive and negative misses cancel, so a wildly wrong line could have sum 0. <b>Squaring</b> makes every miss positive (no cancellation) and punishes big misses more than small ones. Minimizing the squared error is what lands the line "closest to all points," and it is what makes the residual come out perpendicular to the features (the normal equations).`}
 ]}},

{id:'la6',
 title:'Advanced: eigenvectors & eigenvalues — the directions a matrix cannot turn',
 body:`
<div class="ground"><span class="gTag">🎯 What it does — the grad-school question, answered first</span>
<p><i>"What the hell are eigenvectors actually used for?"</i> Answer before any math: they find
the <b>natural directions</b> of a dataset or a system. <b>PCA</b> — the workhorse of
dimensionality reduction — is eigenvectors of the data's covariance matrix: the directions
your data varies most. Google's original <b>PageRank</b> is an eigenvector of the web's link
matrix. Face recognition's classic "eigenfaces," vibration modes of bridges, stable states of
Markov chains — all the same object. It is one of the most <i>used</i> ideas in applied math;
it is just rarely <i>explained</i>.</p></div>

<h3>The idea, geometrically</h3>
<p>A matrix transforms vectors — usually rotating AND stretching them. But almost every matrix
has a few special directions it <b>cannot turn</b>: vectors it only <i>stretches</i>. Those are
the <b>eigenvectors</b>, and the stretch factor of each is its <b>eigenvalue</b> λ. Think of a
spinning globe: every point moves — except the axis. The axis is the eigenvector of the
rotation. The precise statement is one line: <code>A @ v = λ · v</code> — transforming
<code>v</code> is the same as just scaling it.</p>

<h3>Why data has natural directions</h3>
<p>Take height-and-weight data: the cloud of points stretches along the "bigger people"
diagonal — that diagonal is the data's main axis. Package the spread of the data into its
<b>covariance matrix</b> (variances on the diagonal, co-movement off it) and that matrix's
top eigenvector <i>is</i> that main axis; its eigenvalue says how much of the variation lives
there. That is PCA, whole and entire: eigenvectors of the covariance = the axes of maximum
variance. In the exercise you compute it and watch the [1,1] diagonal fall out.</p>

<div class="demystify"><b>Demystify "eigen":</b> German for <i>own / characteristic</i>. An
eigenvector is a matrix's "own direction" — the direction that characterizes it. No mysticism,
just a 19th-century naming convention that nobody translates for you.</div>

<div class="hardidea">🧠 <b>Hard idea, made simple:</b> why should "directions that only
stretch" matter? Because along them, a complicated transformation acts like simple
multiplication. Decompose anything into eigen-directions and hard problems (repeat a
transformation 1,000×, find where a system settles, compress 300 dimensions to 2) become
one-number-per-direction problems. That is the trick — the whole trick.</div>`,
 docs:[['3Blue1Brown — eigenvectors & eigenvalues','https://www.3blue1brown.com/lessons/eigenvalues'],['PCA explained visually','https://setosa.io/ev/principal-component-analysis/']],
 quiz:{title:'Quick check',questions:[
   {q:'v is an eigenvector of A with eigenvalue λ means:',
    options:['A @ v = 0 always','A @ v = λ·v — the matrix only stretches v, it cannot turn it','v is the largest row of A','λ is negative'],answer:1,
    why:'The one-line definition: along v, the transformation is pure scaling by λ. The spinning globe axis.'},
   {q:'PCA finds the main axes of a dataset by computing:',
    options:['The mean of each column','The eigenvectors of the covariance matrix — the directions of maximum variance','The inverse of the data','A random projection'],answer:1,
    why:'Covariance packages the spread; its eigenvectors are the natural axes, eigenvalues the variance along each.'},
   {q:'Google PageRank, eigenfaces, and vibration modes are all applications of:',
    options:['The determinant','Eigenvectors — the characteristic directions of a matrix','Cosine similarity','The L1 norm'],answer:1,
    why:'One object, everywhere: the direction a system keeps returning to, the axis data stretches along, the mode a bridge rings at.'}
 ]},
 exs:[{title:'Find the eigenvalues of a 2×2 by hand (PCA in miniature)',
   lang:'python',
   prompt:`A height–weight covariance matrix <code>C = [[2, 1], [1, 2]]</code>. For a 2×2, the
   eigenvalues solve the characteristic equation <code>λ² − (trace)λ + det = 0</code> — a plain
   quadratic.
   <ol>
   <li><code>trace</code> = C[0][0] + C[1][1] (= 4); <code>det</code> = ad − bc (= 3),</li>
   <li><code>big, small</code> — the two roots via the quadratic formula <code>(trace ± √(trace² − 4·det)) / 2</code> (expect 3.0 and 1.0),</li>
   <li>the eigenvector for λ = 3 is <code>v = [1, 1]</code> (the "bigger people" diagonal). Compute <code>Cv</code> (C applied to v) and <code>check</code> = the max of <code>|Cv[i] − 3·v[i]|</code> — must be ≈ 0, verifying <code>Cv = λv</code>.</li>
   </ol>`,
   packages:[],
   starter:`import math

C = [[2, 1], [1, 2]]

trace = C[0][0] + C[1][1]
det = C[0][0]*C[1][1] - C[0][1]*C[1][0]

# 1) the two eigenvalues via the quadratic formula
disc = math.sqrt(trace**2 - 4*det)
big =
small =

# 2) verify the eigenvector v = [1, 1] for lambda = 3
v = [1, 1]
Cv = [C[0][0]*v[0] + C[0][1]*v[1], C[1][0]*v[0] + C[1][1]*v[1]]
check = max(abs(Cv[i] - big * v[i]) for i in range(2))

print(big, small, Cv, check)
`,
   solution:`import math

C = [[2, 1], [1, 2]]

trace = C[0][0] + C[1][1]
det = C[0][0]*C[1][1] - C[0][1]*C[1][0]

# 1) the two eigenvalues via the quadratic formula
disc = math.sqrt(trace**2 - 4*det)
big = (trace + disc) / 2
small = (trace - disc) / 2

# 2) verify the eigenvector v = [1, 1] for lambda = 3
v = [1, 1]
Cv = [C[0][0]*v[0] + C[0][1]*v[1], C[1][0]*v[0] + C[1][1]*v[1]]
check = max(abs(Cv[i] - big * v[i]) for i in range(2))

print(big, small, Cv, check)
`,
   tests:[
     {d:'the largest eigenvalue is 3.0',expr:'abs(big - 3.0) < 1e-9'},
     {d:'the other eigenvalue is 1.0 — less variance on the minor axis',expr:'abs(small - 1.0) < 1e-9'},
     {d:'C applied to [1,1] gives [3,3]',expr:'Cv == [3, 3]'},
     {d:'Cv = λ·v verified (check ≈ 0) — [1,1] really is the eigenvector',expr:'check < 1e-9'}
   ],
   hints:[
     'trace = 4, det = 3. The quadratic λ² − 4λ + 3 = 0 factors as (λ−3)(λ−1).',
     'big = (trace + disc)/2, small = (trace - disc)/2, where disc = √(trace² − 4·det) = √4 = 2.',
     'Cv = [2·1 + 1·1, 1·1 + 2·1] = [3, 3] = 3·[1,1], so check (the gap from λv) is 0.'
   ]}]},

{id:'la7',
 title:'Advanced: outer product, rank & SVD — the hidden structure inside a matrix',
 body:`
<div class="ground"><span class="gTag">🎯 What it does</span>
<p>Netflix has ~200M users × thousands of titles — a gigantic ratings matrix. Storing and
learning it cell-by-cell is hopeless. The rescue is that such matrices are secretly
<b>simple</b>: mostly explainable by a few underlying "taste" directions. This lesson is the
toolkit for finding hidden simplicity — the <b>outer product</b> (building a big matrix from
two small vectors), <b>rank</b> (how much independent information a matrix really contains),
and <b>SVD</b> (the algorithm that uncovers it). It powers recommenders, compression,
denoising, LSA in NLP — and it is where the "low-rank" in modern LLM fine-tuning
(<b>LoRA</b> = <i>Low-Rank Adaptation</i>) comes from.</p></div>

<h3>The outer product: a matrix from two vectors</h3>
<p>The dot product collapses two vectors into one number. Its mirror twin the <b>outer
product</b> expands them into a whole matrix: <code>np.outer(u, v)</code> has every
<code>uᵢ·vⱼ</code>. Grounding: if users have a "sci-fi taste" score <code>u</code> and movies
a "sci-fi amount" score <code>v</code>, then <code>outer(u, v)</code> is the entire predicted
ratings table from that ONE shared factor. One pair of small vectors → one full matrix.</p>

<h3>Rank: how many factors are really in there?</h3>
<p>The <b>rank</b> of a matrix is how many independent directions it actually contains — how
many outer products you'd need to build it. A matrix built from one factor has rank 1, no
matter how big it looks. (Recognize this? The singular matrix of lesson 4 was "rank-deficient"
— duplicated information IS low rank. Same idea, now with its proper name.)</p>

<h3>SVD: the universal factor-finder</h3>
<p>The <b>Singular Value Decomposition</b> takes ANY matrix and rewrites it as a sum of
rank-1 pieces, sorted by importance: strongest factor first, each with a strength (its
<b>singular value</b>). Keep the top few pieces, drop the rest — you have compressed the
matrix while keeping most of its meaning. That is low-rank approximation: the mathematical
heart of recommenders and PCA (SVD and eigendecomposition are close cousins — SVD is the
version that works on <i>any</i> rectangular matrix, data included).</p>

<div class="demystify"><b>Demystify "SVD":</b> "singular value decomposition" sounds like
three unrelated scary words. Reading: <i>decomposition</i> = take apart; into rank-1
building blocks; each block's importance is its <i>singular value</i> (nothing to do with
singular-no-inverse — an unlucky name collision, flagged so it never confuses you). Take any
matrix apart into its ranked ingredients: that is the whole thing.</div>`,
 docs:[['NumPy — linalg.svd','https://numpy.org/doc/stable/reference/generated/numpy.linalg.svd.html'],['LoRA: Low-Rank Adaptation (the paper)','https://arxiv.org/abs/2106.09685']],
 quiz:{title:'Quick check',questions:[
   {q:'The outer product of a length-3 vector and a length-2 vector is:',
    options:['A single number','A 3×2 matrix containing every pairwise product uᵢ·vⱼ','A length-5 vector','Undefined'],answer:1,
    why:'Dot collapses, outer expands: every combination of entries, arranged as a grid. One factor → a full table.'},
   {q:'A huge ratings matrix built entirely from ONE taste factor (one outer product) has rank:',
    options:['Equal to its number of rows','1 — size is not information; rank counts independent directions','0','Equal to its number of columns'],answer:1,
    why:'Rank counts how many rank-1 pieces you need. One factor = rank 1, even at Netflix scale.'},
   {q:'SVD is useful in ML because it:',
    options:['Makes matrices larger','Rewrites any matrix as importance-ranked rank-1 pieces, enabling compression and factor discovery','Only works on square matrices','Replaces gradient descent'],answer:1,
    why:'Keep the strongest pieces, drop the weak: recommenders, PCA, denoising, and the low-rank idea behind LoRA.'}
 ]},
 exs:[{title:'Build a rank-1 matrix with the outer product (by hand)',
   lang:'python',
   prompt:`Three users have sci-fi taste <code>u = [1, 2, 3]</code>; two movies have sci-fi
   amount <code>v = [2, 1]</code>. The <b>outer product</b> builds the whole ratings table:
   entry [i][j] = u[i]·v[j].
   <ol>
   <li><code>M</code> — the 3×2 outer product (a comprehension: for each u[i], a row of u[i]·v[j]),</li>
   <li><code>every_row_multiple</code> — <code>True</code> if every row of M is a scalar multiple of v (which makes M rank 1 — one factor built it),</li>
   <li><code>rebuilt</code> — rebuild M from the single factor pair u, v (the same outer product) and confirm it equals M exactly (one rank-1 piece is all the information there is).</li>
   </ol>`,
   starter:`u = [1, 2, 3]   # users' sci-fi taste
v = [2, 1]      # movies' sci-fi amount

# 1) outer product: M[i][j] = u[i] * v[j]
M =

# 2) is every row a multiple of v? (row i should equal u[i] * v)
every_row_multiple = all(M[i] == [u[i]*v[0], u[i]*v[1]] for i in range(len(u)))

# 3) rebuild M from the single factor pair (same outer product)
rebuilt = [[u[i] * v[j] for j in range(len(v))] for i in range(len(u))]

print(M, every_row_multiple, rebuilt == M)
`,
   solution:`u = [1, 2, 3]   # users' sci-fi taste
v = [2, 1]      # movies' sci-fi amount

# 1) outer product: M[i][j] = u[i] * v[j]
M = [[u[i] * v[j] for j in range(len(v))] for i in range(len(u))]

# 2) is every row a multiple of v? (row i should equal u[i] * v)
every_row_multiple = all(M[i] == [u[i]*v[0], u[i]*v[1]] for i in range(len(u)))

# 3) rebuild M from the single factor pair (same outer product)
rebuilt = [[u[i] * v[j] for j in range(len(v))] for i in range(len(u))]

print(M, every_row_multiple, rebuilt == M)
`,
   tests:[
     {d:'M is the 3×2 table [[2,1],[4,2],[6,3]]',expr:'M == [[2,1],[4,2],[6,3]]'},
     {d:'a cell check: row 1, col 0 is u[1]*v[0] = 2*2 = 4',expr:'M[1][0] == 4'},
     {d:'every row is a multiple of v — the signature of rank 1',expr:'every_row_multiple == True'},
     {d:'the single factor pair rebuilds the whole matrix — one piece is all the info',expr:'rebuilt == M'}
   ],
   hints:[
     'M = [[u[i] * v[j] for j in range(len(v))] for i in range(len(u))] — every pairwise product.',
     'Row 0 is [1·2, 1·1] = [2,1]; row 1 is [2·2, 2·1] = [4,2] = 2×v. Every row is a multiple of v.',
     'Because one (u, v) pair rebuilds M exactly, M has rank 1 — no matter how many rows and columns it has.'
   ]}],
 homework:{problems:[
   {q:`<b>1.</b> Compute the outer product of <code>a = [2, 3]</code> and <code>b = [1, 4]</code> by hand. What are its rows, and what is its rank?`,
    solution:`Outer product entry [i][j] = a[i]·b[j].<br>Row 0 = [2·1, 2·4] = [2, 8]. Row 1 = [3·1, 3·4] = [3, 12].<br>So it is <code>[[2, 8], [3, 12]]</code>. Every row is a multiple of b = [1, 4] (row 0 = 2·b, row 1 = 3·b), so its <b>rank is 1</b> — built from a single factor. (Its determinant is 2·12 − 8·3 = 24 − 24 = 0, confirming rank &lt; 2.)`},
   {q:`<b>2. (Concept)</b> Netflix's ratings matrix is huge but "low rank." In plain English, what does that mean and why does it make recommendation possible?`,
    solution:`Low rank means the giant table is really built from a <b>small number of hidden factors</b> — a few "taste dimensions" (how much you like sci-fi, comedy, drama…) times how much each movie has of them. Most of the millions of ratings are redundant, explained by these few factors. That is why you can <b>predict the blanks</b>: fit the handful of factors to the ratings you <i>do</i> see, then multiply them back to estimate the ones you don't. SVD is the tool that finds those factors — and "keep only the top few" is exactly the low-rank idea behind LoRA in LLM fine-tuning.`}
 ]}}
]});
