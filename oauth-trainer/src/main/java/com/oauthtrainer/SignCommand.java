package com.oauthtrainer;

import java.security.KeyPair;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;

/**
 * {@code sign} command (Phase 3): build one JWT with a set of claims, sign it with <b>RS256</b> and
 * with <b>ES256</b>, and print a comparison of the resulting <b>token sizes</b> and <b>signing
 * times</b> — the same token, two algorithms, so the trade-off is visible.
 */
public final class SignCommand {

    public static void run(String[] args) throws Exception {
        int iterations = 1000;
        for (int i = 0; i < args.length; i++) {
            if (args[i].equals("-h") || args[i].equals("--help")) { printHelp(); return; }
            if (args[i].equals("--iterations")) { iterations = Integer.parseInt(args[++i]); }
        }

        // ---- keys (with kids that match their JWK thumbprints from Phase 1) ----
        KeyPair rsaPair = KeyGen.rsa2048();
        KeyPair ecPair = KeyGen.ecP256();
        String rsaKid = JwkFactory.rsaPublic((RSAPublicKey) rsaPair.getPublic()).get("kid");
        String ecKid = JwkFactory.ecPublic((ECPublicKey) ecPair.getPublic()).get("kid");

        // ---- claims (Phase 2 shape) ----
        long now = Instant.now().getEpochSecond();
        long exp = now + 900; // valid 15 minutes
        String payload = Jwt.payload(
                "https://auth.example.com", "user-1234", "https://api.example.com", exp, now, "admin");

        System.out.println("Signing the same JWT with each algorithm (averaging over " + iterations + " signs)...");
        System.out.println();
        System.out.println("Claims: iss=https://auth.example.com sub=user-1234 aud=https://api.example.com role=admin exp=+15m");
        System.out.println();

        Result rs = benchmarkRs256((java.security.interfaces.RSAPrivateKey) rsaPair.getPrivate(),
                Jwt.signingInput(Jwt.header("RS256", rsaKid), payload), iterations);
        Result es = benchmarkEs256((ECPrivateKey) ecPair.getPrivate(),
                Jwt.signingInput(Jwt.header("ES256", ecKid), payload), iterations);

        report("RS256 (RSA-2048)", rs);
        report("ES256 (EC P-256)", es);

        // ---- summary ----
        long sizeDrop = Math.round(100.0 * (rs.tokenLen - es.tokenLen) / rs.tokenLen);
        double speedup = rs.avgMs / es.avgMs;
        System.out.println("Summary:");
        System.out.printf("  ES256 token is %d%% smaller (%d vs %d chars) — a ~%d-byte signature vs ~256 bytes.%n",
                sizeDrop, es.tokenLen, rs.tokenLen, es.sigBytes);
        System.out.printf("  ES256 signed about %.1fx faster than RS256 here (%.3f ms vs %.3f ms per sign).%n",
                speedup, es.avgMs, rs.avgMs);
        System.out.println("  (Note: RSA *verification* is typically faster than EC — and tokens are verified far");
        System.out.println("   more often than signed — so the right choice depends on your read/write mix.)");
    }

    private static Result benchmarkRs256(java.security.interfaces.RSAPrivateKey key, String input, int n) throws Exception {
        for (int i = 0; i < Math.min(50, n); i++) Jws.signRs256(key, input);   // warm up the JIT
        String token = null;
        long t0 = System.nanoTime();
        for (int i = 0; i < n; i++) token = Jws.signRs256(key, input);
        double avgMs = (System.nanoTime() - t0) / 1_000_000.0 / n;
        return Result.of(token, avgMs);
    }

    private static Result benchmarkEs256(ECPrivateKey key, String input, int n) throws Exception {
        for (int i = 0; i < Math.min(50, n); i++) Jws.signEs256(key, input);
        String token = null;
        long t0 = System.nanoTime();
        for (int i = 0; i < n; i++) token = Jws.signEs256(key, input);
        double avgMs = (System.nanoTime() - t0) / 1_000_000.0 / n;
        return Result.of(token, avgMs);
    }

    private static void report(String label, Result r) {
        System.out.println(label);
        System.out.println("  token size : " + r.tokenLen + " chars");
        System.out.println("  signature  : " + r.sigLen + " chars (" + r.sigBytes + " bytes)");
        System.out.printf("  sign time  : %.3f ms  (average)%n", r.avgMs);
        System.out.println("  token      : " + r.token);
        System.out.println();
    }

    /** Captured measurement for one algorithm. */
    private static final class Result {
        final String token; final int tokenLen; final int sigLen; final int sigBytes; final double avgMs;
        private Result(String token, int tokenLen, int sigLen, int sigBytes, double avgMs) {
            this.token = token; this.tokenLen = tokenLen; this.sigLen = sigLen; this.sigBytes = sigBytes; this.avgMs = avgMs;
        }
        static Result of(String token, double avgMs) {
            String sig = token.substring(token.lastIndexOf('.') + 1);
            int bytes = java.util.Base64.getUrlDecoder().decode(sig).length;
            return new Result(token, token.length(), sig.length(), bytes, avgMs);
        }
    }

    private static void printHelp() {
        System.out.println("Sign one JWT with RS256 and ES256 and compare token size and signing time.");
        System.out.println();
        System.out.println("Usage:");
        System.out.println("  oauth-trainer sign [--iterations N]");
        System.out.println();
        System.out.println("  --iterations N   how many signs to average the timing over (default 1000)");
    }

    private SignCommand() {}
}
