#!/usr/bin/env bash
# One-command Android run: boots the emulator if needed, starts Metro if
# needed, builds + installs the debug APK, and launches the app. Safe to
# re-run — every step is skipped if already done.
set -e

cd "$(dirname "$0")/.."

ANDROID_HOME="${ANDROID_HOME:-$LOCALAPPDATA/Android/Sdk}"
JAVA_HOME="${JAVA_HOME:-/c/Program Files/Android/Android Studio/jbr}"
AVD_NAME="${AVD_NAME:-Pixel_7a}"
export ANDROID_HOME JAVA_HOME

ADB="$ANDROID_HOME/platform-tools/adb.exe"
EMULATOR="$ANDROID_HOME/emulator/emulator.exe"

if ! "$ADB" devices | grep -q "device$"; then
  echo "==> Booting emulator ($AVD_NAME)..."
  "$EMULATOR" -avd "$AVD_NAME" -no-snapshot-load > /tmp/veggie-emulator.log 2>&1 &
  disown
  "$ADB" wait-for-device
  until [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 3
  done
  echo "==> Emulator ready."
else
  echo "==> Emulator already running."
fi

if ! curl -s http://localhost:8081/status >/dev/null 2>&1; then
  echo "==> Starting Metro..."
  npx react-native start > /tmp/veggie-metro.log 2>&1 &
  disown
  sleep 3
else
  echo "==> Metro already running."
fi

echo "==> Building & installing debug APK..."
(cd android && JAVA_HOME="$JAVA_HOME" ./gradlew.bat installDebug)

"$ADB" reverse tcp:8081 tcp:8081
"$ADB" shell am start -n com.veggiedeliverytemp/.MainActivity
echo "==> App launched."
