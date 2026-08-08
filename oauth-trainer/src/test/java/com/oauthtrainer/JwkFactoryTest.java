package com.oauthtrainer;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.ECPoint;
import java.security.spec.ECPublicKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Map;

import org.junit.jupiter.api.Test;

/**
 * Tests for Phase 1 JWK generation/export. These verify structure, correct member encoding, that
 * private material only appears in private JWKs, and — most importantly — that the exported public
 * key material actually reconstructs into a working key (sign with the generated key, verify with a
 * key rebuilt from the JWK). The RFC 7638 example is used as a fixed {@code kid} vector.
 */
class JwkFactoryTest {

    private static final Base64.Decoder B64URL = Base64.getUrlDecoder();

    // ---- RSA ----------------------------------------------------------------------------------

    @Test
    void rsaPrivateJwkHasAllMembersAndCorrectMetadata() {
        KeyPair pair = KeyGen.rsa2048();
        Map<String, String> jwk = JwkFactory.rsaPrivate(
                (RSAPublicKey) pair.getPublic(), (RSAPrivateCrtKey) pair.getPrivate());

        assertEquals("RSA", jwk.get("kty"));
        assertEquals("sig", jwk.get("use"));
        assertEquals("RS256", jwk.get("alg"));
        assertEquals("AQAB", jwk.get("e"), "public exponent 65537 encodes to AQAB");
        assertNotNull(jwk.get("kid"));
        assertEquals(43, jwk.get("kid").length(), "SHA-256 thumbprint is 43 base64url chars");
        for (String m : new String[]{"n", "e", "d", "p", "q", "dp", "dq", "qi"}) {
            assertNotNull(jwk.get(m), "private RSA JWK must contain " + m);
        }
    }

    @Test
    void rsaPublicJwkOmitsPrivateMembersButKeepsKid() {
        KeyPair pair = KeyGen.rsa2048();
        RSAPublicKey pub = (RSAPublicKey) pair.getPublic();
        Map<String, String> pubJwk = JwkFactory.rsaPublic(pub);
        Map<String, String> privJwk = JwkFactory.rsaPrivate(pub, (RSAPrivateCrtKey) pair.getPrivate());

        for (String secret : new String[]{"d", "p", "q", "dp", "dq", "qi"}) {
            assertFalse(pubJwk.containsKey(secret), "public JWK must NOT contain " + secret);
        }
        assertEquals(privJwk.get("kid"), pubJwk.get("kid"),
                "public and private JWK of the same key share the kid (RFC 7638 §3.2.1)");
    }

    @Test
    void rsaThumbprintMatchesRfc7638Vector() throws Exception {
        // The example JWK from RFC 7638 §3.1 and its published thumbprint.
        String n = "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6"
                 + "tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5"
                 + "v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD0"
                 + "8qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU"
                 + "8awapJzKnqDKgw";
        RSAPublicKey pub = (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(
                new RSAPublicKeySpec(new BigInteger(1, B64URL.decode(n)), BigInteger.valueOf(65537)));

        assertEquals("NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs",
                JwkFactory.rsaPublic(pub).get("kid"));
    }

    @Test
    void rsaJwkRoundTripsIntoAWorkingKey() throws Exception {
        KeyPair pair = KeyGen.rsa2048();
        Map<String, String> jwk = JwkFactory.rsaPublic((RSAPublicKey) pair.getPublic());

        // rebuild an RSAPublicKey purely from the JWK's n and e, then verify a real signature
        BigInteger n = new BigInteger(1, B64URL.decode(jwk.get("n")));
        BigInteger e = new BigInteger(1, B64URL.decode(jwk.get("e")));
        RSAPublicKey rebuilt = (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(new RSAPublicKeySpec(n, e));

        byte[] message = "oauth-trainer".getBytes("UTF-8");
        Signature signer = Signature.getInstance("SHA256withRSA");
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] sig = signer.sign();

        Signature verifier = Signature.getInstance("SHA256withRSA");
        verifier.initVerify(rebuilt);
        verifier.update(message);
        assertTrue(verifier.verify(sig), "key rebuilt from JWK must verify the signature");
    }

    // ---- EC P-256 -----------------------------------------------------------------------------

    @Test
    void ecJwkHasCorrectMetadataAndFixedLengthCoordinates() {
        KeyPair pair = KeyGen.ecP256();
        Map<String, String> jwk = JwkFactory.ecPrivate(
                (ECPublicKey) pair.getPublic(), (ECPrivateKey) pair.getPrivate());

        assertEquals("EC", jwk.get("kty"));
        assertEquals("P-256", jwk.get("crv"));
        assertEquals("ES256", jwk.get("alg"));
        assertEquals("sig", jwk.get("use"));
        assertNotNull(jwk.get("d"), "private EC JWK must contain d");
        assertEquals(32, B64URL.decode(jwk.get("x")).length, "x is the full 32-byte coordinate");
        assertEquals(32, B64URL.decode(jwk.get("y")).length, "y is the full 32-byte coordinate");
        assertEquals(32, B64URL.decode(jwk.get("d")).length, "d is 32 bytes");
    }

    @Test
    void ecPublicJwkOmitsPrivateScalar() {
        KeyPair pair = KeyGen.ecP256();
        Map<String, String> pubJwk = JwkFactory.ecPublic((ECPublicKey) pair.getPublic());
        assertFalse(pubJwk.containsKey("d"), "public EC JWK must NOT contain d");
    }

    @Test
    void ecJwkRoundTripsIntoAWorkingKey() throws Exception {
        KeyPair pair = KeyGen.ecP256();
        ECPublicKey original = (ECPublicKey) pair.getPublic();
        Map<String, String> jwk = JwkFactory.ecPublic(original);

        // rebuild an ECPublicKey from the JWK's x,y (reusing the original curve params), then verify
        BigInteger x = new BigInteger(1, B64URL.decode(jwk.get("x")));
        BigInteger y = new BigInteger(1, B64URL.decode(jwk.get("y")));
        ECPublicKey rebuilt = (ECPublicKey) KeyFactory.getInstance("EC")
                .generatePublic(new ECPublicKeySpec(new ECPoint(x, y), original.getParams()));

        byte[] message = "oauth-trainer".getBytes("UTF-8");
        Signature signer = Signature.getInstance("SHA256withECDSA");
        signer.initSign(pair.getPrivate());
        signer.update(message);
        byte[] sig = signer.sign();

        Signature verifier = Signature.getInstance("SHA256withECDSA");
        verifier.initVerify(rebuilt);
        verifier.update(message);
        assertTrue(verifier.verify(sig), "EC key rebuilt from JWK must verify the signature");
    }
}
