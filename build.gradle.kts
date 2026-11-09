plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.1.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.21" apply false
}

// Keep the root command convenient for a single-app project.
// The actual Android application remains in the :app module.
tasks.register("assembleDebug") {
    group = "build"
    description = "Assembles the debug APK from the app module."
    dependsOn(":app:assembleDebug")
}

tasks.register("assembleRelease") {
    group = "build"
    description = "Assembles the release APK from the app module."
    dependsOn(":app:assembleRelease")
}