package com.oauthtrainer;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.KeyPair;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.interfaces.RSAPublicKey;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * {@code keygen} subcommand: generate RSA-2048 and/or EC P-256 signing keys and export each as a
 * pair of JWK files — a private JWK (full key, keep secret) and a public JWK (safe to publish).
 */
public final class KeygenCommand {

    private enum Alg { RSA, EC, BOTH }

    public static void run(String[] args) throws IOException {
        Alg alg = Alg.BOTH;                 // default: generate both
        Path outDir = Paths.get("keys");    // default output directory

        for (int i = 0; i < args.length; i++) {
            String arg = args[i];
            switch (arg) {
                case "-h":
                case "--help":
                    printHelp();
                    return;
                case "--alg":
                    alg = parseAlg(requireValue(args, ++i, "--alg"));
                    break;
                case "--out":
                    outDir = Paths.get(requireValue(args, ++i, "--out"));
                    break;
                default:
                    throw new Main.CliException("unknown option '" + arg + "' for keygen");
            }
        }

        Files.createDirectories(outDir);
        List<String> written = new ArrayList<>();

        System.out.println("Generating signing keys...");
        System.out.println();

        if (alg == Alg.RSA || alg == Alg.BOTH) {
            KeyPair pair = KeyGen.rsa2048();
            RSAPublicKey pub = (RSAPublicKey) pair.getPublic();
            RSAPrivateCrtKey priv = (RSAPrivateCrtKey) pair.getPrivate();
            Map<String, String> privateJwk = JwkFactory.rsaPrivate(pub, priv);
            Map<String, String> publicJwk = JwkFactory.rsaPublic(pub);
            emit("RSA-2048", "RS256", privateJwk, publicJwk, outDir, "rsa-2048", written);
        }

        if (alg == Alg.EC || alg == Alg.BOTH) {
            KeyPair pair = KeyGen.ecP256();
            ECPublicKey pub = (ECPublicKey) pair.getPublic();
            ECPrivateKey priv = (ECPrivateKey) pair.getPrivate();
            Map<String, String> privateJwk = JwkFactory.ecPrivate(pub, priv);
            Map<String, String> publicJwk = JwkFactory.ecPublic(pub);
            emit("EC P-256", "ES256", privateJwk, publicJwk, outDir, "ec-p256", written);
        }

        System.out.println("Files written to " + outDir.toAbsolutePath().normalize() + ":");
        for (String f : written) {
            System.out.println("  " + f);
        }
        System.out.println();
        System.out.println("⚠  The *.private.jwk.json files contain secret key material — never commit or share them.");
        System.out.println("   The *.public.jwk.json files are safe to publish (e.g. at a JWKS endpoint).");
    }

    /** Write one key's private + public JWK files and print a short summary of what was made. */
    private static void emit(String label, String alg,
                             Map<String, String> privateJwk, Map<String, String> publicJwk,
                             Path outDir, String baseName, List<String> written) throws IOException {
        Path privatePath = outDir.resolve(baseName + ".private.jwk.json");
        Path publicPath = outDir.resolve(baseName + ".public.jwk.json");

        writeFile(publicPath, Json.pretty(publicJwk), false);
        writeFile(privatePath, Json.pretty(privateJwk), true);   // lock down the private file

        written.add(privatePath.getFileName().toString());
        written.add(publicPath.getFileName().toString());

        System.out.println(label + "  (alg " + alg + ", kid " + privateJwk.get("kid") + ")");
        System.out.println("  private → " + privatePath);
        System.out.println("  public  → " + publicPath);
        System.out.println();
    }

    /** Write text to a file (UTF-8). If {@code secret}, try to restrict permissions to owner-only. */
    private static void writeFile(Path path, String content, boolean secret) throws IOException {
        Files.write(path, content.getBytes(StandardCharsets.UTF_8));
        if (secret) {
            try {
                Set<PosixFilePermission> perms =
                        PosixFilePermissions.fromString("rw-------"); // 600
                Files.setPosixFilePermissions(path, perms);
            } catch (UnsupportedOperationException ignored) {
                // non-POSIX filesystem (e.g. Windows) — skip; the ⚠ note still warns the user
            }
        }
    }

    private static Alg parseAlg(String value) {
        switch (value.toLowerCase()) {
            case "rsa":  return Alg.RSA;
            case "ec":   return Alg.EC;
            case "both": return Alg.BOTH;
            default:
                throw new Main.CliException("--alg must be one of: RSA, EC, both (got '" + value + "')");
        }
    }

    private static String requireValue(String[] args, int index, String flag) {
        if (index >= args.length) {
            throw new Main.CliException("missing value after " + flag);
        }
        return args[index];
    }

    private static void printHelp() {
        System.out.println("Generate signing key pair(s) and export them as JWK JSON files.");
        System.out.println();
        System.out.println("Usage:");
        System.out.println("  oauth-trainer keygen [--alg RSA|EC|both] [--out <dir>]");
        System.out.println();
        System.out.println("Options:");
        System.out.println("  --alg <type>   RSA (RSA-2048/RS256), EC (P-256/ES256), or both. Default: both");
        System.out.println("  --out <dir>    Directory to write the JWK files into. Default: ./keys");
        System.out.println("  -h, --help     Show this help");
        System.out.println();
        System.out.println("For each key type it writes two files:");
        System.out.println("  <type>.public.jwk.json    the public JWK (safe to publish)");
        System.out.println("  <type>.private.jwk.json   the private JWK (keep secret)");
    }

    private KeygenCommand() {}
}
