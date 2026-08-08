package com.oauthtrainer;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.spec.ECGenParameterSpec;

/**
 * Generates the two key types this trainer supports, using only the JDK's crypto provider.
 *
 * <ul>
 *   <li><b>RSA-2048</b> — a 2048-bit RSA key pair (the common default for JWT signing, alg RS256).</li>
 *   <li><b>EC P-256</b> — an elliptic-curve key pair on the NIST P-256 curve (alg ES256): much
 *       smaller keys and signatures than RSA for equivalent security.</li>
 * </ul>
 */
public final class KeyGen {

    private static final SecureRandom RANDOM = new SecureRandom();

    /** Generate a 2048-bit RSA key pair suitable for RS256 signing. */
    public static KeyPair rsa2048() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048, RANDOM);
            return generator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException("failed to generate RSA key: " + e.getMessage(), e);
        }
    }

    /** Generate an EC key pair on the P-256 curve (secp256r1 / prime256v1) for ES256 signing. */
    public static KeyPair ecP256() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
            generator.initialize(new ECGenParameterSpec("secp256r1"), RANDOM);
            return generator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException("failed to generate EC key: " + e.getMessage(), e);
        }
    }

    private KeyGen() {}
}
