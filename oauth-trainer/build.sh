#!/usr/bin/env bash
# Build without Maven — Phase 1 has zero dependencies, so a JDK is all you need.
# (If you have Maven, `mvn package` also works and additionally runs the tests.)
set -euo pipefail
cd "$(dirname "$0")"

echo "Compiling..."
rm -rf out && mkdir -p out
javac -d out $(find src/main/java -name '*.java')

echo "Packaging oauth-trainer.jar..."
jar --create --file oauth-trainer.jar --main-class com.oauthtrainer.Main -C out .

echo "Done. Try:"
echo "  java -jar oauth-trainer.jar keygen --alg both"
