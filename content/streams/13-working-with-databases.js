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
