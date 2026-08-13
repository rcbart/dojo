STREAMS.push({icon:'🏆',tournament:true,title:'Coding Challenges: The Tournament',blurb:'Interview-style problems in three ranked rounds — Easy, Medium, Hard. Enter after Fundamentals; return often.',lessons:[
{id:'ch1',title:'Easy round',body:`
<p>Warm-up bouts. Easy problems test whether the fundamentals are automatic: hash lookups, pointer discipline, clean loops. In an interview these are the first 10 minutes — the goal is not just solving them but solving them <i>cleanly while talking</i>.</p>
<p>Approach ritual (use it on every problem in this tournament): restate the problem in one sentence → name the brute force and its complexity → name the pattern that beats it → code → walk one example and one edge case out loud.</p>

<h4>Why "easy" is misleading</h4>
<p>Easy means the <i>pattern</i> is easy once you see it. It does not mean the interview is easy, because
easies are where communication habits are established. An interviewer who watches you solve two-sum in
silence has learned almost nothing about you; one who watches you say "brute force is O(n²) nested
loops — I can trade space for time with a map of complements, O(n) time and O(n) space" has learned
the thing they are actually there to find out.</p>

<h4>The fundamentals being tested</h4>
<div class="codeSample" data-hl>HASH LOOKUP        "have I seen X?" in O(1). the single highest-leverage
                   structure in interviews. complement lookups, frequency
                   counts, dedup, grouping — all the same move.

POINTER DISCIPLINE two indices moving with intent: start/end converging,
                   fast/slow for cycles, a window that grows and shrinks.
                   the bug is almost always the loop bound or the update order.

CLEAN LOOPS        one job per loop, no mutation you cannot explain, and
                   an invariant you could state if asked. "what is true
                   every time this loop starts?" is the question that
                   finds off-by-one errors before the interviewer does.</div>

<h4>The edge cases that come up every time</h4>
<p>Reach for these unprompted — noticing them is worth more than speed: <b>empty</b> input,
<b>one</b> element, <b>all identical</b> elements, <b>negative</b> numbers where you assumed positive,
<b>duplicates</b> where you assumed uniqueness, and <b>integer overflow</b> on sums or on
<code>(lo + hi) / 2</code>. That last one is a genuine classic: use
<code>lo + (hi - lo) / 2</code>.</p>
<p><b>A note on the ritual.</b> It feels artificial for an easy problem, which is exactly why it is
worth practising here. Under pressure on a hard problem you will do what you rehearsed, and nobody
invents structured communication for the first time in the final round.</p>`,
docs:[['Big-O cheat sheet','https://www.bigocheatsheet.com/'],['HashMap — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html']],
exs:[
{title:'Two Sum',
prompt:`<b>Easy.</b> Given an int array and a target, return the indices of the two numbers that add to the target (exactly one solution exists, may not reuse an element). Brute force is O(n²); write <code>static int[] twoSum(int[] nums, int target)</code> in <b>one pass with a HashMap</b> of value→index: for each element, first check whether its complement is already in the map.`,
starter:`import java.util.*;

public class TwoSum {
    static int[] twoSum(int[] nums, int target) {
        return new int[]{-1, -1};
    }
}`,
tests:[{d:'Uses a HashMap',re:'new\\s+HashMap<'},{d:'Checks the complement',re:'target\\s*-\\s*nums\\[\\s*\\w+\\s*\\]'},{d:'Single pass (one loop)',re:'for\\s*\\([\\s\\S]*?for\\s*\\(',not:true},{d:'Stores value→index as it goes',re:'\\.put\\s*\\(\\s*nums\\[\\s*\\w+\\s*\\]\\s*,\\s*\\w+\\s*\\)'}],
behavior:`1. twoSum([2,7,11,15], 9) == [0,1]. 2. twoSum([3,2,4], 6) == [1,2] (not [0,0] — check-before-put prevents self-pairing). 3. twoSum([3,3], 6) == [0,1]. 4. O(n) time, one traversal.`,
hints:['For each i: does the map already contain target - nums[i]? If yes, done.','Check BEFORE putting nums[i] — that ordering handles the duplicate-value cases correctly.','Map shape: value → its index.'],
solution:`import java.util.*;

public class TwoSum {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }
}`},
{title:'Valid palindrome',
prompt:`<b>Easy.</b> Write <code>static boolean isPalindrome(String s)</code>: considering only letters and digits and ignoring case, does the string read the same both ways? Two pointers from the ends, skipping non-alphanumerics with <code>Character.isLetterOrDigit</code>, comparing with <code>Character.toLowerCase</code>. No cleaned-copy allocation — do it in place on the indices.`,
starter:`public class Palindrome {
    static boolean isPalindrome(String s) {
        return false;
    }
}`,
tests:[{d:'Two pointers from both ends',re:'\\w+\\s*=\\s*0[\\s\\S]*?\\w+\\s*=\\s*s\\.length\\s*\\(\\s*\\)\\s*-\\s*1'},{d:'Skips non-alphanumerics',re:'Character\\.isLetterOrDigit'},{d:'Case-insensitive compare',re:'Character\\.toLowerCase'},{d:'No cleaned-string allocation',re:'replaceAll|toCharArray\\(\\)\\.length|StringBuilder',not:true}],
behavior:`1. isPalindrome("A man, a plan, a canal: Panama") == true. 2. isPalindrome("race a car") == false. 3. isPalindrome(" ") == true (nothing to compare). 4. O(n) time, O(1) space — the skipping happens inside the main loop, not via a preprocessing pass.`,
hints:['Outer loop while lo < hi; inner skips: <code>while (lo < hi && !Character.isLetterOrDigit(s.charAt(lo))) lo++;</code> and mirrored for hi.','Compare lowercased chars; on mismatch return false immediately.','Advance both pointers after a successful match.'],
solution:`public class Palindrome {
    static boolean isPalindrome(String s) {
        int lo = 0, hi = s.length() - 1;
        while (lo < hi) {
            while (lo < hi && !Character.isLetterOrDigit(s.charAt(lo))) lo++;
            while (lo < hi && !Character.isLetterOrDigit(s.charAt(hi))) hi--;
            if (Character.toLowerCase(s.charAt(lo)) != Character.toLowerCase(s.charAt(hi))) {
                return false;
            }
            lo++;
            hi--;
        }
        return true;
    }
}`},
{title:'Merge two sorted arrays',
prompt:`<b>Easy.</b> Write <code>static int[] merge(int[] a, int[] b)</code>: both inputs are sorted ascending; return one sorted array containing all elements. The classic two-index merge (the heart of merge sort): compare heads, take the smaller, then drain whichever input remains. No sorting calls allowed.`,
starter:`public class Merge {
    static int[] merge(int[] a, int[] b) {
        return null;
    }
}`,
tests:[{d:'Result sized a+b',re:'new\\s+int\\[\\s*a\\.length\\s*\\+\\s*b\\.length\\s*\\]'},{d:'Head-vs-head comparison',re:'a\\[\\s*\\w+\\s*\\]\\s*<=?\\s*b\\[\\s*\\w+\\s*\\]'},{d:'Drains the leftovers',re:'while\\s*\\(\\s*\\w+\\s*<\\s*a\\.length\\s*\\)[\\s\\S]*?while\\s*\\(\\s*\\w+\\s*<\\s*b\\.length\\s*\\)'},{d:'No Arrays.sort cheating',re:'Arrays\\.sort',not:true}],
behavior:`1. merge([1,3,5], [2,4,6]) == [1,2,3,4,5,6]. 2. merge([], [1,2]) == [1,2]. 3. merge([1,1], [1]) == [1,1,1] (duplicates preserved). 4. O(n+m) — each element examined exactly once.`,
hints:['Three indices: i into a, j into b, k into the result.','Main loop while both have elements: take the smaller head, advance its index and k.','Then two drain loops — only one of them will actually run.'],
solution:`public class Merge {
    static int[] merge(int[] a, int[] b) {
        int[] out = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) {
            out[k++] = a[i] <= b[j] ? a[i++] : b[j++];
        }
        while (i < a.length) out[k++] = a[i++];
        while (j < b.length) out[k++] = b[j++];
        return out;
    }
}`}
,
{title:'Reverse a string',
prompt:`<b>Easy.</b> Write <code>static String reverse(String s)</code> that reverses the characters using a <b>two-pointer swap</b> on a char array (no <code>StringBuilder.reverse</code>).`,
starter:`public class Reverse {\n    static String reverse(String s) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+String\\s+reverse\\s*\\(\\s*String\\s+s\\s*\\)'},{d:'Uses a char array',re:'toCharArray\\s*\\(\\s*\\)'},{d:'Two-pointer swap loop',re:'while\\s*\\(\\s*\\w+\\s*<\\s*\\w+\\s*\\)'},{d:'No StringBuilder.reverse shortcut',re:'StringBuilder',not:true}],
behavior:`1. reverse("abc") == "cba". 2. reverse("") == "". 3. reverse("a") == "a". 4. O(n) with in-place swaps on the char array.`,
hints:['<code>char[] c = s.toCharArray();</code> then swap from both ends inward.','<code>while (lo < hi) { swap c[lo],c[hi]; lo++; hi--; }</code>','<code>return new String(c);</code>'],
solution:`public class Reverse {\n    static String reverse(String s) {\n        char[] c = s.toCharArray();\n        int lo = 0, hi = c.length - 1;\n        while (lo < hi) {\n            char t = c[lo];\n            c[lo] = c[hi];\n            c[hi] = t;\n            lo++;\n            hi--;\n        }\n        return new String(c);\n    }\n}`},
{title:'FizzBuzz',
prompt:`<b>Easy.</b> Write <code>static java.util.List&lt;String&gt; fizzBuzz(int n)</code> returning entries 1..n where multiples of 3 are "Fizz", of 5 are "Buzz", of both "FizzBuzz", else the number as a string.`,
starter:`import java.util.*;\n\npublic class FizzBuzz {\n    static List<String> fizzBuzz(int n) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<String>\\s+fizzBuzz\\s*\\(\\s*int\\s+n\\s*\\)'},{d:'Checks divisible by 3',re:'%\\s*3\\s*==\\s*0'},{d:'FizzBuzz for both',re:'"FizzBuzz"'},{d:'Number to string',re:'String\\.valueOf|Integer\\.toString'}],
behavior:`1. fizzBuzz(5) == [1, 2, Fizz, 4, Buzz]. 2. fizzBuzz(15) ends with FizzBuzz. 3. Check %15 (or %3&&%5) FIRST so 15 does not match Fizz.`,
hints:['Loop 1..n inclusive.','Test the combined case first: <code>if (i % 15 == 0) ... else if (i % 3 == 0) ...</code>','<code>String.valueOf(i)</code> for the plain-number case.'],
solution:`import java.util.*;\n\npublic class FizzBuzz {\n    static List<String> fizzBuzz(int n) {\n        List<String> out = new ArrayList<>();\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) out.add("FizzBuzz");\n            else if (i % 3 == 0) out.add("Fizz");\n            else if (i % 5 == 0) out.add("Buzz");\n            else out.add(String.valueOf(i));\n        }\n        return out;\n    }\n}`},
{title:'Maximum of an array',
prompt:`<b>Easy.</b> Write <code>static int max(int[] a)</code> returning the largest element with a single pass (assume non-empty). No <code>Arrays.sort</code> or streams.`,
starter:`public class MaxOf {\n    static int max(int[] a) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+max\\s*\\(\\s*int\\[\\]\\s+a\\s*\\)'},{d:'Seeds from the first element',re:'a\\[\\s*0\\s*\\]'},{d:'Compares in a loop',re:'>\\s*\\w+|Math\\.max'},{d:'No sort',re:'Arrays\\.sort',not:true}],
behavior:`1. max([3,1,4,1,5]) == 5. 2. max([-2,-9]) == -2. 3. max([7]) == 7. 4. Single O(n) pass.`,
hints:['Start best = a[0], loop from index 1.','<code>if (a[i] > best) best = a[i];</code> (or Math.max).','Return best after the loop.'],
solution:`public class MaxOf {\n    static int max(int[] a) {\n        int best = a[0];\n        for (int i = 1; i < a.length; i++) {\n            if (a[i] > best) best = a[i];\n        }\n        return best;\n    }\n}`},
{title:'Factorial',
prompt:`<b>Easy.</b> Write <code>static long factorial(int n)</code> computing n! iteratively (0! = 1). Use <code>long</code> to survive up to 20!.`,
starter:`public class Factorial {\n    static long factorial(int n) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature returns long',re:'static\\s+long\\s+factorial\\s*\\(\\s*int\\s+n\\s*\\)'},{d:'Accumulates a product',re:'\\*=\\s*\\w+|result\\s*=\\s*result\\s*\\*'},{d:'Loops over the range',re:'for\\s*\\('}],
behavior:`1. factorial(0) == 1. 2. factorial(5) == 120. 3. factorial(20) == 2432902008176640000. 4. The result variable starts at 1.`,
hints:['Start <code>long result = 1;</code>.','<code>for (int i = 2; i <= n; i++) result *= i;</code>','Return result — the empty loop for n<=1 correctly yields 1.'],
solution:`public class Factorial {\n    static long factorial(int n) {\n        long result = 1;\n        for (int i = 2; i <= n; i++) {\n            result *= i;\n        }\n        return result;\n    }\n}`},
{title:'Count vowels',
prompt:`<b>Easy.</b> Write <code>static int vowels(String s)</code> counting a, e, i, o, u case-insensitively, using <code>"aeiou".indexOf(...)</code> to test each lowercased char.`,
starter:`public class Vowels {\n    static int vowels(String s) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+vowels\\s*\\(\\s*String\\s+s\\s*\\)'},{d:'Uses the vowel set membership test',re:'"aeiou"\\.indexOf'},{d:'Lowercases for case-insensitivity',re:'toLowerCase'}],
behavior:`1. vowels("Education") == 5. 2. vowels("xyz") == 0. 3. vowels("") == 0. 4. Uppercase vowels counted too.`,
hints:['Loop each char, lowercase it.','<code>if ("aeiou".indexOf(Character.toLowerCase(c)) >= 0) count++;</code>','indexOf returns -1 when the char is not a vowel.'],
solution:`public class Vowels {\n    static int vowels(String s) {\n        int count = 0;\n        for (char c : s.toCharArray()) {\n            if ("aeiou".indexOf(Character.toLowerCase(c)) >= 0) count++;\n        }\n        return count;\n    }\n}`},
{title:'Is prime',
prompt:`<b>Easy.</b> Write <code>static boolean isPrime(int n)</code>: false for n &lt; 2, else trial-divide only up to <code>i * i &lt;= n</code> (the sqrt optimization).`,
starter:`public class Primes {\n    static boolean isPrime(int n) {\n        return false;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+boolean\\s+isPrime\\s*\\(\\s*int\\s+n\\s*\\)'},{d:'Handles n < 2',re:'n\\s*<\\s*2'},{d:'Loops only to sqrt',re:'\\w+\\s*\\*\\s*\\w+\\s*<=\\s*n'},{d:'Divisibility test',re:'%\\s*\\w+\\s*==\\s*0'}],
behavior:`1. isPrime(2) == true, isPrime(17) == true. 2. isPrime(1) == false, isPrime(0) == false, isPrime(-3) == false. 3. isPrime(15) == false. 4. Loops to sqrt(n), not n — O(sqrt n).`,
hints:['Guard: <code>if (n < 2) return false;</code>','<code>for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;</code>','Return true if no divisor found.'],
solution:`public class Primes {\n    static boolean isPrime(int n) {\n        if (n < 2) return false;\n        for (int i = 2; i * i <= n; i++) {\n            if (n % i == 0) return false;\n        }\n        return true;\n    }\n}`},
{title:'Reverse an integer',
prompt:`<b>Easy.</b> Write <code>static int reverseInt(int x)</code> reversing the digits (123 -> 321, -120 -> -21). Return 0 if the result overflows a 32-bit int — accumulate in a <code>long</code> and check bounds.`,
starter:`public class ReverseInt {\n    static int reverseInt(int x) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+reverseInt\\s*\\(\\s*int\\s+x\\s*\\)'},{d:'Peels digits with %10',re:'%\\s*10'},{d:'Builds with *10',re:'\\*\\s*10'},{d:'Guards overflow with long or MAX_VALUE',re:'long|Integer\\.MAX_VALUE'}],
behavior:`1. reverseInt(123) == 321. 2. reverseInt(-120) == -21. 3. reverseInt(1534236469) == 0 (overflow). 4. Sign is preserved naturally by % on negatives.`,
hints:['<code>long r = 0;</code> then <code>r = r * 10 + x % 10; x /= 10;</code> in a loop.','After the loop check <code>if (r < Integer.MIN_VALUE || r > Integer.MAX_VALUE) return 0;</code>','<code>return (int) r;</code>'],
solution:`public class ReverseInt {\n    static int reverseInt(int x) {\n        long r = 0;\n        while (x != 0) {\n            r = r * 10 + x % 10;\n            x /= 10;\n        }\n        if (r < Integer.MIN_VALUE || r > Integer.MAX_VALUE) return 0;\n        return (int) r;\n    }\n}`},
{title:'Contains duplicate',
prompt:`<b>Easy.</b> Write <code>static boolean hasDuplicate(int[] a)</code> returning true if any value appears twice, using a <code>HashSet</code>: return true the moment <code>add</code> reports the value was already present.`,
starter:`import java.util.*;\n\npublic class Dup {\n    static boolean hasDuplicate(int[] a) {\n        return false;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+boolean\\s+hasDuplicate\\s*\\(\\s*int\\[\\]\\s+a\\s*\\)'},{d:'Uses a HashSet',re:'new\\s+HashSet<'},{d:'Uses add result or contains',re:'\\.add\\s*\\(|\\.contains\\s*\\('}],
behavior:`1. hasDuplicate([1,2,3,1]) == true. 2. hasDuplicate([1,2,3]) == false. 3. hasDuplicate([]) == false. 4. O(n): Set.add returns false when the element was already present.`,
hints:['<code>Set&lt;Integer&gt; seen = new HashSet&lt;&gt;();</code>','<code>if (!seen.add(x)) return true;</code> — add returns false on a duplicate.','Return false after the loop.'],
solution:`import java.util.*;\n\npublic class Dup {\n    static boolean hasDuplicate(int[] a) {\n        Set<Integer> seen = new HashSet<>();\n        for (int x : a) {\n            if (!seen.add(x)) return true;\n        }\n        return false;\n    }\n}`},
{title:'Missing number',
prompt:`<b>Easy.</b> An array holds n distinct numbers from the range 0..n with exactly one missing. Write <code>static int missing(int[] a)</code> using the sum formula: expected <code>n*(n+1)/2</code> minus the actual sum.`,
starter:`public class Missing {\n    static int missing(int[] a) {\n        return -1;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+missing\\s*\\(\\s*int\\[\\]\\s+a\\s*\\)'},{d:'Uses the n(n+1)/2 formula',re:'\\*\\s*\\(\\s*\\w+\\s*\\+\\s*1\\s*\\)\\s*/\\s*2'},{d:'Subtracts the actual sum',re:'-=\\s*\\w+|expected\\s*-'}],
behavior:`1. missing([3,0,1]) == 2. 2. missing([0,1]) == 2 (n=2, top of range missing). 3. missing([1]) == 0. 4. O(n) time, O(1) space.`,
hints:['n = a.length; expected = n*(n+1)/2.','Subtract every element from expected.','What remains is the missing number.'],
solution:`public class Missing {\n    static int missing(int[] a) {\n        int n = a.length;\n        int expected = n * (n + 1) / 2;\n        for (int x : a) expected -= x;\n        return expected;\n    }\n}`},
{title:'Single number',
prompt:`<b>Easy.</b> Every element appears twice except one. Write <code>static int single(int[] a)</code> that finds it in O(n) time and O(1) space using <b>XOR</b> (x ^ x == 0, x ^ 0 == x).`,
starter:`public class Single {\n    static int single(int[] a) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+single\\s*\\(\\s*int\\[\\]\\s+a\\s*\\)'},{d:'Uses XOR accumulation',re:'\\^=|\\^\\s*\\w+'},{d:'No Map or Set',re:'HashMap|HashSet',not:true}],
behavior:`1. single([2,2,1]) == 1. 2. single([4,1,2,1,2]) == 4. 3. single([7]) == 7. 4. XOR of all elements cancels the pairs, leaving the unique value.`,
hints:['Start <code>int x = 0;</code>.','<code>for (int v : a) x ^= v;</code>','Pairs cancel to 0; the lone value survives.'],
solution:`public class Single {\n    static int single(int[] a) {\n        int x = 0;\n        for (int v : a) x ^= v;\n        return x;\n    }\n}`},
{title:'Valid anagram',
prompt:`<b>Easy.</b> Write <code>static boolean isAnagram(String a, String b)</code>: true iff b is a rearrangement of a. Use a 26-count array (assume lowercase letters): increment for a, decrement for b, all counts must end at zero. Different lengths return false fast.`,
starter:`public class Anagram {\n    static boolean isAnagram(String a, String b) {\n        return false;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+boolean\\s+isAnagram\\s*\\(\\s*String\\s+a\\s*,\\s*String\\s+b\\s*\\)'},{d:'Length short-circuit',re:'length\\s*\\(\\s*\\)\\s*!=\\s*\\w+\\.length'},{d:'Count array of 26',re:'new\\s+int\\[\\s*26\\s*\\]'}],
behavior:`1. isAnagram("listen","silent") == true. 2. isAnagram("rat","car") == false. 3. isAnagram("a","ab") == false (length guard). 4. O(n) with a fixed 26-int counter.`,
hints:['If lengths differ, return false immediately.','<code>count[a.charAt(i)-\'a\']++;</code> and <code>count[b.charAt(i)-\'a\']--;</code> in one loop.','Then any non-zero count means not an anagram.'],
solution:`public class Anagram {\n    static boolean isAnagram(String a, String b) {\n        if (a.length() != b.length()) return false;\n        int[] count = new int[26];\n        for (int i = 0; i < a.length(); i++) {\n            count[a.charAt(i) - 'a']++;\n            count[b.charAt(i) - 'a']--;\n        }\n        for (int c : count) if (c != 0) return false;\n        return true;\n    }\n}`},
{title:'Move zeroes',
prompt:`<b>Easy.</b> Write <code>static void moveZeroes(int[] a)</code> that moves all zeroes to the end <b>in place</b> while keeping the order of non-zeroes. Two-pointer: a write index that only advances when you place a non-zero.`,
starter:`public class MoveZeroes {\n    static void moveZeroes(int[] a) {\n    }\n}`,
tests:[{d:'Void in-place signature',re:'static\\s+void\\s+moveZeroes\\s*\\(\\s*int\\[\\]\\s+a\\s*\\)'},{d:'Write index advances on non-zero',re:'!=\\s*0'},{d:'Writes into a[w]',re:'a\\[\\s*\\w+\\+\\+\\s*\\]\\s*=|a\\[\\s*\\w+\\s*\\]\\s*='},{d:'No extra array allocation',re:'new\\s+int\\[',not:true}],
behavior:`1. [0,1,0,3,12] becomes [1,3,12,0,0]. 2. [0,0] becomes [0,0]. 3. [1,2] unchanged. 4. Relative order of non-zeroes preserved; O(1) extra space.`,
hints:['First pass: copy each non-zero to a[write++].','Second pass: fill a[write..end] with 0.','No new array — everything happens inside a.'],
solution:`public class MoveZeroes {\n    static void moveZeroes(int[] a) {\n        int w = 0;\n        for (int x : a) {\n            if (x != 0) a[w++] = x;\n        }\n        while (w < a.length) a[w++] = 0;\n    }\n}`},
{title:'Best time to buy and sell stock',
prompt:`<b>Easy.</b> Prices by day; buy once and sell later. Write <code>static int maxProfit(int[] prices)</code> in one pass: track the minimum price so far and the best profit (<code>price - minSoFar</code>). Return 0 if no profit is possible.`,
starter:`public class Stock {\n    static int maxProfit(int[] prices) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+maxProfit\\s*\\(\\s*int\\[\\]\\s+prices\\s*\\)'},{d:'Tracks a running minimum',re:'Math\\.min'},{d:'Tracks best profit',re:'Math\\.max'}],
behavior:`1. maxProfit([7,1,5,3,6,4]) == 5 (buy 1, sell 6). 2. maxProfit([7,6,4,3,1]) == 0 (only losses). 3. maxProfit([2]) == 0. 4. Single O(n) pass.`,
hints:['Keep <code>int min = prices[0];</code> and <code>int best = 0;</code>.','Each day: <code>best = Math.max(best, p - min); min = Math.min(min, p);</code>','Update best before (or with) min — you can only sell after buying.'],
solution:`public class Stock {\n    static int maxProfit(int[] prices) {\n        int min = Integer.MAX_VALUE, best = 0;\n        for (int p : prices) {\n            best = Math.max(best, p - min);\n            min = Math.min(min, p);\n        }\n        return best;\n    }\n}`},
{title:'Majority element',
prompt:`<b>Easy.</b> An element appears more than n/2 times. Write <code>static int majority(int[] a)</code> using <b>Boyer-Moore voting</b>: keep a candidate and a count; matching values increment, others decrement, and on zero adopt a new candidate. O(n) time, O(1) space.`,
starter:`public class Majority {\n    static int majority(int[] a) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+majority\\s*\\(\\s*int\\[\\]\\s+a\\s*\\)'},{d:'Keeps a running count',re:'count\\s*==\\s*0|count\\s*\\+\\+|count--'},{d:'Tracks a candidate',re:'candidate\\s*='},{d:'No Map (O(1) space)',re:'HashMap',not:true}],
behavior:`1. majority([3,2,3]) == 3. 2. majority([2,2,1,1,1,2,2]) == 2. 3. majority([9]) == 9. 4. Voting: the true majority cannot be fully cancelled out.`,
hints:['Start with count 0 and no fixed candidate.','If count == 0, set candidate = current; then count += (current == candidate ? 1 : -1).','The survivor is the majority element.'],
solution:`public class Majority {\n    static int majority(int[] a) {\n        int candidate = a[0], count = 0;\n        for (int x : a) {\n            if (count == 0) candidate = x;\n            count += (x == candidate) ? 1 : -1;\n        }\n        return candidate;\n    }\n}`},
{title:'Sum of digits',
prompt:`<b>Easy.</b> Write <code>static int digitSum(int n)</code> returning the sum of the decimal digits of <code>|n|</code> (handle negatives via <code>Math.abs</code>). Peel digits with %10 and /10.`,
starter:`public class DigitSum {\n    static int digitSum(int n) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+digitSum\\s*\\(\\s*int\\s+n\\s*\\)'},{d:'Handles negatives',re:'Math\\.abs'},{d:'Peels digits',re:'%\\s*10'},{d:'Divides down',re:'/=\\s*10|/\\s*10'}],
behavior:`1. digitSum(1234) == 10. 2. digitSum(-56) == 11. 3. digitSum(0) == 0. 4. Loops while the running value is non-zero.`,
hints:['<code>n = Math.abs(n);</code> first.','<code>while (n > 0) { sum += n % 10; n /= 10; }</code>','Return sum.'],
solution:`public class DigitSum {\n    static int digitSum(int n) {\n        n = Math.abs(n);\n        int sum = 0;\n        while (n > 0) {\n            sum += n % 10;\n            n /= 10;\n        }\n        return sum;\n    }\n}`},
{title:'Nth Fibonacci (iterative)',
prompt:`<b>Easy.</b> Write <code>static long fibonacci(int n)</code> computing the nth Fibonacci number <b>iteratively</b> (no recursion): two rolling variables, O(n) time O(1) space. fib(0)=0, fib(1)=1.`,
starter:`public class FibIter {\n    static long fibonacci(int n) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+long\\s+fibonacci\\s*\\(\\s*int\\s+n\\s*\\)'},{d:'Iterative loop',re:'for\\s*\\(|while\\s*\\('},{d:'Rolling update of two vars',re:'\\w+\\s*\\+\\s*\\w+'},{d:'Not recursive',re:'fibonacci\\s*\\(\\s*\\w+\\s*-',not:true}],
behavior:`1. fibonacci(0) == 0, fibonacci(1) == 1. 2. fibonacci(10) == 55. 3. fibonacci(50) == 12586269025. 4. O(n) with no recursion or memo map.`,
hints:['Handle n <= 1 directly.','Roll two variables: <code>long a=0,b=1; for(...){ long t=a+b; a=b; b=t; }</code>','Return the right one for your loop bounds.'],
solution:`public class FibIter {\n    static long fibonacci(int n) {\n        if (n <= 1) return n;\n        long a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            long t = a + b;\n            a = b;\n            b = t;\n        }\n        return b;\n    }\n}`},
{title:'Count words',
prompt:`<b>Easy.</b> Write <code>static int wordCount(String s)</code> returning the number of whitespace-separated words, treating runs of spaces and leading/trailing spaces correctly (a blank string is 0 words). Use <code>trim</code> + <code>split</code> on <code>\\\\s+</code>.`,
starter:`public class WordCount {\n    static int wordCount(String s) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+wordCount\\s*\\(\\s*String\\s+s\\s*\\)'},{d:'Blank guard',re:'isBlank\\s*\\(\\s*\\)|trim\\s*\\(\\s*\\)\\.isEmpty'},{d:'Splits on whitespace',re:'split\\s*\\(\\s*"\\\\\\\\s\\+"'}],
behavior:`1. wordCount("the quick brown fox") == 4. 2. wordCount("  hello   world  ") == 2. 3. wordCount("") == 0 and wordCount("   ") == 0. 4. Multiple spaces collapse — the regex split handles it.`,
hints:['Guard first: <code>if (s.isBlank()) return 0;</code> — avoids counting one empty token.','<code>return s.trim().split("\\\\s+").length;</code>','trim removes the leading/trailing whitespace that would create empty tokens.'],
solution:`public class WordCount {\n    static int wordCount(String s) {\n        if (s.isBlank()) return 0;\n        return s.trim().split("\\\\s+").length;\n    }\n}`}

]},
{id:'ch2',title:'Medium round',body:`
<p>The real interview weight class. Almost every medium is <b>two ideas stacked</b>: a data structure
plus one insight that collapses the problem. Easies test whether you know the structure; mediums test
whether you can <i>find the insight under time pressure</i>, which is a different skill and the one
that is actually being assessed.</p>

<h4>The pattern-recognition move</h4>
<p>Strong candidates do not start coding. They spend thirty seconds naming the shape, because naming it
correctly determines the whole solution:</p>
<div class="codeSample" data-hl>PROBLEM SHAPE                        THE PATTERN                      COST
"group things that are equivalent"   canonical key + map buckets      O(n k log k)
"sorted-ish array, find something"   binary search with a twist       O(log n)
"result[i] depends on all but i"     prefix x suffix products         O(n), no division
"longest/shortest window with X"     two pointers, sliding window     O(n)
"k largest / smallest so far"        heap of size k                   O(n log k)
"count pairs summing to T"           complement lookup in a map       O(n)
"nested structure, undo choices"     backtracking with a path stack   exponential, pruned</div>
<p>Say the pattern out loud before writing anything. If you cannot name it, you are about to write the
brute force — which is fine as a stated starting point, and fatal as a silent one.</p>

<h4>The three in this round, and why each is instructive</h4>
<ul>
<li><b>Group anagrams</b> — the canonical-key idea. Anagrams are equal <i>after normalisation</i>, so
sorting each word's characters produces a key that collides exactly when you want it to. The general
lesson: when equality is not literal, invent a key that makes it literal. Sorting costs O(k log k) per
word; a 26-slot character count is O(k) and faster for long words.</li>
<li><b>Search in a rotated sorted array</b> — binary search survives a broken invariant. The array is
not sorted, but at every split <b>one half always is</b>, and you can tell which by comparing the
endpoints. Recognising that a weakened invariant still supports the algorithm is the transferable
insight.</li>
<li><b>Product of array except self</b> — the constraint (no division) is the hint. Forbidding division
forces you to see the answer as prefix-product times suffix-product, which is one left pass and one
right pass. When an interviewer bans the obvious tool, they are telling you the intended structure.</li>
</ul>

<h4>How mediums are actually scored</h4>
<p>Rarely on whether you finish. The signals are: did you state the approach and its complexity before
coding, did you notice the edge cases unprompted (empty input, single element, duplicates, integer
overflow), and did you test your own code rather than announcing it was done. A working solution with
no stated complexity often scores below a nearly-working one with clear reasoning.</p>
<p><b>The recovery move.</b> When stuck, say what you know — "brute force is O(n²) because I re-scan
for every element; I want to avoid re-scanning, so I need something that remembers what I have seen,
which suggests a map". That sentence is the actual skill, and it frequently produces the answer.</p>`,
docs:[['Binary search — API note on Arrays.binarySearch','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html'],['Collectors.groupingBy — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Collectors.html']],
exs:[
{title:'Group anagrams',
prompt:`<b>Medium.</b> Write <code>static java.util.List&lt;java.util.List&lt;String&gt;&gt; group(String[] words)</code>: bucket words that are anagrams of each other. Canonical key = the word's characters sorted (<code>char[]</code> + <code>Arrays.sort</code> + <code>new String</code>); buckets in a <code>HashMap&lt;String, List&lt;String&gt;&gt;</code> via <code>computeIfAbsent</code>; return the bucket values.`,
starter:`import java.util.*;

public class Anagrams {
    static List<List<String>> group(String[] words) {
        return null;
    }
}`,
tests:[{d:'Sorted-chars canonical key',re:'toCharArray\\s*\\(\\s*\\)[\\s\\S]*?Arrays\\.sort'},{d:'Buckets via computeIfAbsent',re:'computeIfAbsent\\s*\\([^)]*->\\s*new\\s+ArrayList'},{d:'Returns the map values',re:'new\\s+ArrayList<>\\s*\\(\\s*\\w+\\.values\\s*\\(\\s*\\)\\s*\\)'}],
behavior:`1. group(["eat","tea","tan","ate","nat","bat"]) yields buckets {eat,tea,ate}, {tan,nat}, {bat} (any order). 2. group([""]) == [[""]]. 3. Two words land together iff their sorted characters are identical. 4. O(n · k log k) where k is max word length.`,
hints:['Key building: <code>char[] cs = w.toCharArray(); Arrays.sort(cs); String key = new String(cs);</code>','<code>map.computeIfAbsent(key, k -> new ArrayList<>()).add(w);</code> — bucket-or-create in one line.','The return is just the values: <code>new ArrayList&lt;&gt;(map.values())</code>.'],
solution:`import java.util.*;

public class Anagrams {
    static List<List<String>> group(String[] words) {
        Map<String, List<String>> buckets = new HashMap<>();
        for (String w : words) {
            char[] cs = w.toCharArray();
            Arrays.sort(cs);
            String key = new String(cs);
            buckets.computeIfAbsent(key, k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(buckets.values());
    }
}`},
{title:'Search in rotated sorted array',
prompt:`<b>Medium.</b> A sorted array was rotated at an unknown pivot ([4,5,6,7,0,1,2]). Write <code>static int search(int[] nums, int target)</code> returning the index or -1 in <b>O(log n)</b>: binary search where each step determines which half is properly sorted (<code>nums[lo] &lt;= nums[mid]</code>?) and whether the target lies inside that sorted half — then discard the other.`,
starter:`public class Rotated {
    static int search(int[] nums, int target) {
        return -1;
    }
}`,
tests:[{d:'Binary search skeleton',re:'while\\s*\\(\\s*lo\\s*<=\\s*hi\\s*\\)[\\s\\S]*?mid'},{d:'Detects the sorted half',re:'nums\\[\\s*lo\\s*\\]\\s*<=\\s*nums\\[\\s*mid\\s*\\]'},{d:'Range test inside the sorted half',re:'nums\\[\\s*lo\\s*\\]\\s*<=\\s*target|target\\s*<=\\s*nums\\[\\s*hi\\s*\\]'},{d:'No linear scan',re:'for\\s*\\(\\s*int\\s+\\w+\\s*=\\s*0\\s*;\\s*\\w+\\s*<\\s*nums\\.length',not:true}],
behavior:`1. search([4,5,6,7,0,1,2], 0) == 4. 2. search([4,5,6,7,0,1,2], 3) == -1. 3. search([1], 1) == 0. 4. Works when the array is not rotated at all (pivot 0). 5. Strictly O(log n) — every iteration halves the range.`,
hints:['Compute mid; if nums[mid] == target, done.','If the LEFT half is sorted (nums[lo] <= nums[mid]): target in [nums[lo], nums[mid]) → hi = mid - 1, else lo = mid + 1.','Otherwise the RIGHT half is sorted: mirror the range test with (nums[mid], nums[hi]].'],
solution:`public class Rotated {
    static int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {                  // left half sorted
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {                                       // right half sorted
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
}`},
{title:'Product of array except self',
prompt:`<b>Medium.</b> Write <code>static int[] productExceptSelf(int[] nums)</code>: each output element is the product of every input element except its own — <b>without using division</b> and in O(n). Two sweeps: left-to-right filling each slot with the product of everything BEFORE it, then right-to-left multiplying in the product of everything AFTER it (carried in a single running variable).`,
starter:`public class Products {
    static int[] productExceptSelf(int[] nums) {
        return null;
    }
}`,
tests:[{d:'Prefix sweep',re:'for\\s*\\(\\s*int\\s+\\w+\\s*=\\s*0\\s*;[\\s\\S]*?out\\[\\s*\\w+\\s*\\]'},{d:'Suffix sweep runs backwards',re:'for\\s*\\(\\s*int\\s+\\w+\\s*=\\s*(nums\\.length|\\w+)\\s*-\\s*1\\s*;[^;]*>=\\s*0'},{d:'No division',re:'/\\s*nums\\[',not:true},{d:'Running suffix variable',re:'suffix\\s*\\*=|right\\s*\\*='}],
behavior:`1. productExceptSelf([1,2,3,4]) == [24,12,8,6]. 2. productExceptSelf([-1,1,0,-3,3]) == [0,0,9,0,0] (zeros handled naturally — no division means no special-casing). 3. O(n) time, O(1) extra space beyond the output.`,
hints:['Pass 1: out[i] = product of nums[0..i-1]; start a prefix variable at 1.','Pass 2 from the end: multiply out[i] by a suffix variable, then fold nums[i] into the suffix.','Division-based solutions die on zeros — that is why the constraint exists.'],
solution:`public class Products {
    static int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            out[i] = prefix;
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            out[i] *= suffix;
            suffix *= nums[i];
        }
        return out;
    }
}`}
,
{title:'Longest palindromic substring',
prompt:`<b>Medium.</b> Write <code>static String longestPalindrome(String s)</code> using <b>expand around center</b>: for each index try an odd center (i,i) and an even center (i,i+1), expanding while characters match; keep the longest span.`,
starter:`public class LongestPalin {\n    static String longestPalindrome(String s) {\n        return "";\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+String\\s+longestPalindrome\\s*\\(\\s*String\\s+s\\s*\\)'},{d:'Expands while chars match',re:'charAt\\s*\\(\\s*\\w+\\s*\\)\\s*==\\s*\\w*\\.?charAt'},{d:'Returns a substring',re:'substring\\s*\\('}],
behavior:`1. longestPalindrome("babad") is "bab" or "aba". 2. longestPalindrome("cbbd") == "bb". 3. longestPalindrome("a") == "a". 4. O(n^2) time, O(1) space.`,
hints:['Write a helper expand(s,l,r) that widens while s.charAt(l)==s.charAt(r) and returns the length r-l-1.','For each i, take Math.max of the odd center (i,i) and even center (i,i+1).','Track start/end indices of the best span and substring at the end.'],
solution:`public class LongestPalin {\n    static String longestPalindrome(String s) {\n        if (s.isEmpty()) return "";\n        int start = 0, end = 0;\n        for (int i = 0; i < s.length(); i++) {\n            int a = expand(s, i, i);\n            int b = expand(s, i, i + 1);\n            int len = Math.max(a, b);\n            if (len > end - start + 1) {\n                start = i - (len - 1) / 2;\n                end = i + len / 2;\n            }\n        }\n        return s.substring(start, end + 1);\n    }\n    static int expand(String s, int l, int r) {\n        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }\n        return r - l - 1;\n    }\n}`},
{title:'3Sum',
prompt:`<b>Medium.</b> Write <code>static java.util.List&lt;java.util.List&lt;Integer&gt;&gt; threeSum(int[] nums)</code> returning all unique triplets that sum to zero. Sort, then for each index run a <b>two-pointer</b> scan, skipping duplicates.`,
starter:`import java.util.*;\n\npublic class ThreeSum {\n    static List<List<Integer>> threeSum(int[] nums) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<List<Integer>>\\s+threeSum'},{d:'Sorts first',re:'Arrays\\.sort'},{d:'Two-pointer scan',re:'while\\s*\\(\\s*lo\\s*<\\s*hi\\s*\\)'},{d:'Skips duplicates',re:'continue|==\\s*nums\\[\\s*\\w+\\s*[+-]\\s*1\\s*\\]'}],
behavior:`1. threeSum([-1,0,1,2,-1,-4]) contains [-1,-1,2] and [-1,0,1]. 2. No duplicate triplets. 3. threeSum([0,0,0]) == [[0,0,0]]. 4. O(n^2) after the sort.`,
hints:['Sort so duplicates are adjacent and two pointers work.','Skip a repeated anchor with if (i>0 && nums[i]==nums[i-1]) continue;.','On a hit, advance both pointers past any duplicates before continuing.'],
solution:`import java.util.*;\n\npublic class ThreeSum {\n    static List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int lo = i + 1, hi = nums.length - 1;\n            while (lo < hi) {\n                int sum = nums[i] + nums[lo] + nums[hi];\n                if (sum == 0) {\n                    res.add(Arrays.asList(nums[i], nums[lo], nums[hi]));\n                    while (lo < hi && nums[lo] == nums[lo + 1]) lo++;\n                    while (lo < hi && nums[hi] == nums[hi - 1]) hi--;\n                    lo++; hi--;\n                } else if (sum < 0) lo++;\n                else hi--;\n            }\n        }\n        return res;\n    }\n}`},
{title:'Merge intervals',
prompt:`<b>Medium.</b> Write <code>static int[][] merge(int[][] intervals)</code> merging all overlapping intervals. Sort by start, then walk: extend the last kept interval when the next one overlaps, else append.`,
starter:`import java.util.*;\n\npublic class Intervals {\n    static int[][] merge(int[][] intervals) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\[\\]\\[\\]\\s+merge\\s*\\(\\s*int\\[\\]\\[\\]\\s+intervals\\s*\\)'},{d:'Sorts by start',re:'comparingInt\\s*\\(\\s*\\w+\\s*->\\s*\\w+\\[\\s*0\\s*\\]\\s*\\)'},{d:'Extends the end with max',re:'Math\\.max'}],
behavior:`1. merge([[1,3],[2,6],[8,10],[15,18]]) == [[1,6],[8,10],[15,18]]. 2. merge([[1,4],[4,5]]) == [[1,5]] (touching counts). 3. Single interval unchanged. 4. O(n log n) from the sort.`,
hints:['Sort intervals by their start value with Comparator.comparingInt(a -> a[0]).','Keep a result list; if the current start is beyond the last end, append, else raise the last end via Math.max.','Return out.toArray(new int[0][]).'],
solution:`import java.util.*;\n\npublic class Intervals {\n    static int[][] merge(int[][] intervals) {\n        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));\n        List<int[]> out = new ArrayList<>();\n        for (int[] iv : intervals) {\n            if (out.isEmpty() || out.get(out.size() - 1)[1] < iv[0]) {\n                out.add(iv);\n            } else {\n                out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], iv[1]);\n            }\n        }\n        return out.toArray(new int[0][]);\n    }\n}`},
{title:'Kth largest element',
prompt:`<b>Medium.</b> Write <code>static int kthLargest(int[] nums, int k)</code> using a size-k <b>min-heap</b>: offer each number, poll when the heap exceeds k; the heap top is the answer. O(n log k).`,
starter:`import java.util.*;\n\npublic class KthLargest {\n    static int kthLargest(int[] nums, int k) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+kthLargest\\s*\\(\\s*int\\[\\]\\s+nums\\s*,\\s*int\\s+k\\s*\\)'},{d:'Min-heap PriorityQueue',re:'new\\s+PriorityQueue<>\\s*\\(\\s*\\)'},{d:'Bounds to k with poll',re:'size\\s*\\(\\s*\\)\\s*>\\s*k[\\s\\S]*?poll'},{d:'Reads the top',re:'peek\\s*\\(\\s*\\)|poll\\s*\\(\\s*\\)'}],
behavior:`1. kthLargest([3,2,1,5,6,4], 2) == 5. 2. kthLargest([3,2,3,1,2,4,5,5,6], 4) == 4. 3. Heap never holds more than k entries. 4. The smallest of the k largest is exactly the kth largest.`,
hints:['A plain PriorityQueue is a min-heap.','After each offer, if size > k, poll the smallest.','When done, peek() is the kth largest.'],
solution:`import java.util.*;\n\npublic class KthLargest {\n    static int kthLargest(int[] nums, int k) {\n        PriorityQueue<Integer> heap = new PriorityQueue<>();\n        for (int x : nums) {\n            heap.offer(x);\n            if (heap.size() > k) heap.poll();\n        }\n        return heap.peek();\n    }\n}`},
{title:'Top K frequent elements',
prompt:`<b>Medium.</b> Write <code>static java.util.List&lt;Integer&gt; topKFrequent(int[] nums, int k)</code>: count with a HashMap, then keep a size-k min-heap ordered by frequency; return the survivors.`,
starter:`import java.util.*;\n\npublic class TopKFreq {\n    static List<Integer> topKFrequent(int[] nums, int k) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<Integer>\\s+topKFrequent'},{d:'Frequency map',re:'merge\\s*\\(|getOrDefault'},{d:'Heap ordered by frequency',re:'PriorityQueue<>\\s*\\(\\s*Comparator\\.comparingInt'},{d:'Bounds to k',re:'size\\s*\\(\\s*\\)\\s*>\\s*k'}],
behavior:`1. topKFrequent([1,1,1,2,2,3], 2) contains 1 and 2 (any order). 2. topKFrequent([1], 1) == [1]. 3. O(n log k) via the bounded heap.`,
hints:['Build freq with map.merge(x, 1, Integer::sum).','Heap comparator: Comparator.comparingInt(freq::get) — a min-heap by count.','Offer each key, poll when size exceeds k; drain the heap into a list.'],
solution:`import java.util.*;\n\npublic class TopKFreq {\n    static List<Integer> topKFrequent(int[] nums, int k) {\n        Map<Integer, Integer> freq = new HashMap<>();\n        for (int x : nums) freq.merge(x, 1, Integer::sum);\n        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.comparingInt(freq::get));\n        for (int key : freq.keySet()) {\n            heap.offer(key);\n            if (heap.size() > k) heap.poll();\n        }\n        return new ArrayList<>(heap);\n    }\n}`},
{title:'Subarray sum equals K',
prompt:`<b>Medium.</b> Write <code>static int subarraySum(int[] nums, int k)</code> counting contiguous subarrays that sum to k. Use a running prefix sum and a HashMap of prefix -> count (seed 0 -> 1); each step add the count of <code>sum - k</code>.`,
starter:`import java.util.*;\n\npublic class SubSum {\n    static int subarraySum(int[] nums, int k) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+subarraySum\\s*\\(\\s*int\\[\\]\\s+nums\\s*,\\s*int\\s+k\\s*\\)'},{d:'Prefix-count map seeded with 0',re:'put\\s*\\(\\s*0\\s*,\\s*1\\s*\\)'},{d:'Looks up sum - k',re:'sum\\s*-\\s*k'},{d:'Accumulates the count',re:'count\\s*\\+=|getOrDefault'}],
behavior:`1. subarraySum([1,1,1], 2) == 2. 2. subarraySum([1,2,3], 3) == 2. 3. subarraySum([1,-1,0], 0) == 3 (negatives handled). 4. O(n) with the prefix-sum map.`,
hints:['Seed the map with prefix 0 -> 1 so subarrays starting at index 0 count.','Each step: sum += x; count += map.getOrDefault(sum - k, 0); then map.merge(sum, 1, Integer::sum).','A matching earlier prefix means the slice between them sums to k.'],
solution:`import java.util.*;\n\npublic class SubSum {\n    static int subarraySum(int[] nums, int k) {\n        Map<Integer, Integer> prefix = new HashMap<>();\n        prefix.put(0, 1);\n        int sum = 0, count = 0;\n        for (int x : nums) {\n            sum += x;\n            count += prefix.getOrDefault(sum - k, 0);\n            prefix.merge(sum, 1, Integer::sum);\n        }\n        return count;\n    }\n}`},
{title:'Longest consecutive sequence',
prompt:`<b>Medium.</b> Write <code>static int longestConsecutive(int[] nums)</code> finding the length of the longest run of consecutive integers in <b>O(n)</b>. Put everything in a HashSet; only start counting from a number whose predecessor is absent.`,
starter:`import java.util.*;\n\npublic class Consec {\n    static int longestConsecutive(int[] nums) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+longestConsecutive\\s*\\(\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Uses a HashSet',re:'new\\s+HashSet<'},{d:'Only starts a run when predecessor absent',re:'!\\s*\\w+\\.contains\\s*\\(\\s*\\w+\\s*-\\s*1\\s*\\)'},{d:'Extends the run',re:'contains\\s*\\(\\s*\\w+\\s*\\+\\s*1\\s*\\)'}],
behavior:`1. longestConsecutive([100,4,200,1,3,2]) == 4 (1,2,3,4). 2. longestConsecutive([0,3,7,2,5,8,4,6,0,1]) == 9. 3. Empty array == 0. 4. The predecessor check keeps it O(n) despite the nested while.`,
hints:['Load all numbers into a HashSet.','For each x, only if the set lacks x-1 do you count upward — that makes each run counted once.','Walk x+1, x+2, ... while present and track the max length.'],
solution:`import java.util.*;\n\npublic class Consec {\n    static int longestConsecutive(int[] nums) {\n        Set<Integer> set = new HashSet<>();\n        for (int x : nums) set.add(x);\n        int best = 0;\n        for (int x : set) {\n            if (!set.contains(x - 1)) {\n                int cur = x, len = 1;\n                while (set.contains(cur + 1)) { cur++; len++; }\n                best = Math.max(best, len);\n            }\n        }\n        return best;\n    }\n}`},
{title:'Rotate array by k',
prompt:`<b>Medium.</b> Write <code>static void rotate(int[] nums, int k)</code> rotating right by k <b>in place</b> using the reverse trick: reverse the whole array, then reverse the first k and the rest. Remember <code>k %= n</code>.`,
starter:`public class Rotate {\n    static void rotate(int[] nums, int k) {\n    }\n    static void reverse(int[] a, int lo, int hi) {\n    }\n}`,
tests:[{d:'Void in-place signature',re:'static\\s+void\\s+rotate\\s*\\(\\s*int\\[\\]\\s+nums\\s*,\\s*int\\s+k\\s*\\)'},{d:'Normalizes k',re:'k\\s*%=\\s*\\w+'},{d:'Uses a reverse helper three times',re:'reverse\\s*\\([\\s\\S]*?reverse\\s*\\([\\s\\S]*?reverse\\s*\\('}],
behavior:`1. [1,2,3,4,5,6,7] with k=3 becomes [5,6,7,1,2,3,4]. 2. k larger than n wraps via the modulo. 3. O(n) time, O(1) space. 4. Three reversals produce the rotation.`,
hints:['k %= nums.length first — rotating by n is a no-op.','reverse(nums, 0, n-1); reverse(nums, 0, k-1); reverse(nums, k, n-1).','The helper swaps from both ends inward.'],
solution:`public class Rotate {\n    static void rotate(int[] nums, int k) {\n        int n = nums.length;\n        k %= n;\n        reverse(nums, 0, n - 1);\n        reverse(nums, 0, k - 1);\n        reverse(nums, k, n - 1);\n    }\n    static void reverse(int[] a, int lo, int hi) {\n        while (lo < hi) {\n            int t = a[lo];\n            a[lo] = a[hi];\n            a[hi] = t;\n            lo++; hi--;\n        }\n    }\n}`},
{title:'Find all anagram indices',
prompt:`<b>Medium.</b> Write <code>static java.util.List&lt;Integer&gt; findAnagrams(String s, String p)</code> returning the start indices of every substring of s that is an anagram of p, using a fixed-size sliding window over two 26-count arrays compared with <code>Arrays.equals</code>.`,
starter:`import java.util.*;\n\npublic class FindAnagrams {\n    static List<Integer> findAnagrams(String s, String p) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<Integer>\\s+findAnagrams\\s*\\(\\s*String\\s+s\\s*,\\s*String\\s+p\\s*\\)'},{d:'Two 26-count arrays',re:'new\\s+int\\[\\s*26\\s*\\]'},{d:'Compares windows',re:'Arrays\\.equals'},{d:'Slides by decrementing the exiting char',re:'--|\\[\\s*\\w+\\.charAt\\s*\\(\\s*\\w+\\s*-\\s*\\w+\\.length'}],
behavior:`1. findAnagrams("cbaebabacd", "abc") == [0, 6]. 2. findAnagrams("abab", "ab") == [0, 1, 2]. 3. s shorter than p yields []. 4. O(n) with the rolling window comparison.`,
hints:['Build the need[] counts for p; maintain win[] over the last p.length() chars of s.','Once the window is full, drop the char leaving on the left before comparing.','On Arrays.equals(need, win), record i - p.length() + 1.'],
solution:`import java.util.*;\n\npublic class FindAnagrams {\n    static List<Integer> findAnagrams(String s, String p) {\n        List<Integer> res = new ArrayList<>();\n        if (s.length() < p.length()) return res;\n        int[] need = new int[26], win = new int[26];\n        for (char c : p.toCharArray()) need[c - 'a']++;\n        for (int i = 0; i < s.length(); i++) {\n            win[s.charAt(i) - 'a']++;\n            if (i >= p.length()) win[s.charAt(i - p.length()) - 'a']--;\n            if (Arrays.equals(need, win)) res.add(i - p.length() + 1);\n        }\n        return res;\n    }\n}`},
{title:'Longest repeating character replacement',
prompt:`<b>Medium.</b> Given a string and k allowed replacements, write <code>static int characterReplacement(String s, int k)</code> for the longest substring of one repeated letter after at most k changes. Sliding window: valid while <code>windowLen - maxFreq &lt;= k</code>.`,
starter:`public class CharReplace {\n    static int characterReplacement(String s, int k) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+characterReplacement\\s*\\(\\s*String\\s+s\\s*,\\s*int\\s+k\\s*\\)'},{d:'26-count window',re:'new\\s+int\\[\\s*26\\s*\\]'},{d:'Tracks max frequency',re:'maxFreq|Math\\.max'},{d:'Shrinks when invalid',re:'while\\s*\\(|if\\s*\\('}],
behavior:`1. characterReplacement("ABAB", 2) == 4. 2. characterReplacement("AABABBA", 1) == 4. 3. k=0 gives the longest existing run. 4. O(n) single pass.`,
hints:['Count letters in the window; track the most frequent count seen.','The window is valid while (right-left+1) - maxFreq <= k.','When it breaks, decrement the left char count and advance left.'],
solution:`public class CharReplace {\n    static int characterReplacement(String s, int k) {\n        int[] count = new int[26];\n        int left = 0, maxFreq = 0, best = 0;\n        for (int right = 0; right < s.length(); right++) {\n            maxFreq = Math.max(maxFreq, ++count[s.charAt(right) - 'A']);\n            while (right - left + 1 - maxFreq > k) {\n                count[s.charAt(left) - 'A']--;\n                left++;\n            }\n            best = Math.max(best, right - left + 1);\n        }\n        return best;\n    }\n}`},
{title:'Minimum size subarray sum',
prompt:`<b>Medium.</b> Write <code>static int minSubArrayLen(int target, int[] nums)</code> returning the shortest contiguous subarray with sum &ge; target (0 if none), using a growing/shrinking sliding window.`,
starter:`public class MinSubLen {\n    static int minSubArrayLen(int target, int[] nums) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+minSubArrayLen\\s*\\(\\s*int\\s+target\\s*,\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Shrinks while sum meets target',re:'while\\s*\\(\\s*sum\\s*>=\\s*target\\s*\\)'},{d:'Tracks minimum length',re:'Math\\.min'},{d:'Removes from the left',re:'sum\\s*-=\\s*nums\\[\\s*\\w+'}],
behavior:`1. minSubArrayLen(7, [2,3,1,2,4,3]) == 2 ([4,3]). 2. minSubArrayLen(11, [1,1,1]) == 0 (impossible). 3. minSubArrayLen(4, [1,4,4]) == 1. 4. O(n): each element enters and leaves the window once.`,
hints:['Grow the window by adding nums[right].','While the sum reaches target, record the length and shrink from the left.','Return 0 if the best never updated from its sentinel.'],
solution:`public class MinSubLen {\n    static int minSubArrayLen(int target, int[] nums) {\n        int left = 0, sum = 0, best = Integer.MAX_VALUE;\n        for (int right = 0; right < nums.length; right++) {\n            sum += nums[right];\n            while (sum >= target) {\n                best = Math.min(best, right - left + 1);\n                sum -= nums[left++];\n            }\n        }\n        return best == Integer.MAX_VALUE ? 0 : best;\n    }\n}`},
{title:'Unique paths',
prompt:`<b>Medium.</b> A robot moves only right or down on an m x n grid. Write <code>static int uniquePaths(int m, int n)</code> counting paths from top-left to bottom-right with a 1D DP row (each cell = paths from left + from above).`,
starter:`import java.util.*;\n\npublic class UniquePaths {\n    static int uniquePaths(int m, int n) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+uniquePaths\\s*\\(\\s*int\\s+m\\s*,\\s*int\\s+n\\s*\\)'},{d:'DP row initialised to 1',re:'Arrays\\.fill\\s*\\(\\s*dp\\s*,\\s*1\\s*\\)'},{d:'Accumulates left neighbour',re:'dp\\[\\s*j\\s*\\]\\s*\\+=\\s*dp\\[\\s*j\\s*-\\s*1\\s*\\]'}],
behavior:`1. uniquePaths(3, 7) == 28. 2. uniquePaths(3, 2) == 3. 3. uniquePaths(1, 1) == 1. 4. O(m*n) time, O(n) space with the rolling row.`,
hints:['One row of n ones represents the top row (only one path along an edge).','For each subsequent row, dp[j] += dp[j-1] folds in the path from the left.','The answer is dp[n-1].'],
solution:`import java.util.*;\n\npublic class UniquePaths {\n    static int uniquePaths(int m, int n) {\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[j] += dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n}`},
{title:'Jump game',
prompt:`<b>Medium.</b> Each element is a max jump length from that index. Write <code>static boolean canJump(int[] nums)</code> returning whether you can reach the last index — greedy: track the farthest reachable index and fail if you ever stand beyond it.`,
starter:`public class JumpGame {\n    static boolean canJump(int[] nums) {\n        return false;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+boolean\\s+canJump\\s*\\(\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Tracks farthest reach',re:'Math\\.max\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\+\\s*nums\\['},{d:'Fails when unreachable',re:'>\\s*\\w+[\\s\\S]*?return\\s+false'}],
behavior:`1. canJump([2,3,1,1,4]) == true. 2. canJump([3,2,1,0,4]) == false (stuck at the 0). 3. canJump([0]) == true. 4. O(n) greedy.`,
hints:['Keep reach = 0. If i > reach at any point, return false.','Otherwise reach = Math.max(reach, i + nums[i]).','If the loop finishes, the end is reachable.'],
solution:`public class JumpGame {\n    static boolean canJump(int[] nums) {\n        int reach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > reach) return false;\n            reach = Math.max(reach, i + nums[i]);\n        }\n        return true;\n    }\n}`},
{title:'Maximum subarray (Kadane)',
prompt:`<b>Medium.</b> Write <code>static int maxSubArray(int[] nums)</code> returning the largest sum of a contiguous subarray using <b>Kadane</b>: at each element, either extend the current run or restart from it; track the best.`,
starter:`public class Kadane {\n    static int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+maxSubArray\\s*\\(\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Extend-or-restart',re:'Math\\.max\\s*\\(\\s*nums\\[\\s*\\w+\\s*\\]\\s*,\\s*\\w+\\s*\\+\\s*nums\\['},{d:'Tracks the best',re:'Math\\.max\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)'}],
behavior:`1. maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) == 6 ([4,-1,2,1]). 2. maxSubArray([1]) == 1. 3. maxSubArray([-3,-1,-2]) == -1 (best single element). 4. O(n) one pass.`,
hints:['cur = Math.max(nums[i], cur + nums[i]) — restart when the running sum hurts.','best = Math.max(best, cur) each step.','Seed both from nums[0].'],
solution:`public class Kadane {\n    static int maxSubArray(int[] nums) {\n        int cur = nums[0], best = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            cur = Math.max(nums[i], cur + nums[i]);\n            best = Math.max(best, cur);\n        }\n        return best;\n    }\n}`},
{title:'Sort colors (Dutch flag)',
prompt:`<b>Medium.</b> An array holds only 0, 1, 2. Write <code>static void sortColors(int[] nums)</code> sorting it <b>in one pass</b> with three pointers (lo, mid, hi): 0 swaps to the front, 2 swaps to the back, 1 stays.`,
starter:`public class SortColors {\n    static void sortColors(int[] nums) {\n    }\n}`,
tests:[{d:'Void in-place signature',re:'static\\s+void\\s+sortColors\\s*\\(\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Three-pointer loop',re:'while\\s*\\(\\s*mid\\s*<=\\s*hi\\s*\\)'},{d:'Handles the 0 and 2 cases',re:'==\\s*0[\\s\\S]*?==\\s*2'},{d:'No sort call',re:'Arrays\\.sort',not:true}],
behavior:`1. [2,0,2,1,1,0] becomes [0,0,1,1,2,2]. 2. [1,0] becomes [0,1]. 3. O(n) single pass, O(1) space. 4. Do not advance mid after swapping a 2 in (re-inspect the swapped-in value).`,
hints:['lo=0, mid=0, hi=last. Loop while mid <= hi.','nums[mid]==0: swap lo,mid and advance both. nums[mid]==2: swap mid,hi and lower hi (do not move mid).','nums[mid]==1: just advance mid.'],
solution:`public class SortColors {\n    static void sortColors(int[] nums) {\n        int lo = 0, mid = 0, hi = nums.length - 1;\n        while (mid <= hi) {\n            if (nums[mid] == 0) {\n                int t = nums[lo]; nums[lo] = nums[mid]; nums[mid] = t;\n                lo++; mid++;\n            } else if (nums[mid] == 2) {\n                int t = nums[mid]; nums[mid] = nums[hi]; nums[hi] = t;\n                hi--;\n            } else {\n                mid++;\n            }\n        }\n    }\n}`},
{title:'Search a 2D matrix',
prompt:`<b>Medium.</b> A matrix has each row sorted and each row starts after the previous row ends. Write <code>static boolean searchMatrix(int[][] m, int target)</code> treating it as one sorted array of length rows*cols and doing a single <b>binary search</b> with index math (mid/cols, mid%cols).`,
starter:`public class Search2D {\n    static boolean searchMatrix(int[][] m, int target) {\n        return false;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+boolean\\s+searchMatrix\\s*\\(\\s*int\\[\\]\\[\\]\\s+m\\s*,\\s*int\\s+target\\s*\\)'},{d:'Binary search loop',re:'while\\s*\\(\\s*lo\\s*<=\\s*hi\\s*\\)'},{d:'Maps flat index to row/col',re:'/\\s*cols[\\s\\S]*?%\\s*cols|%\\s*cols[\\s\\S]*?/\\s*cols'}],
behavior:`1. searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3) == true. 2. same matrix, target 13 == false. 3. O(log(rows*cols)) — one binary search over the virtual flat array.`,
hints:['rows = m.length, cols = m[0].length; search indices 0..rows*cols-1.','Convert a flat index: value = m[mid / cols][mid % cols].','Standard binary search comparisons from there.'],
solution:`public class Search2D {\n    static boolean searchMatrix(int[][] m, int target) {\n        int rows = m.length, cols = m[0].length;\n        int lo = 0, hi = rows * cols - 1;\n        while (lo <= hi) {\n            int mid = (lo + hi) / 2;\n            int val = m[mid / cols][mid % cols];\n            if (val == target) return true;\n            if (val < target) lo = mid + 1;\n            else hi = mid - 1;\n        }\n        return false;\n    }\n}`},
{title:'Set matrix zeroes',
prompt:`<b>Medium.</b> Write <code>static void setZeroes(int[][] m)</code>: if a cell is 0, set its entire row and column to 0. First pass records which rows and columns contain a zero (two Sets); second pass writes the zeroes — never read-and-write in the same sweep.`,
starter:`import java.util.*;\n\npublic class SetZeroes {\n    static void setZeroes(int[][] m) {\n    }\n}`,
tests:[{d:'Void in-place signature',re:'static\\s+void\\s+setZeroes\\s*\\(\\s*int\\[\\]\\[\\]\\s+m\\s*\\)'},{d:'Records rows and cols to zero',re:'new\\s+HashSet<'},{d:'Second pass applies zeroes',re:'contains\\s*\\('}],
behavior:`1. [[1,1,1],[1,0,1],[1,1,1]] becomes [[1,0,1],[0,0,0],[1,0,1]]. 2. A zero in the corner clears its row and column. 3. Two passes prevent a freshly written zero from cascading incorrectly.`,
hints:['Pass 1: collect the indices of zero rows and zero columns into two Sets.','Pass 2: for every cell, if its row or column is marked, set it to 0.','Doing it in one pass would spread zeroes across the whole matrix.'],
solution:`import java.util.*;\n\npublic class SetZeroes {\n    static void setZeroes(int[][] m) {\n        Set<Integer> rows = new HashSet<>(), cols = new HashSet<>();\n        for (int i = 0; i < m.length; i++) {\n            for (int j = 0; j < m[0].length; j++) {\n                if (m[i][j] == 0) { rows.add(i); cols.add(j); }\n            }\n        }\n        for (int i = 0; i < m.length; i++) {\n            for (int j = 0; j < m[0].length; j++) {\n                if (rows.contains(i) || cols.contains(j)) m[i][j] = 0;\n            }\n        }\n    }\n}`}

]},
{id:'ch3',title:'Hard round',body:`
<p>The final bracket. Hards stack multiple insights, or demand a data structure assembled from parts.
Interviewers rarely expect a flawless solve — they expect <b>structured thinking under pressure</b>:
brute force stated, invariants named, code that stays clean while the problem fights back. Take these
slowly, use Next Step without shame; a hard solved after two hints teaches more than an easy solved in
silence.</p>

<h4>What makes a problem hard</h4>
<p>Usually one of four things, and naming which one tells you where to push:</p>
<div class="codeSample" data-hl>STACKED INSIGHTS      two or three mediums composed. sliding window PLUS a
                      frequency map PLUS a shrink condition. each part is
                      familiar; the composition is not.

BUILT DATA STRUCTURE  no library type fits, so you assemble one — LRU cache is
                      a hash map plus a doubly linked list; a median stream is
                      two heaps facing each other.

NON-OBVIOUS STATE     the thing to track is not the thing being asked for.
                      "longest valid parentheses" tracks INDICES, not counts.

HIDDEN CONSTRAINT     "O(1) space" or "no extra array" is the whole puzzle,
                      forcing in-place tricks: index-as-hash, sign marking,
                      pointer reversal, cycle detection.</div>

<h4>The invariant habit</h4>
<p>Hards are where sloppy loops fall apart, and the cure is stating the invariant before writing the
loop. "Everything left of <code>i</code> is already in final position." "The window always contains at
most k distinct characters." "The two heaps differ in size by at most one." An invariant you can say
out loud makes the loop body almost write itself, and it converts debugging from guessing into
checking which line broke the promise.</p>

<h4>How to fail well</h4>
<p>Not finishing a hard is normal and is not automatically a bad outcome. What distinguishes a strong
partial from a weak one:</p>
<ul>
<li><b>Get the brute force on the board first.</b> A stated O(n²) with correct logic beats an
unfinished O(n) with none, and it gives you something to optimise from rather than a blank page.</li>
<li><b>Say what you are trading.</b> "I can make this O(n) with O(n) extra space" is a design decision,
not a concession — interviewers want to hear the axis you are moving along.</li>
<li><b>Test on the smallest failing case.</b> When output is wrong, shrink the input until it fits in
your head. Two elements, then three. Debugging a ten-element trace by eye is how the remaining time
disappears.</li>
<li><b>Keep talking.</b> Silence reads as being stuck even when you are thinking productively. "I am
trying to see whether the window can ever shrink past the left bound" tells the interviewer where you
are and often earns exactly the nudge you needed.</li>
</ul>
<p><b>The one habit worth taking from this round:</b> when a hard defeats you, do not just read the
solution. Identify which of the four categories above it was, and what the single unlocking insight
was. That is what transfers — the specific problem almost never reappears, and the category does.</p>`,
docs:[['PriorityQueue — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html'],['Invariant-based reasoning — CP-Algorithms','https://cp-algorithms.com/']],
exs:[
{title:'Trapping rain water',
prompt:`<b>Hard.</b> Given bar heights, compute the total water trapped after rain. Write <code>static int trap(int[] h)</code> with the O(n)/O(1) <b>two-pointer</b> solution: track <code>leftMax</code> and <code>rightMax</code>; whichever side has the smaller max is the binding constraint — water above the current bar on that side is <code>max - h[i]</code>, then move that pointer inward.`,
starter:`public class Rain {
    static int trap(int[] h) {
        return 0;
    }
}`,
tests:[{d:'Two pointers with left/right maxes',re:'leftMax[\\s\\S]*?rightMax'},{d:'Compares the maxes to pick a side',re:'leftMax\\s*<=?\\s*rightMax|leftMax\\s*<\\s*rightMax'},{d:'Accumulates max - height',re:'\\+=\\s*(leftMax|rightMax)\\s*-\\s*h\\[\\s*\\w+\\s*\\]'},{d:'No O(n) extra arrays',re:'new\\s+int\\[\\s*h\\.length\\s*\\]',not:true}],
behavior:`1. trap([0,1,0,2,1,0,1,3,2,1,2,1]) == 6. 2. trap([4,2,0,3,2,5]) == 9. 3. trap([1,2,3]) == 0 (monotonic traps nothing). 4. The invariant: when leftMax <= rightMax, the water level at the left pointer is EXACTLY leftMax — the right side is guaranteed at least as tall somewhere.`,
hints:['Advance the side whose max is smaller — its water line is already decided.','Per step on the left: <code>leftMax = Math.max(leftMax, h[lo]); water += leftMax - h[lo]; lo++;</code> (mirror for right).','Updating max BEFORE adding water makes the subtraction never negative — no branch needed.'],
solution:`public class Rain {
    static int trap(int[] h) {
        int lo = 0, hi = h.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (lo < hi) {
            if (leftMax <= rightMax) {
                leftMax = Math.max(leftMax, h[lo]);
                water += leftMax - h[lo];
                lo++;
            } else {
                rightMax = Math.max(rightMax, h[hi]);
                water += rightMax - h[hi];
                hi--;
            }
        }
        return water;
    }
}`},
{title:'Merge K sorted lists',
prompt:`<b>Hard.</b> Write <code>static java.util.List&lt;Integer&gt; mergeK(java.util.List&lt;java.util.List&lt;Integer&gt;&gt; lists)</code> merging K sorted lists into one, in O(N log K), using a <code>PriorityQueue&lt;int[]&gt;</code> of <code>{value, listIndex, elementIndex}</code> ordered by value (<code>Comparator.comparingInt(x -&gt; x[0])</code>): seed it with each list's head, then repeatedly poll the minimum and push that list's next element.`,
starter:`import java.util.*;

public class MergeK {
    static List<Integer> mergeK(List<List<Integer>> lists) {
        return null;
    }
}`,
tests:[{d:'PriorityQueue ordered by value',re:'new\\s+PriorityQueue<>\\s*\\(\\s*Comparator\\.comparingInt\\s*\\('},{d:'Seeded with each non-empty head',re:'for\\s*\\([\\s\\S]*?isEmpty\\s*\\(\\s*\\)[\\s\\S]*?offer|for\\s*\\([\\s\\S]*?size\\s*\\(\\s*\\)\\s*>\\s*0[\\s\\S]*?offer'},{d:'Poll-then-advance loop',re:'while\\s*\\(\\s*!\\s*\\w+\\.isEmpty\\s*\\(\\s*\\)\\s*\\)[\\s\\S]*?poll\\s*\\(\\s*\\)'},{d:'Pushes the successor from the same list',re:'\\+\\s*1[\\s\\S]*?offer|offer[\\s\\S]*?\\+\\s*1'}],
behavior:`1. mergeK([[1,4,5],[1,3,4],[2,6]]) == [1,1,2,3,4,4,5,6]. 2. Empty inner lists are skipped safely; mergeK of all-empty == []. 3. The heap never holds more than K entries — that is where O(N log K) comes from (vs O(N log N) for concatenate-and-sort).`,
hints:['Heap entries: <code>new int[]{value, whichList, indexInList}</code>.','Seed: for each list i with size > 0, offer {list.get(0), i, 0}.','Loop: poll the min into the result; if elementIndex+1 exists in that list, offer the successor.'],
solution:`import java.util.*;

public class MergeK {
    static List<Integer> mergeK(List<List<Integer>> lists) {
        PriorityQueue<int[]> heap =
            new PriorityQueue<>(Comparator.comparingInt(x -> x[0]));
        for (int i = 0; i < lists.size(); i++) {
            if (!lists.get(i).isEmpty()) {
                heap.offer(new int[]{lists.get(i).get(0), i, 0});
            }
        }
        List<Integer> out = new ArrayList<>();
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            out.add(top[0]);
            int li = top[1], ei = top[2] + 1;
            if (ei < lists.get(li).size()) {
                heap.offer(new int[]{lists.get(li).get(ei), li, ei});
            }
        }
        return out;
    }
}`},
{title:'LRU cache from scratch',
prompt:`<b>Hard.</b> No LinkedHashMap this time (you earned that shortcut in the Data Structures stream) — build the real thing: <code>class LruCache</code> with <code>LruCache(int capacity)</code>, <code>int get(int key)</code> (-1 if absent) and <code>void put(int key, int value)</code>, both <b>O(1)</b>, using a <code>HashMap&lt;Integer, Node&gt;</code> plus a hand-rolled <b>doubly linked list</b> with sentinel head/tail nodes: get/put move the node to the front; put beyond capacity evicts the back.`,
starter:`import java.util.*;

public class LruCache {
    static class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) { this.key = key; this.value = value; }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);   // sentinel: most recent side
    private final Node tail = new Node(0, 0);   // sentinel: eviction side

    public LruCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    // private void remove(Node n)  /  private void addFront(Node n)

    public int get(int key) {
        return -1;
    }

    public void put(int key, int value) {
    }
}`,
tests:[{d:'Doubly linked removal (both directions relinked)',re:'prev\\.next\\s*=\\s*\\w+\\.next[\\s\\S]*?next\\.prev\\s*=\\s*\\w+\\.prev|n\\.prev\\.next\\s*=\\s*n\\.next'},{d:'Insertion at the front behind the head sentinel',re:'head\\.next[\\s\\S]*?head\\.next\\s*='},{d:'get refreshes recency (remove + addFront)',re:'int\\s+get[\\s\\S]*?remove\\s*\\([\\s\\S]*?addFront\\s*\\('},{d:'Eviction from tail.prev with map cleanup',re:'tail\\.prev[\\s\\S]*?map\\.remove\\s*\\('},{d:'Capacity check drives eviction',re:'size\\s*\\(\\s*\\)\\s*>\\s*capacity|map\\.size\\s*\\(\\s*\\)\\s*>\\s*capacity'}],
behavior:`1. capacity 2: put(1,1), put(2,2), get(1)==1, put(3,3) → evicts key 2 (1 was refreshed by the get), get(2)==-1, get(3)==3. 2. put on an existing key updates the value AND refreshes recency. 3. Every operation is O(1): map lookup + constant pointer surgery. 4. Sentinels mean zero null-checks in the pointer code — that is why they exist.`,
hints:['Write the two private helpers first: remove(n) unlinks n; addFront(n) splices n between head and head.next. Everything else composes them.','get: look up, if present remove + addFront, return value.','put: if key exists, update value + refresh; else insert new node front + map.put; then if map.size() > capacity, evict tail.prev (remove from BOTH the list and the map — forgetting the map is the classic bug).'],
solution:`import java.util.*;

public class LruCache {
    static class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) { this.key = key; this.value = value; }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);

    public LruCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(Node n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
    }

    private void addFront(Node n) {
        n.next = head.next;
        n.prev = head;
        head.next.prev = n;
        head.next = n;
    }

    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        remove(n);
        addFront(n);
        return n.value;
    }

    public void put(int key, int value) {
        Node existing = map.get(key);
        if (existing != null) {
            existing.value = value;
            remove(existing);
            addFront(existing);
            return;
        }
        Node n = new Node(key, value);
        map.put(key, n);
        addFront(n);
        if (map.size() > capacity) {
            Node evict = tail.prev;
            remove(evict);
            map.remove(evict.key);
        }
    }
}`}
,
{title:'Median of two sorted arrays',
prompt:`<b>Hard.</b> Write <code>static double findMedian(int[] a, int[] b)</code> returning the median of the combined sorted order. A clean O(m+n) merge into one array is acceptable here; return the middle element (odd) or the average of the two middle elements (even) as a <code>double</code>.`,
starter:`public class MedianTwo {\n    static double findMedian(int[] a, int[] b) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature returns double',re:'static\\s+double\\s+findMedian\\s*\\(\\s*int\\[\\]\\s+a\\s*,\\s*int\\[\\]\\s+b\\s*\\)'},{d:'Merges the two arrays',re:'while\\s*\\('},{d:'Even case averages with /2.0',re:'/\\s*2\\.0'}],
behavior:`1. findMedian([1,3],[2]) == 2.0. 2. findMedian([1,2],[3,4]) == 2.5. 3. findMedian([],[1]) == 1.0. 4. Odd total returns the exact middle; even returns the mean of the two central values.`,
hints:['Merge a and b into one sorted array of length m+n with the two-pointer walk.','n odd: merged[n/2]. n even: (merged[n/2-1]+merged[n/2]) / 2.0.','The /2.0 (not /2) is what makes 2.5 possible.'],
solution:`public class MedianTwo {\n    static double findMedian(int[] a, int[] b) {\n        int n = a.length + b.length;\n        int[] merged = new int[n];\n        int i = 0, j = 0, k = 0;\n        while (i < a.length && j < b.length) merged[k++] = a[i] <= b[j] ? a[i++] : b[j++];\n        while (i < a.length) merged[k++] = a[i++];\n        while (j < b.length) merged[k++] = b[j++];\n        if (n % 2 == 1) return merged[n / 2];\n        return (merged[n / 2 - 1] + merged[n / 2]) / 2.0;\n    }\n}`},
{title:'Longest valid parentheses',
prompt:`<b>Hard.</b> Write <code>static int longestValid(String s)</code> for the length of the longest valid parentheses substring, using a <b>stack of indices</b> seeded with -1: push open indices, and on a close pop then measure against the new top (or reset the base).`,
starter:`import java.util.*;\n\npublic class LongestValid {\n    static int longestValid(String s) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+longestValid\\s*\\(\\s*String\\s+s\\s*\\)'},{d:'Index stack seeded with -1',re:'push\\s*\\(\\s*-1\\s*\\)'},{d:'Measures against the new top',re:'Math\\.max\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*-\\s*\\w+\\.peek'}],
behavior:`1. longestValid("(()") == 2. 2. longestValid(")()())") == 4. 3. longestValid("") == 0. 4. The -1 sentinel gives every valid run a base index to subtract from.`,
hints:['Push -1 first as the base.','On (, push the index. On ), pop; if the stack is now empty push this index as a new base, else best = Math.max(best, i - stack.peek()).','The stack holds the boundary just before each valid run.'],
solution:`import java.util.*;\n\npublic class LongestValid {\n    static int longestValid(String s) {\n        Deque<Integer> stack = new ArrayDeque<>();\n        stack.push(-1);\n        int best = 0;\n        for (int i = 0; i < s.length(); i++) {\n            if (s.charAt(i) == '(') stack.push(i);\n            else {\n                stack.pop();\n                if (stack.isEmpty()) stack.push(i);\n                else best = Math.max(best, i - stack.peek());\n            }\n        }\n        return best;\n    }\n}`},
{title:'Edit distance',
prompt:`<b>Hard.</b> Write <code>static int editDistance(String a, String b)</code> (Levenshtein) via 2D DP: dp[i][j] = min edits to turn the first i chars of a into the first j of b — match copies the diagonal, else 1 + min(insert, delete, replace).`,
starter:`public class EditDistance {\n    static int editDistance(String a, String b) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+editDistance\\s*\\(\\s*String\\s+a\\s*,\\s*String\\s+b\\s*\\)'},{d:'2D table sized +1',re:'new\\s+int\\[\\s*a\\.length\\s*\\(\\s*\\)\\s*\\+\\s*1\\s*\\]\\[\\s*b\\.length\\s*\\(\\s*\\)\\s*\\+\\s*1\\s*\\]'},{d:'Three-way min on mismatch',re:'Math\\.min\\s*\\([\\s\\S]*?Math\\.min'},{d:'Offset char comparison',re:'charAt\\s*\\(\\s*i\\s*-\\s*1\\s*\\)'}],
behavior:`1. editDistance("horse", "ros") == 3. 2. editDistance("intention", "execution") == 5. 3. editDistance("", "abc") == 3 (row/col base cases). 4. O(m*n) time and space.`,
hints:['Initialise dp[i][0]=i and dp[0][j]=j — cost of pure inserts/deletes.','Match: dp[i][j]=dp[i-1][j-1]. Mismatch: 1 + min of the three neighbours.','Answer is dp[a.length()][b.length()].'],
solution:`public class EditDistance {\n    static int editDistance(String a, String b) {\n        int[][] dp = new int[a.length() + 1][b.length() + 1];\n        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;\n        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;\n        for (int i = 1; i <= a.length(); i++) {\n            for (int j = 1; j <= b.length(); j++) {\n                if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];\n                else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));\n            }\n        }\n        return dp[a.length()][b.length()];\n    }\n}`},
{title:'Sliding window maximum',
prompt:`<b>Hard.</b> Write <code>static int[] maxSlidingWindow(int[] nums, int k)</code> returning the max of each length-k window in O(n) using a <b>monotonic deque</b> of indices (front holds the current max; evict out-of-window and smaller-tail indices).`,
starter:`import java.util.*;\n\npublic class WindowMax {\n    static int[] maxSlidingWindow(int[] nums, int k) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\[\\]\\s+maxSlidingWindow\\s*\\(\\s*int\\[\\]\\s+nums\\s*,\\s*int\\s+k\\s*\\)'},{d:'Uses an index deque',re:'ArrayDeque<'},{d:'Evicts smaller tail indices',re:'pollLast'},{d:'Reads the front as the max',re:'peekFirst'}],
behavior:`1. maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3) == [3,3,5,5,6,7]. 2. maxSlidingWindow([1], 1) == [1]. 3. O(n): each index is pushed and popped at most once.`,
hints:['Store indices; drop the front if it fell out of the window (<= i-k).','Before adding i, pollLast while nums at the tail is smaller than nums[i].','Once i >= k-1, the front index is the window max.'],
solution:`import java.util.*;\n\npublic class WindowMax {\n    static int[] maxSlidingWindow(int[] nums, int k) {\n        int[] res = new int[nums.length - k + 1];\n        Deque<Integer> dq = new ArrayDeque<>();\n        for (int i = 0; i < nums.length; i++) {\n            while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();\n            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();\n            dq.offerLast(i);\n            if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];\n        }\n        return res;\n    }\n}`},
{title:'Minimum window substring',
prompt:`<b>Hard.</b> Write <code>static String minWindow(String s, String t)</code> returning the smallest substring of s containing all chars of t (with multiplicity), or "". Sliding window over a 128-int need table with a <code>required</code> counter.`,
starter:`public class MinWindow {\n    static String minWindow(String s, String t) {\n        return "";\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+String\\s+minWindow\\s*\\(\\s*String\\s+s\\s*,\\s*String\\s+t\\s*\\)'},{d:'Char need table',re:'new\\s+int\\[\\s*128\\s*\\]'},{d:'Required counter drives shrink',re:'required'},{d:'Returns a substring',re:'substring\\s*\\('}],
behavior:`1. minWindow("ADOBECODEBANC", "ABC") == "BANC". 2. minWindow("a", "aa") == "" (not enough). 3. minWindow("a", "a") == "a". 4. O(|s| + |t|) with the rolling counts.`,
hints:['need[c]++ for each char of t; required = t.length().','Expand right; if need[c]-- was > 0 you consumed a needed char, so required--.','While required==0, record the best window, then release the left char (need[left]++), and if it goes above 0, required++.'],
solution:`public class MinWindow {\n    static String minWindow(String s, String t) {\n        int[] need = new int[128];\n        for (char c : t.toCharArray()) need[c]++;\n        int required = t.length(), left = 0, bestLen = Integer.MAX_VALUE, bestStart = 0;\n        for (int right = 0; right < s.length(); right++) {\n            if (need[s.charAt(right)]-- > 0) required--;\n            while (required == 0) {\n                if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }\n                if (need[s.charAt(left)]++ == 0) required++;\n                left++;\n            }\n        }\n        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);\n    }\n}`},
{title:'Largest rectangle in histogram',
prompt:`<b>Hard.</b> Write <code>static int largestRectangle(int[] heights)</code> for the biggest rectangle under the bars, using a <b>monotonic increasing stack</b> of indices; when a shorter bar appears, pop and compute areas with the correct width.`,
starter:`import java.util.*;\n\npublic class Histogram {\n    static int largestRectangle(int[] heights) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+largestRectangle\\s*\\(\\s*int\\[\\]\\s+heights\\s*\\)'},{d:'Index stack',re:'ArrayDeque<'},{d:'Width uses the new stack top',re:'\\w+\\s*-\\s*\\w+\\.peek\\s*\\(\\s*\\)\\s*-\\s*1'},{d:'Tracks best area',re:'Math\\.max'}],
behavior:`1. largestRectangle([2,1,5,6,2,3]) == 10. 2. largestRectangle([2,4]) == 4. 3. largestRectangle([1]) == 1. 4. Iterating one past the end with a sentinel height 0 flushes the stack.`,
hints:['Loop i from 0 to length inclusive; treat i==length as height 0 to drain the stack.','While the stack top is at least the current height, pop it as the rectangle height.','Width = stack empty ? i : i - stack.peek() - 1.'],
solution:`import java.util.*;\n\npublic class Histogram {\n    static int largestRectangle(int[] heights) {\n        Deque<Integer> stack = new ArrayDeque<>();\n        int best = 0;\n        for (int i = 0; i <= heights.length; i++) {\n            int h = (i == heights.length) ? 0 : heights[i];\n            while (!stack.isEmpty() && heights[stack.peek()] >= h) {\n                int height = heights[stack.pop()];\n                int width = stack.isEmpty() ? i : i - stack.peek() - 1;\n                best = Math.max(best, height * width);\n            }\n            stack.push(i);\n        }\n        return best;\n    }\n}`},
{title:'Longest increasing subsequence',
prompt:`<b>Hard.</b> Write <code>static int lengthOfLIS(int[] nums)</code> in O(n log n): maintain a <code>tails</code> array where tails[i] is the smallest possible tail of an increasing subsequence of length i+1; binary-search the insertion point of each number.`,
starter:`public class LIS {\n    static int lengthOfLIS(int[] nums) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+lengthOfLIS\\s*\\(\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Maintains a tails array',re:'int\\[\\]\\s+tails'},{d:'Binary search for the slot',re:'while\\s*\\(\\s*lo\\s*<\\s*hi\\s*\\)'},{d:'Grows length when appending',re:'size\\+\\+|lo\\s*==\\s*size'}],
behavior:`1. lengthOfLIS([10,9,2,5,3,7,101,18]) == 4 ([2,3,7,101]). 2. lengthOfLIS([0,1,0,3,2,3]) == 4. 3. lengthOfLIS([7,7,7]) == 1. 4. O(n log n) via binary search into tails.`,
hints:['Binary search the first tails value >= x; overwrite it.','If the search index equals the current size, x extends the longest run (size++).','tails is not the actual subsequence, only lengths matter.'],
solution:`public class LIS {\n    static int lengthOfLIS(int[] nums) {\n        int[] tails = new int[nums.length];\n        int size = 0;\n        for (int x : nums) {\n            int lo = 0, hi = size;\n            while (lo < hi) {\n                int mid = (lo + hi) / 2;\n                if (tails[mid] < x) lo = mid + 1;\n                else hi = mid;\n            }\n            tails[lo] = x;\n            if (lo == size) size++;\n        }\n        return size;\n    }\n}`},
{title:'Maximum product subarray',
prompt:`<b>Hard.</b> Write <code>static int maxProduct(int[] nums)</code> for the largest product of a contiguous subarray. Track BOTH the running max and min (a negative flips them), swapping on a negative number.`,
starter:`public class MaxProduct {\n    static int maxProduct(int[] nums) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+maxProduct\\s*\\(\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Tracks max and min',re:'min[\\s\\S]*?max|max[\\s\\S]*?min'},{d:'Swaps on a negative',re:'<\\s*0'},{d:'Best via Math.max',re:'Math\\.max'}],
behavior:`1. maxProduct([2,3,-2,4]) == 6. 2. maxProduct([-2,0,-1]) == 0. 3. maxProduct([-2,3,-4]) == 24. 4. Keeping the min matters because two negatives make a large positive.`,
hints:['Seed max=min=best=nums[0].','If the current value is negative, swap max and min before updating.','max = Math.max(x, max*x); min = Math.min(x, min*x); best = Math.max(best, max).'],
solution:`public class MaxProduct {\n    static int maxProduct(int[] nums) {\n        int max = nums[0], min = nums[0], best = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            int x = nums[i];\n            if (x < 0) { int t = max; max = min; min = t; }\n            max = Math.max(x, max * x);\n            min = Math.min(x, min * x);\n            best = Math.max(best, max);\n        }\n        return best;\n    }\n}`},
{title:'Jump game II',
prompt:`<b>Hard.</b> Write <code>static int jump(int[] nums)</code> returning the minimum jumps to reach the last index (a solution is guaranteed). Greedy BFS-by-levels: track the current jump boundary and the farthest reachable; increment jumps when you reach the boundary.`,
starter:`public class JumpII {\n    static int jump(int[] nums) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+jump\\s*\\(\\s*int\\[\\]\\s+nums\\s*\\)'},{d:'Tracks farthest reach',re:'Math\\.max\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\+\\s*nums\\['},{d:'Bumps jumps at the boundary',re:'==\\s*\\w+[\\s\\S]*?\\+\\+'}],
behavior:`1. jump([2,3,1,1,4]) == 2. 2. jump([2,3,0,1,4]) == 2. 3. jump([0]) == 0 (already at the end). 4. O(n): each index advances the frontier at most once.`,
hints:['Loop to length-1 (you never need to jump FROM the last index).','farthest = Math.max(farthest, i + nums[i]).','When i reaches the current boundary curEnd, jumps++ and curEnd = farthest.'],
solution:`public class JumpII {\n    static int jump(int[] nums) {\n        int jumps = 0, curEnd = 0, farthest = 0;\n        for (int i = 0; i < nums.length - 1; i++) {\n            farthest = Math.max(farthest, i + nums[i]);\n            if (i == curEnd) {\n                jumps++;\n                curEnd = farthest;\n            }\n        }\n        return jumps;\n    }\n}`},
{title:'Combination sum',
prompt:`<b>Hard.</b> Write <code>static java.util.List&lt;java.util.List&lt;Integer&gt;&gt; combinationSum(int[] candidates, int target)</code> returning all unique combinations (each number reusable) summing to target, via <b>backtracking</b> with a start index and undo step.`,
starter:`import java.util.*;\n\npublic class CombSum {\n    static List<List<Integer>> combinationSum(int[] candidates, int target) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<List<Integer>>\\s+combinationSum'},{d:'Recursive backtracking helper',re:'backtrack\\s*\\('},{d:'Undo step after recursion',re:'\\.remove\\s*\\(\\s*\\w+\\.size\\s*\\(\\s*\\)\\s*-\\s*1\\s*\\)'},{d:'Base case on remaining',re:'==\\s*0|<\\s*0'}],
behavior:`1. combinationSum([2,3,6,7], 7) == [[2,2,3],[7]]. 2. combinationSum([2], 1) == []. 3. Reusing the same index allows repeats; passing i (not i+1) is what permits reuse. 4. No duplicate combinations because the start index only moves forward.`,
hints:['Recurse with (remaining, startIndex, path). remaining==0 records a copy of path.','Loop i from start; add candidates[i], recurse with the SAME i (reuse allowed), then remove the last element.','remaining<0 prunes the branch.'],
solution:`import java.util.*;\n\npublic class CombSum {\n    static List<List<Integer>> combinationSum(int[] candidates, int target) {\n        List<List<Integer>> res = new ArrayList<>();\n        backtrack(candidates, target, 0, new ArrayList<>(), res);\n        return res;\n    }\n    static void backtrack(int[] c, int remain, int start, List<Integer> path, List<List<Integer>> res) {\n        if (remain == 0) { res.add(new ArrayList<>(path)); return; }\n        if (remain < 0) return;\n        for (int i = start; i < c.length; i++) {\n            path.add(c[i]);\n            backtrack(c, remain - c[i], i, path, res);\n            path.remove(path.size() - 1);\n        }\n    }\n}`},
{title:'Subsets (power set)',
prompt:`<b>Hard.</b> Write <code>static java.util.List&lt;java.util.List&lt;Integer&gt;&gt; subsets(int[] nums)</code> returning every subset via backtracking: record the path at every node, then extend with each later element.`,
starter:`import java.util.*;\n\npublic class Subsets {\n    static List<List<Integer>> subsets(int[] nums) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<List<Integer>>\\s+subsets'},{d:'Records a copy of the path',re:'new\\s+ArrayList<>\\s*\\(\\s*\\w+\\s*\\)'},{d:'Recurses from i+1',re:'\\w+\\s*\\+\\s*1'},{d:'Undo step',re:'\\.remove\\s*\\(\\s*\\w+\\.size\\s*\\(\\s*\\)\\s*-\\s*1\\s*\\)'}],
behavior:`1. subsets([1,2,3]) has 8 subsets including [], [1,2,3], [2,3]. 2. subsets([]) == [[]]. 3. subsets([0]) == [[], [0]]. 4. O(2^n) subsets, each built by add/recurse/remove.`,
hints:['Add a copy of path to the result at the TOP of each call (before the loop).','Loop i from start; add nums[i], recurse with i+1, remove.','Passing i+1 prevents reusing an element and avoids duplicates.'],
solution:`import java.util.*;\n\npublic class Subsets {\n    static List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        build(nums, 0, new ArrayList<>(), res);\n        return res;\n    }\n    static void build(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {\n        res.add(new ArrayList<>(path));\n        for (int i = start; i < nums.length; i++) {\n            path.add(nums[i]);\n            build(nums, i + 1, path, res);\n            path.remove(path.size() - 1);\n        }\n    }\n}`},
{title:'Permutations',
prompt:`<b>Hard.</b> Write <code>static java.util.List&lt;java.util.List&lt;Integer&gt;&gt; permute(int[] nums)</code> returning all orderings via backtracking with a <code>used</code> boolean array; record a full path and unwind.`,
starter:`import java.util.*;\n\npublic class Permutations {\n    static List<List<Integer>> permute(int[] nums) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<List<Integer>>\\s+permute'},{d:'Uses a used[] array',re:'boolean\\[\\]'},{d:'Base case on full length',re:'size\\s*\\(\\s*\\)\\s*==\\s*nums\\.length'},{d:'Resets used on unwind',re:'used\\[\\s*\\w+\\s*\\]\\s*=\\s*false'}],
behavior:`1. permute([1,2,3]) has 6 permutations. 2. permute([1]) == [[1]]. 3. permute([0,1]) == [[0,1],[1,0]]. 4. O(n!) results; used[] prevents reusing an element within one permutation.`,
hints:['When path.size() == nums.length, record a copy.','Skip used indices; mark used[i]=true, add, recurse, then remove and set used[i]=false.','The unwind (remove + false) is what explores sibling branches.'],
solution:`import java.util.*;\n\npublic class Permutations {\n    static List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        perm(nums, new boolean[nums.length], new ArrayList<>(), res);\n        return res;\n    }\n    static void perm(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {\n        if (path.size() == nums.length) { res.add(new ArrayList<>(path)); return; }\n        for (int i = 0; i < nums.length; i++) {\n            if (used[i]) continue;\n            used[i] = true;\n            path.add(nums[i]);\n            perm(nums, used, path, res);\n            path.remove(path.size() - 1);\n            used[i] = false;\n        }\n    }\n}`},
{title:'Generate parentheses',
prompt:`<b>Hard.</b> Write <code>static java.util.List&lt;String&gt; generateParenthesis(int n)</code> producing all valid combinations of n pairs, via backtracking that only adds ')' when it would not exceed the number of '(' already placed.`,
starter:`import java.util.*;\n\npublic class GenParens {\n    static List<String> generateParenthesis(int n) {\n        return null;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+List<String>\\s+generateParenthesis\\s*\\(\\s*int\\s+n\\s*\\)'},{d:'Backtracking helper',re:'gen\\s*\\(|build\\s*\\('},{d:'Close-only-when-valid constraint',re:'close\\s*>\\s*open|\\w+\\s*<\\s*\\w+'},{d:'Undo with deleteCharAt',re:'deleteCharAt'}],
behavior:`1. generateParenthesis(3) has 5 results including "((()))" and "()()()". 2. generateParenthesis(1) == ["()"]. 3. Only balanced, valid strings appear. 4. The open/close counters enforce validity by construction.`,
hints:['Track remaining open and close counts (both start at n).','Add ( when open>0; add ) only when close>open (more opens still outstanding).','Append, recurse, then deleteCharAt(length-1) to backtrack.'],
solution:`import java.util.*;\n\npublic class GenParens {\n    static List<String> generateParenthesis(int n) {\n        List<String> res = new ArrayList<>();\n        gen(n, n, new StringBuilder(), res);\n        return res;\n    }\n    static void gen(int open, int close, StringBuilder sb, List<String> res) {\n        if (open == 0 && close == 0) { res.add(sb.toString()); return; }\n        if (open > 0) {\n            sb.append('(');\n            gen(open - 1, close, sb, res);\n            sb.deleteCharAt(sb.length() - 1);\n        }\n        if (close > open) {\n            sb.append(')');\n            gen(open, close - 1, sb, res);\n            sb.deleteCharAt(sb.length() - 1);\n        }\n    }\n}`},
{title:'Word break',
prompt:`<b>Hard.</b> Write <code>static boolean wordBreak(String s, java.util.List&lt;String&gt; dict)</code> deciding whether s can be segmented into dictionary words. DP over prefixes: dp[i] is true if some j has dp[j] true and s[j..i] is a word.`,
starter:`import java.util.*;\n\npublic class WordBreak {\n    static boolean wordBreak(String s, List<String> dict) {\n        return false;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+boolean\\s+wordBreak\\s*\\(\\s*String\\s+s\\s*,\\s*List<String>\\s+dict\\s*\\)'},{d:'Dictionary as a Set',re:'new\\s+HashSet<'},{d:'Boolean DP array with dp[0] true',re:'dp\\[\\s*0\\s*\\]\\s*=\\s*true'},{d:'Checks a substring against the set',re:'contains\\s*\\(\\s*s\\.substring'}],
behavior:`1. wordBreak("leetcode", ["leet","code"]) == true. 2. wordBreak("applepenapple", ["apple","pen"]) == true. 3. wordBreak("catsandog", ["cats","dog","sand","and","cat"]) == false. 4. O(n^2) prefix DP with O(1) set lookups.`,
hints:['Put the dictionary in a HashSet for O(1) contains.','dp[0]=true; for each end i, look for a split j where dp[j] and s.substring(j,i) is a word.','Answer is dp[s.length()].'],
solution:`import java.util.*;\n\npublic class WordBreak {\n    static boolean wordBreak(String s, List<String> dict) {\n        Set<String> words = new HashSet<>(dict);\n        boolean[] dp = new boolean[s.length() + 1];\n        dp[0] = true;\n        for (int i = 1; i <= s.length(); i++) {\n            for (int j = 0; j < i; j++) {\n                if (dp[j] && words.contains(s.substring(j, i))) { dp[i] = true; break; }\n            }\n        }\n        return dp[s.length()];\n    }\n}`},
{title:'Coin change II (count combinations)',
prompt:`<b>Hard.</b> Write <code>static int change(int amount, int[] coins)</code> counting the number of distinct combinations that make amount. Classic unbounded-knapsack DP: coins on the OUTER loop (so order does not create duplicates), amounts inner.`,
starter:`public class CoinChangeII {\n    static int change(int amount, int[] coins) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+change\\s*\\(\\s*int\\s+amount\\s*,\\s*int\\[\\]\\s+coins\\s*\\)'},{d:'dp[0] seeded to 1',re:'dp\\[\\s*0\\s*\\]\\s*=\\s*1'},{d:'Coins on the outer loop',re:'for\\s*\\(\\s*int\\s+\\w+\\s*:\\s*coins\\s*\\)'},{d:'Accumulates dp[a - c]',re:'dp\\[\\s*\\w+\\s*\\]\\s*\\+=\\s*dp\\[\\s*\\w+\\s*-\\s*\\w+\\s*\\]'}],
behavior:`1. change(5, [1,2,5]) == 4. 2. change(3, [2]) == 0. 3. change(10, [10]) == 1. 4. Coins-outer ordering counts each combination once (not permutations).`,
hints:['dp[0]=1: one way to make zero (use nothing).','Outer loop over coins, inner over amounts a=c..amount: dp[a]+=dp[a-c].','If you swap the loop order you count ordered permutations instead.'],
solution:`public class CoinChangeII {\n    static int change(int amount, int[] coins) {\n        int[] dp = new int[amount + 1];\n        dp[0] = 1;\n        for (int c : coins) {\n            for (int a = c; a <= amount; a++) {\n                dp[a] += dp[a - c];\n            }\n        }\n        return dp[amount];\n    }\n}`},
{title:'Course schedule (cycle detection)',
prompt:`<b>Hard.</b> Given numCourses and prerequisite pairs [a,b] (b before a), write <code>static boolean canFinish(int numCourses, int[][] prereq)</code> returning whether all courses can be completed. Detect a cycle with <b>Kahn topological sort</b> (indegree BFS): all courses processed means no cycle.`,
starter:`import java.util.*;\n\npublic class CourseSchedule {\n    static boolean canFinish(int numCourses, int[][] prereq) {\n        return false;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+boolean\\s+canFinish\\s*\\(\\s*int\\s+numCourses\\s*,\\s*int\\[\\]\\[\\]\\s+prereq\\s*\\)'},{d:'Indegree array',re:'int\\[\\]\\s+indeg'},{d:'Queue-based BFS',re:'ArrayDeque<'},{d:'Compares processed count to numCourses',re:'==\\s*numCourses'}],
behavior:`1. canFinish(2, [[1,0]]) == true. 2. canFinish(2, [[1,0],[0,1]]) == false (cycle). 3. canFinish(1, []) == true. 4. If fewer than numCourses are ever dequeued, a cycle exists.`,
hints:['Build an adjacency list and an indegree count for each course.','Seed the queue with all indegree-0 courses; process one, decrement its neighbours, enqueue any that hit 0.','If the number processed equals numCourses, there is no cycle.'],
solution:`import java.util.*;\n\npublic class CourseSchedule {\n    static boolean canFinish(int numCourses, int[][] prereq) {\n        List<List<Integer>> graph = new ArrayList<>();\n        int[] indeg = new int[numCourses];\n        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());\n        for (int[] p : prereq) { graph.get(p[1]).add(p[0]); indeg[p[0]]++; }\n        Deque<Integer> q = new ArrayDeque<>();\n        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);\n        int seen = 0;\n        while (!q.isEmpty()) {\n            int c = q.poll();\n            seen++;\n            for (int nxt : graph.get(c)) if (--indeg[nxt] == 0) q.offer(nxt);\n        }\n        return seen == numCourses;\n    }\n}`},
{title:'Decode ways',
prompt:`<b>Hard.</b> Digits 1-26 map to A-Z. Write <code>static int numDecodings(String s)</code> counting the ways to decode s. DP like Fibonacci: dp[i] adds dp[i-1] when the last digit is 1-9 and dp[i-2] when the last two digits form 10-26.`,
starter:`public class DecodeWays {\n    static int numDecodings(String s) {\n        return 0;\n    }\n}`,
tests:[{d:'Method signature',re:'static\\s+int\\s+numDecodings\\s*\\(\\s*String\\s+s\\s*\\)'},{d:'Rejects a leading zero',re:'charAt\\s*\\(\\s*0\\s*\\)\\s*==\\s*.0.'},{d:'Two-digit range 10..26',re:'>=\\s*10[\\s\\S]*?<=\\s*26|<=\\s*26'},{d:'Fibonacci-style accumulation',re:'dp\\[\\s*i\\s*\\]\\s*\\+=\\s*dp\\[\\s*i\\s*-\\s*1\\s*\\]'}],
behavior:`1. numDecodings("12") == 2 ("AB", "L"). 2. numDecodings("226") == 3. 3. numDecodings("06") == 0 (no leading zero). 4. O(n) DP; a 0 that cannot pair with a preceding 1 or 2 zeroes out that path.`,
hints:['Return 0 immediately if the string is empty or starts with 0.','dp[0]=dp[1]=1; for i>=2 look at the last one digit (1-9) and last two digits (10-26).','Add dp[i-1] and/or dp[i-2] accordingly.'],
solution:`public class DecodeWays {\n    static int numDecodings(String s) {\n        if (s.isEmpty() || s.charAt(0) == '0') return 0;\n        int n = s.length();\n        int[] dp = new int[n + 1];\n        dp[0] = 1;\n        dp[1] = 1;\n        for (int i = 2; i <= n; i++) {\n            int one = s.charAt(i - 1) - '0';\n            int two = Integer.parseInt(s.substring(i - 2, i));\n            if (one >= 1) dp[i] += dp[i - 1];\n            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];\n        }\n        return dp[n];\n    }\n}`}

]}
]});
