package com.oauthtrainer;

/**
 * OAuth Trainer — a hands-on CLI for learning OAuth 2.0 / OpenID Connect building blocks.
 *
 * <p>Phase 1: {@code keygen} — generate an RSA-2048 or EC P-256 key pair (or both) and export
 * each as a JSON Web Key (JWK, RFC 7517) — a public JWK (safe to publish) and a private JWK
 * (keep secret). These are the keys an OAuth Authorization Server uses to sign tokens (JWTs) and
 * that clients use to verify them.</p>
 *
 * <p>The tool is intentionally built on the plain JDK (no crypto libraries) so you can see every
 * step of how a JWK is assembled from raw key material.</p>
 */
public final class Main {

    public static void main(String[] args) {
        try {
            run(args);
        } catch (CliException e) {
            System.err.println("error: " + e.getMessage());
            System.err.println();
            printUsage(System.err);
            System.exit(2);
        } catch (Exception e) {
            System.err.println("unexpected error: " + e.getMessage());
            System.exit(1);
        }
    }

    private static void run(String[] args) throws Exception {
        if (args.length == 0 || isHelp(args[0])) {
            printUsage(System.out);
            return;
        }
        String command = args[0];
        String[] rest = java.util.Arrays.copyOfRange(args, 1, args.length);
        if (command.equals("keygen")) {
            KeygenCommand.run(rest);
        } else if (command.equals("sign")) {
            SignCommand.run(rest);
        } else {
            throw new CliException("unknown command '" + command + "'");
        }
    }

    private static boolean isHelp(String a) {
        return a.equals("-h") || a.equals("--help") || a.equals("help");
    }

    static void printUsage(java.io.PrintStream out) {
        out.println("OAuth Trainer — learn OAuth/OIDC by building it, one phase at a time.");
        out.println();
        out.println("Usage:");
        out.println("  oauth-trainer <command> [options]");
        out.println();
        out.println("Commands:");
        out.println("  keygen        Generate a signing key pair and export it as JWK JSON");
        out.println("  sign          Sign a JWT with RS256 and ES256 and compare size & speed");
        out.println("  help          Show this help");
        out.println();
        out.println("Run 'oauth-trainer <command> --help' for a command's options.");
    }

    /** Thrown for user/CLI input errors (bad flags, etc.). */
    static final class CliException extends RuntimeException {
        CliException(String message) { super(message); }
    }

    private Main() {}
}
