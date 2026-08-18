STREAMS.push({icon:'🥷',tournament:true,title:'Dynamic Programming & Advanced Algorithms',blurb:'Memoization, tabulation, 2D DP and the pattern toolbox (sliding window, two pointers): the art behind hard interview problems.',lessons:[
{id:'dp1',title:'Recursion → memoization',body:`
<p>DP in one sentence: <b>a problem whose solution reuses solutions to overlapping subproblems</b>. Step one is always the naive recursion; step two is noticing you solve the same subproblem repeatedly; step three is caching it: <b>memoization</b>, or top-down DP:</p>
<div class="codeSample" data-hl>// naive fib: O(2^n); fib(50) takes minutes because fib(20) is computed 832040 times
long fib(int n) { return n &lt;= 1 ? n : fib(n - 1) + fib(n - 2); }

// memoized: O(n); each subproblem solved ONCE, then looked up
Map&lt;Integer, Long&gt; memo = new HashMap&lt;&gt;();
long fib(int n) {
    if (n &lt;= 1) return n;
    return memo.computeIfAbsent(n, k -&gt; fib(k - 1) + fib(k - 2));
}</div>
<p>The recipe: (1) define the subproblem precisely: "fib(n) is the nth number"; (2) write the recurrence: <code>f(n) = f(n-1) + f(n-2)</code>; (3) add base cases; (4) cache on the way back up.</p>

<h4>The two conditions, and how to check them</h4>
<p>DP applies when both hold. <b>Overlapping subproblems</b>: the same smaller instance is needed more than once; draw two levels of the recursion tree and look for a repeated node. Without overlap, caching stores answers nobody asks for again, which is why merge sort is divide-and-conquer rather than DP. <b>Optimal substructure</b>: an optimal solution is built from optimal solutions of its subproblems. That one is easy to assume and occasionally false: the cheapest flight from A to C is not always the cheapest A-to-B plus cheapest B-to-C when the fare depends on the whole itinerary, and a DP over such a problem returns a confident wrong answer rather than failing.</p>

<h4>Where memoization bites</h4>
<ul>
<li><b>The key must capture the entire state.</b> If the answer depends on two indices and a remaining budget, all three belong in the key. A cache keyed on too little is the single most common DP bug: it returns a previously-computed answer for a different situation, and only some inputs expose it.</li>
<li><b>Recursion depth is bounded.</b> Top-down DP is still recursion, so a chain of 100,000 subproblems overflows the stack; that is the practical reason to switch to the bottom-up table in the next lesson.</li>
<li><b>The cache must not outlive the inputs.</b> A static memo keyed on user data is a memory leak, and one keyed on mutable objects is a correctness bug.</li>
</ul>
<p>Recognising the shape is the interview skill: "how many ways can you…", "minimum cost to…", "longest/best subsequence of…" with a choice at each step. Say the recurrence out loud before writing anything; the code is mechanical once the recurrence is right, and unfixable while it is wrong.</p>`,
docs:[['Dynamic programming, CP-Algorithms','https://cp-algorithms.com/dynamic_programming/intro-to-dp.html'],['Memoization vs tabulation, Baeldung','https://www.baeldung.com/cs/tabulation-vs-memoization']],
exs:[
{title:'Memoized Fibonacci',
prompt:`Write <code>Fib</code> computing the <b>nth Fibonacci number</b>: fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2), so fib(10) == 55. Use a <code>private final java.util.Map&lt;Integer, Long&gt; memo = new java.util.HashMap&lt;&gt;()</code> and method <code>long fib(int n)</code>: base case n &le; 1, otherwise <code>memo.computeIfAbsent</code> with the recursive recurrence. fib(90) must return instantly (naive recursion would outlive the universe).`,
starter:`import java.util.*;

public class Fib {
    private final Map<Integer, Long> memo = new HashMap<>();

    long fib(int n) {
        return 0;
    }
}`,
tests:[{d:'Base case for n <= 1',re:'n\\s*<=\\s*1'},{d:'Caches via computeIfAbsent (or containsKey+put)',re:'computeIfAbsent|containsKey'},{d:'Recursive recurrence f(n-1)+f(n-2)',re:'fib\\s*\\(\\s*\\w+\\s*-\\s*1\\s*\\)\\s*\\+\\s*fib\\s*\\(\\s*\\w+\\s*-\\s*2\\s*\\)'}],
behavior:`1. fib(0)==0, fib(1)==1, fib(10)==55, fib(50)==12586269025. 2. fib(90) completes instantly (memo makes it O(n)) and returns 2880067194370816120. 3. Each n is computed exactly once; repeated calls are pure lookups.`,
hints:['Shape: <code>if (n <= 1) return n; return memo.computeIfAbsent(n, k -> fib(k - 1) + fib(k - 2));</code>','computeIfAbsent both checks the cache AND stores the computed value: the whole memo pattern in one call.','Use long: fib(90) overflows int at fib(47).'],
solution:`import java.util.*;

public class Fib {
    private final Map<Integer, Long> memo = new HashMap<>();

    long fib(int n) {
        if (n <= 1) return n;
        return memo.computeIfAbsent(n, k -> fib(k - 1) + fib(k - 2));
    }
}`},
{title:'Climbing stairs (count the ways)',
prompt:`You climb a staircase of n steps taking 1 or 2 steps at a time. Write <code>Stairs</code> with memoized <code>long ways(int n)</code>: ways(n) = ways(n-1) + ways(n-2), base cases ways(0) = 1 (one way: stand still) and ways(1) = 1. Same memo pattern as before; spot that it IS Fibonacci wearing a costume.`,
starter:`import java.util.*;

public class Stairs {
    private final Map<Integer, Long> memo = new HashMap<>();

    long ways(int n) {
        return 0;
    }
}`,
tests:[{d:'Base cases return 1',re:'n\\s*<=\\s*1[\\s\\S]*?return\\s+1'},{d:'Memoized',re:'computeIfAbsent|containsKey'},{d:'The two-choice recurrence',re:'ways\\s*\\(\\s*\\w+\\s*-\\s*1\\s*\\)\\s*\\+\\s*ways\\s*\\(\\s*\\w+\\s*-\\s*2\\s*\\)'}],
behavior:`1. ways(2)==2 (1+1, 2), ways(3)==3, ways(4)==5, ways(10)==89. 2. ways(80) returns instantly. 3. The recurrence encodes the CHOICE: last move was a 1-step (from n-1) or a 2-step (from n-2); sum the ways to reach each.`,
hints:['"How many ways" + choices at each step = count-DP; the recurrence sums over the choices for the LAST move.','Base: <code>if (n <= 1) return 1;</code>, one way to be at the bottom, one way to reach step 1.','Identical skeleton to fib: DP problems are families, learn the family not the instance.'],
solution:`import java.util.*;

public class Stairs {
    private final Map<Integer, Long> memo = new HashMap<>();

    long ways(int n) {
        if (n <= 1) return 1;
        return memo.computeIfAbsent(n, k -> ways(k - 1) + ways(k - 2));
    }
}`},
{title:'Memoized Fibonacci, executed',lang:'js',diff:'medium',
run:{call:'fib',cases:[{name:'the tenth number',args:[10],expect:55},{name:'base case zero',args:[0],expect:0},{name:'base case one',args:[1],expect:1},{name:'fib(50) returns instantly, proof the cache works',args:[50],expect:12586269025},{name:'fib(78) is still exact in a double',args:[78],expect:8944394323791464}]},
prompt:`Write <code>function fib(n, memo = {})</code> returning the nth Fibonacci number, caching each result so every subproblem is computed once. The <code>fib(50)</code> case is the real test: the naive recursion would make over 40 billion calls and time out, while the memoized version returns immediately.`,
starter:`function fib(n, memo = {}) {
  return 0;
}`,
solution:`function fib(n, memo = {}) {
  if (n <= 1) return n;                       // base cases
  if (memo[n] !== undefined) return memo[n];  // already solved
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}`,
tests:[{d:'base cases return n',re:'n\\s*<=\\s*1|n\\s*<\\s*2'},{d:'the cache is consulted before recursing',re:'memo\\[n\\]\\s*!==\\s*undefined|in\\s+memo|memo\\.hasOwnProperty|memo\\[n\\]\\s*\\?\\?'},{d:'the result is stored',re:'memo\\[n\\]\\s*='},{d:'the cache is threaded through the recursion',re:'fib\\s*\\(\\s*n\\s*-\\s*1\\s*,\\s*memo'}],
behavior:`Five cases execute for real, and the timing is the lesson. fib(50) completes in microseconds memoized; the naive version needs about 4x10^10 calls and would be killed by the worker's three-second cap, so a solution that forgets to consult the cache does not merely score lower, it times out. Case 5 sits just under 2^53, where doubles are still exact; one step further and JavaScript silently loses precision, which is the same class of problem as Java overflowing a long at fib(93). Note the cache is passed down rather than held in a module-level variable: a shared mutable cache across calls is fine for a pure function of n and a correctness bug the moment the function takes anything else.`,
hints:['Three lines: base case, cache hit, cache miss.','Check for undefined rather than falsy: memo[0] is 0, which is falsy.','Pass memo into both recursive calls or each branch starts an empty cache.']}]},
{id:'dp2',title:'Tabulation: bottom-up DP',body:`
<p><b>Tabulation</b> flips memoization: instead of recursing down from the answer, build a table up from the base cases (no recursion, no stack overflow, often less memory):</p>
<div class="codeSample" data-hl>// COIN CHANGE: fewest coins to make amount (the canonical 1D table)
int minCoins(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);          // "infinity" sentinel
    dp[0] = 0;                             // base: zero coins make 0
    for (int a = 1; a &lt;= amount; a++) {    // build every amount up to target
        for (int c : coins) {
            if (c &lt;= a) {
                dp[a] = Math.min(dp[a], dp[a - c] + 1);   // best of: use coin c
            }
        }
    }
    return dp[amount] &gt; amount ? -1 : dp[amount];          // unreachable -&gt; -1
}</div>
<p>Reading the recurrence: to make amount <code>a</code>, try every coin <code>c</code> as the <i>last</i> coin: that costs <code>dp[a-c] + 1</code>; take the minimum. The table order guarantees <code>dp[a-c]</code> is already final when you read it. That ordering of computation is the entire discipline of tabulation.</p>

<h4>Choosing between top-down and bottom-up</h4>
<p>They compute the same recurrence and differ only in direction, so the choice is practical. <b>Memoization</b> is easier to derive (you write the recursion you already understand and add a cache) and it only visits the subproblems the answer actually needs, which wins when the state space is large and sparse. <b>Tabulation</b> has no call overhead and no stack limit, and its fixed iteration order is what makes the space optimisation below possible. The usual path is to write the memoized version first, get it correct, and convert it if the depth or the constant factor matters.</p>

<h4>The sentinel, and why it is amount + 1</h4>
<p>Unreachable amounts need a value that loses every <code>min</code> comparison without overflowing when you add one to it. <code>Integer.MAX_VALUE</code> is the tempting choice and it is wrong: <code>dp[a-c] + 1</code> wraps to a large negative number, which then wins the min and produces an answer that is not merely wrong but nonsensical. Any value above the largest possible real answer works, and the largest possible answer here is <code>amount</code> coins of denomination 1, hence <code>amount + 1</code>.</p>

<h4>Rolling the table: O(n) space to O(1)</h4>
<p>When row <code>i</code> depends only on row <code>i-1</code>, you never need the whole table: keep two rows, or one row updated in the right direction. Fibonacci by tabulation needs two variables, not an array of n. This is the standard follow-up question after you produce a working table, and the answer is always the same: look at which previous entries the recurrence actually reads, and keep only those.</p>`,
docs:[['Coin change, CP-Algorithms adjacent writeup','https://cp-algorithms.com/dynamic_programming/intro-to-dp.html'],['Bottom-up DP, Baeldung','https://www.baeldung.com/cs/tabulation-vs-memoization']],
exs:[{title:'Coin change',
prompt:`Write <code>Coins</code> with <code>static int minCoins(int[] coins, int amount)</code> returning the <b>fewest coins needed to make exactly amount</b>, with unlimited copies of each denomination, minCoins([1,2,5], 11) == 3 (5+5+1), or <b>-1 when the amount cannot be made</b>. Implement it exactly as the tabulation recipe: dp array of size amount+1 filled with the sentinel <code>amount + 1</code>, <code>dp[0] = 0</code>, double loop (amounts outer, coins inner), <code>Math.min</code> relaxation, and the -1 check at the end.`,
starter:`import java.util.*;

public class Coins {
    static int minCoins(int[] coins, int amount) {
        return -1;
    }
}`,
tests:[{d:'Sentinel-filled dp table',re:'Arrays\\.fill\\s*\\(\\s*dp\\s*,\\s*amount\\s*\\+\\s*1\\s*\\)'},{d:'Base case dp[0] = 0',re:'dp\\[\\s*0\\s*\\]\\s*=\\s*0'},{d:'Min relaxation with dp[a - c] + 1',re:'Math\\.min\\s*\\(\\s*dp\\[\\s*\\w+\\s*\\]\\s*,\\s*dp\\[\\s*\\w+\\s*-\\s*\\w+\\s*\\]\\s*\\+\\s*1\\s*\\)'},{d:'Unreachable returns -1',re:'return\\s+dp\\[\\s*amount\\s*\\]\\s*>\\s*amount\\s*\\?\\s*-1|dp\\[amount\\]\\s*==\\s*amount\\s*\\+\\s*1\\s*\\?\\s*-1'}],
behavior:`1. minCoins([1,2,5], 11) == 3 (5+5+1). 2. minCoins([2], 3) == -1 (odd amount, even coins). 3. minCoins([1], 0) == 0 (base case). 4. minCoins([186,419,83,408], 6249) == 20: brute force would never finish; the table does it in amount×coins steps.`,
hints:['The sentinel amount+1 is safely "worse than any real answer" without integer-overflow risk that MAX_VALUE+1 would bring.','Guard <code>if (c <= a)</code> before reading dp[a - c].','Order matters: amounts ascending so every dp[a-c] you read is already finished.'],
solution:`import java.util.*;

public class Coins {
    static int minCoins(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) {
                    dp[a] = Math.min(dp[a], dp[a - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`},
{title:'Coin change, executed',lang:'js',diff:'hard',
run:{call:'minCoins',cases:[{name:'11 from 1, 2 and 5 needs three coins',args:[[1,2,5],11],expect:3},{name:'an unreachable amount returns -1',args:[[5],3],expect:-1},{name:'zero needs no coins',args:[[1],0],expect:0},{name:'greedy fails here: 6 from 1, 3, 4 is two coins, not three',args:[[1,3,4],6],expect:2},{name:'an exact single coin',args:[[2,5],5],expect:1}]},
prompt:`Write <code>function minCoins(coins, amount)</code> returning the fewest coins that sum to <code>amount</code>, or <code>-1</code> when it cannot be made. Build the table bottom-up as in the lesson. Use a sentinel above any real answer, <code>amount + 1</code>, rather than Infinity arithmetic you have to reason about.`,
starter:`function minCoins(coins, amount) {
  return -1;
}`,
solution:`function minCoins(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);   // sentinel = unreachable
  dp[0] = 0;                                           // base case
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
tests:[{d:'a table of size amount + 1 is allocated',re:'amount\\s*\\+\\s*1'},{d:'the base case is set',re:'dp\\[0\\]\\s*=\\s*0'},{d:'every coin is tried for every amount',re:'for\\s*\\(.*of\\s+coins|coins\\.forEach'},{d:'the recurrence takes a minimum',re:'Math\\.min'},{d:'unreachable amounts return -1',re:'-1'}],
behavior:`Five cases run. The fourth is the one worth failing once: a greedy algorithm takes the largest coin that fits (4, then 1, then 1) and answers three, while the optimal answer is 3+3, two coins. Greedy is correct only for certain coin systems, which is why this problem is a DP problem and why "it worked on my examples" is not evidence. The unreachable case checks your sentinel survives the +1 without wrapping, and the zero case checks the base row exists at all: dp[0] = 0 is what every other entry is ultimately built from, so omitting it makes every answer wrong by an unbounded amount.`,
hints:['dp[a] is the fewest coins making exactly a. dp[0] is 0.','For each amount, try each coin as the LAST coin used.','Compare the final entry against your sentinel to detect unreachable.']}]},
{id:'dp3',title:'2D DP: longest common subsequence',body:`
<p>When the state needs TWO indices, the table becomes 2D. The archetype is <b>LCS</b>, the longest subsequence (not substring: gaps allowed, order kept) common to two strings. It powers diff tools, DNA alignment and your git merge:</p>
<div class="codeSample" data-hl>// dp[i][j] = LCS length of first i chars of a and first j chars of b
int lcs(String a, String b) {
    int[][] dp = new int[a.length() + 1][b.length() + 1];   // row/col 0 = empty prefix
    for (int i = 1; i &lt;= a.length(); i++) {
        for (int j = 1; j &lt;= b.length(); j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;            // match: extend the diagonal
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);  // skip one char
            }
        }
    }
    return dp[a.length()][b.length()];
}</div>
<p>The two-case structure (<i>match means diagonal plus one, mismatch means the better of dropping a character from either side</i>) reappears across the whole 2D family: edit distance, grid paths, knapsack (where the second dimension is remaining capacity).</p>

<h4>The off-by-one, stated once so it stops hurting</h4>
<p>Row 0 and column 0 represent the <b>empty prefix</b>, which is why the table is (m+1) by (n+1) and why <code>dp[i][j]</code> compares <code>a.charAt(i-1)</code> with <code>b.charAt(j-1)</code>. Those extra row and column are not padding; they are the base cases, and they hold zero because the LCS of anything with an empty string is empty. Sizing the table m by n instead forces a special case for every first row and column, which is where most hand-written versions get their bugs.</p>

<h4>Reading the answer back out</h4>
<p>The table gives the length; a diff tool needs the actual sequence. Walk backwards from <code>dp[m][n]</code>: if the characters match, that character is part of the answer and you step diagonally; otherwise step to whichever neighbour holds the larger value. This is the second half of the algorithm and it is where the phrase "the diff" comes from: a diff is the complement of the LCS, so what the walk does <i>not</i> take is exactly the added and removed lines.</p>

<h4>Cost, and the family resemblance</h4>
<p>Time and space are both O(m x n): a megabyte of table for two 1,000-character strings, which is fine, and 10&#185;&#178; entries for two one-megabyte files, which is not. Real diff tools use the rolling trick from the previous lesson (only the previous row is read) plus algorithms tuned for the common case where the inputs are mostly identical. Recognise the family by its signature: two sequences, a decision per pair of positions, and an answer built from the three neighbours above, left and diagonal.</p>`,
docs:[['LCS, CP-Algorithms family','https://cp-algorithms.com/dynamic_programming/intro-to-dp.html'],['Edit distance & friends, Baeldung','https://www.baeldung.com/cs/levenshtein-distance-computation']],
exs:[{title:'LCS table',
prompt:`Write <code>Lcs</code> with <code>static int length(String a, String b)</code> returning the length of the <b>longest common subsequence</b>, the longest sequence of characters appearing in both strings in the same order, not necessarily contiguously: length("abcde", "ace") == 3 ("ace"). Use the full 2D tabulation: <code>(a.length()+1) × (b.length()+1)</code> table, match case extending the diagonal, mismatch case taking the max of the two neighbors. Mind the index offset: <code>charAt(i - 1)</code>.`,
starter:`public class Lcs {
    static int length(String a, String b) {
        return 0;
    }
}`,
tests:[{d:'2D table with +1 dimensions',re:'new\\s+int\\[\\s*a\\.length\\s*\\(\\s*\\)\\s*\\+\\s*1\\s*\\]\\[\\s*b\\.length\\s*\\(\\s*\\)\\s*\\+\\s*1\\s*\\]'},{d:'Offset-aware char comparison',re:'charAt\\s*\\(\\s*i\\s*-\\s*1\\s*\\)\\s*==\\s*b\\.charAt\\s*\\(\\s*j\\s*-\\s*1\\s*\\)'},{d:'Diagonal + 1 on match',re:'dp\\[\\s*i\\s*-\\s*1\\s*\\]\\[\\s*j\\s*-\\s*1\\s*\\]\\s*\\+\\s*1'},{d:'Max of neighbors on mismatch',re:'Math\\.max\\s*\\(\\s*dp\\[\\s*i\\s*-\\s*1\\s*\\]\\[\\s*j\\s*\\]\\s*,\\s*dp\\[\\s*i\\s*\\]\\[\\s*j\\s*-\\s*1\\s*\\]\\s*\\)'}],
behavior:`1. length("abcde", "ace") == 3. 2. length("abc", "abc") == 3. 3. length("abc", "xyz") == 0. 4. length("AGGTAB", "GXTXAYB") == 4 (GTAB). 5. Empty string against anything == 0 (the zero row/column doing its job).`,
hints:['Row 0 and column 0 stay 0: Java initializes them for you; that IS the base case.','Loops from 1 to length inclusive; string access always at index-1.','Return the bottom-right cell, the answer for both full strings.'],
solution:`public class Lcs {
    static int length(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[a.length()][b.length()];
    }
}`},
{title:'LCS length, executed',lang:'js',diff:'hard',
run:{call:'lcs',cases:[{name:'the textbook pair: BCBA has length 4',args:['ABCBDAB','BDCABA'],expect:4},{name:'nothing in common',args:['abc','xyz'],expect:0},{name:'an empty string shares nothing',args:['','abc'],expect:0},{name:'identical strings share everything',args:['abcd','abcd'],expect:4},{name:'subsequence, not substring, gaps are allowed',args:['axbycz','abc'],expect:3}]},
prompt:`Write <code>function lcs(a, b)</code> returning the <b>length</b> of the longest common subsequence. Build the (m+1) by (n+1) table as in the lesson, with row 0 and column 0 representing the empty prefix. The last case is the one that defines the problem: <code>abc</code> appears inside <code>axbycz</code> with gaps, so the answer is 3.`,
starter:`function lcs(a, b) {
  return 0;
}`,
solution:`function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1                       // match: extend the diagonal
        : Math.max(dp[i - 1][j], dp[i][j - 1]);      // mismatch: best of dropping one
    }
  }
  return dp[a.length][b.length];
}`,
tests:[{d:'the table has an extra row and column',re:'length\\s*\\+\\s*1'},{d:'characters are compared with the minus-one offset',re:'a\\[i\\s*-\\s*1\\]|charAt\\s*\\(\\s*i\\s*-\\s*1'},{d:'a match extends the diagonal',re:'dp\\[i\\s*-\\s*1\\]\\[j\\s*-\\s*1\\]\\s*\\+\\s*1'},{d:'a mismatch takes the better neighbour',re:'Math\\.max\\s*\\(\\s*dp\\[i\\s*-\\s*1\\]\\[j\\]'}],
behavior:`Five cases execute. The gapped case separates subsequence from substring: a substring algorithm answers 1 on axbycz versus abc, and both answers look reasonable until you know which question was asked. The empty-string case exercises the base row directly: if your table is sized m by n instead of (m+1) by (n+1), this case either crashes or returns garbage, which is the fastest way to discover the off-by-one. Note how little code the recurrence needs once the table is sized correctly: two branches, three neighbours, no special cases anywhere.`,
hints:['Allocate (a.length + 1) rows of (b.length + 1) zeros: Array.from with a factory, or the rows all alias one array.','dp[i][j] talks about a[i-1] and b[j-1]. Write that offset down before you start.','Two branches only: characters equal, or not.']}]},
{id:'dp4',title:'The pattern toolbox: sliding window & two pointers',body:`
<p>Not everything hard is DP. Two patterns solve an enormous share of "optimal subarray or substring" problems in O(n):</p>
<div class="codeSample" data-hl>// SLIDING WINDOW: longest substring without repeating characters
int longestUnique(String s) {
    Map&lt;Character, Integer&gt; lastSeen = new HashMap&lt;&gt;();
    int best = 0, left = 0;
    for (int right = 0; right &lt; s.length(); right++) {
        char c = s.charAt(right);
        if (lastSeen.containsKey(c) && lastSeen.get(c) &gt;= left) {
            left = lastSeen.get(c) + 1;         // shrink: jump past the duplicate
        }
        lastSeen.put(c, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}

// TWO POINTERS: pair summing to target in a SORTED array
int[] pairSum(int[] sorted, int target) {
    int lo = 0, hi = sorted.length - 1;
    while (lo &lt; hi) {
        int sum = sorted[lo] + sorted[hi];
        if (sum == target) return new int[]{lo, hi};
        if (sum &lt; target) lo++; else hi--;      // move the pointer that helps
    }
    return new int[]{-1, -1};
}</div>

<h4>Why both are linear, and what makes them valid</h4>
<p>Each pointer only ever moves forward, and each moves at most n times, so the total work is O(n) even though the loops look nested. That is the whole argument, and it is worth being able to state, because "there are two pointers so it must be O(n&#178;)" is a common wrong answer in interviews.</p>
<p>The correctness argument is different for each. The sliding window works when the property is <b>monotone</b>: if a window is invalid, extending it cannot make it valid, so shrinking from the left is safe. Two pointers works because the array is <b>sorted</b>: when the sum is too small, no smaller left index can help, so discarding it loses nothing. Break either precondition (an unsorted array, a property that can become valid again on extension) and the pattern silently returns a wrong answer rather than failing.</p>

<h4>The recognition guide</h4>
<ul>
<li>"Longest or shortest <b>contiguous</b> run satisfying X" points to a sliding window. Contiguity is the tell; if the elements need not be adjacent, it is usually DP.</li>
<li>"A pair, triple or partition in <b>sorted</b> data" points to two pointers; if the input is not sorted, sorting first at O(n log n) is often still cheaper than the O(n&#178;) alternative.</li>
<li>"Count the ways" or "minimum cost with a choice at each step" points to DP.</li>
<li>"Best over every window of size k" points to a deque holding candidate maxima, the sliding window with a data structure inside it.</li>
</ul>
<p>Naming the pattern out loud is half of an interview answer, and the other half is stating the precondition it depends on. That is also the practical difference between someone who has memorised solutions and someone who can tell when the solution does not apply.</p>`,
docs:[['Two pointers, CP-Algorithms adjacent','https://cp-algorithms.com/others/maximum_zero_submatrix.html'],['Sliding window pattern, Baeldung','https://www.baeldung.com/cs/sliding-window-algorithm']],
exs:[
{title:'Longest unique substring',
prompt:`Write <code>Windows</code> with <code>static int longestUnique(String s)</code> returning the length of the <b>longest substring with no repeated characters</b>: longestUnique("abcabcbb") == 3 ("abc"), longestUnique("") == 0. Use the sliding window with a <code>Map&lt;Character, Integer&gt;</code> of last-seen positions: advance <code>right</code> every step, jump <code>left</code> past duplicates (only when the duplicate is inside the window!), track the best width.`,
starter:`import java.util.*;

public class Windows {
    static int longestUnique(String s) {
        return 0;
    }
}`,
tests:[{d:'Last-seen map',re:'Map<Character,\\s*Integer>'},{d:'Left jumps only for in-window duplicates',re:'>=\\s*left'},{d:'Window width via right - left + 1',re:'right\\s*-\\s*left\\s*\\+\\s*1'},{d:'Single O(n) pass, no nested char loops',re:'for\\s*\\([^)]*\\)[\\s\\S]*?for\\s*\\([^)]*charAt',not:true}],
behavior:`1. longestUnique("abcabcbb") == 3 ("abc"). 2. longestUnique("bbbbb") == 1. 3. longestUnique("pwwkew") == 3 ("wke"). 4. longestUnique("") == 0. 5. The >= left check matters: in "abba", when the second 'a' arrives, the first 'a' is already OUTSIDE the window and must not drag left backwards.`,
hints:['One pass with right; the map remembers where each char last appeared.','Only shrink when the remembered position is inside the current window: <code>lastSeen.get(c) >= left</code>.','Update best AFTER fixing left, with <code>right - left + 1</code>.'],
solution:`import java.util.*;

public class Windows {
    static int longestUnique(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int best = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
                left = lastSeen.get(c) + 1;
            }
            lastSeen.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`},
{title:'Two pointers: container with most water',
prompt:`Heights of vertical lines are given; two lines + the x-axis form a container. Write <code>Container</code> with <code>static int mostWater(int[] h)</code>: pointers at both ends, area = <code>Math.min(h[lo], h[hi]) * (hi - lo)</code>, keep the best, and always move the <b>shorter</b> line's pointer inward (moving the taller one can only shrink the area; that insight IS the algorithm).`,
starter:`public class Container {
    static int mostWater(int[] h) {
        return 0;
    }
}`,
tests:[{d:'Two pointers from both ends',re:'lo\\s*=\\s*0[\\s\\S]*?hi\\s*=\\s*h\\.length\\s*-\\s*1'},{d:'Area formula with min height × width',re:'Math\\.min\\s*\\(\\s*h\\[\\s*lo\\s*\\]\\s*,\\s*h\\[\\s*hi\\s*\\]\\s*\\)\\s*\\*\\s*\\(\\s*hi\\s*-\\s*lo\\s*\\)'},{d:'Moves the shorter side',re:'h\\[\\s*lo\\s*\\]\\s*<\\s*h\\[\\s*hi\\s*\\]'},{d:'Single while loop, O(n)',re:'while\\s*\\(\\s*lo\\s*<\\s*hi\\s*\\)'}],
behavior:`1. mostWater([1,8,6,2,5,4,8,3,7]) == 49 (lines of height 8 and 7, width 7). 2. mostWater([1,1]) == 1. 3. O(n): each step eliminates one line permanently; the proof is that the shorter line can never do better with a narrower width.`,
hints:['Track best while lo < hi; compute area each step.','The move rule: <code>if (h[lo] < h[hi]) lo++; else hi--;</code>','Why it is safe to discard the shorter line: any container using it with a smaller width is capped by the same short height, strictly worse.'],
solution:`public class Container {
    static int mostWater(int[] h) {
        int lo = 0, hi = h.length - 1, best = 0;
        while (lo < hi) {
            int area = Math.min(h[lo], h[hi]) * (hi - lo);
            best = Math.max(best, area);
            if (h[lo] < h[hi]) lo++;
            else hi--;
        }
        return best;
    }
}`},
{title:'Longest unique substring, executed',lang:'js',diff:'hard',
run:{call:'longestUnique',cases:[{name:'abcabcbb has abc',args:['abcabcbb'],expect:3},{name:'all one character',args:['bbbb'],expect:1},{name:'pwwkew has wke, not pwke',args:['pwwkew'],expect:3},{name:'an empty string',args:[''],expect:0},{name:'all distinct is the whole string',args:['abcdef'],expect:6},{name:'a repeat before the window start must not shrink it',args:['abba'],expect:2}]},
prompt:`Write <code>function longestUnique(s)</code> returning the length of the longest substring with no repeated character. Move a right edge forward, and when you meet a character already inside the current window, jump the left edge past its previous position. Remember: the substring must be <b>contiguous</b>, so <code>pwwkew</code> answers 3 for <code>wke</code>, not 4 for <code>pwke</code>.`,
starter:`function longestUnique(s) {
  return 0;
}`,
solution:`function longestUnique(s) {
  const lastSeen = new Map();
  let best = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    // only shrink if the duplicate is INSIDE the current window
    if (lastSeen.has(c) && lastSeen.get(c) >= left) left = lastSeen.get(c) + 1;
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
tests:[{d:'the last position of each character is remembered',re:'Map|\\{\\}|lastSeen'},{d:'the left edge only jumps for duplicates inside the window',re:'>=\\s*left|>\\s*=\\s*left'},{d:'the window is measured as right minus left plus one',re:'right\\s*-\\s*left\\s*\\+\\s*1'},{d:'the best length is tracked',re:'Math\\.max'}],
behavior:`Six cases execute, and abba is the one that matters. Reading it left to right the window is a, then ab, then b (the second b forces left past index 1), then ba. When the final a arrives, its last-seen index is 0, which is BEHIND the window's left edge of 2, so it is not a duplicate of anything currently in the window and the left edge must not move. A solution that jumps left on every seen character answers 1 here instead of 2, and passes every other case in this set. That is the whole reason the >= left guard exists, and it is the bug this exercise is built to catch.`,
hints:['Store the last index at which each character was seen, not just whether it was seen.','Before shrinking, ask whether the previous occurrence is still inside the window.','The window length is right - left + 1; the +1 is because both ends are inclusive.']}]}
]});
