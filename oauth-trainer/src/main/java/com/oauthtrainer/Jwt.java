package com.oauthtrainer;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Builds the two JSON parts of a JWT and the "signing input" that gets signed. A JWT is
 * {@code base64url(header) + "." + base64url(payload) + "." + base64url(signature)}; this class
 * produces the first two parts (compact JSON, as tokens use — no whitespace) and joins them.
 */
public final class Jwt {

    private static final Base64.Encoder B64URL = Base64.getUrlEncoder().withoutPadding();

    static String b64url(byte[] bytes) {
        return B64URL.encodeToString(bytes);
    }

    static String b64url(String s) {
        return b64url(s.getBytes(StandardCharsets.UTF_8));
    }

    /** Compact JOSE header naming the algorithm and the key id (so a verifier can find the key). */
    static String header(String alg, String kid) {
        return "{\"alg\":\"" + alg + "\",\"typ\":\"JWT\",\"kid\":\"" + esc(kid) + "\"}";
    }

    /** Compact claims payload with the standard claims plus a custom {@code role}. */
    static String payload(String iss, String sub, String aud, long expEpoch, long iatEpoch, String role) {
        return "{"
                + "\"iss\":" + q(iss) + ","
                + "\"sub\":" + q(sub) + ","
                + "\"aud\":" + q(aud) + ","
                + "\"exp\":" + expEpoch + ","   // numeric date (seconds since epoch)
                + "\"iat\":" + iatEpoch + ","
                + "\"role\":" + q(role)
                + "}";
    }

    /** The bytes that get signed: base64url(header) + "." + base64url(payload). */
    static String signingInput(String headerJson, String payloadJson) {
        return b64url(headerJson) + "." + b64url(payloadJson);
    }

    private static String q(String s) {
        return "\"" + esc(s) + "\"";
    }

    private static String esc(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private Jwt() {}
}
