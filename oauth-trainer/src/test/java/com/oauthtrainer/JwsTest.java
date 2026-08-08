package com.oauthtrainer;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.Signature;
import java.util.Base64;

import org.junit.jupiter.api.Test;

/**
 * Phase 3 tests: the tokens we sign are real, verifiable JWS compact tokens, and ES256 produces the
 * smaller token. Verification re-splits the token and checks the signature over the signing-input
 * with the matching public key — using the same JOSE-correct algorithms (raw r‖s for ES256).
 */
class JwsTest {

    private static final Base64.Decoder B64URL = Base64.getUrlDecoder();

    private static String signingInput(String token) {
        int last = token.lastIndexOf('.');
        return token.substring(0, last);
    }

    private static byte[] signatureBytes(String token) {
        return B64URL.decode(token.substring(token.lastIndexOf('.') + 1));
    }

    @Test
    void rs256TokenHasThreePartsAndVerifies() throws Exception {
        KeyPair pair = KeyGen.rsa2048();
        String kid = JwkFactory.rsaPublic((java.security.interfaces.RSAPublicKey) pair.getPublic()).get("kid");
        String input = Jwt.signingInput(Jwt.header("RS256", kid),
                Jwt.payload("iss", "sub", "aud", 9999999999L, 1L, "admin"));
        String token = Jws.signRs256((java.security.interfaces.RSAPrivateKey) pair.getPrivate(), input);

        assertEquals(3, token.split("\\.").length, "compact JWS has header.payload.signature");
        Signature v = Signature.getInstance("SHA256withRSA");
        v.initVerify(pair.getPublic());
        v.update(signingInput(token).getBytes(StandardCharsets.US_ASCII));
        assertTrue(v.verify(signatureBytes(token)), "RS256 token must verify with the public key");
    }

    @Test
    void es256TokenVerifiesAndUsesRawSignature() throws Exception {
        KeyPair pair = KeyGen.ecP256();
        String kid = JwkFactory.ecPublic((java.security.interfaces.ECPublicKey) pair.getPublic()).get("kid");
        String input = Jwt.signingInput(Jwt.header("ES256", kid),
                Jwt.payload("iss", "sub", "aud", 9999999999L, 1L, "admin"));
        String token = Jws.signEs256((java.security.interfaces.ECPrivateKey) pair.getPrivate(), input);

        assertEquals(64, signatureBytes(token).length, "ES256 (P-256) uses a 64-byte raw r||s signature");
        Signature v = Signature.getInstance("SHA256withECDSAinP1363Format");
        v.initVerify(pair.getPublic());
        v.update(signingInput(token).getBytes(StandardCharsets.US_ASCII));
        assertTrue(v.verify(signatureBytes(token)), "ES256 token must verify with the public key");
    }

    @Test
    void es256TokenIsSmallerThanRs256ForTheSameClaims() throws Exception {
        KeyPair rsa = KeyGen.rsa2048();
        KeyPair ec = KeyGen.ecP256();
        String payload = Jwt.payload("iss", "sub", "aud", 9999999999L, 1L, "admin");
        String rsToken = Jws.signRs256((java.security.interfaces.RSAPrivateKey) rsa.getPrivate(),
                Jwt.signingInput(Jwt.header("RS256", "k"), payload));
        String esToken = Jws.signEs256((java.security.interfaces.ECPrivateKey) ec.getPrivate(),
                Jwt.signingInput(Jwt.header("ES256", "k"), payload));
        assertTrue(esToken.length() < rsToken.length(),
                "ES256 token (64-byte sig) is smaller than RS256 (256-byte sig)");
    }
}
