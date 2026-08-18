# OAuth Trainer

A hands-on **command-line tool for learning the building blocks of OAuth 2.0 / OpenID Connect** —
built in Java, one phase at a time, on the plain JDK so nothing is hidden behind a library.

> **Phase 1 (this release): key generation.** Generate an **RSA-2048** or **EC P-256** signing key
> pair (or both) and export each as a **JSON Web Key (JWK)**, the format an OAuth Authorization
> Server publishes to sign tokens and that clients use to verify them.

---

## Why this exists

OAuth and OpenID Connect issue **JWTs** (JSON Web Tokens) that are **signed** so a receiver can
trust them. Signing needs a **key pair**:

- the **private key** signs tokens (kept secret by the Authorization Server), and
- the **public key** verifies them (published for everyone at a "JWKS" endpoint).

Those keys are shared in a standard JSON shape called a **JWK** (RFC 7517). Phase 1 is about
producing correct JWKs and understanding exactly what's inside them, because everything later
(signing, verifying, token validation) builds on these keys.

## What Phase 1 produces

For each key type it writes **two files**:

| File | Contents | Share it? |
|------|----------|-----------|
| `*.public.jwk.json`  | the public JWK (verification key) | ✅ safe to publish |
| `*.private.jwk.json` | the private JWK (full key, signing key) | ❌ keep secret |

RSA and EC are the two dominant JWT signing families:

- **RSA-2048** → JWS algorithm **RS256**. The classic default; larger keys/signatures.
- **EC P-256** → JWS algorithm **ES256**. Modern elliptic-curve keys, far smaller for the same
  security level.

## Build

**With a JDK only (no Maven needed: Phase 1 has zero dependencies):**

```bash
./build.sh
java -jar oauth-trainer.jar keygen --alg both
```

**With Maven (also runs the test suite):**

```bash
mvn package
java -jar target/oauth-trainer.jar keygen --alg both
```

Requires Java 11 or newer.

## Usage

```bash
oauth-trainer keygen [--alg RSA|EC|both] [--out <dir>]
```

| Option | Meaning | Default |
|--------|---------|---------|
| `--alg` | `RSA` (RSA-2048/RS256), `EC` (P-256/ES256), or `both` | `both` |
| `--out` | directory to write the JWK files into | `./keys` |

Examples:

```bash
java -jar oauth-trainer.jar keygen                    # both key types → ./keys
java -jar oauth-trainer.jar keygen --alg EC           # just EC P-256
java -jar oauth-trainer.jar keygen --alg RSA --out /tmp/mykeys
```

### Example output

```
Generating signing keys...

RSA-2048  (alg RS256, kid 9xN2...c1A)
  private → keys/rsa-2048.private.jwk.json
  public  → keys/rsa-2048.public.jwk.json

EC P-256  (alg ES256, kid Qb7...t0k)
  private → keys/ec-p256.private.jwk.json
  public  → keys/ec-p256.public.jwk.json

Files written to /…/keys:
  rsa-2048.private.jwk.json
  rsa-2048.public.jwk.json
  ec-p256.private.jwk.json
  ec-p256.public.jwk.json

⚠  The *.private.jwk.json files contain secret key material — never commit or share them.
```

A public EC JWK looks like:

```json
{
  "kid": "Qb7...t0k",
  "kty": "EC",
  "use": "sig",
  "alg": "ES256",
  "crv": "P-256",
  "x": "f83O...<base64url>",
  "y": "x_FE...<base64url>"
}
```

## What the JWK fields mean

| Field | Meaning |
|-------|---------|
| `kty` | **Key type**: `RSA` or `EC`. |
| `use` | **Use**, `sig` means this key is for signatures (vs `enc` for encryption). |
| `alg` | **Algorithm**, the JWS signing algorithm: `RS256` (RSA) or `ES256` (EC P-256). |
| `kid` | **Key ID**, a stable identifier so a verifier can pick the right key. Here it's the **RFC 7638 thumbprint**: a SHA-256 fingerprint of the key, so the same key always gets the same id. |
| `n`, `e` | **RSA** public key: the modulus (`n`) and public exponent (`e`, usually `AQAB` = 65537). |
| `d`, `p`, `q`, `dp`, `dq`, `qi` | **RSA** private parameters (only in the private JWK). |
| `crv` | **EC** curve name: `P-256`. |
| `x`, `y` | **EC** public point coordinates (32 bytes each for P-256). |
| `d` | **EC** private key scalar (only in the private JWK). |

All numeric fields are **base64url-encoded** big-endian integers, per RFC 7518 (JWA). The code in
[`JwkFactory.java`](src/main/java/com/oauthtrainer/JwkFactory.java) shows exactly how each is
produced from the raw key.

## Correctness

The JWK encoding was validated independently (the subtle part is the byte encoding, not the key
generation):

- **RSA** JWK members (`n, e, d, p, q, dp, dq, qi`) match the PyJWT reference library byte-for-byte,
  and a key rebuilt from the exported `n`/`e` verifies a real signature.
- **EC** coordinates/scalar round-trip through the `cryptography` reference: a public key rebuilt
  from `x`/`y` verifies a signature, and the private `d` reproduces the same public point.
- The **`kid`** algorithm reproduces the official **RFC 7638 §3.1 thumbprint test vector**
  (`NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs`).

The JUnit suite ([`JwkFactoryTest.java`](src/test/java/com/oauthtrainer/JwkFactoryTest.java))
encodes these as tests, including the RFC 7638 vector and sign/verify round-trips. Run it with
`mvn test`.

## Security notes

- **Never commit or share `*.private.jwk.json`.** They contain the full private key. The `.gitignore`
  already excludes `keys/` and `*.jwk.json`; on POSIX systems the private files are written `rw-------`
  (owner-only).
- Only the **public** JWK belongs at a JWKS endpoint.
- These keys are for **learning**. Production keys should come from a proper secrets manager / HSM and
  be rotated.

## Sign a JWT and compare RS256 vs ES256 (Phase 3)

```bash
java -jar oauth-trainer.jar sign            # average over 1000 signs
java -jar oauth-trainer.jar sign --iterations 5000
```

It builds one JWT (claims `iss`, `sub`, `aud`, `exp`, custom `role`), signs it with **RS256** and
**ES256**, and prints the trade-off:

```
RS256 (RSA-2048)
  token size : 560 chars
  signature  : 342 chars (256 bytes)
  sign time  : 1.8xx ms  (average)

ES256 (EC P-256)
  token size : 304 chars
  signature  : 86 chars (64 bytes)
  sign time  : 0.2xx ms  (average)

Summary:
  ES256 token is ~46% smaller (304 vs 560 chars) — a ~64-byte signature vs ~256 bytes.
  ES256 signed about Nx faster than RS256 here (…).
```

ES256 uses the JDK's `SHA256withECDSAinP1363Format` so the signature is the raw **r‖s** form JOSE
requires (the default `SHA256withECDSA` emits DER, which is *not* valid for a JWS). The token
construction is verified against the PyJWT reference library, and the JUnit tests
([`JwsTest.java`](src/test/java/com/oauthtrainer/JwsTest.java)) re-verify each signed token with the
matching public key.

## Roadmap

- **Phase 1: Key generation (done).** RSA-2048 / EC P-256 → public + private JWK files.
- **Phase 2: Build a JWT with custom claims (done).** The `sign` command constructs a token with
  `iss`, `sub`, `aud`, `exp`, and a custom `role` claim. The plain-English explanation of every
  claim is delivered as a lesson in the JavaDojo *OAuth, JWT & JOSE* module (`jose2`).
- **Phase 3: Sign the JWT, RS256 vs ES256 (done).** `sign` signs the same token with each
  algorithm and prints the **token size** and average **signing time** for each (see above).
- **Next: Verify & JWE.** A `verify` command (fetch a JWKS from a local well-known endpoint, select
  the JWK by `kid`, check signature + claims) and a `jwe` command (encrypt with RSA-OAEP + A256GCM)
  — both already taught, with runnable exercises, in the JavaDojo module.

## Project layout

```
oauth-trainer/
├── pom.xml                     # Maven build (app has no runtime deps; JUnit for tests)
├── build.sh                    # no-Maven build (javac + jar)
├── src/main/java/com/oauthtrainer/
│   ├── Main.java               # CLI entry point + command dispatch
│   ├── KeygenCommand.java      # the `keygen` command (flags, file output, summary)
│   ├── KeyGen.java             # RSA-2048 / EC P-256 key generation (JDK only)
│   ├── JwkFactory.java         # raw keys → JWK members (base64url, RFC 7638 kid)
│   └── Json.java               # tiny pretty-printer for the JWK JSON
└── src/test/java/com/oauthtrainer/
    └── JwkFactoryTest.java     # structure, encoding, RFC 7638 vector, sign/verify round-trips
```
