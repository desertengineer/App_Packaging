plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.jetbrains.kotlin.android)
    // The native K2 Compose compiler plugin - much faster than the old kapt setup
    alias(libs.plugins.compose.compiler)
    // Kotlin Symbol Processing for ultra-fast Room Database generation
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.bekeirataapps.magicblitzblitz2026" // Update this to match your actual package name if different
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bekeirataapps.magicblitzblitz2026"
        // Target Android 12 minimum for modern graphics and safety standards
        minSdk = 31
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        // Tells KSP where to export the Room Database schemas (great for version control)
        ksp {
            arg("room.schemaLocation", "$projectDir/schemas")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                    getDefaultProguardFile("proguard-android-optimize.txt"),
                    "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    kotlinOptions {
        jvmTarget = "21"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Core AndroidX Lifecycle - Crucial for saving state when kids rotate the device
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose - Our Visual-First, Chunky UI Toolkit
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)

    // Room Database - Local, zero-data-collection offline storage for trivia
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // Debug tooling for Android Studio Quail3 Previews
    debugImplementation(libs.androidx.ui.tooling)
}