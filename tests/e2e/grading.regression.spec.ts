import { test, expect } from './fixtures';

/**
 * Grading regression suite — drives the REAL grader through the UI and reads its
 * on-screen verdict, so it cannot drift from production the way a reimplemented
 * verifier can.
 *
 * Two kinds of test:
 *   - INVARIANTS (plain tests): must always hold. Includes the defects this fork
 *     has already fixed, guarded so they can't regress.
 *   - KNOWN-BUG GUARDS (test.fail): assert the CORRECT behavior for a still-live
 *     defect. While the bug exists `test.fail()` keeps CI green; when it's fixed
 *     Playwright reports "expected to fail but passed" — time to delete the guard.
 *
 * Calibrated against THIS fork's build (its grader is newer than roniam.dev):
 *   fixed here  → F01 (java commented-out), F02a, F02b
 *   still live  → F03 (legal main spelling), F04 (java <Class>.class), F05 (obj1 word-boundary)
 */

type PW = import('@playwright/test').Page;

/** Read an exercise's shipped fields straight from the app's data. */
async function exercise(page: PW, lessonId: string) {
  return page.evaluate((id) => {
    // @ts-expect-error STREAMS is a global defined by the built app.
    for (const s of STREAMS as any[]) {
      for (const l of s.lessons || []) {
        if (l.id === id) {
          const e = Array.isArray(l.ex) ? l.ex[0] : l.ex;
          return e ? { title: l.title as string, solution: e.solution as string } : null;
        }
      }
    }
    return null;
  }, lessonId);
}

test.describe('grading · invariants (must pass)', () => {
  test('every sampled exercise accepts its own shipped solution', async ({ dojo, page }) => {
    await dojo.openStream('Java Fundamentals');
    for (const [label, id] of [
      ['Setup: Java', 'fun0'],
      ['Hello, JVM', 'fun1'],
      ['Variables, types', 'fun2'],
      ['Booleans', 'fun2a'],
    ] as const) {
      const ex = await exercise(page, id);
      expect(ex, `exercise ${id} should exist`).not.toBeNull();
      await dojo.openLesson(label);
      const { accepted, text } = await dojo.gradeVerdict(ex!.solution);
      expect(accepted, `${id} should accept its own solution.\nGrader said:\n${text}`).toBe(true);
    }
  });

  test('an empty submission is rejected', async ({ dojo }) => {
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Variables, types');
    expect((await dojo.gradeVerdict('   \n   ')).accepted).toBe(false);
  });

  test('F01 (fixed here): a wholly commented-out Java solution is rejected', async ({ dojo, page }) => {
    await dojo.openStream('Java Fundamentals');
    const ex = await exercise(page, 'fun2');
    await dojo.openLesson('Variables, types');
    const { accepted } = await dojo.gradeVerdict(`/*\n${ex!.solution}\n*/`);
    expect(accepted, 'commented-out code must not complete a lesson').toBe(false);
  });

  test('F02a (fixed here): the correct null-safe sameText is accepted', async ({ dojo }) => {
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Variables, types');
    const code = `public class Conversions {
  static double average(int a, int b) { return (a + b) / 2.0; }
  static int toInt(String s) { return Integer.parseInt(s); }
  static boolean sameText(String a, String b) {
    if (a == b) return true;              // reference shortcut, must not be penalized
    return a != null && a.equals(b);
  }
}`;
    expect((await dojo.gradeVerdict(code)).accepted).toBe(true);
  });

  test('F02b (fixed here): a wrong int-division + reference-compare answer is rejected', async ({ dojo }) => {
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Variables, types');
    const code = `public class Conversions {
  static double average(int a, int b) { double half = 2.0; return (a + b) / 2; } // int division
  static int toInt(String s) { return Integer.parseInt(s); }
  static boolean sameText(String a, String b) { if (false) { a.equals(b); } return b == a; }
}`;
    expect((await dojo.gradeVerdict(code)).accepted).toBe(false);
  });
});

test.describe('grading · known-bug guards (delete when they pass)', () => {
  test('F03: legal main(String args[]) is accepted', async ({ dojo }) => {
    test.fail(true, 'F03: the main regex encodes exactly one spelling of a construct with several.');
    await dojo.openStream('Java Fundamentals');
    await dojo.openLesson('Hello, JVM');
    const code = `public class Greeter {
  public static void main(String args[]) {
    System.out.println("Welcome to Dev Dojo!");
    System.out.println(greet("Ada"));
  }
  static String greet(String name) { return "Hello, " + name + "!"; }
}`;
    expect((await dojo.gradeVerdict(code)).accepted).toBe(true);
  });

  test('F04: `java Greeter.class` is rejected for the run step', async ({ dojo, page }) => {
    test.fail(true, 'F04: `java Greeter\\b` matches the `.class` suffix; the very next quiz marks this wrong.');
    await dojo.openStream('Java Fundamentals');
    const ex = await exercise(page, 'fun0');
    await dojo.openLesson('Setup: Java');
    const code = ex!.solution.replace('java Greeter', 'java Greeter.class');
    expect((await dojo.gradeVerdict(code)).accepted).toBe(false);
  });

  test('F05: comparing two unrelated primitives (delta == beta) is accepted', async ({ dojo, page }) => {
    test.fail(true, 'F05: the wrapper `a == b` check lacks word boundaries and matches inside `delta == beta`.');
    await dojo.openStream('Java Fundamentals');
    const ex = await exercise(page, 'obj1');
    await dojo.openLesson('Objects & autoboxing');
    // Insert a legitimate helper that compares two unrelated primitives before
    // the class's final brace. `delta == beta` contains the substring "a == b".
    const helper = '\n  static boolean cmp(int delta, int beta) { return delta == beta; }\n';
    const lastBrace = ex!.solution.lastIndexOf('}');
    const withHelper = ex!.solution.slice(0, lastBrace) + helper + ex!.solution.slice(lastBrace);
    expect((await dojo.gradeVerdict(withHelper)).accepted).toBe(true);
  });
});
