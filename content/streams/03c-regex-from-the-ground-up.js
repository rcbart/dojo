STREAMS.push({icon:'🔍',title:'Regex from the Ground Up',blurb:'Pattern matching explained like you have never seen a regex: literals, character classes, quantifiers, anchors and groups: one idea at a time, up to real log parsing.',lessons:[
{id:'rgx0',title:'What a regex is, from zero',body:`
<p>Forget the punctuation soup for a moment. Imagine handing a highlighter to a very fast, very literal assistant and asking them to mark things in a huge document. You can't point; you have to <b>describe</b> what to mark: "highlight every phone number", "every line that starts with ERROR", "every word ending in -ing". A <b>regular expression</b> (regex) is exactly that: <b>a written description of a text pattern</b>, in a compact language the computer understands. The regex is the description; the engine is the assistant; matches are the highlights.</p>
<p>The language has one beautifully simple base rule: <b>ordinary characters describe themselves</b>. The regex <code>cat</code> means "a c, then an a, then a t": it matches the letters <i>cat</i> wherever they appear, including inside <i>education</i>. No magic yet: most characters in a regex are just literal text.</p>
<p>The power comes from a handful of <b>special characters</b> that describe <i>kinds</i> of text instead of exact text. Meet the first two:</p>
<ul>
<li><b><code>.</code>, "any single character"</b>: the regex <code>c.t</code> matches <i>cat</i>, <i>cot</i>, <i>c9t</i>: c, then <i>anything</i>, then t.</li>
<li><b><code>\\\\</code>, "the next character is literal"</b>: because <code>.</code> is special, describing a real dot needs an escape: <code>3\\\\.14</code> matches <i>3.14</i> but not <i>3914</i>. (The specials worth escaping when you mean them literally: <code>. ? * + ( ) [ ] { } | ^ $ \\\\</code>.)</li>
</ul>
<p>In Java you'll use patterns two ways, and the difference matters from day one:</p>
<div class="codeSample" data-hl>"education".matches("cat")        // false! matches() asks: does the WHOLE string fit?
"education".contains("cat")       // true — but contains() only does literal text
"c9t".matches("c.t")              // true — whole string, one pattern

// find-anywhere needs Pattern/Matcher (the deep-dive lesson) — or bracket the
// pattern with "anything before, anything after":
"education".matches(".*cat.*")    // true — .* means "any characters, any amount"</div>
<p>One Java wrinkle to absorb now, because it explains every doubled backslash you'll ever see: regex and Java string literals <b>both</b> use backslash as their escape character. The regex <code>\\\\.</code> (a literal dot) must be typed in Java source as <code>"\\\\\\\\."</code>: one layer for the string, one for the regex. When a pattern looks over-slashed, mentally halve them.</p>`,
docs:[['Regular expressions (Oracle tutorial)','https://docs.oracle.com/javase/tutorial/essential/regex/'],['String.matches (Javadoc)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#matches(java.lang.String)'],['regex101 (interactive playground)','https://regex101.com/']],
exs:[{title:'First descriptions',
prompt:`Write class <code>FirstPatterns</code> with three static methods, each a single <code>return raw.matches(...)</code>. Remember <code>matches()</code> tests the <b>whole</b> string: (1) <code>boolean isCode(String raw)</code>: true for exactly an uppercase <code>A</code>, then any single character, then a digit written as the class <code>[0-9]</code> (pattern: <code>A.[0-9]</code>); (2) <code>boolean isPrice(String raw)</code>: true for exactly one digit, a <b>literal dot</b> (escaped!), then two digits: <code>[0-9]\\\\.[0-9][0-9]</code>, as a Java string that's <code>"[0-9]\\\\\\\\.[0-9][0-9]"</code>; (3) <code>boolean mentionsCat(String raw)</code>: true when <i>cat</i> appears <b>anywhere</b>: bracket it with <code>.*</code> on both sides.`,
starter:`public class FirstPatterns {

    static boolean isCode(String raw) {
        return false;
    }

    static boolean isPrice(String raw) {
        return false;
    }

    static boolean mentionsCat(String raw) {
        return false;
    }
}`,
solution:`public class FirstPatterns {

    static boolean isCode(String raw) {
        return raw.matches("A.[0-9]");
    }

    static boolean isPrice(String raw) {
        return raw.matches("[0-9]\\\\.[0-9][0-9]");
    }

    static boolean mentionsCat(String raw) {
        return raw.matches(".*cat.*");
    }
}`,
tests:[{d:'isCode: literal A, any char, digit class',re:'matches\\s*\\(\\s*"A\\.\\[0-9\\]"\\s*\\)'},{d:'isPrice escapes the dot (doubled backslash in Java)',re:'matches\\s*\\(\\s*"\\[0-9\\]\\\\{2}\\.\\[0-9\\]\\[0-9\\]"'},{d:'mentionsCat brackets with .* on both sides',re:'matches\\s*\\(\\s*"\\.\\*cat\\.\\*"'},{d:'Every method is a single return of matches',re:'return\\s+raw\\.matches'},{d:'No contains() shortcuts',re:'contains\\s*\\(',not:true}],
behavior:`1. isCode("A73") == true (7 is "any char"), isCode("AB5") == true, isCode("A734") == false: matches() is whole-string, and four characters cannot fit a three-character description. 2. isPrice("9.99") == true; isPrice("9x99") == false: the ESCAPED dot demands a real dot, unlike the bare dot in isCode which accepted anything. 3. mentionsCat("my cat sleeps") == true, mentionsCat("catalog") == true, mentionsCat("dog") == false. 4. Together the three methods are the three founding ideas: literals describe themselves, specials describe kinds, and whole-string vs anywhere is YOUR choice to encode.`,
hints:['isCode reads aloud as: an A, then anything, then a digit.','The price dot needs two escape layers: regex wants \\\\. and the Java string doubles it to \\\\\\\\.','.*cat.* reads: any amount of anything, cat, any amount of anything, the "find anywhere" idiom for matches().']},
{title:'Your first match, executed',lang:'js',diff:'easy',
run:{call:'firstMatch',cases:[{"name": "digits inside a sentence", "args": ["order 1234 ok", "\\d+"], "expect": "1234"}, {"name": "no match returns null, not an empty string", "args": ["none here", "\\d+"], "expect": null}, {"name": "the FIRST match only", "args": ["a1 b22", "\\d+"], "expect": "1"}, {"name": "a literal pattern matches itself", "args": ["status: ok", "ok"], "expect": "ok"}]},
prompt:`Write <code>function firstMatch(text, pattern)</code> returning the <b>first</b> substring of <code>text</code> matching the regex <code>pattern</code> (a string), or <code>null</code> when nothing matches. Build the regex with <code>new RegExp(pattern)</code>. Same engine idea as Java\x27s Pattern/Matcher; here it executes.`,
starter:`function firstMatch(text, pattern) {\n  return null;\n}`,
solution:`function firstMatch(text, pattern) {\n  const m = new RegExp(pattern).exec(text);\n  return m ? m[0] : null;   // m[0] is the whole match\n}`,
tests:[{d:'a regex is built from the pattern string',re:'new RegExp|RegExp\\s*\\('},{d:'the text is searched',re:'exec|match'},{d:'no match returns null',re:'null'},{d:'the matched text is returned',re:'m\\[0\\]|\\[0\\]'}],
behavior:`Four cases execute. The null case is the one that matters: exec() returns null rather than an empty string, and code that treats "no match" as "" will happily use an empty value as if it were data. The third case shows a regex finds the FIRST match by default (without the g flag there is no iteration), which is why "it only found one" is not a bug report.`,
hints:['exec() returns an array-like match, or null.','Element 0 of the match is the whole matched text.','Build the pattern with new RegExp(pattern) since it arrives as a string.']}]},

{id:'rgxcls',title:'Character classes & quantifiers: kinds and amounts',body:`
<p>Two questions describe almost any pattern: <b>what kind</b> of character, and <b>how many</b> of them. Regex has a vocabulary for each.</p>
<p><b>Kinds: character classes.</b> Square brackets mean "one character, from this menu":</p>
<div class="codeSample">[abc]        one character: an a, b or c
[a-z]        one lowercase letter (a range)
[A-Za-z0-9]  one letter or digit (ranges combine)
[^0-9]       one character that is NOT a digit (^ inside [ ] = negation)

shorthands for the common menus (memorize these three):
\\\\d  = [0-9]           a digit          \\\\D  anything but
\\\\w  = [A-Za-z0-9_]    a "word" char    \\\\W  anything but
\\\\s  = space/tab/newline  whitespace    \\\\S  anything but</div>
<p><b>Amounts: quantifiers.</b> A quantifier sits <i>after</i> a thing and says how many times it repeats:</p>
<div class="codeSample">?      zero or one    (optional)         colou?r  → color, colour
*      zero or more                      .*       → anything, even nothing
+      one or more                       \\\\d+     → 42, 7, 123456  (but not "")
{3}    exactly three                     \\\\d{3}   → 404
{2,4}  two to four                       [a-z]{2,4}
{2,}   two or more</div>
<p>Reading practice (sound these out before peeking): <code>\\\\d{4}-\\\\d{2}-\\\\d{2}</code> means "4 digits, dash, 2 digits, dash, 2 digits": a date like 2026-07-19. <code>[A-Z]\\\\w+</code> means "one capital, then one or more word chars": a capitalized word. <code>\\\\s*</code> means "any amount of whitespace, including none" (which is why it appears between things in forgiving parsers).</p>
<p>One caution to file away: quantifiers are <b>greedy</b>: <code>.*</code> grabs as much as it can while still letting the rest of the pattern succeed. It rarely matters at this stage, but when a pattern someday matches "too much", greed is the first suspect (the fix, <code>.*?</code>, means "as little as possible").</p>`,
docs:[['Character classes (Oracle)','https://docs.oracle.com/javase/tutorial/essential/regex/char_classes.html'],['Quantifiers (Oracle)','https://docs.oracle.com/javase/tutorial/essential/regex/quant.html'],['Predefined classes (Oracle)','https://docs.oracle.com/javase/tutorial/essential/regex/pre_char_classes.html']],
exs:[{title:'Kinds and amounts drill',
prompt:`Write class <code>Shapes</code> with four static methods, each one <code>return raw.matches(...)</code>: (1) <code>boolean isPin(String raw)</code>, exactly four digits: <code>[0-9]{4}</code>; (2) <code>boolean isHandle(String raw)</code>, an <code>@</code>, then one lowercase letter, then two to fourteen more lowercase letters or digits: <code>@[a-z][a-z0-9]{2,14}</code>; (3) <code>boolean isHexColor(String raw)</code>, a <code>#</code> then exactly six characters from the menu <code>[0-9a-fA-F]</code>; (4) <code>boolean isShout(String raw)</code>, one or more uppercase letters followed by one or more <code>!</code>; remember <code>!</code> is not special, but write the plus signs where they belong: <code>[A-Z]+!+</code>.`,
starter:`public class Shapes {

    static boolean isPin(String raw) {
        return false;
    }

    static boolean isHandle(String raw) {
        return false;
    }

    static boolean isHexColor(String raw) {
        return false;
    }

    static boolean isShout(String raw) {
        return false;
    }
}`,
solution:`public class Shapes {

    static boolean isPin(String raw) {
        return raw.matches("[0-9]{4}");
    }

    static boolean isHandle(String raw) {
        return raw.matches("@[a-z][a-z0-9]{2,14}");
    }

    static boolean isHexColor(String raw) {
        return raw.matches("#[0-9a-fA-F]{6}");
    }

    static boolean isShout(String raw) {
        return raw.matches("[A-Z]+!+");
    }
}`,
tests:[{d:'isPin: digit class with exact-count quantifier',re:'matches\\s*\\(\\s*"\\[0-9\\]\\{4\\}"'},{d:'isHandle: literal @, letter first, bounded tail',re:'matches\\s*\\(\\s*"@\\[a-z\\]\\[a-z0-9\\]\\{2,14\\}"'},{d:'isHexColor: # then six hex-menu chars',re:'matches\\s*\\(\\s*"#\\[0-9a-fA-F\\]\\{6\\}"'},{d:'isShout: one-or-more letters, one-or-more bangs',re:'matches\\s*\\(\\s*"\\[A-Z\\]\\+!\\+"'},{d:'All four are single-expression returns',re:'return\\s+raw\\.matches'}],
behavior:`1. isPin("0042") == true; isPin("42") and isPin("00423") == false: {4} means exactly. 2. isHandle("@ada_") == false (underscore not on the menu), "@ada42" == true, "@a" == false (needs 3+ total after @). 3. isHexColor("#1A2b3C") == true: ranges made case a non-issue without any flag. 4. isShout("HELLO!!!") == true, "Hello!" == false, "HELLO" == false: each + demands at least one. 5. Every method is a kind+amount sentence you can read aloud; if you can say the rule in English, you can now write it.`,
hints:['Read each pattern aloud before coding: "at-sign, one lowercase letter, 2-14 lowercase-or-digits".','{2,14} counts only the SECOND class; the first [a-z] already consumed one char, giving 3-15 total.','No escaping needed anywhere here: @, # and ! mean themselves; only the specials from lesson 1 need backslashes.']},
{title:'Count every match',lang:'js',diff:'easy',
run:{call:'countMatches',cases:[{"name": "three runs of digits", "args": ["a1b22c333", "\\d+"], "expect": 3}, {"name": "quantifier greediness groups adjacent digits", "args": ["1234", "\\d+"], "expect": 1}, {"name": "nothing matches", "args": ["abc", "\\d+"], "expect": 0}, {"name": "single characters when the quantifier is dropped", "args": ["a1b2", "\\d"], "expect": 2}]},
prompt:`Write <code>function countMatches(text, pattern)</code> returning how many times the pattern matches. You need the <b>global</b> flag (<code>new RegExp(pattern, "g")</code>), because without it the engine stops at the first match.`,
starter:`function countMatches(text, pattern) {\n  return 0;\n}`,
solution:`function countMatches(text, pattern) {\n  return (text.match(new RegExp(pattern, "g")) || []).length;\n}`,
tests:[{d:'the global flag is set',re:'["\x27]g["\x27]'},{d:'match is used to collect all hits',re:'\\.match\\s*\\('},{d:'no matches counts as zero',re:'\\|\\|\\s*\\[\\]|null|\\?\\?'},{d:'the count is returned',re:'length'}],
behavior:`Cases two and four are the point. "1234" with \\d+ is ONE match, not four, because + is greedy and consumes as many digits as it can; the same text with \\d is four matches. Quantifiers change what counts as a match, so "how many" is meaningless until you say what one match is. The no-match case checks the null guard: String.match with /g/ returns null rather than an empty array, and calling .length on null throws.`,
hints:['Without the g flag, match() returns only the first match plus its groups.','With the g flag it returns an array of matched strings, or null if there were none.','Guard the null before reading .length.']}]},

{id:'rgxgrp',title:'Anchors, groups & alternation: structure',body:`
<p>Three more ideas complete the core language; after these, everything else in regex is refinement.</p>
<ul>
<li><b>Anchors: position, not characters.</b> <code>^</code> matches "at the start", <code>$</code> "at the end"; they consume nothing. Inside Java's <code>matches()</code> they're implicit (whole string already), but with find-anywhere tools they're how you say "the line <i>starts</i> with ERROR": <code>^ERROR</code>. Their little sibling <code>\\\\b</code> is a <b>word boundary</b>: <code>\\\\bcat\\\\b</code> finds <i>cat</i> as a word while refusing <i>education</i>. (Yes: same <code>^</code> symbol as negation-inside-brackets. Position outside <code>[ ]</code>, negation inside; regex reuses its scarce symbols.)</li>
<li><b>Alternation: or.</b> <code>|</code> separates alternatives: <code>yes|no|maybe</code>. Combine with grouping to scope it: <code>gr(a|e)y</code> matches gray and grey; without the parens, <code>gra|ey</code> would read as "gra, or ey".</li>
<li><b>Groups: capture the parts you care about.</b> Parentheses do two jobs: they scope (as above), and they <b>capture</b>: the engine remembers what each parenthesized part actually matched, numbered left to right from 1. Given <code>(\\\\d{4})-(\\\\d{2})</code> against <i>2026-07</i>: group 1 holds 2026, group 2 holds 07. Capturing is what upgrades regex from "does it match?" to "<b>pull the pieces out</b>": the year and month are yours to use.</li>
</ul>
<div class="codeSample" data-hl>// Java's find-and-capture workflow (Pattern/Matcher — the next lesson goes deep):
Pattern p = Pattern.compile("(\\\\w+)@(\\\\w+)\\\\.com");
Matcher m = p.matcher("write to ada@dojo.com today");
if (m.find()) {                       // find(): search anywhere (vs matches(): whole string)
    m.group(1);                       // "ada"     — first parens
    m.group(2);                       // "dojo"    — second parens
    m.group(0);                       // "ada@dojo.com" — group 0 is always the whole match
}</div>
<p>And one replacement superpower while the groups are fresh: <code>replaceAll</code> can refer back to them as <code>$1</code>, <code>$2</code>: <code>"2026-07-19".replaceAll("(\\\\d{4})-(\\\\d{2})-(\\\\d{2})", "$3/$2/$1")</code> → <i>19/07/2026</i>. Describe the structure once, then rearrange it.</p>`,
docs:[['Boundary matchers (Oracle)','https://docs.oracle.com/javase/tutorial/essential/regex/bounds.html'],['Groups & capturing (Oracle)','https://docs.oracle.com/javase/tutorial/essential/regex/groups.html'],['Matcher (Javadoc)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Matcher.html']],
exs:[{title:'Capture the pieces',
prompt:`Write class <code>Pieces</code> with three static methods: (1) <code>boolean isAnswer(String raw)</code>: <code>return raw.matches("yes|no|maybe")</code> (alternation, whole string); (2) <code>String swapDate(String raw)</code>: <code>return raw.replaceAll(...)</code> turning every <code>YYYY-MM-DD</code> into <code>DD/MM/YYYY</code>: pattern <code>([0-9]{4})-([0-9]{2})-([0-9]{2})</code>, replacement <code>"$3/$2/$1"</code>; (3) <code>String firstUser(String raw)</code>: compile <code>@([a-z0-9]+)</code> into a <code>java.util.regex.Pattern</code>, get a <code>Matcher</code>, and return <code>m.group(1)</code> if <code>m.find()</code> else <code>null</code>, the captured name <b>without</b> the @.`,
starter:`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Pieces {

    static boolean isAnswer(String raw) {
        return false;
    }

    static String swapDate(String raw) {
        return null;
    }

    static String firstUser(String raw) {
        return null;
    }
}`,
solution:`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Pieces {

    static boolean isAnswer(String raw) {
        return raw.matches("yes|no|maybe");
    }

    static String swapDate(String raw) {
        return raw.replaceAll("([0-9]{4})-([0-9]{2})-([0-9]{2})", "$3/$2/$1");
    }

    static String firstUser(String raw) {
        Pattern p = Pattern.compile("@([a-z0-9]+)");
        Matcher m = p.matcher(raw);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }
}`,
tests:[{d:'isAnswer uses alternation across the three words',re:'matches\\s*\\(\\s*"yes\\|no\\|maybe"'},{d:'swapDate captures three numbered groups',re:'replaceAll\\s*\\(\\s*"\\(\\[0-9\\]\\{4\\}\\)-\\(\\[0-9\\]\\{2\\}\\)-\\(\\[0-9\\]\\{2\\}\\)"'},{d:'Replacement rearranges with $3/$2/$1',re:'"\\$3/\\$2/\\$1"'},{d:'firstUser compiles a Pattern with a capturing group',re:'Pattern\\.compile\\s*\\(\\s*"@\\(\\[a-z0-9\\]\\+\\)"'},{d:'find() guards before group(1)',re:'if\\s*\\(\\s*m\\.find\\s*\\(\\s*\\)\\s*\\)[\\s\\S]*?m\\.group\\s*\\(\\s*1\\s*\\)'}],
behavior:`1. isAnswer("maybe") == true, isAnswer("yesno") == false: matches() is whole-string, so the alternation is between complete answers. 2. swapDate("due 2026-07-19 ok") returns "due 19/07/2026 ok": replaceAll touches every date and leaves the rest alone. 3. firstUser("ping @ada and @bob") == "ada": find() stops at the first hit; the parens exclude the @ from the capture. 4. firstUser("nobody here") == null: calling group() without a successful find() would throw; the if is mandatory, not stylistic.`,
hints:['Alternation binds loosely: yes|no|maybe is three whole alternatives, no parens needed when the whole pattern IS the choice.','In the replacement string, $1-$9 mean "what group N captured", and it needs no doubling: replacement strings are not regexes.','The capture (parens) is INSIDE the pattern after the @; that choice of where to put the parens is what strips the @ for free.']},
{title:'Anchors and capture groups',lang:'js',diff:'medium',
run:{call:'captureParts',cases:[{"name": "a valid ISO date", "args": ["2026-08-14"], "expect": {"year": "2026", "month": "08", "day": "14"}}, {"name": "anchors reject a prefix", "args": ["x2026-08-14"], "expect": null}, {"name": "anchors reject a suffix", "args": ["2026-08-14T09:00"], "expect": null}, {"name": "the digit counts are enforced", "args": ["26-8-1"], "expect": null}]},
prompt:`Write <code>function captureParts(line)</code> returning <code>{year, month, day}</code> from a date of exactly the form <code>YYYY-MM-DD</code>, or <code>null</code> if the whole string is not exactly that. Anchor with <code>^</code> and <code>$</code>, use <code>{n}</code> for the digit counts, and read the captured groups from the match.`,
starter:`function captureParts(line) {\n  return null;\n}`,
solution:`function captureParts(line) {\n  const m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(line);\n  return m ? { year: m[1], month: m[2], day: m[3] } : null;\n}`,
tests:[{d:'the pattern is anchored at both ends',re:'\\^.*\\$'},{d:'three groups are captured',re:'\\(.*\\).*\\(.*\\).*\\(.*\\)'},{d:'exact digit counts are required',re:'\\{4\\}|\\{2\\}'},{d:'groups are read by index',re:'m\\[1\\]|\\[1\\]'}],
behavior:`Cases two and three are the anchoring lesson from the log-reading stream, executed: without ^ and $ the pattern matches a date embedded in a longer string, so "x2026-08-14" and a full timestamp both pass and your validator has accepted input it should not. Case four shows why {4} and {2} matter: \\d+ would accept 26-8-1 and your downstream date parsing would then be guessing.`,
hints:['^ and $ pin the pattern to the whole string.','Parentheses capture; m[1] is the first group, m[2] the second.','{4} and {2} say exactly how many digits, unlike + which says one or more.']}]},

{id:'rgx1',title:'Regular expressions: Pattern & Matcher',body:`
<p>Regex in Java lives in <code>java.util.regex</code>. Two objects matter: <code>Pattern</code> (the compiled expression: compile once, reuse; it's thread-safe) and <code>Matcher</code> (one match attempt over one input, not thread-safe). String's own <code>matches()</code>, <code>replaceAll()</code> and <code>split()</code> recompile the pattern on every call, so hot paths should hold a <code>static final Pattern</code>.</p>
<ul>
<li><b>find() vs matches()</b>: <code>find()</code> searches for the pattern <i>anywhere</i>; <code>matches()</code> requires the <i>entire</i> input to match. The #1 regex bug in Java is expecting one and getting the other.</li>
<li><b>Groups</b>: parentheses capture. <code>group(1)</code> is positional; <b>named groups</b> <code>(?&lt;level&gt;...)</code> read as <code>m.group("level")</code> and survive refactors.</li>
<li><b>Escaping</b>: regex backslashes must be doubled in Java string literals: <code>\\d</code> in source is the regex <code>\d</code>. For matching a literal string verbatim, use <code>Pattern.quote(s)</code>.</li>
<li><b>Common classes</b>: <code>\d \w \s</code> and negations <code>\D \W \S</code>, <code>.</code> (any, not newline unless DOTALL), quantifiers <code>* + ? {n,m}</code>, reluctant <code>*?</code>, anchors <code>^ $ \b</code>.</li>
<li><b>Flags</b>: <code>Pattern.CASE_INSENSITIVE</code>, <code>MULTILINE</code> (^ and $ per line), <code>DOTALL</code> (. crosses newlines).</li>
</ul>
<div class="codeSample">private static final Pattern LOG =
    Pattern.compile("(?&lt;date&gt;\\d{4}-\\d{2}-\\d{2}) (?&lt;level&gt;INFO|WARN|ERROR) (?&lt;msg&gt;.+)");

Matcher m = LOG.matcher("2026-07-17 ERROR disk is full");
if (m.matches()) {
    System.out.println(m.group("level"));   // ERROR
    System.out.println(m.group("msg"));     // disk is full
}

"a1b2c3".replaceAll("\\d", "#");            // "a#b#c#"
Pattern.quote("price (USD)");               // matches those literal chars</div>

<h4>Compile once: the mistake that shows up in profiles</h4>
<p><code>"…".matches(regex)</code>, <code>replaceAll</code> and <code>split</code> compile the pattern on
every single call. In a loop over a million log lines that is a million compilations, and it is one of the
most common findings in a first CPU profile of a text-processing job. Hoist it:</p>
<div class="codeSample">private static final Pattern TRACE = Pattern.compile("trace=([0-9a-f]+)");
Matcher m = TRACE.matcher(line);   // cheap; the Pattern is shared and thread-safe</div>
<p>The split is deliberate: a <code>Pattern</code> is immutable and safe to share across threads, while a
<code>Matcher</code> holds the position of one attempt over one input and must never be shared. One static
final Pattern per expression, a fresh Matcher per string.</p>

<h4>Reading a Matcher without surprising yourself</h4>
<p><code>find()</code> advances through the input and can be called repeatedly in a <code>while</code>
loop; <code>matches()</code> anchors to the whole input and does not advance. Both must be called
<i>before</i> <code>group()</code>, or you get <code>IllegalStateException: No match found</code>; the
matcher genuinely has no result yet. <code>group(0)</code> is the whole match; <code>group(1)</code> the
first capture. A group that did not participate returns <code>null</code>, which is not the same as an
empty string and is worth checking when a pattern has alternation.</p>

<h4>Where regex stops being the right tool</h4>
<p>Two limits worth internalising. <b>Nested structure is out of reach</b>: HTML, JSON and balanced
brackets are not regular languages, so a pattern that appears to work will fail on the first nested case;
use a parser. And <b>catastrophic backtracking</b> is a denial-of-service risk when the pattern contains
nested quantifiers such as <code>(a+)+</code> and the input is attacker-supplied; the engine explores
exponentially many ways to match before giving up. Prefer possessive quantifiers or an anchored, specific
pattern, and never build a pattern by concatenating untrusted input; <code>Pattern.quote</code> exists for
exactly that.</p>`,
docs:[['Pattern (API)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Pattern.html'],['Regex (dev.java tutorial)','https://dev.java/learn/regex/'],['Matcher (API)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Matcher.html']],
exs:[{title:'Log-line parser',
prompt:`Write <code>LogParser</code> with a <code>private static final Pattern</code> named <code>LINE</code> using <b>named groups</b> <code>date</code>, <code>level</code>, <code>msg</code> to parse lines like <code>2026-07-17 ERROR disk is full</code> (date <code>\\d{4}-\\d{2}-\\d{2}</code>, level one of INFO/WARN/ERROR). Add <code>static String levelOf(String line)</code> that returns the level via <code>matches()</code> + <code>group("level")</code>, or <code>"UNKNOWN"</code> when the line doesn't match.`,
starter:`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LogParser {
    // 1. compile LINE once, with named groups date, level, msg

    static String levelOf(String line) {
        // 2. match the whole line; return group "level" or "UNKNOWN"
        return null;
    }
}`,
tests:[{d:'Pattern compiled once as static final LINE',re:'static\\s+final\\s+Pattern\\s+LINE\\s*=\\s*Pattern\\.compile'},{d:'Uses named groups (?<level>…)',re:'\\(\\?<level>'},{d:'Date shape \\d{4}-\\d{2}-\\d{2}',re:'d\\{4\\}[^)]*d\\{2\\}[^)]*d\\{2\\}'},{d:'Full-line match with matches()',re:'\\.matches\\s*\\(\\s*\\)'},{d:'Reads the group by name',re:'group\\s*\\(\\s*"level"\\s*\\)'},{d:'Falls back to UNKNOWN',re:'"UNKNOWN"'}],
behavior:`1. levelOf("2026-07-17 ERROR disk is full") returns "ERROR". 2. levelOf("2026-07-17 INFO started") returns "INFO". 3. levelOf("garbage") returns "UNKNOWN": no exception. 4. The Pattern is compiled exactly once (static final), and matcher() is called per line.`,
hints:['Skeleton: <code>private static final Pattern LINE = Pattern.compile("(?&lt;date&gt;\\\\d{4}-\\\\d{2}-\\\\d{2}) (?&lt;level&gt;INFO|WARN|ERROR) (?&lt;msg&gt;.+)");</code>. Note the doubled backslashes.','In levelOf: <code>Matcher m = LINE.matcher(line);</code> then <code>if (m.matches()) return m.group("level");</code>','matches() must cover the entire line; that is why the pattern ends with <code>(?&lt;msg&gt;.+)</code>. Return "UNKNOWN" outside the if.'],
solution:`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LogParser {
    private static final Pattern LINE = Pattern.compile(
        "(?<date>\\\\d{4}-\\\\d{2}-\\\\d{2}) (?<level>INFO|WARN|ERROR) (?<msg>.+)");

    static String levelOf(String line) {
        Matcher m = LINE.matcher(line);
        if (m.matches()) {
            return m.group("level");
        }
        return "UNKNOWN";
    }
}`},
{title:'Split on a pattern',lang:'js',diff:'easy',
run:{call:'splitCsvLine',cases:[{"name": "commas with surrounding spaces", "args": ["a , b,c"], "expect": ["a", "b", "c"]}, {"name": "no separator gives one field", "args": ["single"], "expect": ["single"]}, {"name": "trailing separator yields an empty field", "args": ["a,b,"], "expect": ["a", "b", ""]}, {"name": "tabs around the comma are handled too", "args": ["a ,\tb"], "expect": ["a", "b"]}]},
prompt:`Write <code>function splitCsvLine(line)</code> splitting on commas and discarding any whitespace around them: <code>"a , b,c"</code> becomes <code>["a","b","c"]</code>. Split on a <b>regex</b>, not a string, so the whitespace is consumed as part of the separator rather than trimmed afterwards.`,
starter:`function splitCsvLine(line) {\n  return [];\n}`,
solution:`function splitCsvLine(line) {\n  return line.split(/\\s*,\\s*/);\n}`,
tests:[{d:'split is given a regular expression',re:'split\\s*\\(\\s*/'},{d:'whitespace around the separator is consumed',re:'\\\\s\\*'},{d:'the comma is the separator',re:','},{d:'an array is returned',re:'return'}],
behavior:`Four real cases. The trailing-separator case is the behaviour to know rather than to fix: "a,b," splits into three fields, the last empty, because a separator at the end means there is something after it. That is correct and it surprises people. Note the real limit of this whole approach: it is not a CSV parser. A quoted field containing a comma will be split in two, which is the same warning the log-reading stream gives about -F, in awk: regex splitting works until the data has quoting.`,
hints:['split accepts a regex as its separator.','\\s* on both sides absorbs any spaces or tabs around the comma.','Think about what a separator at the very end should produce before you special-case it.']}]},

{id:'rgxwild',title:'Regex in the wild: replace, split & restraint',body:`
<p>You now read and write the core language. The last lesson is about using it well in Java, and knowing when not to.</p>
<ul>
<li><b>Compile once.</b> <code>String.matches()</code> recompiles its pattern on every call: fine in a drill, wasteful in a loop over a million lines. The production shape is the one from the parser lesson: <code>private static final Pattern LINE = Pattern.compile(...)</code>, then <code>LINE.matcher(input)</code> per use. Pattern objects are immutable and thread-safe; compiled-once-shared-forever is free performance.</li>
<li><b>The split family.</b> <code>s.split("\\\\s*,\\\\s*")</code>: split on commas <i>with optional surrounding spaces</i>: "a, b ,c" → [a, b, c] with no trimming pass. The limit parameter you met in the REPL lesson (<code>split(regex, 2)</code>) caps the pieces.</li>
<li><b>Replace with judgment.</b> <code>replaceAll</code> takes a regex; <code>replace</code> takes literal text. Reaching for replaceAll to delete a literal dot (and forgetting it's special) is a classic self-inflicted wound. Regex for patterns, replace for text.</li>
<li><b>Flags.</b> <code>Pattern.CASE_INSENSITIVE</code> (or inline <code>(?i)</code>): "error|ERROR|Error" collapses to one clean pattern. <code>Pattern.MULTILINE</code> makes <code>^</code>/<code>$</code> work per-line instead of per-string, the difference between "the string starts with" and "some line starts with".</li>
</ul>
<p><b>And the restraint.</b> Two famous failure modes mark the edge of regex territory:</p>
<ul>
<li><b>Nested or recursive formats are not regex problems.</b> HTML, JSON, matched parentheses (anything where things nest arbitrarily deep) cannot be described by regular expressions (that is a mathematical fact, not a skill issue). Pulling one attribute out of one known tag: fine. "Parsing HTML with regex": the road to the most famous answer on Stack Overflow. Use a real parser (Jackson for JSON; you already do).</li>
<li><b>Catastrophic backtracking.</b> Patterns with nested quantifiers over overlapping menus (the shape <code>(a+)+b</code>) can take <i>exponential</i> time on input that ALMOST matches: 30 a's with no b freezes the thread. This is a real denial-of-service class (ReDoS). The input stream's rule compounds here: bound the input length before the regex runs, and keep quantified groups from overlapping.</li>
</ul>
<p>The closing principle: a regex is a description, and descriptions should stay <i>readable aloud</i>. When yours stops being sayable, split it into named groups (previous lesson), break the parse into steps, or admit it's a parser's job.</p>`,
docs:[['Pattern flags (Javadoc)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Pattern.html#CASE_INSENSITIVE'],['String.split (Javadoc)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#split(java.lang.String)'],['OWASP (ReDoS)','https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS']],
exs:[{title:'Production habits drill',
prompt:`Write class <code>Habits</code>: (1) a <code>private static final java.util.regex.Pattern WORD = Pattern.compile("[a-z]+", Pattern.CASE_INSENSITIVE)</code>: compiled once, flagged, shared; (2) <code>static String[] csv(String raw)</code>: <code>return raw.split(...)</code> splitting on commas with optional surrounding whitespace: the pattern <code>\\\\s*,\\\\s*</code> (in Java: <code>"\\\\\\\\s*,\\\\\\\\s*"</code>); (3) <code>static int countWords(String raw)</code>: use <code>WORD.matcher(raw)</code> and a <code>while (m.find())</code> loop incrementing a counter; (4) <code>static String dropDots(String raw)</code>: remove every literal dot using <code>replace(".", "")</code>, the <b>literal</b> method, not replaceAll.`,
starter:`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Habits {

    // 1) the shared compiled pattern

    static String[] csv(String raw) {
        return null;
    }

    static int countWords(String raw) {
        return 0;
    }

    static String dropDots(String raw) {
        return null;
    }
}`,
solution:`import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Habits {

    private static final Pattern WORD = Pattern.compile("[a-z]+", Pattern.CASE_INSENSITIVE);

    static String[] csv(String raw) {
        return raw.split("\\\\s*,\\\\s*");
    }

    static int countWords(String raw) {
        Matcher m = WORD.matcher(raw);
        int count = 0;
        while (m.find()) {
            count++;
        }
        return count;
    }

    static String dropDots(String raw) {
        return raw.replace(".", "");
    }
}`,
tests:[{d:'Pattern compiled once: private static final + flag',re:'private\\s+static\\s+final\\s+Pattern\\s+WORD\\s*=\\s*Pattern\\.compile\\s*\\(\\s*"\\[a-z\\]\\+"\\s*,\\s*Pattern\\.CASE_INSENSITIVE'},{d:'csv splits on comma with optional whitespace',re:'split\\s*\\(\\s*"\\\\{2}s\\*,\\\\{2}s\\*"'},{d:'countWords loops find() on the SHARED pattern',re:'WORD\\.matcher\\s*\\(\\s*raw\\s*\\)[\\s\\S]*?while\\s*\\(\\s*m\\.find\\s*\\(\\s*\\)\\s*\\)'},{d:'dropDots uses literal replace, not regex',re:'replace\\s*\\(\\s*"\\."\\s*,\\s*""\\s*\\)'},{d:'replaceAll not misused for the literal dot',re:'replaceAll',not:true}],
behavior:`1. csv("a, b ,c") returns [a, b, c]: the pattern ate the stray spaces during the split. 2. countWords("Duke AND ada") == 3: CASE_INSENSITIVE let one lowercase class cover all of them; the shared WORD compiles exactly once no matter how many calls. 3. dropDots("a.b.c") == "abc", and because replace() is literal, the dot needed no escaping at all. 4. The file demonstrates the whole judgment call: regex where a PATTERN is described (split, count), plain replace where the target is fixed TEXT.`,
hints:['A static final Pattern at the top of the class is the compile-once idiom; that is the point of this drill as much as any method.','The split pattern reads: any spaces, a comma, any spaces.','If you typed replaceAll("\\\\\\\\.", "") it would work, and be the exact over-engineering dropDots is teaching you to skip.']},
{title:'Redact with replace',lang:'js',diff:'medium',
run:{call:'maskCards',cases:[{"name": "a 16-digit number is masked but for the last four", "args": ["card 4111111111111111 end"], "expect": "card ************1111 end"}, {"name": "short numbers are left alone", "args": ["id 123456"], "expect": "id 123456"}, {"name": "two numbers in one line are both masked", "args": ["4111111111111111 and 5500000000000004"], "expect": "************1111 and ************0004"}, {"name": "text with no numbers is unchanged", "args": ["nothing here"], "expect": "nothing here"}]},
prompt:`Write <code>function maskCards(text)</code> replacing every run of 13 to 16 digits with asterisks except the last four: <code>4111111111111111</code> becomes <code>************1111</code>. Use <code>replace</code> with the global flag, a <code>{13,16}</code> quantifier, word boundaries, and a <b>function</b> as the replacement so you can compute per match.`,
starter:`function maskCards(text) {\n  return text;\n}`,
solution:`function maskCards(text) {\n  return text.replace(/\\b\\d{13,16}\\b/g, m => "*".repeat(m.length - 4) + m.slice(-4));\n}`,
tests:[{d:'a bounded quantifier limits the length',re:'\\{13,\\s*16\\}'},{d:'the replacement runs for every match',re:'["\x27/]g'},{d:'a function computes each replacement',re:'=>|function'},{d:'the last four characters are kept',re:'slice\\s*\\(\\s*-4|substr'}],
behavior:`Four cases run. The short-number case is why the bounded quantifier matters: \\d+ would mask order ids, timestamps and quantities too, and a redactor that destroys ordinary data gets turned off. The two-number case checks the global flag; without it only the first card is masked, which is the worst possible outcome for a redactor because the output looks redacted. A replacement function receives the matched text, which is what lets the mask length depend on the match.`,
hints:['{13,16} is "between 13 and 16 of the preceding token".','\\b stops the pattern matching a slice of a longer digit run.','replace accepts a function: (match) => the string to substitute.']}]}
]});
