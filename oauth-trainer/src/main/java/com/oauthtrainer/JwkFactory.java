package com.oauthtrainer;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns raw Java key objects into JSON Web Keys (JWK, RFC 7517) with member encodings per
 * JWA (RFC 7518). Doing this by hand (rather than with a library) is the whole point of Phase 1:
 * a JWK is just the key's numbers, base64url-encoded, in a small JSON object.
 *
 * <p>Each JWK we produce carries the standard signing metadata an OAuth server publishes:
 * <ul>
 *   <li>{@code kty} — key type ("RSA" or "EC")</li>
 *   <li>{@code use} — "sig" (this key is for signatures)</li>
 *   <li>{@code alg} — the JWS algorithm ("RS256" for RSA, "ES256" for EC P-256)</li>
 *   <li>{@code kid} — key ID, here the RFC 7638 thumbprint (a stable fingerprint of the key)</li>
 * </ul>
 */
public final class JwkFactory {

    private static final Base64.Encoder B64URL = Base64.getUrlEncoder().withoutPadding();

    // ---- RSA -------------------------------------------------------------------------------

    /** Build the PRIVATE RSA JWK (includes all private parameters). */
    public static Map<String, String> rsaPrivate(RSAPublicKey pub, RSAPrivateCrtKey priv) {
        Map<String, String> jwk = rsaPublicCore(pub);      // n, e first
        // private parameters (RFC 7518 §6.3.2)
        jwk.put("d", uint(priv.getPrivateExponent()));
        jwk.put("p", uint(priv.getPrimeP()));
        jwk.put("q", uint(priv.getPrimeQ()));
        jwk.put("dp", uint(priv.getPrimeExponentP()));
        jwk.put("dq", uint(priv.getPrimeExponentQ()));
        jwk.put("qi", uint(priv.getCrtCoefficient()));
        return withHeader(jwk, "RSA", "RS256", rsaThumbprint(pub));
    }

    /** Build the PUBLIC RSA JWK (safe to publish, e.g. at a JWKS endpoint). */
    public static Map<String, String> rsaPublic(RSAPublicKey pub) {
        return withHeader(rsaPublicCore(pub), "RSA", "RS256", rsaThumbprint(pub));
    }

    private static Map<String, String> rsaPublicCore(RSAPublicKey pub) {
        Map<String, String> jwk = new LinkedHashMap<>();
        jwk.put("n", uint(pub.getModulus()));       // modulus, unsigned big-endian, minimal octets
        jwk.put("e", uint(pub.getPublicExponent())); // public exponent (usually 65537 -> "AQAB")
        return jwk;
    }

    // ---- EC (P-256) ------------------------------------------------------------------------

    /** Build the PRIVATE EC JWK (includes the private scalar d). */
    public static Map<String, String> ecPrivate(ECPublicKey pub, ECPrivateKey priv) {
        Map<String, String> jwk = ecPublicCore(pub);          // crv, x, y first
        jwk.put("d", fixed(priv.getS(), 32));                 // private key, fixed 32 bytes
        return withHeader(jwk, "EC", "ES256", ecThumbprint(pub));
    }

    /** Build the PUBLIC EC JWK. */
    public static Map<String, String> ecPublic(ECPublicKey pub) {
        return withHeader(ecPublicCore(pub), "EC", "ES256", ecThumbprint(pub));
    }

    private static Map<String, String> ecPublicCore(ECPublicKey pub) {
        Map<String, String> jwk = new LinkedHashMap<>();
        jwk.put("crv", "P-256");
        // EC coordinates are fixed-length: the full coordinate size for the curve (32 bytes for P-256)
        jwk.put("x", fixed(pub.getW().getAffineX(), 32));
        jwk.put("y", fixed(pub.getW().getAffineY(), 32));
        return jwk;
    }

    // ---- helpers ---------------------------------------------------------------------------

    /** Prepend the standard header members in a readable order: kid, kty, use, alg, then key data. */
    private static Map<String, String> withHeader(Map<String, String> keyData,
                                                  String kty, String alg, String kid) {
        Map<String, String> jwk = new LinkedHashMap<>();
        jwk.put("kid", kid);
        jwk.put("kty", kty);
        jwk.put("use", "sig");
        jwk.put("alg", alg);
        jwk.putAll(keyData);
        return jwk;
    }

    /**
     * RFC 7638 JWK thumbprint used as the key id (kid): SHA-256 over the required members in
     * lexicographic order with no whitespace, base64url-encoded. For RSA the required members are
     * e, kty, n.
     */
    private static String rsaThumbprint(RSAPublicKey pub) {
        String json = "{\"e\":\"" + uint(pub.getPublicExponent())
                + "\",\"kty\":\"RSA\",\"n\":\"" + uint(pub.getModulus()) + "\"}";
        return sha256Base64Url(json);
    }

    /** RFC 7638 thumbprint for EC: required members are crv, kty, x, y. */
    private static String ecThumbprint(ECPublicKey pub) {
        String json = "{\"crv\":\"P-256\",\"kty\":\"EC\",\"x\":\""
                + fixed(pub.getW().getAffineX(), 32) + "\",\"y\":\""
                + fixed(pub.getW().getAffineY(), 32) + "\"}";
        return sha256Base64Url(json);
    }

    private static String sha256Base64Url(String json) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(json.getBytes(StandardCharsets.UTF_8));
            return B64URL.encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    /**
     * Encode a non-negative BigInteger as a base64url "uint" per JWA: the minimum number of
     * big-endian octets, with no sign byte. Used for RSA n/e/d/p/q/dp/dq/qi.
     */
    static String uint(BigInteger value) {
        return B64URL.encodeToString(toUnsignedMinimal(value));
    }

    /**
     * Encode a BigInteger as a fixed-length base64url octet string (left-padded with zeros).
     * Used for EC coordinates and the EC private scalar, which must be the full field size.
     */
    static String fixed(BigInteger value, int length) {
        byte[] magnitude = toUnsignedMinimal(value);
        if (magnitude.length > length) {
            throw new IllegalArgumentException("value larger than " + length + " bytes");
        }
        byte[] out = new byte[length];
        System.arraycopy(magnitude, 0, out, length - magnitude.length, magnitude.length);
        return B64URL.encodeToString(out);
    }

    /** BigInteger -> unsigned big-endian bytes with no leading zero/sign byte. */
    private static byte[] toUnsignedMinimal(BigInteger value) {
        byte[] bytes = value.toByteArray();            // two's-complement big-endian
        int start = 0;
        while (start < bytes.length - 1 && bytes[start] == 0) {
            start++;                                    // strip leading zero (incl. sign byte)
        }
        if (start == 0) {
            return bytes;
        }
        byte[] out = new byte[bytes.length - start];
        System.arraycopy(bytes, start, out, 0, out.length);
        return out;
    }

    private JwkFactory() {}
}
