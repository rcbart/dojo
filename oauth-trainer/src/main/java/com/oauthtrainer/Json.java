package com.oauthtrainer;

import java.util.Map;

/**
 * A tiny JSON writer for flat string maps — enough to pretty-print a JWK. We keep it in-house so
 * Phase 1 has zero dependencies. All JWK member values are strings (base64url or short tokens),
 * so we only need to serialize a {@code Map<String,String>}.
 */
public final class Json {

    /** Pretty-print an ordered string map as a 2-space-indented JSON object. */
    public static String pretty(Map<String, String> map) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        int i = 0, n = map.size();
        for (Map.Entry<String, String> e : map.entrySet()) {
            sb.append("  ").append(quote(e.getKey())).append(": ").append(quote(e.getValue()));
            if (++i < n) {
                sb.append(',');
            }
            sb.append('\n');
        }
        sb.append("}\n");
        return sb.toString();
    }

    /** JSON-escape and quote a string (handles the characters that can appear in JWK values). */
    static String quote(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 2);
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append('"');
        return sb.toString();
    }

    private Json() {}
}
