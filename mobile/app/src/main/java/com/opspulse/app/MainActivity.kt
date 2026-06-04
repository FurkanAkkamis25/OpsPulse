package com.opspulse.app

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.opspulse.app.ui.screen.DashboardScreen
import com.opspulse.app.ui.screen.LoginScreen
import com.opspulse.app.ui.screen.RegisterScreen
import com.opspulse.app.ui.theme.OpsPulseTheme
import com.opspulse.app.ui.viewmodel.AuthViewModel
import com.opspulse.app.util.TokenManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var tokenManager: TokenManager

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        createNotificationChannel()
        requestNotificationPermission()

        val hasToken = runBlocking { tokenManager.getToken() != null }
        val startDestination = if (hasToken) "dashboard" else "login"

        setContent {
            OpsPulseTheme {
                val navController = rememberNavController()

                NavHost(navController = navController, startDestination = startDestination) {
                    composable("login") {
                        val vm = hiltViewModel<AuthViewModel>()
                        LoginScreen(
                            onSuccess = { navController.navigate("dashboard") { popUpTo("login") { inclusive = true } } },
                            onRegisterClick = { navController.navigate("register") },
                            viewModel = vm,
                        )
                    }
                    composable("register") {
                        val vm = hiltViewModel<AuthViewModel>()
                        RegisterScreen(
                            onSuccess = { navController.navigate("dashboard") { popUpTo("register") { inclusive = true } } },
                            onLoginClick = { navController.popBackStack() },
                            viewModel = vm,
                        )
                    }
                    composable("dashboard") {
                        val authVm = hiltViewModel<AuthViewModel>()
                        DashboardScreen(
                            onLogout = {
                                authVm.logout()
                                navController.navigate("login") { popUpTo("dashboard") { inclusive = true } }
                            },
                        )
                    }
                }
            }
        }
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            "opspulse_alerts",
            "OpsPulse Uyarıları",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Sunucu çökme ve kurtarma uyarıları"
            enableVibration(true)
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}
