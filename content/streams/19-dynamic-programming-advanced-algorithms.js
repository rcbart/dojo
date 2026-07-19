STREAMS.push({icon:'🥷',tournament:true,title:'Dynamic Programming & Advanced Algorithms',blurb:'Memoization, tabulation, 2D DP and the pattern toolbox (sliding window, two pointers) — the art behind hard interview problems.',lessons:[
{id:'dp1',title:'Recursion → memoization',body:`
<p>DP in one sentence: <b>a problem whose solution reuses solutions to overlapping subproblems</b>. Step one is always the naive recursion; step two is noticing you solve the same subproblem repeatedly; step three is caching it — <b>memoization</b> (top-down DP):</p>
<div class="codeSample" data-hl>// naive fib: O(2^n) — fib(50) takes minutes because fib(20) is computed 832040 times
long fib(int n) { return n &lt;= 1 ? n : fib(n - 1) + fib(n - 2); }

// memoized: O(n) — each subproblem solved ONCE, then looked up
Map&lt;Integer, Long&gt; memo = new HashMap&lt;&gt;();
long fib(int n) {
    if (n &lt;= 1) return n;
    return memo.computeIfAbsent(n, k -&gt; fib(k - 1) + fib(k - 2));
}</div>
<p>The recipe: (1) define the subproblem precisely — "fib(n) = nth number"; (2) write the recurrence — <code>f(n) = f(n-1) + f(n-2)</code>; (3) add base cases; (4) cache on the way back up. Recognizing the recurrence is the skill; the cache is mechanical. Classic tell in interviews: "how many ways can you…" or "minimum cost to…" with choices at each step.</p>`,
docs:[['Dynamic programming — CP-Algorithms','https://cp-algorithms.com/dynamic_programming/intro-to-dp.html'],['Memoization vs tabulation — Baeldung','https://www.baeldung.com/cs/tabulation-vs-memoization']],
exs:[
{title:'Memoized Fibonacci',
prompt:`Write <code>Fib</code> computing the <b>nth Fibonacci number</b>: fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2) — so fib(10) == 55. Use a <code>private final java.util.Map&lt;Integer, Long&gt; memo = new java.util.HashMap&lt;&gt;()</code> and method <code>long fib(int n)</code>: base case n &le; 1, otherwise <code>memo.computeIfAbsent</code> with the recursive recurrence. fib(90) must return instantly (naive recursion would outlive the universe).`,
starter:`import java.util.*;

public class Fib {
    private final Map<Integer, Long> memo = new HashMap<>();

    long fib(int n) {
        return 0;
    }
}`,
tests:[{d:'Base case for n <= 1',re:'n\\s*<=\\s*1'},{d:'Caches via computeIfAbsent (or containsKey+put)',re:'computeIfAbsent|containsKey'},{d:'Recursive recurrence f(n-1)+f(n-2)',re:'fib\\s*\\(\\s*\\w+\\s*-\\s*1\\s*\\)\\s*\\+\\s*fib\\s*\\(\\s*\\w+\\s*-\\s*2\\s*\\)'}],
behavior:`1. fib(0)==0, fib(1)==1, fib(10)==55, fib(50)==12586269025. 2. fib(90) completes instantly (memo makes it O(n)) — returns 2880067194370816120. 3. Each n is computed exactly once; repeated calls are pure lookups.`,
hints:['Shape: <code>if (n <= 1) return n; return memo.computeIfAbsent(n, k -> fib(k - 1) + fib(k - 2));</code>','computeIfAbsent both checks the cache AND stores the computed value — the whole memo pattern in one call.','Use long — fib(90) overflows int at fib(47).'],
solution:`import java.util.*;

public class Fib {
    private final Map<Integer, Long> memo = new HashMap<>();

    long fib(int n) {
        if (n <= 1) return n;
        return memo.computeIfAbsent(n, k -> fib(k - 1) + fib(k - 2));
    }
}`},
{title:'Climbing stairs (count the ways)',
prompt:`You climb a staircase of n steps taking 1 or 2 steps at a time. Write <code>Stairs</code> with memoized <code>long ways(int n)</code>: ways(n) = ways(n-1) + ways(n-2), base cases ways(0) = 1 (one way: stand still) and ways(1) = 1. Same memo pattern as before — spot that it IS Fibonacci wearing a costume.`,
starter:`import java.util.*;

public class Stairs {
    private final Map<Integer, Long> memo = new HashMap<>();

    long ways(int n) {
        return 0;
    }
}`,
tests:[{d:'Base cases return 1',re:'n\\s*<=\\s*1[\\s\\S]*?return\\s+1'},{d:'Memoized',re:'computeIfAbsent|containsKey'},{d:'The two-choice recurrence',re:'ways\\s*\\(\\s*\\w+\\s*-\\s*1\\s*\\)\\s*\\+\\s*ways\\s*\\(\\s*\\w+\\s*-\\s*2\\s*\\)'}],
behavior:`1. ways(2)==2 (1+1, 2), ways(3)==3, ways(4)==5, ways(10)==89. 2. ways(80) returns instantly. 3. The recurrence encodes the CHOICE: last move was a 1-step (from n-1) or a 2-step (from n-2) — sum the ways to reach each.`,
hints:['"How many ways" + choices at each step = count-DP; the recurrence sums over the choices for the LAST move.','Base: <code>if (n <= 1) return 1;</code> — one way to be at the bottom, one way to reach step 1.','Identical skeleton to fib — DP problems are families, learn the family not the instance.'],
solution:`import java.util.*;

public class Stairs {
    private final Map<Integer, Long> memo = new HashMap<>();

    long ways(int n) {
        if (n <= 1) return 1;
        return memo.computeIfAbsent(n, k -> ways(k - 1) + ways(k - 2));
    }
}`}
]},
{id:'dp2',title:'Tabulation: bottom-up DP',body:`
<p><b>Tabulation</b> flips memoization: instead of recursing down from the answer, build a table up from the base cases — no recursion, no stack overflow, often less memory:</p>
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
    return dp[amount] &gt; amount ? -1 : dp[amount];          // unreachable → -1
}</div>
<p>Reading the recurrence: to make amount <code>a</code>, try every coin <code>c</code> as the <i>last</i> coin — that costs <code>dp[a-c] + 1</code>; take the minimum. The table order guarantees <code>dp[a-c]</code> is already final when you read it. That ordering-of-computation is the entire discipline of tabulation.</p>`,
docs:[['Coin change — CP-Algorithms adjacent writeup','https://cp-algorithms.com/dynamic_programming/intro-to-dp.html'],['Bottom-up DP — Baeldung','https://www.baeldung.com/cs/tabulation-vs-memoization']],
ex:{title:'Coin change',
prompt:`Write <code>Coins</code> with <code>static int minCoins(int[] coins, int amount)</code> returning the <b>fewest coins needed to make exactly amount</b>, with unlimited copies of each denomination — minCoins([1,2,5], 11) == 3 (5+5+1) — or <b>-1 when the amount cannot be made</b>. Implement it exactly as the tabulation recipe: dp array of size amount+1 filled with the sentinel <code>amount + 1</code>, <code>dp[0] = 0</code>, double loop (amounts outer, coins inner), <code>Math.min</code> relaxation, and the -1 check at the end.`,
starter:`import java.util.*;

public class Coins {
    static int minCoins(int[] coins, int amount) {
        return -1;
    }
}`,
tests:[{d:'Sentinel-filled dp table',re:'Arrays\\.fill\\s*\\(\\s*dp\\s*,\\s*amount\\s*\\+\\s*1\\s*\\)'},{d:'Base case dp[0] = 0',re:'dp\\[\\s*0\\s*\\]\\s*=\\s*0'},{d:'Min relaxation with dp[a - c] + 1',re:'Math\\.min\\s*\\(\\s*dp\\[\\s*\\w+\\s*\\]\\s*,\\s*dp\\[\\s*\\w+\\s*-\\s*\\w+\\s*\\]\\s*\\+\\s*1\\s*\\)'},{d:'Unreachable returns -1',re:'return\\s+dp\\[\\s*amount\\s*\\]\\s*>\\s*amount\\s*\\?\\s*-1|dp\\[amount\\]\\s*==\\s*amount\\s*\\+\\s*1\\s*\\?\\s*-1'}],
behavior:`1. minCoins([1,2,5], 11) == 3 (5+5+1). 2. minCoins([2], 3) == -1 (odd amount, even coins). 3. minCoins([1], 0) == 0 (base case). 4. minCoins([186,419,83,408], 6249) == 20 — brute force would never finish; the table does it in amount×coins steps.`,
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
}`}},
{id:'dp3',title:'2D DP: longest common subsequence',body:`
<p>When the state needs TWO indices, the table becomes 2D. The archetype is <b>LCS</b> — longest subsequence (not substring: gaps allowed, order kept) common to two strings. It powers diff tools, DNA alignment, and your git merge:</p>
<div class="codeSample" data-hl>// dp[i][j] = LCS length of first i chars of a and first j chars of b
int lcs(String a, String b) {
    int[][] dp = new int[a.length() + 1][b.length() + 1];   // row/col 0 = empty prefix
    for (int i = 1; i &lt;= a.length(); i++) {
        for (int j = 1; j &lt;= b.length(); j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;            // chars match: extend the diagonal
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);  // skip one char from a or b
            }
        }
    }
    return dp[a.length()][b.length()];
}</div>
<p>The two-case structure — <i>match → diagonal + 1, mismatch → max of dropping a char from either side</i> — reappears across the whole 2D family: edit distance, grid paths, knapsack (where the second dimension is remaining capacity). Master the +1 offset (row 0 = empty string) and the family opens up.</p>`,
docs:[['LCS — CP-Algorithms family','https://cp-algorithms.com/dynamic_programming/intro-to-dp.html'],['Edit distance & friends — Baeldung','https://www.baeldung.com/cs/levenshtein-distance-computation']],
ex:{title:'LCS table',
prompt:`Write <code>Lcs</code> with <code>static int length(String a, String b)</code> returning the length of the <b>longest common subsequence</b> — the longest sequence of characters appearing in both strings in the same order, not necessarily contiguously: length("abcde", "ace") == 3 ("ace"). Use the full 2D tabulation: <code>(a.length()+1) × (b.length()+1)</code> table, match case extending the diagonal, mismatch case taking the max of the two neighbors. Mind the index offset: <code>charAt(i - 1)</code>.`,
starter:`public class Lcs {
    static int length(String a, String b) {
        return 0;
    }
}`,
tests:[{d:'2D table with +1 dimensions',re:'new\\s+int\\[\\s*a\\.length\\s*\\(\\s*\\)\\s*\\+\\s*1\\s*\\]\\[\\s*b\\.length\\s*\\(\\s*\\)\\s*\\+\\s*1\\s*\\]'},{d:'Offset-aware char comparison',re:'charAt\\s*\\(\\s*i\\s*-\\s*1\\s*\\)\\s*==\\s*b\\.charAt\\s*\\(\\s*j\\s*-\\s*1\\s*\\)'},{d:'Diagonal + 1 on match',re:'dp\\[\\s*i\\s*-\\s*1\\s*\\]\\[\\s*j\\s*-\\s*1\\s*\\]\\s*\\+\\s*1'},{d:'Max of neighbors on mismatch',re:'Math\\.max\\s*\\(\\s*dp\\[\\s*i\\s*-\\s*1\\s*\\]\\[\\s*j\\s*\\]\\s*,\\s*dp\\[\\s*i\\s*\\]\\[\\s*j\\s*-\\s*1\\s*\\]\\s*\\)'}],
behavior:`1. length("abcde", "ace") == 3. 2. length("abc", "abc") == 3. 3. length("abc", "xyz") == 0. 4. length("AGGTAB", "GXTXAYB") == 4 (GTAB). 5. Empty string against anything == 0 (the zero row/column doing its job).`,
hints:['Row 0 and column 0 stay 0 — Java initializes them for you; that IS the base case.','Loops from 1 to length inclusive; string access always at index-1.','Return the bottom-right cell — the answer for both full strings.'],
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
}`}},
{id:'dp4',title:'The pattern toolbox: sliding window & two pointers',body:`
<p>Not everything hard is DP. Two patterns solve an enormous share of "optimal subarray/substring" problems in O(n):</p>
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
<p>Recognition guide: "longest/shortest contiguous run satisfying X" → sliding window; "pair/triple in sorted data" → two pointers; "count ways / min cost with choices" → DP. Naming the pattern out loud is half an interview.</p>`,
docs:[['Two pointers — CP-Algorithms adjacent','https://cp-algorithms.com/others/maximum_zero_submatrix.html'],['Sliding window pattern — Baeldung','https://www.baeldung.com/cs/sliding-window-algorithm']],
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
prompt:`Heights of vertical lines are given; two lines + the x-axis form a container. Write <code>Container</code> with <code>static int mostWater(int[] h)</code>: pointers at both ends, area = <code>Math.min(h[lo], h[hi]) * (hi - lo)</code>, keep the best, and always move the <b>shorter</b> line's pointer inward (moving the taller one can only shrink the area — that insight IS the algorithm).`,
starter:`public class Container {
    static int mostWater(int[] h) {
        return 0;
    }
}`,
tests:[{d:'Two pointers from both ends',re:'lo\\s*=\\s*0[\\s\\S]*?hi\\s*=\\s*h\\.length\\s*-\\s*1'},{d:'Area formula with min height × width',re:'Math\\.min\\s*\\(\\s*h\\[\\s*lo\\s*\\]\\s*,\\s*h\\[\\s*hi\\s*\\]\\s*\\)\\s*\\*\\s*\\(\\s*hi\\s*-\\s*lo\\s*\\)'},{d:'Moves the shorter side',re:'h\\[\\s*lo\\s*\\]\\s*<\\s*h\\[\\s*hi\\s*\\]'},{d:'Single while loop, O(n)',re:'while\\s*\\(\\s*lo\\s*<\\s*hi\\s*\\)'}],
behavior:`1. mostWater([1,8,6,2,5,4,8,3,7]) == 49 (lines of height 8 and 7, width 7). 2. mostWater([1,1]) == 1. 3. O(n): each step eliminates one line permanently — the proof is that the shorter line can never do better with a narrower width.`,
hints:['Track best while lo < hi; compute area each step.','The move rule: <code>if (h[lo] < h[hi]) lo++; else hi--;</code>','Why it is safe to discard the shorter line: any container using it with a smaller width is capped by the same short height — strictly worse.'],
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
}`}
]}
]});
