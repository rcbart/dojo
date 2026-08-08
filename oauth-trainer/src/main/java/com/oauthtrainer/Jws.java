package com.oauthtrainer;

import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.RSAPrivateKey;

/**
 * Signs a JWT's signing-input to produce a complete JWS compact token.
 *
 * <ul>
 *   <li><b>RS256</b> uses JCA {@code SHA256withRSA}; the RSA signature bytes are used as-is.</li>
 *   <li><b>ES256</b> uses {@code SHA256withECDSAinP1363Format} (JDK 9+), which emits the signature
 *       as the raw <b>r‖s</b> concatenation (64 bytes for P-256) — exactly the format JOSE requires.
 *       (The default {@code SHA256withECDSA} emits DER, which is <i>not</i> valid for JWS.)</li>
 * </ul>
 */
public final class Jws {

    /** Sign the input with RS256, returning the full {@code header.payload.signature} token. */
    static String signRs256(RSAPrivateKey key, String signingInput) throws Exception {
        return sign("SHA256withRSA", key, signingInput);
    }

    /** Sign the input with ES256 (raw r‖s signature), returning the full token. */
    static String signEs256(ECPrivateKey key, String signingInput) throws Exception {
        return sign("SHA256withECDSAinP1363Format", key, signingInput);
    }

    private static String sign(String jcaAlgorithm, PrivateKey key, String signingInput) throws Exception {
        Signature signer = Signature.getInstance(jcaAlgorithm);
        signer.initSign(key);
        signer.update(signingInput.getBytes(StandardCharsets.US_ASCII));
        byte[] signature = signer.sign();
        return signingInput + "." + Jwt.b64url(signature);
    }

    private Jws() {}
}
