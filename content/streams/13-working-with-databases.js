STREAMS.push({icon:'🗄️',title:'Working with Databases',blurb:'From your first CREATE TABLE and SELECT to JDBC, transactions, Flyway migrations, and query performance.',lessons:[
{id:'db0',title:'Databases 101: tables, keys & constraints',body:`
<p>Before SQL tricks, the mental model. A <b>relational database</b> stores data in <b>tables</b>: named columns with fixed types, one <b>row</b> per fact. The engine (we use <b>PostgreSQL</b> throughout) enforces your rules so bad data physically cannot enter — that enforcement is what separates a database from a spreadsheet.</p>
<ul>
<li><b>Primary key (PK)</b> — the column that uniquely identifies each row. The modern default: <code>id BIGSERIAL PRIMARY KEY</code> (an auto-incrementing 64-bit int). Every table gets one; no exceptions in this dojo.</li>
<li><b>Foreign key (FK)</b> — a column pointing at another table's PK: <code>author_id BIGINT REFERENCES authors(id)</code>. The engine rejects orphans: no book can claim author 999 if author 999 doesn't exist. Relationships are data, not conventions.</li>
<li><b>Column types</b> you'll actually use: <code>TEXT</code> / <code>VARCHAR(n)</code>, <code>BIGINT</code> / <code>INT</code>, <code>NUMERIC(12,2)</code> for money (never float — the BigDecimal lesson's argument, in SQL), <code>BOOLEAN</code>, <code>DATE</code> / <code>TIMESTAMPTZ</code>.</li>
<li><b>Constraints</b> — declared rules: <code>NOT NULL</code> (value required), <code>UNIQUE</code> (no duplicates), <code>CHECK (price_cents &gt;= 0)</code> (arbitrary predicates), <code>DEFAULT now()</code> (fill when omitted).</li>
</ul>
<div class="codeSample">CREATE TABLE authors (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  born_on    DATE
);
-- one author, many books: the FK lives on the MANY side
CREATE TABLE books (
  id          BIGSERIAL PRIMARY KEY,
  author_id   BIGINT NOT NULL REFERENCES authors(id),
  title       TEXT NOT NULL,
  price_cents BIGINT NOT NULL CHECK (price_cents &gt;= 0),
  published   DATE
);</div>
<p>Read a schema like a sentence: "a book <i>must</i> have an existing author, a title, and a non-negative price; an email can appear once." Design tip that prevents years of pain: model the <b>one-to-many</b> direction consciously — the FK always lives on the many side (many books → one author).</p>`,
docs:[['PostgreSQL tutorial — tables','https://www.postgresql.org/docs/current/ddl-basics.html'],['Constraints','https://www.postgresql.org/docs/current/ddl-constraints.html'],['Data types','https://www.postgresql.org/docs/current/datatype.html']],
ex:{title:'Design a schema',lang:'sql',
prompt:`Write two CREATE TABLE statements for a tiny store: (1) <code>customers</code> — <code>id BIGSERIAL PRIMARY KEY</code>, <code>email TEXT NOT NULL UNIQUE</code>, <code>name TEXT NOT NULL</code>, <code>created_at TIMESTAMPTZ NOT NULL DEFAULT now()</code>. (2) <code>orders</code> — <code>id BIGSERIAL PRIMARY KEY</code>, a <code>customer_id</code> column that is <code>BIGINT NOT NULL</code> and <b>REFERENCES customers(id)</b>, <code>total_cents BIGINT NOT NULL</code> with a <b>CHECK that it is &gt;= 0</b>, and <code>placed_on DATE NOT NULL</code>.`,
starter:`-- customers


-- orders

`,
solution:`-- customers
CREATE TABLE customers (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- orders
CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
  placed_on   DATE NOT NULL
);
`,
tests:[{d:'customers: BIGSERIAL primary key',re:'create\\s+table\\s+customers[\\s\\S]*?id\\s+bigserial\\s+primary\\s+key',flags:'is'},{d:'email is NOT NULL and UNIQUE',re:'email\\s+text\\s+not\\s+null\\s+unique',flags:'is'},{d:'created_at defaults to now()',re:'created_at\\s+timestamptz\\s+not\\s+null\\s+default\\s+now\\s*\\(\\s*\\)',flags:'is'},{d:'orders.customer_id is a NOT NULL foreign key',re:'customer_id\\s+bigint\\s+not\\s+null\\s+references\\s+customers\\s*\\(\\s*id\\s*\\)',flags:'is'},{d:'CHECK keeps totals non-negative',re:'check\\s*\\(\\s*total_cents\\s*>=\\s*0\\s*\\)',flags:'is'},{d:'placed_on required',re:'placed_on\\s+date\\s+not\\s+null',flags:'is'}],
behavior:`1. INSERT INTO customers(email, name) VALUES ('a@x.dev', 'Ada') succeeds — id and created_at fill themselves. 2. A second customer with email 'a@x.dev' is rejected (UNIQUE). 3. An order for customer_id 999 with no such customer is rejected (FK). 4. An order with total_cents -5 is rejected (CHECK). 5. The FK sits on orders — the many side of one-customer-many-orders.`,
hints:['Column definitions read: name TYPE constraint constraint... — order of constraints on one line is flexible.','The FK is inline: customer_id BIGINT NOT NULL REFERENCES customers(id) — no separate CONSTRAINT clause needed at this scale.','DEFAULT now() means the INSERT simply omits the column — the engine stamps it.']}},

{id:'db0b',title:'SQL basics: reading with SELECT',body:`
<p>SELECT is 80% of the SQL you will ever run. The clause order is fixed, and the engine applies them in a logical order worth memorizing: <code>FROM</code> → <code>WHERE</code> → <code>SELECT</code> list → <code>ORDER BY</code> → <code>LIMIT</code>.</p>
<div class="codeSample">SELECT title, price_cents          -- which columns (or * for all — fine in psql, sloppy in code)
FROM books
WHERE price_cents &lt; 2000           -- rows must pass the predicate
  AND published IS NOT NULL        -- NULL needs IS / IS NOT — never  = NULL
ORDER BY price_cents DESC, title   -- sort key, then tiebreaker; DESC per key
LIMIT 10 OFFSET 20;                -- page 3 of 10-per-page</div>
<p>The WHERE toolbox: <code>=</code> <code>&lt;&gt;</code> <code>&lt;</code> <code>&gt;=</code>; <code>IN ('a','b')</code>; <code>BETWEEN 10 AND 20</code> (inclusive); <code>LIKE 'Effective%'</code> (<code>%</code> any run, <code>_</code> one char; <code>ILIKE</code> = case-insensitive in Postgres); <code>IS NULL</code>. Strings take <b>single quotes</b> in SQL — double quotes mean identifiers.</p>
<p>Two more first-week essentials:</p>
<ul>
<li><b>DISTINCT</b> — <code>SELECT DISTINCT author_id FROM books</code>: the unique set, not every row.</li>
<li><b>Aggregates</b> — <code>COUNT(*)</code>, <code>SUM(x)</code>, <code>AVG(x)</code>, <code>MIN</code>/<code>MAX</code> collapse rows into one answer: <code>SELECT COUNT(*), AVG(price_cents) FROM books WHERE author_id = 3;</code> — grouping per author arrives with GROUP BY in the next lesson's queries.</li>
</ul>
<p>Why <code>NULL = NULL</code> is not true: NULL means <i>unknown</i>, and "is unknown equal to unknown?" is itself unknown — three-valued logic. WHERE keeps only rows where the predicate is <i>true</i>, so unknowns silently drop. When a query "loses" rows, check for a NULL comparison first.</p>`,
docs:[['PostgreSQL tutorial — queries','https://www.postgresql.org/docs/current/tutorial-select.html'],['SELECT reference','https://www.postgresql.org/docs/current/sql-select.html'],['Pattern matching (LIKE)','https://www.postgresql.org/docs/current/functions-matching.html']],
ex:{title:'SELECT drill',lang:'sql',
prompt:`Against the <code>books(id, author_id, title, price_cents, published)</code> table, one query under each numbered comment: (1) every column of all books; (2) only <code>title</code> of books cheaper than 1500 cents, sorted by title <b>ascending</b>; (3) title and price of the 5 most expensive books (<code>ORDER BY ... DESC LIMIT</code>); (4) all books whose title starts with <code>Java</code> (LIKE); (5) books that have <b>no</b> published date (NULL check); (6) the number of books and the average price, in one query (COUNT + AVG).`,
starter:`-- 1)

-- 2)

-- 3)

-- 4)

-- 5)

-- 6)
`,
solution:`-- 1)
SELECT * FROM books;

-- 2)
SELECT title FROM books WHERE price_cents < 1500 ORDER BY title ASC;

-- 3)
SELECT title, price_cents FROM books ORDER BY price_cents DESC LIMIT 5;

-- 4)
SELECT * FROM books WHERE title LIKE 'Java%';

-- 5)
SELECT * FROM books WHERE published IS NULL;

-- 6)
SELECT COUNT(*), AVG(price_cents) FROM books;
`,
tests:[{d:'Q1: select every column',re:'1\\)[\\s\\S]*?select\\s+\\*\\s+from\\s+books\\s*;',flags:'is'},{d:'Q2: filtered + sorted ascending',re:'2\\)[\\s\\S]*?select\\s+title\\s+from\\s+books\\s+where\\s+price_cents\\s*<\\s*1500\\s+order\\s+by\\s+title',flags:'is'},{d:'Q3: top-5 by price descending',re:'3\\)[\\s\\S]*?order\\s+by\\s+price_cents\\s+desc\\s+limit\\s+5',flags:'is'},{d:'Q4: LIKE prefix pattern in single quotes',re:'4\\)[\\s\\S]*?like\\s+\\x27Java%\\x27',flags:'is'},{d:'Q5: IS NULL, not = NULL',re:'5\\)[\\s\\S]*?published\\s+is\\s+null',flags:'is'},{d:'= NULL never appears',re:'=\\s*null',not:true,flags:'is'},{d:'Q6: COUNT and AVG together',re:'6\\)[\\s\\S]*?count\\s*\\(\\s*\\*\\s*\\)\\s*,\\s*avg\\s*\\(\\s*price_cents\\s*\\)',flags:'is'}],
behavior:`1. Q1 returns every row, every column. 2. Q2 returns one column, cheap books first alphabetically. 3. Q3 returns exactly 5 rows, priciest first. 4. Q4 matches 'Java Concurrency' but not 'Effective Java' — % only trails. 5. Q5 finds the unpublished books; a = NULL version would return zero rows silently. 6. Q6 returns exactly ONE row with two numbers — aggregates collapse the table.`,
hints:['Clause order is fixed: SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT — the engine will not accept WHERE after ORDER BY.','SQL string literals use single quotes: LIKE \'Java%\'.','NULL checks are IS NULL / IS NOT NULL — the = operator returns unknown, and WHERE drops unknowns.']}},

{id:'db0c',title:'SQL basics: writing data',body:`
<p>Four verbs change data. Two of them can destroy a table in one line — respect the WHERE clause.</p>
<div class="codeSample">-- INSERT: single, multi-row, and read-back
INSERT INTO books (author_id, title, price_cents) VALUES (1, 'Effective Java', 4500);
INSERT INTO books (author_id, title, price_cents) VALUES
  (1, 'Java Puzzlers', 3200),
  (2, 'Clean Code',    3900);
INSERT INTO books (author_id, title, price_cents)
  VALUES (2, 'Refactoring', 4700)
  RETURNING id;                      -- Postgres: get the generated id back — no second query

-- UPDATE: SET what, WHERE which
UPDATE books SET price_cents = 3990 WHERE id = 7;
UPDATE books SET price_cents = price_cents * 0.9   -- expressions read the OLD value
  WHERE author_id = 1;

-- DELETE
DELETE FROM books WHERE id = 7;</div>
<p><b>The missing-WHERE catastrophe</b>: <code>UPDATE books SET price_cents = 0</code> — no WHERE — updates <b>every row</b>, instantly, no confirmation. Same for DELETE. Professional habits: write the WHERE first; run a <code>SELECT COUNT(*)</code> with the same WHERE to preview the blast radius; do risky writes inside <code>BEGIN; ... ROLLBACK/COMMIT;</code> so you can look before it sticks (transactions get their own lesson soon).</p>
<p>Omitted columns take their <code>DEFAULT</code> (so <code>id</code> and <code>created_at</code> fill themselves) or NULL if none — and a <code>NOT NULL</code> column without a default makes the INSERT fail, which is the schema doing its job. <code>RETURNING</code> works on UPDATE and DELETE too: change-and-see in one round trip.</p>`,
docs:[['INSERT','https://www.postgresql.org/docs/current/sql-insert.html'],['UPDATE','https://www.postgresql.org/docs/current/sql-update.html'],['DELETE','https://www.postgresql.org/docs/current/sql-delete.html']],
ex:{title:'Write-path drill',lang:'sql',
prompt:`Against <code>books(id, author_id, title, price_cents, published)</code>, one statement per numbered comment: (1) insert a book: author 1, title <code>Effective Java</code>, price 4500 — naming the three columns; (2) one INSERT adding <b>two</b> books for author 2: <code>Clean Code</code> at 3900 and <code>Refactoring</code> at 4700 (multi-row VALUES); (3) insert author 3's <code>DDIA</code> at 5200 and <b>return the generated id</b> (RETURNING); (4) set the price of book id 7 to 3990; (5) apply a 10% discount to <b>every book by author 1</b> (price = price * 0.9, WHERE required); (6) delete all books priced 0.`,
starter:`-- 1)

-- 2)

-- 3)

-- 4)

-- 5)

-- 6)
`,
solution:`-- 1)
INSERT INTO books (author_id, title, price_cents) VALUES (1, 'Effective Java', 4500);

-- 2)
INSERT INTO books (author_id, title, price_cents) VALUES
  (2, 'Clean Code', 3900),
  (2, 'Refactoring', 4700);

-- 3)
INSERT INTO books (author_id, title, price_cents) VALUES (3, 'DDIA', 5200) RETURNING id;

-- 4)
UPDATE books SET price_cents = 3990 WHERE id = 7;

-- 5)
UPDATE books SET price_cents = price_cents * 0.9 WHERE author_id = 1;

-- 6)
DELETE FROM books WHERE price_cents = 0;
`,
tests:[{d:'Q1: INSERT names its columns',re:'1\\)[\\s\\S]*?insert\\s+into\\s+books\\s*\\(\\s*author_id\\s*,\\s*title\\s*,\\s*price_cents\\s*\\)\\s*values',flags:'is'},{d:'Q2: one statement, two value tuples',re:'2\\)[\\s\\S]*?values[\\s\\S]*?\\(\\s*2\\s*,[\\s\\S]*?\\)\\s*,\\s*\\(\\s*2\\s*,',flags:'is'},{d:'Q3: RETURNING id fetches the generated key',re:'3\\)[\\s\\S]*?insert[\\s\\S]*?returning\\s+id',flags:'is'},{d:'Q4: targeted update by primary key',re:'4\\)[\\s\\S]*?update\\s+books\\s+set\\s+price_cents\\s*=\\s*3990\\s+where\\s+id\\s*=\\s*7',flags:'is'},{d:'Q5: expression update reads the old value, scoped by WHERE',re:'5\\)[\\s\\S]*?set\\s+price_cents\\s*=\\s*price_cents\\s*\\*\\s*0?\\.9\\s+where\\s+author_id\\s*=\\s*1',flags:'is'},{d:'Q6: DELETE is scoped',re:'6\\)[\\s\\S]*?delete\\s+from\\s+books\\s+where\\s+price_cents\\s*=\\s*0',flags:'is'},{d:'Every UPDATE and DELETE carries a WHERE',re:'(update|delete)(?![\\s\\S]*?where)[^;]*;',not:true,flags:'i'}],
behavior:`1. Q1 inserts one row; id, published fill from defaults (serial, NULL). 2. Q2 is ONE statement inserting two rows atomically — both or neither. 3. Q3 returns the new id in the same round trip Java would otherwise need a second query for. 4-5. Both UPDATEs touch exactly the rows their WHERE names; Q5 reads each row's old price in the expression. 6. The DELETE removes only zero-priced rows. 7. No UPDATE or DELETE in this exercise lacks a WHERE — the habit being drilled.`,
hints:['Multi-row insert: VALUES (..., ...), (..., ...) — commas between parenthesized tuples.','RETURNING id goes after the closing VALUES parenthesis, before the semicolon.','Q5 needs no SELECT first: SET price_cents = price_cents * 0.9 evaluates per matched row.']}},


{id:'db1',title:'SQL essentials',body:`
<p>Every persistence framework compiles down to SQL — you cannot debug what you cannot read. The core moves:</p>
<div class="codeSample">SELECT id, owner, balance_cents
FROM   accounts
WHERE  balance_cents &gt; 10000
ORDER  BY balance_cents DESC
LIMIT  10;

SELECT a.owner, SUM(t.amount_cents) AS total
FROM   accounts a
JOIN   transactions t ON t.account_id = a.id     -- INNER: only matches
WHERE  t.created_at &gt;= '2026-01-01'
GROUP  BY a.owner
HAVING SUM(t.amount_cents) &gt; 100000;             -- HAVING filters groups

LEFT JOIN  -- keep left rows even with no match (NULLs fill the right side)</div>
<p>Execution order (not writing order!): FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. WHERE filters rows before grouping; HAVING filters after. If you remember one thing: JOIN + GROUP BY answers 80% of real reporting questions.</p>`,
docs:[['SQL tutorial — PostgreSQL docs','https://www.postgresql.org/docs/current/tutorial-sql.html'],['SQL joins visualized — Atlassian','https://www.atlassian.com/data/sql/sql-join-types-explained-visually']],
ex:{title:'Write the queries',lang:'sql',
prompt:`Given tables <code>users(id, name)</code> and <code>orders(id, user_id, total_cents, created_at)</code>, write: (1) the 5 most recent orders (all columns, newest first), (2) each user's name and their order count — <b>including users with zero orders</b> (which JOIN?) — grouped and aliased <code>order_count</code>, (3) names of users whose lifetime total exceeds 50000 cents (JOIN + GROUP BY + HAVING).`,
starter:`-- 1)


-- 2)


-- 3)
`,
tests:[{d:'ORDER BY created_at DESC LIMIT 5',re:'ORDER\\s+BY\\s+created_at\\s+DESC[\\s\\S]*?LIMIT\\s+5','flags':'is'},{d:'LEFT JOIN to keep zero-order users',re:'LEFT\\s+JOIN','flags':'is'},{d:'COUNT aliased as order_count',re:'COUNT\\s*\\([^)]*\\)\\s+AS\\s+order_count','flags':'is'},{d:'GROUP BY present',re:'GROUP\\s+BY','flags':'is'},{d:'HAVING with SUM over 50000',re:'HAVING\\s+SUM\\s*\\(\\s*total_cents\\s*\\)\\s*>\\s*50000','flags':'is'}],
behavior:`1. (1) SELECT * FROM orders ORDER BY created_at DESC LIMIT 5. 2. (2) LEFT JOIN from users to orders (COUNT(o.id), not COUNT(*), so zero-order users show 0), GROUP BY the user. 3. (3) INNER JOIN + GROUP BY + HAVING SUM(total_cents) > 50000. 4. HAVING (not WHERE) because the condition is on an aggregate.`,
hints:['Recent-N pattern: ORDER BY the timestamp DESC, then LIMIT.','"Including zero" is the LEFT JOIN tell — and COUNT(o.id) counts only matched rows, so unmatched users get 0.','Aggregate conditions cannot live in WHERE — that is exactly what HAVING is for.'],
solution:`-- 1)
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 2)
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.name;

-- 3)
SELECT u.name
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.name
HAVING SUM(total_cents) > 50000;`}},
{id:'db1a',title:'Every JOIN type, in plain English',body:`
<p>A JOIN stitches rows from two tables together using a matching rule (the <code>ON</code> condition). The only thing that changes between join types is <b>which unmatched rows you keep</b>. Picture two tables: <code>employees(id, name, dept_id, manager_id)</code> and <code>departments(id, name)</code>.</p>
<div class="codeSample">-- INNER JOIN — only rows that match on BOTH sides (the overlap)
SELECT e.name, d.name AS dept
FROM employees e
JOIN departments d ON d.id = e.dept_id;      -- "JOIN" alone means INNER

-- LEFT [OUTER] JOIN — every LEFT row; right side is NULL when no match
SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON d.id = e.dept_id; -- keeps employees with no dept

-- RIGHT [OUTER] JOIN — mirror image: every RIGHT row, left may be NULL
-- FULL [OUTER] JOIN — every row from BOTH; NULLs fill whichever side is missing
-- CROSS JOIN — every combination (Cartesian product): rows_left x rows_right
-- SELF JOIN — a table joined to itself, using two aliases</div>
<p>Simple way to remember them:</p>
<ul>
<li><b>INNER</b> = "matches only." Rows that exist in both tables.</li>
<li><b>LEFT</b> = "keep everything on the left." Great for "all X, and their Y if any."</li>
<li><b>RIGHT</b> = LEFT flipped. Most people just reorder the tables and use LEFT.</li>
<li><b>FULL OUTER</b> = "keep everything, both sides." Nothing is dropped.</li>
<li><b>CROSS</b> = "every pairing." No ON clause. Use on purpose (e.g. all sizes x all colors); by accident it explodes row counts.</li>
<li><b>SELF</b> = same table twice — an employee row joined to its manager row.</li>
</ul>
<p><b>Semi-join and anti-join</b> answer "does a match exist?" without duplicating rows. A <b>semi-join</b> keeps left rows that <i>have</i> a match — written with <code>EXISTS</code> or <code>IN</code>. An <b>anti-join</b> keeps left rows with <i>no</i> match — written with <code>NOT EXISTS</code>, or the classic <code>LEFT JOIN ... WHERE right.id IS NULL</code> ("find the orphans").</p>
<p>One caution: <b>NATURAL JOIN</b> auto-matches every column that shares a name. It reads short but breaks silently when someone adds a same-named column, so most teams avoid it and write the <code>ON</code> explicitly.</p>`,
docs:[['JOINs visualized — Atlassian','https://www.atlassian.com/data/sql/sql-join-types-explained-visually'],['SELECT / JOIN reference','https://www.postgresql.org/docs/current/sql-select.html'],['EXISTS & subqueries','https://www.postgresql.org/docs/current/functions-subquery.html']],
ex:{title:'Join drill',lang:'sql',
prompt:`Tables: <code>employees(id, name, dept_id, manager_id)</code> and <code>departments(id, name)</code>. One query per numbered comment: (1) each employee with their department name, <b>matches only</b> (INNER); (2) <b>every</b> employee including those with no department (LEFT JOIN); (3) departments that have <b>no</b> employees — the anti-join pattern (LEFT JOIN then WHERE the employee id IS NULL); (4) every employee paired with every department (CROSS JOIN); (5) each employee alongside their manager's name — a SELF JOIN of employees to itself on <code>manager_id</code>; (6) everything from both tables, keeping unmatched rows on either side (FULL OUTER JOIN).`,
starter:`-- 1) INNER

-- 2) LEFT

-- 3) anti-join (departments with no employees)

-- 4) CROSS

-- 5) SELF (employee + manager)

-- 6) FULL OUTER
`,
solution:`-- 1) INNER
SELECT e.name, d.name AS dept
FROM employees e
JOIN departments d ON d.id = e.dept_id;

-- 2) LEFT
SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON d.id = e.dept_id;

-- 3) anti-join (departments with no employees)
SELECT d.name
FROM departments d
LEFT JOIN employees e ON e.dept_id = d.id
WHERE e.id IS NULL;

-- 4) CROSS
SELECT e.name, d.name
FROM employees e
CROSS JOIN departments d;

-- 5) SELF (employee + manager)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;

-- 6) FULL OUTER
SELECT e.name, d.name
FROM employees e
FULL OUTER JOIN departments d ON d.id = e.dept_id;
`,
tests:[{d:'Q1: plain INNER JOIN employees to departments',re:'1\\)[\\s\\S]*?from\\s+employees\\s+e\\s+join\\s+departments',flags:'is'},{d:'Q2: LEFT JOIN keeps every employee',re:'2\\)[\\s\\S]*?left\\s+join\\s+departments',flags:'is'},{d:'Q3: anti-join = LEFT JOIN + IS NULL',re:'3\\)[\\s\\S]*?left\\s+join\\s+employees[\\s\\S]*?where\\s+e\\.id\\s+is\\s+null',flags:'is'},{d:'Q4: CROSS JOIN',re:'4\\)[\\s\\S]*?cross\\s+join\\s+departments',flags:'is'},{d:'Q5: SELF JOIN on manager_id',re:'5\\)[\\s\\S]*?join\\s+employees\\s+m\\s+on\\s+m\\.id\\s*=\\s*e\\.manager_id',flags:'is'},{d:'Q6: FULL OUTER JOIN',re:'6\\)[\\s\\S]*?full\\s+outer\\s+join\\s+departments',flags:'is'}],
behavior:`1. Q1 drops employees with no department and departments with no employees. 2. Q2 lists all employees; dept is NULL for the unassigned. 3. Q3 returns only empty departments (the LEFT JOIN leaves employee columns NULL, and IS NULL keeps exactly those). 4. Q4 returns rows_employees x rows_departments pairings. 5. Q5 joins employees to employees; a manager-less employee shows NULL manager (LEFT). 6. Q6 keeps unmatched rows from both sides.`,
hints:['INNER JOIN keeps only rows that match on both sides; LEFT JOIN keeps every left row and fills NULLs where the right has no match.','The anti-join pattern is LEFT JOIN then WHERE right.id IS NULL, which keeps only the left rows that had no match.','A SELF JOIN lists the same table twice with two aliases (e and m) joined on manager_id.']}},

{id:'db1b',title:'The SQL command map: every command by category',body:`
<p>SQL commands fall into four families. Knowing which family a command belongs to tells you what it does and how careful to be with it.</p>
<div class="codeSample">-- DDL  (Data Definition) — define/change STRUCTURE
CREATE TABLE tags (id SERIAL PRIMARY KEY, name TEXT NOT NULL);
ALTER TABLE tags ADD COLUMN slug TEXT;   -- add/drop/modify columns, keys, indexes
DROP TABLE tags;                          -- delete the table and all its data
TRUNCATE tags;                            -- empty ALL rows fast, keep the table
-- also: CREATE INDEX, CREATE VIEW, RENAME

-- DML  (Data Manipulation) — read/change ROWS
SELECT * FROM tags;                       -- read
INSERT INTO tags (name) VALUES ('java');  -- add rows
UPDATE tags SET slug = 'jvm' WHERE id = 1;-- change rows (WHERE!)
DELETE FROM tags WHERE id = 1;            -- remove rows (WHERE!)

-- TCL  (Transaction Control) — group changes as all-or-nothing
BEGIN;  UPDATE tags SET slug='x' WHERE id=1;  COMMIT;   -- or ROLLBACK
SAVEPOINT sp1;   -- a checkpoint you can ROLLBACK TO

-- DCL  (Data Control) — permissions
GRANT SELECT ON tags TO reader;   -- give a privilege
REVOKE SELECT ON tags FROM reader;-- take it back</div>
<p>Plain-terms cheat sheet: <b>DDL</b> = the building (create/alter/drop the tables). <b>DML</b> = the furniture (put rows in, move them, take them out). <b>TCL</b> = the "undo/commit" bracket around your DML. <b>DCL</b> = the keys to the doors (who may do what).</p>
<p>Two safety notes worth burning in: <code>TRUNCATE</code> and <code>DROP</code> are DDL and in many databases cannot be rolled back the way DML can — treat them like a shredder. And every <code>UPDATE</code>/<code>DELETE</code> needs a <code>WHERE</code> unless you truly mean "all rows."</p>
<p>Reading queries, you also lean on these <b>clauses</b> (parts of a SELECT, not standalone commands): <code>WHERE</code> (filter rows) → <code>GROUP BY</code> (bucket rows) → <code>HAVING</code> (filter buckets) → <code>ORDER BY</code> (sort) → <code>LIMIT/OFFSET</code> (paginate), plus <code>DISTINCT</code>, <code>JOIN</code>, and the set operators <code>UNION</code> / <code>INTERSECT</code> / <code>EXCEPT</code> that stack whole result sets.</p>`,
docs:[['SQL commands — PostgreSQL','https://www.postgresql.org/docs/current/sql-commands.html'],['GRANT / privileges','https://www.postgresql.org/docs/current/sql-grant.html'],['Transactions','https://www.postgresql.org/docs/current/tutorial-transactions.html']],
ex:{title:'One command from each family',lang:'sql',
prompt:`One statement per numbered comment. (1) <b>CREATE</b> a table <code>tags</code> with <code>id SERIAL PRIMARY KEY</code> and <code>name TEXT NOT NULL</code>; (2) <b>ALTER</b> it to add a column <code>slug TEXT</code>; (3) <b>INSERT</b> a row (name and slug both <code>'java'</code>); (4) <b>GRANT</b> the <code>SELECT</code> privilege on <code>tags</code> to role <code>reader</code>; (5) wrap an <code>UPDATE</code> (set slug to <code>'jvm'</code> where name is <code>'java'</code>) inside a transaction using <code>BEGIN;</code> and <code>COMMIT;</code>; (6) <b>TRUNCATE</b> the table (empty it, keep it); (7) <b>DROP</b> the table.`,
starter:`-- 1) CREATE (DDL)

-- 2) ALTER (DDL)

-- 3) INSERT (DML)

-- 4) GRANT (DCL)

-- 5) transaction (TCL) around an UPDATE

-- 6) TRUNCATE (DDL)

-- 7) DROP (DDL)
`,
solution:`-- 1) CREATE (DDL)
CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- 2) ALTER (DDL)
ALTER TABLE tags ADD COLUMN slug TEXT;

-- 3) INSERT (DML)
INSERT INTO tags (name, slug) VALUES ('java', 'java');

-- 4) GRANT (DCL)
GRANT SELECT ON tags TO reader;

-- 5) transaction (TCL) around an UPDATE
BEGIN;
UPDATE tags SET slug = 'jvm' WHERE name = 'java';
COMMIT;

-- 6) TRUNCATE (DDL)
TRUNCATE tags;

-- 7) DROP (DDL)
DROP TABLE tags;
`,
tests:[{d:'Q1: CREATE TABLE tags (DDL)',re:'1\\)[\\s\\S]*?create\\s+table\\s+tags',flags:'is'},{d:'Q2: ALTER TABLE ADD COLUMN slug',re:'2\\)[\\s\\S]*?alter\\s+table\\s+tags\\s+add\\s+column\\s+slug',flags:'is'},{d:'Q3: INSERT INTO tags (DML)',re:'3\\)[\\s\\S]*?insert\\s+into\\s+tags',flags:'is'},{d:'Q4: GRANT SELECT ... TO reader (DCL)',re:'4\\)[\\s\\S]*?grant\\s+select\\s+on\\s+tags\\s+to\\s+reader',flags:'is'},{d:'Q5: BEGIN ... UPDATE ... COMMIT (TCL)',re:'5\\)[\\s\\S]*?begin\\s*;[\\s\\S]*?update\\s+tags[\\s\\S]*?commit\\s*;',flags:'is'},{d:'Q6: TRUNCATE tags (DDL)',re:'6\\)[\\s\\S]*?truncate\\s+tags',flags:'is'},{d:'Q7: DROP TABLE tags (DDL)',re:'7\\)[\\s\\S]*?drop\\s+table\\s+tags',flags:'is'}],
behavior:`1. Q1 defines the structure (DDL). 2. Q2 changes the structure (DDL). 3. Q3 adds a row (DML). 4. Q4 grants a privilege (DCL). 5. Q5 groups the write so it commits all-or-nothing (TCL). 6. Q6 empties the table fast but leaves it defined. 7. Q7 removes the table entirely. One command from each family, in order.`,
hints:['DDL defines structure: CREATE, ALTER, DROP, TRUNCATE. DML changes rows: INSERT, UPDATE, DELETE, SELECT.','TCL groups changes: wrap the UPDATE in BEGIN and COMMIT so it applies all-or-nothing.','DCL controls access: GRANT gives a privilege, REVOKE takes it back.']}},

{id:'db1c',title:'Writing complex queries: CASE, the 1/0 tricks, CTEs & windows',body:`
<p>Real reporting queries are built from a handful of power tools. The most useful — and most puzzling when you first meet it — is turning a <b>condition into a number</b> so you can add conditions up.</p>
<p><b>The 1/0 idiom.</b> SQL cannot <code>SUM</code> a true/false directly, so you convert each row to 1 or 0 with <code>CASE</code>, then sum:</p>
<div class="codeSample">-- count paid vs unpaid in ONE row (conditional aggregation)
SELECT
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
  SUM(CASE WHEN status &lt;&gt; 'paid' THEN 1 ELSE 0 END) AS unpaid
FROM orders;

-- same idea with COUNT: CASE returns NULL for non-matches, COUNT ignores NULL
SELECT COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid FROM orders;</div>
<p>This "conditional aggregation" is how you pivot rows into columns (paid vs unpaid, by month, by region) in a single pass — far cheaper than one query per bucket.</p>
<p><b>WHERE 1=1 and WHERE 1=0.</b> These constant conditions look odd but are idioms. <code>WHERE 1=1</code> is always true — a no-op placeholder so code that builds a query can append <code>AND ...</code> filters without worrying whether it is the first one. <code>WHERE 1=0</code> is always false — it returns <b>no rows</b>, handy for <code>CREATE TABLE copy AS SELECT * FROM orders WHERE 1=0</code> to clone just the structure, or as a safe stub while you build a statement.</p>
<div class="codeSample">SELECT * FROM orders
WHERE 1 = 1            -- always-true anchor
  AND status = 'paid'  -- filters appended freely
  AND amount_cents &gt; 1000;</div>
<p><b>Subqueries</b> nest one query in another: a scalar subquery returns one value, <code>IN (SELECT ...)</code> / <code>EXISTS (SELECT ...)</code> test membership, and a subquery in <code>FROM</code> becomes a derived table. <b>CTEs</b> (<code>WITH name AS (...)</code>) are the readable alternative — name a result once, then use it like a table:</p>
<div class="codeSample">WITH totals AS (
  SELECT user_id, SUM(amount_cents) AS spent
  FROM orders
  GROUP BY user_id
)
SELECT user_id, spent FROM totals WHERE spent &gt; 100000;</div>
<p><b>Window functions</b> compute across a set of rows <i>without</i> collapsing them (unlike GROUP BY). <code>ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)</code> numbers each user's orders newest-first; swap in <code>SUM(...) OVER (...)</code> for running totals, or <code>RANK()</code> / <code>LAG()</code> for rankings and row-to-row comparisons.</p>
<p>Two more everyday helpers: <code>COALESCE(x, 0)</code> substitutes a value for NULL, and <code>NULLIF(count, 0)</code> turns 0 into NULL so a division becomes NULL instead of a divide-by-zero error — the safe-average trick.</p>`,
docs:[['CASE expression','https://www.postgresql.org/docs/current/functions-conditional.html'],['WITH / CTEs','https://www.postgresql.org/docs/current/queries-with.html'],['Window functions','https://www.postgresql.org/docs/current/tutorial-window.html']],
ex:{title:'Complex-query drill',lang:'sql',
prompt:`Table <code>orders(id, user_id, status, amount_cents, created_at)</code>. One query per numbered comment: (1) in one row, count paid and unpaid orders using <code>SUM(CASE WHEN ... THEN 1 ELSE 0 END)</code> aliased <code>paid</code> and <code>unpaid</code>; (2) count only paid orders using the <code>COUNT(CASE WHEN status = 'paid' THEN 1 END)</code> form; (3) select paid orders using the <code>WHERE 1 = 1 AND ...</code> dynamic-filter idiom; (4) a CTE named <code>totals</code> that sums <code>amount_cents</code> per <code>user_id</code>, then select the users whose <code>spent</code> exceeds 100000; (5) number each user's orders newest-first with <code>ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)</code> aliased <code>rn</code>; (6) compute a safe average with <code>SUM(amount_cents) / NULLIF(COUNT(*), 0)</code>.`,
starter:`-- 1) conditional aggregation (paid vs unpaid)

-- 2) COUNT(CASE ...) form

-- 3) WHERE 1 = 1 idiom

-- 4) CTE: users who spent > 100000

-- 5) ROW_NUMBER window

-- 6) safe average with NULLIF
`,
solution:`-- 1) conditional aggregation (paid vs unpaid)
SELECT
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
  SUM(CASE WHEN status <> 'paid' THEN 1 ELSE 0 END) AS unpaid
FROM orders;

-- 2) COUNT(CASE ...) form
SELECT COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid
FROM orders;

-- 3) WHERE 1 = 1 idiom
SELECT * FROM orders
WHERE 1 = 1
  AND status = 'paid';

-- 4) CTE: users who spent > 100000
WITH totals AS (
  SELECT user_id, SUM(amount_cents) AS spent
  FROM orders
  GROUP BY user_id
)
SELECT user_id, spent
FROM totals
WHERE spent > 100000;

-- 5) ROW_NUMBER window
SELECT id, user_id,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM orders;

-- 6) safe average with NULLIF
SELECT SUM(amount_cents) / NULLIF(COUNT(*), 0) AS avg_cents
FROM orders;
`,
tests:[{d:'Q1: SUM(CASE WHEN ... THEN 1 ELSE 0 END)',re:'1\\)[\\s\\S]*?sum\\s*\\(\\s*case\\s+when[\\s\\S]*?then\\s+1\\s+else\\s+0\\s+end\\s*\\)',flags:'is'},{d:'Q2: COUNT(CASE WHEN ... THEN 1 END)',re:'2\\)[\\s\\S]*?count\\s*\\(\\s*case\\s+when[\\s\\S]*?then\\s+1[\\s\\S]*?end\\s*\\)',flags:'is'},{d:'Q3: WHERE 1 = 1 idiom',re:'3\\)[\\s\\S]*?where\\s+1\\s*=\\s*1',flags:'is'},{d:'Q4: CTE named totals',re:'4\\)[\\s\\S]*?with\\s+totals\\s+as\\s*\\(',flags:'is'},{d:'Q5: ROW_NUMBER() OVER (PARTITION BY ...)',re:'5\\)[\\s\\S]*?row_number\\s*\\(\\s*\\)\\s+over\\s*\\(\\s*partition\\s+by',flags:'is'},{d:'Q6: NULLIF(COUNT(*), 0) guards division',re:'6\\)[\\s\\S]*?nullif\\s*\\(\\s*count\\s*\\(\\s*\\*\\s*\\)\\s*,\\s*0\\s*\\)',flags:'is'}],
behavior:`1. Q1 returns one row, two counts, in a single scan. 2. Q2 counts paid only, relying on CASE returning NULL (which COUNT skips) for the rest. 3. Q3 returns paid orders; the 1=1 anchor lets filters be appended uniformly. 4. Q4 names the per-user totals once, then filters them like a table. 5. Q5 keeps every order row but adds a per-user sequence number, newest first. 6. Q6 divides by NULLIF(count,0) so an empty table yields NULL instead of a divide-by-zero error.`,
hints:['Turn a condition into a number: CASE WHEN cond THEN 1 ELSE 0 END, then SUM to count matches in one pass.','WHERE 1 = 1 is an always-true anchor so every real filter can be appended as AND ...; WHERE 1 = 0 returns no rows.','A CTE is WITH name AS ( ... ) followed by a SELECT that treats name like a table; window functions add OVER (PARTITION BY ... ORDER BY ...).']}},

{id:'dbmig',title:'Migrating data between databases',body:`
<p>A rite of passage in real jobs: move data from an old schema into a new one — during a rewrite, a merger, or when normalizing a messy legacy table. This is <b>ETL</b> in miniature: <b>Extract</b> from the source, <b>Transform</b> to fit the target, <b>Load</b> into the new tables. SQL does it in one statement with <code>INSERT ... SELECT</code>.</p>
<p>Here is the synthetic data you will migrate. A denormalized legacy table with real-world mess — a NULL email, a duplicate, and mixed-case addresses:</p>
<div class="codeSample">legacy_customers                                    customers  (new, empty)
id | full_name    | email_addr        | country     id | name        | email
---+--------------+-------------------+--------     ---+-------------+------------------
 1 | Ada Lovelace | ADA@example.com   | GB          (target schema; email is UNIQUE)
 2 | Bo Diaz      | bo@example.com    | ES
 3 | Cy Young     | NULL              | US          -- rows to migrate: valid emails only,
 4 | Di Ng        | di@example.com    | SG          --   lowercased, de-duplicated
 5 | Bo Diaz      | BO@example.com    | ES          -- (row 5 duplicates row 2 once lowercased)</div>
<p>The migration has three moves: copy with a <b>transform</b> (rename columns, lowercase the email) while <b>filtering</b> out the NULL; make the load <b>idempotent</b> so re-running it will not create duplicates (Postgres <code>INSERT ... ON CONFLICT ... DO NOTHING</code>, using the target's UNIQUE email); and <b>verify</b> the row count. Idempotency matters: real migrations are run more than once (dry run, retry after a failure), and must be safe to repeat.</p>`,
docs:[['INSERT ... SELECT','https://www.postgresql.org/docs/current/sql-insert.html'],['ON CONFLICT (upsert)','https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT'],['Data migration — overview','https://en.wikipedia.org/wiki/Data_migration']],
ex:{title:'Migrate legacy_customers into customers',lang:'sql',
prompt:`Source <code>legacy_customers(id, full_name, email_addr, country)</code>; target <code>customers(id, name, email)</code> where <code>email</code> is UNIQUE. One statement per numbered comment: (1) copy every row that <b>has</b> an email into <code>customers</code>, mapping <code>full_name</code>→<code>name</code> and <code>LOWER(email_addr)</code>→<code>email</code>, skipping NULL emails (<code>INSERT INTO ... SELECT ... FROM legacy_customers WHERE email_addr IS NOT NULL</code>); (2) make it repeatable by de-duplicating on the unique email with <code>ON CONFLICT (email) DO NOTHING</code> — add it to the same insert; (3) verify the result with <code>SELECT COUNT(*) FROM customers</code>.`,
starter:`-- 1) transform-and-copy (rename columns, lowercase email, skip NULLs)
--    ...with 2) ON CONFLICT (email) DO NOTHING on the same statement

-- 3) verify the row count
`,
solution:`-- 1) + 2) transform-copy, idempotent on the unique email
INSERT INTO customers (id, name, email)
SELECT id, full_name, LOWER(email_addr)
FROM legacy_customers
WHERE email_addr IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- 3) verify
SELECT COUNT(*) FROM customers;
`,
tests:[{d:'INSERT ... SELECT from the legacy table',re:'insert\\s+into\\s+customers[\\s\\S]*?select[\\s\\S]*?from\\s+legacy_customers',flags:'is'},{d:'lowercases the email during transform',re:'lower\\s*\\(\\s*email_addr\\s*\\)',flags:'is'},{d:'filters out NULL emails',re:'where\\s+email_addr\\s+is\\s+not\\s+null',flags:'is'},{d:'idempotent load via ON CONFLICT DO NOTHING',re:'on\\s+conflict\\s*\\(\\s*email\\s*\\)\\s+do\\s+nothing',flags:'is'},{d:'verifies with a COUNT',re:'select\\s+count\\s*\\(\\s*\\*\\s*\\)\\s+from\\s+customers',flags:'is'}],
behavior:`After running, customers has 3 rows: Ada (ada@example.com), Bo (bo@example.com), Di (di@example.com). Cy is skipped (NULL email); the second Bo collides on the unique lowercased email and is dropped by ON CONFLICT. Re-running the migration changes nothing — that is idempotency, and it is why the load is safe to repeat.`,
hints:['INSERT INTO target (cols) SELECT expr, ... FROM source WHERE ... copies and transforms in one shot.','Rename by position: the SELECT list lines up with the target column list, and LOWER() transforms the email.','ON CONFLICT (email) DO NOTHING makes the load idempotent so retries and the lowercased duplicate do not error or double-insert.']}},
{id:'db2',title:'JDBC & PreparedStatement',body:`
<p>JDBC is the floor everything stands on (JPA, jOOQ, Spring Data). Three objects: <code>Connection</code> → <code>PreparedStatement</code> → <code>ResultSet</code>, all AutoCloseable:</p>
<div class="codeSample" data-hl>String sql = "SELECT id, owner FROM accounts WHERE owner = ?";

try (Connection con = dataSource.getConnection();
     PreparedStatement ps = con.prepareStatement(sql)) {
    ps.setString(1, ownerName);                 // parameters are 1-indexed
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            long id = rs.getLong("id");
            String owner = rs.getString("owner");
        }
    }
}

// writes: executeUpdate returns affected row count
int rows = ps.executeUpdate();</div>
<p><b>Never concatenate user input into SQL</b> — <code>"WHERE owner = '" + name + "'"</code> is SQL injection, the #1 web vulnerability for two decades. PreparedStatement sends parameters separately from the query text, making injection structurally impossible. In real apps the Connection comes from a pool (HikariCP — Spring Boot's default).</p>`,
docs:[['JDBC basics — Oracle','https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html'],['SQL injection — OWASP','https://owasp.org/www-community/attacks/SQL_Injection']],
ex:{title:'Query safely',
prompt:`Write <code>AccountDao</code> with a constructor-injected <code>javax.sql.DataSource</code> and method <code>java.util.List&lt;String&gt; ownersWithBalanceOver(long cents) throws java.sql.SQLException</code>: SQL <code>SELECT owner FROM accounts WHERE balance_cents &gt; ?</code>, everything in try-with-resources, parameter bound with <code>setLong</code>, results collected from the ResultSet. No string concatenation into SQL anywhere.`,
starter:`import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

public class AccountDao {
    private final DataSource ds;

    public AccountDao(DataSource ds) {
        this.ds = ds;
    }

    List<String> ownersWithBalanceOver(long cents) throws SQLException {
        return null;
    }
}`,
tests:[{d:'Uses a PreparedStatement',re:'prepareStatement\\s*\\('},{d:'Parameter placeholder ? in SQL',re:'balance_cents\\s*>\\s*\\?'},{d:'Binds with setLong(1, ...)',re:'setLong\\s*\\(\\s*1\\s*,\\s*cents\\s*\\)'},{d:'Connection+statement in try-with-resources',re:'try\\s*\\(\\s*Connection\\s+\\w+\\s*=\\s*ds\\.getConnection\\s*\\(\\s*\\)'},{d:'Iterates rs.next()',re:'while\\s*\\(\\s*\\w+\\.next\\s*\\(\\s*\\)\\s*\\)'},{d:'No SQL string concatenation',re:'"\\s*\\+\\s*cents|cents\\s*\\+\\s*"',not:true}],
behavior:`1. Returns each owner from the result set in order. 2. cents is bound as a parameter — the SQL string is a constant. 3. Connection, PreparedStatement and ResultSet all close automatically, even on exception. 4. Works against any DataSource (pooled in production).`,
hints:['Resources chain in ONE try header, comma-separated: connection, then prepareStatement.','Bind before executing: <code>ps.setLong(1, cents);</code> then <code>ps.executeQuery()</code> in a nested try.','Collect: <code>while (rs.next()) out.add(rs.getString("owner"));</code>'],
solution:`import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

public class AccountDao {
    private final DataSource ds;

    public AccountDao(DataSource ds) {
        this.ds = ds;
    }

    List<String> ownersWithBalanceOver(long cents) throws SQLException {
        String sql = "SELECT owner FROM accounts WHERE balance_cents > ?";
        List<String> out = new ArrayList<>();
        try (Connection con = ds.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, cents);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(rs.getString("owner"));
                }
            }
        }
        return out;
    }
}`}},
{id:'db3',title:'Transactions: all or nothing',body:`
<p>A transfer that debits one account and fails before crediting the other must undo the debit — that is a <b>transaction</b>: ACID (Atomic, Consistent, Isolated, Durable).</p>
<div class="codeSample" data-hl>try (Connection con = ds.getConnection()) {
    con.setAutoCommit(false);                    // start the transaction
    try {
        debit(con, from, cents);
        credit(con, to, cents);
        con.commit();                            // both or...
    } catch (SQLException e) {
        con.rollback();                          // ...neither
        throw e;
    }
}</div>
<p>In Spring, <code>@Transactional</code> wraps this via a proxy — with famous pitfalls: it only works on <b>public methods called from another bean</b> (self-invocation bypasses the proxy), and by default rolls back on unchecked exceptions only. Isolation levels trade correctness for concurrency: READ_COMMITTED (common default) → REPEATABLE_READ → SERIALIZABLE; know that lost updates need locking (<code>SELECT ... FOR UPDATE</code>) or optimistic versioning (<code>@Version</code> in JPA).</p>`,
docs:[['JDBC transactions — Oracle','https://docs.oracle.com/javase/tutorial/jdbc/basics/transactions.html'],['Spring @Transactional','https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html']],
ex:{title:'Atomic transfer',
prompt:`Write <code>TransferDao</code> with <code>void transfer(javax.sql.DataSource ds, long fromId, long toId, long cents) throws java.sql.SQLException</code>: get a connection in try-with-resources, <code>setAutoCommit(false)</code>, run two <code>PreparedStatement</code> updates (debit: <code>UPDATE accounts SET balance_cents = balance_cents - ? WHERE id = ?</code>, credit: same with +), <code>commit()</code> on success, and in a catch block <code>rollback()</code> then rethrow.`,
starter:`import javax.sql.DataSource;
import java.sql.*;

public class TransferDao {
    void transfer(DataSource ds, long fromId, long toId, long cents) throws SQLException {
        // connection -> autoCommit off -> debit + credit -> commit / rollback
    }
}`,
tests:[{d:'Turns autocommit off',re:'setAutoCommit\\s*\\(\\s*false\\s*\\)'},{d:'Debit update with placeholders',re:'balance_cents\\s*=\\s*balance_cents\\s*-\\s*\\?'},{d:'Credit update too',re:'balance_cents\\s*=\\s*balance_cents\\s*\\+\\s*\\?'},{d:'Commits on success',re:'\\.commit\\s*\\(\\s*\\)'},{d:'Rolls back in catch and rethrows',re:'catch[\\s\\S]*?rollback\\s*\\(\\s*\\)[\\s\\S]*?throw'}],
behavior:`1. Success path: both updates then commit — the two balances change together. 2. If the credit throws, rollback undoes the debit — money is never destroyed. 3. The exception is rethrown after rollback (never swallowed). 4. Connection still closes via try-with-resources in every path.`,
hints:['Structure: outer try-with-resources for the connection; inner try/catch for commit/rollback.','Each statement: prepare, setLong(1, cents), setLong(2, id), executeUpdate().','catch (SQLException e) { con.rollback(); throw e; } — rollback then rethrow, both matter.'],
solution:`import javax.sql.DataSource;
import java.sql.*;

public class TransferDao {
    void transfer(DataSource ds, long fromId, long toId, long cents) throws SQLException {
        try (Connection con = ds.getConnection()) {
            con.setAutoCommit(false);
            try {
                try (PreparedStatement debit = con.prepareStatement(
                        "UPDATE accounts SET balance_cents = balance_cents - ? WHERE id = ?")) {
                    debit.setLong(1, cents);
                    debit.setLong(2, fromId);
                    debit.executeUpdate();
                }
                try (PreparedStatement credit = con.prepareStatement(
                        "UPDATE accounts SET balance_cents = balance_cents + ? WHERE id = ?")) {
                    credit.setLong(1, cents);
                    credit.setLong(2, toId);
                    credit.executeUpdate();
                }
                con.commit();
            } catch (SQLException e) {
                con.rollback();
                throw e;
            }
        }
    }
}`}},
{id:'db4',title:'Schema migrations with Flyway',body:`
<p>Your schema is code: versioned, reviewed, applied identically everywhere. Flyway runs numbered SQL scripts on startup and records them in a history table:</p>
<div class="codeSample">src/main/resources/db/migration/
  V1__create_accounts.sql
  V2__add_status_to_accounts.sql
  V3__create_transactions.sql
  R__account_summary_view.sql      -- repeatable: reruns when its content changes</div>
<div class="codeSample">-- V2__add_status_to_accounts.sql
ALTER TABLE accounts
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';</div>
<p>Rules that keep production safe: <b>never edit an applied migration</b> (checksums are verified — write a new V-script instead), naming is <code>V&lt;version&gt;__&lt;description&gt;.sql</code> (two underscores), and destructive changes deploy in phases (add column → backfill → switch reads → drop old) so old and new app versions coexist during a rolling deploy — the zero-downtime discipline from the deployment stream applied to data.</p>`,
docs:[['Flyway documentation','https://documentation.red-gate.com/flyway'],['Spring Boot + Flyway','https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.migration-tool.flyway']],
ex:{title:'Write the migrations',lang:'sql',
prompt:`(1) On the first line, write the correct <b>filename</b> for migration number 4 that creates an audit_log table. (2) Below it, write its SQL: <code>CREATE TABLE audit_log</code> with columns <code>id BIGSERIAL PRIMARY KEY</code>, <code>actor VARCHAR(100) NOT NULL</code>, <code>action VARCHAR(50) NOT NULL</code>, <code>created_at TIMESTAMP NOT NULL DEFAULT now()</code>. (3) Then add an index on <code>actor</code> named <code>idx_audit_actor</code>.`,
starter:`-- 1) filename:


-- 2) the table:


-- 3) the index:
`,
tests:[{d:'Correct V4__ naming (two underscores)',re:'V4__\\w+\\.sql'},{d:'CREATE TABLE audit_log',re:'CREATE\\s+TABLE\\s+audit_log','flags':'is'},{d:'BIGSERIAL primary key',re:'id\\s+BIGSERIAL\\s+PRIMARY\\s+KEY','flags':'is'},{d:'NOT NULL constraints present',re:'actor\\s+VARCHAR\\(100\\)\\s+NOT\\s+NULL','flags':'is'},{d:'Default timestamp',re:'DEFAULT\\s+now\\(\\)','flags':'is'},{d:'Named index on actor',re:'CREATE\\s+INDEX\\s+idx_audit_actor\\s+ON\\s+audit_log\\s*\\(\\s*actor\\s*\\)','flags':'is'}],
behavior:`1. Filename matches V4__<description>.sql exactly — V4_create_audit_log.sql (one underscore) would be silently ignored by Flyway. 2. Table DDL has all four columns with the stated constraints. 3. CREATE INDEX idx_audit_actor ON audit_log(actor). 4. This file, once applied, is immutable — changes go in V5.`,
hints:['Two underscores between version and description: V4__create_audit_log.sql.','Column list is comma-separated inside CREATE TABLE ( ... );','Index syntax: CREATE INDEX <name> ON <table>(<column>);'],
solution:`-- 1) filename:
V4__create_audit_log.sql

-- 2) the table:
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3) the index:
CREATE INDEX idx_audit_actor ON audit_log(actor);`}},
{id:'db5',title:'Performance: N+1, indexes & pools',body:`
<p>The four database problems you will actually meet:</p>
<ul>
<li><b>N+1 queries</b>: load 100 orders, then lazily fetch each order's user = 101 queries. Tells: page slow, logs full of identical SELECTs. Fix: <code>JOIN FETCH</code> in JPQL, <code>@EntityGraph</code>, or a hand-written join.</li>
<li><b>Missing indexes</b>: every WHERE/JOIN/ORDER BY column on a big table is an index candidate. Verify with <code>EXPLAIN ANALYZE</code> — "Seq Scan" on millions of rows is your smoking gun. Indexes cost write speed; don't index everything.</li>
<li><b>Connection pool exhaustion</b>: the pool (HikariCP, default ~10) runs dry when transactions are held too long — keep transactions short, never do HTTP calls inside one.</li>
<li><b>Unbounded queries</b>: always paginate (<code>LIMIT/OFFSET</code> or keyset <code>WHERE id &gt; ?</code> — remember cursor pagination from the REST stream? Same idea, one layer down).</li>
</ul>
<div class="codeSample">-- JPQL fix for N+1:
SELECT o FROM Order o JOIN FETCH o.user WHERE o.status = 'OPEN'

EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Index Scan using idx_orders_user_id  ← good
-- Seq Scan on orders (cost=0.00..421337) ← add the index!</div>`,
docs:[['N+1 problem — Vlad Mihalcea','https://vladmihalcea.com/n-plus-1-query-problem/'],['Postgres EXPLAIN','https://www.postgresql.org/docs/current/using-explain.html'],['HikariCP','https://github.com/brettwooldridge/HikariCP']],
ex:{title:'Performance triage',lang:'text',
prompt:`Answer on the numbered lines: (1) the name of the anti-pattern when listing 100 orders fires 101 queries, (2) the JPQL keyword pair that fixes it in one query, (3) the SQL command prefix that shows a query's execution plan with timings, (4) the plan operation that signals a missing index on a large table, (5) the command to create an index named <code>idx_orders_user_id</code> on <code>orders(user_id)</code>, (6) Spring Boot's default connection pool.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)

# 6)
`,
tests:[{d:'Names N+1',re:'N\\s*\\+\\s*1'},{d:'JOIN FETCH',re:'JOIN\\s+FETCH','flags':'is'},{d:'EXPLAIN ANALYZE',re:'EXPLAIN\\s+ANALYZE','flags':'is'},{d:'Seq(uential) Scan as the tell',re:'Seq(uential)?\\s+Scan','flags':'is'},{d:'Correct CREATE INDEX statement',re:'CREATE\\s+INDEX\\s+idx_orders_user_id\\s+ON\\s+orders\\s*\\(\\s*user_id\\s*\\)','flags':'is'},{d:'HikariCP',re:'Hikari','flags':'is'}],
behavior:`1. (1) the N+1 query problem. 2. (2) JOIN FETCH. 3. (3) EXPLAIN ANALYZE. 4. (4) Seq Scan (sequential scan). 5. (5) CREATE INDEX idx_orders_user_id ON orders(user_id); 6. (6) HikariCP.`,
hints:['1 query for the list + N for the children = the name.','EXPLAIN shows the plan; adding ANALYZE actually runs it with real timings.','Spring Boot has shipped Hikari as the default pool since 2.0.'],
solution:`# 1)
The N+1 query problem

# 2)
JOIN FETCH

# 3)
EXPLAIN ANALYZE

# 4)
Seq Scan (sequential scan)

# 5)
CREATE INDEX idx_orders_user_id ON orders(user_id);

# 6)
HikariCP`}}
]});
